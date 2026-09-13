import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GraduationCap, BookOpen, Award, MapPin } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
}

const stats: StatItem[] = [
  {
    icon: GraduationCap,
    value: 500,
    suffix: '+',
    label: 'Students Trained',
    sublabel: 'Serving across India'
  },
  {
    icon: BookOpen,
    value: 4,
    suffix: '',
    label: 'Govt. Affiliated Courses',
    sublabel: 'Certificate to Diploma'
  },
  {
    icon: Award,
    value: 15,
    suffix: '+',
    label: 'Years Experience',
    sublabel: 'In Fire Safety Training'
  },
  {
    icon: MapPin,
    value: 10,
    suffix: '+',
    label: 'Cities Across India',
    sublabel: 'Alumni Placement Network'
  }
];

const Counter: React.FC<{ target: number; suffix: string }> = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const duration = 1800; // ms

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOut * target);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animateCount);
  }, [isInView, target]);

  return (
    <span ref={ref} className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
      {count}
      <span className="text-accent">{suffix}</span>
    </span>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent dark:from-[#161d27]/60 dark:to-dark-bg transition-colors duration-300 relative overflow-hidden">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
              >
                {/* Minimal Glass Card */}
                <GlassCard hoverEffect={true} className="p-6 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center text-primary dark:text-primary-light mb-4 shadow-sm">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                  </div>

                  <Counter target={stat.value} suffix={stat.suffix} />

                  <h3 className="mt-2 text-sm sm:text-base font-extrabold text-gray-900 dark:text-white">
                    {stat.label}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
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
