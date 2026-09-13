import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Tag, Calendar, ZoomIn } from 'lucide-react';
import { galleryImagesData } from '../data/galleryImages';
import { GalleryImage } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';

type CategoryFilter = 'All' | 'Training' | 'Events' | 'Certificates' | 'Equipment';

const categories: CategoryFilter[] = ['All', 'Training', 'Events', 'Certificates', 'Equipment'];

export const ImageGalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const filteredImages = activeCategory === 'All'
    ? galleryImagesData
    : galleryImagesData.filter((img) => img.category === activeCategory);

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) => ((prev! + 1) % filteredImages.length));
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) => (prev! - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Visual Archive"
          title="INSTITUTE PHOTO GALLERY"
          subtitle="Explore ground drills, smoke chamber rescue simulations, campus events, and certification honors at CFSI Vadodara."
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredImages.map((img, index) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
              >
                <FlatCard
                  onClick={() => openLightbox(index)}
                  className="overflow-hidden cursor-pointer group relative h-72 border border-gray-200/80 dark:border-white/10"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent text-white shadow-md">
                      {img.category}
                    </span>
                  </div>

                  {/* Hover Icon */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <ZoomIn className="w-4 h-4" />
                  </div>

                  {/* Bottom Captions */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-white/70 mb-1">
                      <Calendar className="w-3 h-3 text-accent" />
                      <span>{img.date}</span>
                    </div>
                    <h3 className="font-heading font-bold text-sm sm:text-base leading-snug line-clamp-1">
                      {img.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                      {img.caption}
                    </p>
                  </div>
                </FlatCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Full Lightbox Modal */}
        <AnimatePresence>
          {activeLightboxIndex !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
                className="fixed inset-0 bg-black/90 backdrop-blur-md"
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Prev Button */}
              <button
                type="button"
                onClick={prevImage}
                className="fixed left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={nextImage}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Lightbox Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 max-w-4xl max-h-[85vh] flex flex-col items-center"
              >
                <img
                  src={filteredImages[activeLightboxIndex].imageUrl}
                  alt={filteredImages[activeLightboxIndex].title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl"
                />
                <div className="mt-4 text-center text-white max-w-2xl px-4">
                  <div className="inline-flex items-center gap-2 text-xs text-accent font-bold uppercase tracking-wider mb-1">
                    <span>{filteredImages[activeLightboxIndex].category}</span>
                    <span>•</span>
                    <span>{filteredImages[activeLightboxIndex].date}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold">
                    {filteredImages[activeLightboxIndex].title}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    {filteredImages[activeLightboxIndex].caption}
                  </p>
                </div>
              </motion.div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
