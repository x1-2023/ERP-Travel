"use client";

import { AccentSelector } from "@/components/AccentSelector";
import { AudioControls } from "@/components/AudioControls";
import { MicPractice } from "@/components/MicPractice";
import { MiniLesson } from "@/components/MiniLesson";
import { MouthAnimator } from "@/components/MouthAnimator";
import { SyllableView } from "@/components/SyllableView";
import { VietnameseMeaning } from "@/components/VietnameseMeaning";
import { playWithWawaLipsync, type LipsyncPlayback } from "@/lib/lipsync";
import { speakWord, type SpeechPlayback } from "@/lib/speech";
import type { Accent, PronunciationResult } from "@/types/pronunciation";
import { useEffect, useRef, useState } from "react";

type Props = {
  result: PronunciationResult;
  accent: Accent;
  slowMode: boolean;
  onAccentChange: (accent: Accent) => void;
  onSlowModeChange: (value: boolean) => void;
  onScore: (score: number) => void;
};

export function PronunciationCard({ result, accent, slowMode, onAccentChange, onSlowModeChange, onScore }: Props) {
  const pronunciationKey = `${result.word}:${accent}:${slowMode ? "slow" : "normal"}`;
  const [playbackState, setPlaybackState] = useState<{ key: string | null; isPlaying: boolean }>({ key: null, isPlaying: false });
  const [activeViseme, setActiveViseme] = useState<string | null>(null);
  const [playbackSource, setPlaybackSource] = useState<"dictionary" | "wawa">("dictionary");
  const playbackRef = useRef<LipsyncPlayback | null>(null);
  const speechRef = useRef<SpeechPlayback | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const playRequestRef = useRef(0);
  const isPlaybackActive = playbackState.key === pronunciationKey && playbackState.isPlaying;

  function clearFallbackTimer() {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }

  function stopExternalPlayback() {
    playRequestRef.current += 1;
    clearFallbackTimer();
    playbackRef.current?.stop();
    playbackRef.current = null;
    speechRef.current?.cancel();
    speechRef.current = null;
  }

  function stopCurrentPlayback() {
    stopExternalPlayback();
    setActiveViseme(null);
    setPlaybackState({ key: null, isPlaying: false });
  }

  function startDictionaryPlayback() {
    const requestId = playRequestRef.current;

    setPlaybackSource("dictionary");
    speechRef.current = speakWord(result.word, accent, slowMode, {
      onStart: () => {
        if (requestId !== playRequestRef.current) return;
        setPlaybackState({ key: pronunciationKey, isPlaying: true });
        fallbackTimerRef.current = window.setTimeout(() => {
          setPlaybackState((current) => (current.key === pronunciationKey ? { key: null, isPlaying: false } : current));
          setActiveViseme(null);
          fallbackTimerRef.current = null;
        }, Math.max(1800, result.visemes.length * (slowMode ? 760 : 460)));
      },
      onEnd: () => {
        if (requestId !== playRequestRef.current) return;
        clearFallbackTimer();
        speechRef.current = null;
        setActiveViseme(null);
        setPlaybackState((current) => (current.key === pronunciationKey ? { key: null, isPlaying: false } : current));
      },
      onError: () => {
        if (requestId !== playRequestRef.current) return;
        clearFallbackTimer();
        speechRef.current = null;
        setActiveViseme(null);
        setPlaybackState({ key: null, isPlaying: false });
      },
    });
  }

  async function handlePlay() {
    stopCurrentPlayback();
    setPlaybackSource("wawa");
    const requestId = playRequestRef.current;

    const playback = await playWithWawaLipsync({
      word: result.word,
      accent,
      slowMode,
      onViseme: (viseme) => {
        if (requestId === playRequestRef.current) setActiveViseme(viseme);
      },
      onEnded: () => {
        if (requestId !== playRequestRef.current) return;
        playbackRef.current = null;
        setPlaybackState((current) => (current.key === pronunciationKey ? { key: null, isPlaying: false } : current));
      },
      onError: () => {
        if (requestId !== playRequestRef.current) return;
        playbackRef.current = null;
        startDictionaryPlayback();
      },
    });

    if (requestId !== playRequestRef.current) {
      if (playback.mode === "wawa") playback.stop();
      return;
    }

    if (playback.mode === "wawa") {
      playbackRef.current = playback;
      setPlaybackState({ key: pronunciationKey, isPlaying: true });
      return;
    }

    startDictionaryPlayback();
  }

  useEffect(() => {
    return stopExternalPlayback;
    // Playback must reset when the selected pronunciation changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.word, accent, slowMode]);

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
        <MouthAnimator
          phonemes={result.phonemes}
          visemes={result.visemes}
          isPlaying={isPlaybackActive}
          slowMode={slowMode}
          activeViseme={isPlaybackActive ? activeViseme : null}
          source={isPlaybackActive ? playbackSource : "dictionary"}
        />
      </div>

      <div className="mt-6 space-y-4">
        <MicPractice word={result.word} accent={accent} onScore={onScore} />
        <MiniLesson lessons={result.miniLessons} />
      </div>
    </article>
  );
}
