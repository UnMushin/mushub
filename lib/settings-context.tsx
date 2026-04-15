"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type AccentColor = "green" | "blue" | "yellow" | "red" | "purple"
export type Language = "en" | "fr" | "es" | "de" | "ja"

interface Settings {
  accentColor: AccentColor
  language: Language
}

interface SettingsContextType {
  settings: Settings
  updateAccentColor: (color: AccentColor) => void
  updateLanguage: (lang: Language) => void
}

const defaultSettings: Settings = {
  accentColor: "green",
  language: "en",
}

export const accentColors: Record<AccentColor, { hue: number; name: string }> = {
  green:  { hue: 145, name: "Green" },
  blue:   { hue: 220, name: "Blue" },
  yellow: { hue: 45,  name: "Yellow" },
  red:    { hue: 0,   name: "Red" },
  purple: { hue: 280, name: "Purple" },
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("mushub_settings_v2")
    if (stored) {
      try { setSettings({ ...defaultSettings, ...JSON.parse(stored) }) } catch {}
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem("mushub_settings_v2", JSON.stringify(settings))
    // Apply accent color
    const hue = accentColors[settings.accentColor].hue
    document.documentElement.style.setProperty("--accent", `oklch(0.65 0.18 ${hue})`)
    document.documentElement.style.setProperty("--ring", `oklch(0.65 0.18 ${hue})`)
    // Set locale cookie for next-intl (server-side picks it up on next navigation)
    document.cookie = `mushub_locale=${settings.language};path=/;max-age=31536000`
  }, [settings, isLoaded])

  const updateAccentColor = (color: AccentColor) =>
    setSettings(prev => ({ ...prev, accentColor: color }))

  const updateLanguage = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }))
    // Reload so next-intl server picks up the new cookie
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateAccentColor, updateLanguage }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider")
  return ctx
}
