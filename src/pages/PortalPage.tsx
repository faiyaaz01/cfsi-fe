import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StudentProfile, AttendanceSlot } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CheckCircle,
  XCircle, 
  TrendingUp, 
  Radio, 
  RefreshCw, 
  Filter,
  User,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Eye,
  X,
  Award,
  Lock,
  Flame,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CountUp } from '../components/common/CountUp';
import { SkeletonStats, SkeletonTable } from '../components/common/Skeleton';
import { TablePagination } from '../components/common/TablePagination';

interface SlotDutySchedule {
  id: AttendanceSlot;
  title: string;
  shortLabel: string;
  timeRange: string;
  startMinutes: number; // minutes from midnight (IST)
  endMinutes: number;   // cutoff minutes from midnight (IST, including 20m grace)
  lockLabel: string;
  description: string;
}

const SLOTS_DUTY_SCHEDULE: SlotDutySchedule[] = [
  {
    id: 'Slot 1',
    title: 'Slot 1 — Morning PT & Squad Drill',
    shortLabel: 'Slot 1 (PT)',
    timeRange: '08:00 AM – 10:00 AM',
    startMinutes: 8 * 60, // 08:00 = 480
    endMinutes: 10 * 60 + 20, // 10:20 = 620
    lockLabel: '10:20 AM',
    description: 'Physical Training, Squad Parade, Hose Running & Morning Drills.',
  },
  {
    id: 'Slot 2',
    title: 'Slot 2 — Fire Theory & Safety Codes',
    shortLabel: 'Slot 2 (Theory)',
    timeRange: '10:30 AM – 01:00 PM',
    startMinutes: 10 * 60 + 30, // 10:30 = 630
    endMinutes: 13 * 60 + 20, // 13:20 = 800
    lockLabel: '01:20 PM',
    description: 'Chemistry of Combustion, NBC Defense & Industrial Safety Regulations.',
  },
  {
    id: 'Slot 3',
    title: 'Slot 3 — Practical Apparatus & Tower Drill',
    shortLabel: 'Slot 3 (Drill)',
    timeRange: '02:00 PM – 05:00 PM',
    startMinutes: 14 * 60, // 14:00 = 840
    endMinutes: 17 * 60 + 20, // 17:20 = 1040
    lockLabel: '05:20 PM',
    description: 'Apparatus Pumping, High-Rise Rescue, Smoke Chamber & Hydrant Drills.',
  },
];

export function PortalPage() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('All');

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Student view & Cadet Leadership detection
  const isStudentView = user?.role === 'student' || user?.role === 'leader';
  const isLeader = user?.role === 'leader' || Boolean(user?.assigned_modules?.includes('attendance'));

  // Live IST Clock ticking every second for slot duty synchronisation
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // IST Date & Time (UTC + 5:30)
  const istTime = useMemo(() => {
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 5.5);
  }, [currentTime]);

  const todayStr = useMemo(() => {
    const y = istTime.getFullYear();
    const m = String(istTime.getMonth() + 1).padStart(2, '0');
    const d = String(istTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [istTime]);

  const currentMinutes = istTime.getHours() * 60 + istTime.getMinutes();
  const currentSeconds = istTime.getSeconds();

  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '0m 00s';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${String(secs).padStart(2, '0')}s`;
    }
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  // Evaluate 3 slots active status & lock cutoff in real-time
  const slotEvaluations = useMemo(() => {
    return SLOTS_DUTY_SCHEDULE.map((s) => {
      const isBefore = currentMinutes < s.startMinutes;
      const isAfter = currentMinutes >= s.endMinutes;
      const isActive = currentMinutes >= s.startMinutes && currentMinutes < s.endMinutes;

      let remainingSec = 0;
      if (isActive) {
        remainingSec = (s.endMinutes - currentMinutes) * 60 - currentSeconds;
      }

      let timeUntilOpenSec = 0;
      if (isBefore) {
        timeUntilOpenSec = (s.startMinutes - currentMinutes) * 60 - currentSeconds;
      }

      const isAssigned =
        !user?.assigned_slots ||
        user.assigned_slots.length === 0 ||
        user.assigned_slots.includes(s.id);

      return {
        ...s,
        isActive,
        isBefore,
        isAfter,
        remainingSec,
        timeUntilOpenSec,
        isAssigned,
      };
    });
  }, [currentMinutes, currentSeconds, user?.assigned_slots]);

  const activeSlot = useMemo(() => {
    return slotEvaluations.find((s) => s.isActive) || null;
  }, [slotEvaluations]);

  const nextSlot = useMemo(() => {
    return slotEvaluations.find((s) => s.isBefore) || null;
  }, [slotEvaluations]);

  // Selected Slot for Dropdown Duty Selector
  const [selectedSlotId, setSelectedSlotId] = useState<AttendanceSlot>('Slot 1');
  const [showScheduleDropdown, setShowScheduleDropdown] = useState<boolean>(false);
  const [dutyDropdownOpen, setDutyDropdownOpen] = useState<boolean>(false);
  const dutyDropdownRef = useRef<HTMLDivElement>(null);

  // Default to active slot or upcoming slot automatically
  useEffect(() => {
    if (activeSlot) {
      setSelectedSlotId(activeSlot.id);
    } else if (nextSlot) {
      setSelectedSlotId(nextSlot.id);
    }
  }, [activeSlot?.id, nextSlot?.id]);

  const selectedSlot = useMemo(() => {
    return slotEvaluations.find((s) => s.id === selectedSlotId) || slotEvaluations[0];
  }, [slotEvaluations, selectedSlotId]);

  // Close banner duty dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dutyDropdownRef.current && !dutyDropdownRef.current.contains(e.target as Node)) {
        setDutyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const load = async () => {
    try {
      const mySid = isStudentView ? (profile?.id || user?.student_id || user?.username) : undefined;
      const a = await api.getAttendance(mySid ? { studentId: mySid } : undefined);
      setAttendance(a);
    } catch (e: any) {
      setError(e.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    load();
    if (isStudentView) {
      api.getStudentProfile()
        .then((p) => setProfile(p))
        .catch(() => {
          // Gracefully fallback to user object
        });
    }
  }, [user?.id, user?.role, isStudentView]);

  const hardcodedUserId = profile?.id || user?.student_id || user?.username || '262701';
  const name = profile?.name || user?.full_name || user?.username || 'Student Name';
  const photoUrl = profile?.photoUrl || user?.photo_url || '';
  const rollNo = (profile as any)?.rollNo || (profile as any)?.roll_no || (user as any)?.roll_no || '';
  const course = profile?.course || user?.course || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT';
  const mode = profile?.mode || user?.mode || 'REGULAR';
  const batch = profile?.batch || '01-Jul';

  // Real-time Server-Sent Events (SSE) listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      const streamUrl = api.getAttendanceStreamUrl();
      eventSource = new EventSource(streamUrl);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'attendance_updated') {
            load();
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      };
    } catch (err) {
      console.error('SSE setup error:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api.saveAttendanceSingle(data);
      await load();
      setMessage('Attendance record saved.');
      form.reset();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Filter records by student if teacher views multiple cadets, or ensure student view gets own records
  const filteredRecords = useMemo(() => {
    if (isStudentView) {
      const mySid = profile?.id || user?.student_id || user?.username;
      if (!mySid) return attendance;
      return attendance.filter(
        (r) =>
          r.studentId?.toUpperCase() === mySid.toUpperCase() ||
          r.rollNo === rollNo ||
          (user?.roll_no && r.rollNo === user.roll_no)
      );
    }
    if (selectedStudentFilter === 'All') return attendance;
    return attendance.filter(
      (r) =>
        r.studentId?.toUpperCase() === selectedStudentFilter.toUpperCase() ||
        r.rollNo === selectedStudentFilter
    );
  }, [attendance, isStudentView, profile?.id, user?.student_id, user?.username, rollNo, user?.roll_no, selectedStudentFilter]);

  // Unique student IDs for filter dropdown
  const uniqueStudentIds = useMemo(() => {
    return Array.from(new Set(attendance.map((r) => r.studentId).filter(Boolean)));
  }, [attendance]);

  // 4 Core Attendance Summary Widgets: Present Slots, Absent Slots, Total Slots, Total Attendance
  const { presentSlots, absentSlots, totalSlots, totalAttendance } = useMemo(() => {
    const present = filteredRecords.filter((r) => r.status === 'Present').length;
    const absent = filteredRecords.filter((r) => r.status === 'Absent').length;
    const total = filteredRecords.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      presentSlots: present,
      absentSlots: absent,
      totalSlots: total,
      totalAttendance: rate,
    };
  }, [filteredRecords]);

  // Group records by Date -> Slot 1, Slot 2, Slot 3
  const groupedByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        slot1?: any;
        slot2?: any;
        slot3?: any;
        presentCount: number;
        totalCount: number;
      }
    >();

    filteredRecords.forEach((r) => {
      const d = r.date;
      if (!d) return;

      if (!map.has(d)) {
        map.set(d, {
          date: d,
          presentCount: 0,
          totalCount: 0,
        });
      }

      const row = map.get(d)!;
      const s = (r.slot || '').toLowerCase();

      if (s.includes('1') || s.includes('one')) {
        row.slot1 = r;
      } else if (s.includes('2') || s.includes('two')) {
        row.slot2 = r;
      } else if (s.includes('3') || s.includes('three')) {
        row.slot3 = r;
      } else {
        if (!row.slot1) row.slot1 = r;
        else if (!row.slot2) row.slot2 = r;
        else if (!row.slot3) row.slot3 = r;
      }

      if (r.status === 'Present') row.presentCount++;
      row.totalCount++;
    });

    // Sort descending by date (most recent first)
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredRecords]);

  // Attendance Table Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStudentFilter]);

  const paginatedGroupedByDate = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return groupedByDate.slice(start, start + pageSize);
  }, [groupedByDate, currentPage, pageSize]);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return { iso: dateStr, formatted, dayName };
    } catch {
      return { iso: dateStr, formatted: dateStr, dayName: '' };
    }
  };

  const renderSlotBadge = (record?: any) => {
    if (!record) {
      return (
        <span className="inline-flex items-center text-gray-400 dark:text-gray-500 text-xs italic">
          —
        </span>
      );
    }

    const isPresent = record.status === 'Present';
    return (
      <div className="flex flex-col items-start gap-1">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            isPresent
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}
        >
          {isPresent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          <span>{record.status}</span>
        </span>
        {record.topicOrModule && (
          <span
            className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[190px]"
            title={record.topicOrModule}
          >
            {record.topicOrModule}
          </span>
        )}
      </div>
    );
  };

  const field = (name: string, label: string, type = 'text', value?: string) => (
    <label key={name} className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
      {label}
      <input
        name={name}
        type={type}
        required
        defaultValue={value}
        className="block w-full mt-1 rounded-lg border border-gray-300 dark:border-white/10 p-2 bg-white dark:bg-slate-800 text-sm"
      />
    </label>
  );

  return (
    <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header / Student Profile Banner */}
      {isStudentView ? (
        <div className="bg-gradient-to-r from-primary via-[#2055be] to-[#12387d] rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar with Preview Trigger */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white/30 overflow-hidden bg-white/10 shadow-xl flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={name || 'Student Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white/70" />
                  )}
                </div>

                {/* Quick Preview Button */}
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-white text-primary hover:bg-gray-100 shadow-md transition-transform active:scale-95 cursor-pointer"
                    title="Preview Photo"
                    aria-label="Preview Photo"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* User & Registry Status */}
              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
                    Student Profile
                  </span>
                  {isLeader && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/25 text-amber-300 border border-amber-400/40 shadow-xs">
                      <Award className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>Cadet Squad Leader</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{profile?.verificationStatus || 'Verified'}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90">
                    {batch}
                  </span>
                  {isLeader && user?.assigned_slots && user.assigned_slots.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                      Duty: {user.assigned_slots.join(', ')}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
                  {name}
                </h1>

                <p className="text-xs sm:text-sm text-white/80 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span><strong>Student User ID:</strong> {hardcodedUserId}</span>
                  {rollNo && (
                    <>
                      <span>•</span>
                      <span><strong>Roll No:</strong> {rollNo}</span>
                    </>
                  )}
                  <span>•</span>
                  <span><strong>Program:</strong> {course}</span>
                  <span>•</span>
                  <span><strong>Mode:</strong> {mode}</span>
                </p>
              </div>
            </div>

            {/* Actions: View Profile Button + Attendance Duty Dropdown + Refresh Data */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
              {/* Cadet Leader Duty Dropdown Button */}
              {isLeader && (
                <div className="relative" ref={dutyDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDutyDropdownOpen(!dutyDropdownOpen)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                    title="Cadet Leadership: Slot Attendance Duty Menu"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>Attendance Duty</span>
                    {activeSlot && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-800" />
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dutyDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dutyDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 shadow-2xl p-4 z-50 text-gray-900 dark:text-white space-y-3 animate-fade-in">
                      {/* Menu Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold font-heading uppercase tracking-wider text-gray-900 dark:text-white">
                            Cadet Slot Duty Menu
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">
                          {istTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })} IST
                        </span>
                      </div>

                      {/* Slots List in Dropdown */}
                      <div className="space-y-2">
                        {slotEvaluations.map((slot) => {
                          const isOpen = slot.isActive;
                          const isExpired = slot.isAfter;

                          return (
                            <div
                              key={slot.id}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isOpen
                                  ? 'border-emerald-500/40 bg-emerald-500/10'
                                  : isExpired
                                  ? 'border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] opacity-75'
                                  : 'border-blue-500/20 bg-blue-500/5'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                                      {slot.id}
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                      ({slot.timeRange})
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                    {slot.title.split('—')[1] || slot.title}
                                  </div>
                                </div>

                                <div>
                                  {isOpen ? (
                                    <Link
                                      to={`/dashboard/attendance/${todayStr}/${encodeURIComponent(slot.id)}`}
                                      onClick={() => setDutyDropdownOpen(false)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center gap-1 shadow-xs"
                                    >
                                      <span>Mark</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </Link>
                                  ) : isExpired ? (
                                    <Link
                                      to={`/dashboard/attendance/${todayStr}/${encodeURIComponent(slot.id)}`}
                                      onClick={() => setDutyDropdownOpen(false)}
                                      className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-[10px] font-semibold inline-flex items-center gap-1"
                                    >
                                      <span>Muster</span>
                                      <Lock className="w-2.5 h-2.5" />
                                    </Link>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                      Upcoming
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer notice */}
                      <div className="pt-2 border-t border-gray-100 dark:border-white/10 text-[10px] text-gray-400 text-center font-mono">
                        Slot lock policy: 20-min grace cutoff enforced
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 border border-white/15 backdrop-blur-sm cursor-pointer active:scale-95 disabled:opacity-50"
                title="Refresh Attendance Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                to="/profile"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-primary hover:bg-slate-50 shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 group cursor-pointer"
              >
                <User className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary/70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Teacher / Admin Top Header */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light uppercase tracking-wider">
                {user?.role} Portal
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Sync Active</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white capitalize">
              {user?.role} Portal
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Welcome, <span className="font-semibold text-gray-900 dark:text-white">{user?.full_name || user?.username}</span> • Review and record student drill muster.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {user?.role === 'admin' && (
              <Link
                to="/dashboard"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
            )}
            <button
              type="button"
              onClick={load}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      )}

      {/* CADET LEADERSHIP: SLOT ATTENDANCE DUTY DROPDOWN MODULE */}
      {isLeader && (
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161d27] p-4 sm:p-5 shadow-sm space-y-4">
          
          {/* Header Row: Module badge, Title, Live IST Clock */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    Cadet Leadership Module
                  </span>
                  {activeSlot && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{activeSlot.shortLabel} Open Now</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-heading font-black text-gray-900 dark:text-white mt-0.5">
                  Slot Attendance Duty Console
                </h3>
              </div>
            </div>

            {/* Right: Live IST Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-mono shrink-0 self-start sm:self-center shadow-xs">
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="font-bold text-gray-900 dark:text-white">
                {istTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-gray-400 text-[10px]">IST</span>
            </div>
          </div>

          {/* DROPDOWN SELECTOR & ACTION BAR */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* The Slot Dropdown Selector */}
            <div className="relative flex-1">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center justify-between">
                <span>Select Duty Slot to Mark / Review:</span>
                <span className="text-[10px] font-mono text-gray-400 lowercase font-normal">20m grace cutoff policy</span>
              </label>

              <div className="relative">
                <select
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value as AttendanceSlot)}
                  className="w-full appearance-none pl-3.5 pr-10 py-3 rounded-xl border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-800 text-xs sm:text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors cursor-pointer shadow-xs"
                >
                  {slotEvaluations.map((slot) => {
                    const statusText = slot.isActive
                      ? `🟢 UNLOCKED NOW (Cutoff ${slot.lockLabel} • ${formatCountdown(slot.remainingSec)} left)`
                      : slot.isAfter
                      ? `🔒 LOCKED (Cutoff was ${slot.lockLabel})`
                      : `⏳ UPCOMING (Opens ${slot.timeRange.split('–')[0].trim()})`;
                    return (
                      <option key={slot.id} value={slot.id}>
                        {slot.id}: {slot.title.split('—')[1] || slot.title} — {statusText}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Action Buttons for Selected Slot */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 md:pt-6 shrink-0">
              {selectedSlot?.isActive ? (
                <>
                  <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>{formatCountdown(selectedSlot.remainingSec)} left</span>
                  </div>

                  <Link
                    to={`/dashboard/attendance/${todayStr}/${encodeURIComponent(selectedSlot.id)}`}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Mark {selectedSlot.shortLabel} Attendance</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              ) : selectedSlot?.isAfter ? (
                <>
                  <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Locked at {selectedSlot.lockLabel}</span>
                  </div>

                  <Link
                    to={`/dashboard/attendance/${todayStr}/${encodeURIComponent(selectedSlot.id)}`}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Slot Muster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Opens {selectedSlot?.timeRange.split('–')[0].trim()}</span>
                  </div>

                  <Link
                    to={`/dashboard/attendance/${todayStr}/${encodeURIComponent(selectedSlot?.id || 'Slot 1')}`}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Preview Muster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

          </div>

          {/* Selected Slot Information Bar */}
          {selectedSlot && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{selectedSlot.title}:</span>
                <span className="truncate max-w-md">{selectedSlot.description}</span>
              </div>
              <div className="font-mono text-[11px] text-gray-400 flex items-center gap-3 shrink-0">
                <span>Hours: <strong className="text-gray-700 dark:text-gray-300">{selectedSlot.timeRange}</strong></span>
                <span>•</span>
                <span>Cutoff: <strong className="text-amber-600 dark:text-amber-400">{selectedSlot.lockLabel}</strong></span>
              </div>
            </div>
          )}

          {/* Collapsible 3-Slot Schedule Table Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowScheduleDropdown(!showScheduleDropdown)}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showScheduleDropdown ? 'Hide Daily Slot Schedule' : 'View Full 3-Slot Duty Schedule & Hours'}</span>
              {showScheduleDropdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showScheduleDropdown && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fade-in pt-1">
                {slotEvaluations.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border text-xs ${
                      s.isActive
                        ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : s.isAfter
                        ? 'border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]'
                        : 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-gray-900 dark:text-white">{s.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        s.isActive ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
                        s.isAfter ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {s.isActive ? 'Active' : s.isAfter ? 'Locked' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">{s.title.split('—')[1] || s.title}</p>
                    <div className="mt-2 text-[11px] font-mono text-gray-500 dark:text-gray-400 space-y-0.5">
                      <div>Hours: {s.timeRange}</div>
                      <div>Cutoff: {s.lockLabel}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>
      )}

      {/* Attendance Overview Section Title (For Students & Leaders) */}
      {isStudentView && (
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white">
              Attendance Summary
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time records for drills, ground sessions, and theory classes.
            </p>
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {message && <p role="status" className="text-sm text-green-700 dark:text-green-400">{message}</p>}

      {/* Teacher Form */}
      {user?.role === 'teacher' && (
        <section className="border border-gray-200 dark:border-white/10 rounded-2xl p-5 bg-white dark:bg-[#161d27] shadow-sm">
          <h2 className="text-base font-bold mb-3 text-gray-900 dark:text-white">Record Attendance</h2>
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            {field('student_id', 'Student ID (e.g. 262701)')}
            {field('course', 'Course')}
            {field('date', 'Date', 'date')}
            {field('slot', 'Slot', 'text', 'Slot 1')}
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Status
              <select name="status" className="block w-full mt-1 border border-gray-300 dark:border-white/10 rounded-lg p-2 bg-white dark:bg-slate-800 text-sm">
                <option>Present</option>
                <option>Absent</option>
              </select>
            </label>
            {field('topic_or_module', 'Topic / Module')}
            <div className="sm:col-span-2">
              <button
                disabled={busy}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Save Record'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Teacher Multi-Cadet Filter */}
      {user?.role === 'teacher' && uniqueStudentIds.length > 1 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 shadow-xs">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Filter by Student:</span>
          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="All">All Students ({uniqueStudentIds.length})</option>
            {uniqueStudentIds.map((id) => (
              <option key={id} value={id}>Student ID: {id}</option>
            ))}
          </select>
        </div>
      )}

      {/* 4 CORE ATTENDANCE SUMMARY WIDGETS */}
      {loading ? (
        <SkeletonStats count={4} />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Widget 1: Present Slots */}
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/30 bg-emerald-50/70 dark:bg-emerald-950/20 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Present Slots
              </p>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-emerald-800 dark:text-emerald-300 mt-1">
                <CountUp value={presentSlots} />
              </h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                Sessions attended
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Widget 2: Absent Slots */}
          <div className="p-4 sm:p-5 rounded-2xl border border-red-200/80 dark:border-red-800/30 bg-red-50/70 dark:bg-red-950/20 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider">
                Absent Slots
              </p>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-red-800 dark:text-red-300 mt-1">
                <CountUp value={absentSlots} />
              </h3>
              <p className="text-[11px] text-red-600/80 dark:text-red-400/70 mt-0.5">
                Sessions missed
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <XCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Widget 3: Total Slots */}
          <div className="p-4 sm:p-5 rounded-2xl border border-blue-200/80 dark:border-blue-800/30 bg-blue-50/70 dark:bg-blue-950/20 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-[11px] font-extrabold text-primary dark:text-primary-light uppercase tracking-wider">
                Total Slots
              </p>
              <h3 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white mt-1">
                <CountUp value={totalSlots} />
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Total drill sessions
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Widget 4: Total Attendance */}
          <div className="p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-[#161d27] flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Attendance
                </p>
                <h3 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white mt-1">
                  <CountUp value={totalAttendance} suffix="%" />
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  totalAttendance >= 75
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                }`}
              >
                {totalAttendance >= 75 ? 'Eligible' : 'Warning (<75%)'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalAttendance >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(totalAttendance, 100)}%` }}
              />
            </div>
          </div>

        </section>
      )}

      {/* ATTENDANCE MUSTER TABLE SECTION */}
      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              Attendance Muster
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              <CountUp value={groupedByDate.length} /> {groupedByDate.length === 1 ? 'Date' : 'Dates'} Recorded
            </span>
          </div>

          {groupedByDate.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 rounded-2xl">
              <p className="text-sm">No attendance records found yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200/80 dark:border-white/10 rounded-2xl bg-white dark:bg-[#161d27] shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                
                {/* TABLE HEADERS */}
                <thead className="bg-gray-50/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 uppercase font-extrabold text-[10px] sm:text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 min-w-[160px]">DATE</th>
                    <th className="py-3.5 px-4 min-w-[180px]">SLOT ONE</th>
                    <th className="py-3.5 px-4 min-w-[180px]">SLOT TWO</th>
                    <th className="py-3.5 px-4 min-w-[180px]">SLOT THREE</th>
                    <th className="py-3.5 px-4 text-center min-w-[150px]">TOTAL ATTENDANCE</th>
                  </tr>
                </thead>

                {/* TABLE BODY (GROUPED BY DATE) */}
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {paginatedGroupedByDate.map((row) => {
                    const dInfo = formatDateDisplay(row.date);
                    const dayRate = row.totalCount > 0 ? Math.round((row.presentCount / row.totalCount) * 100) : 0;

                    return (
                      <tr key={row.date} className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors">
                        
                        {/* DATE COLUMN */}
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-heading font-black text-xs sm:text-sm text-gray-900 dark:text-white">
                                {dInfo.iso}
                              </div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                {dInfo.dayName ? `${dInfo.dayName}, ` : ''}{dInfo.formatted}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SLOT ONE */}
                        <td className="py-4 px-4">
                          {renderSlotBadge(row.slot1)}
                        </td>

                        {/* SLOT TWO */}
                        <td className="py-4 px-4">
                          {renderSlotBadge(row.slot2)}
                        </td>

                        {/* SLOT THREE */}
                        <td className="py-4 px-4">
                          {renderSlotBadge(row.slot3)}
                        </td>

                        {/* TOTAL ATTENDANCE FOR THE DAY */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              row.presentCount === 3
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : row.presentCount === 0
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                : 'bg-primary/10 text-primary dark:text-primary-light border border-primary/20'
                            }`}
                          >
                            {row.presentCount === 3 ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : row.presentCount === 0 ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            <span>{row.presentCount}/3 Present ({dayRate}%)</span>
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>

              {/* Table Footer with Demo Pagination Style */}
              <TablePagination
                currentPage={currentPage}
                totalEntries={groupedByDate.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                itemLabel="dates"
              />
            </div>
          )}
        </section>
      )}

      {/* Student Photo Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#161d27] rounded-3xl p-6 max-w-sm w-full border border-gray-200 dark:border-white/10 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white mb-4">
              Student Photo Preview
            </h3>

            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-20 h-20 text-gray-400" />
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="font-bold text-sm text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">User ID: {hardcodedUserId}</p>
            </div>

            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
