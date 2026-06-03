import { PracticeQuiz } from "@/components/PracticeQuiz";
import Link from "next/link";

export default function PracticePage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-white">
            Pronunciation Coach
          </Link>
          <Link href="/" className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 hover:text-white">
            Search
          </Link>
        </nav>
        <PracticeQuiz />
      </div>
    </main>
  );
}
