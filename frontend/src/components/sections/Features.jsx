import { motion } from "framer-motion"
import { BookOpenText, FileStack, GitCompare, Library, MessageSquareText, Telescope } from "lucide-react"
import { SectionBadge } from "@/components/shared/SectionBadge"
import { Reveal } from "@/components/shared/Reveal"
import { FeatureCard } from "@/components/sections/FeatureCard"
import { staggerContainer, viewportOnce } from "@/lib/motion"

const FEATURES = [
  {
    icon: FileStack,
    title: "Multi-PDF Analysis",
    description:
      "Upload dozens of papers at once. ResearchIQ parses text, figures, and references and indexes them for instant recall.",
  },
  {
    icon: MessageSquareText,
    title: "AI Chat with Citations",
    description:
      "Ask questions in plain language and get answers grounded in your papers, with inline citations back to the exact passage.",
  },
  {
    icon: GitCompare,
    title: "Paper Comparison",
    description:
      "Compare methodology, datasets, and results across multiple papers side by side to spot agreements and contradictions.",
  },
  {
    icon: BookOpenText,
    title: "Literature Review Generation",
    description:
      "Turn a stack of PDFs into a structured, well-cited literature review draft in minutes instead of weeks.",
  },
  {
    icon: Telescope,
    title: "Research Gap Discovery",
    description:
      "Surface open questions and under-explored areas by analyzing what your papers cover — and what they leave out.",
  },
  {
    icon: Library,
    title: "Collections & Organization",
    description:
      "Group papers into collections by project, topic, or course, and find anything instantly with full-text search.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>Features</SectionBadge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything you need to move from papers to insight
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            ResearchIQ handles the heavy lifting of reading, comparing, and citing research so you
            can spend your time on the ideas that matter.
          </p>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
