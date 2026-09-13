import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  LogOut, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Award, 
  BookOpen, 
  Clock, 
  FileText, 
  Printer, 
  ShieldCheck, 
  User, 
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { getLoggedStudent, logoutStudent } from '../lib/studentAuth';
import { useStudentData } from '../context/StudentDataContext';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const student = getLoggedStudent();
  const { getAttendanceByStudent, getResultsByStudent, getStudentAttendanceSummary } = useStudentData();

  const [activeTab, setActiveTab] = useState<'attendance' | 'results'>('attendance');
  const [attendanceFilter, setAttendanceFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  // If not authenticated, redirect to /login
  if (!student) {
    return <Navigate to="/login" replace />;
  }

  const attendanceRecords = getAttendanceByStudent(student.certificateNumber);
  const resultsRecords = getResultsByStudent(student.certificateNumber);
  const summary = getStudentAttendanceSummary(student.certificateNumber);

  // Filtered attendance records
  const filteredAttendance = attendanceRecords.filter((rec) => {
    if (attendanceFilter === 'All') return true;
    return rec.status === attendanceFilter;
  });

  // Calculate totals for results
  const totalMarksObtained = resultsRecords.reduce((acc, curr) => acc + curr.marksObtained, 0);
  const totalMaxMarks = resultsRecords.reduce((acc, curr) => acc + curr.maxMarks, 0);
  const overallResultPercentage = totalMaxMarks > 0 
    ? Math.round((totalMarksObtained / totalMaxMarks) * 1000) / 10 
    : 0;

  const handleLogout = () => {
    logoutStudent();
    toast.info('Signed out of Student Portal');
    navigate('/login');
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
                  <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 rounded-tl-lg text-white" title="Verified Cadet">
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
                      Cert No: <span className="font-bold text-primary dark:text-primary-light font-mono">{student.certificateNumber}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 self-end md:self-center w-full sm:w-auto">
                <Link
                  to={`/verify?cert=${encodeURIComponent(student.certificateNumber)}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Certificate</span>
                </Link>

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

        {/* Tab Selection */}
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'attendance'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Attendance</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'attendance' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-white/10'
            }`}>
              {summary.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'results'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>My Results</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'results' ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-white/10'
            }`}>
              {resultsRecords.length}
            </span>
          </button>
        </div>

        {/* TAB 1: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              {/* Total Classes */}
              <GlassCard hoverEffect={false} className="p-5 border border-gray-200/70 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Classes</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white">
                  {summary.total}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Ground & theory sessions</div>
              </GlassCard>

              {/* Present Days */}
              <GlassCard hoverEffect={false} className="p-5 border border-gray-200/70 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Present Days</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400">
                  {summary.present}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Active attendance marked</div>
              </GlassCard>

              {/* Absent Days */}
              <GlassCard hoverEffect={false} className="p-5 border border-gray-200/70 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-500">Absent Days</span>
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-red-600 dark:text-red-400">
                  {summary.absent}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Missed sessions</div>
              </GlassCard>

              {/* Overall Percentage */}
              <GlassCard hoverEffect={false} className="p-5 border border-gray-200/70 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Attendance Rate</span>
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{summary.percentage}%</span>
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
                  <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                    Daily Ground Drill & Class Muster
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Official biometric & roll-call records verified by CFSI instructors.
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

              {filteredAttendance.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">No attendance records found matching "{attendanceFilter}".</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Slot / Session</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4">Practical Drill / Module</th>
                        <th className="py-3 px-4">Instructor Feedback / Notes</th>
                        <th className="py-3 px-3">Instructor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {filteredAttendance.map((rec) => (
                        <tr key={rec.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20">
                              {rec.slot || 'Slot 1'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                              rec.status === 'Present'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            }`}>
                              {rec.status === 'Present' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span>{rec.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                            {rec.topicOrModule || 'Tactical Drill Training'}
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 italic">
                            {rec.remarks || 'Standard protocol complied'}
                          </td>
                          <td className="py-3.5 px-3 text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">
                            {rec.markedBy || 'CFSI Training Wing'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </FlatCard>
          </div>
        )}

        {/* TAB 2: RESULTS */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Overall Performance Card */}
            <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-md">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Academic Evaluation</span>
                  <h2 className="text-2xl font-heading font-black text-gray-900 dark:text-white mt-1">
                    Official Examination Transcript
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Course: <span className="font-bold text-gray-800 dark:text-gray-200">{student.course}</span> • Certified by IFSMA
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Aggregate Marks */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-center min-w-[120px]">
                    <div className="text-[10px] uppercase font-bold text-gray-400">Total Marks</div>
                    <div className="text-xl font-heading font-black text-gray-900 dark:text-white mt-0.5">
                      {totalMarksObtained} <span className="text-xs text-gray-400 font-normal">/ {totalMaxMarks}</span>
                    </div>
                  </div>

                  {/* Percentage */}
                  <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-center min-w-[120px]">
                    <div className="text-[10px] uppercase font-bold text-primary dark:text-primary-light">Aggregate</div>
                    <div className="text-xl font-heading font-black text-primary dark:text-primary-light mt-0.5">
                      {overallResultPercentage}%
                    </div>
                  </div>

                  {/* Official Grade */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[120px]">
                    <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Final Grade</div>
                    <div className="text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {student.grade.split(' ')[0] || 'Pass'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>Subject-Wise Marks & Practical Grading</span>
                  </h3>
                  <span className="text-xs text-gray-400">{resultsRecords.length} Subjects Evaluated</span>
                </div>

                {resultsRecords.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No examination results recorded yet for this cadet.</p>
                    <p className="text-xs text-gray-400 mt-1">Evaluations will appear here after end-of-term assessments.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 text-gray-400 uppercase tracking-wider font-extrabold text-[10px]">
                          <th className="py-3 px-3">Subject / Paper</th>
                          <th className="py-3 px-3">Evaluation Cycle</th>
                          <th className="py-3 px-3 text-center">Marks Obtained</th>
                          <th className="py-3 px-3 text-center">Max Marks</th>
                          <th className="py-3 px-3 text-center">Score %</th>
                          <th className="py-3 px-3 text-center">Grade</th>
                          <th className="py-3 px-4">Examiner Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {resultsRecords.map((item) => {
                          const pct = item.maxMarks > 0 ? Math.round((item.marksObtained / item.maxMarks) * 100) : 0;
                          return (
                            <tr key={item.id} className="hover:bg-gray-50/80 dark:hover:bg-white/5 transition-colors">
                              <td className="py-3.5 px-3 font-bold text-gray-900 dark:text-white">
                                {item.subject}
                              </td>
                              <td className="py-3.5 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {item.semesterOrTerm || 'Final Board Exam'}
                              </td>
                              <td className="py-3.5 px-3 font-black text-center text-gray-900 dark:text-white font-mono text-sm">
                                {item.marksObtained}
                              </td>
                              <td className="py-3.5 px-3 text-center text-gray-400 font-mono">
                                {item.maxMarks}
                              </td>
                              <td className="py-3.5 px-3 text-center font-bold font-mono text-primary">
                                {pct}%
                              </td>
                              <td className="py-3.5 px-3 text-center">
                                <span className="inline-flex px-2.5 py-0.5 rounded-md font-bold text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                                  {item.grade}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 italic">
                                {item.remarks || 'Satisfactory tactical proficiency'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Institute Seal and Disclaimer */}
              <div className="mt-8 pt-5 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Officially attested by Board of Examination, CFSI Vadodara Main Campus</span>
                </div>
                <div className="text-right">
                  <span>Pass Out Student Roster: </span>
                  <Link to="/student-data" className="text-primary hover:underline font-semibold">
                    View Complete Batch List
                  </Link>
                </div>
              </div>

            </FlatCard>
          </div>
        )}

      </div>
    </div>
  );
};
