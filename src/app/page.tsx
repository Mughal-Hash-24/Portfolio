import { chapters, site } from "@/content/site";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-12 px-6 py-24 text-center">
      <div className="flex flex-col items-center gap-6">
        <p className="font-mono text-[0.65rem] tracking-[0.45em] text-muted uppercase">
          Portfolio in progress
        </p>
        <h1 className="font-display text-5xl leading-none tracking-tight uppercase sm:text-7xl">
          {site.shortName}
        </h1>
        <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">{site.role}</p>
        <p className="max-w-md text-sm leading-6 text-balance text-muted sm:text-base">
          A Minecraft-inspired title screen, a playable arcade, and an AI guide. The world is being
          built.
        </p>
      </div>

      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[0.65rem] tracking-[0.3em] text-muted uppercase">
        {chapters.map((chapter) => (
          <li key={chapter.id}>{chapter.label}</li>
        ))}
      </ul>

      <div className="flex items-center gap-6 font-mono text-xs tracking-[0.2em] uppercase">
        <a
          className="transition-colors hover:text-accent"
          href={site.github}
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a className="transition-colors hover:text-accent" href={`mailto:${site.email}`}>
          Email
        </a>
      </div>
    </main>
  );
}
