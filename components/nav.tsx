"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Lightbulb, Youtube, Image, Settings, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"

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
  const { user, signOut } = useAuth()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200",
              isActive
                ? "bg-secondary text-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t(item.key)}</span>
          </Link>
        )
      })}
      {user && (
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
          {user.photoURL && (
            <img src={user.photoURL} alt={user.displayName || ""} className="w-7 h-7 rounded-full" />
          )}
          <button
            onClick={signOut}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title={t("nav.signOut")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  )
}
