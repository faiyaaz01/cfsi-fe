import { VideoItem } from '../types';

/**
 * Institutional Video Footage Registry.
 * Demo video data has been completely cleared.
 * Live video gallery items are managed in real time via the Web Management portal and MongoDB backend.
 */
export const videosData: VideoItem[] = [];

const DEMO_PREFIXES = ['vid-0', 'vid-1'];

export const getStoredVideos = (): VideoItem[] => {
  try {
    const saved = localStorage.getItem('cfsi_videos_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.id && !DEMO_PREFIXES.some(p => item.id.startsWith(p)));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return videosData;
};
