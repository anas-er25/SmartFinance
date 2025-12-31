import { useState, useEffect, useCallback, useRef } from 'react';

export const useSpeechRecognition = (languageCode: string = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore - Vendor prefixes
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = languageCode;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [languageCode]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      try {
        // Ensure lang is up to date just in case, though useEffect handles recreation
        recognitionRef.current.lang = languageCode; 
        recognitionRef.current.start();
      } catch (e) {
        console.error("Speech recognition start failed", e);
      }
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  }, [languageCode]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, transcript, startListening, stopListening, setTranscript };
};
