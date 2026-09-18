import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  GraduationCap, 
  CheckCircle2, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { api } from '../lib/api';
import { StudentVerificationRecord } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { toast } from 'sonner';
import { CountUp } from '../components/common/CountUp';
import { SkeletonTable } from '../components/common/Skeleton';
import { TablePagination } from '../components/common/TablePagination';

export const StudentDataPage: React.FC = () => {
  const [students, setStudents] = useState<StudentVerificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    api.getStudents()
      .then((data) => setStudents(data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter students based on search query and dropdowns
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourse === 'All' || student.course === selectedCourse;

      const matchesYear =
        selectedYear === 'All' || student.passingYear === selectedYear;

      return matchesSearch && matchesCourse && matchesYear;
    });
  }, [students, searchTerm, selectedCourse, selectedYear]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCourse, selectedYear]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const uniqueCourses = ['All', ...Array.from(new Set(students.map((s) => s.course)))];
  const uniqueYears = ['All', ...Array.from(new Set(students.map((s) => s.passingYear)))];

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Roll No', 'Name', "Father's Name", 'Course', 'Batch', 'Passing Year', 'Grade', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.id,
      s.rollNo,
      s.name,
      s.fatherName,
      s.course,
      s.batch,
      s.passingYear,
      s.grade,
      s.verificationStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cfsi_passout_students_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Alumni Roster Exported to CSV');
  };

  return (
    <div className="py-10 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Alumni Roster"
          title="PASS OUT STUDENT DIRECTORY"
          subtitle="Searchable repository of alumni and students who have successfully completed vocational training and ground drills at CFSI Vadodara."
        />

        {/* Filters and Controls Card */}
        <FlatCard className="p-4 xs:p-6 mb-8 border border-gray-200/80 dark:border-white/10 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, ID, or roll no..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Course Filter */}
            <div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {uniqueCourses.map((course) => (
                  <option key={course} value={course}>
                    {course === 'All' ? 'All Courses' : course}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter & Export */}
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year === 'All' ? 'All Years' : `Year ${year}`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportCSV}
                title="Download CSV roster"
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Showing <strong><CountUp value={filteredStudents.length} /></strong> of <CountUp value={students.length} /> pass-out records
            </span>
            {(searchTerm || selectedCourse !== 'All' || selectedYear !== 'All') && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSelectedCourse('All'); setSelectedYear('All'); }}
                className="text-accent hover:underline font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </FlatCard>

        {/* Responsive Table Container */}
        {loading ? (
          <SkeletonTable rows={8} cols={6} />
        ) : (
          <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-sm bg-white dark:bg-[#161d27]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 sm:px-6">Student Name</th>
                    <th className="py-3.5 px-4 sm:px-6">Student ID</th>
                    <th className="py-3.5 px-4 sm:px-6">Course Awarded</th>
                    <th className="py-3.5 px-4 sm:px-6">Batch / Year</th>
                    <th className="py-3.5 px-4 sm:px-6">Grade</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {filteredStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-white/10"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Roll: {student.rollNo}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-primary dark:text-primary-light">
                        {student.id}
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4 sm:px-6 font-semibold">
                        {student.course}
                      </td>

                      {/* Batch / Year */}
                      <td className="py-3.5 px-4 sm:px-6 text-xs text-gray-500 dark:text-gray-400">
                        {student.batch} ({student.passingYear})
                      </td>

                      {/* Grade */}
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-600 dark:text-emerald-400">
                        {student.grade}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{student.verificationStatus || 'Verified'}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                      No student records match your query. Try broadening your search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Demo Pagination Style */}
          <TablePagination
            currentPage={currentPage}
            totalEntries={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            itemLabel="students"
          />
        </div>
      )}

      </div>
    </div>
  );
};
