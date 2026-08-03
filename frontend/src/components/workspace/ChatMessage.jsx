import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Logo } from "@/components/shared/Logo"
import { CitationChip } from "@/components/workspace/CitationChip"
import { cn } from "@/lib/utils"

const ENTER = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }) => <p className="text-[15px] leading-7 text-foreground">{children}</p>,
  h1: ({ children }) => <h1 className="text-lg font-semibold text-foreground">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold text-foreground">{children}</h2>,
  h3: ({ children }) => <h3 className="text-[15px] font-semibold text-foreground">{children}</h3>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 text-[15px] leading-7 text-foreground">{children}</ul>,
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1 pl-5 text-[15px] leading-7 text-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-indigo-200 pl-3 text-[15px] leading-7 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700"
    >
      {children}
    </a>
  ),
  // react-markdown no longer tells us whether `code` is inline vs. fenced, so
  // the block look is applied via `pre`'s descendant selector instead —
  // fenced code is always `pre > code`, inline code never is.
  code: ({ children, ...props }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-indigo-700" {...props}>
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-muted/60 p-3",
        "[&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[13px] [&>code]:leading-6 [&>code]:text-foreground"
      )}
    >
      {children}
    </pre>
  ),
}

function MessageMarkdown({ content }) {
  return (
    <div className="space-y-3">
      <ReactMarkdown components={MARKDOWN_COMPONENTS}>{content}</ReactMarkdown>
    </div>
  )
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
        {message.isError ? (
          <p className="text-[15px] leading-7 text-red-600">{message.content}</p>
        ) : (
          <MessageMarkdown content={message.content} />
        )}

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
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-white px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={cn("size-1.5 rounded-full bg-indigo-300")}
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
