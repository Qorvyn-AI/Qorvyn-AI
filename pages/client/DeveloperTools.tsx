import React, { useState } from 'react';
import { Terminal, Copy, CheckCircle, Code } from 'lucide-react';

const PYTHON_SCRIPT = `import requests

def get_brevo_contacts():
    # --- CONFIGURATION ---
    # Replace the string below with your actual Brevo v3 API Key
    API_KEY = "YOUR_BREVO_API_KEY_HERE"
    
    # Brevo API Endpoint for contacts
    url = "https://api.brevo.com/v3/contacts"

    # Headers required for authentication
    headers = {
        "accept": "application/json",
        "api-key": API_KEY
    }

    # Parameters to control the amount of data retrieved
    params = {
        "limit": 50,
        "offset": 0
    }

    try:
        # Make the GET request
        response = requests.get(url, headers=headers, params=params)

        # Check if the request was successful (Status Code 200)
        if response.status_code == 200:
            data = response.json()
            
            # The API returns a dictionary with a key 'contacts' containing a list
            contacts = data.get("contacts", [])

            if not contacts:
                print("No contacts found.")
            else:
                print(f"Successfully retrieved {len(contacts)} contacts:\\n")
                for contact in contacts:
                    # Safely get the email and print it
                    email = contact.get("email")
                    if email:
                        print(email)
        else:
            print(f"Failed to retrieve contacts. Status Code: {response.status_code}")
            print(f"Error Message: {response.text}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_brevo_contacts()`;

export const DeveloperTools = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Terminal className="text-primary" />
            Developer Tools
        </h2>
        <p className="text-gray-500 mt-2">
            Resources for developers to integrate directly with external providers like Brevo.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Code size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Fetch Contacts Script</h3>
                    <p className="text-sm text-gray-500">Python 3 • requests library required</p>
                </div>
            </div>
            <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Code'}
            </button>
        </div>

        <div className="p-0 bg-slate-900 overflow-x-auto">
            <pre className="p-6 text-sm font-mono text-slate-300 leading-relaxed">
                <code>{PYTHON_SCRIPT}</code>
            </pre>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Instructions</h4>
            <ol className="list-decimal pl-4 space-y-2 text-sm text-gray-600">
                <li>Ensure you have Python installed on your machine.</li>
                <li>Install the requests library: <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">pip install requests</code></li>
                <li>Replace <code className="bg-gray-200 px-1 py-0.5 rounded text-gray-800">YOUR_BREVO_API_KEY_HERE</code> with your valid Brevo v3 API Key.</li>
                <li>Run the script to see your contact list in the console.</li>
            </ol>
        </div>
      </div>
    </div>
  );
};