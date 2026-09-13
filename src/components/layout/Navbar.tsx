import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck, 
  Image as ImageIcon, 
  Video, 
  Users,
  GraduationCap
} from 'lucide-react';
import { coursesData } from '../../data/courses';
import cfsiLogo from '../../assets/cfsi-logo.jpg';
import { getLoggedStudent } from '../../lib/studentAuth';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'gallery' | 'courses' | null>(null);
  const location = useLocation();

  const loggedStudent = getLoggedStudent();
  const isAdminLogged = typeof window !== 'undefined' && sessionStorage.getItem('cfsi_admin_logged') === 'true';
  const isLogged = Boolean(loggedStudent || isAdminLogged);
  const portalPath = loggedStudent ? '/student/dashboard' : '/dashboard';

  const navContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Click outside to close any open dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavLinkClass = (isActive: boolean) =>
    `relative px-3.5 py-1.5 rounded-lg text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-150 ${
      isActive
        ? 'text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 font-bold'
        : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100/60 dark:hover:bg-white/5'
    }`;

  const isGalleryActive = location.pathname.startsWith('/gallery');
  const isCoursesActive = location.pathname.startsWith('/courses') || location.pathname === '/student-data';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#12181f]/95 backdrop-blur-md shadow-sm py-2 border-b border-gray-200/80 dark:border-white/10'
          : 'bg-white dark:bg-[#161d27] shadow-sm py-2.5 border-b border-gray-100 dark:border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name — Clean & Attractive with Steady Colors */}
          <Link to="/" className="flex items-center gap-3 shrink-0 select-none">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-primary via-[#2b6be3] to-accent shadow-sm">
              <img
                src={cfsiLogo}
                alt="Central Fire Safety Institute Vadodara Official Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-heading font-black text-xl sm:text-2xl text-primary dark:text-[#4d84e2] tracking-tight leading-none mb-1">
                CFSI
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Central Fire Safety Institute
                </span>
                <span className="hidden md:inline text-[11px] text-gray-400 dark:text-gray-500">• Vadodara</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links — Click-based, Steady & Clean */}
          <nav ref={navContainerRef} className="hidden xl:flex items-center gap-1">
            
            <NavLink to="/" className={({ isActive }) => getNavLinkClass(isActive)} end>
              Home
            </NavLink>

            <NavLink to="/about" className={({ isActive }) => getNavLinkClass(isActive)}>
              About Us
            </NavLink>

            <NavLink to="/mission" className={({ isActive }) => getNavLinkClass(isActive)}>
              Our Mission
            </NavLink>

            {/* Gallery Dropdown (Click to toggle) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(prev => prev === 'gallery' ? null : 'gallery')}
                className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-150 inline-flex items-center gap-1 cursor-pointer ${
                  isGalleryActive || activeDropdown === 'gallery'
                    ? 'text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 font-bold'
                    : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100/60 dark:hover:bg-white/5'
                }`}
              >
                <span>Gallery</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'gallery' ? 'rotate-180 text-primary' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'gallery' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-56 rounded-2xl bg-white dark:bg-[#161d27] shadow-xl border border-gray-100 dark:border-white/10 p-2 z-50"
                  >
                    <Link
                      to="/gallery/images"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary dark:hover:bg-white/5 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">Photo Gallery</div>
                        <div className="text-[10px] text-gray-400">Drills & Campus Moments</div>
                      </div>
                    </Link>

                    <Link
                      to="/gallery/videos"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-white/5 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 dark:bg-red-500/20">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">Video Gallery</div>
                        <div className="text-[10px] text-gray-400">14 Live Drill Videos</div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Courses Dropdown (Click to toggle) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(prev => prev === 'courses' ? null : 'courses')}
                className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-semibold tracking-wide whitespace-nowrap transition-colors duration-150 inline-flex items-center gap-1 cursor-pointer ${
                  isCoursesActive || activeDropdown === 'courses'
                    ? 'text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 font-bold'
                    : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light hover:bg-gray-100/60 dark:hover:bg-white/5'
                }`}
              >
                <span>Courses</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'courses' ? 'rotate-180 text-primary' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'courses' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl bg-white dark:bg-[#161d27] shadow-xl border border-gray-100 dark:border-white/10 p-2.5 z-50"
                  >
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Certified Programs
                    </div>
                    {coursesData.map((c) => (
                      <Link
                        key={c.id}
                        to={`/courses/${c.slug}`}
                        className="block px-3 py-2 rounded-xl text-xs hover:bg-primary/10 hover:text-primary dark:hover:bg-white/5 transition-colors group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light">
                          {c.title}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          {c.duration} • {c.eligibility}
                        </div>
                      </Link>
                    ))}

                    <div className="my-1.5 border-t border-gray-100 dark:border-white/10" />

                    <Link
                      to="/student-data"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-primary dark:text-primary-light hover:bg-primary/10 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Users className="w-4 h-4 text-accent" />
                      <span>Pass Out Student Roster</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavLink to="/career" className={({ isActive }) => getNavLinkClass(isActive)}>
              Career
            </NavLink>

            <NavLink to="/news" className={({ isActive }) => getNavLinkClass(isActive)}>
              News & Events
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) => getNavLinkClass(isActive)}>
              Contact Us
            </NavLink>

          </nav>

          {/* Right Action Button */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {isLogged ? (
              <>
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 border border-emerald-300/40 shadow-sm transition-all duration-200 active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Certificate</span>
                </Link>
                <Link
                  to={portalPath}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition-all duration-200 active:scale-95"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>My Portal</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-accent hover:bg-accent-hover shadow-sm transition-all duration-200 active:scale-95"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 xl:hidden">
            {isLogged ? (
              <Link
                to="/verify"
                className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="sm:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-accent shadow-sm"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-accent" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="xl:hidden bg-white dark:bg-[#161d27] border-b border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
              
              {/* Primary Links Grid */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-100 dark:border-white/10">
                <Link
                  to="/"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/mission"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Our Mission
                </Link>
                <Link
                  to="/career"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Career
                </Link>
                <Link
                  to="/news"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  News & Events
                </Link>
                <Link
                  to="/contact"
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </div>

              {/* Gallery Section */}
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1">
                  Galleries
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/gallery/images"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span>Photo Gallery</span>
                  </Link>
                  <Link
                    to="/gallery/videos"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <Video className="w-4 h-4 text-red-500" />
                    <span>Video Drills (14)</span>
                  </Link>
                </div>
              </div>

              {/* Courses Section */}
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1">
                  Certified Courses
                </div>
                <div className="space-y-1">
                  <Link
                    to="/courses/certificate-in-fire-safety"
                    className="block px-3.5 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Certificate In Fire Safety (6 Months)
                  </Link>
                  <Link
                    to="/courses/diploma-in-fire-safety"
                    className="block px-3.5 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Diploma In Fire Safety (1 Year)
                  </Link>
                  <Link
                    to="/courses/sub-fire-officer"
                    className="block px-3.5 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Sub Fire Officer (SFO) (6 Months)
                  </Link>
                  <Link
                    to="/courses/industrial-safety"
                    className="block px-3.5 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Industrial Safety (3 Months)
                  </Link>
                  <Link
                    to="/student-data"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-primary dark:text-primary-light hover:bg-primary/5"
                  >
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>Pass Out Student Roster</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Student Portal & Action Buttons */}
              <div className="pt-2 border-t border-gray-100 dark:border-white/10 space-y-2">
                {isLogged ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/verify"
                        className="text-center py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Certificate</span>
                      </Link>
                      <Link
                        to={portalPath}
                        className="text-center py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>My Portal</span>
                      </Link>
                    </div>
                    <Link
                      to="/contact"
                      className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-200 transition-colors block"
                    >
                      Contact Us
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Portal Login (Student & Admin)</span>
                    </Link>
                    <Link
                      to="/contact"
                      className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-200 transition-colors block"
                    >
                      Contact Us
                    </Link>
                  </>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
