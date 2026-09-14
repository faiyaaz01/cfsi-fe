import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  LogOut, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Printer, 
  User, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Radio,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { getLoggedStudent, logoutStudent } from '../lib/studentAuth';
import { useStudentData } from '../context/StudentDataContext';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { CountUp } from '../components/common/CountUp';
import { TablePagination } from '../components/common/TablePagination';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const student = getLoggedStudent();
  const { getAttendanceByStudent, getStudentAttendanceSummary } = useStudentData();

  const [attendanceFilter, setAttendanceFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  // If not authenticated, redirect to /student-login
  if (!student) {
    return <Navigate to="/student-login" replace />;
  }

  const attendanceRecords = getAttendanceByStudent(student.id);
  const summary = getStudentAttendanceSummary(student.id);

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

    attendanceRecords.forEach((r) => {
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

    const list = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
    if (attendanceFilter === 'All') return list;
    if (attendanceFilter === 'Present') return list.filter((l) => l.presentCount > 0);
    return list.filter((l) => l.presentCount < l.totalCount);
  }, [attendanceRecords, attendanceFilter]);

  // Attendance Table Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [attendanceFilter]);

  const paginatedGroupedByDate = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return groupedByDate.slice(start, start + pageSize);
  }, [groupedByDate, currentPage, pageSize]);

  const handleLogout = () => {
    logoutStudent();
    toast.info('Signed out of Student Portal');
    navigate('/student-login');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-10 sm:py-14 bg-gray-50 dark:bg-dark-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Card */}
        <div className="mb-8">
          <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-md relative overflow-hidden">
            
            {/* Top accent line */}
            <div className="h-1.5 w-full bg-primary absolute top-0 left-0" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-1">
              
              {/* Cadet Info */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-200 dark:bg-white/10 p-0.5 border border-primary/20 shadow-md shrink-0">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-tl-lg text-white" title="Verified Student">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-white shadow-sm">
                      {student.course}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                      {student.batch}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
                    {student.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                    <span>
                      Roll No: <span className="font-bold text-gray-900 dark:text-white font-mono">{student.rollNo}</span>
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span>
                      Student ID: <span className="font-bold text-primary dark:text-primary-light font-mono">{student.id}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center w-full sm:w-auto">

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors"
                  title="Print Report Card"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          </FlatCard>
        </div>

        {/* ATTENDANCE SECTION */}
        <div className="space-y-6">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Present Slots */}
              <GlassCard hoverEffect={false} className="p-5 border border-emerald-200/70 dark:border-emerald-800/30 bg-emerald-50/40 dark:bg-emerald-950/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Present Slots</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400">
                  <CountUp value={summary.present} />
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Sessions attended</div>
              </GlassCard>

              {/* Absent Slots */}
              <GlassCard hoverEffect={false} className="p-5 border border-red-200/70 dark:border-red-800/30 bg-red-50/40 dark:bg-red-950/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-500">Absent Slots</span>
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-red-600 dark:text-red-400">
                  <CountUp value={summary.absent} />
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Sessions missed</div>
              </GlassCard>

              {/* Total Slots */}
              <GlassCard hoverEffect={false} className="p-5 border border-gray-200/70 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Slots</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white">
                  <CountUp value={summary.total} />
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Total drill sessions</div>
              </GlassCard>

              {/* Total Attendance */}
              <GlassCard hoverEffect={false} className="p-5 border border-gray-200/70 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Total Attendance</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <CountUp value={summary.percentage} suffix="%" />
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                    summary.percentage >= 75
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-red-500/10 text-red-600'
                  }`}>
                    {summary.percentage >= 75 ? 'Eligible' : 'Warning (<75%)'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      summary.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                  />
                </div>
              </GlassCard>

            </div>

            {/* Attendance List Card */}
            <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                      Attendance Muster
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>Live Sync Active</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Official biometric & roll-call records verified by CFSI instructors • Showing <span className="font-bold text-gray-700 dark:text-gray-200"><CountUp value={groupedByDate.length} /></span> drill date{groupedByDate.length === 1 ? '' : 's'}.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                  {(['All', 'Present', 'Absent'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setAttendanceFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        attendanceFilter === filter
                          ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {groupedByDate.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No attendance records found matching "{attendanceFilter}".</p>
                </div>
              ) : (
                <div className="border border-gray-200/80 dark:border-white/10 rounded-2xl bg-white dark:bg-[#161d27] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50/90 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 uppercase font-extrabold text-[10px] sm:text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4 min-w-[160px]">DATE</th>
                        <th className="py-3.5 px-4 min-w-[180px]">SLOT ONE</th>
                        <th className="py-3.5 px-4 min-w-[180px]">SLOT TWO</th>
                        <th className="py-3.5 px-4 min-w-[180px]">SLOT THREE</th>
                        <th className="py-3.5 px-4 text-center min-w-[150px]">TOTAL ATTENDANCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {paginatedGroupedByDate.map((row) => {
                        const dayRate = row.totalCount > 0 ? Math.round((row.presentCount / row.totalCount) * 100) : 0;
                        const renderSlotItem = (slotRec?: any) => {
                          if (!slotRec) {
                            return <span className="text-gray-400 dark:text-gray-500 text-xs italic">—</span>;
                          }
                          const isPresent = slotRec.status === 'Present';
                          return (
                            <div className="flex flex-col items-start gap-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isPresent
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                              }`}>
                                {isPresent ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                <span>{slotRec.status}</span>
                              </span>
                              {slotRec.topicOrModule && (
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[190px]" title={slotRec.topicOrModule}>
                                  {slotRec.topicOrModule}
                                </span>
                              )}
                            </div>
                          );
                        };

                        return (
                          <tr key={row.date} className="hover:bg-gray-50/70 dark:hover:bg-white/5 transition-colors">
                            {/* DATE */}
                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <span className="font-heading font-black text-xs sm:text-sm">{row.date}</span>
                              </div>
                            </td>

                            {/* SLOT ONE */}
                            <td className="py-4 px-4">
                              {renderSlotItem(row.slot1)}
                            </td>

                            {/* SLOT TWO */}
                            <td className="py-4 px-4">
                              {renderSlotItem(row.slot2)}
                            </td>

                            {/* SLOT THREE */}
                            <td className="py-4 px-4">
                              {renderSlotItem(row.slot3)}
                            </td>

                            {/* TOTAL ATTENDANCE */}
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
                </div>

                {/* Table Footer with Demo Pagination Style */}
                <TablePagination
                  currentPage={currentPage}
                  totalEntries={groupedByDate.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[10, 25, 50, 100]}
                  itemLabel="days"
                />
              </div>
            )}
            </FlatCard>
          </div>

      </div>
    </div>
  );
};
