import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Phone, 
  ShieldAlert, 
  Flame, 
  ArrowLeft, 
  Newspaper, 
  Camera, 
  Video, 
  Compass,
  LifeBuoy
} from 'lucide-react';
import { FlatCard } from '../components/common/FlatCard';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { name: 'Recognized Courses', path: '/courses', icon: BookOpen },
    { name: 'Cadet Portal Login', path: '/student-login', icon: GraduationCap },
    { name: 'Press & Circulars', path: '/news', icon: Newspaper },
    { name: 'Drill Video Gallery', path: '/gallery/videos', icon: Video },
    { name: 'Photo Gallery', path: '/gallery/images', icon: Camera },
    { name: 'Campus Desk', path: '/contact', icon: Phone },
  ];

  return (
    <div className="relative py-12 sm:py-20 lg:py-24 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-[85vh] flex items-center justify-center w-full max-w-full overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[32rem] h-96 sm:h-[32rem] bg-gradient-to-tr from-primary/15 via-accent/15 to-fire-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Incident Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent border border-accent/25 shadow-xs mb-6"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Incident 404 • Sector Coordinates Not Found</span>
        </motion.div>

        {/* 404 Large Visual Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative inline-flex items-center justify-center mb-6"
        >
          {/* Big Background 404 Number */}
          <span className="font-heading font-black text-8xl sm:text-9xl md:text-[11rem] leading-none select-none tracking-tighter bg-gradient-to-b from-gray-200 via-gray-300 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent bg-clip-text text-transparent">
            404
          </span>

          {/* Foreground Floating Fire Emblem */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-primary via-[#2463da] to-accent flex items-center justify-center text-white shadow-2xl shadow-primary/30 border border-white/20">
              <Compass className="w-12 h-12 sm:w-14 sm:h-14 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent-light animate-bounce" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3 max-w-2xl mx-auto mb-8 sm:mb-10"
        >
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
            LOST IN THE SMOKE
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
            The training dispatch, syllabus record, or page coordinates you are looking for have been relocated, extinguished, or never existed in the Central Fire Safety Institute registry.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12"
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-white transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all transform hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Base</span>
          </Link>

          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>View Programs</span>
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold border border-gray-200 dark:border-white/15 hover:border-primary/50 text-gray-700 dark:text-gray-300 hover:text-primary transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Campus Desk</span>
          </Link>
        </motion.div>

        {/* Quick Dispatch Directory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div className="p-5 sm:p-6 rounded-2xl bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center justify-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-primary" />
              <span>Recommended Active Sectors</span>
            </h3>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 hover:border-primary/50 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-all shadow-xs"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Helpline Footer */}
            <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-white/5 flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <LifeBuoy className="w-3.5 h-3.5 text-accent" />
              <span>
                Need urgent admission assistance? Call our Vadodara Campus:{' '}
                <a href="tel:+919428524040" className="font-bold text-gray-800 dark:text-gray-200 hover:text-primary underline">
                  +91 94285 24040
                </a>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
