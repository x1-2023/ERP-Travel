import type { Accent } from "@/types/pronunciation";

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognitionResultItem = {
  transcript: string;
};

type SpeechRecognitionAlternativeList = {
  0: SpeechRecognitionResultItem;
};

type SpeechRecognitionEventLike = {
  results: {
    0: SpeechRecognitionAlternativeList;
  };
};

type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function recognizeSpeech(accent: Accent): Promise<string> {
  return new Promise((resolve, reject) => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      reject(new Error("Speech recognition is not supported."));
      return;
    }
    const recognition = new Recognition();
    recognition.lang = accent === "us" ? "en-US" : "en-GB";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => resolve(event.results[0][0].transcript);
    recognition.onerror = () => reject(new Error("Speech recognition failed."));
    recognition.onend = () => undefined;
    recognition.start();
  });
}
