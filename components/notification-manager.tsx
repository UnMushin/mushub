"use client"

import { useEffect, useRef, useCallback } from "react"

interface NotificationManagerProps {
  currentCount: number
  enabled: boolean
  channelName: string
}

// Throttle thresholds based on growth speed (subs/min)
function getThreshold(subsPerMin: number): number {
  if (subsPerMin < 0.1) return 1       // Slow: every sub
  if (subsPerMin < 1) return 5         // Moderate: every 5
  if (subsPerMin < 10) return 10       // Sustained: every 10
  if (subsPerMin < 50) return 100      // Fast: every 100
  if (subsPerMin < 200) return 500     // Viral: every 500
  return 1000                          // Mega viral: every 1000
}

export function useAdaptiveNotifications(
  currentCount: number,
  enabled: boolean,
  channelName: string
) {
  const prevCountRef = useRef<number | null>(null)
  const countHistoryRef = useRef<{ count: number; time: number }[]>([])
  const lastNotifCountRef = useRef<number | null>(null)
  const permissionRef = useRef<NotificationPermission>("default")

  // Request permission
  useEffect(() => {
    if (enabled && typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then(p => {
        permissionRef.current = p
      })
    }
  }, [enabled])

  const sendNotification = useCallback((gained: number) => {
    if (permissionRef.current !== "granted") return
    const title = gained === 1
      ? `🎉 New subscriber on ${channelName}!`
      : `🚀 +${gained} new subscribers on ${channelName}!`
    new Notification(title, {
      body: `You now have ${currentCount.toLocaleString()} subscribers`,
      icon: "/icon.svg",
      tag: "mushub-subs", // replaces previous notification
    })
  }, [channelName, currentCount])

  useEffect(() => {
    if (!enabled || currentCount === 0) return
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

    // Track history for speed calculation (last 5 minutes)
    const now = Date.now()
    countHistoryRef.current.push({ count: currentCount, time: now })
    countHistoryRef.current = countHistoryRef.current.filter(h => now - h.time < 5 * 60 * 1000)

    // Calculate subs/min
    let subsPerMin = 0
    if (countHistoryRef.current.length >= 2) {
      const oldest = countHistoryRef.current[0]
      const newest = countHistoryRef.current[countHistoryRef.current.length - 1]
      const elapsedMin = (newest.time - oldest.time) / 60000
      const countDiff = newest.count - oldest.count
      subsPerMin = elapsedMin > 0 ? countDiff / elapsedMin : 0
    }

    const threshold = getThreshold(subsPerMin)
    const lastNotif = lastNotifCountRef.current ?? currentCount
    const sinceLastNotif = currentCount - lastNotif

    if (sinceLastNotif >= threshold) {
      sendNotification(sinceLastNotif)
      lastNotifCountRef.current = currentCount
    }

    prevCountRef.current = currentCount
  }, [currentCount, enabled, sendNotification])
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
  const isDenied = typeof window !== "undefined" && "Notification" in window
    && Notification.permission === "denied"

  return (
    <button
      onClick={() => !isDenied && onToggle(!enabled)}
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
