"use client";

type Props = {
  onPlay: () => void;
  slowMode: boolean;
  onSlowModeChange: (value: boolean) => void;
};

export function AudioControls({ onPlay, slowMode, onSlowModeChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onPlay}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-coach-amber px-4 text-sm font-bold text-graphite-950 transition hover:bg-amber-300"
      >
        <span aria-hidden>▶</span>
        Play
      </button>
      <label className="inline-flex h-11 cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={slowMode}
          onChange={(event) => onSlowModeChange(event.target.checked)}
          className="h-4 w-4 accent-coach-teal"
        />
        Slow
      </label>
    </div>
  );
}
