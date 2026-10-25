import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Check, Copy } from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { CitationChip } from "@/components/workspace/CitationChip"

// Quick fade + slight upward settle — not a simulated typing effect, just a
// snappy arrival so the message doesn't feel like it's popping in.
const ENTER = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
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
    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-secondary/60 font-sans first:mt-0">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {language || "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-paper hover:text-foreground"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 [&>code]:bg-transparent [&>code]:p-0 [&>code]:font-mono [&>code]:text-[13px] [&>code]:leading-6 [&>code]:text-foreground">
        {children}
      </pre>
    </div>
  )
}

const MARKDOWN_COMPONENTS = {
  p: ({ children }) => <p className="mt-5 first:mt-0">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mt-9 mb-3 text-[1.55rem] leading-snug font-medium tracking-tight text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-2.5 text-[1.3rem] leading-snug font-medium tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-7 mb-2 text-[1.1rem] leading-snug font-semibold text-foreground first:mt-0">{children}</h3>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="text-muted-foreground line-through">{children}</del>,
  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 marker:text-border-strong first:mt-0 [&_ul]:mt-2 [&_ol]:mt-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 marker:text-muted-foreground first:mt-0 [&_ul]:mt-2 [&_ol]:mt-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  hr: () => <hr className="my-8 border-border" />,
  blockquote: ({ children }) => (
    <blockquote className="mt-5 border-l-2 border-primary/40 py-0.5 pl-5 text-muted-foreground italic first:mt-0">
      {children}
    </blockquote>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-paper font-sans first:mt-0">
      <table className="w-full border-collapse text-[13.5px] leading-6 [&_tbody_tr:last-child_td]:border-b-0">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-secondary/60">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="eyebrow border-b border-border px-3.5 py-2.5 text-left !text-[10.5px] text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/70 px-3.5 py-2.5 align-top text-ink-soft">{children}</td>
  ),
  // react-markdown no longer tells us whether `code` is inline vs. fenced —
  // fenced code always carries a `language-xxx` className from remark, inline
  // code never does, so that presence is the reliable signal.
  code: ({ className, children, ...props }) => {
    if (!className) {
      return (
        <code
          className="rounded-[5px] bg-secondary px-1.5 py-[2px] font-mono text-[0.82em] text-foreground"
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
    <div className="font-serif text-[1.0625rem] leading-[1.8] text-ink-soft">
      <ReactMarkdown components={MARKDOWN_COMPONENTS} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

function AssistantLabel() {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Logo iconOnly className="size-5" />
      <span className="eyebrow">ResearchIQ</span>
    </div>
  )
}

export function ChatMessage({ message, onCitationClick }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <motion.div {...ENTER} className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-secondary px-4 py-3 text-[15px] leading-relaxed text-foreground">
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div {...ENTER}>
      <AssistantLabel />

      <div className="min-w-0">
        {message.isError ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
            {message.content}
          </p>
        ) : (
          <MessageMarkdown content={message.content} />
        )}

        {message.citations?.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="eyebrow mb-2.5">Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((citation) => (
                <CitationChip
                  key={`${citation.paperId}-${citation.page}`}
                  title={citation.paperTitle}
                  page={citation.page}
                  onClick={() => onCitationClick?.(citation)}
                />
              ))}
            </div>
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
    <motion.div {...ENTER}>
      <AssistantLabel />
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-primary/60"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
            />
          ))}
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={phraseIndex}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="font-serif text-[15px] text-muted-foreground italic"
          >
            {THINKING_PHRASES[phraseIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
