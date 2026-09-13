import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Target, BookOpen, Users, CheckCircle2, Flame, Building, ArrowRight } from 'lucide-react';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { GlassCard } from '../components/common/GlassCard';
import { Link } from 'react-router-dom';
import heroBatchImg from '../assets/hero-batch.jpg';
import cfsiLogo from '../assets/cfsi-logo.jpg';

const values = [
  {
    icon: ShieldCheck,
    title: 'Safety First',
    description: 'We instill an unshakeable safety-first mindset. Every operational command prioritizes zero-casualty risk mitigation and defensive tactics.'
  },
  {
    icon: BookOpen,
    title: 'Vocational Education',
    description: 'Our curriculum blends strict theoretical fire physics and hydraulics with daily live-ground drill execution and apparatus handling.'
  },
  {
    icon: Award,
    title: 'Operational Excellence',
    description: 'Setting benchmark standards in industrial chemical defense, high-altitude rope extraction, and municipal squad leadership across India.'
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
  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light mb-3">
            <Flame className="w-3.5 h-3.5 text-accent" />
            <span>About CFSI Vadodara</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
            Pioneering Fire Safety Education in India
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Central Fire Safety Institute (CFSI) was established with a singular vision: to produce elite, disciplined, and technically competent fire safety commanders and EHS officers.
          </p>
        </div>

        {/* Institute Story & Director's Message (2-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-20">
          
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
                className="w-full h-[450px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <GlassCard className="p-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden p-0.5 bg-white shrink-0 shadow-md">
                      <img src={cfsiLogo} alt="CFSI Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-gray-900 dark:text-white">
                        IFSMA National Accreditation
                      </h4>
                      <p className="text-[11px] text-gray-700 dark:text-gray-300">
                        Government recognized vocational fire engineering training center.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Float badge */}
            <div className="absolute -top-4 -right-4 p-3.5 rounded-2xl bg-accent text-white shadow-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Award className="w-5 h-5" />
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
              Unlike purely academic institutions, CFSI maintains an uncompromising 100% practical ground drill philosophy. Our cadets don breathing apparatus, scale drill towers, fight controlled chemical blazes, and practice live casualty extractions from day one.
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

        {/* 3 Values Cards */}
        <div className="mb-20">
          <SectionHeading
            badge="Guiding Principles"
            title="OUR CORE VALUES"
            subtitle="The fundamental tenets that guide our instructors, cadets, and operational standards."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <FlatCard className="p-7 h-full flex flex-col justify-between border border-gray-200/80 dark:border-white/10 group hover:border-primary/50">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-5">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white mb-3 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                        {val.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </FlatCard>
                </motion.div>
              );
            })}
          </div>
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
