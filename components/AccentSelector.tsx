"use client";

import type { Accent } from "@/types/pronunciation";

type Props = {
  accent: Accent;
  onChange: (accent: Accent) => void;
};

export function AccentSelector({ accent, onChange }: Props) {
  return (
    <div className="grid h-10 grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1 text-sm">
      {(["us", "uk"] as const).map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`rounded-md px-4 font-semibold transition ${
            accent === item ? "bg-white text-graphite-950" : "text-slate-300 hover:text-white"
          }`}
          type="button"
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
