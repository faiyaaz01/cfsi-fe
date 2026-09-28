import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  UploadCloud, 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCheck, 
  X, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  GraduationCap, 
  Flame, 
  Info,
  ShieldCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useConfirm } from '../context/ConfirmContext';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { AttendanceSlot, AttendanceStatus, StudentVerificationRecord } from '../types';
import { api } from '../lib/api';
import { UserAvatar } from '../components/common/UserAvatar';

interface SlotDetail {
  id: AttendanceSlot;
  label: string;
  time: string;
  defaultTopic: string;
  desc: string;
}

const SLOTS_LIST: SlotDetail[] = [
  {
    id: 'Slot 1',
    label: 'Slot 1 (Morning PT)',
    time: '08:00 AM – 10:00 AM',
    defaultTopic: 'Physical Training, Squad Parade & Hose Running',
    desc: 'Morning physical fitness, parade drill, hose coupling & squad maneuvers.'
  },
  {
    id: 'Slot 2',
    label: 'Slot 2 (Theory)',
    time: '10:30 AM – 01:00 PM',
    defaultTopic: 'Fire Chemistry, NBC Defense & Safety Regulations',
    desc: 'Classroom lecture on combustion science, industrial hazards & building safety codes.'
  },
  {
    id: 'Slot 3',
    label: 'Slot 3 (Drill)',
    time: '02:00 PM – 05:00 PM',
    defaultTopic: 'Practical Tower Rescue, Pumping & Hydrant Operation',
    desc: 'Ground drill with fire tender, smoke chamber search & high-rise tower rescue.'
  }
];

export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    attendance,
    setSlotAttendance,
    uploadDayAttendance,
    isDateLocked,
    refreshAttendance,
    hasDateDraft,
    discardDateDraft
  } = useStudentData();

  // Live IST Clock (UTC+5:30)
  const [currentClock, setCurrentClock] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istNow = useMemo(() => {
    const utc = currentClock.getTime() + currentClock.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 5.5);
  }, [currentClock]);

  const todayStr = useMemo(() => {
    const y = istNow.getFullYear();
    const m = String(istNow.getMonth() + 1).padStart(2, '0');
    const d = String(istNow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [istNow]);

  const yesterdayStr = useMemo(() => {
    const yest = new Date(istNow.getTime() - 24 * 60 * 60 * 1000);
    const y = yest.getFullYear();
    const m = String(yest.getMonth() + 1).padStart(2, '0');
    const d = String(yest.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [istNow]);

  // Selected Date and Slot state
  const [activeDate, setActiveDate] = useState<string>(todayStr);
  const [activeSlot, setActiveSlot] = useState<AttendanceSlot>('Slot 1');

  // Automatic slot selection based on IST time for today
  useEffect(() => {
    if (activeDate === todayStr) {
      const minutes = istNow.getHours() * 60 + istNow.getMinutes();
      if (minutes >= 840) {
        setActiveSlot('Slot 3');
      } else if (minutes >= 630) {
        setActiveSlot('Slot 2');
      } else {
        setActiveSlot('Slot 1');
      }
    }
  }, [activeDate, todayStr]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [courseFilter, setCourseFilter] = useState<string>('All');
  const [topicOrModule, setTopicOrModule] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);

  const confirm = useConfirm();

  // Unsaved marks departure protection (browser close/reload, in-app links, browser back)
  const isDirty = hasPendingChanges || hasDateDraft(activeDate);
  useUnsavedChangesWarning(isDirty, {
    title: 'Unsaved Attendance Changes',
    message: `You have unsaved attendance marks for ${activeDate} (${activeSlot})!\n\nIf you leave now without saving, these marks will not be committed to the official database records.\n\nAre you sure you want to leave without saving?`,
    confirmText: 'Discard & Leave',
    cancelText: 'Stay & Save'
  });

  // Cadets Roster (Instant Cache-First)
  const [cadets, setCadets] = useState<StudentVerificationRecord[]>(() => {
    try {
      const cached = localStorage.getItem('cfsi_cadets_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [isLoadingCadets, setIsLoadingCadets] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('cfsi_cadets_cache');
      if (cached && JSON.parse(cached).length > 0) return false;
    } catch {}
    return true;
  });

  // Hidden date input ref for tap-to-open calendar picker
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Helper for natural roll number sorting
  const getNumericRoll = (cadet: StudentVerificationRecord): number => {
    const raw = cadet.rollNo ?? cadet.id ?? '';
    const match = String(raw).match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
  };

  // Load cadets list from backend
  const loadCadets = useCallback(async () => {
    try {
      const data = await api.getStudents();
      const sorted = (data || []).sort((a, b) => {
        const rollA = getNumericRoll(a);
        const rollB = getNumericRoll(b);
        if (rollA !== rollB) return rollA - rollB;
        return a.name.localeCompare(b.name);
      });
      setCadets(sorted);
      try {
        localStorage.setItem('cfsi_cadets_cache', JSON.stringify(sorted));
      } catch {}
    } catch (err) {
      console.warn('Could not load cadets:', err);
      toast.error('Failed to load cadet roster.');
    } finally {
      setIsLoadingCadets(false);
    }
  }, []);

  useEffect(() => {
    loadCadets();
  }, [loadCadets]);

  // 48-Hour Lock Evaluation for active date
  const lockInfo = useMemo(() => {
    return isDateLocked(activeDate);
  }, [activeDate, isDateLocked, attendance]);

  // Helper to format deadline nicely
  const formattedCutoff = useMemo(() => {
    if (!lockInfo.canEditUntil) {
      try {
        const [y, m, d] = activeDate.split('-').map(Number);
        // Slot 1 start 08:00 AM IST + 48h
        const slot1Start = new Date(Date.UTC(y, m - 1, d, 2, 30, 0));
        const deadline = new Date(slot1Start.getTime() + 48 * 60 * 60 * 1000);
        return deadline.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) + ' IST';
      } catch {
        return '48 hours from Slot 1';
      }
    }
    try {
      const dt = new Date(lockInfo.canEditUntil);
      return dt.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch {
      return lockInfo.canEditUntil;
    }
  }, [activeDate, lockInfo.canEditUntil]);

  // Unique list of courses for filter dropdown
  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    cadets.forEach((c) => {
      if (c.course) set.add(c.course);
    });
    return Array.from(set).sort();
  }, [cadets]);

  // Set default topic when activeSlot or activeDate changes
  useEffect(() => {
    const currentSlotConfig = SLOTS_LIST.find((s) => s.id === activeSlot);
    if (currentSlotConfig) {
      // Find if any record already has a topic saved
      const existingRecordWithTopic = attendance.find(
        (a) => a.date === activeDate && a.slot === activeSlot && a.topicOrModule
      );
      setTopicOrModule(existingRecordWithTopic?.topicOrModule || currentSlotConfig.defaultTopic);
    }
    setHasPendingChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot, activeDate]);

  // Safe slot selection with unsaved warning popup
  const handleSelectSlot = async (newSlot: AttendanceSlot) => {
    if (newSlot === activeSlot) return;
    if (hasPendingChanges) {
      const proceed = await confirm({
        title: 'Unsaved Slot Changes',
        message: `You have unsaved attendance marks in ${activeSlot}!\n\nDo you want to switch to ${newSlot} without uploading? Your changes will remain in local draft until you click "Save & Upload Muster".`,
        confirmText: 'Switch Slot',
        cancelText: 'Stay in Current Slot',
        type: 'warning',
        icon: 'warning'
      });
      if (!proceed) return;
    }
    setActiveSlot(newSlot);
  };

  // Safe date selection with unsaved warning popup
  const handleSelectDate = async (newDate: string) => {
    if (newDate === activeDate) return;
    if (hasPendingChanges) {
      const proceed = await confirm({
        title: 'Unsaved Date Muster',
        message: `You have unsaved attendance marks for ${activeDate}!\n\nIf you change dates without clicking "Save & Upload Muster", your marks will remain uncommitted.\n\nDo you want to switch dates anyway?`,
        confirmText: 'Switch Date',
        cancelText: 'Stay on Current Date',
        type: 'warning',
        icon: 'warning'
      });
      if (!proceed) return;
    }
    setActiveDate(newDate);
  };

  // Attendance lookup for a cadet in the active slot & date
  const getCadetRecord = useCallback(
    (studentId: string) => {
      const normId = studentId.trim().toUpperCase();
      return attendance.find(
        (a) =>
          a.date === activeDate &&
          a.slot === activeSlot &&
          (a.studentId.toUpperCase() === normId || (a.rollNo && a.rollNo.toUpperCase() === normId))
      );
    },
    [attendance, activeDate, activeSlot]
  );

  // Filter cadets based on course and search query
  const filteredCadets = useMemo(() => {
    return cadets.filter((cadet) => {
      if (courseFilter !== 'All' && cadet.course !== courseFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const nameMatch = cadet.name.toLowerCase().includes(query);
        const idMatch = String(cadet.id).toLowerCase().includes(query);
        const rollMatch = cadet.rollNo ? String(cadet.rollNo).toLowerCase().includes(query) : false;
        return nameMatch || idMatch || rollMatch;
      }
      return true;
    });
  }, [cadets, courseFilter, searchQuery]);

  // Real-time Slot Stats
  const slotStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    filteredCadets.forEach((c) => {
      const rec = getCadetRecord(c.id);
      if (!rec || !rec.status) {
        unmarked++;
      } else if (rec.status === 'Present') {
        present++;
      } else if (rec.status === 'Absent') {
        absent++;
      } else {
        unmarked++;
      }
    });

    const total = filteredCadets.length;
    const presentRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, unmarked, presentRate };
  }, [filteredCadets, getCadetRecord]);

  // Individual mark status handler
  const handleMarkStatus = (cadet: StudentVerificationRecord, status: AttendanceStatus) => {
    if (lockInfo.locked) {
      toast.error('Attendance is locked for this date.');
      return;
    }

    setSlotAttendance(cadet.id, activeDate, activeSlot, status, {
      rollNo: cadet.rollNo,
      course: cadet.course,
      topicOrModule: topicOrModule || undefined,
      markedBy: user?.full_name || user?.username || 'Teacher'
    });

    setHasPendingChanges(true);
  };

  // Bulk mark all visible cadets as Present or Absent
  const handleBulkMark = (status: AttendanceStatus) => {
    if (lockInfo.locked) {
      toast.error('Attendance is locked for this date.');
      return;
    }

    filteredCadets.forEach((cadet) => {
      setSlotAttendance(cadet.id, activeDate, activeSlot, status, {
        rollNo: cadet.rollNo,
        course: cadet.course,
        topicOrModule: topicOrModule || undefined,
        markedBy: user?.full_name || user?.username || 'Teacher'
      });
    });

    setHasPendingChanges(true);
    toast.success(`Marked all ${filteredCadets.length} cadets as ${status}.`);
  };

  // Save / Upload Day Attendance to MongoDB
  const handleSaveAttendance = async () => {
    if (lockInfo.locked) {
      toast.error('Attendance is locked for this date.');
      return;
    }

    setIsSaving(true);
    try {
      // Gather all current records for this date across slots
      const dayRecords = attendance.filter((r) => r.date === activeDate);

      // If active slot has unmarked cadets, default them or keep marked ones
      const recordsToUpload = dayRecords.map((r) => ({
        studentId: r.studentId,
        rollNo: r.rollNo,
        slot: r.slot,
        status: r.status,
        course: r.course,
        topicOrModule: r.slot === activeSlot && topicOrModule ? topicOrModule : r.topicOrModule,
        remarks: r.remarks,
        markedBy: user?.full_name || user?.username || 'Teacher'
      }));

      await uploadDayAttendance(activeDate, recordsToUpload);
      setHasPendingChanges(false);
      toast.success(`Attendance successfully saved to MongoDB!`, {
        description: `Muster for ${activeDate} (${activeSlot}) updated.`
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to save attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  // Date Shift Helpers
  const shiftDate = (days: number) => {
    try {
      const parts = activeDate.split('-').map(Number);
      const current = new Date(parts[0], parts[1] - 1, parts[2]);
      current.setDate(current.getDate() + days);
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      handleSelectDate(`${y}-${m}-${d}`);
    } catch {
      handleSelectDate(todayStr);
    }
  };

  // Format active date for display
  const activeDateFormatted = useMemo(() => {
    try {
      const parts = activeDate.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return activeDate;
    }
  }, [activeDate]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0c1219] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP HEADER BANNER */}
        <header className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#161d27] p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title & Teacher Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
                <Flame className="w-6 h-6 text-primary animate-pulse" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20">
                    Faculty Console
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Attendance Marking Only</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                    48-Hour Edit Rule Active
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-heading font-black text-gray-900 dark:text-white mt-1">
                  Cadet Muster & Attendance Console
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Welcome, <strong className="text-gray-800 dark:text-gray-200">{user?.full_name || user?.username}</strong> • Record drill muster and classroom attendance.
                </p>
              </div>
            </div>

            {/* Right: Live IST Clock & Refresh */}
            <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-xs font-mono text-xs">
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="font-bold text-gray-900 dark:text-white">
                  {istNow.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">IST</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  refreshAttendance();
                  loadCadets();
                  toast.success('Attendance data refreshed.');
                }}
                className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                title="Refresh Attendance Data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

          </div>
        </header>

        {/* 2. 48-HOUR ATTENDANCE LOCK ALERT BANNER */}
        <section>
          {lockInfo.locked ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 dark:bg-red-500/15 p-4 sm:p-5 flex items-start gap-3.5 text-red-900 dark:text-red-200 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-red-700 dark:text-red-300">
                    {lockInfo.isFuture ? 'Attendance Not Yet Open' : 'Attendance Locked (Past 48-Hour Window)'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/20 text-red-700 dark:text-red-300 uppercase">
                    Read-Only
                  </span>
                </div>
                <p className="text-red-700/90 dark:text-red-300/90 mt-1 leading-relaxed">
                  {lockInfo.isFuture
                    ? `Attendance for ${activeDate} is scheduled to unlock at 08:00 AM IST on that day when Slot 1 begins.`
                    : `The 48-hour faculty editing window for ${activeDate} expired on ${formattedCutoff}. Attendance is strictly locked for teachers. Please contact an Administrator to unlock.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 sm:p-5 flex items-start gap-3.5 text-emerald-950 dark:text-emerald-100 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Unlock className="w-5 h-5" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                    Attendance Marking Active (48-Hour Window)
                  </span>
                  {lockInfo.remainingHours !== undefined && lockInfo.remainingHours > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider shadow-xs">
                      {lockInfo.remainingHours} Hours Left to Edit
                    </span>
                  )}
                </div>
                <p className="text-emerald-800/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                  Slot 1 unlocked at 08:00 AM IST. You can record, modify, and submit muster for this date until <strong>{formattedCutoff}</strong>.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 3. DATE NAVIGATION & SLOT SELECTOR BAR */}
        <section className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#161d27] p-5 shadow-sm space-y-5">
          
          {/* Top row: Date Picker with quick buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
            
            {/* Date Display and Controls */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Prev Day Arrow */}
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Date Box with Tap-to-Open Native Calendar Picker */}
              <div 
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker();
                  } catch {
                    dateInputRef.current?.focus();
                  }
                }}
                className="relative flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer select-none"
                title="Click anywhere to change date"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                    {activeDateFormatted}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                    {activeDate}
                  </span>
                </div>

                {/* Native date input with hidden webkit indicator */}
                <input
                  ref={dateInputRef}
                  type="date"
                  value={activeDate}
                  onChange={(e) => {
                    if (e.target.value) handleSelectDate(e.target.value);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer pointer-events-auto w-full h-full"
                  aria-label="Select Date"
                />
              </div>

              {/* Next Day Arrow */}
              <button
                type="button"
                onClick={() => shiftDate(1)}
                className="w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => handleSelectDate(todayStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDate === todayStr
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectDate(yesterdayStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeDate === yesterdayStr
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  Yesterday (Unlocked)
                </button>
              </div>

            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1.5 ${
                lockInfo.locked
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}>
                {lockInfo.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{lockInfo.locked ? 'Locked' : 'Open for Editing'}</span>
              </span>
            </div>

          </div>

          {/* 3 SLOTS SELECTOR TABS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SLOTS_LIST.map((slot) => {
              const isSelected = activeSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => handleSelectSlot(slot.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                      : 'border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-black uppercase tracking-wider ${
                      isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'
                    }`}>
                      {slot.id}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                      {slot.time}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                    {slot.label.split('(')[1]?.replace(')', '') || slot.label}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {slot.desc}
                  </div>
                </button>
              );
            })}
          </div>

        </section>

        {/* 4. SESSION TOPIC & CADET FILTER CONTROLS */}
        <section className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#161d27] p-5 shadow-sm space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Topic / Drill Module Input */}
            <div className="md:col-span-1">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Topic / Drill Covered:
              </label>
              <input
                type="text"
                value={topicOrModule}
                onChange={(e) => {
                  setTopicOrModule(e.target.value);
                  setHasPendingChanges(true);
                }}
                disabled={lockInfo.locked}
                placeholder="e.g. Hose running drill, NBC lecture..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary disabled:opacity-60 transition-colors"
              />
            </div>

            {/* Course Filter Dropdown */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Filter by Course:
              </label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="All">All Courses ({cadets.length} cadets)</option>
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Search Cadet Bar */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Search Cadets:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, Roll No, or ID..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* BULK ACTIONS & LIVE STATS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
            
            {/* Quick Bulk Marking Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mr-1">
                Bulk Action:
              </span>
              <button
                type="button"
                onClick={() => handleBulkMark('Present')}
                disabled={lockInfo.locked}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Present</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkMark('Absent')}
                disabled={lockInfo.locked}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>Mark All Absent</span>
              </button>
            </div>

            {/* Live Slot Stats Summary */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Total: <strong>{slotStats.total}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
                Present: <strong>{slotStats.present}</strong> ({slotStats.presentRate}%)
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 text-[11px] font-bold">
                Absent: <strong>{slotStats.absent}</strong>
              </span>
              {slotStats.unmarked > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                  Unmarked: <strong>{slotStats.unmarked}</strong>
                </span>
              )}
            </div>

          </div>

        </section>

        {/* 5. CADET ATTENDANCE MUSTER ROSTER */}
        <section className="rounded-3xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#161d27] p-5 sm:p-6 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              <h2 className="text-base sm:text-lg font-heading font-black text-gray-900 dark:text-white">
                Cadet Muster List — {activeSlot}
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-medium">
              Showing {filteredCadets.length} Cadets
            </span>
          </div>

          {isLoadingCadets ? (
            <div className="p-12 text-center text-gray-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="text-xs">Loading cadet muster roster...</p>
            </div>
          ) : filteredCadets.length === 0 ? (
            <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
              <p className="text-sm font-semibold">No cadets match the current search or course filter.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCourseFilter('All'); }}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredCadets.map((cadet) => {
                const rec = getCadetRecord(cadet.id);
                const currentStatus = rec?.status || null;

                return (
                  <div
                    key={cadet.id}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 dark:hover:bg-white/[0.02] px-2 sm:px-3 rounded-2xl transition-colors"
                  >
                    
                    {/* Left: Avatar, Roll No, Cadet Name, Course */}
                    <div className="flex items-center gap-3 min-w-0">
                      
                      {/* Roll No badge */}
                      <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center shrink-0 font-mono">
                        <span className="text-[9px] uppercase text-gray-400 leading-none">ROLL</span>
                        <span className="text-xs font-black text-gray-900 dark:text-white leading-tight">
                          {cadet.rollNo ? String(cadet.rollNo).padStart(2, '0') : '--'}
                        </span>
                      </span>

                      {/* Avatar */}
                      <UserAvatar
                        photoUrl={cadet.photoUrl}
                        name={cadet.name}
                        size="md"
                      />

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-heading font-black text-gray-900 dark:text-white truncate">
                            {cadet.name}
                          </h4>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                            #{cadet.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {cadet.course || 'Fire Safety Program'}
                        </p>
                      </div>

                    </div>

                    {/* Right: Quick Action Status Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      
                      {/* [ PRESENT ] */}
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(cadet, 'Present')}
                        disabled={lockInfo.locked}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                          currentStatus === 'Present'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/50'
                            : 'bg-gray-100 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-950/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Present</span>
                      </button>

                      {/* [ ABSENT ] */}
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(cadet, 'Absent')}
                        disabled={lockInfo.locked}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                          currentStatus === 'Absent'
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/20 ring-2 ring-red-500/50'
                            : 'bg-gray-100 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-950/20 text-gray-700 dark:text-gray-300 hover:text-red-600'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Absent</span>
                      </button>

                      {/* [ N/A ] */}
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(cadet, 'NA')}
                        disabled={lockInfo.locked}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                          currentStatus === 'NA' || !currentStatus
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            : 'bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-400'
                        }`}
                        title="Mark Not Applicable / Unmarked"
                      >
                        <span>N/A</span>
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

        {/* 6. BOTTOM STICKY SAVE & COMMIT BAR */}
        <div className="sticky bottom-4 z-30">
          <div className="rounded-2xl border border-gray-200/90 dark:border-white/10 bg-white/95 dark:bg-[#161d27]/95 backdrop-blur-md p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white">
                  Muster for {activeDate} ({activeSlot})
                </span>
                <span className="text-gray-400 ml-2">
                  • {slotStats.present} Present / {slotStats.total} Cadets ({slotStats.presentRate}%)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
              {hasPendingChanges && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                  ● Unsaved Edits
                </span>
              )}

              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={lockInfo.locked || isSaving}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 active:scale-95"
              >
                <UploadCloud className={`w-4 h-4 ${isSaving ? 'animate-bounce' : ''}`} />
                <span>{isSaving ? 'Saving to Database...' : 'Save & Upload Muster'}</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
