import { cn } from "@/lib/utils"

/** Small-caps section label with a leading rule — reads like a chapter marker. */
export function SectionBadge({ children, className }) {
  return (
    <div className={cn("eyebrow inline-flex items-center gap-3", className)}>
      <span className="h-px w-6 bg-border-strong" aria-hidden="true" />
      {children}
      <span className="h-px w-6 bg-border-strong" aria-hidden="true" />
    </div>
  )
}
