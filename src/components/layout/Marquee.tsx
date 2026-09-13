import React from 'react';
import { Flame, AlertTriangle, FileText, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const marqueeItems = [
  {
    icon: Flame,
    text: "🔥 Fire Destruction is One Man's Job, Fire Prevention is Everybody's Job",
    badge: 'Motto'
  },
  {
    icon: AlertTriangle,
    text: "⚠️ Safety Tip: When you see Smoke — Run! Never wait for fire.",
    badge: 'Safety'
  },
  {
    icon: FileText,
    text: "📋 Admissions Open — Certificate & Diploma in Fire Safety 2024-25 | Apply Now",
    badge: 'Admissions',
    link: '/courses'
  },
  {
    icon: Award,
    text: "🏆 Affiliated with IFSMA — Best Fire Safety Education & Practical Ground Drills in India",
    badge: 'Accreditation'
  }
];

export const Marquee: React.FC = () => {
  return (
    <div className="bg-[#ff7a29] text-white py-2 px-3 overflow-hidden select-none relative shadow-sm z-20 border-b border-orange-600/20">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Fixed Badge on Desktop */}
        <div className="hidden sm:inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-sm px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white shrink-0 mr-4 shadow-sm border border-white/10">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          <span>Latest Updates</span>
        </div>

        {/* Marquee Ticker — Continuous Non-Stop Smooth Motion (Never stops on hover) */}
        <div className="relative flex overflow-x-hidden w-full">
          <div
            className="flex shrink-0 items-center gap-10 text-xs sm:text-[13px] font-semibold tracking-wide whitespace-nowrap animate-marquee will-change-transform"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {item.link ? (
                  <Link to={item.link} className="hover:underline flex items-center gap-1.5 font-bold">
                    <span>{item.text}</span>
                  </Link>
                ) : (
                  <span>{item.text}</span>
                )}
                <span className="text-white/40 text-sm">•</span>
              </div>
            ))}
          </div>

          <div
            aria-hidden="true"
            className="flex shrink-0 items-center gap-10 text-xs sm:text-[13px] font-semibold tracking-wide whitespace-nowrap animate-marquee will-change-transform"
            style={{ transform: 'translate3d(0, 0, 0)' }}
          >
            {marqueeItems.concat(marqueeItems).map((item, idx) => (
              <div key={`dup-${idx}`} className="flex items-center gap-3">
                {item.link ? (
                  <Link to={item.link} className="hover:underline flex items-center gap-1.5 font-bold">
                    <span>{item.text}</span>
                  </Link>
                ) : (
                  <span>{item.text}</span>
                )}
                <span className="text-white/40 text-sm">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
