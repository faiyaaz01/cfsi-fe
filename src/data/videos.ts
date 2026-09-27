import { VideoItem } from '../types';

/**
 * Institutional Video Footage Registry.
 * Demo video data has been completely cleared.
 * Live video gallery items are managed in real time via the Web Management portal and MongoDB backend.
 */
export const videosData: VideoItem[] = [];

const LEGACY_VIDEO_IDS = new Set([
  'vid-01', 'vid-02', 'vid-03', 'vid-04', 'vid-05', 'vid-06', 'vid-07',
  'vid-08', 'vid-09', 'vid-10', 'vid-11', 'vid-12', 'vid-13', 'vid-14'
]);

export const getStoredVideos = (): VideoItem[] => {
  try {
    const saved = localStorage.getItem('cfsi_videos_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.id && !LEGACY_VIDEO_IDS.has(item.id));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return videosData;
};
