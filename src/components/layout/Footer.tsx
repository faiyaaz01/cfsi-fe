import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  ChevronRight,
  GraduationCap,
  Building2
} from 'lucide-react';
import cfsiLogo from '../../assets/cfsi-logo.jpg';

export const Footer: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Hide CTA banner on dashboards and for authenticated portal sessions
  const isDashboardRoute = 
    location.pathname.includes('dashboard') ||
    location.pathname.includes('users') ||
    location.pathname.includes('portal') ||
    location.pathname.includes('student-data');

  const showCtaBanner = !isDashboardRoute && !user;

  return (
    <footer className="bg-gray-100 dark:bg-[#12181f] text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-white/10 transition-colors duration-300 w-full max-w-full overflow-hidden">
      
      {/* Top CTA Banner (Hidden on dashboards after login) */}
      {showCtaBanner && (
        <div className="bg-gradient-to-r from-primary via-[#1e5fd9] to-[#1648a8] text-white py-6 sm:py-8 px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Ready to Build a Rewarding Career in Fire & Industrial Safety?
              </h3>
              <p className="text-white/80 text-sm">
                Admissions open for Certificate & Diploma Batches 2024-25. 100% ground drill & job assistance.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/courses"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-primary hover:bg-gray-100 transition-all shadow-md hover:scale-105"
              >
                Explore Courses
              </Link>
              <Link
                to="/contact"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-accent text-white hover:bg-accent-hover transition-all shadow-md hover:scale-105"
              >
                Get Free Counselling
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Col 1: Institute Info with Official Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-primary to-accent shadow-md shrink-0">
                <img
                  src={cfsiLogo}
                  alt="CFSI Vadodara Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div>
                <span className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                  CFSI
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  Central Fire Safety Institute
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Shaping Fire Safety Professionals Across India. Government registered and AIIFTSM affiliated vocational institute headquartered in Vadodara, Gujarat.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Affiliation:</span>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                AIIFTSM Accredited
              </span>
            </div>

            {/* Social Icons with SVG */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-[#1877f2] hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter X"
                className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-black hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-[#0077b5] hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Quick Navigation</span>
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/about#mission" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  <span>Our Mission & Values</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery/images" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  <span>Photo Gallery</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery/videos" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  <span>Video Gallery (14 Drills)</span>
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  <span>Latest News & Events</span>
                </Link>
              </li>
              <li>
                <Link to="/student-login" className="text-accent font-bold hover:underline transition-colors flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-accent" />
                  <span>Student Login</span>
                </Link>
              </li>
              <li>
                <Link to="/institute-login" className="text-primary dark:text-primary-light font-bold hover:text-accent transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Institute Staff Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Programs Offered */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Training Programs</span>
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="p-2.5 rounded-lg bg-white dark:bg-[#161d27] border border-gray-200/60 dark:border-white/5">
                <Link to="/courses/certificate-in-fire-safety" className="group block">
                  <div className="font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors text-xs sm:text-sm">
                    Certificate In Fire Safety
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Duration: 6 Months • 10th Pass</div>
                </Link>
              </li>
              <li className="p-2.5 rounded-lg bg-white dark:bg-[#161d27] border border-gray-200/60 dark:border-white/5">
                <Link to="/courses/diploma-in-fire-safety" className="group block">
                  <div className="font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors text-xs sm:text-sm">
                    Diploma In Fire Safety
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Duration: 1 Year • 12th Pass</div>
                </Link>
              </li>
              <li className="p-2.5 rounded-lg bg-white dark:bg-[#161d27] border border-gray-200/60 dark:border-white/5">
                <Link to="/courses/sub-fire-officer" className="group block">
                  <div className="font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors text-xs sm:text-sm">
                    Sub Fire Officer (SFO)
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Duration: 6 Months • Physical Fitness</div>
                </Link>
              </li>
              <li className="p-2.5 rounded-lg bg-white dark:bg-[#161d27] border border-gray-200/60 dark:border-white/5">
                <Link to="/courses/industrial-safety" className="group block">
                  <div className="font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors text-xs sm:text-sm">
                    Industrial Safety
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Duration: 3 Months • Any Graduate</div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Get In Touch */}
          <div>
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Get In Touch</span>
            </h4>

            {/* All Contact Details In One Clean View */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/5 space-y-4 text-xs shadow-xs">
              {/* Phone Numbers */}
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-accent/10 text-accent dark:bg-accent/20 shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Admissions & General Hotline:</p>
                  <div className="space-y-0.5">
                    <a
                      href="tel:+917203016100"
                      className="block font-bold text-sm text-primary dark:text-primary-light hover:text-accent transition-colors"
                    >
                      +91 7203016100
                    </a>
                    <a
                      href="tel:+917203016101"
                      className="block font-bold text-sm text-gray-800 dark:text-gray-200 hover:text-accent transition-colors"
                    >
                      +91 7203016101
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 pt-0.5 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>Mon - Sat: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5 pt-3.5 border-t border-gray-100 dark:border-white/5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Official Email:</p>
                  <div className="space-y-0.5">
                    <a
                      href="mailto:centralfirevadodara@gmail.com"
                      className="block font-bold text-gray-800 dark:text-gray-200 hover:text-accent transition-colors truncate"
                    >
                      centralfirevadodara@gmail.com
                    </a>
                    <a
                      href="mailto:admissions@cfsi.co.in"
                      className="block font-medium text-gray-600 dark:text-gray-400 hover:text-accent transition-colors truncate"
                    >
                      admissions@cfsi.co.in
                    </a>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5 pt-3.5 border-t border-gray-100 dark:border-white/5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Campus Address:</p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-[11px]">
                    Central Fire Safety Institute (CFSI), Near GIDC Industrial Zone, Waghodia Road, Vadodara, Gujarat - 390019
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 text-primary dark:text-primary-light font-bold hover:underline pt-0.5 text-xs"
                  >
                    <span>View Map & Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Central Fire Safety Institute (CFSI) — Vadodara, Gujarat. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <Link to="/about" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link to="/about" className="hover:underline">Terms of Admission</Link>
            <span>•</span>
            <Link to="/student-login" className="hover:underline">Student Login</Link>
            <span>•</span>
            <Link to="/institute-login" className="hover:underline">Institute Login</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
