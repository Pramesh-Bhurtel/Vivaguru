import { useState, useEffect, useRef, useCallback } from 'react';

// Declaration for browser SpeechRecognition API
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

interface UseSpeechToTextOptions {
  onFinalTranscript?: (text: string) => void;
  lang?: string;
}

export function useSpeechToText({ onFinalTranscript, lang = 'en-US' }: UseSpeechToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const shouldListenRef = useRef<boolean>(false);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionConstructor();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0]?.transcript || '';
        if (item.isFinal) {
          currentFinal += text + ' ';
        } else {
          currentInterim += text;
        }
      }

      if (currentFinal) {
        onFinalTranscript?.(currentFinal.trim());
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: any) => {
      console.warn('[SpeechToText] Recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions in your browser.');
        stopListening();
      } else if (event.error === 'no-speech') {
        // Benign pause in candidate speech
      } else if (event.error !== 'aborted') {
        setError(`Speech recognition note: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Chrome stops recognition after periods of silence; auto-restart if candidate hasn't toggled off
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignore restart collisions
        }
      } else {
        setIsListening(false);
        setInterimTranscript('');
        cleanupAudio();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      try {
        recognition.abort();
      } catch {
        // Ignore abort errors
      }
      cleanupAudio();
    };
  }, [isSupported, lang, onFinalTranscript]);

  const cleanupAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAnalyserNode(null);
    setAudioLevel(0);
  };

  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);

      analyserRef.current = analyser;
      setAnalyserNode(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!shouldListenRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Normalize roughly between 0 and 100
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err: any) {
      console.warn('[AudioAnalyzer] Could not initialize Web Audio analyzer:', err.message);
    }
  };

  const startListening = useCallback(async () => {
    setError(null);
    if (!isSupported) {
      setError('Web Speech API is not supported in this browser. You can type your answer directly.');
      return;
    }

    try {
      // Cancel examiner TTS if it was playing so candidate does not talk over the examiner
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      shouldListenRef.current = true;
      setIsListening(true);
      recognitionRef.current?.start();
      await startAudioAnalyzer();
    } catch (err: any) {
      console.warn('[SpeechToText] Start error:', err.message);
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission was denied. Please allow microphone access in your browser.');
        shouldListenRef.current = false;
        setIsListening(false);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    setInterimTranscript('');
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors
    }
    cleanupAudio();
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    error,
    audioLevel,
    analyserNode,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null),
  };
}
