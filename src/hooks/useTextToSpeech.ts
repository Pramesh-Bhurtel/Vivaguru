import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const {
    rate = 0.95, // Slightly measured, authoritative academic cadence
    pitch = 1.0,
    volume = 1.0,
    lang = 'en-US',
    onStart,
    onEnd,
    onError,
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentText, setCurrentText] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load and prioritize clear academic voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (voices.length > 0) {
        // Look for high-clarity natural voices
        const preferred =
          voices.find(
            (v) =>
              (v.lang.startsWith('en') &&
                (v.name.includes('Natural') ||
                  v.name.includes('Google') ||
                  v.name.includes('Samantha') ||
                  v.name.includes('Daniel') ||
                  v.name.includes('Karen') ||
                  v.name.includes('Oliver')))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        setSelectedVoice(preferred || null);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (isSupported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying) return;
    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch {
      // ignore
    }
  }, [isSupported, isPlaying]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch {
      // ignore
    }
  }, [isSupported, isPaused]);

  const speak = useCallback(
    (textToSpeak: string) => {
      if (!isSupported || !textToSpeak.trim()) return;

      stop(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      utterance.lang = lang;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentText(textToSpeak);
        onStart?.();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        onEnd?.();
      };

      utterance.onerror = (e) => {
        // Interrupted is not a fatal error (occurs when user clicks stop/skip)
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('[useTextToSpeech] speech error:', e.error);
          onError?.(e);
        }
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[useTextToSpeech] Exception calling speak:', err);
        setIsPlaying(false);
      }
    },
    [isSupported, rate, pitch, volume, lang, selectedVoice, stop, onStart, onEnd, onError]
  );

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentText,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    speak,
    pause,
    resume,
    stop,
  };
}
