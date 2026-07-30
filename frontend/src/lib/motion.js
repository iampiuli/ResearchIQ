export const defaultTransition = { duration: 0.6, ease: [0.16, 1, 0.3, 1] }

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}

export const staggerContainer = (stagger = 0.12, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
})

export const viewportOnce = { once: true, margin: "-80px" }
