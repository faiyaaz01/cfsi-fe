import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Wrench, ArrowRight, Video, Flame } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading';
import { FlatCard } from '../common/FlatCard';
import { useWebContent } from '../../context/WebContentContext';

export const TrainingSection: React.FC = () => {
  const { trainings, videos, displaySettings } = useWebContent();

  if (!displaySettings.groundTrainingSection) return null;

  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-gray-50 dark:bg-[#12181f] transition-colors duration-300 border-t border-gray-200/80 dark:border-white/5 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        <SectionHeading
          badge="Live Practical Modules"
          title="HANDS-ON GROUND TRAINING"
          subtitle="Tactical simulations engineered to build muscle memory, fearless situational awareness, and split-second emergency decision making."
        />

        {trainings.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-2xl bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-black text-lg text-gray-900 dark:text-white mb-2">
              Ground Drills Roster Being Updated
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              Tactical fire drill modules and smoke chamber practical schedules for active cadencies will appear here once published by institute training officers.
            </p>
            {videos.length > 0 && (
              <Link
                to="/gallery/videos"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Explore Recorded Video Drills</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {trainings.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              >
                <FlatCard className="h-full flex flex-col overflow-hidden group border border-gray-200/80 dark:border-white/10 relative hover:border-amber-400 dark:hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300">
                  
                  {/* Amber top border accent on hover */}
                  <div className="h-1.5 w-full bg-transparent group-hover:bg-amber-400 transition-colors duration-300" />

                  {/* Training Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-gray-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 will-change-transform"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.opacity = '0.3';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                    
                    {item.tag && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-accent text-white shadow-md">
                          {item.tag}
                        </span>
                      </div>
                    )}

                    {item.duration && (
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-300" />
                          <span>{item.duration}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Training Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors leading-snug mb-3">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                        {item.description}
                      </p>

                      {/* Highlights list */}
                      {item.highlights && item.highlights.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Drill Highlights:</div>
                          {item.highlights.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Equipment footer */}
                    {item.equipmentUsed && item.equipmentUsed.length > 0 && (
                      <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                          <Wrench className="w-3.5 h-3.5 text-primary" />
                          <span>Hardware Utilized:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.equipmentUsed.map((eq, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </FlatCard>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action Link to Video Gallery */}
        {videos.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/gallery/videos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300"
            >
              <Video className="w-4 h-4 text-red-500 group-hover:text-white" />
              <span>Watch Live Ground Drill Videos ({videos.length} Videos)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};
