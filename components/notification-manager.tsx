"use client"

import { useEffect, useRef, useCallback, useState } from "react"

function getThreshold(subsPerMin: number): number {
  if (subsPerMin < 0.1) return 1
  if (subsPerMin < 1) return 5
  if (subsPerMin < 10) return 10
  if (subsPerMin < 50) return 100
  if (subsPerMin < 200) return 500
  return 1000
}

export function useAdaptiveNotifications(
  currentCount: number,
  enabled: boolean,
  channelName: string
) {
  const prevCountRef = useRef<number | null>(null)
  const countHistoryRef = useRef<{ count: number; time: number }[]>([])
  const lastNotifCountRef = useRef<number | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>("default")

  // Request permission when enabled
  useEffect(() => {
    if (!enabled) return
    if (typeof window === "undefined" || !("Notification" in window)) return

    if (Notification.permission === "granted") {
      setPermission("granted")
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(p => setPermission(p))
    } else {
      setPermission("denied")
    }
  }, [enabled])

  const sendNotification = useCallback((gained: number, total: number) => {
    if (permission !== "granted") return
    if (typeof window === "undefined" || !("Notification" in window)) return

    const title = gained === 1
      ? `🎉 New subscriber on ${channelName}!`
      : `🚀 +${gained.toLocaleString()} new subscribers on ${channelName}!`

    try {
      const notif = new Notification(title, {
        body: `You now have ${total.toLocaleString()} subscribers`,
        icon: "/icon.svg",
        tag: "mushub-subs",
        silent: false,
      })
      // Auto-close after 5s
      setTimeout(() => notif.close(), 5000)
    } catch (e) {
      console.warn("Notification failed:", e)
    }
  }, [channelName, permission])

  useEffect(() => {
    if (!enabled || currentCount === 0 || permission !== "granted") return

    // First load — set baseline, don't notify
    if (prevCountRef.current === null) {
      prevCountRef.current = currentCount
      lastNotifCountRef.current = currentCount
      return
    }

    const gained = currentCount - prevCountRef.current
    if (gained <= 0) {
      prevCountRef.current = currentCount
      return
    }

    // Track velocity
    const now = Date.now()
    countHistoryRef.current.push({ count: currentCount, time: now })
    countHistoryRef.current = countHistoryRef.current.filter(h => now - h.time < 5 * 60 * 1000)

    let subsPerMin = 0
    if (countHistoryRef.current.length >= 2) {
      const oldest = countHistoryRef.current[0]
      const newest = countHistoryRef.current[countHistoryRef.current.length - 1]
      const elapsed = (newest.time - oldest.time) / 60000
      subsPerMin = elapsed > 0 ? (newest.count - oldest.count) / elapsed : 0
    }

    const threshold = getThreshold(subsPerMin)
    const sinceLastNotif = currentCount - (lastNotifCountRef.current ?? currentCount)

    if (sinceLastNotif >= threshold) {
      sendNotification(sinceLastNotif, currentCount)
      lastNotifCountRef.current = currentCount
    }

    prevCountRef.current = currentCount
  }, [currentCount, enabled, permission, sendNotification])

  return { permission }
}

export function NotificationToggle({
  enabled,
  onToggle,
  label,
  labelOn,
  labelDenied,
}: {
  enabled: boolean
  onToggle: (v: boolean) => void
  label: string
  labelOn: string
  labelDenied: string
}) {
  const [perm, setPerm] = useState<NotificationPermission>("default")

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPerm(Notification.permission)
    }
  }, [enabled])

  const isDenied = perm === "denied"

  const handleClick = async () => {
    if (isDenied) return
    if (!enabled && perm !== "granted") {
      const result = await Notification.requestPermission()
      setPerm(result)
      if (result === "granted") onToggle(true)
      return
    }
    onToggle(!enabled)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDenied}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
        isDenied
          ? "opacity-50 cursor-not-allowed bg-secondary text-muted-foreground"
          : enabled
            ? "bg-accent text-accent-foreground hover:bg-accent/80"
            : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{isDenied ? "🔕" : enabled ? "🔔" : "🔕"}</span>
      <span>{isDenied ? labelDenied : enabled ? labelOn : label}</span>
    </button>
  )
}
