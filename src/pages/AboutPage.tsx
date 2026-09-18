import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Award, 
  Target, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Flame, 
  Building, 
  ArrowRight,
  Compass,
  HeartHandshake,
  ShieldAlert
} from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { Link } from 'react-router-dom';
import heroBatchImg from '../assets/hero-batch.jpg';
import cfsiLogo from '../assets/cfsi-logo.jpg';

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

const infrastructure = [
  {
    title: '4-Storey High-Rise Drill Tower',
    desc: 'Equipped with rappelling anchors, hook ladder pitching ledges, and external fire escape chutes for realistic multi-storey rescue.'
  },
  {
    title: 'Synthetic Smoke & BA Chamber',
    desc: 'Dense, zero-visibility labyrinth simulating toxic interior house and industrial warehouse fires under SCBA breathing apparatus endurance.'
  },
  {
    title: 'Fire Tender Fleet & Pump Rig Lab',
    desc: 'Operational multi-stage centrifugal fire pumps, water tenders, foam branches, and hydraulic pressure testing manifolds.'
  },
  {
    title: 'HAZMAT & Chemical Defense Unit',
    desc: 'Full inventory of Level-A gas-tight suits, multi-gas detectors, plume dispersion simulation tools, and chemical spill kits.'
  }
];

export const AboutPage: React.FC = () => {
  useEffect(() => {
    if (window.location.hash === '#mission') {
      const el = document.getElementById('mission');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <div className="py-10 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light mb-3">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span>About CFSI Vadodara</span>
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight break-words">
            Pioneering Fire Safety Education in India
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            Central Fire Safety Institute (CFSI) was established with a singular vision: to produce elite, disciplined, and technically competent fire safety commanders and EHS officers.
          </p>
        </div>

        {/* Institute Story & Director's Message (2-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center mb-16 sm:mb-20">
          
          {/* Left Column: Image & Badges */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
              <img
                src={heroBatchImg}
                alt="CFSI Vadodara Batch with Fire Tender"
                className="w-full h-[320px] xs:h-[380px] sm:h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
                <GlassCard className="p-3 sm:p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden p-0.5 bg-white shrink-0 shadow-md">
                      <img src={cfsiLogo} alt="CFSI Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                        AIIFTSM National Accreditation
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-700 dark:text-gray-300">
                        Government recognized vocational fire engineering training center.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Float badge */}
            <div className="absolute top-3 right-3 sm:-top-4 sm:-right-4 p-2.5 sm:p-3.5 rounded-2xl bg-accent text-white shadow-xl flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>15+ Years Legacy</span>
            </div>
          </motion.div>

          {/* Right Column: Story Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
              <Target className="w-4 h-4" />
              <span>Our Founding Story</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
              Bridging the Critical Gap Between Classroom Theory and Real Firegrounds
            </h2>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Located in Vadodara, Gujarat — the heart of India's petrochemical and manufacturing corridor — CFSI was founded to meet the explosive demand for certified fire officers, safety auditors, and emergency responders.
            </p>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Unlike purely academic institutions, CFSI maintains an uncompromising 100% practical ground drill philosophy. Our students don breathing apparatus, scale drill towers, fight controlled chemical blazes, and practice live casualty extractions from day one.
            </p>

            {/* Key Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#161d27] border border-gray-100 dark:border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-gray-900 dark:text-white">State Council Recognition</div>
                  <div className="text-gray-500 dark:text-gray-400">Standardized vocational curriculum</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#161d27] border border-gray-100 dark:border-white/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-gray-900 dark:text-white">Placement Assurance</div>
                  <div className="text-gray-500 dark:text-gray-400">Campus drives with GIDC & PSUs</div>
                </div>
              </div>
            </div>

          </motion.div>

        </div>

        {/* ========================================================================= */}
        {/* OUR MISSION & PURPOSE SECTION (Embedded from Mission Page)               */}
        {/* ========================================================================= */}
        <div id="mission" className="mb-20 scroll-mt-24">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent mb-3">
              <Flame className="w-3.5 h-3.5" />
              <span>Guiding Lighthouse</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
              Our Mission & Purpose
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Every fire officer trained at CFSI carries the sacred responsibility of standing between danger and human lives.
            </p>
          </div>

          {/* 3 Animated Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
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

                      <h3 className="text-2xl font-heading font-extrabold text-gray-900 dark:text-white mb-1">
                        {card.title}
                      </h3>

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
          >
            <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-primary via-[#1a55c2] to-[#124199] text-white shadow-xl overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                <ShieldAlert className="w-80 h-80 text-white" />
              </div>

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4">
                  <Flame className="w-3.5 h-3.5 text-accent" />
                  <span>The CFSI Student Pledge</span>
                </div>

                <blockquote className="text-lg sm:text-2xl font-heading font-bold text-white leading-relaxed italic mb-6">
                  "I pledge to serve with supreme courage, unyielding discipline, and tactical precision. In the face of fire and peril, I will prioritize the preservation of human life, safeguard national assets, and never falter in my duty."
                </blockquote>

                <p className="text-xs sm:text-sm text-white/80 font-medium">
                  — Recited daily by all students at morning parade assembly on the Vadodara drill grounds.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Infrastructure Highlights */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gray-50 dark:bg-[#12181f] border border-gray-200/80 dark:border-white/5">
          <div className="max-w-3xl mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent mb-2">
              <Building className="w-3.5 h-3.5" />
              <span>Campus Facilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
              State-of-the-Art Training Infrastructure
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Designed to simulate real industrial complexes, high-rise buildings, and chemical processing zones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {infrastructure.map((inf, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/60 dark:border-white/5 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent font-bold text-sm flex items-center justify-center mb-3">
                  0{i + 1}
                </div>
                <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-2">
                  {inf.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {inf.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all duration-300 shadow-lg hover:scale-105"
          >
            <span>Explore All Certified Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
