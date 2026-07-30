import { motion } from "framer-motion"
import { fadeUp, defaultTransition } from "@/lib/motion"

export function StepCard({ number, icon: Icon, title, description }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={defaultTransition}
      whileHover={{ y: -3 }}
      className="flex flex-1 flex-col gap-4 rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
          <Icon className="size-5 text-indigo-600" strokeWidth={1.5} />
        </div>
        <span className="text-3xl font-semibold text-gray-100">{number}</span>
      </div>
      <div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  )
}
