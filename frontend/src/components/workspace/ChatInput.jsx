import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatInput({ value, onChange, onSubmit, disabled }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) onSubmit()
    }
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-2xl border border-border bg-white p-3 shadow-sm transition-shadow duration-150",
        "focus-within:border-indigo-300 focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-500/10"
      )}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask a question about your papers…"
        className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/80 focus:outline-none"
      />
      <motion.button
        type="button"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        whileHover={!disabled && value.trim() ? { scale: 1.06 } : undefined}
        whileTap={!disabled && value.trim() ? { scale: 0.94 } : undefined}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground outline-none transition-colors",
          "hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-40"
        )}
      >
        <Send className="size-4" />
      </motion.button>
    </div>
  )
}
