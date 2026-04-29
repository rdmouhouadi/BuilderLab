// components/PageTransition.tsx
// Ce composant enveloppe chaque page pour lui donner
// une animation d'entrée et de sortie fluide
'use client'

import { motion } from 'framer-motion'

export default function PageTransition({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      // État initial — page invisible et légèrement en bas
      initial={{ opacity: 0, y: 12 }}
      // État final — page visible à sa position normale
      animate={{ opacity: 1, y: 0 }}
      // Animation de sortie — page disparaît vers le haut
      exit={{ opacity: 0, y: -8 }}
      // Durée et courbe d'animation
      // ease: 'easeOut' = démarre vite, ralentit à la fin
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}