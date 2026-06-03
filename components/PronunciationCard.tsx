"use client";

import { AccentSelector } from "@/components/AccentSelector";
import { AudioControls } from "@/components/AudioControls";
import { MicPractice } from "@/components/MicPractice";
import { MiniLesson } from "@/components/MiniLesson";
import { MouthAnimator } from "@/components/MouthAnimator";
import { SyllableView } from "@/components/SyllableView";
import { VietnameseMeaning } from "@/components/VietnameseMeaning";
import { speakWord } from "@/lib/speech";
import type { Accent, PronunciationResult } from "@/types/pronunciation";
import { useEffect, useState } from "react";

type Props = {
  result: PronunciationResult;
  accent: Accent;
  slowMode: boolean;
  onAccentChange: (accent: Accent) => void;
  onSlowModeChange: (value: boolean) => void;
  onScore: (score: number) => void;
};

export function PronunciationCard({ result, accent, slowMode, onAccentChange, onSlowModeChange, onScore }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlay() {
    setIsPlaying(true);
    speakWord(result.word, accent, slowMode);
  }

  useEffect(() => {
    if (!isPlaying) return;
    const timeout = window.setTimeout(() => setIsPlaying(false), Math.max(1300, result.visemes.length * (slowMode ? 620 : 360)));
    return () => window.clearTimeout(timeout);
  }, [isPlaying, result.visemes.length, slowMode]);

  return (
    <article className="rounded-lg border border-white/10 bg-graphite-850/95 p-5 shadow-soft md:p-7">
      <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-bold text-white md:text-5xl">{result.word || "word"}</h1>
            {result.level ? <span className="rounded-md bg-coach-teal/15 px-2 py-1 text-xs font-bold text-coach-teal">{result.level}</span> : null}
            {result.isApproximate ? <span className="rounded-md bg-coach-amber/15 px-2 py-1 text-xs font-bold text-coach-amber">approximate</span> : null}
          </div>
          <p className="mt-2 text-lg text-slate-300">{result.soundsLike}</p>
        </div>
        <AccentSelector accent={accent} onChange={onAccentChange} />
      </header>

      <div className="grid gap-6 pt-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <VietnameseMeaning vi={result.vi} />
          <div className="grid gap-4 rounded-lg border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">IPA</h2>
              <p className="mt-3 text-lg font-semibold text-white">{result.ipa ?? "IPA unavailable"}</p>
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Sounds like</h2>
              <p className="mt-3 text-lg font-semibold text-white">{result.soundsLike}</p>
            </div>
          </div>
          <SyllableView syllables={result.syllables} stressIndex={result.stressIndex} isApproximate={result.isApproximate} />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Phonemes</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.phonemes.length > 0 ? (
                result.phonemes.map((phoneme, index) => (
                  <span key={`${phoneme}-${index}`} className="rounded-md bg-white/[0.06] px-2.5 py-1 text-sm font-semibold text-slate-200">
                    {phoneme}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">Phoneme data unavailable.</span>
              )}
            </div>
          </div>
          <AudioControls onPlay={handlePlay} slowMode={slowMode} onSlowModeChange={onSlowModeChange} />
        </div>
        <MouthAnimator phonemes={result.phonemes} visemes={result.visemes} isPlaying={isPlaying} slowMode={slowMode} />
      </div>

      <div className="mt-6 space-y-4">
        <MicPractice word={result.word} accent={accent} onScore={onScore} />
        <MiniLesson lessons={result.miniLessons} />
      </div>
    </article>
  );
}
