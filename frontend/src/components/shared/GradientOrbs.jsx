import { cn } from "@/lib/utils"

/**
 * Decorative blurred gradient blobs used to add subtle depth behind sections.
 * Purely visual — always aria-hidden and non-interactive.
 */
export function GradientOrbs({ className, variant = "hero" }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {variant === "hero" && (
        <>
          <div className="absolute left-1/2 top-[-10%] size-[36rem] -translate-x-1/2 rounded-full bg-violet-600/25 blur-[120px]" />
          <div className="absolute right-[-10%] top-[20%] size-[26rem] rounded-full bg-cyan-500/15 blur-[110px]" />
          <div className="absolute left-[-10%] top-[35%] size-[22rem] rounded-full bg-indigo-600/20 blur-[100px]" />
        </>
      )}
      {variant === "section" && (
        <div className="absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />
      )}
    </div>
  )
}
