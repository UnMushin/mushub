"use client"

import { useState, useEffect, useCallback } from "react"
import { TodoList } from "@/components/todo-list"
import { QuickLinks } from "@/components/quick-links"
import { LastVideo } from "@/components/last-video"
import { LastIdea } from "@/components/last-idea"
import { ChannelStats } from "@/components/channel-stats"
import { Nav } from "@/components/nav"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { saveLayout, getLayout, WidgetLayout } from "@/lib/firestore"
import { cn } from "@/lib/utils"
import { LogIn } from "lucide-react"
import dynamic from "next/dynamic"

const GridLayout = dynamic(
  () => import("react-grid-layout").then(m => m.default),
  { ssr: false }
)

// Import CSS for react-grid-layout
import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

type WidgetId = "quick-links" | "last-video" | "last-idea" | "todo-list"

const widgetComponents: Record<WidgetId, React.ComponentType<{ apiKey?: string }>> = {
  "quick-links": QuickLinks,
  "last-video": LastVideo,
  "last-idea": LastIdea,
  "todo-list": TodoList,
}

const WIDGET_IDS: WidgetId[] = ["quick-links", "last-video", "last-idea", "todo-list"]

const defaultLayout: WidgetLayout[] = [
  { i: "quick-links", x: 0, y: 0, w: 3, h: 5 },
  { i: "last-video",  x: 3, y: 0, w: 3, h: 5 },
  { i: "last-idea",   x: 6, y: 0, w: 3, h: 5 },
  { i: "todo-list",   x: 9, y: 0, w: 3, h: 5 },
]

const LOCAL_KEY = "mushub_layout_v5"

// Hook to get responsive grid width
function useGridWidth() {
  const [width, setWidth] = useState(1200)
  useEffect(() => {
    const update = () => {
      // On mobile use full width minus padding, on desktop cap at 1400
      setWidth(Math.min(window.innerWidth - 32, 1400))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return width
}

export default function Home() {
  const t = useTranslations()
  const { user, loading: authLoading, signIn, settings } = useAuth()
  const [apiKey, setApiKey] = useState("")
  const [layout, setLayout] = useState<WidgetLayout[]>(defaultLayout)
  const [isLoaded, setIsLoaded] = useState(true) // show widgets immediately
  const gridWidth = useGridWidth()

  // Responsive cols: 1 col on mobile, 2 on tablet, 12 on desktop
  const isMobile = gridWidth < 640
  const isTablet = gridWidth < 1024
  const cols = isMobile ? 1 : isTablet ? 2 : 12

  // Adapt default layout for mobile/tablet
  const getResponsiveLayout = (base: WidgetLayout[]): WidgetLayout[] => {
    if (isMobile) {
      return WIDGET_IDS.map((id, i) => ({ i: id, x: 0, y: i * 5, w: 1, h: 5 }))
    }
    if (isTablet) {
      return WIDGET_IDS.map((id, i) => ({ i: id, x: i % 2, y: Math.floor(i / 2) * 5, w: 1, h: 5 }))
    }
    return base
  }

  useEffect(() => {
    const load = async () => {
      const key = localStorage.getItem("mushub_youtube_api_key") || settings?.youtubeApiKey || ""
      setApiKey(key)

      // Load local layout immediately so widgets show right away
      const local = localStorage.getItem(LOCAL_KEY)
      if (local) {
        try {
          const parsed = JSON.parse(local)
          if (parsed.length > 0) setLayout(parsed)
        } catch {}
      }

      // Then sync from Firestore in background
      if (user) {
        if (key && !settings?.youtubeApiKey) {
          const { saveSettings } = await import("@/lib/firestore")
          await saveSettings(user.uid, { youtubeApiKey: key, channelHandle: localStorage.getItem("mushub_channel_handle") || "" })
        }
        try {
          const saved = await getLayout(user.uid)
          if (saved && saved.length > 0) {
            setLayout(saved)
            localStorage.setItem(LOCAL_KEY, JSON.stringify(saved))
          }
        } catch (e) {
          console.error("Layout sync error:", e)
        }
      }
    }
    if (!authLoading) load()
  }, [user, authLoading, settings])

  // Load API key from Firestore settings when user signs in
  useEffect(() => {
    if (user && settings?.youtubeApiKey && !apiKey) {
      setApiKey(settings.youtubeApiKey)
      localStorage.setItem("mushub_youtube_api_key", settings.youtubeApiKey)
    }
    if (user && settings?.channelHandle) {
      localStorage.setItem("mushub_channel_handle", settings.channelHandle)
    }
  }, [user, settings, apiKey])

  const handleLayoutChange = useCallback(async (newLayout: any[]) => {
    // Only save desktop layout
    if (!isMobile && !isTablet) {
      setLayout(newLayout)
      localStorage.setItem(LOCAL_KEY, JSON.stringify(newLayout))
      if (user) await saveLayout(user.uid, newLayout)
    }
  }, [user, isMobile, isTablet])

  const handleApiKeyChange = async (key: string) => {
    setApiKey(key)
    localStorage.setItem("mushub_youtube_api_key", key)
    if (user) {
      const handle = localStorage.getItem("mushub_channel_handle") || ""
      const { saveSettings } = await import("@/lib/firestore")
      await saveSettings(user.uid, { youtubeApiKey: key, channelHandle: handle })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  const activeLayout = isLoaded ? getResponsiveLayout(layout) : getResponsiveLayout(defaultLayout)

  return (
    <main className="min-h-screen px-2 py-6 md:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px] space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between px-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{t("hub.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("hub.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {!user && (
              <button
                onClick={signIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-sm hover:bg-accent/80 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </button>
            )}
            <Nav />
          </div>
        </header>

        {/* Channel stats */}
        <div className="px-2">
          <ChannelStats apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        </div>

        {/* Sync indicator */}
        {user && (
          <p className="text-xs text-muted-foreground px-2">☁️ {t("settings.dataSync")}</p>
        )}

        {/* Grid */}
        {isLoaded && (
          <div className="w-full overflow-x-hidden">
            <GridLayout
              layout={activeLayout}
              cols={cols}
              rowHeight={isMobile ? 70 : 72}
              width={gridWidth}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              resizeHandles={isMobile ? [] : ["se", "sw", "ne", "nw", "e", "w", "s", "n"]}
              margin={isMobile ? [8, 8] : [12, 12]}
              containerPadding={[8, 0]}
              compactType="vertical"
              isDraggable={!isMobile}
              isResizable={!isMobile}
            >
              {activeLayout.map(item => {
                const id = item.i as WidgetId
                const Component = widgetComponents[id]
                if (!Component) return null
                return (
                  <div
                    key={id}
                    className={cn(
                      "rounded-xl border-2 border-border bg-card",
                      "hover:border-accent/30 transition-colors group overflow-hidden relative",
                      isMobile ? "p-4" : "p-5"
                    )}
                  >
                    {/* Drag handle - desktop only */}
                    {!isMobile && (
                      <div className="drag-handle absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-secondary z-10">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="5" cy="4" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                          <circle cx="5" cy="8" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                          <circle cx="5" cy="12" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                          <circle cx="11" cy="4" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                          <circle cx="11" cy="8" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                          <circle cx="11" cy="12" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                        </svg>
                      </div>
                    )}
                    <Component apiKey={apiKey} />
                  </div>
                )
              })}
            </GridLayout>
          </div>
        )}
      </div>

      <style>{`
        .react-grid-item.react-grid-placeholder {
          background: oklch(0.65 0.18 145 / 0.15) !important;
          border: 2px dashed oklch(0.65 0.18 145 / 0.5) !important;
          border-radius: 12px !important;
        }
        .react-resizable-handle { opacity: 0; transition: opacity 200ms; }
        .react-grid-item:hover .react-resizable-handle { opacity: 1; }
        .react-resizable-handle::after { border-color: currentColor !important; }
        /* Hide react-grid-layout default styles that conflict */
        .react-grid-layout { position: relative; }
      `}</style>
    </main>
  )
}
