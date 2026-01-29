import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'scale-up' | 'zoom-in' | 'slide-in-right' | 'slide-in-left';
  delay?: number; // in ms
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  animation = 'fade-in-up', 
  delay = 0,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can stop observing to keep it visible
          if (domRef.current) observer.unobserve(domRef.current);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0 translate-y-8'; // Initial hidden state
    
    switch (animation) {
      case 'fade-in-up': return 'animate-fade-in-up';
      case 'fade-in-left': return 'animate-fade-in-left';
      case 'fade-in-right': return 'animate-fade-in-right';
      case 'scale-up': return 'animate-scale-up';
      case 'zoom-in': return 'animate-zoom-in';
      case 'slide-in-right': return 'animate-slide-in-right';
      case 'slide-in-left': return 'animate-slide-in-left';
      default: return 'animate-fade-in-up';
    }
  };

  return (
    <div 
      ref={domRef}
      className={`${className} transition-all duration-1000 ${getAnimationClass()}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};