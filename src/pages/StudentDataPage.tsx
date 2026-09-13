import { useAuth } from '../context/AuthContext';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download, 
  GraduationCap, 
  CheckCircle2, 
  ChevronRight,
  Flame
} from 'lucide-react';
import { studentsData } from '../data/students';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { toast } from 'sonner';
import { getLoggedStudentCert } from '../lib/studentAuth';

export const StudentDataPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  const isLogged = Boolean(useAuth().user);

  // Filter students based on search query and dropdowns
  const filteredStudents = useMemo(() => {
    return studentsData.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourse === 'All' || student.course === selectedCourse;

      const matchesYear =
        selectedYear === 'All' || student.passingYear === selectedYear;

      return matchesSearch && matchesCourse && matchesYear;
    });
  }, [searchTerm, selectedCourse, selectedYear]);

  const uniqueCourses = ['All', ...Array.from(new Set(studentsData.map((s) => s.course)))];
  const uniqueYears = ['All', ...Array.from(new Set(studentsData.map((s) => s.passingYear)))];

  const handleExportCSV = () => {
    const headers = ['Certificate Number', 'Roll No', 'Name', "Father's Name", 'Course', 'Batch', 'Passing Year', 'Grade', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.certificateNumber,
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
    <div className="py-12 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Alumni Roster"
          title="PASS OUT STUDENT DIRECTORY"
          subtitle="Searchable repository of certified alumni who have successfully completed vocational training and ground drills at CFSI Vadodara."
        />

        {/* Filters and Controls Card */}
        <FlatCard className="p-6 mb-8 border border-gray-200/80 dark:border-white/10 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name, cert no, or roll no..."
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
            <span>Showing <strong>{filteredStudents.length}</strong> of {studentsData.length} pass-out records</span>
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
        <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-sm bg-white dark:bg-[#161d27]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Student Name</th>
                  <th className="py-3.5 px-4 sm:px-6">Certificate No</th>
                  <th className="py-3.5 px-4 sm:px-6">Course Awarded</th>
                  <th className="py-3.5 px-4 sm:px-6">Batch / Year</th>
                  <th className="py-3.5 px-4 sm:px-6">Grade</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
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

                      {/* Certificate No */}
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-primary dark:text-primary-light">
                        {student.certificateNumber}
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

                      {/* Verification Link */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        {isLogged ? (
                          <Link
                            to={`/verify?cert=${encodeURIComponent(student.certificateNumber)}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300/40 hover:bg-emerald-200 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </Link>
                        ) : (
                          <Link
                            to="/login"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            title="Login required to view verified certificate"
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            <span>Login to Verify</span>
                          </Link>
                        )}
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
        </div>

      </div>
    </div>
  );
};
