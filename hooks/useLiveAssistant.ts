import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { base64ToUint8Array, decodeAudioData, createPcmBlob } from '../utils/audioUtils';

interface UseLiveAssistantProps {
  apiKey: string;
  systemInstruction?: string;
}

export const useLiveAssistant = ({ apiKey, systemInstruction }: UseLiveAssistantProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [volume, setVolume] = useState(0); // For visualizer
  const [error, setError] = useState<string | null>(null);

  // Refs for Audio Contexts and State
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null); // Holds the LiveSession object
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const ai = new GoogleGenAI({ apiKey });

  // Initialize Audio Contexts
  const initAudioContexts = () => {
    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    // Resume if suspended (browser autoplay policy)
    if (inputAudioContextRef.current.state === 'suspended') inputAudioContextRef.current.resume();
    if (outputAudioContextRef.current.state === 'suspended') outputAudioContextRef.current.resume();
  };

  const connect = useCallback(async () => {
    setError(null);
    try {
      initAudioContexts();
      
      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
        callbacks: {
          onopen: async () => {
            console.log('Gemini Live Connection Opened');
            setIsConnected(true);
            
            // Setup Input Processing (Mic -> Model)
            if (inputAudioContextRef.current) {
               const ctx = inputAudioContextRef.current;
               const source = ctx.createMediaStreamSource(stream);
               const processor = ctx.createScriptProcessor(4096, 1, 1);
               
               // Setup Analyzer for visualizer (Input volume)
               const analyzer = ctx.createAnalyser();
               analyzer.fftSize = 256;
               source.connect(analyzer);
               analyzerRef.current = analyzer;

               processor.onaudioprocess = (e) => {
                 const inputData = e.inputBuffer.getChannelData(0);
                 const pcmBlob = createPcmBlob(inputData);
                 
                 // Send to Gemini
                 sessionPromise.then((session) => {
                   session.sendRealtimeInput({ media: pcmBlob });
                 });
               };

               source.connect(processor);
               processor.connect(ctx.destination);
               
               inputSourceRef.current = source;
               processorRef.current = processor;
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output (Model -> Speaker)
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              
              // Ensure nextStartTime is valid
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              audioQueueRef.current.push(source);
              
              source.onended = () => {
                 // Simple check to see if we are done speaking roughly
                 if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                    setIsSpeaking(false);
                 }
                 const index = audioQueueRef.current.indexOf(source);
                 if (index > -1) audioQueueRef.current.splice(index, 1);
              };
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              console.log('Interrupted');
              audioQueueRef.current.forEach(src => {
                  try { src.stop(); } catch(e) {}
              });
              audioQueueRef.current = [];
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log('Gemini Live Connection Closed');
            setIsConnected(false);
            setIsSpeaking(false);
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setError(err.message || "The service is currently unavailable.");
            setIsConnected(false);
          }
        }
      });

      sessionRef.current = sessionPromise;

      // Start Visualizer Loop
      const updateVolume = () => {
        if (analyzerRef.current) {
            const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
            analyzerRef.current.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setVolume(avg);
        }
        volumeIntervalRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to microphone or API");
      setIsConnected(false);
    }
  }, [apiKey, systemInstruction]);

  const disconnect = useCallback(async () => {
    // 1. Close Session
    if (sessionRef.current) {
        // There isn't a direct .close() on the promise wrapper in the SDK typically, 
        // but we stop sending data by disconnecting the script processor.
        // If the SDK supported explicit close on the wrapper, we'd call it.
        // For now, we clean up the audio nodes which effectively stops the session interaction.
    }

    // 2. Stop Microphone Stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    // 3. Disconnect Audio Nodes
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
    }
    
    // 4. Clear Audio Queue
    audioQueueRef.current.forEach(src => {
        try { src.stop(); } catch(e) {}
    });
    audioQueueRef.current = [];
    nextStartTimeRef.current = 0;

    // 5. Cleanup Animation Frame
    if (volumeIntervalRef.current) {
        cancelAnimationFrame(volumeIntervalRef.current);
    }

    setIsConnected(false);
    setIsSpeaking(false);
    setVolume(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        disconnect();
        if (inputAudioContextRef.current) inputAudioContextRef.current.close();
        if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isSpeaking,
    volume,
    error
  };
};