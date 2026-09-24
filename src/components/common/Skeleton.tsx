import React from 'react';

/**
 * Base shimmering skeleton block.
 */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-gray-200/80 dark:bg-white/10 animate-shimmer rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

/**
 * Card skeleton with header and content lines.
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-6 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
      <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-white/5">
        <Skeleton className="w-full h-3 rounded" />
        <Skeleton className="w-5/6 h-3 rounded" />
      </div>
    </div>
  );
};

/**
 * 4-column summary metric cards skeleton (for Portal & Users metrics).
 */
export const SkeletonStats: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-12 h-4 rounded-full" />
          </div>
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-28 h-3.5 rounded" />
        </div>
      ))}
    </div>
  );
};

/**
 * Tabular skeleton loader for data rosters (Students Directory, Attendance, Users).
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  className?: string;
}> = ({ rows = 6, cols = 6, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden ${className}`}
    >
      {/* Fake Header */}
      <div className="p-4 sm:p-5 border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="w-48 h-5 rounded-lg" />
          <Skeleton className="w-72 h-3.5 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-8 rounded-xl" />
          <Skeleton className="w-24 h-8 rounded-xl" />
        </div>
      </div>

      {/* Table Rows */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50/80 dark:bg-white/5 border-b border-gray-200/60 dark:border-white/10">
              {Array.from({ length: cols }).map((_, c) => (
                <th key={c} className="py-3 px-4">
                  <Skeleton className="w-16 h-3 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="hover:bg-primary/[0.02]">
                {/* 1st column: avatar + names */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-28 h-4 rounded" />
                      <Skeleton className="w-20 h-3 rounded" />
                    </div>
                  </div>
                </td>

                {/* 2nd column: identifiers */}
                <td className="py-3.5 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="w-24 h-3.5 rounded" />
                    <Skeleton className="w-16 h-3 rounded" />
                  </div>
                </td>

                {/* Remaining columns */}
                {Array.from({ length: Math.max(0, cols - 3) }).map((_, c) => (
                  <td key={c} className="py-3.5 px-4">
                    <Skeleton className="w-20 h-4 rounded-full mx-auto" />
                  </td>
                ))}

                {/* Actions column */}
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Skeleton className="w-7 h-7 rounded-xl" />
                    <Skeleton className="w-7 h-7 rounded-xl" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Profile page skeleton placeholder matching ProfilePage.tsx structure.
 */
export const SkeletonProfile: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 animate-pulse">
      {/* Top Header Placeholder */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-white/10">
        <div className="space-y-2">
          <Skeleton className="w-36 h-4 rounded-full" />
          <Skeleton className="w-64 h-8 rounded-xl" />
          <Skeleton className="w-80 h-4 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-28 h-9 rounded-xl" />
          <Skeleton className="w-28 h-9 rounded-xl" />
        </div>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-8">
        
        {/* Avatar and locked student ID row */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
          <Skeleton className="w-28 h-28 rounded-2xl shrink-0" />
          <div className="space-y-3 flex-1 w-full sm:w-auto text-center sm:text-left">
            <Skeleton className="w-48 h-6 rounded-lg mx-auto sm:mx-0" />
            <Skeleton className="w-36 h-4 rounded mx-auto sm:mx-0" />
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
              <Skeleton className="w-24 h-6 rounded-full" />
              <Skeleton className="w-28 h-6 rounded-full" />
            </div>
          </div>
        </div>

        {/* 2-Column Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-28 h-4 rounded" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <Skeleton className="w-36 h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Muster Attendance Roll Skeleton (for DashboardPage attendance tab).
 */
export const SkeletonMuster: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header controls card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/5">
          <div className="space-y-1.5">
            <Skeleton className="w-56 h-6 rounded-lg" />
            <Skeleton className="w-80 h-4 rounded" />
          </div>
          <Skeleton className="w-52 h-10 rounded-2xl" />
        </div>

        {/* 5-Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 space-y-2"
            >
              <Skeleton className="w-20 h-3 rounded" />
              <Skeleton className="w-16 h-6 rounded-lg" />
              <Skeleton className="w-24 h-2.5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Table Placeholder */}
      <SkeletonTable rows={5} cols={7} />
    </div>
  );
};

/**
 * News & Circulars grid skeleton loader matching NewsPage.tsx.
 */
export const SkeletonNews: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-4"
        >
          {/* Top row: badge + date */}
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-6 rounded-full" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="w-full h-6 rounded-lg" />
            <Skeleton className="w-4/5 h-6 rounded-lg" />
          </div>
          {/* Excerpt */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="w-full h-3.5 rounded" />
            <Skeleton className="w-full h-3.5 rounded" />
            <Skeleton className="w-2/3 h-3.5 rounded" />
          </div>
          {/* Bottom read more action */}
          <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <Skeleton className="w-24 h-4 rounded" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Course programs grid skeleton loader matching CoursesPage.tsx.
 */
export const SkeletonCourse: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-6 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm space-y-5"
        >
          {/* Header: Icon + Badge */}
          <div className="flex items-center justify-between">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>
          {/* Course Title & Code */}
          <div className="space-y-2">
            <Skeleton className="w-20 h-3.5 rounded" />
            <Skeleton className="w-full h-6 rounded-lg" />
            <Skeleton className="w-3/4 h-6 rounded-lg" />
          </div>
          {/* Details Pills: Duration, Eligibility */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Skeleton className="h-8 rounded-xl" />
            <Skeleton className="h-8 rounded-xl" />
          </div>
          {/* Features list */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <Skeleton className="w-5/6 h-3.5 rounded" />
            <Skeleton className="w-4/5 h-3.5 rounded" />
            <Skeleton className="w-2/3 h-3.5 rounded" />
          </div>
          {/* CTA Button */}
          <div className="pt-2">
            <Skeleton className="w-full h-11 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Gallery photo & video grid skeleton loader matching ImageGalleryPage & VideoGalleryPage.
 */
export const SkeletonGallery: React.FC<{ count?: number; className?: string }> = ({
  count = 8,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm overflow-hidden space-y-3"
        >
          {/* Image Placeholder */}
          <Skeleton className="w-full aspect-[4/3] rounded-none" />
          {/* Caption */}
          <div className="p-4 space-y-2">
            <Skeleton className="w-3/4 h-4 rounded-lg" />
            <Skeleton className="w-1/2 h-3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

