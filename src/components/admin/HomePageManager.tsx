import React, { useState, useEffect } from 'react';
import {
  Home,
  Flame,
  BookOpen,
  Bell,
  Award,
  Eye,
  EyeOff,
  Save,
  RotateCw,
  ExternalLink,
  CheckSquare,
  Square,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { FlatCard } from '../common/FlatCard';
import { useWebContent, HomePageConfig, defaultHomePageConfig } from '../../context/WebContentContext';
import { useNews } from '../../context/NewsContext';
import { useConfirm } from '../../context/ConfirmContext';

export const HomePageManager: React.FC = () => {
  const {
    homePageConfig,
    updateHomePageConfig,
    resetHomePageConfig,
    courses,
    trainings,
  } = useWebContent();

  const { posts: newsPosts } = useNews();
  const confirm = useConfirm();

  // Local draft state
  const [form, setForm] = useState<HomePageConfig>(() => ({
    ...defaultHomePageConfig,
    ...homePageConfig,
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true,
    courses: true,
    news: true,
    stats: false,
    portal: false,
    training: false,
    why: false,
    recruiters: false,
  });

  useEffect(() => {
    if (homePageConfig) {
      setForm((prev) => ({
        ...prev,
        ...homePageConfig,
      }));
    }
  }, [homePageConfig]);

  const toggleSectionOpen = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateHomePageConfig(form);
    } catch (err: any) {
      toast.error('Could not save homepage: ' + (err.message || 'Error occurred'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset to Defaults',
      message: 'Are you sure you want to reset all homepage text and settings back to original defaults?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
      type: 'warning',
      icon: 'warning',
    });

    if (ok) {
      setForm(defaultHomePageConfig);
      await resetHomePageConfig();
    }
  };

  const currentCoursesMode: 'all' | 'custom' = form.coursesDisplayMode || (form.featuredCourseIds && form.featuredCourseIds.length > 0 ? 'custom' : 'all');
  const currentNewsMode: 'all' | 'custom' = form.newsDisplayMode || (form.featuredNewsIds && form.featuredNewsIds.length > 0 ? 'custom' : 'all');
  const currentDrillsMode: 'all' | 'custom' = form.drillsDisplayMode || (form.featuredDrillIds && form.featuredDrillIds.length > 0 ? 'custom' : 'all');

  const toggleCourseSelection = (courseId: string) => {
    setForm((prev) => {
      const mode = prev.coursesDisplayMode || (prev.featuredCourseIds && prev.featuredCourseIds.length > 0 ? 'custom' : 'all');
      let current: string[];
      if (mode === 'all') {
        current = courses.map((c) => c.id);
      } else {
        current = prev.featuredCourseIds || [];
      }
      const exists = current.includes(courseId);
      const updated = exists ? current.filter((id) => id !== courseId) : [...current, courseId];
      return {
        ...prev,
        coursesDisplayMode: 'custom',
        featuredCourseIds: updated,
      };
    });
  };

  const toggleNewsSelection = (newsId: string) => {
    setForm((prev) => {
      const mode = prev.newsDisplayMode || (prev.featuredNewsIds && prev.featuredNewsIds.length > 0 ? 'custom' : 'all');
      let current: string[];
      if (mode === 'all') {
        current = newsPosts.slice(0, 3).map((p) => p.id);
      } else {
        current = prev.featuredNewsIds || [];
      }
      const exists = current.includes(newsId);
      const updated = exists ? current.filter((id) => id !== newsId) : [...current, newsId];
      return {
        ...prev,
        newsDisplayMode: 'custom',
        featuredNewsIds: updated,
      };
    });
  };

  const toggleDrillSelection = (drillId: string) => {
    setForm((prev) => {
      const mode = prev.drillsDisplayMode || (prev.featuredDrillIds && prev.featuredDrillIds.length > 0 ? 'custom' : 'all');
      let current: string[];
      if (mode === 'all') {
        current = trainings.map((t) => t.id);
      } else {
        current = prev.featuredDrillIds || [];
      }
      const exists = current.includes(drillId);
      const updated = exists ? current.filter((id) => id !== drillId) : [...current, drillId];
      return {
        ...prev,
        drillsDisplayMode: 'custom',
        featuredDrillIds: updated,
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Actions */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light mb-1">
              <Home className="w-4 h-4" />
              <span>Homepage Settings</span>
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              Homepage Manager
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-3xl">
              Control what visitors see on the front page. Turn sections ON or OFF, change headlines, and choose which courses or news to show.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Website</span>
            </a>

            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gray-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Quick Section Summary Strip */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {[
            { label: 'Notice Bar', key: 'showNoticeBanner', visible: form.showNoticeBanner },
            { label: 'Main Banner', key: 'showHero', visible: form.showHero },
            { label: 'News Ticker', key: 'showNewsSection', visible: form.showNewsSection },
            { label: 'Courses', key: 'showCoursesSection', visible: form.showCoursesSection },
            { label: 'Student Box', key: 'showPortalBanner', visible: form.showPortalBanner },
            { label: 'Numbers', key: 'showStatsSection', visible: form.showStatsSection },
            { label: 'Drills', key: 'showTrainingSection', visible: form.showTrainingSection },
            { label: 'Why Choose Us', key: 'showWhyChooseUs', visible: form.showWhyChooseUs },
          ].map((sec, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, [sec.key]: !prev[sec.key as keyof typeof form] }))}
              title={`Click to turn ${sec.label} ${sec.visible ? 'OFF' : 'ON'}`}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                sec.visible
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/50 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60'
                  : 'bg-gray-50/60 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-400 hover:bg-gray-100/60'
              }`}
            >
              <div className="text-[10px] font-black uppercase tracking-wider">{sec.label}</div>
              <div className="text-[11px] font-extrabold flex items-center justify-center gap-1 mt-0.5">
                {sec.visible ? (
                  <>
                    <Eye className="w-3 h-3 text-emerald-500" />
                    <span>ON</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-gray-400" />
                    <span>OFF</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </FlatCard>

      {/* ========================================================================= */}
      {/* 1. TOP RED NOTICE BAR                                                     */}
      {/* ========================================================================= */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  1. Top Red Notice Bar
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  form.showNoticeBanner ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  {form.showNoticeBanner ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A red alert strip at the very top of the website for urgent announcements or admission dates.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.showNoticeBanner}
              onChange={(e) => setForm({ ...form, showNoticeBanner: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {form.showNoticeBanner && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                Notice Message
              </label>
              <input
                type="text"
                value={form.noticeBannerText}
                onChange={(e) => setForm({ ...form, noticeBannerText: e.target.value })}
                placeholder="e.g. Admissions Open 2026 - Central Fire Safety Institute Vadodara"
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                Badge Text
              </label>
              <input
                type="text"
                value={form.noticeBannerBadge}
                onChange={(e) => setForm({ ...form, noticeBannerBadge: e.target.value })}
                placeholder="e.g. Notice or Urgent"
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </FlatCard>

      {/* ========================================================================= */}
      {/* 2. MAIN HERO BANNER                                                       */}
      {/* ========================================================================= */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  2. Main Banner
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  form.showHero ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  {form.showHero ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The big top banner with your main headline, photos, and buttons.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSectionOpen('hero')}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {openSections.hero ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.showHero}
                onChange={(e) => setForm({ ...form, showHero: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {form.showHero && openSections.hero && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Institute Name / Main Title
                </label>
                <input
                  type="text"
                  value={form.heroHeadline}
                  onChange={(e) => setForm({ ...form, heroHeadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Accreditation Line
                </label>
                <input
                  type="text"
                  value={form.heroSubheadline}
                  onChange={(e) => setForm({ ...form, heroSubheadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                Motto / Tagline
              </label>
              <input
                type="text"
                value={form.heroTagline}
                onChange={(e) => setForm({ ...form, heroTagline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Button 1 Name
                </label>
                <input
                  type="text"
                  value={form.heroPrimaryBtnText}
                  onChange={(e) => setForm({ ...form, heroPrimaryBtnText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Button 1 Link
                </label>
                <input
                  type="text"
                  value={form.heroPrimaryBtnLink}
                  onChange={(e) => setForm({ ...form, heroPrimaryBtnLink: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Button 2 Name
                </label>
                <input
                  type="text"
                  value={form.heroSecondaryBtnText}
                  onChange={(e) => setForm({ ...form, heroSecondaryBtnText: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Button 2 Link
                </label>
                <input
                  type="text"
                  value={form.heroSecondaryBtnLink}
                  onChange={(e) => setForm({ ...form, heroSecondaryBtnLink: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}
      </FlatCard>

      {/* ========================================================================= */}
      {/* 3. COURSES ON HOMEPAGE                                                    */}
      {/* ========================================================================= */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  3. Courses on Homepage
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  form.showCoursesSection ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  {form.showCoursesSection ? 'Visible' : 'Hidden'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {currentCoursesMode === 'all'
                    ? `Showing All Courses (${courses.length})`
                    : `${((form.featuredCourseIds || []).filter(id => courses.some(c => c.id === id))).length} of ${courses.length} on Home`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pick which courses appear on the front page. All courses will still stay on the main Courses page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSectionOpen('courses')}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {openSections.courses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.showCoursesSection}
                onChange={(e) => setForm({ ...form, showCoursesSection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {form.showCoursesSection && openSections.courses && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={form.coursesSectionTitle}
                  onChange={(e) => setForm({ ...form, coursesSectionTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={form.coursesSectionSubtitle}
                  onChange={(e) => setForm({ ...form, coursesSectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Display Mode Switcher */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Display Mode</span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    ({currentCoursesMode === 'all' ? 'All courses displayed' : 'Custom selection'})
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {currentCoursesMode === 'all'
                    ? 'All catalog courses automatically show on the homepage.'
                    : 'Only selected courses with the "ON HOME" badge will appear on the homepage.'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, coursesDisplayMode: 'all' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentCoursesMode === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Show All Courses
                </button>
                <button
                  type="button"
                  onClick={() => setForm({
                    ...form,
                    coursesDisplayMode: 'custom',
                    featuredCourseIds: form.featuredCourseIds !== undefined && form.featuredCourseIds !== null
                      ? form.featuredCourseIds
                      : courses.map(c => c.id),
                  })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentCoursesMode === 'custom'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Custom Selection
                </button>
              </div>
            </div>

            {/* Course checklist */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {currentCoursesMode === 'all' ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      ℹ️ All courses are currently displayed. Click any course to customize selection.
                    </span>
                  ) : (
                    <span>
                      Select courses for homepage ({((form.featuredCourseIds || []).filter(id => courses.some(c => c.id === id))).length} of {courses.length} selected):
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coursesDisplayMode: 'custom', featuredCourseIds: courses.map((c) => c.id) })}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, coursesDisplayMode: 'custom', featuredCourseIds: [] })}
                    className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Deselect All (Hide All)
                  </button>
                </div>
              </div>

              {courses.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-xs text-gray-500">
                  No courses found. Add courses in the "Courses" tab first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {courses.map((course) => {
                    const isSelected = currentCoursesMode === 'all'
                      ? true
                      : Boolean(form.featuredCourseIds && form.featuredCourseIds.includes(course.id));
                    return (
                      <div
                        key={course.id}
                        onClick={() => toggleCourseSelection(course.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-400 dark:border-blue-500/40 text-blue-900 dark:text-blue-200 shadow-sm'
                            : 'bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10 opacity-75'
                        }`}
                      >
                        <div className="mt-0.5 text-primary">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{course.title}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span>{course.duration}</span>
                            <span>•</span>
                            <span>{course.fee}</span>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
                            {currentCoursesMode === 'all' ? 'INCLUDED' : 'ON HOME'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-500 shrink-0">
                            HIDDEN
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentCoursesMode === 'custom' && (!form.featuredCourseIds || form.featuredCourseIds.length === 0) && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    No courses are selected. With Custom Selection active and 0 courses chosen, the courses section on the homepage will be empty. Tick courses above or click <strong>Show All Courses</strong>.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </FlatCard>

      {/* ========================================================================= */}
      {/* 4. NEWS & ANNOUNCEMENTS                                                   */}
      {/* ========================================================================= */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  4. News & Notices
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  form.showNewsSection ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  {form.showNewsSection ? 'Visible' : 'Hidden'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {currentNewsMode === 'all'
                    ? 'Showing Latest 3 (Auto)'
                    : `${((form.featuredNewsIds || []).filter(id => newsPosts.some(p => p.id === id))).length} of ${newsPosts.length} on Home`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Turn the scrolling text on or off, and pick which news cards appear on the front page.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSectionOpen('news')}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {openSections.news ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.showNewsSection}
                onChange={(e) => setForm({ ...form, showNewsSection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {form.showNewsSection && openSections.news && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10">
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Scrolling News Ticker
                </span>
                <p className="text-[11px] text-gray-500">
                  A moving text strip with latest news across the top.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showNewsTicker}
                  onChange={(e) => setForm({ ...form, showNewsTicker: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={form.newsSectionTitle}
                  onChange={(e) => setForm({ ...form, newsSectionTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={form.newsSectionSubtitle}
                  onChange={(e) => setForm({ ...form, newsSectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* News Display Mode Switcher */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Display Mode</span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    ({currentNewsMode === 'all' ? 'Auto latest news' : 'Custom selection'})
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {currentNewsMode === 'all'
                    ? 'Automatically shows the 3 most recent news articles.'
                    : 'Only selected news articles with the "ON HOME" badge will appear.'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, newsDisplayMode: 'all' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentNewsMode === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Latest 3 (Auto)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({
                    ...form,
                    newsDisplayMode: 'custom',
                    featuredNewsIds: form.featuredNewsIds !== undefined && form.featuredNewsIds !== null
                      ? form.featuredNewsIds
                      : newsPosts.slice(0, 3).map(p => p.id),
                  })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentNewsMode === 'custom'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Custom Selection
                </button>
              </div>
            </div>

            {/* News checklist */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {currentNewsMode === 'all' ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      ℹ️ Showing top 3 latest articles automatically. Click any article to customize.
                    </span>
                  ) : (
                    <span>
                      Select news for homepage ({((form.featuredNewsIds || []).filter(id => newsPosts.some(p => p.id === id))).length} of {newsPosts.length} selected):
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, newsDisplayMode: 'custom', featuredNewsIds: newsPosts.map((p) => p.id) })}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, newsDisplayMode: 'custom', featuredNewsIds: [] })}
                    className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Deselect All (Hide All)
                  </button>
                </div>
              </div>

              {newsPosts.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-xs text-gray-500">
                  No news articles found. Add news in the "News & Notices" tab first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {newsPosts.map((post, idx) => {
                    const isSelected = currentNewsMode === 'all'
                      ? idx < 3
                      : Boolean(form.featuredNewsIds && form.featuredNewsIds.includes(post.id));
                    return (
                      <div
                        key={post.id}
                        onClick={() => toggleNewsSelection(post.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-400 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-sm'
                            : 'bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10 opacity-75'
                        }`}
                      >
                        <div className="mt-0.5 text-amber-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{post.title}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span>{post.category}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white shrink-0">
                            {currentNewsMode === 'all' ? 'AUTO (LATEST)' : 'ON HOME'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-500 shrink-0">
                            HIDDEN
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentNewsMode === 'custom' && (!form.featuredNewsIds || form.featuredNewsIds.length === 0) && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    No news articles are selected. With Custom Selection active and 0 chosen, the news section on the homepage will be empty. Tick articles above or switch to <strong>Latest 3 (Auto)</strong>.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </FlatCard>

      {/* ========================================================================= */}
      {/* 5. NUMBERS & ACHIEVEMENTS                                                 */}
      {/* ========================================================================= */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  5. Numbers & Achievements
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  form.showStatsSection ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  {form.showStatsSection ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The 4 big achievement numbers shown on the homepage (like students trained, courses, years).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSectionOpen('stats')}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              {openSections.stats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.showStatsSection}
                onChange={(e) => setForm({ ...form, showStatsSection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {form.showStatsSection && openSections.stats && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(form.stats || []).map((st, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-dark-bg space-y-2">
                  <div className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                    Box #{idx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Number</label>
                      <input
                        type="number"
                        value={st.value}
                        onChange={(e) => {
                          const updated = [...(form.stats || [])];
                          updated[idx] = { ...updated[idx], value: Number(e.target.value) };
                          setForm({ ...form, stats: updated });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 font-bold"
                      />
                    </div>
                    <div className="w-16">
                      <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Symbol</label>
                      <input
                        type="text"
                        value={st.suffix}
                        onChange={(e) => {
                          const updated = [...(form.stats || [])];
                          updated[idx] = { ...updated[idx], suffix: e.target.value };
                          setForm({ ...form, stats: updated });
                        }}
                        placeholder="+"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 font-bold text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Title</label>
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => {
                        const updated = [...(form.stats || [])];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setForm({ ...form, stats: updated });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Short Description</label>
                    <input
                      type="text"
                      value={st.sublabel}
                      onChange={(e) => {
                        const updated = [...(form.stats || [])];
                        updated[idx] = { ...updated[idx], sublabel: e.target.value };
                        setForm({ ...form, stats: updated });
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </FlatCard>

      {/* ========================================================================= */}
      {/* 6. STUDENT LOGIN BOX                                                      */}
      {/* ========================================================================= */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  6. Student Login Box
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  form.showPortalBanner ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  {form.showPortalBanner ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A banner on the homepage inviting students to log in and check their drill attendance.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.showPortalBanner}
              onChange={(e) => setForm({ ...form, showPortalBanner: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {form.showPortalBanner && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                Box Heading
              </label>
              <input
                type="text"
                value={form.portalBannerTitle}
                onChange={(e) => setForm({ ...form, portalBannerTitle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                Short Description
              </label>
              <input
                type="text"
                value={form.portalBannerSubtitle}
                onChange={(e) => setForm({ ...form, portalBannerSubtitle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </FlatCard>

      {/* ========================================================================= */}
      {/* 7. PRACTICAL TRAINING DRILLS                                              */}
      {/* ========================================================================= */}
      <FlatCard hoverEffect={false} className="p-6 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-base text-gray-900 dark:text-white">
                  7. Practical Training Drills
                </h3>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  form.showTrainingSection ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                }`}>
                  {form.showTrainingSection ? 'Visible' : 'Hidden'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {currentDrillsMode === 'all'
                    ? `Showing All Drills (${trainings.length})`
                    : `${((form.featuredDrillIds || []).filter(id => trainings.some(t => t.id === id))).length} of ${trainings.length} on Home`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pick which practical drill photos to feature on the front page.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.showTrainingSection}
              onChange={(e) => setForm({ ...form, showTrainingSection: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {form.showTrainingSection && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={form.trainingSectionTitle}
                  onChange={(e) => setForm({ ...form, trainingSectionTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={form.trainingSectionSubtitle}
                  onChange={(e) => setForm({ ...form, trainingSectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Drills Display Mode Switcher */}
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-dark-bg border border-gray-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Display Mode</span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    ({currentDrillsMode === 'all' ? 'All drills displayed' : 'Custom selection'})
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {currentDrillsMode === 'all'
                    ? 'All catalog drills automatically show on the homepage.'
                    : 'Only selected drills with the "ON HOME" badge will appear.'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, drillsDisplayMode: 'all' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentDrillsMode === 'all'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Show All Drills
                </button>
                <button
                  type="button"
                  onClick={() => setForm({
                    ...form,
                    drillsDisplayMode: 'custom',
                    featuredDrillIds: form.featuredDrillIds !== undefined && form.featuredDrillIds !== null
                      ? form.featuredDrillIds
                      : trainings.map(t => t.id),
                  })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentDrillsMode === 'custom'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Custom Selection
                </button>
              </div>
            </div>

            {/* Drill Selection */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {currentDrillsMode === 'all' ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      ℹ️ All drills are currently displayed. Click any drill to customize selection.
                    </span>
                  ) : (
                    <span>
                      Select drills for homepage ({((form.featuredDrillIds || []).filter(id => trainings.some(t => t.id === id))).length} of {trainings.length} selected):
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, drillsDisplayMode: 'custom', featuredDrillIds: trainings.map((t) => t.id) })}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, drillsDisplayMode: 'custom', featuredDrillIds: [] })}
                    className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Deselect All (Hide All)
                  </button>
                </div>
              </div>

              {trainings.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-center text-xs text-gray-500">
                  No drills found. Add drills in the "Training Drills" tab first.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {trainings.map((drill) => {
                    const isSelected = currentDrillsMode === 'all'
                      ? true
                      : Boolean(form.featuredDrillIds && form.featuredDrillIds.includes(drill.id));
                    return (
                      <div
                        key={drill.id}
                        onClick={() => toggleDrillSelection(drill.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-400 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-sm'
                            : 'bg-gray-50/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10 opacity-75'
                        }`}
                      >
                        <div className="mt-0.5 text-amber-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate">{drill.title}</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            Tag: {drill.tag} • {drill.duration}
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500 text-white shrink-0">
                            {currentDrillsMode === 'all' ? 'INCLUDED' : 'ON HOME'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-500 shrink-0">
                            HIDDEN
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {currentDrillsMode === 'custom' && (!form.featuredDrillIds || form.featuredDrillIds.length === 0) && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    No drills are selected. With Custom Selection active and 0 chosen, the training drills section on the homepage will be empty. Tick drills above or switch to <strong>Show All Drills</strong>.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </FlatCard>

      {/* ========================================================================= */}
      {/* 8, 9, 10: QUICK SECTION SWITCHES                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Why Choose Us */}
        <FlatCard hoverEffect={false} className="p-5 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f] flex flex-col justify-between">
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-primary dark:text-primary-light">Reasons</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showWhyChooseUs}
                  onChange={(e) => setForm({ ...form, showWhyChooseUs: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white">
              8. Why Choose Us
            </h4>
            <p className="text-[11px] text-gray-500">
              Points explaining why students should join CFSI.
            </p>
          </div>
          <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
            {form.showWhyChooseUs ? '✓ Visible on Homepage' : '✕ Hidden from Homepage'}
          </div>
        </FlatCard>

        {/* Recruiters Strip */}
        <FlatCard hoverEffect={false} className="p-5 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f] flex flex-col justify-between">
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-blue-500">Companies</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showRecruitersStrip}
                  onChange={(e) => setForm({ ...form, showRecruitersStrip: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white">
              9. Company Logos
            </h4>
            <p className="text-[11px] text-gray-500">
              Logos of companies where students get jobs (Reliance, L&T, etc.).
            </p>
          </div>
          <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
            {form.showRecruitersStrip ? '✓ Visible on Homepage' : '✕ Hidden from Homepage'}
          </div>
        </FlatCard>

        {/* Cadet Testimonials */}
        <FlatCard hoverEffect={false} className="p-5 border border-gray-200/80 dark:border-white/10 shadow-sm bg-white dark:bg-[#12181f] flex flex-col justify-between">
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-purple-500">Reviews</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showTestimonials}
                  onChange={(e) => setForm({ ...form, showTestimonials: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <h4 className="font-heading font-black text-sm text-gray-900 dark:text-white">
              10. Student Reviews
            </h4>
            <p className="text-[11px] text-gray-500">
              Reviews and star ratings from past students.
            </p>
          </div>
          <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
            {form.showTestimonials ? '✓ Visible on Homepage' : '✕ Hidden from Homepage'}
          </div>
        </FlatCard>
      </div>

      {/* Floating Save Bar on Scroll */}
      <div className="sticky bottom-6 z-20 flex items-center justify-between p-4 rounded-2xl bg-gray-900/90 dark:bg-white/10 backdrop-blur-md text-white shadow-2xl border border-white/10">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-medium">Changes are previewed on this page. Click Save to update the website.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
