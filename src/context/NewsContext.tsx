import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NewsPost, NewsCategory } from '../types';
import { initialNewsSeed } from '../data/newsSeed';
import { api } from '../lib/api';
import { toast } from 'sonner';

const NEWS_STORAGE_KEY = 'cfsi_news_posts';
const DEMO_NEWS_PREFIXES = ['news-01', 'news-02', 'news-03', 'news-04'];

function filterOutDemoNews(items: NewsPost[]): NewsPost[] {
  return items.filter(p => !DEMO_NEWS_PREFIXES.some(prefix => p.id?.startsWith(prefix)));
}

interface NewsContextType {
  posts: NewsPost[];
  isLoading: boolean;
  addPost: (post: Omit<NewsPost, 'id' | 'createdAt'>) => Promise<void>;
  updatePost: (id: string, updated: Partial<Omit<NewsPost, 'id' | 'createdAt'>>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  clearAllNews: () => Promise<void>;
  resetToSeed: () => void;
  getPostsByCategory: (category: NewsCategory | 'All') => NewsPost[];
  refreshNews: () => Promise<void>;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<NewsPost[]>(() => {
    try {
      const saved = localStorage.getItem(NEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return filterOutDemoNews(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse news from localStorage', e);
    }
    return filterOutDemoNews(initialNewsSeed);
  });

  const notifyChange = () => {
    try {
      window.dispatchEvent(new CustomEvent('cfsi_news_updated'));
    } catch (e) {
      console.error(e);
    }
  };

  const refreshNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const remote = await api.getNews();
      if (Array.isArray(remote)) {
        const cleaned = filterOutDemoNews(remote);
        setPosts(cleaned);
        localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(cleaned));
      }
    } catch {
      // Offline fallback: use localStorage
      const saved = localStorage.getItem(NEWS_STORAGE_KEY);
      if (saved) {
        try {
          setPosts(filterOutDemoNews(JSON.parse(saved)));
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNews();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === NEWS_STORAGE_KEY && e.newValue) {
        try {
          setPosts(filterOutDemoNews(JSON.parse(e.newValue)));
        } catch (err) {
          console.error(err);
        }
      }
    };

    const handleCustomUpdate = () => {
      const saved = localStorage.getItem(NEWS_STORAGE_KEY);
      if (saved) {
        try {
          setPosts(filterOutDemoNews(JSON.parse(saved)));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cfsi_news_updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cfsi_news_updated', handleCustomUpdate);
    };
  }, [refreshNews]);

  const addPost = async (newPostData: Omit<NewsPost, 'id' | 'createdAt'>) => {
    const newPost: NewsPost = {
      ...newPostData,
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    
    // Immediate UI update
    setPosts(prev => {
      const updated = [newPost, ...prev];
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    notifyChange();

    // Async backend persist
    try {
      await api.createNews(newPost);
    } catch (err) {
      console.warn('News saved locally, backend sync failed', err);
    }
  };

  const updatePost = async (id: string, updated: Partial<Omit<NewsPost, 'id' | 'createdAt'>>) => {
    setPosts(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, ...updated } : item));
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    notifyChange();

    try {
      await api.updateNews(id, updated);
    } catch (err) {
      console.warn('News updated locally, backend sync failed', err);
    }
  };

  const deletePost = async (id: string) => {
    setPosts(prev => {
      const next = prev.filter(item => item.id !== id);
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    notifyChange();

    try {
      await api.deleteNews(id);
    } catch (err) {
      console.warn('News deleted locally, backend sync failed', err);
    }
  };

  const clearAllNews = async () => {
    setPosts([]);
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify([]));
    notifyChange();
    toast.success('All news bulletins cleared.');
  };

  const resetToSeed = () => {
    clearAllNews();
  };

  const getPostsByCategory = (category: NewsCategory | 'All') => {
    if (category === 'All') return posts;
    return posts.filter(p => p.category === category);
  };

  return (
    <NewsContext.Provider
      value={{
        posts,
        isLoading,
        addPost,
        updatePost,
        deletePost,
        clearAllNews,
        resetToSeed,
        getPostsByCategory,
        refreshNews,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
