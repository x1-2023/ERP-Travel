export type Accent = "us" | "uk";
export type WordLevel = "A1" | "A2";

export type VietnameseMeaning = {
  partOfSpeech: string;
  meaning: string;
};

export type AccentPronunciation = {
  ipa: string;
  soundsLike: string;
  phonemes: string[];
  syllables: string[];
  stressIndex: number;
};

export type PronunciationEntry = {
  level: WordLevel;
  vi: VietnameseMeaning[];
  us: AccentPronunciation;
  uk: AccentPronunciation;
};

export type MiniLessonKey = "SH/CH/J" | "P/B/M" | "TH" | "R" | "F/V" | "T/D/N/L";

export type PronunciationResult = {
  word: string;
  accent: Accent;
  vi: VietnameseMeaning[];
  ipa: string | null;
  soundsLike: string;
  phonemes: string[];
  visemes: string[];
  syllables: string[];
  stressIndex: number | null;
  level: WordLevel | null;
  isApproximate: boolean;
  miniLessons: MiniLessonKey[];
};

export type HistoryItem = {
  word: string;
  accent: Accent;
  ipa: string | null;
  soundsLike: string;
  vi: VietnameseMeaning[];
  timestamp: number;
  score?: number;
};

export type MicScore = {
  label: "Matched" | "Close" | "Try again";
  score: number;
  recognizedText: string;
  feedback: string;
};
