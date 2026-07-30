import { motion } from "framer-motion"
import { FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_STYLES = {
  indexed: { dot: "bg-green-500", label: "Indexed", text: "text-green-700", bg: "bg-green-50" },
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

export function PaperCard({ paper, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left outline-none transition-colors duration-150",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1",
        active
          ? "border-indigo-200 bg-indigo-50"
          : "border-border bg-white hover:border-gray-300 hover:bg-muted/60 hover:shadow-sm"
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
          {paper.authors} · {paper.year}
        </p>
        <div className="mt-2">
          <StatusBadge status={paper.status} />
        </div>
      </div>
    </motion.button>
  )
}
