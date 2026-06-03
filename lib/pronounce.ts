import { detectMiniLessons } from "@/lib/mini-lessons";
import { phonemesToVisemes } from "@/lib/phoneme-to-viseme";
import { pronunciationData } from "@/lib/pronunciation-data";
import { roughSoundsLike, splitApproximateSyllables } from "@/lib/syllables";
import type { Accent, PronunciationResult } from "@/types/pronunciation";

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase().replace(/[^a-z'-]/g, "");
}

export function getPronunciation(word: string, accent: Accent): PronunciationResult {
  const normalized = normalizeWord(word);
  const entry = pronunciationData[normalized];
  if (!entry) {
    return {
      word: normalized || word,
      accent,
      vi: [],
      ipa: null,
      soundsLike: roughSoundsLike(normalized),
      phonemes: [],
      visemes: ["neutral"],
      syllables: splitApproximateSyllables(normalized),
      stressIndex: null,
      level: null,
      isApproximate: true,
      miniLessons: [],
    };
  }

  const pronunciation = entry[accent];
  return {
    word: normalized,
    accent,
    vi: entry.vi,
    ipa: pronunciation.ipa,
    soundsLike: pronunciation.soundsLike,
    phonemes: pronunciation.phonemes,
    visemes: phonemesToVisemes(pronunciation.phonemes),
    syllables: pronunciation.syllables,
    stressIndex: pronunciation.stressIndex,
    level: entry.level,
    isApproximate: false,
    miniLessons: detectMiniLessons(pronunciation.phonemes),
  };
}
