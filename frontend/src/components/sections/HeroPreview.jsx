import { motion } from "framer-motion"
import { FileText, Highlighter, Plus, Search } from "lucide-react"
import { LogoMark } from "@/components/shared/Logo"
import { PageStack } from "@/components/shared/Decor"

const PAPERS = [
  { title: "Attention Is All You Need", meta: "2.1 MB · Jun 12", active: false },
  { title: "BERT: Pre-training of Deep Bidirectional Transformers", meta: "1.4 MB · Jun 12", active: true },
  { title: "Language Models are Few-Shot Learners", meta: "6.8 MB · Jun 13", active: false },
]

function MiniSidebar() {
  return (
    <aside className="hidden w-[210px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-3 md:flex">
      <div className="mb-3 flex items-center gap-2 px-1">
        <LogoMark className="size-5" />
        <span className="font-serif text-[15px] font-medium">
          Research<span className="text-primary italic">IQ</span>
        </span>
      </div>
      <div className="mb-3 flex h-7 items-center justify-center rounded-md border border-dashed border-border-strong text-[10.5px] font-medium text-ink-soft">
        <Plus className="mr-1 size-3" /> Add papers
      </div>
      <div className="mb-4 flex items-center gap-1.5 rounded-md bg-foreground/[0.045] px-2 py-1.5 text-[10.5px] text-muted-foreground">
        <Search className="size-3" /> Search papers
      </div>
      <p className="eyebrow mb-1.5 px-1 !text-[9px]">Library</p>
      <div className="space-y-0.5">
        {PAPERS.map((paper) => (
          <div
            key={paper.title}
            className={`relative flex gap-2 rounded-md px-2 py-1.5 ${paper.active ? "bg-paper shadow-[0_0_0_1px_var(--border)]" : ""}`}
          >
            {paper.active && <span className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-primary" />}
            <FileText className={`mt-0.5 size-3 shrink-0 ${paper.active ? "text-primary" : "text-muted-foreground"}`} />
            <div className="min-w-0">
              <p className="line-clamp-2 text-[10.5px] leading-snug font-medium text-foreground">{paper.title}</p>
              <p className="mt-0.5 text-[9.5px] text-muted-foreground">{paper.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function MiniReader() {
  return (
    <aside className="hidden w-[210px] shrink-0 flex-col border-l border-border bg-sidebar lg:flex">
      <div className="border-b border-border px-3 py-2.5">
        <p className="eyebrow !text-[9px]">Reading</p>
        <p className="mt-0.5 truncate font-serif text-[11.5px]">BERT: Pre-training of Deep…</p>
      </div>
      <div className="flex flex-1 items-start justify-center p-4">
        <div className="w-full rounded-[2px] bg-paper p-3.5 shadow-[var(--shadow-page)] ring-[3px] ring-marker/80">
          <div className="mb-2.5 h-1.5 w-3/4 rounded-full bg-foreground/25" />
          <div className="space-y-1.5">
            <div className="h-1 w-full rounded-full bg-foreground/10" />
            <div className="h-1 w-full rounded-full bg-foreground/10" />
            <div className="h-1 w-5/6 rounded-full bg-foreground/10" />
          </div>
          <div className="my-2.5 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-marker" />
            <div className="h-1.5 w-11/12 rounded-full bg-marker" />
            <div className="h-1.5 w-2/3 rounded-full bg-marker" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1 w-full rounded-full bg-foreground/10" />
            <div className="h-1 w-full rounded-full bg-foreground/10" />
            <div className="h-1 w-3/4 rounded-full bg-foreground/10" />
            <div className="h-1 w-full rounded-full bg-foreground/10" />
            <div className="h-1 w-1/2 rounded-full bg-foreground/10" />
          </div>
        </div>
      </div>
      <div className="mx-auto mb-3 flex items-center gap-1 rounded-full bg-marker px-2.5 py-1 text-[9.5px] font-medium text-marker-foreground">
        <Highlighter className="size-2.5" /> Cited in answer
      </div>
    </aside>
  )
}

function SourceTag({ children, page }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-strong/70 bg-paper py-1 pr-1.5 pl-2 font-sans text-[10.5px] font-medium text-ink-soft">
      <FileText className="size-3 text-muted-foreground" />
      {children}
      <span className="rounded bg-marker px-1 text-[9px] font-semibold text-marker-foreground">p.{page}</span>
    </span>
  )
}

/** A static, coded rendition of the workspace — keeps the landing page in lockstep with the real UI. */
export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto w-full max-w-5xl"
      role="img"
      aria-label="Preview of the ResearchIQ workspace: a paper library, a cited answer, and the source PDF open beside it"
    >
      <PageStack className="mx-2 translate-y-3 sm:mx-4" />
      <div className="absolute inset-x-8 -bottom-6 h-24 rounded-[50%] bg-primary/10 blur-3xl" aria-hidden="true" />

      <div
        aria-hidden="true"
        className="animate-float absolute -top-5 -left-3 z-10 hidden items-center gap-2 rounded-xl border border-border-strong/70 bg-paper px-3 py-2 text-xs font-medium text-ink-soft shadow-[var(--shadow-float)] lg:flex xl:-left-10"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-accent text-primary">✓</span>
        3 papers indexed
      </div>
      <div
        aria-hidden="true"
        className="animate-float absolute -right-3 bottom-16 z-10 hidden items-center gap-2 rounded-xl border border-border-strong/70 bg-paper px-3 py-2 text-xs font-medium text-ink-soft shadow-[var(--shadow-float)] [animation-delay:-3s] lg:flex xl:-right-10"
      >
        <Highlighter className="size-3.5 text-marker-foreground" />
        Opens on the cited page
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border-strong/70 bg-background shadow-[0_2px_4px_rgb(60_50_30/0.04),0_32px_80px_-24px_rgb(60_50_30/0.28)]">
        <div className="flex items-center gap-1.5 border-b border-border bg-sidebar px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
          <span className="size-2.5 rounded-full bg-border-strong" />
        </div>

        <div className="flex h-[26rem] sm:h-[29rem]" aria-hidden="true">
          <MiniSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-10 items-baseline gap-2.5 border-b border-border px-5 pt-3">
              <p className="font-serif text-[14px] font-medium">Attention &amp; Transformers</p>
              <p className="text-[10.5px] text-muted-foreground">3 papers</p>
            </div>

            <div className="flex-1 space-y-5 overflow-hidden px-5 py-5 sm:px-8">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-secondary px-3.5 py-2 text-[12px] leading-relaxed">
                  Compare how these papers approach pretraining.
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <LogoMark className="size-4" />
                  <span className="eyebrow !text-[9px]">ResearchIQ</span>
                </div>
                <p className="font-serif text-[13px] leading-[1.75] text-ink-soft sm:text-[14px]">
                  BERT pretrains a <strong className="font-semibold text-foreground">bidirectional encoder</strong>{" "}
                  with masked language modeling, whereas GPT-3 uses an{" "}
                  <strong className="font-semibold text-foreground">autoregressive objective</strong> at far greater
                  scale. The original Transformer paper introduces the architecture both build on, but is trained for
                  translation rather than general pretraining.
                </p>
                <div className="mt-3.5 border-t border-border pt-3">
                  <p className="eyebrow mb-2 !text-[9px]">Sources</p>
                  <div className="flex flex-wrap gap-1.5">
                    <SourceTag page={4}>BERT</SourceTag>
                    <SourceTag page={8}>Few-Shot Learners</SourceTag>
                    <SourceTag page={2}>Attention Is All You Need</SourceTag>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 pb-4 sm:px-8">
              <div className="flex items-center rounded-xl border border-border-strong/80 bg-paper py-2 pr-2 pl-3.5 text-[11.5px] text-muted-foreground/80">
                <span className="flex-1">Ask a question about your papers…</span>
                <span className="flex size-6 items-center justify-center rounded-lg bg-foreground/[0.08] text-muted-foreground">
                  ↑
                </span>
              </div>
            </div>
          </div>

          <MiniReader />
        </div>
      </div>
    </motion.div>
  )
}
