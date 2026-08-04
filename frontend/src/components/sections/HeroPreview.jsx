import { motion } from "framer-motion"

export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="surface-strong mx-auto w-full overflow-hidden rounded-2xl"
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="size-2.5 rounded-full bg-gray-200" />
        <span className="ml-3 text-xs text-muted-foreground">researchiq.app/workspace</span>
      </div>

      <img
        src="/screenshots/workspace.webp"
        alt="The ResearchIQ workspace, showing the paper library sidebar, an AI chat answer with citation chips, and the PDF viewer open side by side"
        className="block w-full h-auto"
        width={1680}
        height={880}
      />
    </motion.div>
  )
}
