import type { MiniLessonKey } from "@/types/pronunciation";

export type MiniLesson = {
  key: MiniLessonKey;
  title: string;
  tips: string[];
  examples: string[];
};

export const miniLessonContent: Record<MiniLessonKey, MiniLesson> = {
  "SH/CH/J": {
    key: "SH/CH/J",
    title: "How to pronounce SH / CH / J",
    tips: ["Keep teeth close together.", "Push lips slightly forward.", "Let air pass smoothly."],
    examples: ["she", "ship", "patient", "information"],
  },
  "P/B/M": {
    key: "P/B/M",
    title: "Closed lips: P / B / M",
    tips: ["Close both lips first.", "Release air for P and B.", "Keep vibration through the nose for M."],
    examples: ["patient", "book", "mother", "problem"],
  },
  TH: {
    key: "TH",
    title: "Tongue between teeth: TH",
    tips: ["Place tongue lightly between teeth.", "Blow air gently.", "Do not replace it with T or S."],
    examples: ["mother", "father", "thank"],
  },
  R: {
    key: "R",
    title: "Rounded and tense R",
    tips: ["Round lips slightly.", "Keep tongue pulled back.", "Avoid adding a vowel before R."],
    examples: ["friend", "problem", "travel"],
  },
  "F/V": {
    key: "F/V",
    title: "Teeth touch lower lip: F / V",
    tips: ["Touch upper teeth to lower lip.", "Use air for F.", "Add voice vibration for V."],
    examples: ["food", "friend", "travel", "office"],
  },
  "T/D/N/L": {
    key: "T/D/N/L",
    title: "Tongue touches upper gum",
    tips: ["Put the tongue tip behind upper teeth.", "Release quickly for T and D.", "Hold contact for N and L."],
    examples: ["teacher", "listen", "minute", "language"],
  },
};

export function detectMiniLessons(phonemes: string[]): MiniLessonKey[] {
  const set = new Set(phonemes.map((phoneme) => phoneme.toUpperCase()));
  const lessons: MiniLessonKey[] = [];
  if (["SH", "CH", "JH"].some((p) => set.has(p))) lessons.push("SH/CH/J");
  if (["P", "B", "M"].some((p) => set.has(p))) lessons.push("P/B/M");
  if (["TH", "DH"].some((p) => set.has(p))) lessons.push("TH");
  if (set.has("R")) lessons.push("R");
  if (["F", "V"].some((p) => set.has(p))) lessons.push("F/V");
  if (["T", "D", "N", "L"].some((p) => set.has(p))) lessons.push("T/D/N/L");
  return lessons.slice(0, 3);
}
