import { motion } from "framer-motion"
import { BookOpenText, FileStack, FileText, GitCompare, Library, MessageSquareText, Telescope } from "lucide-react"
import { SectionBadge } from "@/components/shared/SectionBadge"
import { Reveal } from "@/components/shared/Reveal"
import { Wash } from "@/components/shared/Decor"
import { FeatureCard } from "@/components/sections/FeatureCard"
import { staggerContainer, viewportOnce } from "@/lib/motion"

const PAPER_NAMES = ['Attention Is All You Need', 'BERT', 'Few-Shot Learners', 'ResNet', 'Adam']

const VISUALS = {
  0: (
    <div className="flex flex-wrap gap-2">
      {PAPER_NAMES.map((n) => (
        <span key={n} className="inline-flex items-center gap-1.5 rounded-md border border-border-strong/70 bg-background px-2.5 py-1 text-xs font-medium text-ink-soft">
          <FileText className="size-3 text-muted-foreground" /> {n}
        </span>
      ))}
    </div>
  ),
  3: (
    <p className="font-serif text-[15px] leading-relaxed text-ink-soft">
      <span className="text-muted-foreground">1. Background</span> &middot; <span className="text-muted-foreground">2. Methods</span> &middot;{" "}
      <mark className="rounded-[3px] bg-marker px-1 text-foreground">3. Open questions</mark>
    </p>
  ),
  5: (
    <div className="flex gap-2">
      {["Course reading", "Thesis", "Side project"].map((w, i) => (
        <span key={w} className={i === 0 ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground" : "rounded-full border border-border-strong/70 px-3 py-1 text-xs text-ink-soft"}>{w}</span>
      ))}
    </div>
  ),
}

const SPAN = { 0: "lg:col-span-2", 3: "lg:col-span-2", 5: "lg:col-span-2" }

const FEATURES = [
  {
    icon: FileStack,
    title: "Many papers, one place",
    description:
      "Add several PDFs at once. Each is read, indexed, and kept ready to question — duplicates are recognised so nothing is processed twice.",
  },
  {
    icon: MessageSquareText,
    title: "Answers with sources",
    description:
      "Ask in plain language. Every answer comes with the papers and pages it was drawn from, one click away from the original text.",
  },
  {
    icon: GitCompare,
    title: "Compare across papers",
    description:
      "Questions that span your whole set — methods, datasets, results — draw on every paper in the workspace, not just the loudest match.",
  },
  {
    icon: BookOpenText,
    title: "Draft a literature review",
    description:
      "Turn a stack of papers into a structured overview you can build on, instead of starting from a blank page.",
  },
  {
    icon: Telescope,
    title: "Spot the gaps",
    description:
      "Ask what a body of work leaves unanswered, and where the papers disagree or stop short.",
  },
  {
    icon: Library,
    title: "Workspaces for each thread",
    description:
      "Keep a project, a course, or a question together — its own papers and its own conversation, separate from the rest.",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <Wash tone="moss" className="top-20 -right-40 size-[26rem]" />
      <Wash tone="marker" className="bottom-10 -left-40 size-[22rem]" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionBadge>Features</SectionBadge>
          <h2 className="mt-6 text-4xl leading-[1.1] font-medium tracking-[-0.02em] text-balance sm:text-5xl">
            Everything a careful reader needs
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
            The heavy lifting of finding, comparing, and citing is handled — so your attention stays on the ideas.
          </p>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={staggerContainer(0.08)}
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className={SPAN[i]}
            >
              {VISUALS[i]}
            </FeatureCard>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
