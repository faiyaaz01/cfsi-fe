import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, BookOpen, Award, MapPin } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { CountUp } from '../common/CountUp';
import { useWebContent } from '../../context/WebContentContext';

const statIcons = [GraduationCap, BookOpen, Award, MapPin];

const defaultStats = [
  {
    value: 500,
    suffix: '+',
    label: 'Students Trained',
    sublabel: 'Serving across India'
  },
  {
    value: 4,
    suffix: '',
    label: 'Govt. Affiliated Courses',
    sublabel: 'Certificate to Diploma'
  },
  {
    value: 15,
    suffix: '+',
    label: 'Years Experience',
    sublabel: 'In Fire Safety Training'
  },
  {
    value: 10,
    suffix: '+',
    label: 'Cities Across India',
    sublabel: 'Alumni Placement Network'
  }
];

export const StatsSection: React.FC = () => {
  const { homePageConfig, displaySettings } = useWebContent();

  const isEnabled = (homePageConfig?.showStatsSection ?? true) && displaySettings.placementStatsBar;
  if (!isEnabled) return null;

  const currentStats = (homePageConfig?.stats && homePageConfig.stats.length > 0)
    ? homePageConfig.stats
    : defaultStats;

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent dark:from-[#161d27]/60 dark:to-dark-bg transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 lg:gap-8">
          {currentStats.map((stat, index) => {
            const Icon = statIcons[index % statIcons.length];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
              >
                {/* Minimal Glass Card */}
                <GlassCard hoverEffect={true} className="p-3.5 xs:p-4 sm:p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center text-primary dark:text-primary-light mb-2.5 sm:mb-4 shadow-sm">
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
                  </div>

                  <CountUp 
                    value={stat.value} 
                    suffix={stat.suffix} 
                    className="font-heading font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl text-gray-900 dark:text-white" 
                  />

                  <h3 className="mt-1.5 sm:mt-2 text-xs xs:text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                    {stat.label}
                  </h3>

                  <p className="mt-0.5 sm:mt-1 text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {stat.sublabel}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
