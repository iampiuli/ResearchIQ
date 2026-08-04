import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

export function CitationChip({ title, page, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/80 py-1.5 pr-2.5 pl-1.5 text-xs font-medium text-indigo-700 outline-none transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-[0_4px_14px_-4px_rgba(79,70,229,0.35)] active:translate-y-0 active:shadow-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1",
        className
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 transition-colors duration-200 group-hover:bg-indigo-200/80">
        <FileText className="size-2.5" strokeWidth={2.25} />
      </span>
      <span className="max-w-[15rem] truncate">{title}</span>
      {page != null && (
        <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-px text-[10px] font-semibold text-indigo-600 transition-colors duration-200 group-hover:bg-indigo-200/70">
          p.{page}
        </span>
      )}
    </button>
  )
}
