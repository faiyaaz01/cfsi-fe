import { GalleryImage } from '../types';

/**
 * Institutional Photo Gallery Assets.
 * Demo photo data has been completely cleared.
 * Live gallery images are managed in real time via the Web Management portal and MongoDB backend.
 */
export const galleryImagesData: GalleryImage[] = [];

const DEMO_PREFIXES = ['img-0', 'img-1'];

export const getStoredGalleryImages = (): GalleryImage[] => {
  try {
    const saved = localStorage.getItem('cfsi_gallery_images_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.id && !DEMO_PREFIXES.some(p => item.id.startsWith(p)));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return galleryImagesData;
};
