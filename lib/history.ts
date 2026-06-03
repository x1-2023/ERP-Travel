import type { HistoryItem } from "@/types/pronunciation";

const key = "pronunciation-coach-history-v1";

export function readHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: HistoryItem): HistoryItem[] {
  const existing = readHistory();
  const next = [item, ...existing.filter((entry) => !(entry.word === item.word && entry.accent === item.accent))].slice(0, 30);
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(key);
}
