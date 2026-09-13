import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  IndianRupee, 
  ShieldCheck, 
  Briefcase, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { Course } from '../../types';
import { Link } from 'react-router-dom';

interface CourseModalProps {
  course: Course | null;
  onClose: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({ course, onClose }) => {
  if (!course) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        
        {/* Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-10 p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="pr-8">
            {course.badge && (
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-accent/10 text-accent dark:bg-accent/20 mb-2">
                {course.badge}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white">
              {course.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {course.fullDescription}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Duration</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-1">
                {course.duration}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-accent" />
                <span>Eligibility</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-1 line-clamp-1" title={course.eligibility}>
                {course.eligibility}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                <span>Course Fee</span>
              </div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {course.fee}
              </div>
            </div>
          </div>

          {/* Syllabus Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-primary rounded-full" />
              <span>Course Curriculum & Practical Modules</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {course.syllabus.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Standards (if any) */}
          {course.physicalRequirements && course.physicalRequirements.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>Mandatory Physical & Fitness Standards</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                {course.physicalRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Career Opportunities */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-accent" />
              <span>Career & Job Prospects</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.careerOpportunities.map((career, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Affiliation: </span>
              {course.certificationBody}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <Link
                to="/contact"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-hover shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Apply for this Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
};
