import { NextRequest, NextResponse } from "next/server"

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })
  const data = await res.json()
  return data.access_token || null
}

async function fetchAnalytics(accessToken: string) {
  // Use today as endDate and 30 days ago as startDate
  // This matches YouTube Studio's "last 28 days" logic
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 29) // 30 days inclusive
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  const url = `https://youtubeanalytics.googleapis.com/v2/reports?` +
    new URLSearchParams({
      ids: "channel==MINE",
      startDate: fmt(startDate),
      endDate: fmt(endDate), // TODAY - matches Studio
      metrics: "views,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration",
      dimensions: "",
    })

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // No-cache so we always get today's data
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  })
}

export async function GET(req: NextRequest) {
  let accessToken = req.cookies.get("yt_access_token")?.value
  const refreshToken = req.cookies.get("yt_refresh_token")?.value

  if (!accessToken && refreshToken) {
    accessToken = (await refreshAccessToken(refreshToken)) ?? undefined
    if (!accessToken) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
    }
  }
  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
  }

  let analyticsRes = await fetchAnalytics(accessToken)

  // Token expired mid-session — refresh and retry
  if (analyticsRes.status === 401 && refreshToken) {
    const newToken = await refreshAccessToken(refreshToken)
    if (!newToken) return NextResponse.json({ error: "token_expired" }, { status: 401 })
    analyticsRes = await fetchAnalytics(newToken)
    const data = await analyticsRes.json()
    const response = NextResponse.json(parseAnalytics(data))
    response.cookies.set("yt_access_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600,
    })
    return response
  }

  if (!analyticsRes.ok) {
    const err = await analyticsRes.json()
    return NextResponse.json({ error: err.error?.message || "analytics_failed" }, { status: 500 })
  }

  const data = await analyticsRes.json()
  return NextResponse.json(parseAnalytics(data))
}

function parseAnalytics(data: any) {
  const row = data.rows?.[0]
  if (!row) return { views30d: 0, subsGained: 0, subsLost: 0, netSubs: 0, watchMinutes: 0, avgViewDuration: 0 }
  return {
    views30d: Math.round(row[0] || 0),
    subsGained: Math.round(row[1] || 0),
    subsLost: Math.round(row[2] || 0),
    netSubs: Math.round((row[1] || 0) - (row[2] || 0)),
    watchMinutes: Math.round(row[3] || 0),
    avgViewDuration: Math.round(row[4] || 0),
  }
}
