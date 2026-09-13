import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, PhoneCall, CheckCircle2 } from 'lucide-react';
import heroBatchImg from '../../assets/hero-batch.jpg';
import heroTruckImg from '../../assets/hero-truck.jpg';
import heroSquadImg from '../../assets/hero-squad.jpg';
import cfsiLogo from '../../assets/cfsi-logo.jpg';

const heroSlides = [
  {
    image: heroBatchImg,
    tagline: 'From small trainings to big achievements — shaping future fire commanders.',
    focusBadge: '100% Practical Ground Drills'
  },
  {
    image: heroTruckImg,
    tagline: "Don't delay, get out of fire's way — tactical rescue & emergency vehicle squad.",
    focusBadge: 'Heavy Fire Tender Squad'
  },
  {
    image: heroSquadImg,
    tagline: "Safety isn't just a slogan — it's a way of life and professional discipline.",
    focusBadge: 'Emergency Station Readiness'
  }
];

export const HeroSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate hero backdrop slowly every 8 seconds for a relaxed, cinematic pace
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = heroSlides[currentIndex];

  return (
    <section className="relative min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex items-center justify-center overflow-hidden">
      
      {/* Auto-Rotating Background Images with Ultra-Slow, Gentle Ken Burns Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide.tagline}
            initial={{ opacity: 0, scale: 1.0 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 1.8, ease: 'easeInOut' },
              scale: { duration: 8.0, ease: 'linear' }
            }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-[1.02] contrast-[1.03] will-change-transform"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          />
        </AnimatePresence>

        {/* Minimal subtle gradient overlay — keeps photos bright, vivid & fully visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-black/30 dark:from-black/70 dark:via-black/30 dark:to-black/45 z-10 pointer-events-none" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 w-full flex items-center justify-center">
        
        {/* Sleek, Compact Frosted Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-2xl text-center"
        >
          <div className="p-5 sm:p-6 md:p-8 rounded-3xl bg-white/95 dark:bg-[#12181f]/95 backdrop-blur-md border border-white/80 dark:border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.25)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
            
            {/* CFSI Logo Emblem & Top Badge */}
            <div className="flex flex-col items-center justify-center mb-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden p-0.5 bg-white shadow-md border border-primary/20 ring-2 ring-primary/10 mb-2">
                <img
                  src={cfsiLogo}
                  alt="Central Fire Safety Institute Vadodara Official Emblem"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accent text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                <Flame className="w-3 h-3 fill-white" />
                <span>CFSI • Vadodara, Gujarat</span>
              </div>
            </div>

            {/* Main Headline from Banner */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-heading font-black text-primary dark:text-[#5a92fa] tracking-tight leading-tight mb-1.5 uppercase">
              Central Fire Safety Institute
            </h1>

            {/* Banner Accreditation & Affiliation */}
            <div className="space-y-0.5 mb-3">
              <p className="text-[11px] sm:text-xs md:text-sm font-black tracking-wider text-red-600 dark:text-red-400 uppercase">
                An ISO 9001:2015 Certified Institute
              </p>
              <p className="text-[10px] sm:text-[11px] md:text-xs font-extrabold tracking-wide text-red-600/90 dark:text-red-400/90 uppercase max-w-lg mx-auto leading-snug">
                Affiliated by All India Institute of Fire Technology and Safety Management
              </p>
            </div>

            {/* Subtext with Synced Rotating Animation */}
            <div className="min-h-[38px] sm:min-h-[42px] flex items-center justify-center mb-3.5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentSlide.tagline}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-200 font-semibold max-w-lg mx-auto"
                >
                  "{currentSlide.tagline}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Key feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100/90 dark:bg-white/10 border border-gray-200/50 dark:border-white/10">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>IFSMA Affiliated</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100/90 dark:bg-white/10 border border-gray-200/50 dark:border-white/10">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>100% Ground Drills</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gray-100/90 dark:bg-white/10 border border-gray-200/50 dark:border-white/10">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Placement Support</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                to="/courses"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-[#1648a8] shadow-md hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>Explore Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-accent hover:bg-accent-hover shadow-md hover:shadow-accent/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contact Us</span>
              </Link>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Small Dot Indicators at the bottom */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            type="button"
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? 'w-8 bg-accent'
                : 'w-2 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>

    </section>
  );
};
