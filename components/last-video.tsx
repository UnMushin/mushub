"use client"

import { useState, useEffect } from "react"
import { Youtube, ExternalLink, Eye, ThumbsUp, Clock } from "lucide-react"

interface VideoData {
  id: string
  title: string
  thumbnail: string
  views: string
  likes: string
  publishedAt: string
}

interface LastVideoProps {
  apiKey: string
}

export function LastVideo({ apiKey }: LastVideoProps) {
  const [video, setVideo] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const formatNumber = (num: string): string => {
    const n = parseInt(num)
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
    if (n >= 1000) return (n / 1000).toFixed(1) + "K"
    return num
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const fetchLatestVideo = async () => {
    if (!apiKey) return

    const channelHandle = localStorage.getItem("mushub_channel_handle")
    if (!channelHandle) return

    setLoading(true)
    setError("")

    try {
      // Get channel ID from handle
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=${channelHandle}&key=${apiKey}`
      )
      const channelData = await channelRes.json()

      if (!channelData.items || channelData.items.length === 0) {
        throw new Error("Channel not found")
      }

      const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

      // Get latest video from uploads playlist
      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${uploadsPlaylistId}&key=${apiKey}`
      )
      const videosData = await videosRes.json()

      if (!videosData.items || videosData.items.length === 0) {
        throw new Error("No videos found")
      }

      const videoId = videosData.items[0].snippet.resourceId.videoId
      const videoSnippet = videosData.items[0].snippet

      // Get video statistics
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
      )
      const statsData = await statsRes.json()

      if (!statsData.items || statsData.items.length === 0) {
        throw new Error("Video stats not found")
      }

      const stats = statsData.items[0].statistics

      setVideo({
        id: videoId,
        title: videoSnippet.title,
        thumbnail: videoSnippet.thumbnails.high?.url || videoSnippet.thumbnails.default?.url,
        views: formatNumber(stats.viewCount || "0"),
        likes: formatNumber(stats.likeCount || "0"),
        publishedAt: formatDate(videoSnippet.publishedAt),
      })
    } catch (err) {
      setError("Could not load video")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestVideo()
    
    // Listen for storage changes to refetch when handle is updated
    const handleStorage = () => fetchLatestVideo()
    window.addEventListener("storage", handleStorage)
    
    // Also listen for custom event
    const handleCustom = () => fetchLatestVideo()
    window.addEventListener("mushub_channel_updated", handleCustom)
    
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("mushub_channel_updated", handleCustom)
    }
  }, [apiKey])

  if (!apiKey) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Latest Video</h2>
        <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 py-8 text-center">
          <Youtube className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Connect API key above</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-foreground">Latest Video</h2>

      {loading ? (
        <div className="flex items-center justify-center rounded-lg bg-secondary/50 py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 py-8 text-center">
          <Youtube className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">Set your channel handle in stats above</p>
        </div>
      ) : video ? (
        <a
          href={`https://youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group block space-y-3"
        >
          <div className="relative overflow-hidden rounded-lg">
            <div className="aspect-video bg-secondary">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-8 w-8 text-foreground" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-accent transition-colors">
              {video.title}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {video.views}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {video.likes}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {video.publishedAt}
              </span>
            </div>
          </div>
        </a>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 py-8 text-center">
          <Youtube className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Set channel handle above</p>
        </div>
      )}
    </div>
  )
}
