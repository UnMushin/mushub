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
import { LogIn, Info } from "lucide-react"
import dynamic from "next/dynamic"

const GridLayout = dynamic(
  () => import("react-grid-layout").then(m => m.default),
  { ssr: false }
)

type WidgetId = "quick-links" | "last-video" | "last-idea" | "todo-list"

const widgetComponents: Record<WidgetId, React.ComponentType<{ apiKey?: string }>> = {
  "quick-links": QuickLinks,
  "last-video": LastVideo,
  "last-idea": LastIdea,
  "todo-list": TodoList,
}

const defaultLayout: WidgetLayout[] = [
  { i: "quick-links", x: 0, y: 0, w: 3, h: 4 },
  { i: "last-video",  x: 3, y: 0, w: 3, h: 4 },
  { i: "last-idea",   x: 6, y: 0, w: 3, h: 4 },
  { i: "todo-list",   x: 9, y: 0, w: 3, h: 4 },
]

const LOCAL_KEY = "mushub_layout_v4"

export default function Home() {
  const t = useTranslations()
  const { user, loading: authLoading, signIn, settings } = useAuth()
  const [apiKey, setApiKey] = useState("")
  const [layout, setLayout] = useState<WidgetLayout[]>(defaultLayout)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    const load = async () => {
      const key = localStorage.getItem("mushub_youtube_api_key") || settings?.youtubeApiKey || ""
      setApiKey(key)
      if (user) {
        const saved = await getLayout(user.uid)
        if (saved) { setLayout(saved); setIsLoaded(true); return }
      }
      const local = localStorage.getItem(LOCAL_KEY)
      if (local) { try { setLayout(JSON.parse(local)) } catch {} }
      setIsLoaded(true)
    }
    if (!authLoading) load()
  }, [user, authLoading, settings])

  const handleLayoutChange = useCallback(async (newLayout: any[]) => {
    setLayout(newLayout)
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newLayout))
    if (user) await saveLayout(user.uid, newLayout)
  }, [user])

  const handleApiKeyChange = (key: string) => {
    setApiKey(key)
    localStorage.setItem("mushub_youtube_api_key", key)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1400px] space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("hub.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("hub.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            {!user && (
              <button
                onClick={signIn}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm hover:bg-accent/80 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.signIn")}
              </button>
            )}
            <Nav />
          </div>
        </header>

        <ChannelStats apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />

        <div className="flex items-center gap-2">
          <button onClick={() => setShowHint(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
            <Info className="h-4 w-4" />
          </button>
          {showHint && (
            <p className="text-xs text-muted-foreground animate-in fade-in duration-200">{t("hub.dragHint")}</p>
          )}
          {user && (
            <span className="ml-auto text-xs text-muted-foreground">☁️ {t("settings.dataSync")}</span>
          )}
        </div>

        {isLoaded && (
          <div className="w-full">
            <GridLayout
              layout={layout}
              cols={12}
              rowHeight={80}
              width={1400}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".drag-handle"
              resizeHandles={["se", "sw", "ne", "nw", "e", "w", "s", "n"]}
              margin={[12, 12]}
              containerPadding={[0, 0]}
              compactType="vertical"
            >
              {layout.map(item => {
                const id = item.i as WidgetId
                const Component = widgetComponents[id]
                if (!Component) return null
                return (
                  <div
                    key={id}
                    className={cn(
                      "rounded-xl border-2 border-border bg-card p-5",
                      "hover:border-accent/30 transition-colors group overflow-hidden relative"
                    )}
                  >
                    <div className="drag-handle absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing hover:bg-secondary z-10">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="5" cy="4" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                        <circle cx="5" cy="8" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                        <circle cx="5" cy="12" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                        <circle cx="11" cy="4" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                        <circle cx="11" cy="8" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                        <circle cx="11" cy="12" r="1.5" fill="currentColor" className="text-muted-foreground"/>
                      </svg>
                    </div>
                    <Component apiKey={apiKey} />
                  </div>
                )
              })}
            </GridLayout>
          </div>
        )}
      </div>
      <style>{`
        .react-grid-item.react-grid-placeholder { background: hsl(var(--accent) / 0.15); border: 2px dashed hsl(var(--accent) / 0.5); border-radius: 12px; }
        .react-resizable-handle { opacity: 0; transition: opacity 200ms; }
        .react-grid-item:hover .react-resizable-handle { opacity: 1; }
      `}</style>
    </main>
  )
}
