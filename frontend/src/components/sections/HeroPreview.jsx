import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, FileText, Folder, Quote, Search, Send, Sparkles } from "lucide-react"

const SOURCE_PAPERS = [
  { name: "attention-is-all-you-need.pdf", pages: "15p", active: true },
  { name: "gpt-4-technical-report.pdf", pages: "100p", active: false },
  { name: "llama-2-open-foundation.pdf", pages: "77p", active: false },
]

const COLLECTIONS = [
  { name: "Transformer Models", count: 12 },
  { name: "NLP Benchmarks", count: 8 },
  { name: "To Review", count: 3 },
]

const CITATIONS = [
  { id: 1, label: "attention-is-all-you-need.pdf · p.4" },
  { id: 2, label: "gpt-4-technical-report.pdf · p.11" },
]

/** A skeletal paragraph line used to represent PDF body text without real copy. */
function TextLine({ width = "100%" }) {
  return <div className="h-2 rounded-full bg-gray-100" style={{ width }} />
}

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="surface-strong mx-auto w-full overflow-hidden rounded-2xl"
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="ml-3 text-xs text-muted-foreground">researchiq.app/workspace</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[11rem_minmax(0,1fr)_17rem]">
        {/* LEFT — sources, collections, search */}
        <aside className="hidden flex-col gap-5 border-r border-border p-4 lg:flex">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
            <Search className="size-3.5 shrink-0" />
            <span>Search papers…</span>
          </div>

          <div>
            <p className="px-1 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Sources · 3
            </p>
            <div className="flex flex-col gap-0.5">
              {SOURCE_PAPERS.map((paper) => (
                <div
                  key={paper.name}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs ${
                    paper.active ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground"
                  }`}
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span className="truncate">{paper.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="px-1 pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Collections
            </p>
            <div className="flex flex-col gap-0.5">
              {COLLECTIONS.map((collection) => (
                <div
                  key={collection.name}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-xs text-muted-foreground"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Folder className="size-3.5 shrink-0" />
                    <span className="truncate">{collection.name}</span>
                  </span>
                  <span className="shrink-0 text-[11px]">{collection.count}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER — PDF preview with highlighted citation */}
        <div className="flex min-w-0 flex-col border-b border-border p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-medium text-foreground">attention-is-all-you-need.pdf</p>
            <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <ChevronLeft className="size-3.5" />
              <span>Page 4 of 15</span>
              <ChevronRight className="size-3.5" />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-4 rounded-xl border border-border bg-white p-5">
            <div className="space-y-2">
              <TextLine width="55%" />
              <TextLine width="100%" />
              <TextLine width="92%" />
              <TextLine width="78%" />
            </div>

            <div className="relative space-y-2 rounded-md border-l-2 border-indigo-500 bg-indigo-50/70 py-2 pl-3 pr-2">
              <TextLine width="96%" />
              <TextLine width="88%" />
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-medium text-white">
                <Quote className="size-2.5" />
                Cited in answer
              </span>
            </div>

            <div className="space-y-2">
              <TextLine width="100%" />
              <TextLine width="70%" />
            </div>
          </div>
        </div>

        {/* RIGHT — AI assistant */}
        <div className="flex flex-col p-4">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-foreground">
            <Sparkles className="size-3.5 text-indigo-600" />
            AI Assistant
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-indigo-600 px-3.5 py-2.5 text-sm text-white">
              What method do these papers use to evaluate reasoning ability?
            </div>

            <div className="max-w-[95%] space-y-2.5 rounded-2xl rounded-tl-sm border border-border bg-white px-3.5 py-3 text-sm text-muted-foreground">
              <p>
                Both papers benchmark reasoning with held-out multi-step tasks and report accuracy
                against human baselines, rather than relying on perplexity alone.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CITATIONS.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700"
                  >
                    <Quote className="size-2.5" />
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2">
            <span className="flex-1 truncate text-xs text-muted-foreground">
              Ask a question about your papers…
            </span>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
              <Send className="size-3 text-white" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
