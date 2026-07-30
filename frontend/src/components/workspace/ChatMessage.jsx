import { motion } from "framer-motion"
import { Logo } from "@/components/shared/Logo"
import { CitationChip } from "@/components/workspace/CitationChip"
import { cn } from "@/lib/utils"

const ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
}

export function ChatMessage({ message, onCitationClick }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <motion.div {...ENTER} className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-[15px] leading-relaxed text-white">
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div {...ENTER} className="flex items-start gap-3.5">
      <Logo iconOnly className="mt-0.5 shrink-0" />

      <div className="min-w-0 max-w-[85%] space-y-3 pt-1">
        <p className="text-[15px] leading-7 text-foreground">{message.content}</p>

        {message.citations?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {message.citations.map((citation) => (
              <CitationChip
                key={`${citation.paperId}-${citation.page}`}
                title={citation.paperTitle}
                page={citation.page}
                onClick={() => onCitationClick?.(citation)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function TypingIndicator() {
  return (
    <motion.div {...ENTER} className="flex items-start gap-3.5">
      <Logo iconOnly className="mt-0.5 shrink-0" />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-white px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={cn("size-1.5 rounded-full bg-gray-300")}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
