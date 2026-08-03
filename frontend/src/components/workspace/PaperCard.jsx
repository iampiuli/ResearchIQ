import { ExternalLink, FileText, Info, Loader2, MoreVertical, Trash2 } from "lucide-react"
import { cn, formatFileSize, formatUploadedAt } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const STATUS_STYLES = {
  indexed: { dot: "bg-green-500", label: "Indexed", text: "text-green-700", bg: "bg-green-50" },
  uploaded: { dot: "bg-green-500", label: "Indexed", text: "text-green-700", bg: "bg-green-50" },
  processing: { dot: "bg-amber-500", label: "Processing", text: "text-amber-700", bg: "bg-amber-50" },
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.indexed
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        style.bg,
        style.text
      )}
    >
      {status === "processing" ? (
        <Loader2 className="size-2.5 animate-spin" />
      ) : (
        <span className={cn("size-1.5 rounded-full", style.dot)} />
      )}
      {style.label}
    </span>
  )
}

export function PaperCard({ paper, active, onClick, onRemove, onShowDetails }) {
  return (
    <div
      className={cn(
        "group flex w-full items-start gap-1 rounded-xl border transition-colors duration-150",
        active ? "border-indigo-200 bg-indigo-50" : "border-border bg-white hover:border-gray-300 hover:bg-muted/60 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex min-w-0 flex-1 items-start gap-3 rounded-xl p-3.5 text-left outline-none",
          "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1"
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border",
            active ? "border-indigo-200 bg-white" : "border-border bg-white"
          )}
        >
          <FileText className="size-4 text-indigo-600" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-snug font-medium text-foreground" title={paper.title}>
            {paper.title}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {[formatUploadedAt(paper.uploadedAt), formatFileSize(paper.size)].filter(Boolean).join(" · ")}
          </p>
          <div className="mt-2">
            <StatusBadge status={paper.status} />
          </div>
        </div>
      </button>

      <div className="shrink-0 py-3.5 pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Paper actions"
            className={cn(
              "flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150",
              "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 data-[popup-open]:opacity-100",
              "hover:bg-white hover:text-foreground data-[popup-open]:bg-white data-[popup-open]:text-foreground"
            )}
          >
            <MoreVertical className="size-4" />
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
              Delete from Workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
