import { Quote } from "lucide-react"

const QUESTIONS = [
  "What datasets do these papers evaluate on?",
  "Where do the authors disagree about scaling?",
  "Summarise the methodology of the second paper",
  "Which limitations come up more than once?",
  "Compare the loss functions across all three",
  "What future work do they suggest?",
  "Draft a short literature overview",
  "What is left unanswered in this area?",
]

/** A slow ticker of example questions: shows what the product is for without a word of marketing. */
export function QuestionStrip() {
  const items = [...QUESTIONS, ...QUESTIONS]
  return (
    <section aria-label="Example questions" className="border-y border-border bg-sidebar/50 py-5">
      <p className="eyebrow mb-4 text-center">Ask it things like</p>
      <div className="marquee relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <ul className="animate-marquee flex w-max gap-3">
          {items.map((q, i) => (
            <li
              key={i}
              aria-hidden={i >= QUESTIONS.length}
              className="flex items-center gap-2 rounded-full border border-border-strong/70 bg-paper px-4 py-2 font-serif text-[15px] whitespace-nowrap text-ink-soft"
            >
              <Quote className="size-3 text-primary" strokeWidth={2} />
              {q}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
