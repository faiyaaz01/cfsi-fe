import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Lock, 
  Unlock, 
  Plus, 
  Edit3, 
  Trash2, 
  Tag, 
  Calendar, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Sparkles, 
  RotateCcw,
  Eye,
  FileText,
  AlertCircle,
  Clock,
  User,
  Users,
  GraduationCap,
  Search,
  BookOpen,
  TrendingUp,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCheck,
  UserCheck,
  RefreshCw,
  Sun,
  Flame,
  FileSpreadsheet,
  ExternalLink,
  Printer,
  UploadCloud,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useStudentData } from '../context/StudentDataContext';
import { NewsPost, NewsCategory, AttendanceRecord, AttendanceStatus, AttendanceSlot, StudentVerificationRecord } from '../types';
import { studentsData } from '../data/students';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { CadetDetailModal } from '../components/admin/CadetDetailModal';

import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BulkStudentImportModal } from '../components/admin/BulkStudentImportModal';
import { CountUp } from '../components/common/CountUp';
import { SkeletonTable, SkeletonMuster } from '../components/common/Skeleton';
import { TablePagination } from '../components/common/TablePagination';

// News Schema
const postSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.enum(['News', 'Event', 'Announcement', 'Institute Updates']),
  date: z.string().min(1, 'Please select a date'),
  excerpt: z.string().min(10, 'Short description must be at least 10 characters').max(200, 'Keep excerpt under 200 characters'),
  content: z.string().min(20, 'Full content must be at least 20 characters'),
  imageUrl: z.string().optional(),
  author: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {user, logout} = useAuth();
  const isAuthenticated = user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Tabs: 'students' | 'attendance' | 'news_events' | 'updates' | 'all'
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'news_events' | 'updates' | 'all'>(
    tabParam === 'attendance' ? 'attendance' : 'students'
  );

  useEffect(() => {
    if (tabParam === 'attendance') {
      setActiveTab('attendance');
    }
  }, [tabParam]);
  
  // News context
  const { posts, addPost, updatePost, deletePost, resetToSeed: resetNewsToSeed } = useNews();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  // Student Data context (Attendance)
  const { 
    attendance, 
    addAttendance, 
    updateAttendance, 
    deleteAttendance,
    setSlotAttendance,
    bulkMarkDaySlots,
    uploadDayAttendance,
    clearDayAttendance,
    getAttendanceByStudent,
    getStudentAttendanceSummary,
    isDateLocked,
    resetToSeed: resetStudentDataToSeed 
  } = useStudentData();

  // --- CADET / STUDENT DIRECTORY STATE ---
  const [cadetSearch, setCadetSearch] = useState('');
  const [cadetCourseFilter, setCadetCourseFilter] = useState('All');
  const [selectedCadetDetail, setSelectedCadetDetail] = useState<StudentVerificationRecord | null>(null);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState<boolean>(false);
  const [cadetsList, setCadetsList] = useState<StudentVerificationRecord[]>([]);
  const [isLoadingCadets, setIsLoadingCadets] = useState<boolean>(false);
  const [deletingCadetId, setDeletingCadetId] = useState<string | null>(null);

  // Helper to extract numeric roll number for natural ascending sort
  const getNumericRoll = (cadet: StudentVerificationRecord): number => {
    const raw = cadet.rollNo ?? cadet.id ?? '';
    const match = String(raw).match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
  };

  // Fetch registered cadets dynamically from backend MongoDB
  const loadCadets = useCallback(async () => {
    try {
      setIsLoadingCadets(true);
      const data = await api.getStudents();
      const sorted = (data || []).sort((a, b) => {
        const rollA = getNumericRoll(a);
        const rollB = getNumericRoll(b);
        if (rollA !== rollB) return rollA - rollB;
        return a.name.localeCompare(b.name);
      });
      setCadetsList(sorted);
    } catch (err: any) {
      console.warn('Could not fetch cadets from backend:', err);
      setCadetsList([]);
    } finally {
      setIsLoadingCadets(false);
    }
  }, []);

  useEffect(() => {
    loadCadets();
  }, [loadCadets]);

  // Permanently delete a student from database (removes user login, profile, and attendance)
  const handleDeleteCadet = async (cadet: StudentVerificationRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete Student "${cadet.name}" (${cadet.id})?\n\nThis will permanently remove their user account, student record, and attendance logs from the database.`
    );
    if (!confirmed) return;

    try {
      setDeletingCadetId(cadet.id);
      await api.deleteStudent(cadet.id);
      setCadetsList((prev) => prev.filter((c) => c.id !== cadet.id && c.rollNo !== cadet.rollNo));
      if (selectedCadetDetail?.id === cadet.id) {
        setSelectedCadetDetail(null);
      }
      window.dispatchEvent(new Event('attendance-refresh'));
      toast.success(`Student ${cadet.name} (${cadet.id}) permanently removed from database.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student from database');
    } finally {
      setDeletingCadetId(null);
    }
  };

  // Filtered Cadets for Student Directory (sorted by Roll Number in ascending order)
  const filteredCadets = useMemo(() => {
    return cadetsList
      .filter((cadet) => {
        const matchesCourse = cadetCourseFilter === 'All' || cadet.course === cadetCourseFilter;
        const q = cadetSearch.trim().toLowerCase();
        const matchesSearch = !q ||
          cadet.name.toLowerCase().includes(q) ||
          cadet.rollNo.toLowerCase().includes(q) ||
          cadet.id.toLowerCase().includes(q) ||
          cadet.fatherName.toLowerCase().includes(q) ||
          cadet.batch.toLowerCase().includes(q);
        return matchesCourse && matchesSearch;
      })
      .sort((a, b) => {
        const rollA = getNumericRoll(a);
        const rollB = getNumericRoll(b);
        if (rollA !== rollB) return rollA - rollB;
        return a.name.localeCompare(b.name);
      });
  }, [cadetSearch, cadetCourseFilter, cadetsList]);

  // Directory Pagination State
  const [directoryPage, setDirectoryPage] = useState<number>(1);
  const [directoryPageSize, setDirectoryPageSize] = useState<number>(10);

  // Reset directory page to 1 when search or course filter changes
  useEffect(() => {
    setDirectoryPage(1);
  }, [cadetSearch, cadetCourseFilter]);

  const paginatedCadets = useMemo(() => {
    const start = (directoryPage - 1) * directoryPageSize;
    return filteredCadets.slice(start, start + directoryPageSize);
  }, [filteredCadets, directoryPage, directoryPageSize]);

  // Dates Table State
  const [datesSearchQuery, setDatesSearchQuery] = useState<string>('');
  const [datesPage, setDatesPage] = useState<number>(1);
  const [datesPageSize, setDatesPageSize] = useState<number>(10);
  const [newDateInput, setNewDateInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customDatesList, setCustomDatesList] = useState<string[]>([]);

  // Historical Logs State
  const [showHistoricalLogs, setShowHistoricalLogs] = useState<boolean>(false);
  const [attSearchTerm, setAttSearchTerm] = useState('');
  const [attFilterStatus, setAttFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');

  // News Form
  const {
    register,
    handleSubmit,
    setValue,
    reset: resetPostForm,
    formState: { errors: postErrors, isSubmitting: isSubmittingPost }
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      category: 'News',
      date: new Date().toISOString().split('T')[0],
      author: 'CFSI Administration',
      imageUrl: '',
      excerpt: '',
      content: '',
    }
  });

  const handleLogout = () => { void logout(); navigate('/institute-login'); };

  // News Image file select preview
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setPreviewImageUrl(objectUrl);
      setValue('imageUrl', objectUrl);
      toast.info(`Image loaded for session: ${file.name}`);
    }
  };

  // Populate news form for Edit
  const handleEditNewsClick = (post: NewsPost) => {
    setEditingPostId(post.id);
    setValue('title', post.title);
    setValue('category', post.category);
    setValue('date', post.date);
    setValue('excerpt', post.excerpt);
    setValue('content', post.content);
    setValue('imageUrl', post.imageUrl || '');
    setValue('author', post.author || 'CFSI Administration');
    setPreviewImageUrl(post.imageUrl || '');
    window.scrollTo({ top: 300, behavior: 'smooth' });
    toast.info(`Editing post: "${post.title.substring(0, 30)}..."`);
  };

  const handleCancelNewsEdit = () => {
    setEditingPostId(null);
    setPreviewImageUrl('');
    resetPostForm({
      title: '',
      category: 'News',
      date: new Date().toISOString().split('T')[0],
      author: 'CFSI Administration',
      imageUrl: '',
      excerpt: '',
      content: '',
    });
  };

  // Delete post
  const handleDeletePost = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePost(id);
      if (editingPostId === id) handleCancelNewsEdit();
      toast.success('Post removed successfully');
    }
  };

  // Submit News Post
  const onNewsSubmit = async (data: PostFormValues) => {
    if (editingPostId) {
      updatePost(editingPostId, data);
      toast.success('Post Updated Successfully');
      handleCancelNewsEdit();
    } else {
      addPost(data);
      toast.success('New Article Published Live!');
      handleCancelNewsEdit();
    }
  };

  // --- ATTENDANCE HELPERS & CONFIGURATION ---
  const slotConfigMap: Record<AttendanceSlot, { label: string; shortLabel: string; subtitle: string; time: string }> = {
    'Slot 1': {
      label: 'Slot One (Morning PT)',
      shortLabel: 'Slot 1 (PT)',
      subtitle: 'Session 1: Morning Squad Drill, PT & Hose Running',
      time: '08:00 - 10:00 AM',
    },
    'Slot 2': {
      label: 'Slot Two (Theory)',
      shortLabel: 'Slot 2 (Theory)',
      subtitle: 'Session 2: Technical Classroom Theory & Safety Codes',
      time: '10:30 AM - 01:00 PM',
    },
    'Slot 3': {
      label: 'Slot Three (Drill)',
      shortLabel: 'Slot 3 (Drill)',
      subtitle: 'Session 3: High-Rise Tower & Apparatus Pumping Drills',
      time: '02:00 - 05:00 PM',
    },
  };

  const formatDateLabel = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isTodayDate = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  // Level 1: All recorded dates (distinct dates in attendance + today + custom opened dates)
  const recordedDates = useMemo(() => {
    const set = new Set<string>();
    const today = new Date().toISOString().split('T')[0];
    set.add(today);
    attendance.forEach((a) => {
      if (a.date) set.add(a.date);
    });
    customDatesList.forEach((d) => {
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [attendance, customDatesList]);

  // Level 1: Filtered dates based on search
  const filteredRecordedDates = useMemo(() => {
    if (!datesSearchQuery.trim()) return recordedDates;
    const q = datesSearchQuery.trim().toLowerCase();
    return recordedDates.filter((dateStr) => {
      let formatted = '';
      try {
        const [year, month, day] = dateStr.split('-').map(Number);
        const d = new Date(year, month - 1, day);
        formatted = d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }).toLowerCase();
      } catch {}
      return dateStr.includes(q) || formatted.includes(q);
    });
  }, [recordedDates, datesSearchQuery]);

  // Reset Level 1 pagination on search
  useEffect(() => {
    setDatesPage(1);
  }, [datesSearchQuery]);

  const paginatedDates = useMemo(() => {
    const start = (datesPage - 1) * datesPageSize;
    return filteredRecordedDates.slice(start, start + datesPageSize);
  }, [filteredRecordedDates, datesPage, datesPageSize]);

  // Level 1: Computed stats for each date
  const getDateSlotStats = useCallback((dateStr: string) => {
    const totalCadets = cadetsList.length || 138;
    const dayRecords = attendance.filter((a) => a.date === dateStr);

    const getSlotInfo = (slot: AttendanceSlot) => {
      const records = dayRecords.filter((a) => a.slot === slot || (!a.slot && slot === 'Slot 1'));
      const marked = records.length;
      const present = records.filter((r) => r.status === 'Present').length;
      const absent = records.filter((r) => r.status === 'Absent').length;
      const isFilled = totalCadets > 0 && marked >= totalCadets;
      return { marked, present, absent, isFilled, totalCadets };
    };

    const s1 = getSlotInfo('Slot 1');
    const s2 = getSlotInfo('Slot 2');
    const s3 = getSlotInfo('Slot 3');

    const filledCount = (s1.isFilled ? 1 : 0) + (s2.isFilled ? 1 : 0) + (s3.isFilled ? 1 : 0);
    const lock = isDateLocked(dateStr);

    return {
      s1,
      s2,
      s3,
      filledCount,
      isLocked: lock.locked,
      uploadedAt: lock.uploadedAt,
      canEditUntil: lock.canEditUntil,
      remainingHours: lock.remainingHours,
    };
  }, [attendance, cadetsList, isDateLocked]);

  // Level 1: Date opener - redirects to separate slot attendance page
  const handleOpenNewDate = (dateToOpen: string) => {
    if (!dateToOpen) return;
    if (!customDatesList.includes(dateToOpen)) {
      setCustomDatesList((prev) => [...prev, dateToOpen]);
    }
    navigate(`/dashboard/attendance/${dateToOpen}/Slot 1`);
  };

  const handleDeleteAttendance = async (id: string, isRecordLocked?: boolean) => {
    if (isRecordLocked) {
      toast.error('This record is permanently locked (48-hour edit window expired).');
      return;
    }
    if (window.confirm('Delete this attendance entry?')) {
      try {
        await deleteAttendance(id);
        toast.success('Attendance entry removed');
      } catch (err: any) {
        const msg = err.response?.data?.detail || err.message || 'Failed to delete';
        toast.error(`Delete failed: ${msg}`);
      }
    }
  };

  // Filtered attendance list
  const filteredAttendanceList = attendance.filter((rec) => {
    const student = cadetsList.find(
      (s) =>
        s.id.toUpperCase() === rec.studentId.toUpperCase() ||
        s.rollNo === rec.studentId ||
        (rec.rollNo && s.rollNo === rec.rollNo)
    );
    const matchesSearch = 
      !attSearchTerm ||
      rec.studentId.toLowerCase().includes(attSearchTerm.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(attSearchTerm.toLowerCase())) ||
      (rec.topicOrModule && rec.topicOrModule.toLowerCase().includes(attSearchTerm.toLowerCase()));
    const matchesStatus = attFilterStatus === 'All' || rec.status === attFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Historical Attendance Logs Pagination State
  const [historyAttPage, setHistoryAttPage] = useState<number>(1);
  const [historyAttPageSize, setHistoryAttPageSize] = useState<number>(10);

  useEffect(() => {
    setHistoryAttPage(1);
  }, [attSearchTerm, attFilterStatus]);

  const paginatedHistoryAttendance = useMemo(() => {
    const start = (historyAttPage - 1) * historyAttPageSize;
    return filteredAttendanceList.slice(start, start + historyAttPageSize);
  }, [filteredAttendanceList, historyAttPage, historyAttPageSize]);



  // Filtered News items
  const displayedPosts = posts.filter((p) => {
    if (activeTab === 'news_events') return p.category !== 'Institute Updates';
    if (activeTab === 'updates') return p.category === 'Institute Updates';
    return true; // 'all'
  });

  // If NOT Authenticated, redirect to institute login portal
  if (!isAuthenticated) {
    return <Navigate to="/institute-login" replace />;
  }

  return (
    <div className="py-12 sm:py-16 bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-gray-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>CFSI Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage student records, mark daily attendance, and publish announcements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/users"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-500/30 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage Users</span>
            </Link>

            <Link
              to="/student/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </Link>

            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 border border-gray-200 dark:border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Website</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-gray-200 dark:border-white/10 pb-3">
          
          {/* Students Directory */}
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'students'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students Directory (<CountUp value={cadetsList.length} />)</span>
          </button>

          {/* Mark Attendance */}
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'attendance'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Mark Attendance (<CountUp value={attendance.length} />)</span>
          </button>

          {/* News & Updates */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'news_events' || activeTab === 'updates' ? activeTab : 'all')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'news_events' || activeTab === 'updates' || activeTab === 'all'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>News & Updates (<CountUp value={posts.length} />)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB: CADETS / STUDENT DIRECTORY                                          */}
        {/* ========================================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Top Overview & Registry Metrics Card */}
            <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <Users className="w-4 h-4" />
                    <span>Student Management</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Student Directory
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Inspect student profiles, track attendance, and import class rosters.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBulkImportModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    title="Bulk import students from CSV or Excel and auto-generate accounts"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Import Students (Excel/CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Daily Attendance</span>
                  </button>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Enrolled</div>
                  <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
                    <CountUp value={cadetsList.length} />
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Across all courses</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Verified Profiles</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    <CountUp value={cadetsList.filter((s) => s.verificationStatus === 'Verified').length} />
                  </div>
                  <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Batch 2026–2027 Roster</div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Attendance Records</div>
                  <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
                    <CountUp value={attendance.length} />
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Total sessions recorded</div>
                </div>
              </div>

              {/* Search & Course Filter Controls */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Search Student */}
                <div className="md:col-span-6 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cadetSearch}
                    onChange={(e) => setCadetSearch(e.target.value)}
                    placeholder="Search by student name, roll number, or ID..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  />
                  {cadetSearch && (
                    <button
                      type="button"
                      onClick={() => setCadetSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Course Filter */}
                <div className="md:col-span-4">
                  <select
                    value={cadetCourseFilter}
                    onChange={(e) => setCadetCourseFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">All Courses ({cadetsList.length} Students)</option>
                    <option value="Diploma In Fire Safety">Diploma In Fire Safety</option>
                    <option value="Sub Fire Officer">Sub Fire Officer</option>
                    <option value="Certificate In Fire Safety">Certificate In Fire Safety</option>
                    <option value="Industrial Safety">Industrial Safety</option>
                  </select>
                </div>

                {/* Count Badge */}
                <div className="md:col-span-2 text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Showing <span className="text-gray-900 dark:text-white font-bold"><CountUp value={filteredCadets.length} /></span> of <CountUp value={cadetsList.length} />
                  </span>
                </div>
              </div>
            </FlatCard>

            {/* Cadets Roster Table Card */}
            <div className="bg-white dark:bg-[#12181f] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-md overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                    All Registered Students
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click "Inspect" on any student to view their complete profile, contact details, address, and drill history.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200/60 dark:border-white/10">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Roll No & ID</th>
                      <th className="py-3.5 px-4">Course & Batch</th>
                      <th className="py-3.5 px-4 text-center">Attendance</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {isLoadingCadets ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/10 animate-shimmer shrink-0" />
                              <div className="space-y-1.5 flex-1">
                                <div className="w-32 h-4 rounded bg-gray-200 dark:bg-white/10 animate-shimmer" />
                                <div className="w-20 h-3 rounded bg-gray-200 dark:bg-white/10 animate-shimmer" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <div className="w-24 h-3.5 rounded bg-gray-200 dark:bg-white/10 animate-shimmer" />
                              <div className="w-16 h-3 rounded bg-gray-200 dark:bg-white/10 animate-shimmer" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <div className="w-28 h-4 rounded-full bg-gray-200 dark:bg-white/10 animate-shimmer" />
                              <div className="w-16 h-3 rounded bg-gray-200 dark:bg-white/10 animate-shimmer" />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-white/10 animate-shimmer mx-auto" />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="w-20 h-5 rounded-full bg-gray-200 dark:bg-white/10 animate-shimmer mx-auto" />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-16 h-7 rounded-xl bg-gray-200 dark:bg-white/10 animate-shimmer" />
                              <div className="w-7 h-7 rounded-xl bg-gray-200 dark:bg-white/10 animate-shimmer" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredCadets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs font-semibold">
                          {cadetSearch
                            ? `No students found matching "${cadetSearch}".`
                            : 'No students registered in the directory yet. Click "Import Students (Excel/CSV)" above to import students from your spreadsheet.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedCadets.map((cadet) => {
                        const attSummary = getStudentAttendanceSummary(cadet.id);

                        return (
                          <tr
                            key={cadet.id}
                            className="hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                          >
                            {/* Student Profile */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/10 shrink-0 border border-gray-200 dark:border-white/10">
                                  {cadet.photoUrl ? (
                                    <img
                                      src={cadet.photoUrl}
                                      alt={cadet.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                      {cadet.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCadetDetail(cadet)}
                                    className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors text-left block"
                                  >
                                    {cadet.name}
                                  </button>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    Father: {cadet.fatherName}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Identifiers */}
                            <td className="py-3.5 px-4">
                              <div className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200">
                                Roll #{cadet.rollNo}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-1">
                                ID: <span className="font-semibold text-gray-700 dark:text-gray-300">{cadet.id}</span>
                              </div>
                            </td>

                            {/* Course & Batch */}
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                                {cadet.course}
                              </span>
                              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                {cadet.batch}
                              </p>
                            </td>

                            {/* Drill Attendance */}
                            <td className="py-3.5 px-4 text-center">
                              {attSummary.total > 0 ? (
                                <div className="inline-flex flex-col items-center">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                      attSummary.percentage >= 75
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                    }`}
                                  >
                                    {attSummary.percentage >= 75 ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      <AlertCircle className="w-3 h-3" />
                                    )}
                                    <span>{attSummary.percentage}%</span>
                                  </span>
                                  <span className="text-[10px] text-gray-400 mt-0.5">
                                    {attSummary.present} of {attSummary.total} sessions
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5">
                                  Not recorded yet
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <ShieldCheck className="w-3 h-3" />
                                <span>{cadet.verificationStatus}</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCadetDetail(cadet)}
                                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                                  title="Inspect full student profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    navigate(`/dashboard/attendance/${today}/Slot 1`);
                                  }}
                                  className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                  title="Mark attendance for this student"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCadet(cadet)}
                                  disabled={deletingCadetId === cadet.id}
                                  className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                                  title="Permanently delete student & all attendance records"
                                >
                                  {deletingCadetId === cadet.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Demo Pagination Style */}
              <TablePagination
                currentPage={directoryPage}
                totalEntries={filteredCadets.length}
                pageSize={directoryPageSize}
                onPageChange={setDirectoryPage}
                onPageSizeChange={setDirectoryPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                itemLabel="students"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MARK ATTENDANCE (DAILY ATTENDANCE DATES & SLOTS OVERVIEW TABLE)     */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Top Overview Control Card */}
                <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-md">
                  {/* Header Title & Date Selection */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        <Calendar className="w-4 h-4" />
                        <span>Daily Attendance Master Schedule</span>
                      </div>
                      <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                        Mark Student Attendance
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Overview of daily sessions across dates. Click any slot or row to open its dedicated student roster and record attendance.
                      </p>
                    </div>

                    {/* Quick Date Picker / Jump */}
                    <div className="flex flex-wrap items-center gap-2 bg-gray-100/80 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200/60 dark:border-white/5">
                      <div className="flex items-center gap-2 px-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <input
                          type="date"
                          value={newDateInput}
                          onChange={(e) => setNewDateInput(e.target.value)}
                          className="bg-transparent text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenNewDate(newDateInput)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Mark This Date</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setNewDateInput(today);
                          handleOpenNewDate(today);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Quick Metrics & Search Toolbar */}
                  <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Search Dates */}
                    <div className="md:col-span-6 relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={datesSearchQuery}
                        onChange={(e) => setDatesSearchQuery(e.target.value)}
                        placeholder="Search dates (e.g. 14 Sep, 2026, Monday)..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Quick Stat Highlights */}
                    <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-3 text-xs">
                      <div className="px-3 py-2 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border border-primary/20 font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span><CountUp value={recordedDates.length} /> Total Dates</span>
                      </div>
                      <div className="px-3 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span><CountUp value={cadetsList.length || 138} /> Students Enrolled</span>
                      </div>
                    </div>
                  </div>
                </FlatCard>

                {/* Level 1 Dates Overview Table */}
                <div className="bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-4 px-4 min-w-[200px]">Date</th>
                          <th className="py-4 px-3 text-center min-w-[170px]">Slot One (PT)</th>
                          <th className="py-4 px-3 text-center min-w-[170px]">Slot Two (Theory)</th>
                          <th className="py-4 px-3 text-center min-w-[170px]">Slot Three (Drill)</th>
                          <th className="py-4 px-3 text-center min-w-[170px]">Filled Slots</th>
                          <th className="py-4 px-4 text-center min-w-[140px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {paginatedDates.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-gray-400 text-sm font-semibold">
                              No attendance dates found matching your search.
                            </td>
                          </tr>
                        ) : (
                          paginatedDates.map((dateStr) => {
                            const stats = getDateSlotStats(dateStr);
                            const isToday = isTodayDate(dateStr);

                            return (
                              <tr
                                key={dateStr}
                                className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors"
                              >
                                {/* Date Column */}
                                <td className="py-4 px-4">
                                  <div className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-extrabold mt-0.5">
                                      <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                                          {formatDateLabel(dateStr)}
                                        </span>
                                        {isToday && (
                                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-white shadow-xs">
                                            Today
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 font-mono">
                                        <span>{dateStr}</span>
                                        {stats.isLocked ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500">
                                            • <Lock className="w-3 h-3" /> Locked
                                          </span>
                                        ) : stats.uploadedAt ? (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                                            • <CheckCircle2 className="w-3 h-3" /> Live Synced
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold text-amber-500">
                                            • Draft
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                {/* Slot One Column */}
                                <td className="py-4 px-3">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/dashboard/attendance/${dateStr}/Slot 1`)}
                                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer hover:scale-[1.02] shadow-xs ${
                                      stats.s1.isFilled
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                                        : stats.s1.marked > 0
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                                        : 'bg-gray-100/70 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:border-primary/50'
                                    }`}
                                    title="Open Slot 1 (Morning PT) Attendance"
                                  >
                                    <span className="font-extrabold flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${stats.s1.isFilled ? 'bg-emerald-500' : stats.s1.marked > 0 ? 'bg-amber-500 animate-ping' : 'bg-gray-400'}`} />
                                      <span>{stats.s1.isFilled ? '138 Marked' : stats.s1.marked > 0 ? `${stats.s1.marked} Marked` : 'Pending (0/138)'}</span>
                                    </span>
                                    <span className="text-[10px] opacity-80 font-normal">
                                      {stats.s1.marked > 0 ? `${stats.s1.present} P • ${stats.s1.absent} A` : 'Click to Mark'}
                                    </span>
                                  </button>
                                </td>

                                {/* Slot Two Column */}
                                <td className="py-4 px-3">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/dashboard/attendance/${dateStr}/Slot 2`)}
                                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer hover:scale-[1.02] shadow-xs ${
                                      stats.s2.isFilled
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                                        : stats.s2.marked > 0
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                                        : 'bg-gray-100/70 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:border-primary/50'
                                    }`}
                                    title="Open Slot 2 (Theory) Attendance"
                                  >
                                    <span className="font-extrabold flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${stats.s2.isFilled ? 'bg-emerald-500' : stats.s2.marked > 0 ? 'bg-amber-500 animate-ping' : 'bg-gray-400'}`} />
                                      <span>{stats.s2.isFilled ? '138 Marked' : stats.s2.marked > 0 ? `${stats.s2.marked} Marked` : 'Pending (0/138)'}</span>
                                    </span>
                                    <span className="text-[10px] opacity-80 font-normal">
                                      {stats.s2.marked > 0 ? `${stats.s2.present} P • ${stats.s2.absent} A` : 'Click to Mark'}
                                    </span>
                                  </button>
                                </td>

                                {/* Slot Three Column */}
                                <td className="py-4 px-3">
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/dashboard/attendance/${dateStr}/Slot 3`)}
                                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer hover:scale-[1.02] shadow-xs ${
                                      stats.s3.isFilled
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                                        : stats.s3.marked > 0
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                                        : 'bg-gray-100/70 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:border-primary/50'
                                    }`}
                                    title="Open Slot 3 (Drill) Attendance"
                                  >
                                    <span className="font-extrabold flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${stats.s3.isFilled ? 'bg-emerald-500' : stats.s3.marked > 0 ? 'bg-amber-500 animate-ping' : 'bg-gray-400'}`} />
                                      <span>{stats.s3.isFilled ? '138 Marked' : stats.s3.marked > 0 ? `${stats.s3.marked} Marked` : 'Pending (0/138)'}</span>
                                    </span>
                                    <span className="text-[10px] opacity-80 font-normal">
                                      {stats.s3.marked > 0 ? `${stats.s3.present} P • ${stats.s3.absent} A` : 'Click to Mark'}
                                    </span>
                                  </button>
                                </td>

                                {/* Filled Slots Column */}
                                <td className="py-4 px-3">
                                  <div className="flex flex-col items-center justify-center gap-1.5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                                      stats.filledCount === 3
                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                        : stats.filledCount === 2
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                        : stats.filledCount === 1
                                        ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/10'
                                    }`}>
                                      {stats.filledCount === 3 ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                                      )}
                                      <span>{stats.filledCount} of 3 Filled</span>
                                    </span>

                                    <div className="w-24 bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          stats.filledCount === 3 ? 'bg-emerald-500' : stats.filledCount === 2 ? 'bg-amber-500' : stats.filledCount === 1 ? 'bg-orange-500' : 'bg-transparent'
                                        }`}
                                        style={{ width: `${(stats.filledCount / 3) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>

                                {/* Actions Column */}
                                <td className="py-4 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const targetSlot = !stats.s1.isFilled ? 'Slot 1' : !stats.s2.isFilled ? 'Slot 2' : !stats.s3.isFilled ? 'Slot 3' : 'Slot 1';
                                      navigate(`/dashboard/attendance/${dateStr}/${encodeURIComponent(targetSlot)}`);
                                    }}
                                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer hover:shadow-md"
                                  >
                                    <span>{stats.filledCount === 3 ? 'View / Edit' : 'Mark Slots'}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer with Demo Pagination Style */}
                  <TablePagination
                    currentPage={datesPage}
                    totalEntries={filteredRecordedDates.length}
                    pageSize={datesPageSize}
                    onPageChange={setDatesPage}
                    onPageSizeChange={setDatesPageSize}
                    pageSizeOptions={[5, 10, 25, 50]}
                    itemLabel="dates"
                  />
                </div>

                {/* Historical Logs Accordion Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHistoricalLogs(!showHistoricalLogs)}
                    className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between shadow-sm cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>View All Historical Attendance Records ({filteredAttendanceList.length} Entries)</span>
                    </div>
                    <span className="text-primary font-bold">{showHistoricalLogs ? '▲ Collapse Logs' : '▼ Expand Logs'}</span>
                  </button>
                </div>

                {/* Historical Logs List (Expandable) */}
                {showHistoricalLogs && (
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                          All Recorded Attendance Logs
                        </h3>
                        <span className="text-xs text-gray-400">Search, filter, or delete past drill sessions across all dates</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-60">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={attSearchTerm}
                            onChange={(e) => setAttSearchTerm(e.target.value)}
                            placeholder="Search cadet or topic..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>

                        <select
                          value={attFilterStatus}
                          onChange={(e) => setAttFilterStatus(e.target.value as any)}
                          className="px-2.5 py-1.5 rounded-xl text-xs border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none"
                        >
                          <option value="All">All Status</option>
                          <option value="Present">Present Only</option>
                          <option value="Absent">Absent Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {filteredAttendanceList.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 bg-white dark:bg-[#161d27] rounded-2xl border border-gray-200 dark:border-white/10 text-xs">
                          No attendance entries matching search or filters.
                        </div>
                      ) : (
                        filteredAttendanceList.slice((historyAttPage - 1) * historyAttPageSize, historyAttPage * historyAttPageSize).map((rec) => {
                          const student = cadetsList.find(
                            (s) =>
                              s.id.toUpperCase() === rec.studentId.toUpperCase() ||
                              s.rollNo === rec.studentId ||
                              (rec.rollNo && s.rollNo === rec.rollNo)
                          );
                          return (
                            <GlassCard
                              key={rec.id}
                              hoverEffect={true}
                              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-gray-200/80 dark:border-white/10"
                            >
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md ${
                                    rec.status === 'Present'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                  }`}>
                                    {rec.status === 'Present' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                    <span>{rec.status}</span>
                                  </span>

                                  {rec.slot && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20">
                                      {rec.slot}
                                    </span>
                                  )}

                                  {rec.isLocked ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                      <Lock className="w-3 h-3" />
                                      <span>Locked</span>
                                    </span>
                                  ) : rec.uploadedAt ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      <UploadCloud className="w-3 h-3" />
                                      <span>Uploaded</span>
                                    </span>
                                  ) : null}

                                  <span className="text-xs text-gray-500 font-semibold">
                                    {formatDateLabel(rec.date)}
                                  </span>

                                  <span className="text-xs font-mono text-gray-400">
                                    • ID: {rec.studentId}
                                  </span>
                                </div>

                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                  {student?.name || rec.studentId}
                                  <span className="font-normal text-xs text-gray-400 ml-2">({rec.course})</span>
                                </h4>

                                {rec.topicOrModule && (
                                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                    <span className="text-primary font-semibold">Drill: </span>{rec.topicOrModule}
                                  </p>
                                )}

                                {rec.remarks && (
                                  <p className="text-[11px] text-gray-500 italic">
                                    "{rec.remarks}" {rec.markedBy ? `— by ${rec.markedBy}` : ''}
                                  </p>
                                )}
                              </div>

                              {/* Delete Log Button */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttendance(rec.id, rec.isLocked)}
                                  disabled={rec.isLocked}
                                  className={`p-2 rounded-xl transition-colors ${
                                    rec.isLocked
                                      ? 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500 cursor-not-allowed'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white'
                                  }`}
                                  title={rec.isLocked ? 'Record permanently locked (>48h)' : 'Delete record'}
                                >
                                  {rec.isLocked ? <Lock className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </GlassCard>
                          );
                        })
                      )}
                    </div>

                    {/* Table Footer with Demo Pagination Style */}
                    <TablePagination
                      currentPage={historyAttPage}
                      totalEntries={filteredAttendanceList.length}
                      pageSize={historyAttPageSize}
                      onPageChange={setHistoryAttPage}
                      onPageSizeChange={setHistoryAttPageSize}
                      pageSizeOptions={[10, 25, 50, 100]}
                      itemLabel="records"
                    />
                  </div>
                )}

                {/* Database Maintenance Card */}
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Attendance Database Maintenance</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Clear attendance records back to sample demo data. Enrolled student directory profiles will not be touched.</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Reset all attendance records? This action cannot be undone.')) {
                        await resetStudentDataToSeed();
                        toast.success('Attendance records reset successfully');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-300 dark:border-rose-800 transition-colors shrink-0 cursor-pointer"
                  >
                    Reset Attendance Records
                  </button>
                </div>
              </div>
            )}

        {/* ========================================================================= */}
        {/* TABS: NEWS & UPDATES (Content Manager)                                    */}
        {/* ========================================================================= */}
        {(activeTab === 'news_events' || activeTab === 'updates' || activeTab === 'all') && (
          <div className="space-y-6">
            {/* Sub-Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                All Posts ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('news_events')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'news_events'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                News & Events ({posts.filter((p) => p.category !== 'Institute Updates').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('updates')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'updates'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                Institute Updates ({posts.filter((p) => p.category === 'Institute Updates').length})
              </button>
            </div>

            {/* Create / Edit Post Form Card */}
            <FlatCard hoverEffect={false} className="p-6 sm:p-8 mb-6 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                      {editingPostId ? 'Edit Campus Post' : 'Publish Campus Announcement'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Published posts appear immediately on the public website and student feeds.
                    </p>
                  </div>
                </div>

                {editingPostId && (
                  <button
                    type="button"
                    onClick={handleCancelNewsEdit}
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit(onNewsSubmit)} className="space-y-5">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Headline Title *
                  </label>
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g. Annual Heavy Vehicle Water Tender Operations Drill Completed"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {postErrors.title && (
                    <p className="text-xs text-red-500 mt-1">{postErrors.title.message}</p>
                  )}
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Post Category *
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="News">News</option>
                      <option value="Event">Event</option>
                      <option value="Announcement">Announcement</option>
                      <option value="Institute Updates">Institute Updates</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      {...register('date')}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Short Excerpt / Summary (Under 200 chars) *
                  </label>
                  <input
                    type="text"
                    {...register('excerpt')}
                    placeholder="Brief summary appearing on homepage cards and feed list..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {postErrors.excerpt && (
                    <p className="text-xs text-red-500 mt-1">{postErrors.excerpt.message}</p>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Full Content & Operational Details *
                  </label>
                  <textarea
                    rows={4}
                    {...register('content')}
                    placeholder="Detailed explanation, equipment deployed, cadet roster, or key dates..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {postErrors.content && (
                    <p className="text-xs text-red-500 mt-1">{postErrors.content.message}</p>
                  )}
                </div>

                {/* Optional Image & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Upload Featured Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    {previewImageUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={previewImageUrl}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                        <span className="text-[11px] text-gray-400">Attached image preview</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Author Byline
                    </label>
                    <input
                      type="text"
                      {...register('author')}
                      placeholder="CFSI Administration"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  {editingPostId && (
                    <button
                      type="button"
                      onClick={handleCancelNewsEdit}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingPostId ? 'Update Post' : 'Publish Announcement'}</span>
                  </button>
                </div>

              </form>
            </FlatCard>

            {/* List of Posted Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-xl text-gray-900 dark:text-white">
                  Published Announcements ({displayedPosts.length})
                </h3>
                <span className="text-xs text-gray-400">Manage published updates and notices</span>
              </div>

              {displayedPosts.map((post) => (
                <div key={post.id}>
                  <GlassCard hoverEffect={false} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200/80 dark:border-white/10">
                    
                    {/* Left Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-gray-200 dark:border-white/10"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                            {post.category}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{post.date}</span>
                          </span>
                          {post.author && (
                            <span className="text-xs text-gray-400">• {post.author}</span>
                          )}
                        </div>
                        <h4 className="font-heading font-bold text-base text-gray-900 dark:text-white leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Right Actions: Edit & Delete */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleEditNewsClick(post)}
                        className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
                        title="Edit this post"
                        aria-label="Edit post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete this post"
                        aria-label="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </GlassCard>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* CADET DETAILS INSPECTION MODAL                                           */}
        {/* ========================================================================= */}
        <CadetDetailModal
          cadet={selectedCadetDetail}
          onClose={() => setSelectedCadetDetail(null)}
          onNavigateToAttendance={(_cadet) => {
            const today = new Date().toISOString().split("T")[0];
            navigate(`/dashboard/attendance/${today}/Slot 1`);
          }}
        />

                {/* Bulk Student Import Modal */}
        <BulkStudentImportModal
          isOpen={bulkImportModalOpen}
          onClose={() => setBulkImportModalOpen(false)}
          onSuccess={() => {
            toast.success('Bulk student accounts generated successfully');
            loadCadets();
          }}
        />

      </div>
    </div>
  );
};
