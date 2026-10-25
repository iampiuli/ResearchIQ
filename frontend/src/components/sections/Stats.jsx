import { Reveal } from "@/components/shared/Reveal"

const STATS = [
  { value: "Any", label: "number of PDFs per workspace" },
  { value: "1 click", label: "from an answer to its source" },
  { value: "0", label: "papers processed twice" },
  { value: "100%", label: "of answers drawn from your papers" },
]

export function Stats() {
  return (
    <section className="py-16 sm:py-20">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border-strong/70 bg-border-strong/70 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-paper px-6 py-8 text-center">
              <dt className="font-serif text-4xl font-medium tracking-tight text-primary sm:text-5xl">{s.value}</dt>
              <dd className="mt-2 text-[13px] text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
