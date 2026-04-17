"use client"

import { useState, useEffect, useRef } from "react"
import { Nav } from "@/components/nav"
import { Plus, Trash2, AlertTriangle, CheckCircle, AlertCircle, Upload, ImageIcon, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import { getYoutubeIdeas, saveYoutubeIdea, deleteYoutubeIdea, YoutubeIdea } from "@/lib/firestore"

interface VideoIdea {
  id: string
  title: string
  description: string
  thumbnail?: string
  createdAt: Date
}

const TITLE_LIMITS = {
  safe: 50,
  warning: 70,
  max: 100,
}

function getTitleStatus(length: number) {
  if (length === 0) return { status: "empty", color: "text-muted-foreground", message: "Start typing your title" }
  if (length <= TITLE_LIMITS.safe) return { status: "good", color: "text-accent", message: "Great! Title won't be cropped" }
  if (length <= TITLE_LIMITS.warning) return { status: "warning", color: "text-yellow-500", message: "May be cropped on mobile" }
  if (length <= TITLE_LIMITS.max) return { status: "danger", color: "text-orange-500", message: "Will be cropped on most screens" }
  return { status: "over", color: "text-destructive", message: "Too long! Will definitely be cropped" }
}

function StatusIcon({ status }: { status: string }) {
  if (status === "good") return <CheckCircle className="h-4 w-4" />
  if (status === "warning") return <AlertCircle className="h-4 w-4" />
  if (status === "danger" || status === "over") return <AlertTriangle className="h-4 w-4" />
  return null
}

export default function YouTubeIdeasPage() {
  const t = useTranslations()
  const { user, loading } = useAuth()
  const [ideas, setIdeas] = useState<VideoIdea[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newThumbnail, setNewThumbnail] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Attend que Firebase ait résolu l'état auth AVANT de charger les données
  useEffect(() => {
    if (loading) return
    const load = async () => {
      if (user) {
        setSyncing(true)
        try {
          const data = await getYoutubeIdeas(user.uid)
          // YoutubeIdea.createdAt est string ISO, VideoIdea.createdAt est Date
          setIdeas(data.map(d => ({ ...d, createdAt: new Date(d.createdAt) })))
        } catch (e) {
          console.error("Firestore load error:", e)
          const stored = localStorage.getItem("mushub_youtube_ideas")
          if (stored) setIdeas(JSON.parse(stored))
        } finally {
          setSyncing(false)
        }
      } else {
        const stored = localStorage.getItem("mushub_youtube_ideas")
        if (stored) setIdeas(JSON.parse(stored))
      }
    }
    load()
  }, [user, loading])

  const persist = (next: VideoIdea[]) => {
    setIdeas(next)
    localStorage.setItem("mushub_youtube_ideas", JSON.stringify(next))
  }

  const addIdea = async () => {
    if (!newTitle.trim()) return
    const ideaData = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      thumbnail: newThumbnail,
      createdAt: new Date().toISOString(),
    }
    const tempId = Date.now().toString()
    const newIdea: VideoIdea = { id: tempId, ...ideaData, createdAt: new Date() }
    persist([newIdea, ...ideas])
    setNewTitle("")
    setNewDescription("")
    setNewThumbnail("")

    if (user) {
      setSyncing(true)
      try {
        const realId = await saveYoutubeIdea(user.uid, ideaData)
        setIdeas(prev => prev.map(i => i.id === tempId ? { ...i, id: realId } : i))
        const stored = JSON.parse(localStorage.getItem("mushub_youtube_ideas") || "[]") as VideoIdea[]
        localStorage.setItem("mushub_youtube_ideas", JSON.stringify(
          stored.map(i => i.id === tempId ? { ...i, id: realId } : i)
        ))
      } catch (e) {
        console.error("Firestore save failed:", e)
      } finally {
        setSyncing(false)
      }
    }
  }

  const deleteIdea = async (id: string) => {
    if (user) {
      await deleteYoutubeIdea(user.uid, id)
      setIdeas(prev => prev.filter(i => i.id !== id))
    } else {
      persist(ideas.filter(i => i.id !== id))
    }
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
            setNewThumbnail(event.target.result as string)
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
            setNewThumbnail(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const titleStatus = getTitleStatus(newTitle.length)

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">mushub</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {t("nav.youtube")}
              {syncing && <Loader2 className="h-3 w-3 animate-spin" />}
            </p>
          </div>
          <Nav />
        </header>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-medium text-foreground mb-4">New Video Idea</h2>
          
          <div className="space-y-4">
            {/* Thumbnail upload */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Thumbnail / Draft</label>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
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
                {newThumbnail ? (
                  <div className="relative inline-block">
                    <img 
                      src={newThumbnail} 
                      alt="Thumbnail draft" 
                      className="max-h-32 rounded-lg object-contain"
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setNewThumbnail("") }}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drop thumbnail draft here or click to upload</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Title</label>
                <div className={cn("flex items-center gap-1.5 text-xs", titleStatus.color)}>
                  <StatusIcon status={titleStatus.status} />
                  <span>{newTitle.length}/{TITLE_LIMITS.max}</span>
                </div>
              </div>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter your video title..."
                className="bg-secondary border-border"
                maxLength={150}
              />
              <p className={cn("text-xs", titleStatus.color)}>
                {titleStatus.message}
              </p>
              
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    titleStatus.status === "good" && "bg-accent",
                    titleStatus.status === "warning" && "bg-yellow-500",
                    titleStatus.status === "danger" && "bg-orange-500",
                    titleStatus.status === "over" && "bg-destructive",
                    titleStatus.status === "empty" && "bg-muted"
                  )}
                  style={{ width: `${Math.min((newTitle.length / TITLE_LIMITS.max) * 100, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span className="text-accent">{TITLE_LIMITS.safe} safe</span>
                <span className="text-yellow-500">{TITLE_LIMITS.warning}</span>
                <span>{TITLE_LIMITS.max}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Description / Notes</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add notes, talking points, or a description..."
                className="bg-secondary border-border min-h-24 resize-none"
              />
            </div>

            <Button
              onClick={addIdea}
              disabled={!newTitle.trim()}
              className="w-full bg-accent hover:bg-accent/80 text-accent-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Save Idea
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">Saved Ideas ({ideas.length})</h2>
          
          {ideas.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">No ideas saved yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => {
                const status = getTitleStatus(idea.title.length)
                return (
                  <div
                    key={idea.id}
                    className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/50"
                  >
                    <div className="flex items-start gap-4">
                      {idea.thumbnail && (
                        <img 
                          src={idea.thumbnail} 
                          alt="Thumbnail" 
                          className="w-24 h-14 rounded object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">{idea.title}</h3>
                          <span className={cn("text-xs flex items-center gap-1 shrink-0", status.color)}>
                            <StatusIcon status={status.status} />
                            {idea.title.length}
                          </span>
                        </div>
                        {idea.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteIdea(idea.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete idea</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
