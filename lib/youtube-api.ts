// Récupère les infos d'une chaîne via son handle
export async function getChannelByHandle(handle: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&forHandle=${handle}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items?.[0] || null;
}

// Récupère les dernières vidéos d'une chaîne
export async function getLatestVideos(channelId: string, apiKey: string, max = 5) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${max}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

// Récupère les statistiques en temps réel d'une chaîne
export async function getChannelStatistics(channelId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items?.[0]?.statistics || null;
}

// Liste des youtubeurs populaires pour les miniatures
export const POPULAR_YOUTUBERS = [
  { handle: 'MrBeast', name: 'MrBeast' },
  { handle: 'RyanTrahan', name: 'Ryan Trahan' },
  { handle: 'Squiduu', name: 'Squiduu' },
  { handle: 'Yikes', name: 'Yikes' }
];