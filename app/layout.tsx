// app/layout.tsx
// Le layout est le "cadre" commun à toutes les pages
// Tout ce qu'on met ici apparaît sur chaque page de l'app
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BuilderLab',
  description: 'Trouve des collaborateurs pour tes projets étudiants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body
        className={inter.className}
        // Fond sombre sur toute l'app
        style={{ backgroundColor: '#0F1117', minHeight: '100vh' }}
      >
        {/* Navbar présente sur toutes les pages */}
        <Navbar />

        {/* children = le contenu de chaque page */}
        {children}
      </body>
    </html>
  )
}