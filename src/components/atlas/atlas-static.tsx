import Link from "next/link";
import {
  atlasDescription,
  atlasEntries,
  atlasRegions,
  atlasRelics,
  entriesByRegion,
  libraryRelic,
} from "@/content/atlas";

export function AtlasStatic() {
  return (
    <main className="min-h-dvh bg-[#0a120d] px-6 py-16 text-[#f2ecdd]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14">
        <header>
          <p className="font-mono text-[10px] tracking-[0.3em] text-[#d8e8a8] uppercase">
            Chapter 04 · The Atlas
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-none tracking-tight sm:text-7xl">
            The Atlas
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#a9b3a0]">
            {atlasDescription}
          </p>
          <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.16em] text-[#8f9a86] uppercase">
            The walkable world needs a browser canvas. Here is everything it holds, written down.
          </p>
        </header>

        {atlasRegions.map((region) => {
          const entries = entriesByRegion.get(region.id) ?? [];

          return (
            <section key={region.id} aria-labelledby={`atlas-${region.id}`}>
              <div className="flex items-baseline justify-between gap-4">
                <h2
                  id={`atlas-${region.id}`}
                  className="font-mono text-[10px] tracking-[0.24em] uppercase"
                  style={{ color: region.accent }}
                >
                  {region.name}
                </h2>
                <span className="font-mono text-[9px] tracking-[0.12em] text-[#6f7a68] uppercase">
                  {region.tagline}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {entries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-white/10 bg-[#0d1712] p-5"
                  >
                    <h3 className="font-serif text-2xl leading-tight">{entry.title}</h3>
                    <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[#8f9a86] uppercase">
                      {entry.creator}
                      {entry.year ? ` · ${entry.year}` : ""}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#c9cfc0]">{entry.why}</p>
                    {entry.quote ? (
                      <blockquote className="mt-3 border-l-2 border-[#c8b4ff]/50 pl-3">
                        <p className="font-serif text-[15px] leading-relaxed text-[#c8b4ff] italic">
                          “{entry.quote.text}”
                        </p>
                        <p className="mt-1 font-mono text-[8px] tracking-[0.14em] text-[#c8b4ff]/60 uppercase">
                          {entry.quote.attribution}
                        </p>
                      </blockquote>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        <section aria-labelledby="atlas-relics">
          <h2
            id="atlas-relics"
            className="font-mono text-[10px] tracking-[0.24em] text-[#ffcf6b] uppercase"
          >
            Relics
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2">
            {[...atlasRelics, libraryRelic].map((relic) => (
              <li key={relic.id} className="rounded-xl border border-white/10 bg-[#0d1712] p-5">
                <h3 className="font-serif text-xl leading-tight">{relic.title}</h3>
                <p className="mt-2 font-serif text-[15px] leading-relaxed text-[#c8b4ff] italic">
                  “{relic.quote}”
                </p>
                <p className="mt-1 font-mono text-[8px] tracking-[0.14em] text-[#c8b4ff]/60 uppercase">
                  {relic.attribution}
                </p>
                <p className="mt-3 font-mono text-[9px] leading-relaxed tracking-[0.1em] text-[#6f7a68] uppercase">
                  {relic.hint}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="flex items-center justify-between border-t border-white/10 pt-6">
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.16em] text-[#a9b3a0] uppercase transition-colors hover:text-[#d8e8a8]"
          >
            ← Title screen
          </Link>
          <span className="font-mono text-[9px] tracking-[0.12em] text-[#6f7a68] uppercase">
            {atlasRegions.length} regions · {atlasEntries.length} influences
          </span>
        </footer>
      </div>
    </main>
  );
}
