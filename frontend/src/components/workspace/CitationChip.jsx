import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function CitationChip({ title, page, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 py-1 pr-2.5 pl-2 text-xs font-medium text-indigo-700 outline-none transition-all duration-150",
        "hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-sm active:translate-y-0",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1",
        className
      )}
    >
      <FileText className="size-3 shrink-0 text-indigo-500" strokeWidth={2} />
      <span className="max-w-[14rem] truncate">{title}</span>
      {page != null && (
        <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-px text-[10px] font-semibold text-indigo-600 group-hover:bg-indigo-200/70">
          p.{page}
        </span>
      )}
    </button>
  )
}
