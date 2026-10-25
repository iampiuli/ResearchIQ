import { motion } from "framer-motion"
import { SectionBadge } from "@/components/shared/SectionBadge"
import { Reveal } from "@/components/shared/Reveal"
import { StepCard } from "@/components/sections/StepCard"
import { staggerContainer, viewportOnce } from "@/lib/motion"

const STEPS = [
  {
    number: "i.",
    title: "Gather",
    description: "Create a workspace and add your PDFs. They are read and indexed in the background.",
  },
  {
    number: "ii.",
    title: "Ask",
    description: "Question your papers like a colleague — summarise, compare, or dig into a single method.",
  },
  {
    number: "iii.",
    title: "Verify",
    description: "Each answer lists its sources. Open one and the PDF jumps to the page that was cited.",
  },
  {
    number: "iv.",
    title: "Build",
    description: "Carry the thread forward: follow-up questions, a literature overview, the gaps worth pursuing.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden border-y border-border bg-sidebar/60 py-24 sm:py-32">
      <div aria-hidden="true" className="bg-dots pointer-events-none absolute inset-0 opacity-40" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>How it works</SectionBadge>
          <h2 className="mt-6 text-4xl leading-[1.1] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
            From a folder of PDFs to a clear answer
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
            No setup to speak of. Bring your papers and start asking.
          </p>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.12)}
          className="mt-20 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
