"use client";

import { AccentSelector } from "@/components/AccentSelector";
import { VietnameseMeaning } from "@/components/VietnameseMeaning";
import { dictionaryWords, pronunciationData } from "@/lib/pronunciation-data";
import { getPronunciation } from "@/lib/pronounce";
import { speakWord } from "@/lib/speech";
import type { Accent, WordLevel } from "@/types/pronunciation";
import { useMemo, useState } from "react";

type Mode = WordLevel | "mixed";

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickQuestion(mode: Mode) {
  const pool = dictionaryWords.filter((word) => mode === "mixed" || pronunciationData[word].level === mode);
  const word = pool[Math.floor(Math.random() * pool.length)] ?? "hello";
  const distractors = shuffle(pool.filter((item) => item !== word)).slice(0, 3);
  return { word, options: shuffle([word, ...distractors]) };
}

export function PracticeQuiz() {
  const [mode, setMode] = useState<Mode>("mixed");
  const [accent, setAccent] = useState<Accent>("us");
  const [question, setQuestion] = useState(() => pickQuestion("mixed"));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const result = useMemo(() => getPronunciation(question.word, accent), [question.word, accent]);

  function nextQuestion(nextMode = mode) {
    setQuestion(pickQuestion(nextMode));
    setSelected(null);
  }

  function handleMode(nextMode: Mode) {
    setMode(nextMode);
    setScore(0);
    setTotal(0);
    nextQuestion(nextMode);
  }

  function choose(option: string) {
    if (selected) return;
    setSelected(option);
    setTotal((value) => value + 1);
    if (option === question.word) setScore((value) => value + 1);
  }

  return (
    <div className="rounded-lg border border-white/10 bg-graphite-850 p-5 shadow-soft md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">A1/A2 listening practice</h1>
          <p className="mt-2 text-sm text-slate-400">Listen, choose the word, then review IPA and Vietnamese meaning.</p>
        </div>
        <AccentSelector accent={accent} onChange={setAccent} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["mixed", "A1", "A2"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleMode(item)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              mode === item ? "bg-coach-teal text-graphite-950" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white"
            }`}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Current score</p>
          <p className="mt-3 text-5xl font-bold text-white">
            {score}<span className="text-xl text-slate-500">/{total}</span>
          </p>
          <button
            type="button"
            onClick={() => speakWord(question.word, accent, false)}
            className="mt-6 w-full rounded-lg bg-coach-amber px-4 py-3 text-sm font-bold text-graphite-950 hover:bg-amber-300"
          >
            ▶ Play word
          </button>
        </section>

        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isCorrect = selected && option === question.word;
              const isWrong = selected === option && option !== question.word;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  className={`rounded-lg border px-4 py-4 text-left text-lg font-bold transition ${
                    isCorrect
                      ? "border-coach-green bg-coach-green/15 text-coach-green"
                      : isWrong
                        ? "border-coach-red bg-coach-red/15 text-coach-red"
                        : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {selected ? (
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="font-bold text-white">{selected === question.word ? "Correct" : "Incorrect"}: {question.word}</p>
              <p className="mt-2 text-sm text-slate-300">IPA: {result.ipa}</p>
              <p className="text-sm text-slate-300">Sounds like: {result.soundsLike}</p>
              <div className="mt-4">
                <VietnameseMeaning vi={result.vi} />
              </div>
              <button
                type="button"
                onClick={() => nextQuestion()}
                className="mt-4 rounded-lg border border-coach-teal/30 bg-coach-teal/10 px-4 py-2 text-sm font-bold text-coach-teal hover:bg-coach-teal/20"
              >
                Next word
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
