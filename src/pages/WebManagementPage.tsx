import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Globe,
  BookOpen,
  FileText,
  Flame,
  Image as ImageIcon,
  Video,
  Sliders,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Calendar,
  X,
  Play,
  ShieldCheck,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { FlatCard } from '../components/common/FlatCard';
import { CountUp } from '../components/common/CountUp';
import { useNews } from '../context/NewsContext';
import { useWebContent, DisplaySettings } from '../context/WebContentContext';
import { useConfirm } from '../context/ConfirmContext';
import { Course, NewsPost, NewsCategory, TrainingPost, GalleryImage, VideoItem } from '../types';

type SubTab = 'courses' | 'news' | 'drills' | 'photos' | 'videos' | 'display';

export const WebManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('courses');
  const confirm = useConfirm();

  // Real-time Web Content Context (FastAPI MongoDB backend + real-time localStorage & custom event dispatch)
  const {
    courses,
    trainings,
    photos,
    videos,
    displaySettings,
    isLoading: isWebLoading,
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
  } = useWebContent();

  // Real-time News Context
  const {
    posts: newsPosts,
    isLoading: isNewsLoading,
    addPost: addNewsPost,
    updatePost: updateNewsPost,
    deletePost: deleteNewsPost,
    clearAllNews,
    refreshNews,
  } = useNews();

  // ==========================================
  // MODULE 1: COURSES MANAGEMENT
  // ==========================================
  const [courseSearch, setCourseSearch] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Clean empty defaults (no prefilled dummy text)
  const [courseForm, setCourseForm] = useState<{
    id: string;
    title: string;
    slug: string;
    duration: string;
    eligibility: string;
    fee: string;
    feeNumber: number;
    badge: string;
    icon: string;
    shortDescription: string;
    fullDescription: string;
    syllabus: string;
    physicalRequirements: string;
    careerOpportunities: string;
    certificationBody: string;
  }>({
    id: '',
    title: '',
    slug: '',
    duration: '',
    eligibility: '',
    fee: '',
    feeNumber: 0,
    badge: '',
    icon: 'Flame',
    shortDescription: '',
    fullDescription: '',
    syllabus: '',
    physicalRequirements: '',
    careerOpportunities: '',
    certificationBody: '',
  });

  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      id: `course-${Date.now()}`,
      title: '',
      slug: '',
      duration: '',
      eligibility: '',
      fee: '',
      feeNumber: 0,
      badge: '',
      icon: 'Flame',
      shortDescription: '',
      fullDescription: '',
      syllabus: '',
      physicalRequirements: '',
      careerOpportunities: '',
      certificationBody: '',
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      id: course.id,
      title: course.title,
      slug: course.slug,
      duration: course.duration,
      eligibility: course.eligibility,
      fee: course.fee,
      feeNumber: course.feeNumber,
      badge: course.badge || '',
      icon: course.icon || 'Flame',
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      syllabus: (course.syllabus || []).join('\n'),
      physicalRequirements: (course.physicalRequirements || []).join('\n'),
      careerOpportunities: (course.careerOpportunities || []).join('\n'),
      certificationBody: course.certificationBody,
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    const slug = courseForm.slug.trim() || courseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const coursePayload: Course = {
      id: courseForm.id || `cfs-${Date.now()}`,
      title: courseForm.title.trim(),
      slug,
      duration: courseForm.duration.trim() || '1 Year',
      eligibility: courseForm.eligibility.trim(),
      fee: courseForm.fee.trim(),
      feeNumber: Number(courseForm.feeNumber) || 0,
      badge: courseForm.badge.trim() || undefined,
      icon: courseForm.icon || 'Flame',
      shortDescription: courseForm.shortDescription.trim(),
      fullDescription: courseForm.fullDescription.trim(),
      syllabus: courseForm.syllabus.split('\n').map(s => s.trim()).filter(Boolean),
      physicalRequirements: courseForm.physicalRequirements.split('\n').map(s => s.trim()).filter(Boolean),
      careerOpportunities: courseForm.careerOpportunities.split('\n').map(s => s.trim()).filter(Boolean),
      certificationBody: courseForm.certificationBody.trim(),
    };

    if (editingCourse) {
      await updateCourse(editingCourse.id, coursePayload);
    } else {
      await addCourse(coursePayload);
    }
    setIsCourseModalOpen(false);
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete Course',
      message: `Are you sure you want to delete course "${title}" from the catalog?`,
      confirmText: 'Delete Course',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await deleteCourse(id);
    }
  };

  const handleClearAllCourses = async () => {
    const confirmed = await confirm({
      title: 'Clear All Courses',
      message: 'Are you sure you want to clear all courses from the database? This cannot be undone and will remove all programs from the public courses page and catalog.',
      confirmText: 'Clear All Courses',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await clearAllCourses();
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(c =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courses, courseSearch]);

  // ==========================================
  // MODULE 2: NEWS & EVENTS
  // ==========================================
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('All');
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  const [newsForm, setNewsForm] = useState<{
    id: string;
    title: string;
    category: NewsCategory;
    date: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    isPinned: boolean;
  }>({
    id: '',
    title: '',
    category: 'News',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    excerpt: '',
    content: '',
    imageUrl: '',
    author: '',
    isPinned: false,
  });

  const handleOpenAddNews = () => {
    setEditingNews(null);
    setNewsForm({
      id: '',
      title: '',
      category: 'News',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      excerpt: '',
      content: '',
      imageUrl: '',
      author: '',
      isPinned: false,
    });
    setIsNewsModalOpen(true);
  };

  const handleOpenEditNews = (post: NewsPost) => {
    setEditingNews(post);
    setNewsForm({
      id: post.id,
      title: post.title,
      category: post.category,
      date: post.date,
      excerpt: post.excerpt,
      content: post.content,
      imageUrl: post.imageUrl || '',
      author: post.author || '',
      isPinned: !!post.isPinned,
    });
    setIsNewsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim()) {
      toast.error('News title is required');
      return;
    }
    if (!newsForm.excerpt.trim()) {
      toast.error('Short summary / excerpt is required');
      return;
    }

    const payload = {
      title: newsForm.title.trim(),
      category: newsForm.category,
      date: newsForm.date.trim(),
      excerpt: newsForm.excerpt.trim(),
      content: newsForm.content.trim() || newsForm.excerpt.trim(),
      imageUrl: newsForm.imageUrl.trim() || undefined,
      author: newsForm.author.trim() || undefined,
      isPinned: newsForm.isPinned,
    };

    if (editingNews) {
      await updateNewsPost(editingNews.id, payload);
      toast.success(`News bulletin "${payload.title}" updated!`);
    } else {
      await addNewsPost(payload);
      toast.success(`News bulletin "${payload.title}" published!`);
    }
    setIsNewsModalOpen(false);
  };

  const handleDeleteNews = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete News Bulletin',
      message: `Are you sure you want to delete news item "${title}"?`,
      confirmText: 'Delete News',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await deleteNewsPost(id);
      toast.success(`News item "${title}" removed.`);
    }
  };

  const handleClearAllNews = async () => {
    const confirmed = await confirm({
      title: 'Clear All News',
      message: 'Are you sure you want to clear all news bulletins and circulars from the database? This cannot be undone.',
      confirmText: 'Clear All News',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await clearAllNews();
    }
  };

  const filteredNews = useMemo(() => {
    return newsPosts.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
                          p.excerpt.toLowerCase().includes(newsSearch.toLowerCase());
      const matchCat = newsCategoryFilter === 'All' || p.category === newsCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [newsPosts, newsSearch, newsCategoryFilter]);

  // ==========================================
  // MODULE 3: HANDS-ON GROUND DRILLS / TRAINING
  // ==========================================
  const [drillSearch, setDrillSearch] = useState('');
  const [editingDrill, setEditingDrill] = useState<TrainingPost | null>(null);
  const [isDrillModalOpen, setIsDrillModalOpen] = useState(false);

  const [drillForm, setDrillForm] = useState<{
    id: string;
    title: string;
    tag: string;
    duration: string;
    image: string;
    description: string;
    highlights: string;
    equipmentUsed: string;
  }>({
    id: '',
    title: '',
    tag: '',
    duration: '',
    image: '',
    description: '',
    highlights: '',
    equipmentUsed: '',
  });

  const handleOpenAddDrill = () => {
    setEditingDrill(null);
    setDrillForm({
      id: `tr-${Date.now()}`,
      title: '',
      tag: '',
      duration: '',
      image: '',
      description: '',
      highlights: '',
      equipmentUsed: '',
    });
    setIsDrillModalOpen(true);
  };

  const handleOpenEditDrill = (drill: TrainingPost) => {
    setEditingDrill(drill);
    setDrillForm({
      id: drill.id,
      title: drill.title,
      tag: drill.tag,
      duration: drill.duration,
      image: drill.image,
      description: drill.description,
      highlights: (drill.highlights || []).join('\n'),
      equipmentUsed: (drill.equipmentUsed || []).join(', '),
    });
    setIsDrillModalOpen(true);
  };

  const handleSaveDrill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drillForm.title.trim()) {
      toast.error('Drill title is required');
      return;
    }

    const payload: TrainingPost = {
      id: drillForm.id || `tr-${Date.now()}`,
      title: drillForm.title.trim(),
      tag: drillForm.tag.trim() || 'Tactical Drill',
      duration: drillForm.duration.trim() || 'Practical Drill',
      image: drillForm.image.trim() || '',
      description: drillForm.description.trim(),
      highlights: drillForm.highlights.split('\n').map(h => h.trim()).filter(Boolean),
      equipmentUsed: drillForm.equipmentUsed.split(',').map(eq => eq.trim()).filter(Boolean),
    };

    if (editingDrill) {
      await updateTraining(editingDrill.id, payload);
    } else {
      await addTraining(payload);
    }
    setIsDrillModalOpen(false);
  };

  const handleDeleteDrill = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete Tactical Drill',
      message: `Are you sure you want to delete ground drill "${title}"?`,
      confirmText: 'Delete Drill',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await deleteTraining(id);
    }
  };

  const handleClearAllDrills = async () => {
    const confirmed = await confirm({
      title: 'Clear All Drills',
      message: 'Are you sure you want to clear all ground training drills from the database? This cannot be undone.',
      confirmText: 'Clear All Drills',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await clearAllTrainings();
    }
  };

  const filteredDrills = useMemo(() => {
    return trainings.filter(t =>
      t.title.toLowerCase().includes(drillSearch.toLowerCase()) ||
      t.tag.toLowerCase().includes(drillSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(drillSearch.toLowerCase())
    );
  }, [trainings, drillSearch]);

  // ==========================================
  // MODULE 4: PHOTO GALLERY MANAGEMENT
  // ==========================================
  const [photoSearch, setPhotoSearch] = useState('');
  const [photoCatFilter, setPhotoCatFilter] = useState<string>('All');
  const [editingPhoto, setEditingPhoto] = useState<GalleryImage | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const [photoForm, setPhotoForm] = useState<{
    id: string;
    title: string;
    category: 'Training' | 'Events' | 'Equipment';
    imageUrl: string;
    caption: string;
    date: string;
  }>({
    id: '',
    title: '',
    category: 'Training',
    imageUrl: '',
    caption: '',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  });

  const handleOpenAddPhoto = () => {
    setEditingPhoto(null);
    setPhotoForm({
      id: `img-${Date.now()}`,
      title: '',
      category: 'Training',
      imageUrl: '',
      caption: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
    setIsPhotoModalOpen(true);
  };

  const handleOpenEditPhoto = (photo: GalleryImage) => {
    setEditingPhoto(photo);
    setPhotoForm({
      id: photo.id,
      title: photo.title,
      category: photo.category,
      imageUrl: photo.imageUrl,
      caption: photo.caption,
      date: photo.date,
    });
    setIsPhotoModalOpen(true);
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.title.trim()) {
      toast.error('Photo title is required');
      return;
    }
    if (!photoForm.imageUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }

    const payload: GalleryImage = {
      id: photoForm.id || `img-${Date.now()}`,
      title: photoForm.title.trim(),
      category: photoForm.category,
      imageUrl: photoForm.imageUrl.trim(),
      caption: photoForm.caption.trim() || photoForm.title.trim(),
      date: photoForm.date.trim() || '2024',
    };

    if (editingPhoto) {
      await updatePhoto(editingPhoto.id, payload);
    } else {
      await addPhoto(payload);
    }
    setIsPhotoModalOpen(false);
  };

  const handleDeletePhoto = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete Photo',
      message: `Are you sure you want to delete photo "${title}" from the gallery?`,
      confirmText: 'Delete Photo',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await deletePhoto(id);
    }
  };

  const handleClearAllPhotos = async () => {
    const confirmed = await confirm({
      title: 'Clear All Photos',
      message: 'Are you sure you want to clear all photos from the gallery? This cannot be undone.',
      confirmText: 'Clear All Photos',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await clearAllPhotos();
    }
  };

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(photoSearch.toLowerCase()) ||
                          p.caption.toLowerCase().includes(photoSearch.toLowerCase());
      const matchCat = photoCatFilter === 'All' || p.category === photoCatFilter;
      return matchSearch && matchCat;
    });
  }, [photos, photoSearch, photoCatFilter]);

  // ==========================================
  // MODULE 5: VIDEO GALLERY MANAGEMENT
  // ==========================================
  const [videoSearch, setVideoSearch] = useState('');
  const [videoCatFilter, setVideoCatFilter] = useState<string>('All');
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [videoForm, setVideoForm] = useState<{
    id: string;
    youtubeId: string;
    title: string;
    category: 'Practical Drill' | 'Fire Demo' | 'Search & Rescue' | 'Campus Life';
    duration: string;
    description: string;
  }>({
    id: '',
    youtubeId: '',
    title: '',
    category: 'Practical Drill',
    duration: '',
    description: '',
  });

  const extractYoutubeId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
      return trimmed;
    }
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : trimmed;
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoForm({
      id: `vid-${Date.now()}`,
      youtubeId: '',
      title: '',
      category: 'Practical Drill',
      duration: '',
      description: '',
    });
    setIsVideoModalOpen(true);
  };

  const handleOpenEditVideo = (video: VideoItem) => {
    setEditingVideo(video);
    setVideoForm({
      id: video.id,
      youtubeId: video.youtubeId,
      title: video.title,
      category: video.category,
      duration: video.duration,
      description: video.description,
    });
    setIsVideoModalOpen(true);
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim()) {
      toast.error('Video title is required');
      return;
    }
    const cleanYtId = extractYoutubeId(videoForm.youtubeId);
    if (!cleanYtId) {
      toast.error('Please enter a valid YouTube Video ID or URL');
      return;
    }

    const payload: VideoItem = {
      id: videoForm.id || `vid-${Date.now()}`,
      youtubeId: cleanYtId,
      title: videoForm.title.trim(),
      category: videoForm.category,
      duration: videoForm.duration.trim() || '3:00',
      description: videoForm.description.trim(),
    };

    if (editingVideo) {
      await updateVideo(editingVideo.id, payload);
    } else {
      await addVideo(payload);
    }
    setIsVideoModalOpen(false);
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete Video',
      message: `Are you sure you want to delete video "${title}" from the gallery?`,
      confirmText: 'Delete Video',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await deleteVideo(id);
    }
  };

  const handleClearAllVideos = async () => {
    const confirmed = await confirm({
      title: 'Clear All Videos',
      message: 'Are you sure you want to clear all videos from the gallery? This cannot be undone.',
      confirmText: 'Clear All Videos',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await clearAllVideos();
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchSearch = v.title.toLowerCase().includes(videoSearch.toLowerCase()) ||
                          v.description.toLowerCase().includes(videoSearch.toLowerCase());
      const matchCat = videoCatFilter === 'All' || v.category === videoCatFilter;
      return matchSearch && matchCat;
    });
  }, [videos, videoSearch, videoCatFilter]);

  // ==========================================
  // MODULE 6: DASHBOARD & WEBSITE DISPLAY MANAGEMENT
  // ==========================================
  const renderToggle = (
    key: keyof DisplaySettings,
    title: string,
    description: string,
    badgeText: string,
    isDanger = false
  ) => {
    const isEnabled = displaySettings[key];
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-primary/30 transition-all">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-900 dark:text-white">{title}</span>
            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
              isEnabled
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {isEnabled ? 'Active / Visible' : 'Hidden'}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">({badgeText})</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleDisplaySetting(key, title)}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            isEnabled 
              ? (isDanger ? 'bg-amber-600' : 'bg-primary') 
              : 'bg-gray-300 dark:bg-gray-700'
          }`}
          role="switch"
          aria-checked={isEnabled}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-dark-bg text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-gray-900 dark:text-white">
                    Web Management
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                    Live CMS
                  </span>
                  {(isWebLoading || isNewsLoading) && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 animate-pulse">
                      <RotateCw className="w-3 h-3 animate-spin" />
                      <span>Syncing...</span>
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time content management & site-wide section controllers for CFSI platform
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                refreshAllContent();
                refreshNews();
                toast.success('Synced live content with database.');
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
              title="Refresh database records"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Sync Live Data</span>
            </button>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              <span>View Live Site</span>
            </Link>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'courses'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Courses (<CountUp value={courses.length} />)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'news'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>News & Events (<CountUp value={newsPosts.length} />)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drills')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'drills'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Ground Drills (<CountUp value={trainings.length} />)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'photos'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photo Gallery (<CountUp value={photos.length} />)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'videos'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video Gallery (<CountUp value={videos.length} />)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('display')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'display'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Display Controls</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: COURSES MANAGEMENT                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Curriculum Catalog</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Courses & Certifications Management
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add new degree/diploma courses, customize fees, physical requirements, and syllabi live on the portal.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {courses.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllCourses}
                      className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete all courses"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddCourse}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Course</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="pt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses by title, slug, or details..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </FlatCard>

            {/* Empty State */}
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  {courseSearch ? 'No matching courses found' : 'No courses in catalog yet'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  {courseSearch
                    ? 'Try adjusting your search keywords.'
                    : 'Create your first real degree, diploma, or certification program using the button below.'}
                </p>
                {!courseSearch && (
                  <button
                    type="button"
                    onClick={handleOpenAddCourse}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Course</span>
                  </button>
                )}
              </div>
            ) : (
              /* Courses Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <FlatCard key={course.id} hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Flame className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-heading font-black text-base sm:text-lg text-gray-900 dark:text-white">
                              {course.title}
                            </h3>
                            <span className="text-[11px] font-mono text-gray-400">/{course.slug}</span>
                          </div>
                        </div>
                        {course.badge && (
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-700 shrink-0">
                            {course.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {course.shortDescription}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                        <div>
                          <span className="text-gray-400 text-[10px] block uppercase font-bold">Duration</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{course.duration}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-[10px] block uppercase font-bold">Tuition Fee</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{course.fee}</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-gray-200/50 dark:border-white/5">
                          <span className="text-gray-400 text-[10px] block uppercase font-bold">Eligibility</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate block">{course.eligibility}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-4">
                        <span>• {(course.syllabus || []).length} Syllabus Modules</span>
                        <span>• {(course.careerOpportunities || []).length} Career Tracks</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(course)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </FlatCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NEWS & EVENTS                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <FileText className="w-4 h-4" />
                    <span>Press Bulletins & Circulars</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    News & Events Management
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Publish official admission announcements, circulars, and batch exam notices live to the website.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {newsPosts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllNews}
                      className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete all news bulletins"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddNews}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish News / Event</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="Search bulletins and events..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {(['All', 'News', 'Event', 'Announcement', 'Institute Updates'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewsCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                        newsCategoryFilter === cat
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </FlatCard>

            {/* Empty State */}
            {filteredNews.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  {newsSearch ? 'No matching bulletins found' : 'No news bulletins published yet'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  {newsSearch
                    ? 'Try adjusting your search term.'
                    : 'Publish your first real news circular or exam notice using the button below.'}
                </p>
                {!newsSearch && (
                  <button
                    type="button"
                    onClick={handleOpenAddNews}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish First Bulletin</span>
                  </button>
                )}
              </div>
            ) : (
              /* News List */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map(item => (
                  <FlatCard key={item.id} hoverEffect={false} className="border border-gray-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between">
                    <div>
                      {item.imageUrl && (
                        <div className="h-40 w-full overflow-hidden relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          {item.isPinned && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-white shadow-md">
                              PINNED
                            </span>
                          )}
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                            {item.category}
                          </span>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{item.date}</span>
                          {item.author && <span>• {item.author}</span>}
                        </div>

                        <h3 className="font-heading font-black text-base text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                          {item.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          updateNewsPost(item.id, { isPinned: !item.isPinned });
                          toast.success(`Post "${item.title}" ${!item.isPinned ? 'pinned' : 'unpinned'}.`);
                        }}
                        className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors"
                      >
                        {item.isPinned ? 'Unpin' : 'Pin to Top'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditNews(item)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-200"
                          title="Edit News"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNews(item.id, item.title)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400"
                          title="Delete News"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </FlatCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: HANDS-ON GROUND TRAINING / DRILLS                                  */}
        {/* ========================================================================= */}
        {activeTab === 'drills' && (
          <div className="space-y-6">
            <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>Tactical Ground Simulations</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Ground Drills & Tactical Training Management
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage real-time rescue protocols, smoke chamber drills, hazardous material simulations, and equipment lists.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {trainings.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllDrills}
                      className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete all ground drills"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddDrill}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Drill</span>
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="pt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={drillSearch}
                    onChange={(e) => setDrillSearch(e.target.value)}
                    placeholder="Search tactical drills and simulations..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </FlatCard>

            {/* Empty State */}
            {filteredDrills.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  {drillSearch ? 'No matching drills found' : 'No ground training drills recorded yet'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  {drillSearch
                    ? 'Try adjusting your search keywords.'
                    : 'Create tactical drill entries with hardware and practical highlights.'}
                </p>
                {!drillSearch && (
                  <button
                    type="button"
                    onClick={handleOpenAddDrill}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Drill</span>
                  </button>
                )}
              </div>
            ) : (
              /* Drills Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrills.map((drill) => (
                  <FlatCard key={drill.id} hoverEffect={false} className="border border-gray-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between">
                    <div>
                      {drill.image && (
                        <div className="h-44 w-full overflow-hidden relative">
                          <img
                            src={drill.image}
                            alt={drill.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary text-white shadow-sm">
                            {drill.tag}
                          </span>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                            {drill.duration}
                          </span>
                        </div>
                      )}

                      <div className="p-5">
                        <h3 className="font-heading font-black text-base text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {drill.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                          {drill.description}
                        </p>

                        <div className="space-y-1 mb-3">
                          {(drill.highlights || []).slice(0, 2).map((h, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{h}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex flex-wrap gap-1">
                          {(drill.equipmentUsed || []).slice(0, 3).map((eq, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDrill(drill)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-200"
                        title="Edit Drill"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDrill(drill.id, drill.title)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400"
                        title="Delete Drill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </FlatCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PHOTO GALLERY MANAGEMENT                                           */}
        {/* ========================================================================= */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span>Campus Media & Gallery</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Photo Gallery Management
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Upload live training drills, annual parade ceremonies, and specialized firefighting gear photos.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {photos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllPhotos}
                      className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete all photos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddPhoto}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Photo</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={photoSearch}
                    onChange={(e) => setPhotoSearch(e.target.value)}
                    placeholder="Search photos by title or caption..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {(['All', 'Training', 'Events', 'Equipment'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPhotoCatFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                        photoCatFilter === cat
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </FlatCard>

            {/* Empty State */}
            {filteredPhotos.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  {photoSearch ? 'No matching photos found' : 'No photos uploaded to gallery yet'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  {photoSearch
                    ? 'Try adjusting your search keywords.'
                    : 'Upload your first real campus, drill, or equipment photo using the button below.'}
                </p>
                {!photoSearch && (
                  <button
                    type="button"
                    onClick={handleOpenAddPhoto}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload First Photo</span>
                  </button>
                )}
              </div>
            ) : (
              /* Photos Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.map((photo) => (
                  <FlatCard key={photo.id} hoverEffect={false} className="border border-gray-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="h-44 w-full overflow-hidden relative bg-gray-100 dark:bg-white/5">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                          {photo.category}
                        </span>
                      </div>

                      <div className="p-4">
                        <span className="text-[10px] text-gray-400 block mb-1">{photo.date}</span>
                        <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {photo.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {photo.caption}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditPhoto(photo)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-200"
                        title="Edit Photo"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id, photo.title)}
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </FlatCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: VIDEO GALLERY MANAGEMENT                                           */}
        {/* ========================================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span>Live Video Footage</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Video Gallery Management
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Embed YouTube footage of live foam tender operations, high-rise rappelling, and breathing apparatus drills.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {videos.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllVideos}
                      className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete all videos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddVideo}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Video</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={videoSearch}
                    onChange={(e) => setVideoSearch(e.target.value)}
                    placeholder="Search videos by title or category..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {(['All', 'Practical Drill', 'Fire Demo', 'Search & Rescue', 'Campus Life'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setVideoCatFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                        videoCatFilter === cat
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </FlatCard>

            {/* Empty State */}
            {filteredVideos.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white dark:bg-dark-card rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  {videoSearch ? 'No matching videos found' : 'No videos added to gallery yet'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  {videoSearch
                    ? 'Try adjusting your search keywords.'
                    : 'Embed your first YouTube video drill or tactical demonstration using the button below.'}
                </p>
                {!videoSearch && (
                  <button
                    type="button"
                    onClick={handleOpenAddVideo}
                    className="mt-4 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Video</span>
                  </button>
                )}
              </div>
            ) : (
              /* Videos Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((vid) => (
                  <FlatCard key={vid.id} hoverEffect={false} className="border border-gray-200/80 dark:border-white/10 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="h-44 w-full overflow-hidden relative bg-black/20 group">
                        <img
                          src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 ml-0.5 fill-current" />
                          </div>
                        </div>
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                          {vid.category}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-white backdrop-blur-sm">
                          {vid.duration}
                        </span>
                      </div>

                      <div className="p-4">
                        <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                          {vid.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {vid.description}
                        </p>
                        <span className="mt-2 text-[10px] font-mono text-gray-400 block">
                          YT-ID: {vid.youtubeId}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <a
                        href={`https://www.youtube.com/watch?v=${vid.youtubeId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Watch</span>
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditVideo(vid)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-200"
                          title="Edit Video"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(vid.id, vid.title)}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400"
                          title="Delete Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </FlatCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: DASHBOARD & WEBSITE DISPLAY MANAGEMENT                             */}
        {/* ========================================================================= */}
        {activeTab === 'display' && (
          <div className="space-y-8">
            <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                    <Sliders className="w-4 h-4" />
                    <span>Feature & Visibility Controls</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Dashboard & Website Display Management
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Control what to show and what to hide across the public website homepage and internal dashboard systems.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Restore Default Switches',
                      message: 'Are you sure you want to reset all website and dashboard visibility switches back to standard defaults?',
                      confirmText: 'Restore Defaults',
                      cancelText: 'Cancel',
                      type: 'warning',
                      icon: 'warning',
                    });
                    if (ok) {
                      await resetDisplaySettings();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Restore Standard Switches</span>
                </button>
              </div>

              {/* SECTION A: PUBLIC WEBSITE DISPLAY CONTROLS */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <h3 className="font-heading font-black text-base text-gray-900 dark:text-white uppercase tracking-wider">
                    A. Public Website Homepage Sections
                  </h3>
                </div>

                <div className="space-y-3">
                  {renderToggle(
                    'heroNoticeBanner',
                    'Emergency Admission Notice Banner',
                    'Display top flashing red alert banner for ongoing admission season and batch registrations.',
                    'Homepage Top'
                  )}

                  {renderToggle(
                    'newsTickerMarquee',
                    'Breaking News Marquee Ticker',
                    'Running ticker displaying latest press updates and upcoming examination deadlines.',
                    'Top Bar'
                  )}

                  {renderToggle(
                    'coursesSection',
                    'Courses & Programs Showcase',
                    'Full interactive grid of Certificate, Diploma, Post-Graduate, and Safety Inspector programs.',
                    'Homepage & Courses'
                  )}

                  {renderToggle(
                    'groundTrainingSection',
                    'Hands-On Ground Drills Showcase',
                    'Interactive simulation module featuring search & rescue, rappelling, and chemical fire drill cards.',
                    'Homepage'
                  )}

                  {renderToggle(
                    'photoGallerySection',
                    'Photo Gallery Section',
                    'Live carousel and thumbnail previews of campus training, parade ceremonies, and fire vehicles.',
                    'Gallery'
                  )}

                  {renderToggle(
                    'videoGallerySection',
                    'Tactical Video Drill Gallery',
                    'YouTube live drill footage section demonstrating industrial foam and breathing apparatus drills.',
                    'Gallery'
                  )}

                  {renderToggle(
                    'studentVerificationBox',
                    'Cadet Certificate Verification Tool',
                    'Interactive online diploma and student verification box on the public homepage.',
                    'Homepage'
                  )}

                  {renderToggle(
                    'placementStatsBar',
                    'Strength & Placement Statistics Bar',
                    'Animated statistics showing cadets trained, placements in top industries, and drill hours logged.',
                    'Homepage'
                  )}

                  {renderToggle(
                    'admissionInquiryModal',
                    'Floating Admission Inquiry Pop-up',
                    'Direct lead capture form and quick consultation button for prospective student inquiries.',
                    'Site-wide'
                  )}
                </div>
              </div>

              {/* SECTION B: DASHBOARD & PORTALS */}
              <div className="pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-heading font-black text-base text-gray-900 dark:text-white uppercase tracking-wider">
                    B. Dashboard & Portal Access Switches
                  </h3>
                </div>

                <div className="space-y-3">
                  {renderToggle(
                    'attendanceSystem',
                    'Cadet Daily Attendance Module',
                    'Enables 24-hour attendance marking, punch in/out tracking, and slot attendance management in admin & teacher portals.',
                    'Dashboard'
                  )}

                  {renderToggle(
                    'studentPortalLogin',
                    'Student Self-Service Portal Login',
                    'Allows active cadets to log into /student-login to view their attendance history, profile, and exam scores.',
                    'Portals'
                  )}

                  {renderToggle(
                    'institutePortalLogin',
                    'Franchise & Training Center Login',
                    'Allows partner branches and training centers to sign in and register new candidates.',
                    'Portals'
                  )}

                  {renderToggle(
                    'bulkStudentUpload',
                    'CSV Bulk Cadet Roster Import',
                    'Enables Excel/CSV spreadsheet upload tool for batch student registration on the user management page.',
                    'Admin Tools'
                  )}

                  {renderToggle(
                    'maintenanceModeBanner',
                    'Platform Maintenance Notice Banner',
                    'Displays a warning notice across the website indicating scheduled server maintenance is underway.',
                    'Site-wide Alert',
                    true
                  )}
                </div>
              </div>
            </FlatCard>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT COURSE                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white">
                    {editingCourse ? 'Edit Course Program' : 'Create New Course Program'}
                  </h3>
                  <p className="text-xs text-gray-500">Configure program details, syllabus, duration, and tuition fee</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Diploma In Fire Safety"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      URL Slug (Auto-generated if blank)
                    </label>
                    <input
                      type="text"
                      value={courseForm.slug}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="e.g. diploma-in-fire-safety"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g. 1 Year (2 Semesters)"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Tuition Fee Display
                    </label>
                    <input
                      type="text"
                      value={courseForm.fee}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, fee: e.target.value }))}
                      placeholder="e.g. ₹25,000"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Eligibility
                    </label>
                    <input
                      type="text"
                      value={courseForm.eligibility}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, eligibility: e.target.value }))}
                      placeholder="e.g. 12th Standard Pass (HSC)"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Badge Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={courseForm.badge}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g. Flagship Program"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Certification Body
                    </label>
                    <input
                      type="text"
                      value={courseForm.certificationBody}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, certificationBody: e.target.value }))}
                      placeholder="e.g. State Fire Safety Council & IFSMA"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    value={courseForm.shortDescription}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Brief highlights for course card..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Detailed Syllabus (1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={courseForm.syllabus}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, syllabus: e.target.value }))}
                    placeholder="Module 1: Fire Prevention & Engineering&#10;Module 2: Industrial Safety Regulations&#10;Module 3: Breathing Apparatus Drills"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Physical Fitness Standards (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    value={courseForm.physicalRequirements}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, physicalRequirements: e.target.value }))}
                    placeholder="Height: Min 165 cm (Male)&#10;Vision: 6/6 without glasses"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Career Opportunities / Roles (1 per line)
                  </label>
                  <textarea
                    rows={2}
                    value={courseForm.careerOpportunities}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, careerOpportunities: e.target.value }))}
                    placeholder="Fire Safety Officer&#10;Industrial HSE Supervisor"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20"
                  >
                    {editingCourse ? 'Save Changes' : 'Create Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT NEWS                                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNewsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white">
                    {editingNews ? 'Edit News Bulletin' : 'Publish News or Event'}
                  </h3>
                  <p className="text-xs text-gray-500">Live bulletin displayed in news section and news marquee</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveNews} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Admission Open for Diploma Fire Safety 2024-25"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value as NewsCategory }))}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="News">News</option>
                      <option value="Event">Event</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Institute Updates">Institute Updates</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Publish Date
                    </label>
                    <input
                      type="text"
                      value={newsForm.date}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. Aug 15, 2024"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Image Thumbnail URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newsForm.imageUrl}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Short Excerpt / Summary *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newsForm.excerpt}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief news intro displayed on cards..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Full Content
                  </label>
                  <textarea
                    rows={4}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Complete bulletin content..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={newsForm.isPinned}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <label htmlFor="isPinned" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Pin this bulletin to the top of the news board
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsNewsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20"
                  >
                    {editingNews ? 'Save Changes' : 'Publish News'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT DRILL                                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDrillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white">
                    {editingDrill ? 'Edit Tactical Drill' : 'Add New Tactical Drill'}
                  </h3>
                  <p className="text-xs text-gray-500">Configure practical scenario, equipment, and duration</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrillModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDrill} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Drill Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={drillForm.title}
                    onChange={(e) => setDrillForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Search & Rescue Tactical Operations"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Tag / Category
                    </label>
                    <input
                      type="text"
                      value={drillForm.tag}
                      onChange={(e) => setDrillForm(prev => ({ ...prev, tag: e.target.value }))}
                      placeholder="e.g. Tactical Rescue"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={drillForm.duration}
                      onChange={(e) => setDrillForm(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g. 45 Hours Intensive"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={drillForm.image}
                    onChange={(e) => setDrillForm(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={drillForm.description}
                    onChange={(e) => setDrillForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tactical ground simulation summary..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Drill Highlights (1 per line)
                  </label>
                  <textarea
                    rows={3}
                    value={drillForm.highlights}
                    onChange={(e) => setDrillForm(prev => ({ ...prev, highlights: e.target.value }))}
                    placeholder="Controlled hot-fire scenario navigation&#10;Hydraulic cutter victim extrication"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Equipment Deployed (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={drillForm.equipmentUsed}
                    onChange={(e) => setDrillForm(prev => ({ ...prev, equipmentUsed: e.target.value }))}
                    placeholder="SCBA BA Set, Hydraulic Spreader, Thermal Camera"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsDrillModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20"
                  >
                    {editingDrill ? 'Save Changes' : 'Add Drill'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT PHOTO                                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white">
                    {editingPhoto ? 'Edit Photo Entry' : 'Add Photo to Gallery'}
                  </h3>
                  <p className="text-xs text-gray-500">Add campus drill pictures or ceremonial awards photos</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePhoto} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={photoForm.title}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Live Fire Hose Stream Drill"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={photoForm.category}
                      onChange={(e) => setPhotoForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Training">Training</option>
                      <option value="Events">Events</option>
                      <option value="Equipment">Equipment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Date / Month
                    </label>
                    <input
                      type="text"
                      value={photoForm.date}
                      onChange={(e) => setPhotoForm(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="e.g. August 2024"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={photoForm.imageUrl}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Caption
                  </label>
                  <textarea
                    rows={2}
                    value={photoForm.caption}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Brief description of the photo..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20"
                  >
                    {editingPhoto ? 'Save Changes' : 'Add Photo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT VIDEO                                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10"
            >
              <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white">
                    {editingVideo ? 'Edit Video Drill' : 'Add Video to Gallery'}
                  </h3>
                  <p className="text-xs text-gray-500">Embed YouTube footage with automatic preview rendering</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoForm.title}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Live Foam Tender Fire Drill"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    YouTube Video ID or Full URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoForm.youtubeId}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, youtubeId: e.target.value }))}
                    placeholder="e.g. DhFopy0Sh9I or https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Accepts full YouTube URL or 11-digit video ID</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={videoForm.category}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Practical Drill">Practical Drill</option>
                      <option value="Fire Demo">Fire Demo</option>
                      <option value="Search & Rescue">Search & Rescue</option>
                      <option value="Campus Life">Campus Life</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Duration (mm:ss)
                    </label>
                    <input
                      type="text"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g. 4:15"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={videoForm.description}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Details about the drill maneuvers..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20"
                  >
                    {editingVideo ? 'Save Changes' : 'Add Video'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
