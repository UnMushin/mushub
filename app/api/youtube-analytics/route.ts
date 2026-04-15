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

export async function GET(req: NextRequest) {
  let accessToken = req.cookies.get("yt_access_token")?.value
  const refreshToken = req.cookies.get("yt_refresh_token")?.value

  // Refresh token if needed
  if (!accessToken && refreshToken) {
    accessToken = (await refreshAccessToken(refreshToken)) ?? undefined
    if (!accessToken) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 })
  }

  // Calculate 30-day range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 30)
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  // Fetch views + subscribers from YouTube Analytics API
  const analyticsRes = await fetch(
    `https://youtubeanalytics.googleapis.com/v2/reports?` +
    new URLSearchParams({
      ids: "channel==MINE",
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      metrics: "views,subscribersGained,subscribersLost,estimatedMinutesWatched",
      dimensions: "",
    }),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!analyticsRes.ok) {
    const err = await analyticsRes.json()
    // If token expired mid-session
    if (analyticsRes.status === 401 && refreshToken) {
      const newToken = await refreshAccessToken(refreshToken)
      if (!newToken) return NextResponse.json({ error: "token_expired" }, { status: 401 })
      // Retry with new token
      const retry = await fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?` +
        new URLSearchParams({
          ids: "channel==MINE",
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          metrics: "views,subscribersGained,subscribersLost,estimatedMinutesWatched",
        }),
        { headers: { Authorization: `Bearer ${newToken}` } }
      )
      const retryData = await retry.json()
      const response = NextResponse.json(parseAnalytics(retryData))
      response.cookies.set("yt_access_token", newToken, { httpOnly: true, path: "/" })
      return response
    }
    return NextResponse.json({ error: err.error?.message || "analytics_failed" }, { status: 500 })
  }

  const data = await analyticsRes.json()
  return NextResponse.json(parseAnalytics(data))
}

function parseAnalytics(data: any) {
  const row = data.rows?.[0]
  if (!row) return { views30d: 0, subsGained: 0, subsLost: 0, watchMinutes: 0 }
  return {
    views30d: row[0] || 0,
    subsGained: row[1] || 0,
    subsLost: row[2] || 0,
    watchMinutes: row[3] || 0,
    netSubs: (row[1] || 0) - (row[2] || 0),
  }
}
