import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldAlert, Award, HardHat, Clock, GraduationCap, IndianRupee, CheckCircle2, ArrowRight, Activity, Briefcase, BookOpen } from 'lucide-react';
import { Course } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { CourseModal } from '../components/home/CourseModal';
import { Link, useParams } from 'react-router-dom';
import { useWebContent } from '../context/WebContentContext';

const iconMap: Record<string, React.ElementType> = {
  Flame: Flame,
  ShieldAlert: ShieldAlert,
  Award: Award,
  HardHat: HardHat,
};

export const CoursesPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [selectedCourseModal, setSelectedCourseModal] = useState<Course | null>(null);
  const { courses } = useWebContent();

  // If a slug is specified in URL, highlight or pre-open that course
  const activeCourseFromSlug = slug ? courses.find((c) => c.slug === slug) : null;

  return (
    <div className="py-10 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Career Programs"
          title="GOVERNMENT & AIIFTSM RECOGNIZED COURSES"
          subtitle="Comprehensive vocational programs crafted for students seeking immediate placement in municipal fire brigades, chemical corridors, refineries, and corporate safety divisions."
        />

        {courses.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-4 sm:px-6 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 max-w-2xl mx-auto my-10 sm:my-12">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-gray-900 dark:text-white mb-2">
              Academic Curriculum Under Review
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed max-w-lg mx-auto">
              Our educational programs and curriculum updates for the upcoming intake are being uploaded by the institute administration. Please check back shortly or reach out to our admission cell.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
              >
                <span>Contact Admissions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-all"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Detailed Course Sections */
          <div className="space-y-8 sm:space-y-12 mb-12 sm:mb-16">
            {courses.map((course, index) => {
              const Icon = iconMap[course.icon] || Flame;
              const isHighlight = activeCourseFromSlug?.id === course.id;

              return (
                <motion.div
                  key={course.id}
                  id={course.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <FlatCard
                    className={`p-4 xs:p-6 sm:p-8 lg:p-10 border transition-all duration-300 ${
                      isHighlight
                        ? 'border-accent ring-2 ring-accent/30 shadow-2xl'
                        : 'border-gray-200/80 dark:border-white/10'
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                      
                      {/* Left Details */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {course.badge && (
                            <span className="text-[10px] xs:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent text-white shadow-sm">
                              {course.badge}
                            </span>
                          )}
                          <span className="text-[10px] xs:text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                            Code: {course.id.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light shrink-0">
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h2 className="text-xl xs:text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white break-words">
                            {course.title}
                          </h2>
                        </div>

                        {course.fullDescription && (
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            {course.fullDescription}
                          </p>
                        )}

                        {/* Practical Syllabus Grid */}
                        {course.syllabus && course.syllabus.length > 0 && (
                          <div className="pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-3 bg-primary rounded-full" />
                              <span>Core Syllabus Modules & Ground Drills:</span>
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {course.syllabus.map((s, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                  <span>{s}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Physical standards (if any) */}
                        {course.physicalRequirements && course.physicalRequirements.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs">
                            <div className="font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-amber-600" />
                              <span>Physical Fitness Standards:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-700 dark:text-gray-300">
                              {course.physicalRequirements.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Right Card: Quick Facts & Apply Box */}
                      <div className="lg:col-span-5 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 space-y-5">
                        <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-3">
                          Program Quick Overview
                        </h3>

                        <div className="space-y-3 text-xs sm:text-sm">
                          {course.duration && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>Duration:</span>
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white">{course.duration}</span>
                            </div>
                          )}

                          {course.eligibility && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <GraduationCap className="w-4 h-4 text-accent" />
                                <span>Eligibility:</span>
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white">{course.eligibility}</span>
                            </div>
                          )}

                          {course.fee && (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                <IndianRupee className="w-4 h-4 text-emerald-500" />
                                <span>Total Fee:</span>
                              </span>
                              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                {course.fee}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Career Opportunities */}
                        {course.careerOpportunities && course.careerOpportunities.length > 0 && (
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-accent" />
                              <span>Placement Roles:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {course.careerOpportunities.map((c, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 border border-gray-200/80 dark:border-white/10"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 space-y-2">
                          <Link
                            to="/contact"
                            className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-accent hover:bg-accent-hover shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                          >
                            <span>Apply for Admission</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setSelectedCourseModal(course)}
                            className="w-full py-2.5 rounded-xl font-semibold text-xs text-gray-700 dark:text-gray-300 bg-gray-200/80 dark:bg-white/10 hover:bg-gray-300 transition-colors"
                          >
                            View Full Prospectus Modal
                          </button>
                        </div>
                      </div>

                    </div>
                  </FlatCard>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Link to Alumni Pass Out Data */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
              Want to check pass-out student records & alumni database?
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Search our student directory by student ID, batch year, and course.
            </p>
          </div>
          <Link
            to="/student-data"
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-dark shadow-md transition-all shrink-0"
          >
            Open Student Directory
          </Link>
        </div>

        {/* Modal */}
        <CourseModal
          course={selectedCourseModal}
          onClose={() => setSelectedCourseModal(null)}
        />

      </div>
    </div>
  );
};
