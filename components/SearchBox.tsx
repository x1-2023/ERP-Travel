"use client";

import { FormEvent, useState } from "react";

type Props = {
  initialValue?: string;
  onSearch: (word: string) => void;
};

export function SearchBox({ initialValue = "", onSearch }: Props) {
  const [word, setWord] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (word.trim()) onSearch(word.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row">
      <input
        value={word}
        onChange={(event) => setWord(event.target.value)}
        placeholder="Type an English word..."
        className="h-14 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-5 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-coach-teal/70 focus:bg-white/[0.09]"
      />
      <button className="h-14 rounded-lg bg-coach-teal px-6 text-sm font-bold text-graphite-950 transition hover:bg-teal-300 sm:w-auto">
        Search
      </button>
    </form>
  );
}
