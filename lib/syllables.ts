const vowelGroup = /[aeiouy]+/gi;

export function splitApproximateSyllables(rawWord: string): string[] {
  const word = rawWord.trim().toLowerCase();
  if (!word) return [];
  const matches = [...word.matchAll(vowelGroup)];
  if (matches.length <= 1) return [word];

  const syllables: string[] = [];
  let start = 0;
  for (let i = 0; i < matches.length - 1; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const currentEnd = current.index + current[0].length;
    const nextStart = next.index;
    const consonants = word.slice(currentEnd, nextStart);
    const splitAt = consonants.length <= 1 ? currentEnd : currentEnd + 1;
    syllables.push(word.slice(start, splitAt));
    start = splitAt;
  }
  syllables.push(word.slice(start));
  return syllables.filter(Boolean);
}

export function roughSoundsLike(word: string): string {
  const syllables = splitApproximateSyllables(word);
  return syllables.length > 0 ? `${syllables.join("-")} (approx.)` : "approximate unavailable";
}
