"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"
import { auth, googleProvider } from "./firebase"
import { getSettings, saveSettings, UserSettings } from "./firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  settings: UserSettings | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  updateSettings: (s: Partial<UserSettings>) => Promise<void>
  youtubeToken: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const s = await getSettings(u.uid)
        setSettings(s)
        // Try to get YouTube token from credential
        const token = localStorage.getItem(`yt_token_${u.uid}`)
        if (token) setYoutubeToken(token)
      } else {
        setSettings(null)
        setYoutubeToken(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const handleSignIn = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    // Capture YouTube OAuth token from Google sign-in
    const { GoogleAuthProvider } = await import("firebase/auth")
    const credential = GoogleAuthProvider.credentialFromResult(result)
    if (credential?.accessToken) {
      setYoutubeToken(credential.accessToken)
      localStorage.setItem(`yt_token_${result.user.uid}`, credential.accessToken)
    }
  }

  const handleSignOut = async () => {
    if (user) localStorage.removeItem(`yt_token_${user.uid}`)
    await signOut(auth)
    setYoutubeToken(null)
  }

  const updateSettings = async (s: Partial<UserSettings>) => {
    if (!user) return
    const next = { ...settings, ...s }
    setSettings(next)
    await saveSettings(user.uid, s)
  }

  return (
    <AuthContext.Provider value={{ user, loading, settings, signIn: handleSignIn, signOut: handleSignOut, updateSettings, youtubeToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
