import React from 'react';
import { motion } from 'framer-motion';
import { Target, Compass, HeartHandshake, ShieldAlert, CheckCircle2, ArrowRight, Flame } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { Link } from 'react-router-dom';

const missionCards = [
  {
    icon: Compass,
    title: 'Our Vision',
    subtitle: 'Building a Zero-Casualty India',
    description: 'To become India’s most trusted center of excellence in fire engineering, disaster preparedness, and industrial safety, empowering young professionals with modern life-saving skills.',
    badge: 'Strategic Vision'
  },
  {
    icon: Target,
    title: 'Our Mission',
    subtitle: 'Discipline, Tact & Action',
    description: 'To deliver rigorous, hands-on vocational training that bridges theoretical fire science with live tactical execution, ensuring every graduate is immediately field-deployable in municipal and corporate fire brigades.',
    badge: 'Core Purpose'
  },
  {
    icon: HeartHandshake,
    title: 'Our Values',
    subtitle: 'Honor & Selfless Service',
    description: 'Integrity, unyielding physical endurance, rapid situational response, and an unwavering commitment to protecting human lives and national infrastructure.',
    badge: 'Code of Honor'
  }
];

export const MissionPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent mb-3">
            <Flame className="w-3.5 h-3.5" />
            <span>Guiding Lighthouse</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
            Our Mission & Purpose
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Every fire officer trained at CFSI carries the sacred responsibility of standing between danger and human lives.
          </p>
        </div>

        {/* 3 Animated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {missionCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              >
                <FlatCard className="p-8 h-full flex flex-col justify-between border border-gray-200/80 dark:border-white/10 group hover:border-primary/50">
                  <div>
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light mb-4">
                      {card.badge}
                    </span>

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-accent/20 flex items-center justify-center text-primary dark:text-primary-light group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
                      <Icon className="w-7 h-7" />
                    </div>

                    <h2 className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mb-1">
                      {card.title}
                    </h2>

                    <p className="text-xs font-bold text-accent uppercase tracking-wider mb-4">
                      {card.subtitle}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-1 text-xs font-bold text-gray-400 group-hover:text-accent transition-colors">
                    <span>CFSI Vadodara Standard</span>
                  </div>
                </FlatCard>
              </motion.div>
            );
          })}
        </div>

        {/* Safety Oath / Cadet Pledge Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-primary via-[#1a55c2] to-[#124199] text-white shadow-xl overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <ShieldAlert className="w-80 h-80 text-white" />
            </div>

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4">
                <Flame className="w-3.5 h-3.5 text-accent" />
                <span>The CFSI Cadet Pledge</span>
              </div>

              <blockquote className="text-lg sm:text-2xl font-heading font-bold text-white leading-relaxed italic mb-6">
                "I pledge to serve with supreme courage, unyielding discipline, and tactical precision. In the face of fire and peril, I will prioritize the preservation of human life, safeguard national assets, and never falter in my duty."
              </blockquote>

              <p className="text-xs sm:text-sm text-white/80 font-medium">
                — Recited daily by all cadets at morning parade assembly on the Vadodara drill grounds.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Join Us CTA */}
        <div className="text-center p-8 sm:p-12 rounded-3xl bg-gray-50 dark:bg-[#161d27] border border-gray-200/80 dark:border-white/5">
          <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
            Ready to Begin Your Journey with CFSI?
          </h3>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join hundreds of successful alumni serving in municipal fire departments, airport fire wings, and multinational petrochemical refineries.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/courses"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark shadow-md hover:scale-105 transition-all duration-200"
            >
              Browse Available Courses
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-accent hover:bg-accent-hover shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <span>Contact Admissions Cell</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
