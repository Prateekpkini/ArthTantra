"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: "",
    error: null,
    isSupported: typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window),
  });

  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState((s) => ({ ...s, isSupported: false }));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setState((s) => ({ ...s, transcript }));
    };

    recognition.onerror = (event: any) => {
      setState((s) => ({
        ...s,
        error: `Speech recognition error: ${event.error}`,
        isListening: false,
      }));
    };

    recognition.onend = () => {
      setState((s) => ({ ...s, isListening: false }));
    };

    recognitionRef.current = recognition;
    setState((s) => ({ ...s, isSupported: true }));
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      setState((s) => ({ ...s, isListening: true, transcript: "", error: null }));
      recognitionRef.current.start();
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setState((s) => ({ ...s, isListening: false }));
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
  };
}
