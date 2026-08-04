import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

const AUTO_DISMISS_MS = 4000

const VARIANT_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-600",
    ring: "ring-green-600/10",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-600",
    ring: "ring-red-600/10",
  },
}

/**
 * Single-slot toast host, viewport-anchored bottom-right. Renders whatever
 * `toast` currently is (or nothing). Auto-dismisses on a timer that resets
 * whenever a new toast replaces the previous one.
 */
export function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => onDismiss(), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  const style = VARIANT_STYLES[toast?.type] ?? VARIANT_STYLES.success
  const Icon = style.icon

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4 sm:justify-end sm:right-4 sm:left-auto">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3 shadow-lg ring-1",
              style.ring
            )}
            role="status"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", style.iconClass)} />
            <p className="min-w-0 flex-1 text-sm leading-snug text-foreground">{toast.message}</p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-0.5 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/40"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
