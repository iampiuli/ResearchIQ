import { motion } from "framer-motion"
import { fadeUp, defaultTransition } from "@/lib/motion"

export function StepCard({ number, title, description }) {
  return (
    <motion.div variants={fadeUp} transition={defaultTransition} className="relative flex flex-col">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border-strong bg-paper font-serif text-xl text-primary italic shadow-[var(--shadow-page)]">
          {number}
        </span>
        <span className="h-px flex-1 border-t border-dashed border-border-strong" />
      </div>
      <h3 className="mt-6 text-[1.3rem] leading-snug font-medium tracking-tight text-foreground">{title}</h3>
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  )
}
