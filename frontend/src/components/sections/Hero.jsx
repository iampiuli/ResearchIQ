import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScribbleUnderline, Sparkle, Wash } from "@/components/shared/Decor"
import { HeroPreview } from "@/components/sections/HeroPreview"
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/motion"

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      {/* A faint pool of warm light — the only decoration on the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(255_253_246/0.95),transparent)]"
      />
      <Wash tone="moss" className="-top-24 -left-32 size-[28rem]" />
      <Wash tone="marker" className="top-40 -right-40 size-[26rem]" />
      <Sparkle className="top-40 left-[12%] hidden size-5 text-primary/50 lg:block" />
      <Sparkle className="top-64 right-[14%] hidden size-3.5 text-marker-foreground/50 lg:block" />
      <Sparkle className="top-28 right-[24%] hidden size-2.5 text-primary/40 lg:block" />
      <div aria-hidden="true" className="bg-dots pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] opacity-70" />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer(0.12)}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.p variants={fadeUp} transition={defaultTransition} className="eyebrow">
            An AI reading room for research
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={defaultTransition}
            className="mt-6 text-[2.75rem] leading-[1.06] font-medium tracking-[-0.025em] text-balance text-foreground sm:text-6xl lg:text-[4.25rem]"
          >
            Read deeply.
            <br />
            <span className="relative inline-block text-primary italic">
              Understand faster.
              <ScribbleUnderline />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={defaultTransition}
            className="mt-7 max-w-xl text-base leading-relaxed text-balance text-muted-foreground sm:text-lg"
          >
            Gather your papers in one calm place, ask questions in plain language, and get answers that point back to
            the exact page they came from.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={defaultTransition}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button size="lg" render={<Link to="/workspace" />} nativeButton={false}>
              Open your workspace
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button size="lg" variant="ghost" render={<a href="#how-it-works" />} nativeButton={false}>
              See how it works
            </Button>
          </motion.div>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground"
        >
          {["Add several PDFs at once", "Answers list their sources", "Workspaces stay in your browser"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="size-3.5 text-primary" strokeWidth={2} />
              {t}
            </li>
          ))}
        </motion.ul>

        <div className="mt-16 sm:mt-20">
          <HeroPreview />
        </div>
      </div>
    </section>
  )
}
