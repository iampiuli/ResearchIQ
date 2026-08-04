import { motion } from "framer-motion"
import { fadeUp, defaultTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function FeatureCard({ icon: Icon, title, description, className }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={defaultTransition}
      whileHover={{ y: -3 }}
      className={cn(
        "group flex flex-col gap-4 rounded-2xl border border-border bg-white p-7 transition-all duration-200 hover:border-gray-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 transition-colors duration-200 group-hover:bg-indigo-100">
        <Icon className="size-5 text-indigo-600" strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
