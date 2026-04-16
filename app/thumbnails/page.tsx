"use client"

import { useState, useRef, useCallback } from "react"
import { Monitor, Smartphone, Tablet, Tv, Upload, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { cn } from "@/lib/utils"

type Device = "phone" | "tablet" | "pc" | "tv"

interface Thumbnail {
  id: string
  url: string
  title: string
  channel: string
  views: string
  avatar: string
  isUser?: boolean
}

// Real YouTube thumbnails from top creators
const comparisons: Thumbnail[] = [
  { id: "mb1", url: "https://i.ytimg.com/vi/XNFpXfaKBuI/hqdefault.jpg", title: "$1 vs $1,000,000 Hotel Room!", channel: "MrBeast", views: "195M", avatar: "MB" },
  { id: "v1",  url: "https://i.ytimg.com/vi/d9uTH0iprVQ/hqdefault.jpg", title: "The Simplest Math Problem No One Can Solve", channel: "Veritasium", views: "28M", avatar: "VE" },
  { id: "mk1", url: "https://i.ytimg.com/vi/fWCcd-LQIKE/hqdefault.jpg", title: "iPhone 16 Pro Review", channel: "MKBHD", views: "8M", avatar: "MK" },
  { id: "mr1", url: "https://i.ytimg.com/vi/a_TSR_v07m0/hqdefault.jpg", title: "Glitter Bomb 5.0 vs. Porch Pirates", channel: "Mark Rober", views: "76M", avatar: "MR" },
  { id: "rt1", url: "https://i.ytimg.com/vi/lJbSxOeGRcw/hqdefault.jpg", title: "I Ran a Marathon in Every State", channel: "Ryan Trahan", views: "22M", avatar: "RT" },
  { id: "k1",  url: "https://i.ytimg.com/vi/RnvCbquYeIM/hqdefault.jpg", title: "What If Earth Got Kicked Out of the Solar System?", channel: "Kurzgesagt", views: "18M", avatar: "KU" },
]

// ─── Phone mockup ──────────────────────────────────────────────────────────

function PhoneMockup({ thumbnailUrl, thumbnailTitle }: { thumbnailUrl: string; thumbnailTitle: string }) {
  const feed = [
    { id: "user", isUser: true, url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "—", avatar: "YO" },
    ...comparisons.slice(0, 5),
  ]

  return (
    <div className="mx-auto" style={{ width: 300 }}>
      <div className="relative bg-[#1a1a1a] rounded-[2.5rem] p-2 shadow-2xl border border-white/10">
        <div className="bg-[#0f0f0f] rounded-[2rem] overflow-hidden" style={{ height: 600 }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-1">
            <span className="text-white text-[10px] font-medium">9:41</span>
            <div className="w-20 h-4 bg-black rounded-full" />
            <div className="flex items-center gap-0.5">
              <div className="w-3 h-2 border border-white/60 rounded-sm flex items-center pl-0.5">
                <div className="w-1.5 h-1 bg-white/60 rounded-sm" />
              </div>
            </div>
          </div>
          {/* YouTube top bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
            <span className="text-white font-bold text-base">▶ YouTube</span>
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-[9px]">🔔</div>
              <div className="w-5 h-5 rounded-full bg-blue-500 text-[8px] text-white font-bold flex items-center justify-center">U</div>
            </div>
          </div>
          {/* Chips */}
          <div className="flex gap-1.5 px-3 py-2 overflow-x-auto">
            {["All","Gaming","Tech","Music","Vlogs"].map((c, i) => (
              <span key={i} className={cn("px-2 py-0.5 rounded-full text-[9px] whitespace-nowrap flex-shrink-0", i === 0 ? "bg-white text-black font-medium" : "bg-white/10 text-white/60")}>
                {c}
              </span>
            ))}
          </div>
          {/* Feed */}
          <div className="overflow-y-auto" style={{ height: 490 }}>
            {feed.map((item) => (
              <div key={item.id} className={cn("mb-2", item.isUser && "ring-2 ring-red-500 ring-inset")}>
                <div className="relative w-full bg-white/5" style={{ aspectRatio: "16/9" }}>
                  {item.url ? (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <span className="text-white/20 text-xs">No thumbnail</span>
                    </div>
                  )}
                  {item.isUser && (
                    <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-wide">
                      Yours
                    </div>
                  )}
                  {item.views !== "—" && (
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded">
                      {item.views}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-[8px] text-white font-bold">
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{item.title}</p>
                    <p className="text-white/50 text-[9px] mt-0.5">{item.channel} {item.views !== "—" && `· ${item.views} views`}</p>
                  </div>
                  <div className="text-white/30 text-base flex-shrink-0">⋮</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom bar */}
        <div className="flex justify-center pt-1.5">
          <div className="w-24 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ─── Tablet mockup ─────────────────────────────────────────────────────────

function TabletMockup({ thumbnailUrl, thumbnailTitle }: { thumbnailUrl: string; thumbnailTitle: string }) {
  const feed = [
    { id: "user", isUser: true, url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "—", avatar: "YO" },
    ...comparisons,
  ]
  const rows: (typeof feed[0])[][] = []
  for (let i = 0; i < feed.length; i += 2) rows.push(feed.slice(i, i + 2))

  return (
    <div className="mx-auto" style={{ width: 620 }}>
      <div className="relative bg-[#1a1a1a] rounded-[1.8rem] p-3 shadow-2xl border border-white/10">
        <div className="flex justify-center mb-2">
          <div className="w-2 h-2 bg-white/20 rounded-full" />
        </div>
        <div className="bg-[#0f0f0f] rounded-xl overflow-hidden" style={{ height: 480 }}>
          {/* YouTube nav */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5">
            <span className="text-white font-bold text-sm">▶ YouTube</span>
            <div className="flex-1 bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
              <span className="text-white/30 text-xs">🔍 Search</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-500 text-[9px] text-white font-bold flex items-center justify-center">U</div>
          </div>
          {/* Chips */}
          <div className="flex gap-2 px-4 py-2 overflow-x-auto">
            {["All","Gaming","Tech","Education","Vlogs","Music"].map((c, i) => (
              <span key={i} className={cn("px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap flex-shrink-0", i === 0 ? "bg-white text-black font-medium" : "bg-white/10 text-white/60")}>
                {c}
              </span>
            ))}
          </div>
          {/* Grid */}
          <div className="overflow-y-auto p-3 space-y-3" style={{ height: 400 }}>
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-2 gap-3">
                {row.map((item) => (
                  <div key={item.id} className={cn("rounded-xl overflow-hidden", item.isUser && "ring-2 ring-red-500")}>
                    <div className="relative bg-white/5" style={{ aspectRatio: "16/9" }}>
                      {item.url ? (
                        <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/20 text-xs">No thumbnail</span>
                        </div>
                      )}
                      {item.isUser && (
                        <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Yours
                        </div>
                      )}
                      {item.views !== "—" && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded">
                          {item.views}
                        </div>
                      )}
                    </div>
                    <div className="p-2 flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-[9px] text-white font-bold">
                        {item.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{item.title}</p>
                        <p className="text-white/50 text-[9px] mt-0.5">{item.channel}{item.views !== "—" && ` · ${item.views} views`}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="w-20 h-1 bg-white/30 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ─── PC mockup ─────────────────────────────────────────────────────────────

function PCMockup({ thumbnailUrl, thumbnailTitle }: { thumbnailUrl: string; thumbnailTitle: string }) {
  const feed = [
    { id: "user", isUser: true, url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "—", avatar: "YO" },
    ...comparisons,
  ]
  const rows: (typeof feed[0])[][] = []
  for (let i = 0; i < feed.length; i += 4) rows.push(feed.slice(i, i + 4))

  return (
    <div className="mx-auto" style={{ maxWidth: 900, width: "100%" }}>
      {/* Monitor */}
      <div className="bg-[#1a1a1a] rounded-t-2xl p-2 border border-white/10 shadow-2xl">
        <div className="bg-[#0f0f0f] rounded-xl overflow-hidden" style={{ height: 520 }}>
          {/* Browser chrome */}
          <div className="flex items-center gap-2 bg-[#1c1c1c] px-3 py-1.5 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 bg-white/10 rounded px-2 py-0.5 flex items-center gap-1">
              <span className="text-white/20 text-[9px]">🔒</span>
              <span className="text-white/30 text-[10px]">youtube.com</span>
            </div>
          </div>
          {/* YouTube layout */}
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-14 bg-[#0f0f0f] border-r border-white/5 flex flex-col items-center gap-4 py-3 flex-shrink-0 overflow-hidden">
              <span className="text-white text-xs font-bold">▶</span>
              {[["⊞","Home"],["◎","Shorts"],["📺","Subs"],["🕐","History"],["👍","Liked"]].map(([icon, label], i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-xs">{icon}</span>
                  <span className="text-white/30 text-[7px]">{label}</span>
                </div>
              ))}
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {/* Top bar */}
              <div className="flex items-center gap-3 px-3 py-2 border-b border-white/5">
                <div className="flex-1 bg-white/10 rounded-full px-3 py-1 flex items-center gap-2">
                  <span className="text-white/30 text-[10px]">🔍 Search</span>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  <span className="text-white/30 text-[10px]">🔔</span>
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-[9px] text-white font-bold flex items-center justify-center">U</div>
                </div>
              </div>
              {/* Chips */}
              <div className="flex gap-2 px-3 py-2 overflow-x-auto">
                {["All","Gaming","Tech","Education","Music","Vlogs","Cooking"].map((c, i) => (
                  <span key={i} className={cn("px-2 py-0.5 rounded-full text-[9px] whitespace-nowrap flex-shrink-0", i === 0 ? "bg-white text-black font-medium" : "bg-white/10 text-white/60")}>
                    {c}
                  </span>
                ))}
              </div>
              {/* Grid */}
              <div className="px-3 pb-3 space-y-4">
                {rows.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-4 gap-3">
                    {row.map((item) => (
                      <div key={item.id} className={cn("group cursor-pointer", item.isUser && "ring-2 ring-red-500 rounded-xl")}>
                        <div className="relative bg-white/5 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                          {item.url ? (
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white/20 text-[9px]">No thumbnail</span>
                            </div>
                          )}
                          {item.isUser && (
                            <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Yours
                            </div>
                          )}
                          {item.views !== "—" && (
                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] px-1 rounded">
                              {item.views}
                            </div>
                          )}
                        </div>
                        <div className="pt-2 flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0 flex items-center justify-center text-[8px] text-white font-bold">
                            {item.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[10px] font-medium leading-snug line-clamp-2">{item.title}</p>
                            <p className="text-white/50 text-[9px] mt-0.5">{item.channel}</p>
                            {item.views !== "—" && <p className="text-white/40 text-[9px]">{item.views} views</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stand */}
      <div className="flex justify-center">
        <div className="w-28 h-3 bg-[#1a1a1a] border-x border-white/10" />
      </div>
      <div className="flex justify-center">
        <div className="w-44 h-1.5 bg-[#222] rounded-b border border-white/10" />
      </div>
    </div>
  )
}

// ─── TV mockup ─────────────────────────────────────────────────────────────

function TVMockup({ thumbnailUrl, thumbnailTitle }: { thumbnailUrl: string; thumbnailTitle: string }) {
  const feed = [
    { id: "user", isUser: true, url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "—", avatar: "YO" },
    ...comparisons.slice(0, 5),
  ]

  return (
    <div className="mx-auto" style={{ maxWidth: 800, width: "100%" }}>
      <div className="bg-[#111] rounded-2xl p-3 border border-white/10 shadow-2xl">
        <div className="bg-[#0a0a0a] rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <div className="h-full flex flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/90 to-transparent">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">▶</span>
                <span className="text-white font-bold text-lg tracking-tight">YouTube</span>
              </div>
              <div className="flex gap-6 text-sm">
                {["Home","Trending","Subscriptions","Library"].map((item, i) => (
                  <span key={i} className={cn(i === 1 ? "text-white border-b-2 border-red-600 pb-0.5 font-medium" : "text-white/50")}>
                    {item}
                  </span>
                ))}
              </div>
              <span className="text-white/40 text-sm">9:41 PM</span>
            </div>

            {/* Content */}
            <div className="flex-1 flex gap-4 px-5 pb-4 overflow-hidden">
              {/* Featured (your thumbnail big) */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {feed[0].url ? (
                    <img src={feed[0].url} alt={feed[0].title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <span className="text-white/20 text-sm">Your thumbnail here</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                      ▶ Yours
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">{feed[0].title}</p>
                    <p className="text-white/60 text-xs">{feed[0].channel}</p>
                  </div>
                </div>
              </div>

              {/* Right sidebar list */}
              <div className="w-56 flex flex-col justify-center space-y-2 flex-shrink-0">
                <p className="text-white/40 text-[9px] uppercase tracking-widest mb-1">Up next</p>
                {feed.slice(1, 6).map((item) => (
                  <div key={item.id} className="flex gap-2 items-start group cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative flex-shrink-0 rounded-md overflow-hidden" style={{ width: 90, aspectRatio: "16/9" }}>
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{item.title}</p>
                      <p className="text-white/50 text-[9px] mt-0.5">{item.channel}</p>
                      {item.views !== "—" && <p className="text-white/30 text-[9px]">{item.views} views</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom dots */}
            <div className="flex justify-center gap-1.5 pb-2">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={cn("rounded-full", i === 0 ? "w-4 h-1 bg-white" : "w-1 h-1 bg-white/30")} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* TV stand */}
      <div className="flex justify-center">
        <div className="w-20 h-4 bg-[#111] border-x border-white/10" />
      </div>
      <div className="flex justify-center">
        <div className="w-36 h-1.5 bg-[#1a1a1a] rounded-b border border-white/10" />
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

const devices: { id: Device; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "phone",  label: "Phone",   icon: Smartphone },
  { id: "tablet", label: "Tablet",  icon: Tablet },
  { id: "pc",     label: "Desktop", icon: Monitor },
  { id: "tv",     label: "TV",      icon: Tv },
]

export default function ThumbnailsPage() {
  const [selectedDevice, setSelectedDevice] = useState<Device>("pc")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [thumbnailTitle, setThumbnailTitle] = useState("Your Video Title Here")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = ev => { if (ev.target?.result) setThumbnailUrl(ev.target.result as string) }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = ev => { if (ev.target?.result) setThumbnailUrl(ev.target.result as string) }
      reader.readAsDataURL(file)
    }
  }, [])

  const devIdx = devices.findIndex(d => d.id === selectedDevice)
  const prevDevice = () => setSelectedDevice(devices[(devIdx - 1 + devices.length) % devices.length].id)
  const nextDevice = () => setSelectedDevice(devices[(devIdx + 1) % devices.length].id)

  return (
    <main className="min-h-screen px-2 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between px-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">mushub</h1>
            <p className="text-xs text-muted-foreground">Thumbnail preview</p>
          </div>
          <Nav />
        </header>

        {/* Upload + title */}
        <div className="px-2 space-y-3">
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
              isDragging ? "border-accent bg-accent/10 scale-[1.01]" : "border-border hover:border-accent/50 hover:bg-secondary/20"
            )}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            {thumbnailUrl ? (
              <div className="relative inline-block">
                <img src={thumbnailUrl} alt="Your thumbnail" className="max-h-32 rounded-lg object-contain shadow-lg" />
                <button
                  onClick={e => { e.stopPropagation(); setThumbnailUrl("") }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white shadow hover:scale-110 transition-transform"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                <Upload className="h-7 w-7 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Drop your thumbnail or <span className="text-accent">click to upload</span></p>
                <p className="text-xs text-muted-foreground/50">PNG, JPG, WEBP — idéalement 1280×720</p>
              </div>
            )}
          </div>

          <input
            value={thumbnailTitle}
            onChange={e => setThumbnailTitle(e.target.value)}
            placeholder="Your video title..."
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Device tabs */}
        <div className="flex items-center justify-between px-2">
          <div className="flex gap-2 flex-wrap">
            {devices.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedDevice(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all",
                  selectedDevice === id
                    ? "border-accent bg-accent/10 text-foreground font-medium"
                    : "border-border text-muted-foreground hover:border-accent/40"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          {/* Arrow nav on mobile */}
          <div className="flex gap-1 sm:hidden">
            <button onClick={prevDevice} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={nextDevice} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="px-2 pb-8">
          {!thumbnailUrl ? (
            <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/10 py-20">
              <div className="text-center space-y-3">
                {selectedDevice === "phone"  && <Smartphone className="h-12 w-12 text-muted-foreground/20 mx-auto" />}
                {selectedDevice === "tablet" && <Tablet    className="h-12 w-12 text-muted-foreground/20 mx-auto" />}
                {selectedDevice === "pc"     && <Monitor   className="h-12 w-12 text-muted-foreground/20 mx-auto" />}
                {selectedDevice === "tv"     && <Tv        className="h-12 w-12 text-muted-foreground/20 mx-auto" />}
                <p className="text-sm text-muted-foreground">Upload a thumbnail to preview on {devices.find(d => d.id === selectedDevice)?.label}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground px-2 flex items-center gap-1.5">
                  {devices.find(d => d.id === selectedDevice)?.label} · YouTube UI
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  <span className="text-red-400">= yours</span>
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {selectedDevice === "phone"  && <PhoneMockup  thumbnailUrl={thumbnailUrl} thumbnailTitle={thumbnailTitle} />}
              {selectedDevice === "tablet" && <TabletMockup thumbnailUrl={thumbnailUrl} thumbnailTitle={thumbnailTitle} />}
              {selectedDevice === "pc"     && <PCMockup     thumbnailUrl={thumbnailUrl} thumbnailTitle={thumbnailTitle} />}
              {selectedDevice === "tv"     && <TVMockup     thumbnailUrl={thumbnailUrl} thumbnailTitle={thumbnailTitle} />}

              <p className="text-center text-xs text-muted-foreground/40">
                Comparaisons avec de vraies miniatures de top créateurs
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
