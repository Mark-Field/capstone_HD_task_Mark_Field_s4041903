'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/showcase/walk-demo', label: 'Walk Demo' },
] as const

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function SiteNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/75 backdrop-blur-md">
      <div className="h-0.5 bg-gradient-to-r from-transparent via-brand to-transparent" />
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/assets/%5BRBB%5D%20-%20Landscape%20Primary.png"
            alt="RMIT RedbackBots"
            width={1890}
            height={760}
            priority
            className="h-9 w-auto"
          />
          <span className="hidden border-l border-white/15 pl-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:block">
            @Home
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {label}
                  {active && (
                    <span className="absolute inset-x-4 -bottom-[13px] h-0.5 rounded-full bg-brand" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="hidden md:block">
          <Link
            href="/auth/signin"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-brand hover:text-white"
          >
            Team sign in
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <ul id="mobile-nav" className="space-y-1 border-t border-white/10 px-4 py-3 md:hidden">
          {[...NAV_LINKS, { href: '/auth/signin', label: 'Team sign in' }].map(({ href, label }) => {
            const active = isActive(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'block rounded-lg px-3 py-2.5 text-sm font-medium',
                    active
                      ? 'border-l-2 border-brand bg-white/10 text-white'
                      : 'text-zinc-300 hover:bg-white/5',
                  )}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </header>
  )
}
