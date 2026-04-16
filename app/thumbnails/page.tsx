"use client"

import { useState, useEffect, useRef } from "react"
import { Monitor, Smartphone, Tablet, Tv, Eye, EyeOff, Upload, X, Plus, ImageIcon, Shuffle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Nav } from "@/components/nav"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

type Device = "phone" | "tablet" | "pc" | "tv"

interface ComparisonThumbnail {
  id: string
  url: string
  title: string
  channel: string
  views: string
  niche?: string
}

// Niche categories with thumbnails - using picsum for reliable loading with YouTube-style aspect ratios
const nicheThumbnails: Record<string, ComparisonThumbnail[]> = {
  gaming: [
    { id: "g1", url: "https://picsum.photos/seed/gaming1/1280/720", title: "I Beat Minecraft in 10 Minutes", channel: "DreamWasTaken", views: "45M views", niche: "gaming" },
    { id: "g2", url: "https://picsum.photos/seed/gaming2/1280/720", title: "100 Days Hardcore Survival", channel: "LukeTheNotable", views: "32M views", niche: "gaming" },
    { id: "g3", url: "https://picsum.photos/seed/gaming3/1280/720", title: "Minecraft Speedrun World Record", channel: "Illumina", views: "18M views", niche: "gaming" },
    { id: "g4", url: "https://picsum.photos/seed/gaming4/1280/720", title: "Pro vs Noob Challenge", channel: "MrBeast Gaming", views: "28M views", niche: "gaming" },
  ],
  tech: [
    { id: "t1", url: "https://picsum.photos/seed/tech1/1280/720", title: "iPhone 16 Pro Max Review", channel: "MKBHD", views: "12M views", niche: "tech" },
    { id: "t2", url: "https://picsum.photos/seed/tech2/1280/720", title: "Building a $50,000 PC", channel: "Linus Tech Tips", views: "8.5M views", niche: "tech" },
    { id: "t3", url: "https://picsum.photos/seed/tech3/1280/720", title: "This Phone Changes Everything", channel: "Unbox Therapy", views: "5.2M views", niche: "tech" },
    { id: "t4", url: "https://picsum.photos/seed/tech4/1280/720", title: "Best Budget Laptops 2026", channel: "Dave2D", views: "3.1M views", niche: "tech" },
  ],
  education: [
    { id: "e1", url: "https://picsum.photos/seed/edu1/1280/720", title: "Why Black Holes Break Physics", channel: "Veritasium", views: "22M views", niche: "education" },
    { id: "e2", url: "https://picsum.photos/seed/edu2/1280/720", title: "What If The Sun Disappeared?", channel: "Kurzgesagt", views: "35M views", niche: "education" },
    { id: "e3", url: "https://picsum.photos/seed/edu3/1280/720", title: "Glitter Bomb Trap 5.0", channel: "Mark Rober", views: "68M views", niche: "education" },
    { id: "e4", url: "https://picsum.photos/seed/edu4/1280/720", title: "The Math That Explains Everything", channel: "3Blue1Brown", views: "15M views", niche: "education" },
  ],
  entertainment: [
    { id: "en1", url: "https://picsum.photos/seed/ent1/1280/720", title: "$1 vs $1,000,000 Hotel Room!", channel: "MrBeast", views: "180M views", niche: "entertainment" },
    { id: "en2", url: "https://picsum.photos/seed/ent2/1280/720", title: "Last To Leave Wins $500,000", channel: "MrBeast", views: "95M views", niche: "entertainment" },
    { id: "en3", url: "https://picsum.photos/seed/ent3/1280/720", title: "I Survived 100 Days on an Island", channel: "Airrack", views: "42M views", niche: "entertainment" },
    { id: "en4", url: "https://picsum.photos/seed/ent4/1280/720", title: "World's Most Extreme Challenge", channel: "Yes Theory", views: "18M views", niche: "entertainment" },
  ],
  vlog: [
    { id: "v1", url: "https://picsum.photos/seed/vlog1/1280/720", title: "A Day in My Life in NYC", channel: "Casey Neistat", views: "8.2M views", niche: "vlog" },
    { id: "v2", url: "https://picsum.photos/seed/vlog2/1280/720", title: "Moving to a New City", channel: "Emma Chamberlain", views: "12M views", niche: "vlog" },
    { id: "v3", url: "https://picsum.photos/seed/vlog3/1280/720", title: "The Truth About Fame", channel: "David Dobrik", views: "25M views", niche: "vlog" },
    { id: "v4", url: "https://picsum.photos/seed/vlog4/1280/720", title: "My Morning Routine 2026", channel: "James Charles", views: "6.5M views", niche: "vlog" },
  ],
}

const allNiches = Object.keys(nicheThumbnails)

export default function ThumbnailsPage() {
  const t = useTranslations()
  const [selectedDevice, setSelectedDevice] = useState<Device>("pc")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [thumbnailTitle, setThumbnailTitle] = useState("Your Video Title Here")
  const [showComparison, setShowComparison] = useState(false)
  const [comparisonThumbnails, setComparisonThumbnails] = useState<ComparisonThumbnail[]>([])
  const [newComparisonUrl, setNewComparisonUrl] = useState("")
  const [showAddComparison, setShowAddComparison] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [userPosition, setUserPosition] = useState(0)
  const [selectedNiche, setSelectedNiche] = useState<string>("entertainment")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load niche from channel analysis or default
    const storedNiche = localStorage.getItem("mushub_channel_niche")
    if (storedNiche && allNiches.includes(storedNiche)) {
      setSelectedNiche(storedNiche)
    }
    
    // Load comparison thumbnails based on niche
    const stored = localStorage.getItem("mushub_comparison_thumbnails")
    if (stored) {
      setComparisonThumbnails(JSON.parse(stored))
    } else {
      setComparisonThumbnails(nicheThumbnails[selectedNiche] || nicheThumbnails.entertainment)
    }
  }, [])

  useEffect(() => {
    // Update thumbnails when niche changes
    if (!localStorage.getItem("mushub_comparison_thumbnails")) {
      setComparisonThumbnails(nicheThumbnails[selectedNiche] || nicheThumbnails.entertainment)
    }
  }, [selectedNiche])

  const saveComparisonThumbnails = (thumbnails: ComparisonThumbnail[]) => {
    setComparisonThumbnails(thumbnails)
    localStorage.setItem("mushub_comparison_thumbnails", JSON.stringify(thumbnails))
  }

  const addComparisonThumbnail = () => {
    if (newComparisonUrl.trim()) {
      const newThumbnail: ComparisonThumbnail = {
        id: Date.now().toString(),
        url: newComparisonUrl.trim(),
        title: "Comparison thumbnail",
        channel: "Custom",
      }
      saveComparisonThumbnails([...comparisonThumbnails, newThumbnail])
      setNewComparisonUrl("")
      setShowAddComparison(false)
    }
  }

  const removeComparisonThumbnail = (id: string) => {
    saveComparisonThumbnails(comparisonThumbnails.filter(t => t.id !== id))
  }

  const shufflePosition = () => {
    const maxPosition = comparisonThumbnails.length
    setUserPosition(Math.floor(Math.random() * (maxPosition + 1)))
  }

  const shuffleThumbnails = () => {
    // Shuffle the comparison thumbnails array
    const shuffled = [...comparisonThumbnails].sort(() => Math.random() - 0.5)
    setComparisonThumbnails(shuffled)
    // Also randomize user position
    setUserPosition(Math.floor(Math.random() * (shuffled.length + 1)))
  }

  const loadNicheThumbnails = (niche: string) => {
    setSelectedNiche(niche)
    localStorage.setItem("mushub_channel_niche", niche)
    setComparisonThumbnails(nicheThumbnails[niche] || nicheThumbnails.entertainment)
    localStorage.removeItem("mushub_comparison_thumbnails")
  }

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const getThumbnailFromUrl = (url: string) => {
    if (!url) return ""
    const videoId = extractVideoId(url)
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
    }
    return url
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setThumbnailUrl(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setThumbnailUrl(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Build the display list with user thumbnail at shuffled position
  const buildDisplayList = () => {
    const list = [...comparisonThumbnails]
    const userThumb = { id: "user", url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", isUser: true }
    list.splice(userPosition, 0, userThumb as ComparisonThumbnail & { isUser?: boolean })
    return list
  }

  // Phone YouTube UI - Realistic mobile YouTube app
  const renderPhoneUI = () => {
    const displayList = showComparison ? buildDisplayList() : [{ id: "user", url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "1.2M views", isUser: true }]
    return (
      <div className="bg-zinc-950 rounded-[2.5rem] p-3 w-[300px] mx-auto shadow-2xl border-[6px] border-zinc-800 relative">
        {/* Phone notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
        <div className="bg-zinc-900 rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="h-8 bg-black flex items-center justify-between px-6 text-[11px] text-white pt-1">
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                <div className="w-1 h-2 bg-white rounded-sm" />
                <div className="w-1 h-2.5 bg-white rounded-sm" />
                <div className="w-1 h-3 bg-white rounded-sm" />
                <div className="w-1 h-3.5 bg-white rounded-sm" />
              </div>
              <div className="w-6 h-3 rounded-sm bg-white ml-1 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-white rounded-sm -mr-0.5" />
              </div>
            </div>
          </div>
          {/* YouTube header */}
          <div className="h-11 bg-zinc-900 flex items-center px-3 gap-2 border-b border-zinc-800">
            <svg className="w-20 h-5" viewBox="0 0 90 20" fill="none">
              <path d="M27.973 18.764V1.236h2.477v7.236l7.032-7.236h3.122l-6.89 6.89 7.26 10.638h-3.03l-5.884-8.74-1.61 1.61v7.13h-2.477z" fill="white"/>
              <rect x="0" y="4" width="24" height="12" rx="3" fill="#FF0000"/>
              <path d="M9.6 7.2v5.6l4.8-2.8L9.6 7.2z" fill="white"/>
            </svg>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-zinc-700" />
              <div className="w-5 h-5 rounded bg-zinc-700" />
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
            </div>
          </div>
          {/* Video feed - Full width mobile style */}
          <div className="h-[460px] overflow-y-auto bg-zinc-900">
            {(displayList as (ComparisonThumbnail & { isUser?: boolean; views?: string })[]).map((thumb, idx) => (
              <div key={thumb.id} className={cn("", thumb.isUser && "bg-accent/10")}>
                {/* Full width thumbnail like mobile YouTube */}
                <div className="relative w-full aspect-video bg-zinc-800">
                  {thumb.url ? (
                    <img src={getThumbnailFromUrl(thumb.url)} alt={thumb.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-zinc-600" />
                    </div>
                  )}
                  {thumb.isUser && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-accent text-[10px] font-bold text-accent-foreground shadow-lg">YOUR THUMBNAIL</div>
                  )}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/90 text-[11px] text-white font-medium">12:34</div>
                </div>
                {/* Video info */}
                <div className="p-3 flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white font-medium line-clamp-2 leading-snug">
                      {thumb.title}
                    </p>
                    <p className="text-[12px] text-zinc-400 mt-1">
                      {thumb.channel} · {thumb.views || "1.2M views"} · 2 days ago
                    </p>
                  </div>
                  <div className="text-zinc-500 text-lg">:</div>
                </div>
              </div>
            ))}
          </div>
          {/* Bottom nav - Actual YouTube nav */}
          <div className="h-14 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-2">
            {[
              { icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z", label: "Home", active: true },
              { icon: "M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25.03.01 1.2.5 1.2.5L6 14.93c-1.83.97-2.53 3.24-1.56 5.07.97 1.83 3.24 2.53 5.07 1.56l8.5-4.5c1.29-.68 2.06-2.04 1.99-3.49-.07-1.42-.94-2.68-2.23-3.25z", label: "Shorts" },
              { icon: "M12 12m-10 0a10 10 0 1020 0 10 10 0 10-20 0M12 7v10M7 12h10", label: "+", isPlus: true },
              { icon: "M18.7 8.7H5.3V7h13.4v1.7zm0 4.2H5.3v-1.7h13.4v1.7zm0 4.1H5.3V15.3h13.4V17z", label: "Subs" },
              { icon: "M3 3v18h18V3H3zm16 16H5V5h14v14z", label: "You" },
            ].map((item, i) => (
              <div key={i} className={cn("flex flex-col items-center gap-0.5", item.active ? "text-white" : "text-zinc-500")}>
                {item.isPlus ? (
                  <div className="w-8 h-5 rounded-lg bg-white flex items-center justify-center">
                    <span className="text-black text-lg font-bold leading-none">+</span>
                  </div>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d={item.icon} />
                  </svg>
                )}
                <span className="text-[10px]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white rounded-full" />
      </div>
    )
  }

  // Tablet YouTube UI - iPad style
  const renderTabletUI = () => {
    const displayList = showComparison ? buildDisplayList() : [{ id: "user", url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "1.2M views", isUser: true }]
    return (
      <div className="bg-zinc-950 rounded-[2rem] p-3 w-[580px] mx-auto shadow-2xl border-[6px] border-zinc-800">
        <div className="bg-zinc-900 rounded-[1.5rem] overflow-hidden">
          {/* YouTube header */}
          <div className="h-14 bg-zinc-900 flex items-center px-5 gap-4 border-b border-zinc-800">
            <svg className="w-24 h-6" viewBox="0 0 90 20" fill="none">
              <path d="M27.973 18.764V1.236h2.477v7.236l7.032-7.236h3.122l-6.89 6.89 7.26 10.638h-3.03l-5.884-8.74-1.61 1.61v7.13h-2.477z" fill="white"/>
              <rect x="0" y="4" width="24" height="12" rx="3" fill="#FF0000"/>
              <path d="M9.6 7.2v5.6l4.8-2.8L9.6 7.2z" fill="white"/>
            </svg>
            <div className="flex-1 h-10 bg-zinc-800 rounded-full px-4 flex items-center max-w-sm">
              <svg className="w-5 h-5 text-zinc-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-zinc-500">Search</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded bg-zinc-700" />
              <div className="w-6 h-6 rounded bg-zinc-700" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
            </div>
          </div>
          {/* Video grid */}
          <div className="h-[380px] overflow-y-auto p-4 bg-zinc-900">
            <div className="grid grid-cols-2 gap-4">
              {(displayList as (ComparisonThumbnail & { isUser?: boolean; views?: string })[]).map((thumb) => (
                <div key={thumb.id} className={cn("rounded-xl overflow-hidden", thumb.isUser && "ring-2 ring-accent")}>
                  <div className="relative aspect-video bg-zinc-800">
                    {thumb.url ? (
                      <img src={getThumbnailFromUrl(thumb.url)} alt={thumb.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-zinc-600" />
                      </div>
                    )}
                    {thumb.isUser && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-accent text-[9px] font-bold text-accent-foreground">YOUR THUMBNAIL</div>
                    )}
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/90 text-[11px] text-white font-medium">12:34</div>
                  </div>
                  <div className="p-3 flex gap-3 bg-zinc-900">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium line-clamp-2 leading-snug">
                        {thumb.title}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">{thumb.channel} · {thumb.views || "1.2M views"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop YouTube UI
  const renderDesktopUI = () => {
    const displayList = showComparison ? buildDisplayList() : [{ id: "user", url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "1.2M views", isUser: true }]
    return (
      <div className="bg-zinc-800 rounded-lg p-1 w-full max-w-[850px] mx-auto shadow-2xl">
        <div className="bg-zinc-900 rounded overflow-hidden">
          {/* Browser bar */}
          <div className="h-9 bg-zinc-800 flex items-center px-3 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex-1 h-6 bg-zinc-700 rounded-md mx-8 px-3 flex items-center">
              <svg className="w-3 h-3 text-zinc-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[11px] text-zinc-400">youtube.com</span>
            </div>
          </div>
          {/* YouTube header */}
          <div className="h-14 bg-zinc-900 flex items-center px-4 gap-4 border-b border-zinc-800">
            <svg className="w-24 h-6" viewBox="0 0 90 20" fill="none">
              <path d="M27.973 18.764V1.236h2.477v7.236l7.032-7.236h3.122l-6.89 6.89 7.26 10.638h-3.03l-5.884-8.74-1.61 1.61v7.13h-2.477z" fill="white"/>
              <rect x="0" y="4" width="24" height="12" rx="3" fill="#FF0000"/>
              <path d="M9.6 7.2v5.6l4.8-2.8L9.6 7.2z" fill="white"/>
            </svg>
            <div className="flex-1 max-w-lg h-10 bg-zinc-800 rounded-full px-4 flex items-center border border-zinc-700">
              <span className="text-sm text-zinc-500">Search</span>
              <div className="ml-auto w-16 h-full bg-zinc-700 -mr-4 rounded-r-full flex items-center justify-center border-l border-zinc-600">
                <svg className="w-5 h-5 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded bg-zinc-700" />
              <div className="w-6 h-6 rounded bg-zinc-700" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
            </div>
          </div>
          {/* Content */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-56 bg-zinc-900 border-r border-zinc-800 p-2 hidden md:block">
              {[
                { name: "Home", active: true },
                { name: "Shorts" },
                { name: "Subscriptions" },
                { name: "You" }
              ].map(item => (
                <div key={item.name} className={cn(
                  "flex items-center gap-4 px-3 py-2.5 rounded-lg cursor-pointer",
                  item.active ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                )}>
                  <div className="w-5 h-5 rounded bg-zinc-700" />
                  <span className={cn("text-sm", item.active ? "text-white font-medium" : "text-zinc-300")}>{item.name}</span>
                </div>
              ))}
            </div>
            {/* Video grid */}
            <div className="flex-1 h-[380px] overflow-y-auto p-4 bg-zinc-900">
              <div className="grid grid-cols-3 gap-4">
                {(displayList as (ComparisonThumbnail & { isUser?: boolean; views?: string })[]).map((thumb) => (
                  <div key={thumb.id} className={cn("rounded-xl overflow-hidden", thumb.isUser && "ring-2 ring-accent")}>
                    <div className="relative aspect-video bg-zinc-800">
                      {thumb.url ? (
                        <img src={getThumbnailFromUrl(thumb.url)} alt={thumb.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-zinc-600" />
                        </div>
                      )}
                      {thumb.isUser && (
                        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-accent text-[9px] font-bold text-accent-foreground">YOUR THUMBNAIL</div>
                      )}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/90 text-[11px] text-white font-medium">12:34</div>
                    </div>
                    <div className="p-3 flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium line-clamp-2 leading-snug">
                          {thumb.title}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">{thumb.channel}</p>
                        <p className="text-xs text-zinc-400">{thumb.views || "1.2M views"} · 2 days ago</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // TV YouTube UI - Smart TV style
  const renderTvUI = () => {
    const displayList = showComparison ? buildDisplayList() : [{ id: "user", url: thumbnailUrl, title: thumbnailTitle, channel: "Your Channel", views: "1.2M views", isUser: true }]
    return (
      <div className="bg-zinc-950 rounded-xl p-4 w-full max-w-[950px] mx-auto shadow-2xl border-[10px] border-zinc-800 relative">
        {/* TV Stand */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-3 bg-zinc-700 rounded-b-lg" />
        <div className="bg-zinc-900 rounded-lg overflow-hidden relative">
          {/* YouTube TV header */}
          <div className="h-16 bg-gradient-to-b from-zinc-900 to-transparent flex items-center px-8 gap-6 absolute top-0 left-0 right-0 z-10">
            <svg className="w-28 h-7" viewBox="0 0 90 20" fill="none">
              <path d="M27.973 18.764V1.236h2.477v7.236l7.032-7.236h3.122l-6.89 6.89 7.26 10.638h-3.03l-5.884-8.74-1.61 1.61v7.13h-2.477z" fill="white"/>
              <rect x="0" y="4" width="24" height="12" rx="3" fill="#FF0000"/>
              <path d="M9.6 7.2v5.6l4.8-2.8L9.6 7.2z" fill="white"/>
            </svg>
            <div className="flex-1" />
            <div className="flex gap-6 text-zinc-400 text-sm">
              <span className="text-white font-medium">Home</span>
              <span>Movies</span>
              <span>Live</span>
              <span>Gaming</span>
            </div>
            <div className="flex items-center gap-4 ml-6">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
            </div>
          </div>
          {/* Video row */}
          <div className="p-8 pt-20 bg-zinc-900">
            <p className="text-white text-lg mb-5 font-medium">Recommended for you</p>
            <div className="flex gap-5 overflow-x-auto pb-4">
              {(displayList as (ComparisonThumbnail & { isUser?: boolean; views?: string })[]).map((thumb, i) => (
                <div key={thumb.id} className={cn(
                  "shrink-0 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer",
                  thumb.isUser && "ring-4 ring-accent scale-105",
                  i === 0 && !thumb.isUser && "ring-2 ring-white/50"
                )} style={{ width: 300 }}>
                  <div className="relative aspect-video bg-zinc-800">
                    {thumb.url ? (
                      <img src={getThumbnailFromUrl(thumb.url)} alt={thumb.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-zinc-600" />
                      </div>
                    )}
                    {thumb.isUser && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-accent text-sm font-bold text-accent-foreground shadow-lg">YOUR THUMBNAIL</div>
                    )}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/90 text-sm text-white font-medium">12:34</div>
                  </div>
                  <div className="p-4 bg-zinc-800/50">
                    <p className="text-base text-white font-medium line-clamp-1">
                      {thumb.title}
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">{thumb.channel} · {thumb.views || "1.2M views"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDevicePreview = () => {
    switch (selectedDevice) {
      case "phone": return renderPhoneUI()
      case "tablet": return renderTabletUI()
      case "pc": return renderDesktopUI()
      case "tv": return renderTvUI()
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">mushub</h1>
            <p className="text-sm text-muted-foreground">{t("nav.thumbnails")}</p>
          </div>
          <Nav />
        </header>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-medium text-foreground">Your Thumbnail</h2>
          <div className="space-y-4">
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                isDragging ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {thumbnailUrl ? (
                <div className="space-y-4">
                  <img 
                    src={getThumbnailFromUrl(thumbnailUrl)} 
                    alt="Your thumbnail" 
                    className="max-h-40 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-muted-foreground">Click or drag to replace</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-foreground font-medium">Drag and drop your thumbnail here</p>
                  <p className="text-xs text-muted-foreground">or click to select a file</p>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">or paste URL</div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                value={thumbnailUrl.startsWith("data:") ? "" : thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="Image URL or YouTube video link"
                className="bg-secondary border-border"
              />
              <Input
                value={thumbnailTitle}
                onChange={(e) => setThumbnailTitle(e.target.value)}
                placeholder="Your video title"
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-foreground">Device Preview</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={shuffleThumbnails} className="gap-2">
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
              <div className="flex items-center gap-2">
                {showComparison ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                <Label htmlFor="comparison-toggle" className="text-sm text-muted-foreground cursor-pointer">Compare</Label>
                <Switch id="comparison-toggle" checked={showComparison} onCheckedChange={setShowComparison} />
              </div>
            </div>
          </div>

          {/* Niche selector */}
          {showComparison && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Niche:</span>
              {allNiches.map(niche => (
                <button
                  key={niche}
                  onClick={() => loadNicheThumbnails(niche)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs capitalize transition-colors",
                    selectedNiche === niche ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {niche}
                </button>
              ))}
              <button
                onClick={() => {
                  localStorage.removeItem("mushub_comparison_thumbnails")
                  setComparisonThumbnails(nicheThumbnails[selectedNiche])
                }}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
                title="Reset to niche defaults"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {(["phone", "tablet", "pc", "tv"] as Device[]).map((device) => {
              const icons = { phone: Smartphone, tablet: Tablet, pc: Monitor, tv: Tv }
              const names = { phone: "Phone", tablet: "Tablet", pc: "Desktop", tv: "TV" }
              const Icon = icons[device]
              return (
                <button
                  key={device}
                  onClick={() => setSelectedDevice(device)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                    selectedDevice === device ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {names[device]}
                </button>
              )
            })}
          </div>

          <div className="rounded-lg bg-secondary/50 p-6 overflow-x-auto">
            {renderDevicePreview()}
          </div>
        </section>

        {showAddComparison && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="rounded-xl border border-border bg-card p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-lg font-medium text-foreground mb-4">Add Comparison Thumbnail</h3>
              <div className="space-y-4">
                <Input value={newComparisonUrl} onChange={(e) => setNewComparisonUrl(e.target.value)} placeholder="YouTube URL or image URL" className="bg-secondary border-border" autoFocus />
                <div className="flex gap-2">
                  <Button onClick={() => setShowAddComparison(false)} variant="outline" className="flex-1">Cancel</Button>
                  <Button onClick={addComparisonThumbnail} className="flex-1 bg-accent hover:bg-accent/80 text-accent-foreground">Add</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
