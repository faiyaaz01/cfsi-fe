import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  UploadCloud, 
  Loader2, 
  Clock, 
  Edit3, 
  Tag, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCheck, 
  XCircle, 
  Users, 
  Check, 
  X,
  UserCheck,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useConfirm } from '../context/ConfirmContext';
import { AttendanceSlot, AttendanceStatus, StudentVerificationRecord } from '../types';
import { api } from '../lib/api';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { CadetDetailModal } from '../components/admin/CadetDetailModal';

const slotConfigMap: Record<AttendanceSlot, { label: string; shortLabel: string; time: string; defaultTopic: string }> = {
  'Slot 1': {
    label: 'Slot One (Morning PT)',
    shortLabel: 'Slot 1 (PT)',
    time: '08:00 - 10:00 AM',
    defaultTopic: 'Physical Training, Hose Running & Ground Drills',
  },
  'Slot 2': {
    label: 'Slot Two (Theory)',
    shortLabel: 'Slot 2 (Theory)',
    time: '10:30 AM - 01:00 PM',
    defaultTopic: 'Fire Prevention, Chemistry & Building Safety Codes',
  },
  'Slot 3': {
    label: 'Slot Three (Drill)',
    shortLabel: 'Slot 3 (Drill)',
    time: '02:00 - 05:00 PM',
    defaultTopic: 'Apparatus Operation, High-Rise & Hydrant Drills',
  },
};

const normalizeSlotParam = (raw?: string): AttendanceSlot => {
  if (!raw) return 'Slot 1';
  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  if (decoded.includes('3') || decoded.includes('three') || decoded.includes('drill')) return 'Slot 3';
  if (decoded.includes('2') || decoded.includes('two') || decoded.includes('theory')) return 'Slot 2';
  return 'Slot 1';
};

export const SlotAttendancePage: React.FC = () => {
  const { date: paramDate, slot: paramSlot } = useParams<{ date?: string; slot?: string }>();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const activeDate = useMemo(() => {
    if (paramDate && /^\d{4}-\d{2}-\d{2}$/.test(paramDate)) return paramDate;
    return new Date().toISOString().split('T')[0];
  }, [paramDate]);

  const activeSlot = useMemo(() => {
    return normalizeSlotParam(paramSlot);
  }, [paramSlot]);

  const {
    attendance,
    setSlotAttendance,
    deleteAttendance,
    bulkMarkDaySlots,
    clearDayAttendance,
    uploadDayAttendance,
    isDateLocked,
  } = useStudentData();

  const getSlotRecord = useCallback(
    (studentId: string, date: string, slot: AttendanceSlot) => {
      return attendance.find(
        (a) =>
          a.date === date &&
          a.slot === slot &&
          (a.studentId.toUpperCase() === studentId.toUpperCase() ||
            (a.rollNo && a.rollNo.toUpperCase() === studentId.toUpperCase()))
      );
    },
    [attendance]
  );

  // Cadet roster
  const [cadetsList, setCadetsList] = useState<StudentVerificationRecord[]>([]);
  const [isLoadingCadets, setIsLoadingCadets] = useState<boolean>(false);
  const [selectedCadetDetail, setSelectedCadetDetail] = useState<StudentVerificationRecord | null>(null);

  // Filters
  const [slotStudentSearch, setSlotStudentSearch] = useState<string>('');
  const [slotCourseFilter, setSlotCourseFilter] = useState<string>('All');
  const [slotStatusFilter, setSlotStatusFilter] = useState<'all' | 'pending' | 'present' | 'absent'>('all');

  // Instructor & topic settings
  const [musterInstructor, setMusterInstructor] = useState<string>('Chief Instructor Dave');
  const [slot1Topic, setSlot1Topic] = useState<string>('Morning Squad Drill, PT & Hose Running');
  const [slot2Topic, setSlot2Topic] = useState<string>('NBC & Hazardous Materials Safety Codes');
  const [slot3Topic, setSlot3Topic] = useState<string>('High-Rise Tower & Apparatus Pumping Drills');


  const [isUploadingMuster, setIsUploadingMuster] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);

  // Helper to extract numeric roll number for natural ascending sort
  const getNumericRoll = (cadet: StudentVerificationRecord): number => {
    const raw = cadet.rollNo ?? cadet.id ?? '';
    const match = String(raw).match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
  };

  // Load cadets list
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
    } catch (err) {
      console.warn('Could not fetch cadets:', err);
      setCadetsList([]);
    } finally {
      setIsLoadingCadets(false);
    }
  }, []);

  useEffect(() => {
    loadCadets();
  }, [loadCadets]);

  // Reset pending state when slot or date changes
  useEffect(() => {
    setHasPendingChanges(false);
  }, [activeDate, activeSlot]);

  // Available courses
  const availableCourses = useMemo(() => {
    const set = new Set(cadetsList.map((c) => c.course).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [cadetsList]);

  // Format date label helper
  const formatDateLabel = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isTodayDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  // Shift date handler
  const handleShiftDate = (deltaDays: number) => {
    try {
      const [year, month, day] = activeDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() + deltaDays);
      const yStr = d.getFullYear();
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const dStr = String(d.getDate()).padStart(2, '0');
      const newD = `${yStr}-${mStr}-${dStr}`;
      navigate(`/dashboard/attendance/${newD}/${encodeURIComponent(activeSlot)}`);
    } catch {}
  };

  // Switch slot handler
  const handleSwitchSlot = (newSlot: AttendanceSlot) => {
    navigate(`/dashboard/attendance/${activeDate}/${encodeURIComponent(newSlot)}`);
  };

  // Filtered students for current slot
  const filteredSlotStudents = useMemo(() => {
    return cadetsList.filter((cadet) => {
      if (slotCourseFilter !== 'All' && cadet.course !== slotCourseFilter) return false;
      if (slotStudentSearch.trim()) {
        const q = slotStudentSearch.toLowerCase().trim();
        const matchesName = cadet.name.toLowerCase().includes(q);
        const matchesRoll = cadet.rollNo.toString().includes(q);
        const matchesId = cadet.id.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesId) return false;
      }
      if (slotStatusFilter !== 'all') {
        const rec = getSlotRecord(cadet.id, activeDate, activeSlot);
        if (slotStatusFilter === 'pending') {
          if (rec && rec.status) return false;
        } else if (slotStatusFilter === 'present') {
          if (rec?.status !== 'Present') return false;
        } else if (slotStatusFilter === 'absent') {
          if (rec?.status !== 'Absent') return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const rollA = getNumericRoll(a);
      const rollB = getNumericRoll(b);
      if (rollA !== rollB) return rollA - rollB;
      return a.name.localeCompare(b.name);
    });
  }, [cadetsList, activeDate, activeSlot, slotCourseFilter, slotStudentSearch, slotStatusFilter, getSlotRecord]);

  // Active slot metrics
  const activeSlotStats = useMemo(() => {
    const total = cadetsList.length;
    let present = 0;
    let absent = 0;

    cadetsList.forEach((cadet) => {
      const rec = getSlotRecord(cadet.id, activeDate, activeSlot);
      if (rec?.status === 'Present') present++;
      else if (rec?.status === 'Absent') absent++;
    });

    const marked = present + absent;
    const pending = Math.max(0, total - marked);
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, pending, rate };
  }, [activeDate, activeSlot, cadetsList, getSlotRecord]);

  // Current user & leadership role
  const { user } = useAuth();
  const isLeader = user?.role === 'leader';

  // Live ticking clock for real-time slot countdown & automated lock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => {
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, '0');
    const d = String(currentTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentTime]);

  const isToday = activeDate === todayStr;

  // Slot time evaluator (incorporating the 20m post-slot cutoff)
  const getSlotTimeStatus = useCallback((slot: AttendanceSlot) => {
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const currentSecs = currentTime.getSeconds();

    let startMins = 480;  // 08:00 AM
    let endMins = 620;    // 10:20 AM (8-10 + 20m grace)
    let lockLabel = '10:20 AM';
    let openLabel = '08:00 AM';

    if (slot === 'Slot 1') {
      startMins = 480; // 08:00 AM
      endMins = 620;   // 10:20 AM
      lockLabel = '10:20 AM';
      openLabel = '08:00 AM';
    } else if (slot === 'Slot 2') {
      startMins = 630; // 10:30 AM
      endMins = 800;   // 01:20 PM / 13:20 (10:30-13:00 + 20m grace)
      lockLabel = '01:20 PM';
      openLabel = '10:30 AM';
    } else if (slot === 'Slot 3') {
      startMins = 840;  // 02:00 PM / 14:00
      endMins = 1040;   // 05:20 PM / 17:20 (14:00-17:00 + 20m grace)
      lockLabel = '05:20 PM';
      openLabel = '02:00 PM';
    }

    const isBefore = currentMins < startMins;
    const isAfter = currentMins >= endMins;
    const isOpen = !isBefore && !isAfter;

    const remainingSecs = isOpen ? (endMins - currentMins) * 60 - currentSecs : 0;
    const timeUntilOpenSecs = isBefore ? (startMins - currentMins) * 60 - currentSecs : 0;

    return {
      isOpen,
      isBefore,
      isAfter,
      remainingSecs,
      timeUntilOpenSecs,
      lockLabel,
      openLabel,
    };
  }, [currentTime]);

  const activeSlotStatus = useMemo(() => {
    return getSlotTimeStatus(activeSlot);
  }, [getSlotTimeStatus, activeSlot]);

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '0m 00s';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${String(secs).padStart(2, '0')}s`;
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  // Lock status for active date (24-hour edit limit)
  const dateLock = isDateLocked(activeDate);

  // Leader-specific lock: leaders can only mark today and only during active slot time window
  const isLeaderSlotLocked = isLeader && (!isToday || !activeSlotStatus.isOpen);
  const isLocked = dateLock.locked || isLeaderSlotLocked;

  // Single-cadet direct toggle between Present, Absent, and unmarking back to Pending
  const handleToggleMarkStatus = async (
    student: StudentVerificationRecord,
    targetStatus: AttendanceStatus
  ) => {
    if (isLeaderSlotLocked) {
      if (!isToday) {
        toast.error(`Attendance locked: Leaders can only mark attendance for today (${todayStr}).`);
      } else if (activeSlotStatus.isBefore) {
        toast.error(`Attendance not yet open: ${slotConfigMap[activeSlot].shortLabel} unlocks at ${activeSlotStatus.openLabel}.`);
      } else {
        toast.error(`Attendance locked: ${slotConfigMap[activeSlot].shortLabel} marking window closed at ${activeSlotStatus.lockLabel}.`);
      }
      return;
    }

    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
      return;
    }

    const currentRec = getSlotRecord(student.id, activeDate, activeSlot);
    const topic = activeSlot === 'Slot 1' ? slot1Topic : activeSlot === 'Slot 2' ? slot2Topic : slot3Topic;

    try {
      if (currentRec && currentRec.status === targetStatus) {
        // Toggle off back to pending
        await deleteAttendance(currentRec.id);
        setHasPendingChanges(true);
        toast.info(`Unmarked ${student.name} (${slotConfigMap[activeSlot].shortLabel} pending)`);
        return;
      }

      await setSlotAttendance(student.id, activeDate, activeSlot, targetStatus, {
        topicOrModule: topic,
        course: student.course,
        markedBy: musterInstructor,
        rollNo: student.rollNo,
      });
      setHasPendingChanges(true);
      toast.success(`${student.name} marked as ${targetStatus}`);
    } catch (err: any) {
      console.error('Failed to update slot attendance:', err);
      toast.error(err?.message || 'Failed to update attendance.');
    }
  };

  // Quick batch mark for remaining pending students in this slot
  const handleMarkPendingAs = (status: AttendanceStatus) => {
    if (isLeaderSlotLocked) {
      if (!isToday) {
        toast.error(`Attendance locked: Leaders can only mark attendance for today (${todayStr}).`);
      } else if (activeSlotStatus.isBefore) {
        toast.error(`Attendance not yet open: ${slotConfigMap[activeSlot].shortLabel} unlocks at ${activeSlotStatus.openLabel}.`);
      } else {
        toast.error(`Attendance locked: ${slotConfigMap[activeSlot].shortLabel} marking window closed at ${activeSlotStatus.lockLabel}.`);
      }
      return;
    }

    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
      return;
    }

    const pendingCadets = filteredSlotStudents.filter((s) => {
      const rec = getSlotRecord(s.id, activeDate, activeSlot);
      return !rec || !rec.status;
    });

    if (pendingCadets.length === 0) {
      toast.info(`All students are already marked for ${slotConfigMap[activeSlot].shortLabel}.`);
      return;
    }

    const targets = pendingCadets.map((s) => ({
      studentId: s.id,
      rollNo: s.rollNo,
      course: s.course,
    }));

    const topic = activeSlot === 'Slot 1' ? slot1Topic : activeSlot === 'Slot 2' ? slot2Topic : slot3Topic;
    bulkMarkDaySlots(activeDate, activeSlot, status, targets, musterInstructor, topic);
    setHasPendingChanges(true);
    toast.success(`Marked ${targets.length} pending student(s) as ${status} for ${slotConfigMap[activeSlot].shortLabel}.`);
  };

  // Bulk mark all filtered
  const handleBulkMarkActiveSlot = (status: AttendanceStatus) => {
    if (isLeaderSlotLocked) {
      if (!isToday) {
        toast.error(`Attendance locked: Leaders can only mark attendance for today (${todayStr}).`);
      } else if (activeSlotStatus.isBefore) {
        toast.error(`Attendance not yet open: ${slotConfigMap[activeSlot].shortLabel} unlocks at ${activeSlotStatus.openLabel}.`);
      } else {
        toast.error(`Attendance locked: ${slotConfigMap[activeSlot].shortLabel} marking window closed at ${activeSlotStatus.lockLabel}.`);
      }
      return;
    }

    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
      return;
    }

    const targets = filteredSlotStudents.map((s) => ({
      studentId: s.id,
      rollNo: s.rollNo,
      course: s.course,
    }));

    if (targets.length === 0) {
      toast.error('No students matching current filter to mark.');
      return;
    }

    const topic = activeSlot === 'Slot 1' ? slot1Topic : activeSlot === 'Slot 2' ? slot2Topic : slot3Topic;
    bulkMarkDaySlots(activeDate, activeSlot, status, targets, musterInstructor, topic);
    setHasPendingChanges(true);
    toast.success(`Marked ${targets.length} students ${status} for ${slotConfigMap[activeSlot].shortLabel}.`);
  };

  // Clear active date attendance
  const handleClearActiveDateAttendance = async () => {
    if (isLeader) {
      toast.error('Cadet Leaders cannot reset or clear attendance records. Please contact an Administrator.');
      return;
    }

    if (isLocked) {
      toast.error('Attendance for this date is permanently locked.');
      return;
    }
    const confirmed = await confirm({
      title: 'Clear Muster Records',
      message: `Are you sure you want to clear all marked attendance records for ${formatDateLabel(activeDate)} across all slots?\n\nThis will reset today's muster draft back to unmarked pending status.`,
      confirmText: 'Clear Muster',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'trash',
    });
    if (!confirmed) return;
    clearDayAttendance(activeDate);
    setHasPendingChanges(true);
    toast.success(`Cleared all attendance records for ${formatDateLabel(activeDate)}.`);
  };

  // Upload attendance to MongoDB
  const handleUploadActiveDateAttendance = async () => {
    if (isLeaderSlotLocked) {
      toast.error(`Attendance locked: ${slotConfigMap[activeSlot].shortLabel} marking window is closed for leaders.`);
      return;
    }

    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (24-hour edit window expired).');
      return;
    }

    const dayRecords = attendance.filter((a) => a.date === activeDate);
    if (dayRecords.length === 0) {
      toast.error('No attendance records have been marked yet for this date to upload.');
      return;
    }

    try {
      setIsUploadingMuster(true);
      await uploadDayAttendance(
        activeDate,
        dayRecords.map((r) => ({
          studentId: r.studentId,
          rollNo: r.rollNo,
          slot: r.slot,
          status: r.status,
          course: r.course,
          topicOrModule: r.topicOrModule,
          markedBy: musterInstructor,
        }))
      );
      setHasPendingChanges(false);
      toast.success(`Daily muster for ${formatDateLabel(activeDate)} saved & live-synced to database.`);
    } catch (err: any) {
      console.error('Failed to sync muster:', err);
      toast.error(err.message || 'Failed to sync muster to database.');
    } finally {
      setIsUploadingMuster(false);
    }
  };

  const activeTopic = activeSlot === 'Slot 1' ? slot1Topic : activeSlot === 'Slot 2' ? slot2Topic : slot3Topic;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0d1218] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="pt-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ========================================================================= */}
        {/* ROW 1: HEADER CONTROLS (Back Button, Status Pill, Date Navigator, Save)     */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-200/80 dark:border-white/10">
          {/* Left: Back Button & Compact Status Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(user?.role === 'leader' || user?.role === 'student' ? '/student/dashboard' : '/dashboard?tab=attendance')}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            {/* Compact Live Sync & 24h Lock Status Pill */}
            {isLocked ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20"
                title={`Uploaded on ${new Date(dateLock.uploadedAt!).toLocaleString()}. 24-hour edit window expired.`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Locked (24h Ended)</span>
              </span>
            ) : dateLock.uploadedAt ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                title={`Uploaded on ${new Date(dateLock.uploadedAt).toLocaleString()} • Editable until ${new Date(dateLock.canEditUntil!).toLocaleString()}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Synced</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  • {dateLock.remainingHours ?? 24}h left to edit
                </span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                title="Draft mode: Click Save & Sync to push changes to database"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Draft Mode</span>
                {hasPendingChanges && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                )}
              </span>
            )}
          </div>

          {/* Right: Date Stepper & Save & Sync Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/60 dark:border-white/5">
              <button
                type="button"
                onClick={() => handleShiftDate(-1)}
                className="p-1.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2 font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatDateLabel(activeDate)}</span>
                {isTodayDate(activeDate) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary text-white">
                    Today
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleShiftDate(1)}
                className="p-1.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:shadow-xs transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleUploadActiveDateAttendance}
              disabled={isLocked || isUploadingMuster}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                isLocked
                  ? 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : hasPendingChanges || !dateLock.uploadedAt
                  ? 'bg-primary text-white hover:bg-primary-dark ring-2 ring-primary/40 shadow-md'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isUploadingMuster ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Save & Sync</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Leader Real-Time Slot Lock Policy Status Banner */}
        {isLeader && (
          <div className="rounded-2xl overflow-hidden shadow-sm">
            {!isToday ? (
              <div className="p-4 bg-red-500/10 border border-red-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 text-red-500" />
                  <div>
                    <p className="font-bold text-xs sm:text-sm">
                      Past / Future Date Locked for Cadet Leaders
                    </p>
                    <p className="text-[11px] opacity-90">
                      Cadet Leaders can only mark muster for Today ({todayStr}). You are viewing {activeDate}. Contact an Administrator for historical adjustments.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/attendance/${todayStr}/${encodeURIComponent(activeSlot)}`)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs shrink-0 hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Return to Today
                </button>
              </div>
            ) : activeSlotStatus.isOpen ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <div>
                    <p className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>{slotConfigMap[activeSlot].label} — Live Marking Active</span>
                      <span className="text-[10px] px-2 py-0.2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded font-mono">UNLOCKED</span>
                    </p>
                    <p className="text-[11px] opacity-90">
                      Authorized for Leader muster marking until <strong>{activeSlotStatus.lockLabel}</strong> (includes 20m post-slot grace window). Attendance will permanently lock after this time.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto bg-emerald-500/15 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                      Lock Cutoff In
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                      {formatCountdown(activeSlotStatus.remainingSecs)}
                    </span>
                  </div>
                </div>
              </div>
            ) : activeSlotStatus.isBefore ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 flex items-center justify-between gap-3 text-blue-800 dark:text-blue-200">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 shrink-0 text-blue-500" />
                  <div>
                    <p className="font-bold text-xs sm:text-sm">
                      {slotConfigMap[activeSlot].label} — Slot Not Yet Open
                    </p>
                    <p className="text-[11px] opacity-90">
                      Scheduled time is {slotConfigMap[activeSlot].time}. Unlocks automatically for Leaders at <strong>{activeSlotStatus.openLabel}</strong>.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg shrink-0">
                  Opens in {formatCountdown(activeSlotStatus.timeUntilOpenSecs)}
                </span>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-bold text-xs sm:text-sm">
                      {slotConfigMap[activeSlot].label} — Locked for Cadet Leaders
                    </p>
                    <p className="text-[11px] opacity-90">
                      Attendance marking for this slot closed at <strong>{activeSlotStatus.lockLabel}</strong> (20-minute post-slot cutoff expired). You cannot mark or modify past slots.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg shrink-0">
                  Locked at {activeSlotStatus.lockLabel}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROW 2: SELECT SESSION SLOT (Slot 1, Slot 2, Slot 3 Switcher Cards)        */}
        {/* ========================================================================= */}
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
            Select Session Slot:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['Slot 1', 'Slot 2', 'Slot 3'] as AttendanceSlot[]).map((slotKey) => {
              const isActive = activeSlot === slotKey;
              const cfg = slotConfigMap[slotKey];
              const sStatus = getSlotTimeStatus(slotKey);
              const daySlotRecs = attendance.filter((a) => a.date === activeDate && (a.slot === slotKey || (!a.slot && slotKey === 'Slot 1')));
              const marked = daySlotRecs.length;
              const total = cadetsList.length;
              const isFilled = total > 0 && marked >= total;

              return (
                <button
                  key={slotKey}
                  type="button"
                  onClick={() => handleSwitchSlot(slotKey)}
                  className={`p-3.5 rounded-2xl text-left transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md ring-2 ring-primary/30'
                      : 'bg-white dark:bg-[#161d27] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-white' : isFilled ? 'bg-emerald-500' : marked > 0 ? 'bg-amber-500' : 'bg-gray-400'}`} />
                      <span className="font-black text-sm">{cfg.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : isFilled ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                    }`}>
                      {marked}/{total}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-1 line-clamp-1 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    Session: {slotKey === 'Slot 1' ? slot1Topic : slotKey === 'Slot 2' ? slot2Topic : slot3Topic}
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className={`text-[10px] font-mono ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                      {cfg.time}
                    </div>
                    {isLeader && isToday && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        sStatus.isOpen
                          ? isActive ? 'bg-emerald-400/30 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : sStatus.isAfter
                          ? isActive ? 'bg-red-400/30 text-white' : 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : isActive ? 'bg-blue-400/30 text-white' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      }`}>
                        {sStatus.isOpen ? `🟢 Open (Ends ${sStatus.lockLabel})` : sStatus.isAfter ? `🔒 Locked (${sStatus.lockLabel})` : `⏳ Opens ${sStatus.openLabel}`}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>



        {/* ========================================================================= */}
        {/* ROW 4: 5 RESPONSIVE METRIC CARDS                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <GlassCard className="p-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Enrolled</div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
              {activeSlotStats.total} Students
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">Full batch</div>
          </GlassCard>

          <GlassCard className="p-4 border-emerald-500/20 bg-emerald-500/5">
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Marked Present (P)
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {activeSlotStats.present} Present
            </div>
            <div className="text-[10px] text-emerald-600/70 mt-0.5">Reported present</div>
          </GlassCard>

          <GlassCard className="p-4 border-red-500/20 bg-red-500/5">
            <div className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              Marked Absent (A)
            </div>
            <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1">
              {activeSlotStats.absent} Absent
            </div>
            <div className="text-[10px] text-red-600/70 mt-0.5">Reported absentee</div>
          </GlassCard>

          <GlassCard className="p-4 border-amber-500/20 bg-amber-500/5">
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Unmarked
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {activeSlotStats.pending} Pending
            </div>
            <div className="text-[10px] text-amber-600/70 mt-0.5">Awaiting mark</div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Slot Rate</span>
              <span className="text-primary font-mono">{activeSlotStats.rate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden mt-3">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(activeSlotStats.rate, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-2 font-mono">
              {slotConfigMap[activeSlot].time}
            </div>
          </GlassCard>
        </div>

        {/* ========================================================================= */}
        {/* ROW 5: TOOLBAR (Search, Course Filter, Status Pills, Bulk Actions)        */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, roll no, or ID..."
                value={slotStudentSearch}
                onChange={(e) => setSlotStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Course Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={slotCourseFilter}
                onChange={(e) => setSlotCourseFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/70 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {availableCourses.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? `All Courses (${cadetsList.length} Students)` : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 bg-gray-100/70 dark:bg-white/5 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSlotStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  slotStatusFilter === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSlotStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  slotStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                Pending ({activeSlotStats.pending})
              </button>
              <button
                type="button"
                onClick={() => setSlotStatusFilter('present')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  slotStatusFilter === 'present'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                P ({activeSlotStats.present})
              </button>
              <button
                type="button"
                onClick={() => setSlotStatusFilter('absent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  slotStatusFilter === 'absent'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-500/10 text-red-700 dark:text-red-300 hover:bg-red-500/20'
                }`}
              >
                A ({activeSlotStats.absent})
              </button>
            </div>
          </div>

          {/* Quick Bulk Actions for this slot */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Bulk Actions for {slotConfigMap[activeSlot].shortLabel}:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkMarkActiveSlot('Present')}
                disabled={isLocked}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer ${
                  isLocked
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                title="Mark all filtered students Present for this slot"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Present (P)</span>
              </button>

              <button
                type="button"
                onClick={() => handleBulkMarkActiveSlot('Absent')}
                disabled={isLocked}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer ${
                  isLocked
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                title="Mark all filtered students Absent for this slot"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Mark All Absent (A)</span>
              </button>

              <button
                type="button"
                onClick={handleClearActiveDateAttendance}
                disabled={isLocked}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLocked
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-red-500 hover:text-white'
                }`}
                title="Clear all recorded entries for this date"
              >
                Reset Day
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 6: STUDENT TABLE (2 Columns: Student Name & Selection Box at last)    */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-6 min-w-[300px]">Student Name</th>
                  <th className="py-4 px-6 text-center w-52">
                    <div className="flex items-center justify-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-primary" />
                      <span>Attendance (P / A)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredSlotStudents.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-12 text-center text-gray-400 text-sm font-semibold">
                      {slotStatusFilter === 'pending' ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            All Students Marked for {slotConfigMap[activeSlot].shortLabel}!
                          </p>
                          <p className="text-xs text-gray-500">
                            There are no pending students remaining in this slot.
                          </p>
                          <button
                            type="button"
                            onClick={() => setSlotStatusFilter('all')}
                            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                          >
                            View All Students
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                          <Users className="w-10 h-10 text-gray-400 opacity-50" />
                          <p>No students match the current filter.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSlotStudents.map((student) => {
                    const rec = getSlotRecord(student.id, activeDate, activeSlot);
                    const isPresent = rec?.status === 'Present';
                    const isAbsent = rec?.status === 'Absent';

                    return (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/5"
                      >
                        {/* Column 1: Student Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0 border border-primary/20 shadow-xs">
                              {student.photoUrl ? (
                                <img
                                  src={student.photoUrl}
                                  alt={student.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary font-bold bg-primary/10">
                                  {student.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCadetDetail(student);
                                  }}
                                  className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white leading-tight hover:text-primary transition-colors text-left truncate cursor-pointer"
                                >
                                  {student.name}
                                </button>
                                {isPresent ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Present
                                  </span>
                                ) : isAbsent ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Absent
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/10 shrink-0">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-mono">
                                <span className="font-bold text-gray-700 dark:text-gray-300">Roll #{student.rollNo}</span>
                                <span>•</span>
                                <span>ID: {student.id}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline text-[10px] text-gray-400 truncate">{student.course}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Column 2: Direct P / A Marking */}
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {/* Present (P) Button */}
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleToggleMarkStatus(student, 'Present')}
                              className={`h-9 min-w-[52px] px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                                isPresent
                                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40 scale-105'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white active:scale-95'
                              } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-600`}
                              title={
                                isLocked
                                  ? 'Attendance is locked'
                                  : isPresent
                                  ? 'Currently marked Present (click to unmark)'
                                  : `Mark ${student.name} as Present`
                              }
                              aria-label={`Mark ${student.name} Present`}
                            >
                              <Check className={`w-3.5 h-3.5 ${isPresent ? 'stroke-[3]' : ''}`} />
                              <span>P</span>
                            </button>

                            {/* Absent (A) Button */}
                            <button
                              type="button"
                              disabled={isLocked}
                              onClick={() => handleToggleMarkStatus(student, 'Absent')}
                              className={`h-9 min-w-[52px] px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                                isAbsent
                                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-500/40 scale-105'
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white active:scale-95'
                              } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-red-500/10 disabled:hover:text-red-600`}
                              title={
                                isLocked
                                  ? 'Attendance is locked'
                                  : isAbsent
                                  ? 'Currently marked Absent (click to unmark)'
                                  : `Mark ${student.name} as Absent`
                              }
                              aria-label={`Mark ${student.name} Absent`}
                            >
                              <X className={`w-3.5 h-3.5 ${isAbsent ? 'stroke-[3]' : ''}`} />
                              <span>A</span>
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

          {/* ========================================================================= */}
          {/* ROW 7: ACTION BAR AT END OF TABLE (Slot Progress & Pending Quick Actions) */}
          {/* ========================================================================= */}
          <div className="px-6 py-4 bg-gray-50/90 dark:bg-white/[0.03] border-t border-gray-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            {/* Slot Muster Progress Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-gray-500 dark:text-gray-400 mr-1">
                Muster Status:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                {activeSlotStats.present} Present
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-black flex items-center gap-1">
                <X className="w-3 h-3 stroke-[3]" />
                {activeSlotStats.absent} Absent
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-black flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activeSlotStats.pending} Pending
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-[11px] ml-1">
                ({filteredSlotStudents.length} cadets shown)
              </span>
            </div>

            {/* Quick Actions for Pending Cadets & Save */}
            <div className="flex flex-wrap items-center gap-2.5">
              {activeSlotStats.pending > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleMarkPendingAs('Absent')}
                    disabled={isLocked}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isLocked
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent cursor-not-allowed'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-600 hover:text-white'
                    }`}
                    title={`Mark all remaining ${activeSlotStats.pending} pending cadets as Absent`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Mark Pending as A ({activeSlotStats.pending})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkPendingAs('Present')}
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                      isLocked
                        ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                    }`}
                    title={`Mark all remaining ${activeSlotStats.pending} pending cadets as Present`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Pending as P ({activeSlotStats.pending})</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleUploadActiveDateAttendance}
                disabled={isLocked || isUploadingMuster}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isLocked
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent cursor-not-allowed'
                    : hasPendingChanges
                    ? 'bg-primary text-white border-primary shadow-md hover:opacity-90 active:scale-95'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
                title="Save & sync day muster to database"
              >
                {isUploadingMuster ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-3.5 h-3.5" />
                )}
                <span>{isUploadingMuster ? 'Syncing...' : hasPendingChanges ? 'Save Changes' : 'Synced'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cadet Detail Modal */}
        <CadetDetailModal
          cadet={selectedCadetDetail}
          onClose={() => setSelectedCadetDetail(null)}
        />
      </div>
    </div>
  );
};
