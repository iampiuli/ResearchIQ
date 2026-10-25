import { ExternalLink, FileText, Info, Loader2, MoreHorizontal, Trash2 } from "lucide-react"
import { cn, formatFileSize, formatUploadedAt } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** A quiet status mark: nothing for indexed papers (the default), a spinner while processing. */
function ProcessingMark({ status }) {
  if (status !== "processing") return null
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-marker-foreground">
      <Loader2 className="size-3 animate-spin" />
      Processing
    </span>
  )
}

export function PaperCard({ paper, active, onClick, onRemove, onShowDetails }) {
  const meta = [formatFileSize(paper.size), formatUploadedAt(paper.uploadedAt)].filter(Boolean).join(" · ")

  return (
    <div
      className={cn(
        "group relative flex w-full items-start rounded-lg transition-colors duration-150",
        active ? "bg-paper shadow-[0_0_0_1px_var(--border)]" : "hover:bg-foreground/[0.04]"
      )}
    >
      {active && <span className="absolute top-2.5 bottom-2.5 left-0 w-0.5 rounded-full bg-primary" aria-hidden="true" />}

      <button
        type="button"
        onClick={onClick}
        className="focus-ring flex min-w-0 flex-1 items-start gap-3 rounded-lg px-3 py-2.5 text-left"
      >
        <FileText
          className={cn("mt-0.5 size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")}
          strokeWidth={1.6}
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] leading-snug font-medium text-foreground" title={paper.title}>
            {paper.title}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="truncate text-[11.5px] text-muted-foreground">{meta}</p>
            <ProcessingMark status={paper.status} />
          </div>
        </div>
      </button>

      <div className="shrink-0 py-2 pr-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Paper actions"
            className={cn(
              "focus-ring flex size-7 items-center justify-center rounded-md text-muted-foreground transition-[opacity,background-color,color] duration-150",
              "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 data-[popup-open]:opacity-100",
              "hover:bg-foreground/[0.06] hover:text-foreground data-[popup-open]:bg-foreground/[0.06] data-[popup-open]:text-foreground"
            )}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onClick}>
              <ExternalLink className="size-3.5" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShowDetails}>
              <Info className="size-3.5" />
              Details
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onRemove}>
              <Trash2 className="size-3.5" />
              Remove from workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
