import { motion } from "framer-motion"
import { fadeUp, defaultTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function FeatureCard({ icon: Icon, title, description, className, children }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={defaultTransition}
      className={cn(
        "group flex flex-col rounded-2xl border border-border-strong/60 bg-paper p-6 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-float)] sm:p-7",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-[19px]" strokeWidth={1.5} />
      </span>
      <h3 className="mt-5 text-[1.35rem] leading-snug font-medium tracking-tight text-foreground">{title}</h3>
      <p className="mt-2.5 max-w-md text-[14.5px] leading-relaxed text-muted-foreground">{description}</p>
      {children && <div className="mt-6 flex-1 border-t border-border pt-5">{children}</div>}
    </motion.div>
  )
}
