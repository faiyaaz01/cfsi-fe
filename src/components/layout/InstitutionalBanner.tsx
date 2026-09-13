import React from 'react';
import { ShieldCheck, Award, Flame, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import cfsiBanner from '../../assets/cfsi-banner.png';

export const InstitutionalBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-white via-[#fafbff] to-[#f4f7fc] dark:from-[#12181f] dark:to-[#0f141a] border-b border-gray-200/80 dark:border-white/10 shadow-sm transition-colors duration-300 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        
        {/* Clickable Official Masthead Banner Image */}
        <Link 
          to="/" 
          className="block group focus:outline-none"
          title="Central Fire Safety Institute (CFSI) — ISO 9001:2015 Certified"
        >
          <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-white/15 bg-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/50">
            <img
              src={cfsiBanner}
              alt="Central Fire Safety Institute — AN ISO 9001:2015 CERTIFIED INSTITUTE • AFFILIATED BY ALL INDIA INSTITUTE OF FIRE TECHNOLOGY AND SAFETY MANAGEMENT"
              className="w-full h-auto max-h-[125px] sm:max-h-[160px] md:max-h-[190px] lg:max-h-[220px] object-contain mx-auto block"
              loading="eager"
            />
          </div>
        </Link>

        {/* Live Highlighted Accreditation Badges */}
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-2 text-[11px] sm:text-xs">
          
          {/* Left Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 font-extrabold border border-red-500/25 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span>AN ISO 9001:2015 CERTIFIED INSTITUTE</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600/10 text-[#1b2559] dark:bg-blue-500/20 dark:text-blue-300 font-extrabold border border-blue-600/25 shadow-xs">
              <Award className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
              <span className="hidden sm:inline">AFFILIATED BY</span>
              <span>ALL INDIA INSTITUTE OF FIRE TECH & SAFETY MGMT</span>
            </span>
          </div>

          {/* Right Official Institute Motto */}
          <div className="hidden lg:flex items-center gap-1.5 text-[#1b2559] dark:text-gray-300 font-bold text-[11px]">
            <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>A Leading Institution of India in Fire Tech & Safety Management</span>
          </div>

        </div>

      </div>
    </div>
  );
};
