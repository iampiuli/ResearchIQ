import { cn } from "@/lib/utils"

export function SectionBadge({ icon: Icon, children, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {Icon && <Icon className="size-3.5 text-indigo-600" strokeWidth={2.25} />}
      {children}
    </div>
  )
}
