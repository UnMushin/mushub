import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// ─── Layout ────────────────────────────────────────────────────────────────

export interface WidgetLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
}

export async function saveLayout(uid: string, layout: WidgetLayout[]) {
  await setDoc(doc(db, "users", uid, "settings", "layout"), { layout, updatedAt: serverTimestamp() })
}

export async function getLayout(uid: string): Promise<WidgetLayout[] | null> {
  const snap = await getDoc(doc(db, "users", uid, "settings", "layout"))
  return snap.exists() ? snap.data().layout : null
}

// ─── Settings ──────────────────────────────────────────────────────────────

export interface UserSettings {
  accentColor?: string
  language?: string
  youtubeApiKey?: string
  channelHandle?: string
  notificationsEnabled?: boolean
}

export async function saveSettings(uid: string, settings: Partial<UserSettings>) {
  await setDoc(doc(db, "users", uid, "settings", "prefs"), { ...settings, updatedAt: serverTimestamp() }, { merge: true })
}

export async function getSettings(uid: string): Promise<UserSettings | null> {
  const snap = await getDoc(doc(db, "users", uid, "settings", "prefs"))
  return snap.exists() ? (snap.data() as UserSettings) : null
}

// ─── Ideas ─────────────────────────────────────────────────────────────────

export interface Idea {
  id: string
  title: string
  content: string
  createdAt: string
}

export async function saveIdea(uid: string, idea: Omit<Idea, "id">) {
  const ref = await addDoc(collection(db, "users", uid, "ideas"), {
    ...idea,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getIdeas(uid: string): Promise<Idea[]> {
  const q = query(collection(db, "users", uid, "ideas"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt instanceof Timestamp
      ? d.data().createdAt.toDate().toISOString()
      : d.data().createdAt,
  })) as Idea[]
}

export async function updateIdea(uid: string, id: string, data: Partial<Omit<Idea, "id">>) {
  await updateDoc(doc(db, "users", uid, "ideas", id), data)
}

export async function deleteIdea(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "ideas", id))
}

// ─── YouTube Ideas ─────────────────────────────────────────────────────────

export interface YoutubeIdea {
  id: string
  title: string
  description: string
  thumbnail?: string
  createdAt: string
}

export async function saveYoutubeIdea(uid: string, idea: Omit<YoutubeIdea, "id">) {
  const ref = await addDoc(collection(db, "users", uid, "youtubeIdeas"), {
    ...idea,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getYoutubeIdeas(uid: string): Promise<YoutubeIdea[]> {
  const q = query(collection(db, "users", uid, "youtubeIdeas"), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt instanceof Timestamp
      ? d.data().createdAt.toDate().toISOString()
      : d.data().createdAt,
  })) as YoutubeIdea[]
}

export async function deleteYoutubeIdea(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "youtubeIdeas", id))
}
