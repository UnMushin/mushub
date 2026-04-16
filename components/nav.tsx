"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Lightbulb, Youtube, Image, Settings, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { DisconnectModal } from "@/components/disconnect-modal"
import { useState } from "react"

const navItems = [
  { href: "/", icon: Home, key: "nav.hub" },
  { href: "/ideas", icon: Lightbulb, key: "nav.ideas" },
  { href: "/youtube", icon: Youtube, key: "nav.youtube" },
  { href: "/thumbnails", icon: Image, key: "nav.thumbnails" },
  { href: "/settings", icon: Settings, key: "nav.settings" },
]

export function Nav() {
  const pathname = usePathname()
  const t = useTranslations()
  const { user, signOut, showSignOutWarning, setShowSignOutWarning } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Sign-out warning modal */}
      <DisconnectModal
        open={showSignOutWarning}
        title={t("auth.signOutConfirm")}
        message={t("auth.signOutDesc")}
        onConfirm={signOut}
        onCancel={() => setShowSignOutWarning(false)}
        confirmLabel={t("auth.confirm")}
        cancelLabel={t("auth.cancel")}
        variant="warning"
      />

      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                isActive ? "bg-secondary text-accent" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{t(item.key)}</span>
            </Link>
          )
        })}
        {user && (
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-border">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-1 ring-border" />
            )}
            <button
              onClick={() => setShowSignOutWarning(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              title={t("nav.signOut")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </nav>

      {/* Mobile nav - hamburger */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {mobileOpen && (
          <div className="absolute top-16 right-2 z-50 bg-card border border-border rounded-xl shadow-xl p-2 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive ? "bg-accent/10 text-accent" : "text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.key)}
                </Link>
              )
            })}
            {user && (
              <>
                <div className="my-1 border-t border-border" />
                <div className="flex items-center gap-2 px-3 py-2">
                  {user.photoURL && <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />}
                  <span className="text-xs text-muted-foreground truncate flex-1">{user.displayName}</span>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); setShowSignOutWarning(true) }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.signOut")}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
