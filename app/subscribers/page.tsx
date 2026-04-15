"use client"

import { useState, useEffect, useRef } from "react"
import { Nav } from "@/components/nav"
import { useTranslations } from "next-intl"
import { useAdaptiveNotifications, NotificationToggle } from "@/components/notification-manager"
import { ArrowLeft, Globe, RefreshCw } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ChannelInfo {
  title: string
  subscriberCount: number
  country?: string
  description?: string
  thumbnailUrl?: string
  channelId?: string
}

// Country code → flag emoji
function countryFlag(code: string): string {
  return code.toUpperCase().split("").map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join("")
}

// Animated number display
function AnimatedCount({ count }: { count: number }) {
  const [display, setDisplay] = useState(count)
  const prevRef = useRef(count)

  useEffect(() => {
    if (count === prevRef.current) return
    const diff = count - prevRef.current
    const steps = Math.min(Math.abs(diff), 20)
    const step = diff / steps
    let current = prevRef.current
    let i = 0
    const interval = setInterval(() => {
      i++
      current += step
      setDisplay(Math.round(current))
      if (i >= steps) {
        setDisplay(count)
        clearInterval(interval)
      }
    }, 50)
    prevRef.current = count
    return () => clearInterval(interval)
  }, [count])

  return (
    <span className="font-mono tabular-nums">
      {display.toLocaleString()}
    </span>
  )
}

export default function SubscribersPage() {
  const t = useTranslations("subscribers")
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [lastGain, setLastGain] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const prevSubsRef = useRef<number | null>(null)

  // Adaptive notifications hook
  useAdaptiveNotifications(
    channelInfo?.subscriberCount ?? 0,
    notifEnabled,
    channelInfo?.title ?? "your channel"
  )

  const fetchStats = async () => {
    const apiKey = localStorage.getItem("mushub_youtube_api_key")
    const handle = localStorage.getItem("mushub_channel_handle")
    if (!apiKey || !handle) { setError("missing_config"); setLoading(false); return }

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`
      )
      const data = await res.json()
      if (!data.items?.length) throw new Error("not_found")

      const item = data.items[0]
      const subs = parseInt(item.statistics.subscriberCount || "0")

      if (prevSubsRef.current !== null && subs > prevSubsRef.current) {
        setLastGain(subs - prevSubsRef.current)
        setTimeout(() => setLastGain(null), 3000)
      }
      prevSubsRef.current = subs

      setChannelInfo({
        title: item.snippet.title,
        subscriberCount: subs,
        country: item.snippet.country,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url,
        channelId: item.id,
      })
      setLoading(false)
    } catch {
      setError("load_failed")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    // Poll every 30s — optimized to avoid quota abuse
    intervalRef.current = setInterval(fetchStats, 30_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12 animate-in fade-in duration-500">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">mushub</h1>
              <p className="text-sm text-muted-foreground">{t("pageTitle")}</p>
            </div>
          </div>
          <Nav />
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
            <p className="text-muted-foreground text-sm">
              {error === "missing_config"
                ? "Set your API key and channel handle in Settings first."
                : "Could not load channel data."}
            </p>
            <button onClick={fetchStats} className="text-accent text-sm hover:underline flex items-center gap-1 mx-auto">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : channelInfo ? (
          <>
            {/* Channel card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-6">
              <div className="flex items-center gap-4">
                {channelInfo.thumbnailUrl && (
                  <img src={channelInfo.thumbnailUrl} alt={channelInfo.title} className="w-16 h-16 rounded-full ring-2 ring-accent/30" />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">{channelInfo.title}</h2>
                  {channelInfo.country && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Globe className="h-3.5 w-3.5" />
                      {countryFlag(channelInfo.country)} {channelInfo.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Live counter */}
              <div className="text-center py-6 space-y-2 relative">
                <p className="text-sm text-muted-foreground">{t("liveCounter")}</p>
                <div className={cn(
                  "text-6xl font-bold text-foreground transition-all duration-300",
                  lastGain && "text-accent scale-110"
                )}>
                  <AnimatedCount count={channelInfo.subscriberCount} />
                </div>
                {lastGain && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <span className="inline-flex items-center gap-1 text-accent font-semibold text-lg">
                      +{lastGain} 🎉
                    </span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{t("apiOptimized")}</p>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("notifications")}</p>
                  <p className="text-xs text-muted-foreground">{t("throttleInfo")}</p>
                </div>
                <NotificationToggle
                  enabled={notifEnabled}
                  onToggle={setNotifEnabled}
                  label={t("notifOff")}
                  labelOn={t("notifOn")}
                  labelDenied={t("notifDenied")}
                />
              </div>
            </div>

            {/* Description */}
            {channelInfo.description && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-medium text-foreground mb-3">{t("description")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-6">
                  {channelInfo.description}
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </main>
  )
}
