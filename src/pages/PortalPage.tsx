import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StudentProfile } from '../types';
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
  X
} from 'lucide-react';
import { CountUp } from '../components/common/CountUp';
import { SkeletonStats, SkeletonTable } from '../components/common/Skeleton';
import { TablePagination } from '../components/common/TablePagination';

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

  const load = async () => {
    try {
      const a = await api.getAttendance();
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
    if (user?.role === 'student') {
      api.getStudentProfile()
        .then((p) => setProfile(p))
        .catch(() => {
          // Gracefully fallback to user object
        });
    }
  }, [user?.id, user?.role]);

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

  // Filter records by student if teacher views multiple cadets
  const filteredRecords = useMemo(() => {
    if (selectedStudentFilter === 'All') return attendance;
    return attendance.filter(
      (r) =>
        r.studentId?.toUpperCase() === selectedStudentFilter.toUpperCase() ||
        r.rollNo === selectedStudentFilter
    );
  }, [attendance, selectedStudentFilter]);

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
      {user?.role === 'student' ? (
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
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{profile?.verificationStatus || 'Verified'}</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90">
                    {batch}
                  </span>
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

            {/* Actions: View Profile Button + Refresh Data */}
            <div className="flex items-center justify-center lg:justify-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
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

      {/* Attendance Overview Section Title (For Students) */}
      {user?.role === 'student' && (
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
