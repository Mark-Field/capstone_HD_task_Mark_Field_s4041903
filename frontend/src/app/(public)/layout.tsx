import { SiteNavbar } from '@/components/layout/SiteNavbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <SiteNavbar />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        RMIT RedbackBots @Home · Humanoid Robot Simulation in VXLab · Capstone Team 78
      </footer>
    </div>
  )
}
