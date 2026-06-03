import { pronunciationData } from "@/lib/pronunciation-data";
import type { VietnameseMeaning } from "@/types/pronunciation";

export function getVietnameseMeaning(word: string): VietnameseMeaning[] {
  return pronunciationData[word.toLowerCase()]?.vi ?? [];
}
