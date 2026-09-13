import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`mb-10 md:mb-14 ${
        align === 'center' ? 'text-center max-w-3xl mx-auto' : 'text-left max-w-2xl'
      } ${className}`}
    >
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent border border-accent/20 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          <span>{badge}</span>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
        {title}
      </h2>
      <div className={`mt-3 h-1 w-16 bg-accent rounded-full ${align === 'center' ? 'mx-auto' : ''}`} />
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 font-normal leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
