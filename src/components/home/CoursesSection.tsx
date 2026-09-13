import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, ShieldAlert, Award, HardHat, Clock, GraduationCap, IndianRupee, ArrowRight, CheckCircle2 } from 'lucide-react';
import { coursesData } from '../../data/courses';
import { Course } from '../../types';
import { SectionHeading } from '../common/SectionHeading';
import { FlatCard } from '../common/FlatCard';
import { CourseModal } from './CourseModal';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ElementType> = {
  Flame: Flame,
  ShieldAlert: ShieldAlert,
  Award: Award,
  HardHat: HardHat,
};

export const CoursesSection: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <section id="courses" className="py-16 sm:py-24 bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          badge="Professional Curriculum"
          title="OUR COURSES"
          subtitle="Government-recognized fire engineering and industrial safety certifications designed for high-demand municipal and corporate careers."
        />

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {coursesData.map((course, index) => {
            const IconComponent = iconMap[course.icon] || Flame;

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
              >
                <FlatCard className="h-full flex flex-col justify-between p-6 group border border-gray-200/80 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 relative overflow-hidden">
                  
                  {/* Subtle top accent border line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    {/* Badge */}
                    {course.badge && (
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent dark:bg-accent/20 mb-4">
                        {course.badge}
                      </span>
                    )}

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white leading-tight">
                        {course.title}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-5 leading-relaxed">
                      {course.shortDescription}
                    </p>

                    {/* Meta specifics */}
                    <div className="space-y-2 py-3 border-y border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>Duration:</span>
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-accent" />
                          <span>Eligibility:</span>
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[140px]" title={course.eligibility}>
                          {course.eligibility}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-medium">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Fee:</span>
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          {course.fee}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-200 text-center"
                    >
                      Learn More
                    </button>
                    <Link
                      to="/contact"
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-all duration-200 flex items-center justify-center gap-1"
                      title="Apply for admission"
                    >
                      <span>Apply</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                </FlatCard>
              </motion.div>
            );
          })}
        </div>

        {/* Modal for detailed curriculum */}
        <CourseModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />

      </div>
    </section>
  );
};
