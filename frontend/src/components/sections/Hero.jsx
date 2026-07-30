import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroPreview } from "@/components/sections/HeroPreview"
import { fadeUp, staggerContainer, defaultTransition } from "@/lib/motion"

export function Hero() {
  return (
    <section id="top" className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 xl:grid-cols-[26rem_1fr] xl:gap-16 lg:px-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer(0.12)}
          className="flex flex-col items-start text-left"
        >
          <motion.h1
            variants={fadeUp}
            transition={defaultTransition}
            className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-5xl"
          >
            Research Smarter.
            <br />
            Understand Faster.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={defaultTransition}
            className="mt-6 max-w-md text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Upload research papers, ask questions with AI, compare studies, generate literature
            reviews, and discover research gaps — all in one intelligent workspace.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={defaultTransition}
            className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          >
            <Button size="lg" render={<Link to="/workspace" />} nativeButton={false} className="h-11 gap-2 px-6">
              Get Started
              <ArrowRight data-icon="inline-end" className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link to="/workspace" />}
              nativeButton={false}
              className="h-11 gap-2 px-6"
            >
              <PlayCircle data-icon="inline-start" className="size-4" />
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        <HeroPreview />
      </div>
    </section>
  )
}
