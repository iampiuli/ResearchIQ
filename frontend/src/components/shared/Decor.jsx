import { cn } from "@/lib/utils"

/** Hand-drawn underline stroke, drawn in the primary colour. Sits under a word. */
export function ScribbleUnderline({ className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 18"
      preserveAspectRatio="none"
      fill="none"
      className={cn("pointer-events-none absolute -bottom-2 left-0 h-3 w-full text-primary/60", className)}
    >
      <path
        d="M3 12c40-8 82-9 120-5 38 4 80 2 108-3 20-3 46-2 66 2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M40 16c50-5 110-4 170-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}

/** Soft blurred colour wash. Purely atmospheric. */
export function Wash({ className, tone = "moss" }) {
  const tones = {
    moss: "bg-primary/[0.09]",
    marker: "bg-marker/60",
    paper: "bg-paper",
  }
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute -z-10 rounded-full blur-3xl", tones[tone], className)}
    />
  )
}

/** Concentric thin rings, like a radar or a ripple on paper. */
export function Rings({ className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      fill="none"
      className={cn("pointer-events-none absolute text-current", className)}
    >
      {[60, 110, 160, 210, 260, 310, 360].map((r) => (
        <circle key={r} cx="200" cy="200" r={r / 2 + 10} stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  )
}

/** A four-point sparkle, used sparingly as punctuation. */
export function Sparkle({ className }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={cn("pointer-events-none absolute", className)}>
      <path d="M12 0c.8 6.2 5.8 11.2 12 12-6.2.8-11.2 5.8-12 12-.8-6.2-5.8-11.2-12-12C6.2 11.2 11.2 6.2 12 0Z" fill="currentColor" />
    </svg>
  )
}

/** Two blank sheets fanned out behind a block, so it reads as the top of a stack of papers. */
export function PageStack({ className }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0", className)}>
      <div className="absolute inset-0 origin-bottom-left -rotate-[2.2deg] rounded-2xl border border-border-strong/60 bg-paper/80 shadow-[var(--shadow-page)]" />
      <div className="absolute inset-0 origin-bottom-right rotate-[1.8deg] rounded-2xl border border-border-strong/60 bg-secondary shadow-[var(--shadow-page)]" />
    </div>
  )
}

/** Paper-grain overlay: the faintest noise, so flat colour feels like stock. */
export function Grain({ className }) {
  return (
    <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 size-full opacity-[0.18] mix-blend-multiply", className)}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.55 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  )
}
