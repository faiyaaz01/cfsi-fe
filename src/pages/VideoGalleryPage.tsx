import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Clock, Video, Tag, Flame } from 'lucide-react';
import { videosData } from '../data/videos';
import { VideoItem } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';

export const VideoGalleryPage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Practical Drill', 'Search & Rescue', 'Fire Demo', 'Campus Life'];

  const filteredVideos = selectedCategory === 'All'
    ? videosData
    : videosData.filter((v) => v.category === selectedCategory);

  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Live Tactical Footage"
          title="INSTITUTE VIDEO GALLERY"
          subtitle="Watch all 14 official ground drill recordings, foam tender fire extinguishing operations, high-angle rescue, and SCBA smoke chamber exercises."
        />

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Responsive Grid of YouTube Cards */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <AnimatePresence>
            {filteredVideos.map((vid, index) => (
              <motion.div
                key={vid.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <FlatCard
                  onClick={() => setSelectedVideo(vid)}
                  className="h-full flex flex-col justify-between overflow-hidden cursor-pointer group border border-gray-200/80 dark:border-white/10 hover:border-red-500/40 dark:hover:border-red-500/40"
                >
                  {/* Thumbnail with Overlay */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
                    <img
                      src={`https://img.youtube.com/vi/${vid.youtubeId}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-115 group-hover:bg-red-600 transition-all duration-300">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Top Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white border border-white/10">
                        <Tag className="w-2.5 h-2.5 text-accent" />
                        <span>{vid.category}</span>
                      </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-black/80 text-white">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span>{vid.duration}</span>
                      </span>
                    </div>
                  </div>

                  {/* Info Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {vid.title}
                      </h3>
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                        {vid.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400">
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5" />
                        <span>Click to Watch Video</span>
                      </span>
                      <span>▶</span>
                    </div>
                  </div>

                </FlatCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Video Player Modal */}
        <AnimatePresence>
          {selectedVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedVideo(null)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25 }}
                className="relative z-10 w-full max-w-4xl bg-[#161d27] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              >
                {/* Header with Close */}
                <div className="p-4 bg-[#12181f] flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-2 pr-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/20">
                      {selectedVideo.category}
                    </span>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-white truncate">
                      {selectedVideo.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVideo(null)}
                    className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Close video player"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Embedded YouTube Player */}
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                {/* Description Footer */}
                <div className="p-4 bg-[#161d27] text-xs text-gray-300">
                  <p>{selectedVideo.description}</p>
                </div>
              </motion.div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
