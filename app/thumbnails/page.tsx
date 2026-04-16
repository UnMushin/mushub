"use client"

import { useState, useEffect, useRef } from "react"
import { Monitor, Smartphone, Tablet, Tv, Eye, EyeOff, Upload, X, Plus, Shuffle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Nav } from "@/components/nav"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

type Device = "phone" | "tablet" | "pc" | "tv"

interface ComparisonThumbnail {
  id: string
  url: string
  hqUrl: string
  title: string
  channel: string
  views: string
  niche: string
}

// Real YouTube video IDs from top creators
// Thumbnails fetched via YouTube's CDN: i.ytimg.com/vi/{id}/maxresdefault.jpg
const realThumbnails: Record<string, ComparisonThumbnail[]> = {
  entertainment: [
    { id: "mb1", url: "https://i.ytimg.com/vi/XNFpXfaKBuI/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/XNFpXfaKBuI/maxresdefault.jpg", title: "$1 vs $1,000,000 Hotel Room!", channel: "MrBeast", views: "195M views", niche: "entertainment" },
    { id: "mb2", url: "https://i.ytimg.com/vi/bPbZXL7-HCQ/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/bPbZXL7-HCQ/maxresdefault.jpg", title: "I Spent 50 Hours In Solitary Confinement", channel: "MrBeast", views: "120M views", niche: "entertainment" },
    { id: "rt1", url: "https://i.ytimg.com/vi/lJbSxOeGRcw/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/lJbSxOeGRcw/maxresdefault.jpg", title: "I Ran a Marathon in Every State", channel: "Ryan Trahan", views: "28M views", niche: "entertainment" },
    { id: "rt2", url: "https://i.ytimg.com/vi/SdNnSpJMX4c/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/SdNnSpJMX4c/maxresdefault.jpg", title: "Surviving 24 Hours on $0.01", channel: "Ryan Trahan", views: "35M views", niche: "entertainment" },
  ],
  education: [
    { id: "v1", url: "https://i.ytimg.com/vi/HeQX2HjkcNo/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/HeQX2HjkcNo/maxresdefault.jpg", title: "Why Is There a Pit in the Middle of This City?", channel: "Veritasium", views: "12M views", niche: "education" },
    { id: "v2", url: "https://i.ytimg.com/vi/d9uTH0iprVQ/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/d9uTH0iprVQ/maxresdefault.jpg", title: "The Simplest Math Problem No One Can Solve", channel: "Veritasium", views: "28M views", niche: "education" },
    { id: "k1", url: "https://i.ytimg.com/vi/RnvCbquYeIM/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/RnvCbquYeIM/maxresdefault.jpg", title: "What If Earth Got Kicked Out of the Solar System?", channel: "Kurzgesagt", views: "18M views", niche: "education" },
    { id: "mr1", url: "https://i.ytimg.com/vi/a_TSR_v07m0/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/a_TSR_v07m0/maxresdefault.jpg", title: "Glitter Bomb 5.0 vs. Porch Pirates", channel: "Mark Rober", views: "76M views", niche: "education" },
  ],
  tech: [
    { id: "mk1", url: "https://i.ytimg.com/vi/fWCcd-LQIKE/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/fWCcd-LQIKE/maxresdefault.jpg", title: "iPhone 16 Pro Review", channel: "MKBHD", views: "8M views", niche: "tech" },
    { id: "mk2", url: "https://i.ytimg.com/vi/1Mm5hnYMmow/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/1Mm5hnYMmow/maxresdefault.jpg", title: "The Best Tech I Tested in 2024", channel: "MKBHD", views: "5M views", niche: "tech" },
    { id: "lt1", url: "https://i.ytimg.com/vi/yQlOWaASM-M/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/yQlOWaASM-M/maxresdefault.jpg", title: "We Bought the Cheapest Tech on Amazon", channel: "Linus Tech Tips", views: "7M views", niche: "tech" },
    { id: "sq1", url: "https://i.ytimg.com/vi/2iEWQhBFKJI/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/2iEWQhBFKJI/maxresdefault.jpg", title: "I Tested Viral Tech Products", channel: "Squiduu", views: "2.1M views", niche: "tech" },
  ],
  gaming: [
    { id: "yk1", url: "https://i.ytimg.com/vi/ZK5pEBq2WXU/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/ZK5pEBq2WXU/maxresdefault.jpg", title: "Minecraft, But Every Minute Kills Me", channel: "Yikes", views: "8M views", niche: "gaming" },
    { id: "mb3", url: "https://i.ytimg.com/vi/s5NpyvLSA3g/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/s5NpyvLSA3g/maxresdefault.jpg", title: "$1 vs $100,000 Gaming Setup", channel: "MrBeast Gaming", views: "55M views", niche: "gaming" },
    { id: "dw1", url: "https://i.ytimg.com/vi/ok7NIB7DKHI/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/ok7NIB7DKHI/maxresdefault.jpg", title: "Minecraft Speedrun World Record", channel: "Dream", views: "42M views", niche: "gaming" },
    { id: "sq2", url: "https://i.ytimg.com/vi/M2wBZ9EOVHQ/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/M2wBZ9EOVHQ/maxresdefault.jpg", title: "Can I Beat Minecraft in 5 Minutes?", channel: "Squiduu", views: "1.8M views", niche: "gaming" },
  ],
  vlog: [
    { id: "rt3", url: "https://i.ytimg.com/vi/1S8O0S0-cnQ/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/1S8O0S0-cnQ/maxresdefault.jpg", title: "I Lived in an Airport for 30 Days", channel: "Ryan Trahan", views: "22M views", niche: "vlog" },
    { id: "cn1", url: "https://i.ytimg.com/vi/bNPAuBRNRuE/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/bNPAuBRNRuE/maxresdefault.jpg", title: "How I Film My Life", channel: "Casey Neistat", views: "9M views", niche: "vlog" },
    { id: "sq3", url: "https://i.ytimg.com/vi/kSEVMFzjBOA/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/kSEVMFzjBOA/maxresdefault.jpg", title: "Moving to a New Apartment", channel: "Squiduu", views: "890K views", niche: "vlog" },
    { id: "yk2", url: "https://i.ytimg.com/vi/Lp8_7SQDMBA/hqdefault.jpg", hqUrl: "https://i.ytimg.com/vi/Lp8_7SQDMBA/maxresdefault.jpg", title: "My Week in LA", channel: "Yikes", views: "1.2M views", niche: "vlog" },
  ],
}

const allNiches = Object.keys(realThumbnails)

const deviceConfigs = {
  phone:  { label: "Phone",  icon: Smartphone, width: 320, titleLines: 2, fontSize: "10px", showChannel: false },
  tablet: { label: "Tablet", icon: Tablet,     width: 480, titleLines: 2, fontSize: "11px", showChannel: true },
  pc:     { label: "Desktop",icon: Monitor,    width: 210, titleLines: 2, fontSize: "12px", showChannel: true },
  tv:     { label: "TV",     icon: Tv,         width: 280, titleLines: 1, fontSize: "11px", showChannel: false },
}

interface ThumbnailCardProps {
  url: string
  hqUrl?: string
  title: string
  channel: string
  views: string
  device: Device
  isUser?: boolean
}

function ThumbnailCard({ url, hqUrl, title, channel, views, device, isUser }: ThumbnailCardProps) {
  const cfg = deviceConfigs[device]
  const [imgSrc, setImgSrc] = useState(hqUrl || url)

  return (
    <div className="flex-shrink-0" style={{ width: cfg.width }}>
      <div className="relative bg-secondary rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(url)} // fallback to hqdefault if maxres fails
        />
        {isUser && (
          <div className="absolute top-1 left-1 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded font-medium">
            YOURS
          </div>
        )}
        {device === "phone" && (
          <div className="absolute bottom-0 right-0 bg-black/80 text-white text-xs px-1 py-0.5 rounded-tl">
            {views.split(" ")[0]}
          </div>
        )}
      </div>
      <div className="mt-1 space-y-0.5" style={{ width: cfg.width }}>
        <p
          className="font-medium text-foreground leading-tight"
          style={{
            fontSize: cfg.fontSize,
            display: "-webkit-box",
            WebkitLineClamp: cfg.titleLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </p>
        {cfg.showChannel && (
          <p className="text-muted-foreground truncate" style={{ fontSize: cfg.fontSize }}>
            {channel} • {views}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ThumbnailsPage() {
  const t = useTranslations()
  const [selectedDevice, setSelectedDevice] = useState<Device>("pc")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [thumbnailTitle, setThumbnailTitle] = useState("Your Video Title Here")
  const [showComparison, setShowComparison] = useState(false)
  const [selectedNiche, setSelectedNiche] = useState<string>("entertainment")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const comparisonThumbs = realThumbnails[selectedNiche] || []

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = ev => { if (ev.target?.result) setThumbnailUrl(ev.target.result as string) }
      reader.readAsDataURL(file)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = ev => { if (ev.target?.result) setThumbnailUrl(ev.target.result as string) }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="min-h-screen px-2 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between px-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">mushub</h1>
            <p className="text-xs text-muted-foreground">{t("nav.thumbnails")}</p>
          </div>
          <Nav />
        </header>

        {/* Device selector */}
        <div className="flex gap-2 overflow-x-auto px-2 pb-1">
          {(Object.entries(deviceConfigs) as [Device, typeof deviceConfigs.pc][]).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedDevice(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm whitespace-nowrap transition-colors",
                  selectedDevice === key
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {cfg.label}
              </button>
            )
          })}
        </div>

        {/* Upload */}
        <div className="px-2 space-y-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
              isDragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
            )}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {thumbnailUrl ? (
              <div className="relative inline-block">
                <img src={thumbnailUrl} alt="Your thumbnail" className="max-h-40 rounded-lg object-contain" />
                <button
                  onClick={e => { e.stopPropagation(); setThumbnailUrl("") }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Drop your thumbnail or click to upload</p>
              </div>
            )}
          </div>

          <Input
            value={thumbnailTitle}
            onChange={e => setThumbnailTitle(e.target.value)}
            placeholder="Your video title..."
            className="bg-secondary border-border"
          />
        </div>

        {/* Preview */}
        {thumbnailUrl && (
          <div className="px-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Preview on {deviceConfigs[selectedDevice].label}</h2>
              <button
                onClick={() => setShowComparison(v => !v)}
                className="flex items-center gap-1.5 text-xs text-accent hover:underline"
              >
                {showComparison ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showComparison ? "Hide" : "Compare with others"}
              </button>
            </div>

            {!showComparison ? (
              <div className="flex justify-center p-6 bg-secondary/30 rounded-xl">
                <ThumbnailCard
                  url={thumbnailUrl}
                  title={thumbnailTitle}
                  channel="Your Channel"
                  views="—"
                  device={selectedDevice}
                  isUser
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Niche selector */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allNiches.map(n => (
                    <button
                      key={n}
                      onClick={() => setSelectedNiche(n)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs border capitalize whitespace-nowrap transition-colors",
                        selectedNiche === n
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-accent/50"
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* Comparison grid - YouTube-style feed */}
                <div className="bg-[#0f0f0f] rounded-xl p-4 overflow-x-auto">
                  <div className="flex gap-3 min-w-max">
                    {/* User's thumbnail first */}
                    <ThumbnailCard
                      url={thumbnailUrl}
                      title={thumbnailTitle}
                      channel="Your Channel"
                      views="—"
                      device={selectedDevice}
                      isUser
                    />
                    {comparisonThumbs.map(thumb => (
                      <ThumbnailCard
                        key={thumb.id}
                        url={thumb.url}
                        hqUrl={thumb.hqUrl}
                        title={thumb.title}
                        channel={thumb.channel}
                        views={thumb.views}
                        device={selectedDevice}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Real thumbnails from top creators • Tap to scroll
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
