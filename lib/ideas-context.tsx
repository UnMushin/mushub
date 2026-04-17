"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react"
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp
} from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-context"
import { Idea, YoutubeIdea } from "./firestore"

interface IdeasContextType {
  ideas: Idea[]
  youtubeIdeas: YoutubeIdea[]
  syncing: boolean
  addIdea: (data: Omit<Idea, "id">) => Promise<string>
  updateIdea: (id: string, data: Partial<Omit<Idea, "id">>) => Promise<void>
  deleteIdea: (id: string) => Promise<void>
  addYoutubeIdea: (data: Omit<YoutubeIdea, "id">) => Promise<string>
  deleteYoutubeIdea: (id: string) => Promise<void>
}

const IdeasContext = createContext<IdeasContextType | null>(null)

function localGet<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]") } catch { return [] }
}
function localSet<T>(key: string, data: T[]) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

export function IdeasProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [youtubeIdeas, setYoutubeIdeas] = useState<YoutubeIdea[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!user) {
      // Non connecté : utiliser localStorage
      setIdeas(localGet<Idea>("mushub_ideas"))
      setYoutubeIdeas(localGet<YoutubeIdea>("mushub_youtube_ideas"))
      return
    }

    setSyncing(true)

    // onSnapshot = écoute en temps réel — mise à jour automatique sur tous les appareils
    const unsubIdeas = onSnapshot(
      query(collection(db, "users", user.uid, "ideas"), orderBy("createdAt", "desc")),
      (snap) => {
        const data = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt instanceof Timestamp
            ? d.data().createdAt.toDate().toISOString()
            : d.data().createdAt,
        })) as Idea[]
        setIdeas(data)
        localSet("mushub_ideas", data) // cache local à jour
        setSyncing(false)
      },
      (err) => {
        console.error("Ideas snapshot error:", err)
        setIdeas(localGet<Idea>("mushub_ideas"))
        setSyncing(false)
      }
    )

    const unsubYoutube = onSnapshot(
      query(collection(db, "users", user.uid, "youtubeIdeas"), orderBy("createdAt", "desc")),
      (snap) => {
        const data = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt instanceof Timestamp
            ? d.data().createdAt.toDate().toISOString()
            : d.data().createdAt,
        })) as YoutubeIdea[]
        setYoutubeIdeas(data)
        localSet("mushub_youtube_ideas", data)
      },
      (err) => console.error("YoutubeIdeas snapshot error:", err)
    )

    return () => { unsubIdeas(); unsubYoutube() }
  }, [user, loading])

  const addIdea = useCallback(async (data: Omit<Idea, "id">): Promise<string> => {
    const ideaData = { ...data, createdAt: data.createdAt || new Date().toISOString() }
    if (user) {
      const ref = await addDoc(collection(db, "users", user.uid, "ideas"), ideaData)
      return ref.id
    } else {
      const id = Date.now().toString()
      const newIdeas = [{ id, ...ideaData }, ...ideas]
      setIdeas(newIdeas)
      localSet("mushub_ideas", newIdeas)
      return id
    }
  }, [user, ideas])

  const updateIdea = useCallback(async (id: string, data: Partial<Omit<Idea, "id">>) => {
    if (user) {
      await updateDoc(doc(db, "users", user.uid, "ideas", id), data)
    } else {
      const updated = ideas.map(i => i.id === id ? { ...i, ...data } : i)
      setIdeas(updated)
      localSet("mushub_ideas", updated)
    }
  }, [user, ideas])

  const deleteIdea = useCallback(async (id: string) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "ideas", id))
    } else {
      const updated = ideas.filter(i => i.id !== id)
      setIdeas(updated)
      localSet("mushub_ideas", updated)
    }
  }, [user, ideas])

  const addYoutubeIdea = useCallback(async (data: Omit<YoutubeIdea, "id">): Promise<string> => {
    const ideaData = { ...data, createdAt: data.createdAt || new Date().toISOString() }
    if (user) {
      const ref = await addDoc(collection(db, "users", user.uid, "youtubeIdeas"), ideaData)
      return ref.id
    } else {
      const id = Date.now().toString()
      const newIdeas = [{ id, ...ideaData }, ...youtubeIdeas]
      setYoutubeIdeas(newIdeas)
      localSet("mushub_youtube_ideas", newIdeas)
      return id
    }
  }, [user, youtubeIdeas])

  const deleteYoutubeIdea = useCallback(async (id: string) => {
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "youtubeIdeas", id))
    } else {
      const updated = youtubeIdeas.filter(i => i.id !== id)
      setYoutubeIdeas(updated)
      localSet("mushub_youtube_ideas", updated)
    }
  }, [user, youtubeIdeas])

  return (
    <IdeasContext.Provider value={{
      ideas, youtubeIdeas, syncing,
      addIdea, updateIdea, deleteIdea,
      addYoutubeIdea, deleteYoutubeIdea,
    }}>
      {children}
    </IdeasContext.Provider>
  )
}

export function useIdeas() {
  const ctx = useContext(IdeasContext)
  if (!ctx) throw new Error("useIdeas must be used within IdeasProvider")
  return ctx
}
