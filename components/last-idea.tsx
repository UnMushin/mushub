"use client"

import { useEffect, useState } from "react"
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { getIdeas, Idea } from "@/lib/firestore"

interface LastIdeaProps { apiKey?: string }

export function LastIdea(_props: LastIdeaProps) {
  const t = useTranslations()
  const { user } = useAuth()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (user) {
        const data = await getIdeas(user.uid)
        setIdeas(data)
      } else {
        const stored = localStorage.getItem("mushub_ideas")
        if (stored) setIdeas(JSON.parse(stored))
      }
    }
    load()
  }, [user])

  const lastIdea = ideas[0] ?? null
  const history = ideas.slice(1)

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">{t("idea.title")}</h2>
        <Link href="/ideas" className="text-xs text-muted-foreground hover:text-accent transition-colors">
          {t("idea.viewAll")}
        </Link>
      </div>

      {lastIdea ? (
        <div className="flex-1 flex flex-col space-y-3">
          {/* Latest idea - highlighted */}
          <div className="flex items-start gap-3 rounded-lg bg-accent/10 border border-accent/20 p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/20">
              <Lightbulb className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm truncate">{lastIdea.title}</h3>
              {lastIdea.content && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-3 leading-relaxed">{lastIdea.content}</p>
              )}
            </div>
          </div>

          {/* History toggle */}
          {history.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(v => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {history.length} older idea{history.length !== 1 ? "s" : ""}
              </button>

              {showHistory && (
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {history.map(idea => (
                    <div key={idea.id} className="rounded-lg bg-secondary/50 p-2.5 space-y-1">
                      <p className="text-xs font-medium text-foreground truncate">{idea.title}</p>
                      {idea.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{idea.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
          <Lightbulb className="h-8 w-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">{t("idea.noIdea")}</p>
          <Link href="/ideas" className="mt-2 text-xs text-accent hover:underline">{t("idea.addFirst")}</Link>
        </div>
      )}
    </div>
  )
}
