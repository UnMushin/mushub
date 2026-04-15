import { NextRequest, NextResponse } from "next/server"

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/youtube-auth`
  : "http://localhost:3000/api/youtube-auth"

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ")

// GET: either initiate OAuth or handle the callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  // Step 1 — redirect to Google consent screen
  if (!code && !error) {
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.set("client_id", CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", SCOPES)
    authUrl.searchParams.set("access_type", "offline")
    authUrl.searchParams.set("prompt", "consent")
    return NextResponse.redirect(authUrl.toString())
  }

  // Step 2 — handle error from Google
  if (error) {
    return NextResponse.redirect(`/?oauth_error=${error}`)
  }

  // Step 3 — exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code!,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokenRes.ok) {
    return NextResponse.redirect(`/?oauth_error=token_exchange_failed`)
  }

  // Store tokens in cookies (httpOnly for security)
  const response = NextResponse.redirect(`/?oauth_success=1`)
  response.cookies.set("yt_access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: tokens.expires_in,
    path: "/",
  })
  if (tokens.refresh_token) {
    response.cookies.set("yt_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })
  }

  return response
}
