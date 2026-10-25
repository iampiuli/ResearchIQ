import { Plus } from "lucide-react"
import { SectionBadge } from "@/components/shared/SectionBadge"
import { Reveal } from "@/components/shared/Reveal"

const FAQS = [
  {
    q: "What kind of files can I add?",
    a: "PDFs with a text layer, which covers most published papers. Scanned documents without selectable text can't be read yet.",
  },
  {
    q: "Does it answer from outside my papers?",
    a: "No. Answers are drawn from the papers in your workspace, and each one lists the papers it used so you can check the passage yourself.",
  },
  {
    q: "What happens if I upload the same paper twice?",
    a: "It's recognised and processed once, so nothing is duplicated in your library.",
  },
  {
    q: "Can I ask across several papers at once?",
    a: "Yes. Comparison and overview questions pull from every paper in the workspace, not just the single best match.",
  },
  {
    q: "Where are my workspaces stored?",
    a: "Workspaces and conversations are kept in your browser, so they're private to this device.",
  },
]

export function Faq() {
  return (
    <section id="faq" className="py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <Reveal>
          <SectionBadge className="[&>span:first-child]:hidden">Questions</SectionBadge>
          <h2 className="mt-6 text-4xl leading-[1.1] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
            Good things to <span className="text-primary italic">know.</span>
          </h2>
          <p className="mt-5 max-w-sm text-muted-foreground">The short answers, before you open a workspace.</p>
        </Reveal>

        <Reveal delay={0.1} className="divide-y divide-border border-y border-border">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl text-foreground [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
