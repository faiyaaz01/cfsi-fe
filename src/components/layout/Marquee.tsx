import React from 'react';
import { Flame, AlertTriangle, FileText, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWebContent } from '../../context/WebContentContext';
import { useNews } from '../../context/NewsContext';

export const Marquee: React.FC = () => {
  const { displaySettings } = useWebContent();
  const { posts } = useNews();

  if (!displaySettings.newsTickerMarquee) return null;

  // Build live marquee items: if there are real news bulletins, include them!
  const liveNewsItems = posts.map(p => ({
    icon: FileText,
    text: `📢 ${p.title} (${p.category})`,
    badge: p.category,
    link: '/news'
  }));

  const standardItems = [
    {
      icon: Flame,
      text: "🔥 Fire Destruction is One Man's Job, Fire Prevention is Everybody's Job",
      badge: 'Motto',
      link: undefined
    },
    {
      icon: AlertTriangle,
      text: "⚠️ Safety Tip: When you see Smoke — Run! Never wait for fire.",
      badge: 'Safety',
      link: undefined
    },
    {
      icon: Award,
      text: "🏆 Affiliated with AIIFTSM — Best Fire Safety Education & Practical Ground Drills in India",
      badge: 'Accreditation',
      link: undefined
    }
  ];

  const marqueeItems = liveNewsItems.length > 0
    ? [...liveNewsItems, ...standardItems]
    : standardItems;

  return (
    <div className="bg-[#ff7a29] text-white py-2 px-3 overflow-hidden select-none relative shadow-sm z-20 border-b border-orange-600/20 w-full max-w-full">
      <div className="max-w-7xl mx-auto flex items-center w-full min-w-0">
        {/* Fixed Badge on Desktop */}
        <div className="hidden sm:inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-sm px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white shrink-0 mr-4 shadow-sm border border-white/10">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          <span>Latest Updates</span>
        </div>

        {/* Marquee Ticker */}
        <div className="relative flex overflow-x-hidden w-full min-w-0">
          <div
            className="flex shrink-0 items-center gap-10 text-xs sm:text-[13px] font-semibold tracking-wide whitespace-nowrap animate-marquee will-change-transform"
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
