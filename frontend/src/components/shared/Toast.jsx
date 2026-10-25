import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

const AUTO_DISMISS_MS = 4000

const VARIANT_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-primary",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-destructive",
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
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4 sm:right-5 sm:left-auto sm:justify-end">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border-strong/70 bg-paper px-4 py-3",
              "shadow-[var(--shadow-float)]"
            )}
            role="status"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", style.iconClass)} strokeWidth={1.75} />
            <p className="min-w-0 flex-1 text-[13px] leading-snug text-foreground">{toast.message}</p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className="focus-ring shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
