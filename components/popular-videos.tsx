'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { POPULAR_YOUTUBERS, getChannelByHandle, getLatestVideos } from '@/lib/youtube-api';

interface Video {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: { high: { url: string } };
    channelTitle: string;
    publishedAt: string;
  };
}

export default function PopularVideos() {
  const { youtubeToken } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!youtubeToken) return;
    
    const fetchAllVideos = async () => {
      setLoading(true);
      let allVideos: Video[] = [];
      
      for (const youtuber of POPULAR_YOUTUBERS) {
        try {
          const channel = await getChannelByHandle(youtuber.handle, youtubeToken);
          if (channel?.id) {
            const latest = await getLatestVideos(channel.id, youtubeToken, 3);
            allVideos = [...allVideos, ...latest];
          }
        } catch (err) {
          console.error(`Erreur pour ${youtuber.handle}:`, err);
        }
      }
      
      // Trier par date récente
      allVideos.sort((a, b) => 
        new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
      );
      setVideos(allVideos.slice(0, 12)); // max 12 vidéos
      setLoading(false);
    };
    
    fetchAllVideos();
  }, [youtubeToken]);

  if (!youtubeToken) return null;
  if (loading) return <div className="widget">Chargement des vidéos populaires...</div>;

  return (
    <div className="widget popular-videos">
      <h3>🔥 Dernières vidéos des créateurs tendance</h3>
      <div className="videos-grid">
        {videos.map((video) => (
          <a
            key={video.id.videoId}
            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card"
          >
            <img
              src={video.snippet.thumbnails.high.url}
              alt={video.snippet.title}
              className="video-thumbnail"
            />
            <div className="video-title">{video.snippet.title}</div>
            <div className="video-channel">{video.snippet.channelTitle}</div>
          </a>
        ))}
      </div>
    </div>
  );
}