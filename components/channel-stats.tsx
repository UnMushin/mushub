"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Users, Eye, PlayCircle, Settings, X, Check, TrendingUp, RefreshCw, LogIn, LogOut, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { DisconnectModal } from "@/components/disconnect-modal"
import Link from "next/link"
import { useRouter } from "next/navigation"

function checkEasterEgg(raw: string): "67" | "69" | "213" | null {
  if (raw.includes("213")) return "213"
  if (raw.includes("67")) return "67"
  if (raw.includes("69")) return "69"
  return null
}

function AlgerianFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 900 600" className={className}>
      <rect width="450" height="600" fill="#006233"/>
      <rect x="450" width="450" height="600" fill="#fff"/>
      <circle cx="450" cy="300" r="150" fill="#d21034"/>
      <circle cx="490" cy="300" r="120" fill="#fff"/>
      <polygon points="450,180 480,270 560,270 495,320 520,400 450,355 380,400 405,320 340,270 420,270" fill="#d21034"/>
    </svg>
  )
}

function StatCard({ value, label, icon: Icon, clickable, href }: {
  value: string; label: string
  icon: React.ComponentType<{className?: string}>
  clickable?: boolean; href?: string
}) {
  const [showFlag, setShowFlag] = useState(false)
  const [niceText, setNiceText] = useState(false)
  const egg = checkEasterEgg(value.replace(/[^0-9]/g, ""))
  const prevEgg = useRef<string | null>(null)

  useEffect(() => {
    if (egg === prevEgg.current) return
    prevEgg.current = egg
    if (egg === "67") { try { new Audio("https://www.myinstants.com/media/sounds/qlf.mp3").play().catch(() => {}) } catch {} }
    else if (egg === "69") { setNiceText(true); try { new Audio("https://www.myinstants.com/media/sounds/nice.mp3").play().catch(() => {}) } catch {}; setTimeout(() => setNiceText(false), 3000) }
    else if (egg === "213") { setShowFlag(true); setTimeout(() => setShowFlag(false), 3500) }
  }, [egg])

  const inner = (
    <div className={`flex flex-col items-center gap-1 rounded-lg bg-secondary/50 p-3 relative overflow-visible ${clickable ? "cursor-pointer hover:bg-secondary hover:border-accent/30 transition-colors border border-transparent" : ""}`}>
      <Icon className="h-5 w-5 text-accent" />
      <span className="text-lg font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
      {niceText && <span className="text-xs text-accent font-bold animate-pulse absolute -bottom-5">nice 👌</span>}
      {showFlag && <div className="absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce z-50"><AlgerianFlag className="w-14 h-9 rounded" /></div>}
    </div>
  )

  if (clickable && href) return <Link href={href}>{inner}</Link>
  return inner
}

interface ChannelData {
  subscriberCount: string; viewCount: string; videoCount: string
  title: string; thumbnailUrl?: string; channelId?: string
  rawSubs: string; rawViews: string; rawVideos: string
}

interface AnalyticsData {
  views30d: number; netSubs: number; subsGained: number; watchMinutes: number
}

interface ChannelStatsProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export function ChannelStats({ apiKey, onApiKeyChange }: ChannelStatsProps) {
  const t = useTranslations()
  const router = useRouter()
  const [channelData, setChannelData] = useState<ChannelData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isOAuthConnected, setIsOAuthConnected] = useState(false)
  const [isSettingKey, setIsSettingKey] = useState(false)
  const [tempKey, setTempKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  const fmt = (n: string | number): string => {
    const num = typeof n === "string" ? parseInt(n) : n
    if (isNaN(num)) return "0"
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K"
    return String(num)
  }

  const checkAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/youtube-analytics")
      if (res.ok) { setAnalyticsData(await res.json()); setIsOAuthConnected(true) }
      else setIsOAuthConnected(false)
    } catch { setIsOAuthConnected(false) }
  }, [])

  const fetchChannelStats = useCallback(async (key: string) => {
    if (!key) return
    setLoading(true); setError("")
    try {
      const handle = localStorage.getItem("mushub_channel_handle") || ""
      if (!handle) throw new Error("no_handle")
      const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&forHandle=${encodeURIComponent(handle)}&key=${key}`)
      const data = await res.json()
      if (!data.items?.length) throw new Error("channel_not_found")
      const item = data.items[0]
      const stats = item.statistics
      const snippet = item.snippet
      setChannelData({
        subscriberCount: fmt(stats.subscriberCount || "0"),
        viewCount: fmt(stats.viewCount || "0"),
        videoCount: stats.videoCount || "0",
        title: snippet.title,
        thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
        channelId: item.id,
        rawSubs: stats.subscriberCount || "0",
        rawViews: stats.viewCount || "0",
        rawVideos: stats.videoCount || "0",
      })
      setLastFetch(new Date())
    } catch (err: any) {
      setError(err?.message === "channel_not_found" || err?.message === "no_handle"
        ? t("stats.channelNotFound") : t("stats.apiError"))
    } finally { setLoading(false) }
  }, [t])

  useEffect(() => {
    if (apiKey) fetchChannelStats(apiKey)
    checkAnalytics()
    const params = new URLSearchParams(window.location.search)
    if (params.get("oauth_success")) { checkAnalytics(); window.history.replaceState({}, "", "/") }
  }, [apiKey, fetchChannelStats, checkAnalytics])

  const handleSaveKey = () => {
    if (tempKey.trim()) { onApiKeyChange(tempKey.trim()); setIsSettingKey(false); setTempKey("") }
  }

  const handleDisconnectConfirm = async () => {
    await fetch("/api/youtube-auth/logout", { method: "POST" }).catch(() => {})
    setIsOAuthConnected(false); setAnalyticsData(null); setShowDisconnectModal(false)
  }

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <Settings className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{t("stats.connectYouTube")}</p>
          <p className="text-xs text-muted-foreground">
            {t("stats.addApiKey")} — <Link href="/settings" className="text-accent hover:underline">Settings</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DisconnectModal
        open={showDisconnectModal}
        onConfirm={handleDisconnectConfirm}
        onCancel={() => setShowDisconnectModal(false)}
      />

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {channelData?.thumbnailUrl && (
              <img src={channelData.thumbnailUrl} alt={channelData.title} className="w-10 h-10 rounded-full ring-2 ring-accent/30" />
            )}
            <div>
              <h2 className="text-base font-medium text-foreground">{channelData?.title || "Channel Stats"}</h2>
              {lastFetch && <p className="text-xs text-muted-foreground">{t("stats.updated")} {lastFetch.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {channelData?.channelId && (
              <a href={`https://studio.youtube.com/channel/${channelData.channelId}/analytics/tab-overview/period-default`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <TrendingUp className="h-3 w-3" />{t("stats.studioAnalytics")}
                </Button>
              </a>
            )}
            <Button
              size="sm"
              variant={isOAuthConnected ? "outline" : "default"}
              className={`gap-1.5 text-xs ${!isOAuthConnected ? "bg-accent hover:bg-accent/80 text-accent-foreground" : ""}`}
              onClick={isOAuthConnected ? () => setShowDisconnectModal(true) : () => window.location.href = "/api/youtube-auth"}
            >
              {isOAuthConnected ? <><LogOut className="h-3 w-3" />{t("stats.analyticsOn")}</> : <><LogIn className="h-3 w-3" />{t("stats.connectAnalytics")}</>}
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={() => { fetchChannelStats(apiKey); checkAnalytics() }}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-accent" onClick={() => setIsSettingKey(!isSettingKey)}>
              {isSettingKey ? <X className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isSettingKey ? (
          <div className="space-y-3">
            <Input value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="New API Key" className="bg-secondary border-border text-sm" />
            <ChannelHandleInput onSave={() => fetchChannelStats(apiKey)} />
            <Button onClick={handleSaveKey} size="sm" className="w-full bg-accent hover:bg-accent/80 text-accent-foreground">Update Key</Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">{error}</p>
            <ChannelHandleInput onSave={() => fetchChannelStats(apiKey)} />
          </div>
        ) : channelData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {/* Subs are clickable → /subscribers page */}
              <StatCard value={channelData.rawSubs} label={t("stats.subscribers")} icon={Users} clickable href="/subscribers" />
              <StatCard value={channelData.rawViews} label={t("stats.totalViews")} icon={Eye} />
              <StatCard value={channelData.rawVideos} label={t("stats.videos")} icon={PlayCircle} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 p-3">
                <TrendingUp className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{analyticsData ? `+${fmt(analyticsData.views30d)}` : "—"}</p>
                  <p className="text-xs text-muted-foreground">{t("stats.views30d")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 p-3">
                <Users className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{analyticsData ? `+${fmt(analyticsData.netSubs)}` : "—"}</p>
                  <p className="text-xs text-muted-foreground">{t("stats.subs30d")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 p-3">
                <Clock className="h-4 w-4 text-accent shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{analyticsData ? `${fmt(Math.round(analyticsData.watchMinutes / 60))}h` : "—"}</p>
                  <p className="text-xs text-muted-foreground">{t("stats.watchTime")}</p>
                </div>
              </div>
            </div>
            {!isOAuthConnected && (
              <p className="text-xs text-muted-foreground text-center">
                {t("stats.realStats")}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </>
  )
}

function ChannelHandleInput({ onSave }: { onSave: () => void }) {
  const [handle, setHandle] = useState("")
  useEffect(() => { const s = localStorage.getItem("mushub_channel_handle"); if (s) setHandle(s) }, [])
  const save = () => { localStorage.setItem("mushub_channel_handle", handle); onSave() }
  return (
    <div className="flex gap-2">
      <Input value={handle} onChange={e => setHandle(e.target.value)} onKeyDown={e => e.key === "Enter" && save()} placeholder="@YourChannelHandle" className="bg-secondary border-border text-sm flex-1" />
      <Button onClick={save} size="icon" variant="ghost" className="h-9 w-9 text-accent hover:bg-secondary"><Check className="h-4 w-4" /></Button>
    </div>
  )
}
