import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Printer, 
  CheckCircle2 
} from 'lucide-react';
import { StudentVerificationRecord } from '../../types';
import { useStudentData } from '../../context/StudentDataContext';
import { TablePagination } from '../common/TablePagination';

interface CadetDetailModalProps {
  cadet: StudentVerificationRecord | null;
  onClose: () => void;
  onNavigateToAttendance?: (cadet: StudentVerificationRecord) => void;
}

export const CadetDetailModal: React.FC<CadetDetailModalProps> = ({
  cadet,
  onClose,
  onNavigateToAttendance,
}) => {
  const { getStudentAttendanceSummary, getAttendanceByStudent } = useStudentData();
  const [modalAttPage, setModalAttPage] = useState(1);
  const [modalAttPageSize, setModalAttPageSize] = useState(5);

  if (!cadet) return null;

  const summary = getStudentAttendanceSummary(cadet.id);
  const cadetAttRecords = getAttendanceByStudent(cadet.id);
  const paginatedModalRecords = cadetAttRecords.slice(
    (modalAttPage - 1) * modalAttPageSize,
    modalAttPage * modalAttPageSize
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Top Strip */}
        <div className="h-2 w-full bg-primary" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/10 border-2 border-primary/20 shadow-md shrink-0">
                {cadet.photoUrl ? (
                  <img
                    src={cadet.photoUrl}
                    alt={cadet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xl font-black">
                    {cadet.name.charAt(0)}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-tl-lg" title="Verified">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                    {cadet.course}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{cadet.verificationStatus}</span>
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                  {cadet.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Father: <span className="font-semibold text-gray-800 dark:text-gray-200">{cadet.fatherName}</span> • Batch: {cadet.batch}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Student Information & Academic Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Student Information & Academic Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Student ID (Login)</div>
                <div className="font-mono text-xs sm:text-sm font-bold text-primary dark:text-primary-light mt-0.5">
                  {cadet.id}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Roll Number</div>
                <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {cadet.rollNo}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Study Mode</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {cadet.mode || 'REGULAR'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Date of Birth</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {cadet.birthDate || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Gender</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {cadet.gender || 'MALE'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Category</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {cadet.category || 'General'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Aadhaar Number</div>
                <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {cadet.aadharCard || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Phone Number</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {cadet.studentPhone || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Email Address</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                  {cadet.email || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Father's Name</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                  {cadet.fatherName || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                <div className="text-[11px] font-semibold text-gray-400">Mother's Name</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                  {cadet.motherName || 'N/A'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 col-span-2">
                <div className="text-[11px] font-semibold text-gray-400">Campus / Center</div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                  {cadet.centerName || cadet.centerLocation}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 col-span-2">
                <div className="text-[11px] font-semibold text-gray-400">Current Address</div>
                <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                  {cadet.presentAddress || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Attendance Records & History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Attendance Records & History</span>
              </h3>
              {onNavigateToAttendance && (
                <button
                  type="button"
                  onClick={() => onNavigateToAttendance(cadet)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mark Attendance for Student</span>
                </button>
              )}
            </div>

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
                  <div className="text-[11px] text-gray-500">Total Sessions</div>
                  <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                    {summary.total}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Present Sessions</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {summary.present}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 dark:bg-white/5 border border-red-500/10">
                  <div className="text-[11px] text-red-600 dark:text-red-400">Absent Sessions</div>
                  <div className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5">
                    {summary.absent}
                  </div>
                </div>
              </div>

              {/* Compliance Bar */}
              {summary.total > 0 ? (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-gray-600 dark:text-gray-300">Overall Attendance Target (75%)</span>
                    <span className={summary.percentage >= 75 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                      {summary.percentage >= 75 ? 'Meets 75% Target' : 'Below 75% Target'}
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
                    No attendance recorded for this student yet.
                  </p>
                </div>
              )}

              {/* Recent Log Table if any */}
              {cadetAttRecords.length > 0 && (
                <div className="rounded-xl border border-gray-200/60 dark:border-white/10 overflow-hidden">
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-bold text-gray-400 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Session</th>
                          <th className="py-2 px-3">Topic / Activity</th>
                          <th className="py-2 px-3 text-center">Status</th>
                          <th className="py-2 px-3">Instructor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {paginatedModalRecords.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{r.date}</td>
                            <td className="py-2 px-3 text-primary font-bold">{r.slot || 'Session 1'}</td>
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

                  <TablePagination
                    currentPage={modalAttPage}
                    totalEntries={cadetAttRecords.length}
                    pageSize={modalAttPageSize}
                    onPageChange={setModalAttPage}
                    onPageSizeChange={setModalAttPageSize}
                    pageSizeOptions={[5, 10, 20]}
                    itemLabel="sessions"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Student Profile</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
