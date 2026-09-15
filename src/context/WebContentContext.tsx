import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Course, TrainingPost, GalleryImage, VideoItem } from '../types';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const STORAGE_COURSES = 'cfsi_courses_data';
export const STORAGE_TRAINING = 'cfsi_training_data';
export const STORAGE_GALLERY = 'cfsi_gallery_images_data';
export const STORAGE_VIDEOS = 'cfsi_videos_data';
export const STORAGE_DISPLAY_SETTINGS = 'cfsi_display_settings';

export interface DisplaySettings {
  heroNoticeBanner: boolean;
  newsTickerMarquee: boolean;
  coursesSection: boolean;
  groundTrainingSection: boolean;
  photoGallerySection: boolean;
  videoGallerySection: boolean;
  studentVerificationBox: boolean;
  placementStatsBar: boolean;
  admissionInquiryModal: boolean;
  attendanceSystem: boolean;
  studentPortalLogin: boolean;
  institutePortalLogin: boolean;
  bulkStudentUpload: boolean;
  maintenanceModeBanner: boolean;
}

export const defaultDisplaySettings: DisplaySettings = {
  heroNoticeBanner: true,
  newsTickerMarquee: true,
  coursesSection: true,
  groundTrainingSection: true,
  photoGallerySection: true,
  videoGallerySection: true,
  studentVerificationBox: true,
  placementStatsBar: true,
  admissionInquiryModal: true,
  attendanceSystem: true,
  studentPortalLogin: true,
  institutePortalLogin: true,
  bulkStudentUpload: true,
  maintenanceModeBanner: false,
};

// Known demo IDs to purge so only real items remain
const DEMO_ID_PREFIXES = ['cfs-01', 'dfs-02', 'pgdfs-03', 'ffsi-04', 'tr-01', 'tr-02', 'tr-03', 'img-0', 'img-1', 'vid-0', 'vid-1'];

function filterOutDemoItems<T extends { id?: string }>(items: T[]): T[] {
  return items.filter(item => {
    if (!item.id) return false;
    return !DEMO_ID_PREFIXES.some(prefix => item.id?.startsWith(prefix));
  });
}

interface WebContentContextType {
  courses: Course[];
  trainings: TrainingPost[];
  photos: GalleryImage[];
  videos: VideoItem[];
  displaySettings: DisplaySettings;
  isLoading: boolean;
  
  // Real-time Course Actions
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  clearAllCourses: () => Promise<void>;

  // Real-time Drill Actions
  addTraining: (drill: TrainingPost) => Promise<void>;
  updateTraining: (id: string, drill: Partial<TrainingPost>) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;
  clearAllTrainings: () => Promise<void>;

  // Real-time Photo Actions
  addPhoto: (photo: GalleryImage) => Promise<void>;
  updatePhoto: (id: string, photo: Partial<GalleryImage>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  clearAllPhotos: () => Promise<void>;

  // Real-time Video Actions
  addVideo: (video: VideoItem) => Promise<void>;
  updateVideo: (id: string, video: Partial<VideoItem>) => Promise<void>;
  deleteVideo: (id: string) => Promise<void>;
  clearAllVideos: () => Promise<void>;

  // Display Switches
  toggleDisplaySetting: (key: keyof DisplaySettings, label: string) => Promise<void>;
  resetDisplaySettings: () => Promise<void>;
  refreshAllContent: () => Promise<void>;
}

const WebContentContext = createContext<WebContentContextType | undefined>(undefined);

export const WebContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COURSES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return filterOutDemoItems(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [trainings, setTrainings] = useState<TrainingPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRAINING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return filterOutDemoItems(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [photos, setPhotos] = useState<GalleryImage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GALLERY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return filterOutDemoItems(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIDEOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return filterOutDemoItems(parsed);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DISPLAY_SETTINGS);
      if (saved) return { ...defaultDisplaySettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return defaultDisplaySettings;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Broadcast helper
  const broadcastSync = (type: string) => {
    window.dispatchEvent(new CustomEvent('cfsi_web_content_updated', { detail: { type } }));
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COURSES, JSON.stringify(courses));
    } catch {}
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TRAINING, JSON.stringify(trainings));
    } catch {}
  }, [trainings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GALLERY, JSON.stringify(photos));
    } catch {}
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIDEOS, JSON.stringify(videos));
    } catch {}
  }, [videos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DISPLAY_SETTINGS, JSON.stringify(displaySettings));
    } catch {}
  }, [displaySettings]);

  // Load from backend in real time
  const refreshAllContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const [backendCourses, backendDrills, backendPhotos, backendVideos, backendSettings] = await Promise.allSettled([
        api.getCourses(),
        api.getDrills(),
        api.getPhotos(),
        api.getVideos(),
        api.getDisplaySettings()
      ]);

      if (backendCourses.status === 'fulfilled' && Array.isArray(backendCourses.value)) {
        const filtered = filterOutDemoItems(backendCourses.value);
        setCourses(filtered);
      }
      if (backendDrills.status === 'fulfilled' && Array.isArray(backendDrills.value)) {
        const filtered = filterOutDemoItems(backendDrills.value);
        setTrainings(filtered);
      }
      if (backendPhotos.status === 'fulfilled' && Array.isArray(backendPhotos.value)) {
        const filtered = filterOutDemoItems(backendPhotos.value);
        setPhotos(filtered);
      }
      if (backendVideos.status === 'fulfilled' && Array.isArray(backendVideos.value)) {
        const filtered = filterOutDemoItems(backendVideos.value);
        setVideos(filtered);
      }
      if (backendSettings.status === 'fulfilled' && backendSettings.value) {
        setDisplaySettings(prev => ({ ...prev, ...backendSettings.value }));
      }
    } catch (e) {
      console.warn('Real-time backend sync notice:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllContent();

    // Listen to real-time events across components/tabs
    const handleSync = (e: any) => {
      const eventType = e?.detail?.type;
      try {
        if (eventType === 'courses' || !eventType) {
          const c = localStorage.getItem(STORAGE_COURSES);
          if (c) setCourses(filterOutDemoItems(JSON.parse(c)));
        }
        if (eventType === 'drills' || !eventType) {
          const d = localStorage.getItem(STORAGE_TRAINING);
          if (d) setTrainings(filterOutDemoItems(JSON.parse(d)));
        }
        if (eventType === 'photos' || !eventType) {
          const p = localStorage.getItem(STORAGE_GALLERY);
          if (p) setPhotos(filterOutDemoItems(JSON.parse(p)));
        }
        if (eventType === 'videos' || !eventType) {
          const v = localStorage.getItem(STORAGE_VIDEOS);
          if (v) setVideos(filterOutDemoItems(JSON.parse(v)));
        }
        if (eventType === 'display' || !eventType) {
          const s = localStorage.getItem(STORAGE_DISPLAY_SETTINGS);
          if (s) setDisplaySettings(prev => ({ ...prev, ...JSON.parse(s) }));
        }
      } catch {}
    };

    window.addEventListener('cfsi_web_content_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('cfsi_web_content_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refreshAllContent]);

  // ==========================================
  // COURSES ACTIONS
  // ==========================================
  const addCourse = async (course: Course) => {
    setCourses(prev => [course, ...prev]);
    broadcastSync('courses');
    try {
      await api.createCourse(course);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const updateCourse = async (id: string, updated: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    broadcastSync('courses');
    try {
      await api.updateCourse(id, updated);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const deleteCourse = async (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    broadcastSync('courses');
    try {
      await api.deleteCourse(id);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const clearAllCourses = async () => {
    setCourses([]);
    broadcastSync('courses');
    try {
      await api.clearAllCourses();
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  // ==========================================
  // TRAINING DRILLS ACTIONS
  // ==========================================
  const addTraining = async (drill: TrainingPost) => {
    setTrainings(prev => [drill, ...prev]);
    broadcastSync('drills');
    try {
      await api.createDrill(drill);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const updateTraining = async (id: string, updated: Partial<TrainingPost>) => {
    setTrainings(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    broadcastSync('drills');
    try {
      await api.updateDrill(id, updated);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const deleteTraining = async (id: string) => {
    setTrainings(prev => prev.filter(t => t.id !== id));
    broadcastSync('drills');
    try {
      await api.deleteDrill(id);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const clearAllTrainings = async () => {
    setTrainings([]);
    broadcastSync('drills');
    try {
      await api.clearAllDrills();
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  // ==========================================
  // PHOTO GALLERY ACTIONS
  // ==========================================
  const addPhoto = async (photo: GalleryImage) => {
    setPhotos(prev => [photo, ...prev]);
    broadcastSync('photos');
    try {
      await api.createPhoto(photo);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const updatePhoto = async (id: string, updated: Partial<GalleryImage>) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    broadcastSync('photos');
    try {
      await api.updatePhoto(id, updated);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const deletePhoto = async (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    broadcastSync('photos');
    try {
      await api.deletePhoto(id);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const clearAllPhotos = async () => {
    setPhotos([]);
    broadcastSync('photos');
    try {
      await api.clearAllPhotos();
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  // ==========================================
  // VIDEO GALLERY ACTIONS
  // ==========================================
  const addVideo = async (video: VideoItem) => {
    setVideos(prev => [video, ...prev]);
    broadcastSync('videos');
    try {
      await api.createVideo(video);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const updateVideo = async (id: string, updated: Partial<VideoItem>) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
    broadcastSync('videos');
    try {
      await api.updateVideo(id, updated);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const deleteVideo = async (id: string) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    broadcastSync('videos');
    try {
      await api.deleteVideo(id);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const clearAllVideos = async () => {
    setVideos([]);
    broadcastSync('videos');
    try {
      await api.clearAllVideos();
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  // ==========================================
  // DISPLAY SWITCHES
  // ==========================================
  const toggleDisplaySetting = async (key: keyof DisplaySettings, label: string) => {
    const nextVal = !displaySettings[key];
    const updated = { ...displaySettings, [key]: nextVal };
    setDisplaySettings(updated);
    broadcastSync('display');
    toast.success(`${label} is now ${nextVal ? 'LIVE / VISIBLE' : 'DISABLED / HIDDEN'}`);
    try {
      await api.updateDisplaySettings(updated);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  const resetDisplaySettings = async () => {
    setDisplaySettings(defaultDisplaySettings);
    broadcastSync('display');
    toast.success('Display settings reset to system defaults');
    try {
      await api.updateDisplaySettings(defaultDisplaySettings);
    } catch (e) {
      console.warn('Backend sync failed, saved in local real-time store:', e);
    }
  };

  return (
    <WebContentContext.Provider
      value={{
        courses,
        trainings,
        photos,
        videos,
        displaySettings,
        isLoading,
        addCourse,
        updateCourse,
        deleteCourse,
        clearAllCourses,
        addTraining,
        updateTraining,
        deleteTraining,
        clearAllTrainings,
        addPhoto,
        updatePhoto,
        deletePhoto,
        clearAllPhotos,
        addVideo,
        updateVideo,
        deleteVideo,
        clearAllVideos,
        toggleDisplaySetting,
        resetDisplaySettings,
        refreshAllContent,
      }}
    >
      {children}
    </WebContentContext.Provider>
  );
};

export const useWebContent = (): WebContentContextType => {
  const context = useContext(WebContentContext);
  if (!context) {
    throw new Error('useWebContent must be used within a WebContentProvider');
  }
  return context;
};
