/**
 * Cloudinary Image Storage & CDN Integration
 *
 * Provides client-side direct uploads to Cloudinary with:
 * - Real-time progress tracking
 * - File size and format validation
 * - Dynamic configuration via LocalStorage (UI Admin settings) or Vite .env variables
 * - Free tier friendly: 25GB storage, auto WebP compression, global fast CDN
 */

const CONFIG_STORAGE_KEY = 'cfsi_cloudinary_config';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

/**
 * Retrieve active Cloudinary configuration.
 * Checks localStorage first (configured via UI), then falls back to Vite env variables.
 */
export const getCloudinaryConfig = (): CloudinaryConfig => {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudName && parsed.uploadPreset) {
        return {
          cloudName: parsed.cloudName.trim(),
          uploadPreset: parsed.uploadPreset.trim(),
          folder: (parsed.folder || 'cfsi_portal').trim(),
        };
      }
    }
  } catch (e) {
    console.error('Error reading Cloudinary config from localStorage:', e);
  }

  const envCloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
  const envUploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();
  const envFolder = (import.meta.env.VITE_CLOUDINARY_FOLDER || 'cfsi_portal').trim();

  return {
    cloudName: envCloudName,
    uploadPreset: envUploadPreset,
    folder: envFolder,
  };
};

/**
 * Persist Cloudinary credentials to localStorage.
 */
export const setCloudinaryConfig = (config: CloudinaryConfig): void => {
  localStorage.setItem(
    CONFIG_STORAGE_KEY,
    JSON.stringify({
      cloudName: config.cloudName.trim(),
      uploadPreset: config.uploadPreset.trim(),
      folder: (config.folder || 'cfsi_portal').trim(),
    })
  );
};

/**
 * Clear stored Cloudinary config from localStorage.
 */
export const clearCloudinaryConfig = (): void => {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
};

/**
 * Check if Cloudinary is configured and ready for uploads.
 */
export const isCloudinaryConfigured = (): boolean => {
  const cfg = getCloudinaryConfig();
  return Boolean(cfg.cloudName && cfg.uploadPreset);
};

export interface UploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Direct upload image file to Cloudinary CDN with granular progress tracking.
 */
export const uploadToCloudinary = (
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const config = getCloudinaryConfig();

    if (!config.cloudName || !config.uploadPreset) {
      return reject(
        new Error(
          'Cloudinary is not configured yet. Please configure your Cloud Name and Upload Preset in Web Management settings or .env file.'
        )
      );
    }

    // Validate file size (10 MB max)
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return reject(
        new Error(`Image size is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${MAX_SIZE_MB}MB.`)
      );
    }

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPG, PNG, WEBP, GIF, SVG).'));
    }

    const xhr = new XMLHttpRequest();
    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`;

    xhr.open('POST', endpoint, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100);
          resolve({
            url: res.secure_url || res.url,
            publicId: res.public_id,
            width: res.width,
            height: res.height,
            format: res.format,
            bytes: res.bytes,
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary response payload.'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          const detail =
            errRes.error?.message ||
            `Upload rejected by Cloudinary (status ${xhr.status}). Ensure your upload preset is configured as 'Unsigned'.`;
          reject(new Error(detail));
        } catch {
          reject(new Error(`Image upload failed with status ${xhr.status}. Please check your Cloud Name and Upload Preset.`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload. Please check your internet connection.'));
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);
    if (config.folder) {
      formData.append('folder', config.folder);
    }

    xhr.send(formData);
  });
};
