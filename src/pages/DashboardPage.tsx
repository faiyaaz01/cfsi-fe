import React, { useState, useMemo } from 'react';
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
  Award,
  User,
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
  Printer
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useStudentData } from '../context/StudentDataContext';
import { NewsPost, NewsCategory, AttendanceRecord, ResultRecord, AttendanceStatus, AttendanceSlot, StudentVerificationRecord } from '../types';
import { studentsData } from '../data/students';
import { calculateGrade } from '../lib/studentAuth';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { Link, useNavigate, Navigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'Password@1';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cfsi_admin_logged') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Tabs: 'students' | 'attendance' | 'results' | 'news_events' | 'updates' | 'all'
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'results' | 'news_events' | 'updates' | 'all'>('students');
  
  // News context
  const { posts, addPost, updatePost, deletePost, resetToSeed: resetNewsToSeed } = useNews();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  // Student Data context (Attendance & Results)
  const { 
    attendance, 
    results, 
    addAttendance, 
    updateAttendance, 
    deleteAttendance,
    setSlotAttendance,
    bulkMarkDaySlots,
    clearDayAttendance,
    addResult, 
    updateResult, 
    deleteResult,
    getAttendanceByStudent,
    getResultsByStudent,
    getStudentAttendanceSummary,
    resetToSeed: resetStudentDataToSeed 
  } = useStudentData();

  // --- CADET / STUDENT DIRECTORY STATE ---
  const [cadetSearch, setCadetSearch] = useState('');
  const [cadetCourseFilter, setCadetCourseFilter] = useState('All');
  const [selectedCadetDetail, setSelectedCadetDetail] = useState<StudentVerificationRecord | null>(null);

  // Filtered Cadets for Student Directory
  const filteredCadets = useMemo(() => {
    return studentsData.filter((cadet) => {
      const matchesCourse = cadetCourseFilter === 'All' || cadet.course === cadetCourseFilter;
      const q = cadetSearch.trim().toLowerCase();
      const matchesSearch = !q ||
        cadet.name.toLowerCase().includes(q) ||
        cadet.rollNo.toLowerCase().includes(q) ||
        cadet.certificateNumber.toLowerCase().includes(q) ||
        cadet.fatherName.toLowerCase().includes(q) ||
        cadet.batch.toLowerCase().includes(q);
      return matchesCourse && matchesSearch;
    });
  }, [cadetSearch, cadetCourseFilter]);

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

  // --- RESULTS FORM STATE ---
  const [resEditingId, setResEditingId] = useState<string | null>(null);
  const [resCertNo, setResCertNo] = useState(studentsData[0]?.certificateNumber || '');
  const [resCourse, setResCourse] = useState(studentsData[0]?.course || '');
  const [resSubject, setResSubject] = useState('');
  const [resMarks, setResMarks] = useState<number>(85);
  const [resMaxMarks, setResMaxMarks] = useState<number>(100);
  const [resGrade, setResGrade] = useState<string>('A+');
  const [resTerm, setResTerm] = useState('Term Final Examination');
  const [resRemarks, setResRemarks] = useState('');
  const [resSearchTerm, setResSearchTerm] = useState('');

  // Update course automatically when student selection changes in Results
  const handleResStudentChange = (cert: string) => {
    setResCertNo(cert);
    const found = studentsData.find((s) => s.certificateNumber === cert);
    if (found) setResCourse(found.course);
  };

  // Auto calculate grade when marks change
  const handleMarksChange = (marks: number, max: number) => {
    setResMarks(marks);
    setResMaxMarks(max);
    setResGrade(calculateGrade(marks, max));
  };

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

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('cfsi_admin_logged', 'true');
      setAuthError('');
      toast.success('Admin Dashboard Unlocked');
    } else {
      setAuthError('Invalid administrative credentials. Access restricted.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cfsi_admin_logged');
    toast.info('Logged out from Admin Dashboard');
    navigate('/login?role=admin');
  };

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
    } catch {
      // fallback
    }
  };

  const handleSetToday = () => {
    setSelectedMusterDate(new Date().toISOString().split('T')[0]);
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
    return studentsData.filter((s) => {
      const matchesCourse = musterCourseFilter === 'All' || s.course === musterCourseFilter;
      const matchesSearch = !musterSearch ||
        s.name.toLowerCase().includes(musterSearch.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(musterSearch.toLowerCase()) ||
        s.certificateNumber.toLowerCase().includes(musterSearch.toLowerCase());
      return matchesCourse && matchesSearch;
    });
  }, [musterCourseFilter, musterSearch]);

  // Helper to find slot record for a cadet on selectedMusterDate
  const getStudentSlotRecord = (certNo: string, slot: AttendanceSlot): AttendanceRecord | undefined => {
    const norm = certNo.trim().toUpperCase();
    return attendance.find(
      (a) =>
        a.certificateNumber.toUpperCase() === norm &&
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
      const r1 = getStudentSlotRecord(s.certificateNumber, 'Slot 1');
      if (r1?.status === 'Present') s1Present++;
      else if (r1?.status === 'Absent') s1Absent++;

      const r2 = getStudentSlotRecord(s.certificateNumber, 'Slot 2');
      if (r2?.status === 'Present') s2Present++;
      else if (r2?.status === 'Absent') s2Absent++;

      const r3 = getStudentSlotRecord(s.certificateNumber, 'Slot 3');
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
    const topic = slot === 'Slot 1' ? slot1Topic : slot === 'Slot 2' ? slot2Topic : slot3Topic;
    setSlotAttendance(student.certificateNumber, selectedMusterDate, slot, newStatus, {
      course: student.course,
      topicOrModule: topic,
      markedBy: musterInstructor,
    });
  };

  // Mark all 3 slots for one cadet
  const handleMarkStudentAllSlots = (student: StudentVerificationRecord, status: AttendanceStatus) => {
    (['Slot 1', 'Slot 2', 'Slot 3'] as AttendanceSlot[]).forEach((slot) => {
      const topic = slot === 'Slot 1' ? slot1Topic : slot === 'Slot 2' ? slot2Topic : slot3Topic;
      setSlotAttendance(student.certificateNumber, selectedMusterDate, slot, status, {
        course: student.course,
        topicOrModule: topic,
        markedBy: musterInstructor,
      });
    });
    toast.success(`${student.name}: Marked ${status} for all 3 slots.`);
  };

  // Bulk mark slots across all filtered cadets
  const handleBulkMark = (slot: AttendanceSlot | 'All', status: AttendanceStatus) => {
    const targets = filteredStudentsForMuster.map((s) => ({
      certificateNumber: s.certificateNumber,
      course: s.course,
    }));
    if (targets.length === 0) {
      toast.error('No cadets match the current filter.');
      return;
    }
    const topic = slot === 'Slot 1' ? slot1Topic : slot === 'Slot 2' ? slot2Topic : slot3Topic;
    bulkMarkDaySlots(selectedMusterDate, slot, status, targets, musterInstructor, topic);
    toast.success(
      slot === 'All'
        ? `Marked ${targets.length} cadets ${status} for all 3 slots on ${selectedMusterDate}`
        : `Marked ${targets.length} cadets ${status} for ${slot} on ${selectedMusterDate}`
    );
  };

  // Clear day attendance
  const handleClearDay = () => {
    if (window.confirm(`Are you sure you want to clear all attendance entries for ${formattedDateLabel}?`)) {
      clearDayAttendance(selectedMusterDate);
      toast.info(`Cleared muster records for ${selectedMusterDate}`);
    }
  };

  const handleDeleteAttendance = (id: string) => {
    if (window.confirm('Delete this attendance entry?')) {
      deleteAttendance(id);
      toast.success('Attendance entry removed');
    }
  };

  // --- RESULTS ACTIONS ---
  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resCertNo || !resSubject.trim()) {
      toast.error('Please select student and specify the subject.');
      return;
    }

    if (resEditingId) {
      updateResult(resEditingId, {
        certificateNumber: resCertNo,
        course: resCourse,
        subject: resSubject,
        marksObtained: Number(resMarks),
        maxMarks: Number(resMaxMarks),
        grade: resGrade,
        semesterOrTerm: resTerm || undefined,
        remarks: resRemarks || undefined,
      });
      toast.success('Examination result updated successfully');
      setResEditingId(null);
    } else {
      addResult({
        certificateNumber: resCertNo,
        course: resCourse,
        subject: resSubject,
        marksObtained: Number(resMarks),
        maxMarks: Number(resMaxMarks),
        grade: resGrade,
        semesterOrTerm: resTerm || undefined,
        remarks: resRemarks || undefined,
      });
      toast.success(`Result recorded: ${resSubject} (${resMarks}/${resMaxMarks})`);
    }

    // Reset subject and remarks
    setResSubject('');
    setResRemarks('');
  };

  const handleEditResult = (record: ResultRecord) => {
    setResEditingId(record.id);
    setResCertNo(record.certificateNumber);
    setResCourse(record.course);
    setResSubject(record.subject);
    setResMarks(record.marksObtained);
    setResMaxMarks(record.maxMarks);
    setResGrade(record.grade);
    setResTerm(record.semesterOrTerm || 'Term Final Examination');
    setResRemarks(record.remarks || '');
    window.scrollTo({ top: 350, behavior: 'smooth' });
    toast.info('Editing result record');
  };

  const handleCancelResEdit = () => {
    setResEditingId(null);
    setResSubject('');
    setResRemarks('');
  };

  const handleDeleteResult = (id: string) => {
    if (window.confirm('Delete this examination result record?')) {
      deleteResult(id);
      if (resEditingId === id) handleCancelResEdit();
      toast.success('Result record removed');
    }
  };

  // Filtered attendance list
  const filteredAttendanceList = attendance.filter((rec) => {
    const student = studentsData.find((s) => s.certificateNumber.toUpperCase() === rec.certificateNumber.toUpperCase());
    const matchesSearch = 
      !attSearchTerm ||
      rec.certificateNumber.toLowerCase().includes(attSearchTerm.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(attSearchTerm.toLowerCase())) ||
      (rec.topicOrModule && rec.topicOrModule.toLowerCase().includes(attSearchTerm.toLowerCase()));
    const matchesStatus = attFilterStatus === 'All' || rec.status === attFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filtered results list
  const filteredResultsList = results.filter((res) => {
    const student = studentsData.find((s) => s.certificateNumber.toUpperCase() === res.certificateNumber.toUpperCase());
    return (
      !resSearchTerm ||
      res.certificateNumber.toLowerCase().includes(resSearchTerm.toLowerCase()) ||
      (student && student.name.toLowerCase().includes(resSearchTerm.toLowerCase())) ||
      res.subject.toLowerCase().includes(resSearchTerm.toLowerCase())
    );
  });

  // Filtered News items
  const displayedPosts = posts.filter((p) => {
    if (activeTab === 'news_events') return p.category !== 'Institute Updates';
    if (activeTab === 'updates') return p.category === 'Institute Updates';
    return true; // 'all'
  });

  // If NOT Authenticated, redirect to unified login portal
  if (!isAuthenticated) {
    return <Navigate to="/login?role=admin" replace />;
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
              Live updates persist in browser storage and synchronize with student portals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/verify"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Certificate</span>
            </Link>

            <Link
              to="/login?role=student"
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
            <span>Cadets Directory ({studentsData.length})</span>
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

          {/* Manage Results */}
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'results'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Manage Results ({results.length})</span>
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

          {/* Clear Muster Records */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all attendance muster and examination score records? This will purge local session records.')) {
                resetStudentDataToSeed();
                toast.success('Purged local attendance and examination records');
              }
            }}
            title="Clear all attendance muster and examination records"
            className="ml-auto text-xs font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Muster Logs</span>
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
                    <span>Cadet & Trainee Registry</span>
                  </div>
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                    Institutional Cadet Directory
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Inspect cadet demographics, verify certificates, track live physical drill attendance, and review examination scorecards.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Mark Daily Muster</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('results')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Record Exam Scores</span>
                  </button>
                  <Link
                    to="/verify"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Public Verification</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Enrolled Cadets</div>
                  <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
                    {studentsData.length}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Across 4 Safety Programs</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Verified Credentials</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {studentsData.filter((s) => s.verificationStatus === 'Verified').length}
                  </div>
                  <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">100% QR & Barcode Verified</div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Muster Logs</div>
                  <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
                    {attendance.length}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Physical & Theory Drill Slots</div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">Recorded Exam Papers</div>
                  <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
                    {results.length}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Subject & Practical Scores</div>
                </div>
              </div>

              {/* Search & Course Filter Controls */}
              <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Search Cadet */}
                <div className="md:col-span-6 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cadetSearch}
                    onChange={(e) => setCadetSearch(e.target.value)}
                    placeholder="Search cadet by name, roll no, certificate ID, father's name..."
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
                    <option value="All">All Programs ({studentsData.length} Cadets)</option>
                    <option value="Diploma In Fire Safety">Diploma In Fire Safety</option>
                    <option value="Sub Fire Officer">Sub Fire Officer</option>
                    <option value="Certificate In Fire Safety">Certificate In Fire Safety</option>
                    <option value="Industrial Safety">Industrial Safety</option>
                  </select>
                </div>

                {/* Count Badge */}
                <div className="md:col-span-2 text-right">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Showing <span className="text-gray-900 dark:text-white font-bold">{filteredCadets.length}</span> of {studentsData.length}
                  </span>
                </div>
              </div>
            </FlatCard>

            {/* Cadets Roster Table Card */}
            <div className="bg-white dark:bg-[#12181f] rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-md overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                    Enrolled Cadet Roster
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Click "Inspect Details" to review comprehensive demographics, attendance breakdown, and exam scores.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200/60 dark:border-white/10">
                      <th className="py-3.5 px-4">Cadet Profile</th>
                      <th className="py-3.5 px-4">Identifiers</th>
                      <th className="py-3.5 px-4">Program & Batch</th>
                      <th className="py-3.5 px-4 text-center">Drill Attendance</th>
                      <th className="py-3.5 px-4 text-center">Exam Papers</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredCadets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-xs font-semibold">
                          No cadets found matching "{cadetSearch}".
                        </td>
                      </tr>
                    ) : (
                      filteredCadets.map((cadet) => {
                        const attSummary = getStudentAttendanceSummary(cadet.certificateNumber);
                        const cadetResults = getResultsByStudent(cadet.certificateNumber);

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
                                {cadet.certificateNumber}
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

                            {/* Exam Papers */}
                            <td className="py-3.5 px-4 text-center">
                              {cadetResults.length > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20">
                                  <Award className="w-3 h-3" />
                                  <span>{cadetResults.length} Papers</span>
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-white/5">
                                  No papers
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
                                  title="Inspect full cadet profile"
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
                                  title="Mark Muster for this cadet"
                                >
                                  <Clock className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResCertNo(cadet.certificateNumber);
                                    setResCourse(cadet.course);
                                    setActiveTab('results');
                                  }}
                                  className="p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                                  title="Record Exam Result for this cadet"
                                >
                                  <Award className="w-3.5 h-3.5" />
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
                    Cadet Daily Attendance Table
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
                
                {/* Search Cadet */}
                <div className="md:col-span-4 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={musterSearch}
                    onChange={(e) => setMusterSearch(e.target.value)}
                    placeholder="Search cadet by name, roll, or cert..."
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
                    <option value="All">All Course Programs ({studentsData.length})</option>
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

            {/* Daily Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              
              {/* Total Roster */}
              <GlassCard hoverEffect={false} className="p-3.5 border border-gray-200/80 dark:border-white/10">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filtered Roster</div>
                <div className="text-xl font-heading font-black text-gray-900 dark:text-white mt-1">
                  {musterStats.totalCadets} Cadets
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
                >
                  Mark All Slot 1 (P)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('Slot 2', 'Present')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
                >
                  Mark All Slot 2 (P)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('Slot 3', 'Present')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
                >
                  Mark All Slot 3 (P)
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('All', 'Present')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>All 3 Slots (P)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearDay}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Reset Day
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
                      <th className="py-3.5 px-4 min-w-[200px]">Cadet / Trainee Profile</th>
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
                          No cadets found matching the current search / filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudentsForMuster.map((student, idx) => {
                        const rec1 = getStudentSlotRecord(student.certificateNumber, 'Slot 1');
                        const rec2 = getStudentSlotRecord(student.certificateNumber, 'Slot 2');
                        const rec3 = getStudentSlotRecord(student.certificateNumber, 'Slot 3');

                        const countPresent = [rec1, rec2, rec3].filter((r) => r?.status === 'Present').length;
                        const countMarked = [rec1, rec2, rec3].filter(Boolean).length;

                        return (
                          <tr
                            key={student.certificateNumber}
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
                                    <span>{student.rollNo}</span>
                                    <span>•</span>
                                    <span className="text-primary dark:text-primary-light">{student.certificateNumber}</span>
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
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    rec1?.status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                                  }`}
                                  title="Mark Present for Slot 1"
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 1', 'Absent')}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    rec1?.status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-sm'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/20'
                                  }`}
                                  title="Mark Absent for Slot 1"
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
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    rec2?.status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                                  }`}
                                  title="Mark Present for Slot 2"
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 2', 'Absent')}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    rec2?.status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-sm'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/20'
                                  }`}
                                  title="Mark Absent for Slot 2"
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
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    rec3?.status === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                                  }`}
                                  title="Mark Present for Slot 3"
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 3', 'Absent')}
                                  className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                                    rec3?.status === 'Absent'
                                      ? 'bg-red-600 text-white shadow-sm'
                                      : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/25 border border-red-500/20'
                                  }`}
                                  title="Mark Absent for Slot 3"
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
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                                  title="Mark 3/3 Present"
                                >
                                  3/3 P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkStudentAllSlots(student, 'Absent')}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                  title="Mark 3/3 Absent"
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
                      const student = studentsData.find(
                        (s) => s.certificateNumber.toUpperCase() === rec.certificateNumber.toUpperCase()
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

                              <span className="text-xs text-gray-500 font-semibold">
                                {new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>

                              <span className="text-xs font-mono text-gray-400">
                                • {rec.certificateNumber}
                              </span>
                            </div>

                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                              {student?.name || rec.certificateNumber}
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
                              onClick={() => handleDeleteAttendance(rec.id)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
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
        {/* TAB: MANAGE RESULTS                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'results' && (
          <div className="space-y-8">
            
            {/* Form Card */}
            <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                      {resEditingId ? 'Edit Examination Score' : 'Record Cadet Subject & Practical Marks'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Evaluations auto-calculate grade and aggregate percentage on the cadet's transcript.
                    </p>
                  </div>
                </div>

                {resEditingId && (
                  <button
                    type="button"
                    onClick={handleCancelResEdit}
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 font-semibold"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveResult} className="space-y-4">
                
                {/* Student Selector & Course */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Cadet Candidate *
                    </label>
                    <select
                      value={resCertNo}
                      onChange={(e) => handleResStudentChange(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                    >
                      {studentsData.map((s) => (
                        <option key={s.certificateNumber} value={s.certificateNumber}>
                          {s.name} — {s.rollNo} ({s.course})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Enrolled Course
                    </label>
                    <input
                      type="text"
                      value={resCourse}
                      onChange={(e) => setResCourse(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Subject & Term */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Subject / Paper Name *
                    </label>
                    <input
                      type="text"
                      value={resSubject}
                      onChange={(e) => setResSubject(e.target.value)}
                      placeholder="e.g. Fire Fighting Hydraulics & Pump Calculations"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Evaluation Assessment Cycle
                    </label>
                    <input
                      type="text"
                      value={resTerm}
                      onChange={(e) => setResTerm(e.target.value)}
                      placeholder="Term Final Examination"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Marks Obtained, Max Marks & Auto Grade */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Marks Obtained *
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={resMaxMarks}
                      value={resMarks}
                      onChange={(e) => handleMarksChange(Number(e.target.value), resMaxMarks)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm font-bold font-mono focus:ring-2 focus:ring-primary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Maximum Marks *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={resMaxMarks}
                      onChange={(e) => handleMarksChange(resMarks, Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-primary outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Auto Grade
                    </label>
                    <input
                      type="text"
                      value={resGrade}
                      onChange={(e) => setResGrade(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-center text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                {/* Examiner Remarks */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Examiner Remarks / Practical Assessment Comments
                  </label>
                  <input
                    type="text"
                    value={resRemarks}
                    onChange={(e) => setResRemarks(e.target.value)}
                    placeholder="e.g. Excellent operational accuracy and rapid hose coupling deployment"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  {resEditingId && (
                    <button
                      type="button"
                      onClick={handleCancelResEdit}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>{resEditingId ? 'Update Result' : 'Save Examination Result'}</span>
                  </button>
                </div>

              </form>
            </FlatCard>

            {/* Results History List */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading font-extrabold text-xl text-gray-900 dark:text-white">
                    Recorded Subject Evaluations ({filteredResultsList.length})
                  </h3>
                  <span className="text-xs text-gray-400">Subject-wise marks feeding student transcripts</span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={resSearchTerm}
                    onChange={(e) => setResSearchTerm(e.target.value)}
                    placeholder="Search cadet or subject..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredResultsList.map((item) => {
                  const student = studentsData.find(
                    (s) => s.certificateNumber.toUpperCase() === item.certificateNumber.toUpperCase()
                  );
                  const pct = item.maxMarks > 0 ? Math.round((item.marksObtained / item.maxMarks) * 100) : 0;
                  return (
                    <GlassCard
                      key={item.id}
                      hoverEffect={false}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200/80 dark:border-white/10"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                            {item.grade} Grade ({pct}%)
                          </span>

                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {item.marksObtained} / {item.maxMarks} Marks
                          </span>

                          <span className="text-xs font-mono text-gray-400">
                            • {item.certificateNumber}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                          {item.subject}
                        </h4>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cadet: <span className="font-semibold text-gray-800 dark:text-gray-200">{student?.name || item.certificateNumber}</span> • {item.semesterOrTerm || 'Term Final'}
                        </p>

                        {item.remarks && (
                          <p className="text-[11px] text-gray-500 italic">
                            "{item.remarks}"
                          </p>
                        )}
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleEditResult(item)}
                          className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
                          title="Edit result"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteResult(item.id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                          title="Delete result"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>

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

                  {/* Section 1: Demographic & Enrollment Records */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>Cadet Demographic & Institutional Record</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Certificate Number</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.certificateNumber}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Institute Roll No</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.rollNo}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Issue Date</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.issueDate}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Passing / Completion Year</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                          {selectedCadetDetail.passingYear}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Registered Grade</div>
                        <div className="text-xs sm:text-sm font-bold text-primary dark:text-primary-light mt-0.5">
                          {selectedCadetDetail.grade} ({selectedCadetDetail.percentage})
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="text-[11px] font-semibold text-gray-400">Training Center Campus</div>
                        <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                          {selectedCadetDetail.centerLocation}
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
                      const summary = getStudentAttendanceSummary(selectedCadetDetail.certificateNumber);
                      const cadetAttRecords = getAttendanceByStudent(selectedCadetDetail.certificateNumber);

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
                                No attendance records recorded for this cadet yet. Attendance records are created when marking daily drills.
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

                  {/* Section 3: Examination & Marks Records */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        <span>Examination Papers & Practical Evaluations</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setResCertNo(selectedCadetDetail.certificateNumber);
                          setResCourse(selectedCadetDetail.course);
                          setActiveTab('results');
                          setSelectedCadetDetail(null);
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Exam Score</span>
                      </button>
                    </div>

                    {(() => {
                      const cadetResults = getResultsByStudent(selectedCadetDetail.certificateNumber);
                      const totalMarks = cadetResults.reduce((acc, curr) => acc + curr.marksObtained, 0);
                      const totalMax = cadetResults.reduce((acc, curr) => acc + curr.maxMarks, 0);
                      const avgPct = totalMax > 0 ? Math.round((totalMarks / totalMax) * 1000) / 10 : 0;

                      return (
                        <div className="space-y-3">
                          {cadetResults.length > 0 ? (
                            <>
                              {/* Results Summary Bar */}
                              <div className="p-3 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <div className="text-[11px] text-gray-500">Evaluated Papers</div>
                                    <div className="text-lg font-black text-primary dark:text-primary-light">
                                      {cadetResults.length} Papers
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] text-gray-500">Aggregate Marks</div>
                                    <div className="text-lg font-black text-gray-900 dark:text-white">
                                      {totalMarks} / {totalMax}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-[11px] text-gray-500">Overall Calculated Percentage</div>
                                  <div className="text-lg font-black text-primary dark:text-primary-light">
                                    {avgPct}%
                                  </div>
                                </div>
                              </div>

                              {/* Results Table */}
                              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200/60 dark:border-white/10">
                                <table className="w-full text-left text-xs">
                                  <thead className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-bold text-gray-400 sticky top-0">
                                    <tr>
                                      <th className="py-2 px-3">Subject / Paper</th>
                                      <th className="py-2 px-3">Marks</th>
                                      <th className="py-2 px-3 text-center">Grade</th>
                                      <th className="py-2 px-3">Term / Exam</th>
                                      <th className="py-2 px-3">Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {cadetResults.map((r) => (
                                      <tr key={r.id}>
                                        <td className="py-2 px-3 font-bold text-gray-900 dark:text-white">{r.subject}</td>
                                        <td className="py-2 px-3 font-mono font-bold text-gray-700 dark:text-gray-300">
                                          {r.marksObtained} / {r.maxMarks}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                                            {r.grade}
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 text-gray-500">{r.semesterOrTerm || 'Term Final'}</td>
                                        <td className="py-2 px-3 text-gray-400 italic text-[11px]">{r.remarks || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          ) : (
                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-center">
                              <p className="text-xs text-gray-500">
                                No examination papers or practical drill evaluations recorded yet for this cadet.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setResCertNo(selectedCadetDetail.certificateNumber);
                                  setResCourse(selectedCadetDetail.course);
                                  setActiveTab('results');
                                  setSelectedCadetDetail(null);
                                }}
                                className="mt-2 text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <Award className="w-3 h-3" />
                                <span>Record exam marks in Manage Results tab</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/verify?cert=${selectedCadetDetail.certificateNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Public Certificate</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Cadet Dossier</span>
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

      </div>
    </div>
  );
};
