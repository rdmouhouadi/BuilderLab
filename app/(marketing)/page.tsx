// app/(marketing)/page.tsx
import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/next"
import PageTransition from '@/components/PageTransition'
import Hero from '@/components/marketing/home/Hero'
import Strip from '@/components/marketing/home/Strip'
import Problem from '@/components/marketing/home/Problem'
import HowItWorks from '@/components/marketing/home/HowItWorks'
import Ecosystem from '@/components/marketing/home/Ecosystem'
import BuildInPublic from '@/components/marketing/home/BuildInPublic'
import FinalCTA from '@/components/marketing/home/FinalCTA'

export const metadata: Metadata = {
  title: 'BuilderLab — Build real projects, with a real team',
  description:
    'BuilderLab is where solo learners become teams. Post an idea, form a cross-functional crew, and build portfolio-worthy projects with structured peer review.',
}

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <Strip />
      <Problem />
      <HowItWorks />
      <Ecosystem />
      <BuildInPublic />
      <FinalCTA />
      <Analytics />
    </PageTransition>
  )
}