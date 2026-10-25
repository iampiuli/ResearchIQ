import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatInput({ value, onChange, onSubmit, disabled }) {
  const canSend = Boolean(value.trim()) && !disabled

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSend) onSubmit()
    }
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-2xl border border-border-strong/80 bg-paper p-2.5 pl-4 transition-[border-color,box-shadow] duration-200",
        "shadow-[0_1px_2px_rgb(60_50_30/0.04)]",
        "focus-within:border-primary/50 focus-within:shadow-[0_0_0_4px_rgb(51_80_63/0.08)]"
      )}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Ask a question about your papers…"
        className="field-sizing-content max-h-44 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSend}
        aria-label="Send message"
        className={cn(
          "focus-ring flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-[background-color,opacity,transform] duration-150",
          "hover:bg-primary/90 active:scale-95",
          "disabled:bg-foreground/[0.08] disabled:text-muted-foreground disabled:active:scale-100"
        )}
      >
        <ArrowUp className="size-4" strokeWidth={2.25} />
      </button>
    </div>
  )
}
