import { cn } from "@/lib/utils"

/** The mark: an open page with a single marked line — "the passage that matters". */
export function LogoMark({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="ResearchIQ"
      className={cn("size-7 shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" fill="#33503F" />
      <path
        d="M9.5 8.5h8.2l4.8 4.8v10.2a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z"
        fill="#F8F6EF"
      />
      <path d="M17.7 8.5l4.8 4.8h-3.8a1 1 0 0 1-1-1V8.5Z" fill="#CBD6C8" />
      <rect x="11.5" y="15" width="7" height="1.6" rx=".8" fill="#33503F" opacity=".55" />
      <rect x="11.5" y="18.2" width="9" height="2.4" rx="1.2" fill="#F4E6AE" />
      <rect x="11.5" y="22" width="5" height="1.6" rx=".8" fill="#33503F" opacity=".35" />
    </svg>
  )
}

export function Logo({ className, iconOnly = false }) {
  if (iconOnly) return <LogoMark className={className} />

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-serif text-[1.3rem] leading-none font-medium tracking-tight text-foreground">
        Research<span className="text-primary italic">IQ</span>
      </span>
    </span>
  )
}
