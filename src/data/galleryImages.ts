import { GalleryImage } from '../types';

/**
 * Institutional Photo Gallery Assets.
 * Demo photo data has been completely cleared.
 * Live gallery images are managed in real time via the Web Management portal and MongoDB backend.
 */
export const galleryImagesData: GalleryImage[] = [];

const LEGACY_IMAGE_IDS = new Set([
  'img-01', 'img-02', 'img-03', 'img-04', 'img-05', 'img-06', 'img-07',
  'img-08', 'img-09', 'img-10', 'img-11', 'img-12', 'img-13', 'img-14'
]);

export const getStoredGalleryImages = (): GalleryImage[] => {
  try {
    const saved = localStorage.getItem('cfsi_gallery_images_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.id && !LEGACY_IMAGE_IDS.has(item.id));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return galleryImagesData;
};
