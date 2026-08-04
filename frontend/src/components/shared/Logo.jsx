import { cn } from "@/lib/utils"

export function Logo({ className, iconOnly = false }) {
  if (iconOnly) {
    return (
      <img
        src="/brand/researchiq-icon.svg"
        alt="ResearchIQ"
        width={512}
        height={512}
        className={cn("size-8", className)}
      />
    )
  }

  return (
    <img
      src="/brand/researchiq-logo.svg"
      alt="ResearchIQ"
      width={420}
      height={120}
      className={cn("h-9 w-auto", className)}
    />
  )
}
