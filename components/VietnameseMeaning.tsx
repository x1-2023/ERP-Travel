import type { VietnameseMeaning as Meaning } from "@/types/pronunciation";

type Props = {
  vi: Meaning[];
};

export function VietnameseMeaning({ vi }: Props) {
  return (
    <section>
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Vietnamese meaning</h2>
      {vi.length > 0 ? (
        <div className="mt-3 space-y-2">
          {vi.map((item) => (
            <div key={`${item.partOfSpeech}-${item.meaning}`} className="flex gap-3 text-sm">
              <span className="w-24 shrink-0 text-slate-400">{item.partOfSpeech}</span>
              <span className="text-slate-100">{item.meaning}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-400">Vietnamese meaning unavailable.</p>
      )}
    </section>
  );
}
