/**
 * Voice Control Component
 * Ported from DLX-Ultra - Provides voice command interface
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

interface VoiceControlProps {
  onCommand: (command: string) => void;
  onStatusUpdate?: (message: string, type: 'info' | 'error' | 'success') => void;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand, onStatusUpdate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onStatusUpdate?.('Voice recognition is not supported by your browser.', 'error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(interimTranscript);
      if (finalTranscript) {
        onCommand(finalTranscript.trim());
        setTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        onStatusUpdate?.('Microphone access denied.', 'error');
      } else {
        onStatusUpdate?.(`Voice recognition error: ${event.error}`, 'error');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
  }, [onCommand, onStatusUpdate]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        onStatusUpdate?.('Listening...', 'info');
      } catch (e) {
        onStatusUpdate?.('Voice recognition could not be started.', 'error');
        setIsListening(false);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-4">
      {transcript && (
        <div className="text-cyan-200 bg-slate-900/90 backdrop-blur p-3 rounded-lg border border-cyan-500/30 shadow-lg">
          {transcript}
        </div>
      )}
      <button
        onClick={toggleListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening
            ? 'bg-red-500/80 text-white animate-pulse shadow-2xl shadow-red-500/50'
            : 'bg-cyan-500/80 text-white hover:bg-cyan-400/80 shadow-lg hover:shadow-xl'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
        title={isListening ? 'Stop listening' : 'Start voice control'}
      >
        <Mic className="w-6 h-6" />
      </button>
    </div>
  );
};

export default VoiceControl;

