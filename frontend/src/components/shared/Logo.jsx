import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function Logo({ className, iconOnly = false }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
        <Sparkles className="size-4 text-white" strokeWidth={2.25} />
      </span>
      {!iconOnly && (
        <span className="text-base font-semibold tracking-tight text-foreground">
          Research<span className="text-indigo-600">IQ</span>
        </span>
      )}
    </div>
  )
}
