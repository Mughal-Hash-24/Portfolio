import Link from "next/link";
import {
  projectDomains,
  universeDescription,
  universePhases,
  universeStats,
} from "@/content/projects-universe";

export function UniverseStatic() {
  return (
    <main className="min-h-dvh bg-[#02030a] px-6 py-16 text-[#e9e4d8]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14">
        <header>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#ffb36b] uppercase">
            Chapter 01 · Projects
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-none tracking-tight sm:text-7xl">
            A Universe of Work
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#a9a396]">
            {universeDescription}
          </p>
          <p className="mt-4 font-mono text-[10px] tracking-[0.16em] text-[#8f8a7e] uppercase">
            {universeStats.domains} domains · {universeStats.projects} projects
          </p>
        </header>

        <section aria-labelledby="universe-timeline">
          <h2
            id="universe-timeline"
            className="font-mono text-[10px] tracking-[0.24em] text-[#ffb36b] uppercase"
          >
            The timeline
          </h2>
          <ol className="mt-5 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {universePhases.map((phase, index) => (
              <li key={phase.id} className="bg-[#05070e] p-5">
                <p className="font-mono text-[9px] tracking-[0.18em] text-[#ffb36b]/75">
                  {String(index + 1).padStart(2, "0")} · {phase.era}
                </p>
                <h3 className="mt-2 font-serif text-2xl leading-tight">{phase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a9a396]">{phase.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="universe-domains">
          <h2
            id="universe-domains"
            className="font-mono text-[10px] tracking-[0.24em] text-[#ffb36b] uppercase"
          >
            Domains
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {projectDomains.map((domain) => (
              <article
                key={domain.id}
                className="rounded-xl border border-white/10 bg-[#05070e] p-5"
              >
                <h3 className="font-serif text-2xl leading-tight">{domain.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a9a396]">{domain.blurb}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {domain.projects.map((project) => (
                    <li key={project.id}>
                      <p className="text-sm text-[#e9e4d8]">{project.name}</p>
                      <p className="font-mono text-[10px] leading-relaxed text-[#8f8a7e]">
                        {project.tagline}
                      </p>
                      <p className="mt-1 font-mono text-[9px] leading-relaxed text-[#6f6a60]">
                        {project.stack.join(" · ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 pt-6">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.16em] text-[#a9a396] uppercase transition-colors hover:text-[#ffb36b]"
          >
            ← Title screen
          </Link>
        </footer>
      </div>
    </main>
  );
}
