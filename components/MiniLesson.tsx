import { miniLessonContent } from "@/lib/mini-lessons";
import type { MiniLessonKey } from "@/types/pronunciation";

type Props = {
  lessons: MiniLessonKey[];
};

export function MiniLesson({ lessons }: Props) {
  if (lessons.length === 0) {
    return (
      <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mini lesson</h2>
        <p className="mt-3 text-sm text-slate-400">No targeted mini lesson for this approximate result.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mini lesson</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {lessons.map((key) => {
          const lesson = miniLessonContent[key];
          return (
            <article key={key} className="rounded-lg bg-black/20 p-4">
              <h3 className="font-semibold text-white">{lesson.title}</h3>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                {lesson.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">Examples: {lesson.examples.join(", ")}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
