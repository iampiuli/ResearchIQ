import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Check, Copy } from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { CitationChip } from "@/components/workspace/CitationChip"
import { cn } from "@/lib/utils"

// Quick fade + slight upward settle — not a simulated typing effect, just a
// snappy arrival so the message doesn't feel like it's popping in.
const ENTER = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.15, ease: "easeOut" },
}

/** Recursively flattens a react-markdown code node's children back to plain text, for the copy button. */
function extractText(node) {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(extractText).join("")
  if (node?.props?.children != null) return extractText(node.props.children)
  return ""
}

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false)

  const codeElement = Array.isArray(children) ? children[0] : children
  const language = /language-(\w+)/.exec(codeElement?.props?.className ?? "")?.[1]
  const codeText = extractText(codeElement)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API unavailable or permission denied — nothing else to do.
    }
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/40 first:mt-0">
      <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5">
        <span className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {language || "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground outline-none transition-colors duration-150 hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[13px] [&>code]:leading-6 [&>code]:text-foreground">
        {children}
      </pre>
    </div>
  )
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }) => <p className="mt-4 leading-7 text-foreground first:mt-0">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mt-6 mb-2 text-lg font-semibold tracking-tight text-foreground first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-2 text-base font-semibold tracking-tight text-foreground first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 mb-1.5 text-[15px] font-semibold text-foreground first:mt-0">{children}</h3>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="text-muted-foreground line-through">{children}</del>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-1.5 pl-5 leading-7 text-foreground marker:text-muted-foreground/60 first:mt-0 [&_ul]:mt-1.5 [&_ol]:mt-1.5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-1.5 pl-5 leading-7 text-foreground marker:font-medium marker:text-muted-foreground/60 first:mt-0 [&_ul]:mt-1.5 [&_ol]:mt-1.5">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  hr: () => <hr className="my-5 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 rounded-r-md border-l-2 border-indigo-300 bg-indigo-50/50 py-2 pr-3 pl-4 leading-7 text-muted-foreground italic first:mt-0">
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
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border first:mt-0">
      <table className="w-full border-collapse text-sm [&_tbody_tr:last-child_td]:border-b-0">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/70 px-3 py-2 align-top text-foreground">{children}</td>
  ),
  // react-markdown no longer tells us whether `code` is inline vs. fenced —
  // fenced code always carries a `language-xxx` className from remark, inline
  // code never does, so that presence is the reliable signal.
  code: ({ className, children, ...props }) => {
    if (!className) {
      return (
        <code
          className="rounded-md border border-indigo-100/70 bg-indigo-50 px-1.5 py-[3px] font-mono text-[13px] text-indigo-700"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  pre: CodeBlock,
}

function MessageMarkdown({ content }) {
  return (
    <div className="text-[15px]">
      <ReactMarkdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
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

      <div className="min-w-0 max-w-[85%] pt-1">
        {message.isError ? (
          <p className="text-[15px] leading-7 text-red-600">{message.content}</p>
        ) : (
          <MessageMarkdown content={message.content} />
        )}

        {message.citations?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
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

const THINKING_PHRASES = [
  "Searching uploaded papers…",
  "Analyzing retrieved evidence…",
  "Synthesizing findings…",
  "Generating grounded answer…",
]

export function TypingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % THINKING_PHRASES.length)
    }, 1600)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div {...ENTER} className="flex items-start gap-3.5">
      <Logo iconOnly className="mt-0.5 shrink-0" />
      <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3.5">
        <motion.span
          className="size-2 shrink-0 rounded-full bg-indigo-500"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={phraseIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn("text-sm text-muted-foreground")}
          >
            {THINKING_PHRASES[phraseIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
