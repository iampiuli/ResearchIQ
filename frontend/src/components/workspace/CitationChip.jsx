import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

/** A footnote-style source tag: paper title plus the cited page, set in a marker tint on hover. */
export function CitationChip({ title, page, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "focus-ring group inline-flex max-w-full items-center gap-2 rounded-lg border border-border-strong/70 bg-paper py-1.5 pr-2 pl-2.5 font-sans text-xs text-ink-soft transition-colors duration-150",
        "hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
        className
      )}
    >
      <FileText className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" strokeWidth={1.75} />
      <span className="max-w-[16rem] truncate font-medium">{title}</span>
      {page != null && (
        <span className="shrink-0 rounded bg-marker px-1.5 py-px text-[10px] font-semibold tabular-nums text-marker-foreground">
          p.{page}
        </span>
      )}
    </button>
  )
}
