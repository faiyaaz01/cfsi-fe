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
  UserCheck 
} from 'lucide-react';
import { useStudentData } from '../context/StudentDataContext';
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

  // Filters & selection
  const [slotStudentSearch, setSlotStudentSearch] = useState<string>('');
  const [slotCourseFilter, setSlotCourseFilter] = useState<string>('All');
  const [slotStatusFilter, setSlotStatusFilter] = useState<'all' | 'pending' | 'present' | 'absent'>('all');
  const [selectedCadetIds, setSelectedCadetIds] = useState<Set<string>>(new Set());

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

  // Reset selection when slot or date changes
  useEffect(() => {
    setSelectedCadetIds(new Set());
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

  // Lock status for active date
  const dateLock = isDateLocked(activeDate);
  const isLocked = dateLock.locked;

  // Selection handlers
  const handleToggleSelectStudent = (studentId: string) => {
    setSelectedCadetIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const isAllStudentsSelected =
    filteredSlotStudents.length > 0 &&
    filteredSlotStudents.every((s) => selectedCadetIds.has(s.id));
  const isSomeStudentsSelected =
    filteredSlotStudents.some((s) => selectedCadetIds.has(s.id));

  const handleToggleSelectAll = () => {
    setSelectedCadetIds((prev) => {
      const next = new Set(prev);
      if (isAllStudentsSelected) {
        filteredSlotStudents.forEach((s) => next.delete(s.id));
      } else {
        filteredSlotStudents.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedCadetIds(new Set());
  };

  // Bulk mark all filtered
  const handleBulkMarkActiveSlot = (status: AttendanceStatus) => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
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

  // Mark selected students from bottom action bar
  const handleMarkSelectedAttendance = (status: AttendanceStatus) => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
      return;
    }

    let targetIds = Array.from(selectedCadetIds);
    if (targetIds.length === 0) {
      targetIds = filteredSlotStudents.map((s) => s.id);
    }

    if (targetIds.length === 0) {
      toast.error('No students available to mark.');
      return;
    }

    const targetStudents = cadetsList.filter((s) => targetIds.includes(s.id));
    const targets = targetStudents.map((s) => ({
      studentId: s.id,
      rollNo: s.rollNo,
      course: s.course,
    }));

    const topic = activeSlot === 'Slot 1' ? slot1Topic : activeSlot === 'Slot 2' ? slot2Topic : slot3Topic;
    bulkMarkDaySlots(activeDate, activeSlot, status, targets, musterInstructor, topic);
    setHasPendingChanges(true);
    toast.success(`Marked ${targets.length} student(s) as ${status} for ${slotConfigMap[activeSlot].shortLabel}.`);
  };

  // Clear active date attendance
  const handleClearActiveDateAttendance = () => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to clear all marked attendance records for ${formatDateLabel(activeDate)} across all slots?\n\nThis will reset today's muster draft back to unmarked pending status.`
    );
    if (!confirmed) return;
    clearDayAttendance(activeDate);
    setSelectedCadetIds(new Set());
    setHasPendingChanges(true);
    toast.success(`Cleared all attendance records for ${formatDateLabel(activeDate)}.`);
  };

  // Upload attendance to MongoDB
  const handleUploadActiveDateAttendance = async () => {
    if (isLocked) {
      toast.error('Attendance for this date is permanently locked (48-hour edit window expired).');
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
              onClick={() => navigate('/dashboard?tab=attendance')}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:shadow"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            {/* Compact Live Sync & 48h Lock Status Pill */}
            {isLocked ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20"
                title={`Uploaded on ${new Date(dateLock.uploadedAt!).toLocaleString()}. 48-hour edit window expired.`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Locked (48h Ended)</span>
              </span>
            ) : dateLock.uploadedAt ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                title={`Uploaded on ${new Date(dateLock.uploadedAt).toLocaleString()} • Editable until ${new Date(dateLock.canEditUntil!).toLocaleString()}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live Synced</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  • {dateLock.remainingHours ?? 48}h left to edit
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
                  <div className={`text-[10px] mt-1 font-mono ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                    {cfg.time}
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
                  <th className="py-4 px-6 text-center w-48">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        checked={isAllStudentsSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = !isAllStudentsSelected && isSomeStudentsSelected;
                        }}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 cursor-pointer accent-primary"
                        title="Select / Deselect all students"
                      />
                      <span>Selection Box</span>
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
                            className="mt-2 px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer"
                          >
                            View All Students ({cadetsList.length})
                          </button>
                        </div>
                      ) : (
                        'No students found matching the current search or course filter.'
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredSlotStudents.map((student) => {
                    const rec = getSlotRecord(student.id, activeDate, activeSlot);
                    const isPresent = rec?.status === 'Present';
                    const isAbsent = rec?.status === 'Absent';
                    const isSelected = selectedCadetIds.has(student.id);

                    return (
                      <tr
                        key={student.id}
                        onClick={() => handleToggleSelectStudent(student.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary/5 dark:bg-primary/10 hover:bg-primary/10'
                            : 'hover:bg-gray-50/70 dark:hover:bg-white/5'
                        }`}
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

                        {/* Column 2: Selection Box (at last) */}
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectStudent(student.id)}
                              className="w-5 h-5 rounded text-primary focus:ring-primary border-gray-300 dark:border-white/20 cursor-pointer accent-primary transition-transform hover:scale-110"
                              aria-label={`Select ${student.name}`}
                            />
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
          {/* ROW 7: ACTION BAR AT END OF TABLE (Mark Present Button)                   */}
          {/* ========================================================================= */}
          <div className="px-6 py-4 bg-gray-50/90 dark:bg-white/[0.03] border-t border-gray-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
              <span>
                {selectedCadetIds.size > 0 ? (
                  <span className="text-primary font-black">
                    {selectedCadetIds.size} student{selectedCadetIds.size !== 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <span className="text-gray-400">
                    Total {filteredSlotStudents.length} students (select via checkboxes or Mark Present directly)
                  </span>
                )}
              </span>
              {selectedCadetIds.size > 0 ? (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-[11px] text-gray-400 hover:text-red-500 underline ml-2 cursor-pointer"
                >
                  Clear Selection
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-[11px] text-primary hover:underline ml-2 cursor-pointer font-semibold"
                >
                  Select All ({filteredSlotStudents.length})
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleMarkSelectedAttendance('Absent')}
                disabled={isLocked}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isLocked
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 border-transparent cursor-not-allowed'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-600 hover:text-white hover:border-red-600'
                }`}
                title="Mark selected students Absent"
              >
                <XCircle className="w-4 h-4" />
                <span>Mark Absent {selectedCadetIds.size > 0 ? `(${selectedCadetIds.size})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkSelectedAttendance('Present')}
                disabled={isLocked}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  isLocked
                    ? 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg active:scale-95'
                }`}
                title="Mark selected students Present"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Present {selectedCadetIds.size > 0 ? `(${selectedCadetIds.size})` : ''}</span>
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
