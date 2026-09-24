import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="py-20 sm:py-28 min-h-[70vh] flex items-center justify-center bg-white dark:bg-dark-bg transition-colors duration-300 px-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        {/* 404 Code */}
        <p className="font-heading font-black text-6xl sm:text-7xl text-primary tracking-tight">
          404
        </p>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-sans">
            Sorry, the page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-primary hover:bg-primary-dark text-white shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
