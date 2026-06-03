import Navbar from '@/components/Navbar'
import { colors } from '@/lib/design-tokens'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: colors.bg.base, minHeight: '100vh' }}>
      <Navbar />
      {children}
    </div>
  )
}
