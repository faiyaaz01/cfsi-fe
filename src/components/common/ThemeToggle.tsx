import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border border-white/20 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-accent ${
        isDark
          ? 'bg-[#161d27]/80 text-amber-300 hover:bg-[#1f2937]'
          : 'bg-white/20 text-white hover:bg-white/30'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {showLabel && (
        <span className="tracking-wider uppercase text-[11px] font-semibold">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
