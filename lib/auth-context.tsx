"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth"
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
  showSignOutWarning: boolean
  setShowSignOutWarning: (v: boolean) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null)
  const [showSignOutWarning, setShowSignOutWarning] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000)
    const unsub = onAuthStateChanged(auth, async (u) => {
      clearTimeout(timeout)
      setUser(u)
      if (u) {
        try {
          const s = await getSettings(u.uid)
          setSettings(s)
          const token = localStorage.getItem(`yt_token_${u.uid}`)
          if (token) setYoutubeToken(token)
        } catch (e) {
          console.error("Settings load error:", e)
        }
      } else {
        setSettings(null)
        setYoutubeToken(null)
      }
      setLoading(false)
    })
    return () => { unsub(); clearTimeout(timeout) }
  }, [])

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const { GoogleAuthProvider } = await import("firebase/auth")
      const credential = GoogleAuthProvider.credentialFromResult(result)
      if (credential?.accessToken) {
        setYoutubeToken(credential.accessToken)
        localStorage.setItem(`yt_token_${result.user.uid}`, credential.accessToken)
      }
    } catch (e: any) {
      // popup closed by user - not an error
      if (e?.code !== "auth/popup-closed-by-user") console.error(e)
    }
  }

  const handleSignOut = async () => {
    if (user) localStorage.removeItem(`yt_token_${user.uid}`)
    await firebaseSignOut(auth)
    setYoutubeToken(null)
    setShowSignOutWarning(false)
  }

  const updateSettings = async (s: Partial<UserSettings>) => {
    if (!user) return
    const next = { ...settings, ...s } as UserSettings
    setSettings(next)
    await saveSettings(user.uid, s)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, settings,
      signIn: handleSignIn,
      signOut: handleSignOut,
      updateSettings,
      youtubeToken,
      showSignOutWarning,
      setShowSignOutWarning,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
