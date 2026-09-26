import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Building2, Users2, Compass, BadgePercent, CheckCircle2, ArrowRight } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading';
import { FlatCard } from '../common/FlatCard';
import { Link } from 'react-router-dom';
import { useWebContent } from '../../context/WebContentContext';

const features = [
  {
    icon: ShieldCheck,
    title: 'AIIFTSM Accredited & Govt Recognized',
    description: 'Our diplomas and certificates are accredited by AIIFTSM (All India Institute of Fire Technology & Safety Management) and accepted across national industries.'
  },
  {
    icon: Building2,
    title: 'Dedicated Live Ground Drill Facility',
    description: 'Sprawling training grounds in Vadodara equipped with 4-storey drill tower, smoke maze chamber, foam tender, and hydraulic pump rigs.'
  },
  {
    icon: Award,
    title: 'Ex-Fire Brigade & PSU Drill Masters',
    description: 'Learn directly from veteran Fire Station Officers and Industrial Safety Managers with decades of frontline emergency experience.'
  },
  {
    icon: Users2,
    title: '100% Placement & Campus Interview Drive',
    description: 'Direct recruitment partnerships with leading petrochemical refineries, chemical corridors, construction conglomerates, and municipal fire services.'
  },
  {
    icon: Compass,
    title: 'Comprehensive Physical Conditioning',
    description: 'Daily morning squads, parade drills, stamina endurance runs, obstacle courses, and rope climbing to pass government recruitment fitness tests.'
  },
  {
    icon: BadgePercent,
    title: 'Affordable Fee Structure & Installments',
    description: 'Fair, transparent education fees with zero hidden costs. Flexible installment schemes and scholarships for deserving meritorious candidates.'
  }
];

export const WhyChooseUsSection: React.FC = () => {
  const { homePageConfig } = useWebContent();

  const isEnabled = homePageConfig?.showWhyChooseUs ?? true;
  if (!isEnabled) return null;

  const title = homePageConfig?.whyChooseUsTitle || 'EMPOWERING FUTURE SAFETY LEADERS';
  const subtitle = homePageConfig?.whyChooseUsSubtitle || 'Discover what makes Central Fire Safety Institute the premier destination for fire engineering and disaster management in Gujarat.';

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-white dark:bg-dark-bg transition-colors duration-300 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          badge="Why Choose CFSI"
          title={title}
          subtitle={subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: index * 0.07, ease: 'easeOut' }}
              >
                <FlatCard className="p-6 sm:p-7 h-full flex flex-col justify-between border border-gray-200/80 dark:border-white/10 group hover:border-primary/50 dark:hover:border-primary/50">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-5">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white mb-2.5 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center gap-1 text-xs font-bold text-accent group-hover:text-accent-hover">
                    <span>Certified Standard</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </FlatCard>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 sm:mt-12 p-5 xs:p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h4 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
              Have questions about eligibility or batch schedules?
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Talk directly with our senior admission counsellor for free career guidance.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-dark transition-all duration-200 shrink-0 shadow-md hover:scale-105 flex items-center gap-2"
          >
            <span>Request Call Back</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
