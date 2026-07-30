import { motion } from "framer-motion"
import { MessageCircleQuestion, Quote, Share2, Upload } from "lucide-react"
import { SectionBadge } from "@/components/shared/SectionBadge"
import { Reveal } from "@/components/shared/Reveal"
import { StepCard } from "@/components/sections/StepCard"
import { staggerContainer, viewportOnce } from "@/lib/motion"

const STEPS = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Papers",
    description:
      "Drag in PDFs from your desktop or reference manager. ResearchIQ parses text, figures, and citations automatically.",
  },
  {
    number: "02",
    icon: MessageCircleQuestion,
    title: "Ask Questions",
    description:
      "Chat with your papers like you would a colleague — summarize sections, compare findings, or dig into methodology.",
  },
  {
    number: "03",
    icon: Quote,
    title: "Get Cited Answers",
    description:
      "Every answer links back to the exact page and passage it came from, so you can verify and cite with confidence.",
  },
  {
    number: "04",
    icon: Share2,
    title: "Export & Share",
    description:
      "Turn your findings into a polished literature review or citation list, ready to export or share with your team.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>How it Works</SectionBadge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From PDFs to answers in four steps
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            No complicated setup — bring your papers and start asking questions right away.
          </p>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.15)}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
