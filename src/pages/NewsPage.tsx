import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Newspaper, 
  Calendar, 
  Tag, 
  ArrowRight, 
  X, 
  Search, 
  User, 
  Clock, 
  Flame,
  Share2
} from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { NewsPost, NewsCategory } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { FlatCard } from '../components/common/FlatCard';
import { toast } from 'sonner';

export const NewsPage: React.FC = () => {
  const { posts } = useNews();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalPost, setActiveModalPost] = useState<NewsPost | null>(null);

  const categories = ['All', 'News', 'Event', 'Announcement', 'Institute Updates'];

  // Check if an ID was passed in query params
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const found = posts.find((p) => p.id === id);
      if (found) {
        setActiveModalPost(found);
      }
    }
  }, [searchParams, posts]);

  const filteredPosts = posts.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleShare = (post: NewsPost) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/news?id=${post.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const getBadgeClass = (cat: string) => {
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
    <div className="py-10 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          badge="Institute Media & Press"
          title="NEWS, EVENTS & ANNOUNCEMENTS"
          subtitle="Official dispatches from Central Fire Safety Institute Vadodara covering admissions, high-angle rescue drills, state commendations, and upcoming seminars."
        />

        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 sm:mb-10">
          
          {/* Category tabs */}
          <div className="flex flex-wrap items-center gap-1.5 xs:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-[11px] xs:text-xs font-bold transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news and updates..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

        </div>

        {/* News Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <FlatCard className="h-full flex flex-col justify-between overflow-hidden group border border-gray-200/80 dark:border-white/10 hover:border-primary/50">
                  
                  {/* Image */}
                  {post.imageUrl && (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${getBadgeClass(post.category)}`}>
                          <Tag className="w-2.5 h-2.5" />
                          <span>{post.category}</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Info Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {!post.imageUrl && (
                        <div className="mb-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${getBadgeClass(post.category)}`}>
                            <Tag className="w-2.5 h-2.5" />
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
                            <span className="truncate max-w-[120px]">{post.author}</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="mt-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveModalPost(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light hover:text-accent group-hover:underline"
                      >
                        <span>Read Full Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(post)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                        title="Share story link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                </FlatCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {posts.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-2xl bg-gray-50/70 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 max-w-2xl mx-auto my-12">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-black text-xl text-gray-900 dark:text-white mb-2">
              No News Bulletins Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed max-w-md mx-auto">
              Official campus press circulars, semester exam schedules, and admission alerts will be posted here as soon as released by institute administration.
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-base font-semibold">No news articles match your filter or search.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-2 text-xs font-bold text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {/* Read Full Article Lightbox Modal */}
        <AnimatePresence>
          {activeModalPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveModalPost(null)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-3xl bg-white dark:bg-[#161d27] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto p-6 sm:p-8"
              >
                <button
                  type="button"
                  onClick={() => setActiveModalPost(null)}
                  className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100 dark:bg-white/10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Badge & Date */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${getBadgeClass(activeModalPost.category)}`}>
                    <Tag className="w-3 h-3" />
                    <span>{activeModalPost.category}</span>
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{activeModalPost.date}</span>
                  </span>
                  {activeModalPost.author && (
                    <span className="text-xs text-gray-400">• By {activeModalPost.author}</span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-heading font-black text-gray-900 dark:text-white leading-tight mb-4 pr-6">
                  {activeModalPost.title}
                </h2>

                {activeModalPost.imageUrl && (
                  <div className="rounded-2xl overflow-hidden mb-6 max-h-80 w-full border border-gray-200 dark:border-white/10">
                    <img
                      src={activeModalPost.imageUrl}
                      alt={activeModalPost.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6 text-sm font-semibold text-gray-800 dark:text-gray-200 italic leading-relaxed">
                  "{activeModalPost.excerpt}"
                </div>

                <div className="prose dark:prose-invert text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                  <p>{activeModalPost.content}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleShare(activeModalPost)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-accent"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share This Article</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveModalPost(null)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors"
                  >
                    Done Reading
                  </button>
                </div>

              </motion.div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
