"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Pencil, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Nav } from "@/components/nav"
import { useTranslations } from "next-intl"
import { useAuth } from "@/lib/auth-context"
import {
  getIdeas, saveIdea, updateIdea, deleteIdea as deleteIdeaFS,
  Idea
} from "@/lib/firestore"

export default function IdeasPage() {
  const t = useTranslations()
  const { user } = useAuth()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [syncing, setSyncing] = useState(false)

  // Load ideas — Firestore if logged in, else localStorage
  useEffect(() => {
    const load = async () => {
      if (user) {
        setSyncing(true)
        const data = await getIdeas(user.uid)
        setIdeas(data)
        setSyncing(false)
      } else {
        const stored = localStorage.getItem("mushub_ideas")
        if (stored) setIdeas(JSON.parse(stored))
      }
    }
    load()
  }, [user])

  const persist = (next: Idea[]) => {
    setIdeas(next)
    // Always keep localStorage as local cache
    localStorage.setItem("mushub_ideas", JSON.stringify(next))
  }

  const addIdea = async () => {
    if (!newTitle.trim() && !newContent.trim()) return
    const ideaData = {
      title: newTitle.trim() || "Untitled",
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
    }
    // Optimistic local update immediately (works with or without account)
    const tempId = Date.now().toString()
    const newIdea: Idea = { id: tempId, ...ideaData }
    const next = [newIdea, ...ideas]
    persist(next)
    setNewTitle("")
    setNewContent("")
    // Sync to Firestore in background if logged in
    if (user) {
      setSyncing(true)
      try {
        const realId = await saveIdea(user.uid, ideaData)
        // Replace temp id with real Firestore id
        setIdeas(prev => prev.map(i => i.id === tempId ? { ...i, id: realId } : i))
        // Update localStorage with real id too
        const stored = JSON.parse(localStorage.getItem("mushub_ideas") || "[]") as Idea[]
        localStorage.setItem("mushub_ideas", JSON.stringify(
          stored.map(i => i.id === tempId ? { ...i, id: realId } : i)
        ))
      } catch (e) {
        console.error("Firestore save failed, idea kept locally:", e)
      } finally {
        setSyncing(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic removal immediately (works logged in or not)
    const next = ideas.filter(i => i.id !== id)
    persist(next) // updates state + localStorage
    if (user) {
      try { await deleteIdeaFS(user.uid, id) } catch (e) {
        console.error("Delete failed:", e)
        // Rollback if Firestore delete fails
        persist([...next, ideas.find(i => i.id === id)!].sort(
          (a, b) => b.createdAt.localeCompare(a.createdAt)
        ))
      }
    }
  }

  const startEdit = (idea: Idea) => {
    setEditingId(idea.id)
    setEditTitle(idea.title)
    setEditContent(idea.content)
  }

  const saveEdit = async () => {
    if (!editingId) return
    const updates = { title: editTitle, content: editContent }
    if (user) {
      await updateIdea(user.uid, editingId, updates)
      setIdeas(prev => prev.map(i => i.id === editingId ? { ...i, ...updates } : i))
    } else {
      persist(ideas.map(i => i.id === editingId ? { ...i, ...updates } : i))
    }
    setEditingId(null)
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">mushub</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {t("ideas.pageTitle")}
              {syncing && <Loader2 className="h-3 w-3 animate-spin" />}
            </p>
          </div>
          <Nav />
        </header>

        {/* New idea form */}
        <section className="rounded-xl border border-border bg-card p-6 animate-in fade-in duration-300">
          <h2 className="mb-4 text-lg font-medium text-foreground">{t("ideas.newIdea")}</h2>
          <div className="space-y-3">
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder={t("ideas.titlePlaceholder")}
              className="bg-secondary border-border"
              onKeyDown={e => e.key === "Enter" && addIdea()}
            />
            <Textarea
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder={t("ideas.contentPlaceholder")}
              className="min-h-[120px] bg-secondary border-border resize-none"
            />
            <Button onClick={addIdea} className="bg-accent hover:bg-accent/80 text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" />{t("ideas.save")}
            </Button>
          </div>
        </section>

        {/* Ideas list */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-foreground">
            {t("ideas.yourIdeas")} ({ideas.length})
          </h2>
          {ideas.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">{t("ideas.noIdeas")}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {ideas.map((idea, index) => (
                <div
                  key={idea.id}
                  className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/50 animate-in fade-in duration-200"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {editingId === idea.id ? (
                    <div className="space-y-2">
                      <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-secondary border-border text-sm" />
                      <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="bg-secondary border-border text-sm resize-none min-h-[80px]" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} className="bg-accent hover:bg-accent/80 text-accent-foreground">
                          <Check className="h-3.5 w-3.5 mr-1" />{t("ideas.saveEdit")}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5 mr-1" />{t("ideas.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-foreground">{idea.title}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => startEdit(idea)} className="p-1 rounded text-muted-foreground hover:text-accent hover:bg-secondary transition-colors" title={t("ideas.edit")}>
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(idea.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors" title={t("ideas.delete")}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {idea.content && (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{idea.content}</p>
                      )}
                      <p className="mt-3 text-xs text-muted-foreground/50">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
