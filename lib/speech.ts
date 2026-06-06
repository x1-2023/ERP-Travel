import type { Accent } from "@/types/pronunciation";

type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

export type SpeechPlayback = {
  cancel: () => void;
};

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakWord(word: string, accent: Accent, slowMode: boolean, options: SpeakOptions = {}): SpeechPlayback | null {
  if (!canSpeak()) {
    options.onError?.();
    return null;
  }

  let stopped = false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = accent === "us" ? "en-US" : "en-GB";
  utterance.rate = slowMode ? 0.6 : 0.95;
  const voice = window.speechSynthesis
    .getVoices()
    .find((candidate) => candidate.lang.toLowerCase().startsWith(utterance.lang.toLowerCase()));
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    if (!stopped) options.onStart?.();
  };
  utterance.onend = () => {
    if (!stopped) options.onEnd?.();
  };
  utterance.onerror = () => {
    if (!stopped) options.onError?.();
  };

  window.speechSynthesis.speak(utterance);

  return {
    cancel: () => {
      stopped = true;
      window.speechSynthesis.cancel();
    },
  };
}
