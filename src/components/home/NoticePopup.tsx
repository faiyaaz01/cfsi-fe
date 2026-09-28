import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, GraduationCap, CalendarDays, MapPin } from 'lucide-react';
import { useWebContent } from '../../context/WebContentContext';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export const NoticePopup: React.FC = () => {
  const { homePageConfig } = useWebContent();
  const [isDismissed, setIsDismissed] = useState(false);

  // Show immediately if enabled in current config without an artificial delay
  const showNotice = Boolean(homePageConfig?.showNoticeBanner);
  const noticeText = homePageConfig?.noticeBannerText || '';
  const noticeBadge = homePageConfig?.noticeBannerBadge || 'Notice';

  const visible = showNotice && !isDismissed;

  // Prevent background page from scrolling while notice popup is visible
  useBodyScrollLock(visible);

  const dismiss = () => {
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notice-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[999] bg-black/55 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Popup wrapper — flex center for reliable alignment */}
          <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <motion.div
            key="notice-popup"
            initial={{ opacity: 0, scale: 0.85, y: -30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-[95vw] max-w-xl pointer-events-auto"
          >
            <div className="rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.45)] border border-white/10">

              {/* Red Header */}
              <div className="relative bg-gradient-to-br from-red-600 via-red-600 to-red-700 px-7 pt-8 pb-10">

                {/* Close button */}
                <button
                  onClick={dismiss}
                  type="button"
                  aria-label="Close"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Badge */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-widest">
                    <Megaphone className="w-3.5 h-3.5" />
                    {noticeBadge}
                  </span>
                </div>

                {/* Main notice text */}
                <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight">
                  {noticeText}
                </h2>

                {/* Decorative dots */}
                <div className="absolute bottom-4 right-6 flex gap-1.5 opacity-30">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
                  ))}
                </div>
              </div>

              {/* White body */}
              <div className="bg-white dark:bg-[#1a2232] px-7 py-6 flex flex-col gap-4">

                {/* Info pills */}
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-bold border border-red-100 dark:border-red-800/40">
                    <GraduationCap className="w-4 h-4" />
                    Admissions Open
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-800/40">
                    <CalendarDays className="w-4 h-4" />
                    Batch 2026
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-100 dark:border-emerald-800/40">
                    <MapPin className="w-4 h-4" />
                    Vadodara, Gujarat
                  </span>
                </div>

                {/* Sub note */}
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Limited seats available. Government-recognized certificate & diploma programs in Fire Safety Engineering and Industrial Safety Management.
                </p>

                {/* Close button row */}
                <div className="pt-1">
                  <button
                    onClick={dismiss}
                    type="button"
                    className="w-full py-3 rounded-2xl text-sm font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
