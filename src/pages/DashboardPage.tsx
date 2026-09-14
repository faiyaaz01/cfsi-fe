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
  Loader2
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useStudentData } from '../context/StudentDataContext';
import { NewsPost, NewsCategory, AttendanceRecord, AttendanceStatus, AttendanceSlot, StudentVerificationRecord } from '../types';
import { studentsData } from '../data/students';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { Link, useNavigate, Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { BulkStudentImportModal } from '../components/admin/BulkStudentImportModal';

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

  // Tabs: 'students' | 'attendance' | 'news_events' | 'updates' | 'all'
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'news_events' | 'updates' | 'all'>('students');
  
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

  // Fetch registered cadets dynamically from backend MongoDB
  const loadCadets = useCallback(async () => {
    try {
      setIsLoadingCadets(true);
      const data = await api.getStudents();
      setCadetsList(data || []);
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
      toast.success(`Student ${cadet.name} (${cadet.id}) permanently removed from database.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student from database');
    } finally {
      setDeletingCadetId(null);
    }
  };

  // Filtered Cadets for Student Directory
  const filteredCadets = useMemo(() => {
    return cadetsList.filter((cadet) => {
      const matchesCourse = cadetCourseFilter === 'All' || cadet.course === cadetCourseFilter;
      const q = cadetSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        cadet.name.toLowerCase().includes(q) ||
        cadet.rollNo.toLowerCase().includes(q) ||
        cadet.id.toLowerCase().includes(q) ||
        cadet.fatherName.toLowerCase().includes(q) ||
        cadet.batch.toLowerCase().includes(q);
      return matchesCourse && matchesSearch;
    });
  }, [cadetSearch, cadetCourseFilter, cadetsList]);

  // --- 3-SLOT DAILY ATTENDANCE MUSTER STATE ---
  const [selectedMusterDate, setSelectedMusterDate] = useState(new Date().toISOString().split('T')[0]);
  const [musterCourseFilter, setMusterCourseFilter] = useState<string>('All');
  const [musterSearch, setMusterSearch] = useState<string>('');
  const [musterInstructor, setMusterInstructor] = useState<string>('Chief Instructor Dave');
  const [slot1Topic, setSlot1Topic] = useState<string>('Morning Squad Drill, PT & Hose Running');
  const [slot2Topic, setSlot2Topic] = useState<string>('NBC & Hazardous Materials Safety Codes');
  const [slot3Topic, setSlot3Topic] = useState<string>('High-Rise Tower & Apparatus Pumping Drills');
  const [showSlotConfig, setShowSlotConfig] = useState<boolean>(false);
  const [showHistoricalLogs, setShowHistoricalLogs] = useState<boolean>(false);
  const [attSearchTerm, setAttSearchTerm] = useState('');
  const [attFilterStatus, setAttFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');
  const [isUploadingMuster, setIsUploadingMuster] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);

  const lockStatus = useMemo(
    () => isDateLocked(selectedMusterDate),
    [isDateLocked, selectedMusterDate, attendance]
  );
  const isLocked = lockStatus.locked;

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

  // --- 3-SLOT MUSTER HANDLERS ---
  const handlePrevDay = () => {
    try {
      const [year, month, day] = selectedMusterDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() - 1);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      setSelectedMusterDate(`${yStr}-${mStr}-${dStr}`);
      setHasPendingChanges(false);
    } catch {
      // fallback
    }
  };

  const handleNextDay = () => {
    try {
      const [year, month, day] = selectedMusterDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() + 1);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      setSelectedMusterDate(`${yStr}-${mStr}-${dStr}`);
      setHasPendingChanges(false);
    } catch {
      // fallback
    }
  };

  const handleSetToday = () => {
    setSelectedMusterDate(new Date().toISOString().split('T')[0]);
    setHasPendingChanges(false);
  };

  const formattedDateLabel = useMemo(() => {
    try {
      const [year, month, day] = selectedMusterDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return selectedMusterDate;
    }
  }, [selectedMusterDate]);

  // Cadets matching current filter
  const filteredStudentsForMuster = useMemo(() => {
    return cadetsList.filter((s) => {
      const matchesCourse = musterCourseFilter === 'All' || s.course === musterCourseFilter;
      const matchesSearch = !musterSearch ||
        s.name.toLowerCase().includes(musterSearch.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(musterSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(musterSearch.toLowerCase());
      return matchesCourse && matchesSearch;
    });
  }, [musterCourseFilter, musterSearch, cadetsList]);

  // Helper to find slot record for a cadet on selectedMusterDate
  const getStudentSlotRecord = (studentId: string, slot: AttendanceSlot): AttendanceRecord | undefined => {
    const norm = studentId.trim().toUpperCase();
    return attendance.find(
      (a) =>
        (a.studentId.toUpperCase() === norm || (a.rollNo && a.rollNo.toUpperCase() === norm)) &&
        a.date === selectedMusterDate &&
        (a.slot === slot || (!a.slot && slot === 'Slot 1'))
    );
  };

  // Muster summary metrics for the selected date
  const musterStats = useMemo(() => {
    const totalCadets = filteredStudentsForMuster.length;
    let s1Present = 0;
    let s1Absent = 0;
    let s2Present = 0;
    let s2Absent = 0;
    let s3Present = 0;
    let s3Absent = 0;

    filteredStudentsForMuster.forEach((s) => {
      const r1 = getStudentSlotRecord(s.id, 'Slot 1');
      if (r1?.status === 'Present') s1Present++;
      else if (r1?.status === 'Absent') s1Absent++;

      const r2 = getStudentSlotRecord(s.id, 'Slot 2');
      if (r2?.status === 'Present') s2Present++;
      else if (r2?.status === 'Absent') s2Absent++;

      const r3 = getStudentSlotRecord(s.id, 'Slot 3');
      if (r3?.status === 'Present') s3Present++;
      else if (r3?.status === 'Absent') s3Absent++;
    });

    const totalMarkedPresent = s1Present + s2Present + s3Present;
    const totalPossibleSlots = totalCadets * 3;
    const dayRate = totalPossibleSlots > 0 ? Math.round((totalMarkedPresent / totalPossibleSlots) * 100) : 0;

    return {
      totalCadets,
      s1Present,
      s1Absent,
      s2Present,
      s2Absent,
      s3Present,
      s3Absent,
      dayRate
    };
  }, [filteredStudentsForMuster, attendance, selectedMusterDate]);

  // 1-Click Slot Toggle
  const handleToggleSlot = (student: StudentVerificationRecord, slot: AttendanceSlot, newStatus: AttendanceStatus) => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
      return;
    }
    const topic = slot === 'Slot 1' ? slot1Topic : slot === 'Slot 2' ? slot2Topic : slot3Topic;
    setSlotAttendance(student.id, selectedMusterDate, slot, newStatus, {
      course: student.course,
      rollNo: student.rollNo,
      topicOrModule: topic,
      markedBy: musterInstructor,
    });
    setHasPendingChanges(true);
  };

  // Mark all 3 slots for one cadet
  const handleMarkStudentAllSlots = (student: StudentVerificationRecord, status: AttendanceStatus) => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
      return;
    }
    (['Slot 1', 'Slot 2', 'Slot 3'] as AttendanceSlot[]).forEach((slot) => {
      const topic = slot === 'Slot 1' ? slot1Topic : slot === 'Slot 2' ? slot2Topic : slot3Topic;
      setSlotAttendance(student.id, selectedMusterDate, slot, status, {
        course: student.course,
        rollNo: student.rollNo,
        topicOrModule: topic,
        markedBy: musterInstructor,
      });
    });
    setHasPendingChanges(true);
    toast.success(`${student.name}: Marked ${status} for all 3 slots.`);
  };

  // Bulk mark slots across all filtered cadets
  const handleBulkMark = (slot: AttendanceSlot | 'All', status: AttendanceStatus) => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
      return;
    }
    const targets = filteredStudentsForMuster.map((s) => ({
      studentId: s.id,
      rollNo: s.rollNo,
      course: s.course,
    }));
    if (targets.length === 0) {
      toast.error('No students match the current filter.');
      return;
    }
    const topic = slot === 'Slot 1' ? slot1Topic : slot === 'Slot 2' ? slot2Topic : slot3Topic;
    bulkMarkDaySlots(selectedMusterDate, slot, status, targets, musterInstructor, topic);
    setHasPendingChanges(true);
    toast.success(
      slot === 'All'
        ? `Marked ${targets.length} students ${status} for all 3 slots on ${selectedMusterDate}`
        : `Marked ${targets.length} students ${status} for ${slot} on ${selectedMusterDate}`
    );
  };

  // Upload and commit marked muster to MongoDB with 48-hour edit window
  const handleUploadAttendance = async () => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
      return;
    }

    const dayRecords = attendance.filter((a) => a.date === selectedMusterDate);
    if (dayRecords.length === 0) {
      toast.error('No attendance records have been marked yet for this date to upload.');
      return;
    }

    try {
      setIsUploadingMuster(true);
      await uploadDayAttendance(
        selectedMusterDate,
        dayRecords.map((r) => ({
          studentId: r.studentId,
          rollNo: r.rollNo,
          slot: r.slot,
          status: r.status,
          course: r.course,
          topicOrModule: r.topicOrModule,
          remarks: r.remarks,
          markedBy: r.markedBy,
        }))
      );
      setHasPendingChanges(false);
      toast.success(
        `Muster successfully uploaded! Live-synced to student portal. Editable for the next 48 hours.`
      );
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to upload attendance.';
      toast.error(`Upload failed: ${msg}`);
    } finally {
      setIsUploadingMuster(false);
    }
  };

  // Clear day attendance
  const handleClearDay = async () => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
      return;
    }
    if (window.confirm(`Are you sure you want to clear all attendance entries for ${formattedDateLabel}?`)) {
      await clearDayAttendance(selectedMusterDate);
      setHasPendingChanges(false);
      toast.info(`Cleared muster records for ${selectedMusterDate}`);
    }
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
              <LayoutDashboard className="w-4 h-4" />
              <span>CFSI Institute Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white">
              Admin & Academic Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Live updates persist in MongoDB database and synchronize with student portals.
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
              to="/news"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 border border-gray-200 dark:border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Feed</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
            >
              Lock / Sign Out
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-gray-200 dark:border-white/10 pb-3">
          
          {/* Cadets Directory */}
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'students'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Students Directory ({cadetsList.length})</span>
          </button>

          {/* Mark Attendance */}
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'attendance'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Mark Attendance ({attendance.length})</span>
          </button>

          {/* News & Events */}
          <button
            type="button"
            onClick={() => setActiveTab('news_events')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'news_events'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            News & Events ({posts.filter((p) => p.category !== 'Institute Updates').length})
          </button>

          {/* Institute Updates */}
          <button
            type="button"
            onClick={() => setActiveTab('updates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'updates'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            Institute Updates ({posts.filter((p) => p.category === 'Institute Updates').length})
          </button>

          {/* All News */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            All News ({posts.length})
          </button>

          {/* Clear Muster Records in MongoDB */}
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Clear all attendance muster records from MongoDB database? This action cannot be undone.')) {
                await resetStudentDataToSeed();
                toast.success('Purged attendance records from MongoDB database');
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors ml-auto"
            title="Clear all attendance muster records from MongoDB"
          >
            Reset Attendance Database
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
                    <GraduationCap className="w-4 h-4" />
                    <span>Student Registry</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Institutional Student Directory
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Inspect student demographics and track live physical drill attendance.
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
                    <span>Bulk Import Students (CSV/Excel)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Daily Muster</span>
                  </button>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Students</div>
                  <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
                    {cadetsList.length}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Across 4 Safety Programs</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Verified Credentials</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {cadetsList.filter((s) => s.verificationStatus === 'Verified').length}
                  </div>
                  <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Batch 2026-2027 Roster</div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Muster Logs</div>
                  <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
                    {attendance.length}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Physical & Theory Drill Slots</div>
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
                    placeholder="Search student by name, roll no, student ID, father's name..."
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
                    <option value="All">All Programs ({cadetsList.length} Students)</option>
                    <option value="Diploma In Fire Safety">Diploma In Fire Safety</option>
                    <option value="Sub Fire Officer">Sub Fire Officer</option>
                    <option value="Certificate In Fire Safety">Certificate In Fire Safety</option>
                    <option value="Industrial Safety">Industrial Safety</option>
                  </select>
                </div>

                {/* Count Badge */}
                <div className="md:col-span-2 text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Showing <span className="text-gray-900 dark:text-white font-bold">{filteredCadets.length}</span> of {cadetsList.length}
                  </span>
                </div>
              </div>
            </FlatCard>

            {/* Cadets Roster Table Card */}
            <div className="bg-white dark:bg-[#12181f] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-md overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                    Student Directory & Roster
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click "Inspect Details" to review comprehensive demographics and attendance breakdown.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200/60 dark:border-white/10">
                      <th className="py-3.5 px-4">Student Profile</th>
                      <th className="py-3.5 px-4">Identifiers</th>
                      <th className="py-3.5 px-4">Program & Batch</th>
                      <th className="py-3.5 px-4 text-center">Drill Attendance</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredCadets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs font-semibold">
                          {cadetSearch
                            ? `No students found matching "${cadetSearch}".`
                            : 'No students registered in the institutional directory yet. Click "Bulk Import Students (CSV/Excel)" above to import students from your spreadsheet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCadets.map((cadet) => {
                        const attSummary = getStudentAttendanceSummary(cadet.id);

                        return (
                          <tr
                            key={cadet.id}
                            className="hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                          >
                            {/* Cadet Profile */}
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
                                    className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors text-left"
                                  >
                                    {cadet.name}
                                  </button>
                                  <p className="text-[11px] text-gray-400">
                                    S/O {cadet.fatherName}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Identifiers */}
                            <td className="py-3.5 px-4">
                              <div className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                                Student User ID: {cadet.id}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                Roll: {cadet.rollNo}
                              </div>
                            </td>

                            {/* Course & Batch */}
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                                {cadet.course}
                              </span>
                              <p className="text-[11px] text-gray-400 mt-0.5">
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
                                    {attSummary.present}/{attSummary.total} slots
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5">
                                  No drills logged
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
                                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-1 shadow-sm"
                                  title="Inspect full student profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMusterSearch(cadet.name);
                                    setActiveTab('attendance');
                                  }}
                                  className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                  title="Mark Muster for this student"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingCadetId === cadet.id}
                                  onClick={() => handleDeleteCadet(cadet)}
                                  className="p-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                  title="Permanently delete student from database"
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
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: MARK ATTENDANCE (3-SLOT DAILY MUSTER TABLE)                          */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            {/* Top Muster Control Card */}
            <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-md">
              
              {/* Header Title & Date Navigation */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Daily Muster Roll • 3 Drill Slots Each Day</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Student Daily Attendance Table
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    1-Click status toggles across Morning, Technical Theory, and Apparatus Practical slots.
                  </p>
                </div>

                {/* Date Navigator Bar */}
                <div className="flex flex-wrap items-center gap-2 bg-gray-100/80 dark:bg-white/5 p-1.5 rounded-2xl border border-gray-200/60 dark:border-white/5">
                  <button
                    type="button"
                    onClick={handlePrevDay}
                    className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-colors"
                    title="Previous Day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <input
                      type="date"
                      value={selectedMusterDate}
                      onChange={(e) => setSelectedMusterDate(e.target.value)}
                      className="bg-transparent text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleNextDay}
                    className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-colors"
                    title="Next Day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSetToday}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-sm transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Filter & Topic Bar */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Search Student */}
                <div className="md:col-span-4 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={musterSearch}
                    onChange={(e) => setMusterSearch(e.target.value)}
                    placeholder="Search student by name, roll, or cert..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Course Filter */}
                <div className="md:col-span-3">
                  <select
                    value={musterCourseFilter}
                    onChange={(e) => setMusterCourseFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">All Course Programs ({cadetsList.length})</option>
                    <option value="Diploma In Fire Safety">Diploma In Fire Safety</option>
                    <option value="Sub Fire Officer">Sub Fire Officer</option>
                    <option value="Certificate In Fire Safety">Certificate In Fire Safety</option>
                    <option value="Industrial Safety">Industrial Safety</option>
                  </select>
                </div>

                {/* Instructor */}
                <div className="md:col-span-3">
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={musterInstructor}
                      onChange={(e) => setMusterInstructor(e.target.value)}
                      placeholder="Signing Instructor"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Slot Topics Toggle */}
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSlotConfig(!showSlotConfig)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{showSlotConfig ? 'Hide Topics' : 'Slot Topics'}</span>
                  </button>
                </div>

              </div>

              {/* Slot Topic Settings (Collapsible) */}
              {showSlotConfig && (
                <div className="pt-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-primary" />
                      <span>Configure Daily Topics for {formattedDateLabel}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Slot 1 (08:00 - 10:00 AM) Topic:
                        </label>
                        <input
                          type="text"
                          value={slot1Topic}
                          onChange={(e) => setSlot1Topic(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Slot 2 (10:30 - 01:00 PM) Topic:
                        </label>
                        <input
                          type="text"
                          value={slot2Topic}
                          onChange={(e) => setSlot2Topic(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Slot 3 (02:00 - 05:00 PM) Topic:
                        </label>
                        <input
                          type="text"
                          value={slot3Topic}
                          onChange={(e) => setSlot3Topic(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </FlatCard>

            {/* 48-Hour Lock Window & Upload Status Alert */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isLocked
                  ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200'
                  : lockStatus.uploadedAt
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isLocked
                        ? 'bg-rose-600 text-white shadow-sm'
                        : lockStatus.uploadedAt
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-amber-500 text-white shadow-sm'
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : lockStatus.uploadedAt ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading font-black text-sm sm:text-base">
                        {isLocked
                          ? 'Attendance Locked (48-Hour Edit Window Expired)'
                          : lockStatus.uploadedAt
                          ? `Attendance Uploaded • ${lockStatus.remainingHours ?? 48} Hours Left to Edit`
                          : 'Draft Mode • Attendance Not Yet Uploaded'}
                      </span>
                      {isLocked ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300">
                          Permanent Archive
                        </span>
                      ) : lockStatus.uploadedAt ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Live Synced
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                          Unpublished
                        </span>
                      )}
                      {hasPendingChanges && !isLocked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-200 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300">
                          Unsaved Edits Pending Upload
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-85 mt-0.5">
                      {isLocked
                        ? `Uploaded on ${new Date(lockStatus.uploadedAt!).toLocaleString()}. The 48-hour editing period has ended; this muster cannot be altered.`
                        : lockStatus.uploadedAt
                        ? `Uploaded on ${new Date(lockStatus.uploadedAt).toLocaleString()}. You can freely modify attendance until ${new Date(lockStatus.canEditUntil!).toLocaleString()}. Changes stream in real time to students.`
                        : 'Mark slot attendance below, then click "Upload Attendance" to commit to MongoDB and publish to the student portal. The 48-hour edit window starts once uploaded.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUploadAttendance}
                    disabled={isLocked || isUploadingMuster}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                      isLocked
                        ? 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : hasPendingChanges || !lockStatus.uploadedAt
                        ? 'bg-primary text-white hover:bg-primary-dark ring-2 ring-primary/40 shadow-md animate-pulse'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isUploadingMuster ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : isLocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>{lockStatus.uploadedAt ? 'Update & Re-Upload' : 'Upload Attendance'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              
              {/* Total Roster */}
              <GlassCard hoverEffect={false} className="p-3.5 border border-gray-200/80 dark:border-white/10">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filtered Roster</div>
                <div className="text-xl font-heading font-black text-gray-900 dark:text-white mt-1">
                  {musterStats.totalCadets} Students
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{formattedDateLabel}</div>
              </GlassCard>

              {/* Slot 1 Count */}
              <GlassCard hoverEffect={false} className="p-3.5 border border-gray-200/80 dark:border-white/10">
                <div className="flex items-center justify-between text-[11px] font-bold text-primary uppercase tracking-wider">
                  <span>Slot 1 (Morning PT)</span>
                  <span className="text-[10px] text-gray-400">08:00 - 10:00</span>
                </div>
                <div className="text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {musterStats.s1Present} <span className="text-xs text-gray-400 font-normal">/ {musterStats.totalCadets} Present</span>
                </div>
                <div className="text-[10px] text-red-500 mt-0.5">{musterStats.s1Absent} Absent</div>
              </GlassCard>

              {/* Slot 2 Count */}
              <GlassCard hoverEffect={false} className="p-3.5 border border-gray-200/80 dark:border-white/10">
                <div className="flex items-center justify-between text-[11px] font-bold text-primary uppercase tracking-wider">
                  <span>Slot 2 (Theory)</span>
                  <span className="text-[10px] text-gray-400">10:30 - 01:00</span>
                </div>
                <div className="text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {musterStats.s2Present} <span className="text-xs text-gray-400 font-normal">/ {musterStats.totalCadets} Present</span>
                </div>
                <div className="text-[10px] text-red-500 mt-0.5">{musterStats.s2Absent} Absent</div>
              </GlassCard>

              {/* Slot 3 Count */}
              <GlassCard hoverEffect={false} className="p-3.5 border border-gray-200/80 dark:border-white/10">
                <div className="flex items-center justify-between text-[11px] font-bold text-primary uppercase tracking-wider">
                  <span>Slot 3 (Apparatus)</span>
                  <span className="text-[10px] text-gray-400">02:00 - 05:00</span>
                </div>
                <div className="text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {musterStats.s3Present} <span className="text-xs text-gray-400 font-normal">/ {musterStats.totalCadets} Present</span>
                </div>
                <div className="text-[10px] text-red-500 mt-0.5">{musterStats.s3Absent} Absent</div>
              </GlassCard>

              {/* Day Attendance Rate */}
              <GlassCard hoverEffect={false} className="p-3.5 border border-gray-200/80 dark:border-white/10 col-span-2 md:col-span-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-primary uppercase tracking-wider">
                  <span>Day Muster Rate</span>
                  <span>{musterStats.dayRate}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      musterStats.dayRate >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(musterStats.dayRate, 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-gray-500 mt-1.5">Across all 3 sessions</div>
              </GlassCard>

            </div>

            {/* Bulk Actions Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Quick Bulk Actions for {formattedDateLabel}:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkMark('Slot 1', 'Present')}
                  disabled={isLocked}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white'
                  }`}
                >
                  Mark All Slot 1 (P)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('Slot 2', 'Present')}
                  disabled={isLocked}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white'
                  }`}
                >
                  Mark All Slot 2 (P)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('Slot 3', 'Present')}
                  disabled={isLocked}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white'
                  }`}
                >
                  Mark All Slot 3 (P)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('All', 'Present')}
                  disabled={isLocked}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1 ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>All 3 Slots (P)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearDay}
                  disabled={isLocked}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  Reset Day
                </button>
                <button
                  type="button"
                  onClick={handleUploadAttendance}
                  disabled={isLocked || isUploadingMuster}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 ${
                    isLocked
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                      : hasPendingChanges || !lockStatus.uploadedAt
                      ? 'bg-primary text-white hover:bg-primary-dark ring-2 ring-primary/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isUploadingMuster ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{lockStatus.uploadedAt ? 'Upload Updates' : 'Upload Muster'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* THE MUSTER ROLL TABLE (3 SLOTS) */}
            <div className="bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gray-100/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-3 text-center w-10">#</th>
                      <th className="py-3.5 px-4 min-w-[200px]">Student Profile</th>
                      <th className="py-3.5 px-4 min-w-[160px]">Program & Batch</th>
                      
                      {/* Slot 1 Header */}
                      <th className="py-3.5 px-3 text-center bg-primary/5 dark:bg-primary/10 min-w-[140px]">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-primary">Slot 1 (Morning PT)</span>
                          <span className="text-[9px] font-mono text-gray-400 normal-case">08:00 - 10:00 AM</span>
                        </div>
                      </th>

                      {/* Slot 2 Header */}
                      <th className="py-3.5 px-3 text-center bg-primary/5 dark:bg-primary/10 min-w-[140px]">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-primary">Slot 2 (Theory)</span>
                          <span className="text-[9px] font-mono text-gray-400 normal-case">10:30 AM - 01:00 PM</span>
                        </div>
                      </th>

                      {/* Slot 3 Header */}
                      <th className="py-3.5 px-3 text-center bg-primary/5 dark:bg-primary/10 min-w-[140px]">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-primary">Slot 3 (Apparatus)</span>
                          <span className="text-[9px] font-mono text-gray-400 normal-case">02:00 - 05:00 PM</span>
                        </div>
                      </th>

                      <th className="py-3.5 px-3 text-center min-w-[110px]">Day Score</th>
                      <th className="py-3.5 px-3 text-center min-w-[110px]">Quick Action</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredStudentsForMuster.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400 text-sm font-semibold">
                          No students found matching the current search / filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudentsForMuster.map((student, idx) => {
                        const rec1 = getStudentSlotRecord(student.id, 'Slot 1');
                        const rec2 = getStudentSlotRecord(student.id, 'Slot 2');
                        const rec3 = getStudentSlotRecord(student.id, 'Slot 3');

                        const countPresent = [rec1, rec2, rec3].filter((r) => r?.status === 'Present').length;
                        const countMarked = [rec1, rec2, rec3].filter(Boolean).length;

                        return (
                          <tr
                            key={student.id}
                            className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors"
                          >
                            {/* Row Index */}
                            <td className="py-3 px-3 text-center font-mono text-gray-400 text-xs">
                              {idx + 1}
                            </td>

                            {/* Cadet Profile */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0 border border-primary/20">
                                  {student.photoUrl ? (
                                    <img
                                      src={student.photoUrl}
                                      alt={student.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <User className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                                    {student.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                    <span>Roll: {student.rollNo}</span>
                                    <span>•</span>
                                    <span className="text-primary dark:text-primary-light">ID: {student.id}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Program */}
                            <td className="py-3 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                                {student.course}
                              </span>
                              <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                                {student.batch}
                              </div>
                            </td>

                            {/* SLOT 1 TOGGLE */}
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 1', 'Present')}
                                  disabled={isLocked}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    isLocked
                                      ? rec1?.status === 'Present'
                                        ? 'bg-emerald-600/60 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : rec1?.status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark Present for Slot 1'}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 1', 'Absent')}
                                  disabled={isLocked}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    isLocked
                                      ? rec1?.status === 'Absent'
                                        ? 'bg-red-600/60 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : rec1?.status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-sm'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/20'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark Absent for Slot 1'}
                                >
                                  A
                                </button>
                              </div>
                            </td>

                            {/* SLOT 2 TOGGLE */}
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 2', 'Present')}
                                  disabled={isLocked}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    isLocked
                                      ? rec2?.status === 'Present'
                                        ? 'bg-emerald-600/60 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : rec2?.status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark Present for Slot 2'}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 2', 'Absent')}
                                  disabled={isLocked}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    isLocked
                                      ? rec2?.status === 'Absent'
                                        ? 'bg-red-600/60 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : rec2?.status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-sm'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/20'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark Absent for Slot 2'}
                                >
                                  A
                                </button>
                              </div>
                            </td>

                            {/* SLOT 3 TOGGLE */}
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 3', 'Present')}
                                  disabled={isLocked}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    isLocked
                                      ? rec3?.status === 'Present'
                                        ? 'bg-emerald-600/60 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : rec3?.status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark Present for Slot 3'}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 3', 'Absent')}
                                  disabled={isLocked}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    isLocked
                                      ? rec3?.status === 'Absent'
                                        ? 'bg-red-600/60 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : rec3?.status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-sm'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/20'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark Absent for Slot 3'}
                                >
                                  A
                                </button>
                              </div>
                            </td>

                            {/* Day Score Badge */}
                            <td className="py-3 px-3 text-center">
                              {countMarked === 0 ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-white/5">
                                  Unmarked
                                </span>
                              ) : (
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                    countPresent === 3
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : countPresent === 2
                                      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                  }`}
                                >
                                  {countPresent === 3 ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  ) : countPresent === 0 ? (
                                    <XCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5" />
                                  )}
                                  <span>{countPresent}/3 ({Math.round((countPresent / 3) * 100)}%)</span>
                                </span>
                              )}
                            </td>

                            {/* Quick Action Button */}
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMarkStudentAllSlots(student, 'Present')}
                                  disabled={isLocked}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                    isLocked
                                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark 3/3 Present'}
                                >
                                  3/3 P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkStudentAllSlots(student, 'Absent')}
                                  disabled={isLocked}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                                    isLocked
                                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white'
                                  }`}
                                  title={isLocked ? 'Locked (48h expired)' : 'Mark 3/3 Absent'}
                                >
                                  3/3 A
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
            </div>

            {/* Historical Logs Accordion Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHistoricalLogs(!showHistoricalLogs)}
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>View All Historical Drill Attendance Records ({filteredAttendanceList.length} Entries)</span>
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

                <div className="space-y-3">
                  {filteredAttendanceList.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                      No logs found matching "{attSearchTerm}".
                    </div>
                  ) : (
                    filteredAttendanceList.map((rec) => {
                      const student = cadetsList.find(
                        (s) =>
                          s.id.toUpperCase() === rec.studentId.toUpperCase() ||
                          s.rollNo === rec.studentId ||
                          (rec.rollNo && s.rollNo === rec.rollNo)
                      );
                      return (
                        <GlassCard
                          key={rec.id}
                          hoverEffect={false}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200/80 dark:border-white/10"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                                {new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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
              </div>
            )}

          </div>
        )}



        {/* ========================================================================= */}
        {/* TABS: NEWS & UPDATES (Existing Content Manager)                           */}
        {/* ========================================================================= */}
        {(activeTab === 'news_events' || activeTab === 'updates' || activeTab === 'all') && (
          <div>
            {/* Create / Edit Post Form Card */}
            <FlatCard hoverEffect={false} className="p-6 sm:p-8 mb-12 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                      {editingPostId ? 'Edit Article / Update' : 'Publish New Article / Campus Alert'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Live posts appear instantly on the public website and persist in storage.
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
                    className="px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingPostId ? 'Update Post Now' : 'Publish Article Live'}</span>
                  </button>
                </div>

              </form>
            </FlatCard>

            {/* List of Posted Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-xl text-gray-900 dark:text-white">
                  Currently Published Items ({displayedPosts.length})
                </h3>
                <span className="text-xs text-gray-400">Stored in browser localStorage</span>
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
        {selectedCadetDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60">
            <div className="bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Top Strip */}
              <div className="h-2 w-full bg-primary" />

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Modal Header */}
                  <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/10 border-2 border-primary/20 shadow-md shrink-0">
                        {selectedCadetDetail.photoUrl ? (
                          <img
                            src={selectedCadetDetail.photoUrl}
                            alt={selectedCadetDetail.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-black">
                            {selectedCadetDetail.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-tl-lg" title="Verified">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                            {selectedCadetDetail.course}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{selectedCadetDetail.verificationStatus}</span>
                          </span>
                        </div>
                        <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                          {selectedCadetDetail.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Son / Ward of <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedCadetDetail.fatherName}</span> • {selectedCadetDetail.batch}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCadetDetail(null)}
                      className="p-2 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      title="Close Modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Section 1: Demographic & Cadet Records */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>Cadet Demographic & Institutional Record</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Cadet User ID (Login)</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-primary dark:text-primary-light mt-0.5">
                          {selectedCadetDetail.id}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Institute Roll No</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.rollNo}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Mode of Study</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.mode || 'REGULAR'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">DOB (Birth Date)</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.birthDate || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Gender</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.gender || 'MALE'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Category</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.category || 'General'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Aadhaar Card</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.aadharCard || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Contact Details</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.studentPhone || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Email ID</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                          {selectedCadetDetail.email || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Father / Guardian</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                          {selectedCadetDetail.fatherName || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Mother Name</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                          {selectedCadetDetail.motherName || 'N/A'}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 col-span-2">
                        <div className="text-[11px] font-semibold text-gray-400">Training Center Campus</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                          {selectedCadetDetail.centerName || selectedCadetDetail.centerLocation}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 col-span-2">
                        <div className="text-[11px] font-semibold text-gray-400">Present Address</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                          {selectedCadetDetail.presentAddress || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Physical Drill & Muster Attendance Record */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Dynamic Drill Muster & Training Attendance</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setMusterSearch(selectedCadetDetail.name);
                          setActiveTab('attendance');
                          setSelectedCadetDetail(null);
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Log Drill Attendance</span>
                      </button>
                    </div>

                    {(() => {
                      const summary = getStudentAttendanceSummary(selectedCadetDetail.id);
                      const cadetAttRecords = getAttendanceByStudent(selectedCadetDetail.id);

                      return (
                        <div className="space-y-3">
                          {/* 4 Attendance Metric Tiles */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10">
                              <div className="text-[11px] text-gray-500">Attendance Rate</div>
                              <div className="text-xl font-black text-primary dark:text-primary-light mt-0.5">
                                {summary.percentage}%
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                              <div className="text-[11px] text-gray-500">Total Slots</div>
                              <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                                {summary.total}
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10">
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Present Slots</div>
                              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {summary.present}
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-red-500/5 dark:bg-white/5 border border-red-500/10">
                              <div className="text-[11px] text-red-600 dark:text-red-400">Absent Slots</div>
                              <div className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5">
                                {summary.absent}
                              </div>
                            </div>
                          </div>

                          {/* Compliance Bar */}
                          {summary.total > 0 ? (
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                <span className="text-gray-600 dark:text-gray-300">Ground Drill Compliance Progress</span>
                                <span className={summary.percentage >= 75 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                                  {summary.percentage >= 75 ? 'Meets Statutory 75% Requirement' : 'Short of 75% Statutory Target'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    summary.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-center">
                              <p className="text-xs text-gray-500">
                                No attendance records recorded for this student yet. Attendance records are created when marking daily drills.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setMusterSearch(selectedCadetDetail.name);
                                  setActiveTab('attendance');
                                  setSelectedCadetDetail(null);
                                }}
                                className="mt-2 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <Clock className="w-3 h-3" />
                                <span>Mark muster in Daily Attendance tab</span>
                              </button>
                            </div>
                          )}

                          {/* Recent Log Table if any */}
                          {cadetAttRecords.length > 0 && (
                            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200/60 dark:border-white/10">
                              <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-bold text-gray-400 sticky top-0">
                                  <tr>
                                    <th className="py-2 px-3">Date</th>
                                    <th className="py-2 px-3">Slot</th>
                                    <th className="py-2 px-3">Drill Topic</th>
                                    <th className="py-2 px-3 text-center">Status</th>
                                    <th className="py-2 px-3">Instructor</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                  {cadetAttRecords.slice(0, 10).map((r) => (
                                    <tr key={r.id}>
                                      <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{r.date}</td>
                                      <td className="py-2 px-3 text-primary font-bold">{r.slot || 'Slot 1'}</td>
                                      <td className="py-2 px-3 text-gray-600 dark:text-gray-300 truncate max-w-xs">{r.topicOrModule || 'Ground Drill'}</td>
                                      <td className="py-2 px-3 text-center">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          r.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                                        }`}>
                                          {r.status}
                                        </span>
                                      </td>
                                      <td className="py-2 px-3 text-gray-400 text-[11px]">{r.markedBy || 'Instructor'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>



                  {/* Modal Footer Actions */}
                  <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Student Dossier</span>
                      </button>

                      <button
                        type="button"
                        disabled={deletingCadetId === selectedCadetDetail.id}
                        onClick={() => handleDeleteCadet(selectedCadetDetail)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        title="Permanently remove student from database"
                      >
                        {deletingCadetId === selectedCadetDetail.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete Student</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCadetDetail(null)}
                      className="px-6 py-2 rounded-xl text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                    >
                      Close
                    </button>
                  </div>

                </div>
            </div>
          </div>
        )}

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
