"use client";

import { isSpeechRecognitionSupported, recognizeSpeech } from "@/lib/mic";
import { scoreSpeech } from "@/lib/scoring";
import type { Accent, MicScore } from "@/types/pronunciation";
import { useState } from "react";

type Props = {
  word: string;
  accent: Accent;
  onScore: (score: number) => void;
};

export function MicPractice({ word, accent, onScore }: Props) {
  const [result, setResult] = useState<MicScore | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const supported = isSpeechRecognitionSupported();

  async function handlePractice() {
    if (!supported) {
      setError("Your browser does not support speech recognition yet. Try Chrome desktop.");
      return;
    }
    setError("");
    setIsListening(true);
    try {
      const recognized = await recognizeSpeech(accent);
      const next = scoreSpeech(word, recognized);
      setResult(next);
      onScore(next.score);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Speech recognition failed.");
    } finally {
      setIsListening(false);
    }
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Microphone practice</h2>
          <p className="mt-2 text-sm text-slate-400">Speech-recognition comparison, not professional phonetic scoring.</p>
        </div>
        <button
          type="button"
          onClick={handlePractice}
          disabled={isListening}
          className="rounded-lg border border-coach-teal/30 bg-coach-teal/10 px-4 py-2 text-sm font-bold text-coach-teal transition hover:bg-coach-teal/20 disabled:cursor-wait disabled:opacity-60"
        >
          {isListening ? "Listening..." : "Try speaking"}
        </button>
      </div>
      {error ? <p className="mt-4 text-sm text-coach-amber">{error}</p> : null}
      {result ? (
        <div className="mt-4 grid gap-3 rounded-lg bg-black/20 p-4 text-sm md:grid-cols-3">
          <div>
            <span className="text-slate-500">Result</span>
            <p className="font-bold text-white">{result.label}</p>
          </div>
          <div>
            <span className="text-slate-500">Score</span>
            <p className="font-bold text-white">{result.score}</p>
          </div>
          <div>
            <span className="text-slate-500">Recognized</span>
            <p className="font-bold text-white">{result.recognizedText}</p>
          </div>
          <p className="md:col-span-3 text-slate-300">{result.feedback}</p>
        </div>
      ) : null}
    </section>
  );
}
