"use client";

import { HistoryPanel } from "@/components/HistoryPanel";
import { PronunciationCard } from "@/components/PronunciationCard";
import { SearchBox } from "@/components/SearchBox";
import { readHistory, saveHistoryItem, clearHistory } from "@/lib/history";
import { getPronunciation } from "@/lib/pronounce";
import type { Accent, HistoryItem, PronunciationResult } from "@/types/pronunciation";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

async function fetchPronunciation(word: string, accent: Accent): Promise<PronunciationResult> {
  const response = await fetch(`/api/pronounce?word=${encodeURIComponent(word)}&accent=${accent}`);
  if (!response.ok) throw new Error("Could not load pronunciation data.");
  return response.json() as Promise<PronunciationResult>;
}

export default function HomePage() {
  const [accent, setAccent] = useState<Accent>("us");
  const [slowMode, setSlowMode] = useState(false);
  const [result, setResult] = useState<PronunciationResult>(() => getPronunciation("patient", "us"));
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadWord = useCallback(async (word: string, nextAccent: Accent) => {
    setIsLoading(true);
    setError("");
    try {
      const next = await fetchPronunciation(word, nextAccent);
      setResult(next);
      setHistory(
        saveHistoryItem({
          word: next.word,
          accent: next.accent,
          ipa: next.ipa,
          soundsLike: next.soundsLike,
          vi: next.vi,
          timestamp: Date.now(),
        }),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHistory(readHistory()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function handleAccentChange(nextAccent: Accent) {
    setAccent(nextAccent);
    void loadWord(result.word, nextAccent);
  }

  function handleHistoryLoad(item: HistoryItem) {
    setAccent(item.accent);
    void loadWord(item.word, item.accent);
  }

  function handleScore(score: number) {
    setHistory(
      saveHistoryItem({
        word: result.word,
        accent: result.accent,
        ipa: result.ipa,
        soundsLike: result.soundsLike,
        vi: result.vi,
        score,
        timestamp: Date.now(),
      }),
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-[1500px]">
        <nav className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-white">
            Pronunciation Coach
          </Link>
          <Link href="/practice" className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 hover:text-white">
            Practice
          </Link>
        </nav>

        <section className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white md:text-6xl">Pronunciation Coach</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
            Search an English word, hear US or UK pronunciation, review IPA, Vietnamese meaning, syllables, mouth shape, and practice with your microphone.
          </p>
        </section>

        <SearchBox onSearch={(word) => loadWord(word, accent)} />
        {error ? <p className="mx-auto mt-4 max-w-3xl text-sm text-coach-amber">{error}</p> : null}
        {isLoading ? <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-400">Loading pronunciation data...</p> : null}

        <div className="mt-8 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            {result ? (
              <PronunciationCard
                result={result}
                accent={accent}
                slowMode={slowMode}
                onAccentChange={handleAccentChange}
                onSlowModeChange={setSlowMode}
                onScore={handleScore}
              />
            ) : null}
          </div>
          <HistoryPanel
            items={history}
            onLoad={handleHistoryLoad}
            onClear={() => {
              clearHistory();
              setHistory([]);
            }}
          />
        </div>
      </div>
    </main>
  );
}
