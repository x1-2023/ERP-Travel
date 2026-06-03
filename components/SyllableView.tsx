type Props = {
  syllables: string[];
  stressIndex: number | null;
  isApproximate: boolean;
};

export function SyllableView({ syllables, stressIndex, isApproximate }: Props) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Syllables</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {syllables.map((syllable, index) => (
          <span
            key={`${syllable}-${index}`}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              stressIndex === index ? "bg-coach-amber text-graphite-950" : "bg-white/[0.06] text-slate-100"
            }`}
          >
            {syllable}
          </span>
        ))}
        {isApproximate ? <span className="text-xs text-coach-amber">approximate</span> : null}
      </div>
    </div>
  );
}
