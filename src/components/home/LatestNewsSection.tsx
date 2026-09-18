import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { useNews } from '../../context/NewsContext';
import { SectionHeading } from '../common/SectionHeading';
import { FlatCard } from '../common/FlatCard';

export const LatestNewsSection: React.FC = () => {
  const { posts } = useNews();
  
  // Show 3 latest posts
  const latestPosts = posts.slice(0, 3);

  if (latestPosts.length === 0) return null;

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Announcement':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300/40';
      case 'Event':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-300/40';
      case 'News':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300/40';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-300/40';
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-gray-50 dark:bg-[#12181f] transition-colors duration-300 border-b border-gray-100 dark:border-white/5 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title & View All Link */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <SectionHeading
            badge="Institute Bulletin"
            title="Latest News & Events"
            subtitle="Stay informed with real-time updates from our Vadodara campus, drills, and admissions."
            align="left"
            className="mb-0"
          />

          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary dark:text-primary-light hover:text-accent dark:hover:text-accent group shrink-0"
          >
            <span>View All News & Updates</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Most Recent Items Grid with Slow, Gentle Zoom In Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {latestPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
            >
              <FlatCard className="h-full flex flex-col overflow-hidden group border border-gray-200/80 dark:border-white/10 hover:border-primary/40 dark:hover:border-primary/40 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Image with Gentle, Slow Zoom-In on Card Hover */}
                {post.imageUrl && (
                  <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 will-change-transform"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getCategoryBadgeClass(post.category)}`}>
                        <Tag className="w-3 h-3" />
                        <span>{post.category}</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {!post.imageUrl && (
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getCategoryBadgeClass(post.category)}`}>
                          <Tag className="w-3 h-3" />
                          <span>{post.category}</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {post.author && (
                        <>
                          <span>•</span>
                          <span>{post.author}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="mt-2.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <Link
                      to={`/news?id=${post.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light hover:text-accent group-hover:underline"
                    >
                      <span>Read Full Story</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </FlatCard>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
