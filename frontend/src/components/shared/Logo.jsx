import { useId } from "react"
import { cn } from "@/lib/utils"

/** The mark: a bold "IQ" monogram on a deep moss tile, the Q's tail struck in gold. */
export function LogoMark({ className }) {
  const id = useId()
  const bg = `${id}-bg`
  const sheen = `${id}-sheen`
  const gold = `${id}-gold`

  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="ResearchIQ"
      className={cn("size-7 shrink-0", className)}
    >
      <defs>
        <linearGradient id={bg} x1="4" y1="0" x2="28" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#406A55" />
          <stop offset="1" stopColor="#1E3427" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="0" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={gold} x1="20" y1="17" x2="27" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F7E29B" />
          <stop offset="1" stopColor="#E0B94A" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${bg})`} />
      <rect width="32" height="32" rx="9" fill={`url(#${sheen})`} />
      <g transform="translate(-1.7 0)">
        <rect x="7" y="8.8" width="3.4" height="14.4" rx="1.1" fill="#FBF9F3" />
        <circle cx="20" cy="16" r="6.3" fill="none" stroke="#FBF9F3" strokeWidth="3.4" />
        <path d="M21.2 17.2l5.6 5.8" fill="none" stroke={`url(#${gold})`} strokeWidth="3.4" />
      </g>
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
