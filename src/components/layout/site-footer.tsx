import { MinistrySeal } from "@/components/fx/ministry-seal";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-parchment-500/12 bg-ink-950">
      <div className="mx-auto grid w-full max-w-[1600px] gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <MinistrySeal variant="ghost" className="h-9 w-9" />
            <div>
              <p className="font-display text-lg leading-none tracking-[0.16em] text-parchment-200">TRACE</p>
              <p className="label-mono mt-1">Track · Retrieve · Analyze · Correlate · Examine</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-parchment-500">
            An investigation exercise of the Ministry of Magic. All incidents, persons and
            systems depicted are fictional and constructed for training purposes.
          </p>
        </div>

        <div>
          <p className="label-mono mb-3">Archive</p>
          <ul className="space-y-2 font-mono text-[11px] text-parchment-400">
            <li>Level 2 · Auror Office</li>
            <li>Evidence Vault B</li>
            <li>Forensic Lab 3</li>
            <li>51.5007° N / 0.1246° W</li>
          </ul>
        </div>

        <div>
          <p className="label-mono mb-3">Handling</p>
          <ul className="space-y-2 font-mono text-[11px] text-parchment-400">
            <li>Classification: Restricted</li>
            <li>Distribution: Cleared investigators</li>
            <li>Retention: 7 years</li>
            <li>Reviewed: 14 AUG 2026</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-parchment-500/10">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 font-mono text-[9px] uppercase tracking-widest2 text-parchment-600 sm:px-8">
          <span>© {new Date().getFullYear()} Ministry of Magic</span>
          <span className="hidden sm:inline">End of transmission</span>
          <span className="ml-auto">Build 2.4.1 · Terminal Ω-7</span>
        </div>
      </div>
    </footer>
  );
}
