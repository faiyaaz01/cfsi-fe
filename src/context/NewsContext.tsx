import React, { createContext, useContext, useState, useEffect } from 'react';
import { NewsPost, NewsCategory } from '../types';
import { initialNewsSeed } from '../data/newsSeed';

interface NewsContextType {
  posts: NewsPost[];
  addPost: (post: Omit<NewsPost, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updated: Partial<Omit<NewsPost, 'id' | 'createdAt'>>) => void;
  deletePost: (id: string) => void;
  resetToSeed: () => void;
  getPostsByCategory: (category: NewsCategory | 'All') => NewsPost[];
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

const NEWS_STORAGE_KEY = 'cfsi_news_posts';

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<NewsPost[]>(() => {
    try {
      const saved = localStorage.getItem(NEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse news from localStorage', e);
    }
    return initialNewsSeed;
  });

  useEffect(() => {
    try {
      localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to write news to localStorage', e);
    }
  }, [posts]);

  const addPost = (newPostData: Omit<NewsPost, 'id' | 'createdAt'>) => {
    const newPost: NewsPost = {
      ...newPostData,
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const updatePost = (id: string, updated: Partial<Omit<NewsPost, 'id' | 'createdAt'>>) => {
    setPosts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((item) => item.id !== id));
  };

  const resetToSeed = () => {
    setPosts(initialNewsSeed);
    localStorage.setItem(NEWS_STORAGE_KEY, JSON.stringify(initialNewsSeed));
  };

  const getPostsByCategory = (category: NewsCategory | 'All') => {
    if (category === 'All') return posts;
    return posts.filter((p) => p.category === category);
  };

  return (
    <NewsContext.Provider
      value={{
        posts,
        addPost,
        updatePost,
        deletePost,
        resetToSeed,
        getPostsByCategory,
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
