"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, Heart, Sparkles, Code2, LogIn, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Nav } from "@/components/nav"
import { useSettings, accentColors, AccentColor, Language } from "@/lib/settings-context"
import { useAuth } from "@/lib/auth-context"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

const BUILD_VERSION = "2.0.0"
const BUILD_NAME = "Aurora"

const languages: { code: Language; flag: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
]

function useKonamiCode(callback: () => void) {
  useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]
    let idx = 0
    const handler = (e: KeyboardEvent) => {
      if (e.key === seq[idx]) { idx++; if (idx === seq.length) { callback(); idx = 0 } }
      else idx = 0
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [callback])
}

export default function SettingsPage() {
  const t = useTranslations()
  const { settings, updateAccentColor, updateLanguage } = useSettings()
  const { user, signIn, signOut } = useAuth()
  const [apiKey, setApiKey] = useState("")
  const [channelHandle, setChannelHandle] = useState("")
  const [saved, setSaved] = useState(false)
  const [easterEgg, setEasterEgg] = useState(false)
  const [clickCount, setClickCount] = useState(0)

  useKonamiCode(useCallback(() => {
    setEasterEgg(true)
    document.body.style.animation = "rainbow 2s linear infinite"
    setTimeout(() => { setEasterEgg(false); document.body.style.animation = "" }, 5000)
  }, []))

  useEffect(() => {
    setApiKey(localStorage.getItem("mushub_youtube_api_key") || "")
    setChannelHandle(localStorage.getItem("mushub_channel_handle") || "")
    const style = document.createElement("style")
    style.textContent = `
      @keyframes confettiFall { to { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
      @keyframes rainbow { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  const handleSave = () => {
    localStorage.setItem("mushub_youtube_api_key", apiKey)
    localStorage.setItem("mushub_channel_handle", channelHandle)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoClick = () => {
    setClickCount(p => {
      const next = p + 1
      if (next >= 7) {
        const colors = ["#ff0","#0ff","#f0f","#0f0","#f00"]
        for (let i = 0; i < 50; i++) {
          const el = document.createElement("div")
          el.style.cssText = `position:fixed;width:10px;height:10px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}vw;top:-10px;border-radius:50%;pointer-events:none;z-index:9999;animation:confettiFall ${2+Math.random()*2}s linear forwards`
          document.body.appendChild(el)
          setTimeout(() => el.remove(), 4000)
        }
        return 0
      }
      return next
    })
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12 animate-in fade-in duration-500">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("settings.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
          <Nav />
        </header>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Account */}
          <section className="md:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-medium text-foreground">{t("settings.account")}</h2>
            </div>
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.photoURL && <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full ring-2 ring-accent/30" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-accent mt-0.5">☁️ {t("settings.dataSync")}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="gap-2 text-xs">
                  <LogOut className="h-3.5 w-3.5" />{t("nav.signOut")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t("settings.notSignedIn")}</p>
                <Button onClick={signIn} className="gap-2 text-sm bg-accent hover:bg-accent/80 text-accent-foreground">
                  <LogIn className="h-4 w-4" />{t("auth.signInButton")}
                </Button>
              </div>
            )}
          </section>

          {/* Appearance */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-medium text-foreground">{t("settings.appearance")}</h2>
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">{t("settings.accentColor")}</Label>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(accentColors) as AccentColor[]).map(color => (
                  <button
                    key={color}
                    onClick={() => updateAccentColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-xl transition-all duration-200 hover:scale-110 flex items-center justify-center",
                      settings.accentColor === color && "ring-2 ring-offset-2 ring-offset-background"
                    )}
                    style={{ background: `oklch(0.65 0.18 ${accentColors[color].hue})` }}
                  >
                    {settings.accentColor === color && <Check className="h-5 w-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">{t("settings.language")}</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => updateLanguage(lang.code)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm",
                      settings.language === lang.code
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border bg-secondary/50 text-muted-foreground hover:border-accent/50"
                    )}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* API Settings */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-medium text-foreground">{t("settings.api")}</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t("settings.youtubeApiKey")}</Label>
                <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIza..." className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t("settings.channelHandle")}</Label>
                <Input value={channelHandle} onChange={e => setChannelHandle(e.target.value)} placeholder="@YourChannel" className="bg-secondary border-border" />
              </div>
              <Button onClick={handleSave} className="w-full bg-accent hover:bg-accent/80 text-accent-foreground">
                {saved ? <><Check className="h-4 w-4 mr-2" />{t("settings.saved")}</> : t("settings.save")}
              </Button>
            </div>
          </section>

          {/* About */}
          <section className="md:col-span-2 rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <button onClick={handleLogoClick} className="text-4xl font-bold text-foreground tracking-tight cursor-pointer select-none transition-transform hover:scale-105">
                mushub
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t("settings.version")}</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-xs font-medium">{BUILD_VERSION}</span>
                <span className="text-accent font-medium">{BUILD_NAME}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t("settings.madeWith")}</span>
                <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                <span className="font-medium text-foreground">UnMushin</span>
              </div>
              {easterEgg && <p className="text-xs text-accent animate-pulse">You found a secret! 🎉</p>}
              <p className="text-xs text-muted-foreground/50 mt-2">Hint: Konami code or click logo 7 times...</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
