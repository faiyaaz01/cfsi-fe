import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

export const StudentPortalBanner: React.FC = () => {
  return (
    <section className="py-8 bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1648a8] via-primary to-[#0f3478] p-6 sm:p-8 md:p-10 text-white shadow-xl">
            
            {/* Background geometric accents */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
            <div className="absolute top-0 right-1/4 w-32 h-32 rounded-full bg-accent/20 pointer-events-none blur-xl" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              
              {/* Left Content */}
              <div className="max-w-2xl space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Cadet Academic Portal</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
                  Check Live Drill Attendance & Training Records
                </h3>

                <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                  Cadets can log in to view real-time ground drill muster records, breathing apparatus evaluations, and official training logs.
                </p>

                {/* Feature checklist */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-white/90 font-medium">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Real-time Attendance %</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Physical Drill Muster Logs</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Attendance Records & Dossier</span>
                  </span>
                </div>
              </div>

              {/* Right CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-gray-900 bg-white hover:bg-amber-300 transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
                >
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>Cadet Portal Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>Explore Courses</span>
                </Link>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};
