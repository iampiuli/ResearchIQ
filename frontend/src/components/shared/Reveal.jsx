import { motion } from "framer-motion"
import { fadeUp, defaultTransition, viewportOnce } from "@/lib/motion"

/** Consistent fade-up scroll reveal used across sections. */
export function Reveal({ children, delay = 0, className, variants = fadeUp, ...props }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={variants}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
