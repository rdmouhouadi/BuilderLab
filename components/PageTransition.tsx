// components/PageTransition.tsx
// This component wraps each page to give it a smooth entry and exit animation
// a smooth entry and exit animation
'use client'

import { motion } from 'framer-motion'

export default function PageTransition({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      // État initial — page invisible et légèrement en bas Initial State - page invisible and slightly down
      initial={{ opacity: 0, y: 12 }}
      // Final State - page visible at its normal position
      animate={{ opacity: 1, y: 0 }}
      // Exit Animation - page disappears upwards
      exit={{ opacity: 0, y: -8 }}
      // Duration and easing of the animation
      // ease: 'easeOut' = starts fast, slows down at the end
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}