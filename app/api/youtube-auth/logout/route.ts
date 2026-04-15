import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete("yt_access_token")
  response.cookies.delete("yt_refresh_token")
  return response
}
