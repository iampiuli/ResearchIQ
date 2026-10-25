import { Link } from "react-router-dom"
import { ArrowRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionBadge } from "@/components/shared/SectionBadge"
import { Reveal } from "@/components/shared/Reveal"
import { Grain, PageStack, Rings, Sparkle, Wash } from "@/components/shared/Decor"

/** "Grounded" — the product's core promise, shown rather than described — followed by the closing call to action. */
export function WorkspacePreview() {
  return (
    <>
      <section id="grounded" className="relative py-24 sm:py-32">
        <Wash tone="marker" className="top-1/4 right-0 size-[24rem]" />
        <Wash tone="moss" className="bottom-0 left-0 size-[22rem]" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <Reveal>
            <SectionBadge className="[&>span:first-child]:hidden">Grounded by design</SectionBadge>
            <h2 className="mt-6 text-4xl leading-[1.1] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
              Cited, <span className="text-primary italic">not claimed.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-muted-foreground">
              ResearchIQ answers only from the papers in your workspace. When it tells you something, it also tells you
              where — and the PDF opens on that very page, so you can read the passage for yourself.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative">
            <PageStack className="translate-x-2 translate-y-2" />
            <span
              aria-hidden="true"
              className="absolute -top-4 right-6 z-10 rotate-3 rounded-sm bg-marker px-3 py-1 font-sans text-[11px] font-semibold text-marker-foreground shadow-[var(--shadow-page)]"
            >
              checked against the page
            </span>
            <figure className="relative rounded-2xl border border-border-strong/70 bg-paper p-6 shadow-[var(--shadow-float)] sm:p-8">
              <p className="font-serif text-[1.05rem] leading-[1.8] text-ink-soft sm:text-[1.15rem]">
                The authors report that{" "}
                <mark className="rounded-[3px] bg-marker px-1 py-0.5 text-foreground [box-decoration-break:clone]">
                  masked language modeling lets the model condition on both left and right context
                </mark>
                , which they argue is what separates it from earlier left-to-right pretraining.
              </p>
              <figcaption className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="eyebrow mr-1">Source</span>
                <span className="inline-flex items-center gap-2 rounded-lg border border-border-strong/70 bg-background py-1.5 pr-2 pl-2.5 text-xs font-medium text-ink-soft">
                  <FileText className="size-3.5 text-muted-foreground" strokeWidth={1.75} />
                  BERT: Pre-training of Deep Bidirectional Transformers
                  <span className="rounded bg-marker px-1.5 py-px text-[10px] font-semibold text-marker-foreground">
                    p.4
                  </span>
                </span>
              </figcaption>
            </figure>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <Reveal className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-24">
            <Rings className="-top-40 -left-40 size-[34rem] text-primary-foreground/[0.08]" />
            <Rings className="-right-48 -bottom-52 size-[40rem] text-primary-foreground/[0.08]" />
            <Sparkle className="top-10 left-[18%] size-4 text-marker/70" />
            <Sparkle className="right-[16%] bottom-14 size-3 text-marker/60" />
            <Grain className="opacity-[0.12]" />
            <h2 className="relative mx-auto max-w-xl text-4xl leading-[1.1] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
              Bring your reading list. Leave with{" "}
              <span className="rounded-[4px] bg-marker px-2 text-marker-foreground italic [box-decoration-break:clone]">
                clarity.
              </span>
            </h2>
            <div className="relative mt-9 flex justify-center">
              <Button
                size="lg"
                className="bg-paper text-foreground hover:bg-paper/90"
                render={<Link to="/workspace" />}
                nativeButton={false}
              >
                Open your workspace
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
