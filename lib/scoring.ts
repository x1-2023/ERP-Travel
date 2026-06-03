import type { MicScore } from "@/types/pronunciation";

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[a.length][b.length];
}

export function scoreSpeech(targetWord: string, recognizedText: string): MicScore {
  const target = targetWord.toLowerCase().trim();
  const recognized = recognizedText.toLowerCase().trim();
  if (!recognized) {
    return { label: "Try again", score: 0, recognizedText, feedback: "No speech was recognized." };
  }
  if (recognized === target) {
    return { label: "Matched", score: 100, recognizedText, feedback: "Exact text match from speech recognition." };
  }
  if (recognized.split(/\s+/).includes(target) || recognized.includes(target)) {
    return { label: "Close", score: 80, recognizedText, feedback: "The target word appeared in the recognized text." };
  }

  const distance = levenshtein(target, recognized);
  const similarity = 1 - distance / Math.max(target.length, recognized.length, 1);
  const score = Math.max(0, Math.round(similarity * 100));
  return {
    label: score >= 60 ? "Close" : "Try again",
    score,
    recognizedText,
    feedback:
      score >= 60
        ? "The recognized text is similar, but not an exact match."
        : "The speech recognition result was different from the target word.",
  };
}
