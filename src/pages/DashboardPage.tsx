import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  CheckCircle2, 
  X, 
  Sparkles, 
  Eye,
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
  ArrowLeft,
  Globe,
  Award,
  RotateCcw
} from 'lucide-react';
import { useStudentData } from '../context/StudentDataContext';
import { useConfirm } from '../context/ConfirmContext';
import { AttendanceRecord, AttendanceStatus, AttendanceSlot, StudentVerificationRecord } from '../types';
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
import { UserAvatar } from '../components/common/UserAvatar';
import { UsersPage } from './UsersPage';
import { WebManagementPage } from './WebManagementPage';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {user, logout} = useAuth();
  const isAuthenticated = user?.role === 'admin';
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Tabs: 'students' | 'attendance' | 'users' | 'web'
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'users' | 'web'>(() => {
    if (tabParam === 'attendance') return 'attendance';
    if (tabParam === 'users') return 'users';
    if (tabParam === 'web') return 'web';
    return 'students';
  });

  useEffect(() => {
    if (tabParam === 'attendance') {
      setActiveTab('attendance');
    } else if (tabParam === 'users') {
      setActiveTab('users');
    } else if (tabParam === 'web') {
      setActiveTab('web');
    }
    // Clean URL query so the browser address bar stays strictly /dashboard
    if (window.location.search) {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [tabParam]);

  const handleSelectTab = (tab: 'students' | 'attendance' | 'users' | 'web') => {
    setActiveTab(tab);
    if (window.location.pathname !== '/dashboard' || window.location.search) {
      window.history.replaceState({}, '', '/dashboard');
    }
  };
  
  const confirm = useConfirm();

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
    hasDateDraft,
    discardDateDraft,
  } = useStudentData();

  // --- CADET / STUDENT DIRECTORY STATE ---
  const [cadetSearch, setCadetSearch] = useState('');
  const [cadetCourseFilter, setCadetCourseFilter] = useState('All');
  const [selectedCadetDetail, setSelectedCadetDetail] = useState<StudentVerificationRecord | null>(null);
  const [cadetModalEditMode, setCadetModalEditMode] = useState<boolean>(false);
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

  // Helper to ensure only actual enrolled students are shown (no admin/staff accounts)
  const isActualStudent = (person: { id?: string; name?: string; email?: string }): boolean => {
    const idLower = String(person.id || '').toLowerCase();
    const nameLower = String(person.name || '').toLowerCase();
    const emailLower = String(person.email || '').toLowerCase();
    return (
      !idLower.includes('@') &&
      !idLower.includes('admin') &&
      !idLower.includes('teacher') &&
      !nameLower.includes('administrator') &&
      !emailLower.includes('admin@') &&
      !emailLower.includes('teacher@')
    );
  };

  // Fetch registered cadets dynamically from backend MongoDB
  const loadCadets = useCallback(async () => {
    try {
      setIsLoadingCadets(true);
      const data = await api.getStudents();
      const onlyStudents = (data || []).filter(isActualStudent);
      const sorted = onlyStudents.sort((a, b) => {
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
    const confirmed = await confirm({
      title: 'Delete Student Record',
      message: `Are you sure you want to permanently delete Student "${cadet.name}" (${cadet.id})?\n\nThis will permanently remove their user account, student record, and attendance logs from the database.`,
      confirmText: 'Delete Student',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
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
        if (!isActualStudent(cadet)) return false;
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

  // --- 3-SLOT DAILY MUSTER ATTENDANCE STATE (OLD SYSTEM) ---
  const [selectedMusterDate, setSelectedMusterDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [musterCourseFilter, setMusterCourseFilter] = useState<string>('All');
  const [musterSearch, setMusterSearch] = useState<string>('');
  const [musterInstructor, setMusterInstructor] = useState<string>('Chief Instructor Dave');
  const [slot1Topic, setSlot1Topic] = useState<string>('Morning Squad Drill, PT & Hose Running');
  const [slot2Topic, setSlot2Topic] = useState<string>('NBC & Hazardous Materials Safety Codes');
  const [slot3Topic, setSlot3Topic] = useState<string>('High-Rise Tower & Apparatus Pumping Drills');
  const [showSlotConfig, setShowSlotConfig] = useState<boolean>(false);
  const [isUploadingMuster, setIsUploadingMuster] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);


  const handleLogout = () => { void logout(); navigate('/institute-login'); };

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

  const lockStatus = useMemo(
    () => isDateLocked(selectedMusterDate),
    [isDateLocked, selectedMusterDate, attendance]
  );
  const isLocked = lockStatus.locked;
  const isMusterDraftActive = hasDateDraft(selectedMusterDate) || hasPendingChanges;

  const handleDiscardMusterDraft = async () => {
    const confirmed = await confirm({
      title: 'Discard Local Draft?',
      message: `Are you sure you want to discard unsaved draft muster for ${formattedDateLabel}?\n\nThis will remove local draft marks and revert to the server's committed records.`,
      confirmText: 'Discard Draft',
      cancelText: 'Keep Editing',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await discardDateDraft(selectedMusterDate);
      setHasPendingChanges(false);
      toast.info(`Draft muster for ${formattedDateLabel} discarded.`);
    }
  };

  // Today's date string in local time (YYYY-MM-DD)
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Check if the selected date is in the future
  const isFutureDate = selectedMusterDate > todayDateStr;

  // Check if the selected date is Sunday (Weekly Holiday)
  const isSunday = useMemo(() => {
    try {
      const [year, month, day] = selectedMusterDate.split('-').map(Number);
      return new Date(year, month - 1, day).getDay() === 0;
    } catch {
      return false;
    }
  }, [selectedMusterDate]);

  // --- 3-SLOT DAILY MUSTER DATE NAVIGATION & HANDLERS ---
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
      const nextDateStr = `${yStr}-${mStr}-${dStr}`;
      if (nextDateStr > todayDateStr) {
        toast.info('Attendance opens when the day starts. You cannot navigate to upcoming dates.');
        return;
      }
      setSelectedMusterDate(nextDateStr);
      setHasPendingChanges(false);
    } catch {
      // fallback
    }
  };

  const handleSetToday = () => {
    setSelectedMusterDate(todayDateStr);
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

  const formatDateLabel = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Unique course list from loaded cadets
  const uniqueMusterCourses = useMemo(() => {
    return Array.from(new Set(cadetsList.map((c) => c.course).filter(Boolean)));
  }, [cadetsList]);

  // Filtered students for selected muster date & course/search
  const filteredStudentsForMuster = useMemo(() => {
    return cadetsList
      .filter((s) => {
        if (!isActualStudent(s)) return false;
        const matchesCourse = musterCourseFilter === 'All' || s.course === musterCourseFilter;
        const q = musterSearch.trim().toLowerCase();
        const matchesSearch = !q ||
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q);
        return matchesCourse && matchesSearch;
      })
      .sort((a, b) => {
        const rollA = getNumericRoll(a);
        const rollB = getNumericRoll(b);
        if (rollA !== rollB) return rollA - rollB;
        return a.name.localeCompare(b.name);
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
    let s1NA = 0;
    let s2Present = 0;
    let s2Absent = 0;
    let s2NA = 0;
    let s3Present = 0;
    let s3Absent = 0;
    let s3NA = 0;

    filteredStudentsForMuster.forEach((s) => {
      const r1 = getStudentSlotRecord(s.id, 'Slot 1');
      if (r1?.status === 'Present') s1Present++;
      else if (r1?.status === 'Absent') s1Absent++;
      else if (r1?.status === 'NA') s1NA++;

      const r2 = getStudentSlotRecord(s.id, 'Slot 2');
      if (r2?.status === 'Present') s2Present++;
      else if (r2?.status === 'Absent') s2Absent++;
      else if (r2?.status === 'NA') s2NA++;

      const r3 = getStudentSlotRecord(s.id, 'Slot 3');
      if (r3?.status === 'Present') s3Present++;
      else if (r3?.status === 'Absent') s3Absent++;
      else if (r3?.status === 'NA') s3NA++;
    });

    const totalMarkedPresent = s1Present + s2Present + s3Present;
    const totalNA = s1NA + s2NA + s3NA;
    const totalPossibleSlots = (totalCadets * 3) - totalNA;
    const dayRate = totalPossibleSlots > 0 ? Math.round((totalMarkedPresent / totalPossibleSlots) * 100) : (totalNA > 0 ? 100 : 0);

    return {
      totalCadets,
      s1Present,
      s1Absent,
      s1NA,
      s2Present,
      s2Absent,
      s2NA,
      s3Present,
      s3Absent,
      s3NA,
      totalNA,
      dayRate,
    };
  }, [filteredStudentsForMuster, attendance, selectedMusterDate]);

  // 1-Click Slot Toggle
  const handleToggleSlot = (student: StudentVerificationRecord, slot: AttendanceSlot, newStatus: AttendanceStatus) => {
    if (isFutureDate) {
      toast.error('Attendance opens when the day starts. You cannot mark attendance for upcoming dates.');
      return;
    }
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
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
    if (isFutureDate) {
      toast.error('Attendance opens when the day starts. You cannot mark attendance for upcoming dates.');
      return;
    }
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
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
    toast.success(status === 'NA' ? `${student.name}: Marked NA for overall slots.` : `${student.name}: Marked ${status} for all 3 slots.`);
  };

  // Bulk mark slots across all filtered cadets
  const handleBulkMark = (slot: AttendanceSlot | 'All', status: AttendanceStatus) => {
    if (isFutureDate) {
      toast.error('Attendance opens when the day starts. You cannot mark attendance for upcoming dates.');
      return;
    }
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
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
        ? status === 'NA'
          ? `Marked ${targets.length} students NA for overall slots on ${selectedMusterDate}`
          : `Marked ${targets.length} students ${status} for all 3 slots on ${selectedMusterDate}`
        : status === 'NA'
        ? `Marked ${targets.length} students NA for ${slot} on ${selectedMusterDate}`
        : `Marked ${targets.length} students ${status} for ${slot} on ${selectedMusterDate}`
    );
  };

  // Upload and commit marked muster to MongoDB with 24-hour edit window
  const handleUploadAttendance = async () => {
    if (isFutureDate) {
      toast.error('Attendance opens when the day starts. You cannot upload attendance for upcoming dates.');
      return;
    }
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
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
        `Muster successfully uploaded to database! Editable for the next 24 hours.`
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
    if (isFutureDate) {
      toast.error('Cannot reset attendance for upcoming dates.');
      return;
    }
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
      return;
    }
    const confirmed = await confirm({
      title: 'Clear Day Attendance',
      message: `Are you sure you want to clear all attendance entries for ${formattedDateLabel}?\n\nThis will reset today's marked muster draft and revert cadets back to unmarked pending status.`,
      confirmText: 'Clear Attendance',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (confirmed) {
      await clearDayAttendance(selectedMusterDate);
      setHasPendingChanges(false);
      toast.info(`Cleared muster records for ${selectedMusterDate}`);
    }
  };





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
              Manage student records and mark daily attendance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-white/5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 transition-colors shadow-xs"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-gray-200 dark:border-white/10 pb-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          
          {/* Students List */}
          <button
            type="button"
            onClick={() => handleSelectTab('students')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students List (<CountUp value={cadetsList.length} />)</span>
          </button>

          {/* Mark Attendance */}
          <button
            type="button"
            onClick={() => handleSelectTab('attendance')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>

          {/* Manage Users */}
          <button
            type="button"
            onClick={() => handleSelectTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </button>

          {/* Web Management */}
          <button
            type="button"
            onClick={() => handleSelectTab('web')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'web'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Web Management</span>
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
                    Students List
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
                    Inspect complete student profile details or edit student information.
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
                            : 'No students registered in the list yet. Click "Import Students (Excel/CSV)" above to import students from your spreadsheet.'}
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
                                <UserAvatar
                                  photoUrl={cadet.photoUrl}
                                  name={cadet.name}
                                  size="sm"
                                />
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
                                  onClick={() => {
                                    setCadetModalEditMode(false);
                                    setSelectedCadetDetail(cadet);
                                  }}
                                  className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer shadow-xs hover:scale-105"
                                  title="Inspect student profile"
                                  aria-label="Inspect student profile"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCadetModalEditMode(true);
                                    setSelectedCadetDetail(cadet);
                                  }}
                                  className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all duration-200 cursor-pointer shadow-xs hover:scale-105"
                                  title="Edit student profile"
                                  aria-label="Edit student profile"
                                >
                                  <Edit3 className="w-4 h-4" />
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
        {/* TAB: MARK ATTENDANCE (3-SLOT DAILY MUSTER TABLE)                          */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">

            {/* Unified Sleek Muster Control Header */}
            <div className="bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
              
              {/* Row 1: Title, Status Badges, Date Navigator & Primary Upload Action */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/5">
                
                {/* Title & Status Badges */}
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                      Daily Attendance
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                      {musterStats.totalCadets} Students
                    </span>

                    {/* Sunday Pill */}
                    {isSunday && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        Sunday (Holiday)
                      </span>
                    )}

                    {/* Status Pill */}
                    {isFutureDate ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Upcoming Day
                      </span>
                    ) : isLocked ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Locked
                      </span>
                    ) : isMusterDraftActive ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1.5 border border-amber-300 dark:border-amber-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Draft in Local Storage</span>
                      </span>
                    ) : lockStatus.uploadedAt ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Uploaded ({lockStatus.remainingHours ?? 24}h left)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Ready to Mark
                      </span>
                    )}
                  </div>
                </div>

                {/* Date Navigator & Upload Button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-gray-100/90 dark:bg-white/5 p-1 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <button
                      type="button"
                      onClick={handlePrevDay}
                      className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-colors cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 px-2">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <input
                        type="date"
                        value={selectedMusterDate}
                        max={todayDateStr}
                        onChange={(e) => {
                          if (e.target.value > todayDateStr) {
                            toast.info('Attendance opens when the day starts. You cannot select upcoming dates.');
                            return;
                          }
                          setSelectedMusterDate(e.target.value);
                          setHasPendingChanges(false);
                        }}
                        className="bg-transparent text-xs font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleNextDay}
                      disabled={selectedMusterDate >= todayDateStr}
                      className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={selectedMusterDate >= todayDateStr ? "Cannot navigate to future dates" : "Next Day"}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSetToday}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-sm transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                  </div>

                  {isMusterDraftActive && !isLocked && !isFutureDate && (
                    <button
                      type="button"
                      onClick={handleDiscardMusterDraft}
                      disabled={isUploadingMuster}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-rose-50 dark:bg-white/10 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-200 dark:border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Discard unsaved local draft and revert to server records"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Discard Draft</span>
                    </button>
                  )}

                  {/* Primary Upload Button */}
                  <button
                    type="button"
                    onClick={handleUploadAttendance}
                    disabled={isLocked || isFutureDate || isUploadingMuster}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                      isLocked || isFutureDate
                        ? 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-md ring-2 ring-primary/30'
                    }`}
                    title={
                      isFutureDate
                        ? 'Attendance opens when the day starts'
                        : isLocked
                        ? 'Attendance is locked (24h expired)'
                        : 'Upload attendance to database'
                    }
                  >
                    {isUploadingMuster ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading Attendance...</span>
                      </>
                    ) : isFutureDate ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>Not Open</span>
                      </>
                    ) : isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Attendance</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Notice for Future Date */}
              {isFutureDate && (
                <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    <strong>Upcoming Date ({formattedDateLabel}):</strong> Attendance opens automatically when the day begins.
                  </span>
                </div>
              )}

              {/* Notice for Sunday (Weekly Off) */}
              {isSunday && !isFutureDate && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><strong>Sunday:</strong> Weekly holiday / off-day.</span>
                  </div>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => handleBulkMark('All', 'NA')}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Mark Sunday NA
                    </button>
                  )}
                </div>
              )}

              {/* Row 2: Search, Course Filter & Quick Bulk Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1">
                
                {/* Search & Course Filter */}
                <div className="flex items-center gap-2 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={musterSearch}
                      onChange={(e) => setMusterSearch(e.target.value)}
                      placeholder="Search student..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#121820] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#121820] transition-all"
                    />
                  </div>

                  <select
                    value={musterCourseFilter}
                    onChange={(e) => setMusterCourseFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#121820] text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-primary cursor-pointer shrink-0"
                  >
                    <option value="All">All Courses ({cadetsList.length})</option>
                    {uniqueMusterCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowSlotConfig(!showSlotConfig)}
                    className="px-2.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                    title="Configure slot topics for today"
                  >
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{showSlotConfig ? 'Hide Topics' : 'Topics'}</span>
                  </button>
                </div>

                {/* Bulk Actions - Clean 3 buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleBulkMark('All', 'Present')}
                    disabled={isLocked || isFutureDate}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isLocked || isFutureDate
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                    title={isFutureDate ? 'Attendance opens on day' : isLocked ? 'Locked' : 'Mark all 3 slots present for all students'}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>All Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBulkMark('All', 'NA')}
                    disabled={isLocked || isFutureDate}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isLocked || isFutureDate
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-800 shadow-xs'
                    }`}
                    title={isFutureDate ? 'Attendance opens on day' : isLocked ? 'Locked' : 'Mark Holiday / Sunday (All NA) for all students'}
                  >
                    <span>Holiday / NA</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearDay}
                    disabled={isLocked || isFutureDate}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      isLocked || isFutureDate
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-rose-500 hover:text-white'
                    }`}
                    title="Reset all slot marks for this day"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Slot Topic Settings (Collapsible) */}
              {showSlotConfig && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-primary" />
                    <span>Slot Topics & Instructor for {formattedDateLabel}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Instructor:
                      </label>
                      <input
                        type="text"
                        value={musterInstructor}
                        onChange={(e) => setMusterInstructor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Slot 1 Topic:
                      </label>
                      <input
                        type="text"
                        value={slot1Topic}
                        onChange={(e) => setSlot1Topic(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Slot 2 Topic:
                      </label>
                      <input
                        type="text"
                        value={slot2Topic}
                        onChange={(e) => setSlot2Topic(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Slot 3 Topic:
                      </label>
                      <input
                        type="text"
                        value={slot3Topic}
                        onChange={(e) => setSlot3Topic(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Row 3: Slim Inline Live Metrics Strip */}
              <div className="pt-2.5 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Slot 1:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{musterStats.s1Present} P</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-rose-500 font-bold">{musterStats.s1Absent} A</span>
                    {musterStats.s1NA > 0 && <span className="text-slate-400">({musterStats.s1NA} NA)</span>}
                  </div>
                  <span className="text-gray-300 dark:text-white/20 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Slot 2:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{musterStats.s2Present} P</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-rose-500 font-bold">{musterStats.s2Absent} A</span>
                    {musterStats.s2NA > 0 && <span className="text-slate-400">({musterStats.s2NA} NA)</span>}
                  </div>
                  <span className="text-gray-300 dark:text-white/20 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Slot 3:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{musterStats.s3Present} P</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-rose-500 font-bold">{musterStats.s3Absent} A</span>
                    {musterStats.s3NA > 0 && <span className="text-slate-400">({musterStats.s3NA} NA)</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Day Rate:</span>
                  <span className={`font-black ${musterStats.dayRate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {musterStats.dayRate}%
                  </span>
                  {musterStats.totalNA > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium">({musterStats.totalNA} exempt)</span>
                  )}
                  <div className="w-16 bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${musterStats.dayRate >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(musterStats.dayRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* THE MUSTER ROLL TABLE (3 SLOTS) */}
            <div className="bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gray-100/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2 text-center w-12">#</th>
                      <th className="py-3 px-4 min-w-[220px]">Student Profile</th>
                      <th className="py-3 px-3 w-44">Program & Batch</th>
                      
                      {/* Slot 1 Header */}
                      <th className="py-2.5 px-2 text-center bg-primary/5 dark:bg-primary/10 border-l border-gray-200/80 dark:border-white/10 w-28">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-primary text-[11px]">Slot 1</span>
                          <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-300">Morning PT</span>
                          <span className="text-[9px] font-mono text-gray-400 normal-case">08:00 - 10:00</span>
                        </div>
                      </th>

                      {/* Slot 2 Header */}
                      <th className="py-2.5 px-2 text-center bg-primary/5 dark:bg-primary/10 border-l border-gray-200/40 dark:border-white/5 w-28">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-primary text-[11px]">Slot 2</span>
                          <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-300">Theory</span>
                          <span className="text-[9px] font-mono text-gray-400 normal-case">10:30 - 01:00</span>
                        </div>
                      </th>

                      {/* Slot 3 Header */}
                      <th className="py-2.5 px-2 text-center bg-primary/5 dark:bg-primary/10 border-l border-r border-gray-200/80 dark:border-white/10 w-28">
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-primary text-[11px]">Slot 3</span>
                          <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-300">Apparatus</span>
                          <span className="text-[9px] font-mono text-gray-400 normal-case">02:00 - 05:00</span>
                        </div>
                      </th>

                      <th className="py-3 px-3 text-center w-36">Quick Action</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredStudentsForMuster.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-sm font-semibold">
                          No students found matching the current search / filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudentsForMuster.map((student, idx) => {
                        const rec1 = getStudentSlotRecord(student.id, 'Slot 1');
                        const rec2 = getStudentSlotRecord(student.id, 'Slot 2');
                        const rec3 = getStudentSlotRecord(student.id, 'Slot 3');

                        const countPresent = [rec1, rec2, rec3].filter((r) => r?.status === 'Present').length;
                        const countNA = [rec1, rec2, rec3].filter((r) => r?.status === 'NA').length;
                        const countMarked = [rec1, rec2, rec3].filter(Boolean).length;

                        const isPresent1 = rec1?.status === 'Present';
                        const isAbsent1 = rec1?.status === 'Absent';

                        const isPresent2 = rec2?.status === 'Present';
                        const isAbsent2 = rec2?.status === 'Absent';

                        const isPresent3 = rec3?.status === 'Present';
                        const isAbsent3 = rec3?.status === 'Absent';

                        const courseDisplay = student.course && (student.course.toUpperCase().includes('FIRE AND SAFETY') || student.course.toUpperCase().includes('FIRE SAFETY'))
                          ? 'Diploma in Fire & Safety'
                          : student.course || 'Fire Safety';

                        return (
                          <tr
                            key={student.id}
                            className="hover:bg-blue-50/30 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            {/* Row Index */}
                            <td className="py-2.5 px-2 text-center font-mono text-gray-400 text-xs">
                              {idx + 1}
                            </td>

                            {/* Cadet Profile */}
                            <td className="py-2.5 px-4 min-w-[220px]">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  photoUrl={student.photoUrl}
                                  name={student.name}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white leading-tight truncate" title={student.name}>
                                    {student.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Roll: {student.rollNo}</span>
                                    <span className="text-gray-300 dark:text-gray-600">•</span>
                                    <span className="text-primary dark:text-primary-light">ID: {student.id}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Program & Batch */}
                            <td className="py-2.5 px-3">
                              <div className="flex flex-col items-start">
                                <span 
                                  className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 leading-tight truncate max-w-[160px]"
                                  title={student.course}
                                >
                                  {courseDisplay}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                                  Batch: {student.batch || 'Main'}
                                </span>
                              </div>
                            </td>

                            {/* SLOT 1 TOGGLE */}
                            <td className="py-2 px-2 border-l border-gray-200/60 dark:border-white/5 bg-primary/[0.015]">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 1', 'Present')}
                                  disabled={isLocked || isFutureDate}
                                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                                    isLocked || isFutureDate
                                      ? isPresent1
                                        ? 'bg-emerald-600/40 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                      : isPresent1
                                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-600 cursor-pointer scale-105'
                                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-transparent cursor-pointer'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark Present for Slot 1'}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 1', 'Absent')}
                                  disabled={isLocked || isFutureDate}
                                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                                    isLocked || isFutureDate
                                      ? isAbsent1
                                        ? 'bg-rose-600/40 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                      : isAbsent1
                                      ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-600 cursor-pointer scale-105'
                                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-transparent cursor-pointer'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark Absent for Slot 1'}
                                >
                                  A
                                </button>
                              </div>
                            </td>

                            {/* SLOT 2 TOGGLE */}
                            <td className="py-2 px-2 border-l border-gray-200/40 dark:border-white/5 bg-primary/[0.015]">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 2', 'Present')}
                                  disabled={isLocked || isFutureDate}
                                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                                    isLocked || isFutureDate
                                      ? isPresent2
                                        ? 'bg-emerald-600/40 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                      : isPresent2
                                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-600 cursor-pointer scale-105'
                                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-transparent cursor-pointer'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark Present for Slot 2'}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 2', 'Absent')}
                                  disabled={isLocked || isFutureDate}
                                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                                    isLocked || isFutureDate
                                      ? isAbsent2
                                        ? 'bg-rose-600/40 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                      : isAbsent2
                                      ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-600 cursor-pointer scale-105'
                                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-transparent cursor-pointer'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark Absent for Slot 2'}
                                >
                                  A
                                </button>
                              </div>
                            </td>

                            {/* SLOT 3 TOGGLE */}
                            <td className="py-2 px-2 border-l border-r border-gray-200/80 dark:border-white/10 bg-primary/[0.015]">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 3', 'Present')}
                                  disabled={isLocked || isFutureDate}
                                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                                    isLocked || isFutureDate
                                      ? isPresent3
                                        ? 'bg-emerald-600/40 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                      : isPresent3
                                      ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-600 cursor-pointer scale-105'
                                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-transparent cursor-pointer'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark Present for Slot 3'}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSlot(student, 'Slot 3', 'Absent')}
                                  disabled={isLocked || isFutureDate}
                                  className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                                    isLocked || isFutureDate
                                      ? isAbsent3
                                        ? 'bg-rose-600/40 text-white cursor-not-allowed'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                      : isAbsent3
                                      ? 'bg-rose-600 text-white shadow-xs ring-1 ring-rose-600 cursor-pointer scale-105'
                                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 border border-transparent cursor-pointer'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark Absent for Slot 3'}
                                >
                                  A
                                </button>
                              </div>
                            </td>

                            {/* Quick Action Button Toolbar */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="inline-flex items-center p-0.5 rounded-lg bg-gray-100/90 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMarkStudentAllSlots(student, 'Present')}
                                  disabled={isLocked || isFutureDate}
                                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                    isLocked || isFutureDate
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : countPresent === 3
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-300'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark 3/3 Present'}
                                >
                                  3/3 P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkStudentAllSlots(student, 'Absent')}
                                  disabled={isLocked || isFutureDate}
                                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                    isLocked || isFutureDate
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : countPresent === 0 && countMarked === 3 && countNA === 0
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-300'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark 3/3 Absent'}
                                >
                                  3/3 A
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkStudentAllSlots(student, 'NA')}
                                  disabled={isLocked || isFutureDate}
                                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                    isLocked || isFutureDate
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : countNA === 3
                                      ? 'bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900 shadow-xs'
                                      : 'text-gray-600 dark:text-gray-300 hover:bg-slate-500/15 hover:text-slate-800 dark:hover:text-slate-200'
                                  }`}
                                  title={isFutureDate ? 'Attendance opens when the day starts' : isLocked ? 'Locked (24h expired)' : 'Mark Holiday / Sunday / Off-Day (NA for all slots)'}
                                >
                                  NA
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
        {/* TAB: MANAGE USERS                                                        */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <UsersPage
            isEmbedded
            onNavigateToStudent={async (studentId) => {
              handleSelectTab('students');
              setCadetSearch(studentId);
              let list = cadetsList;
              if (!list || list.length === 0) {
                try {
                  const data = await api.getStudents();
                  list = (data || []).filter(isActualStudent);
                  setCadetsList(list);
                } catch {
                  // ignore
                }
              }
              const matched = (list || []).find(
                (c) =>
                  c.id === studentId ||
                  c.rollNo === studentId ||
                  (c.name && c.name.toLowerCase() === studentId.toLowerCase())
              );
              if (matched) {
                setSelectedCadetDetail(matched);
                setCadetModalEditMode(true);
              }
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: WEB MANAGEMENT                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'web' && (
          <WebManagementPage isEmbedded />
        )}



        {/* ========================================================================= */}
        {/* CADET DETAILS INSPECTION MODAL                                           */}
        {/* ========================================================================= */}
        <CadetDetailModal
          cadet={selectedCadetDetail}
          initialEditMode={cadetModalEditMode}
          onClose={() => {
            setSelectedCadetDetail(null);
            setCadetModalEditMode(false);
          }}
          onNavigateToAttendance={(_cadet) => {
            const today = new Date().toISOString().split("T")[0];
            navigate(`/dashboard/attendance/${today}/Slot 1`);
          }}
          onStudentUpdated={(updated) => {
            setCadetsList((prev) =>
              prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
            );
            setSelectedCadetDetail(updated);
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
