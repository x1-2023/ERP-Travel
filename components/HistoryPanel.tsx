"use client";

import type { HistoryItem } from "@/types/pronunciation";

type Props = {
  items: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
};

export function HistoryPanel({ items, onLoad, onClear }: Props) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">History</h2>
        <button type="button" onClick={onClear} className="text-xs font-semibold text-slate-400 hover:text-white">
          Clear
        </button>
      </div>
      <div className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
        {items.length === 0 ? <p className="text-sm text-slate-500">No saved words yet.</p> : null}
        {items.map((item) => (
          <button
            type="button"
            key={`${item.word}-${item.accent}-${item.timestamp}`}
            onClick={() => onLoad(item)}
            className="grid w-full grid-cols-[1fr_auto] gap-2 rounded-lg bg-black/20 p-3 text-left transition hover:bg-white/[0.07]"
          >
            <span>
              <span className="block font-semibold text-white">{item.word}</span>
              <span className="block text-xs text-slate-500">{item.ipa ?? "IPA unavailable"}</span>
            </span>
            <span className="text-right text-xs text-slate-400">
              {item.accent.toUpperCase()}
              {typeof item.score === "number" ? <span className="block text-coach-teal">{item.score}</span> : null}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
