// components/PageTransition.tsx
// Wraps a page in a Framer Motion animation so it fades in smoothly on load.
'use client'

import { motion } from 'framer-motion'

export default function PageTransition({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      // Start invisible and slightly below its final position
      initial={{ opacity: 0, y: 12 }}
      // Animate to fully visible at normal position
      animate={{ opacity: 1, y: 0 }}
      // Fade out and slide up when leaving
      exit={{ opacity: 0, y: -8 }}
      // easeOut = starts fast, slows down at the end (feels natural)
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
