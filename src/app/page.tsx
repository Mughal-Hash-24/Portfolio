import { TitleScreen } from "@/components/hero/title-screen";
import { chapters } from "@/content/site";

const chapterCopy: Record<string, string> = {
  about: "The story behind the code, the games, and the detours.",
  projects: "Selected work, case studies, and the things that broke along the way.",
  arcade: "Playable ports of the games that started all of this.",
  ask: "An AI guide to my work, experience, and the questions recruiters actually ask.",
  contact: "The fastest ways to reach me.",
};

export default function Home() {
  return (
    <main>
      <TitleScreen />

      {chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          id={chapter.id}
          className="flex min-h-dvh flex-col items-center justify-center gap-5 border-t border-line bg-bg px-6 py-24 text-center"
        >
          <p className="font-mono text-[10px] tracking-[0.4em] text-muted uppercase">
            Chapter {String(index + 1).padStart(2, "0")}
          </p>
          <h2 tabIndex={-1} className="font-display text-4xl tracking-tight uppercase sm:text-6xl">
            {chapter.label}
          </h2>
          <p className="max-w-sm text-sm leading-6 text-muted">
            {chapterCopy[chapter.id] ?? "This chapter is being built."}
          </p>
          <a
            href="#top"
            className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase transition-colors hover:text-fg"
          >
            Back to title screen
          </a>
        </section>
      ))}
    </main>
  );
}
