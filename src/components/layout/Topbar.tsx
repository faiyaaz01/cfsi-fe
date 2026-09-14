import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, GraduationCap, Lock, Users, LogOut, LayoutDashboard, Building2 } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth, homeFor } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const portalPath = user ? homeFor(user) : '/login';

  return (
    <div className="bg-[#1e5fd9] dark:bg-[#12181f] text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/10 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1.5 gap-x-4">
        
        {/* Left: Contact Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-xs">
          <a
            href="tel:+917203016100"
            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-medium"
          >
            <Phone className="w-3 h-3 text-amber-300" />
            <span>+91 7203016100</span>
          </a>
          <span className="hidden sm:inline text-white/30">|</span>
          <a
            href="tel:+919974983819"
            className="hidden md:inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-medium"
          >
            <Phone className="w-3 h-3 text-amber-300" />
            <span>+91 9974983819</span>
          </a>
          <span className="hidden md:inline text-white/30">|</span>
          <a
            href="mailto:info@cfsi.co.in"
            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-medium"
          >
            <Mail className="w-3 h-3 text-amber-300" />
            <span>info@cfsi.co.in</span>
          </a>
        </div>

        {/* Right: Authenticated Session Controls OR Guest Portal Entry */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          
          {user ? (
            <div className="flex items-center gap-2">
              {/* Logged in User Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 dark:bg-white/10 text-white text-[11px] font-semibold border border-white/20">
                <div className="w-4 h-4 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center font-black text-[9px]">
                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[120px] sm:max-w-[160px]">{user.full_name || user.username}</span>
                <span className="text-[10px] uppercase font-bold text-amber-300">
                  • {user.role}
                </span>
              </div>

              {/* Manage Users button (Admin only) */}
              {user.role === 'admin' && (
                <Link
                  to="/users"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 hover:text-amber-200 border border-amber-400/30 text-[11px] font-bold transition-all shadow-sm active:scale-95"
                  title="Institutional User & Credentials Management"
                >
                  <Users className="w-3 h-3" />
                  <span>Manage users</span>
                </Link>
              )}

              {/* Portal Dashboard link */}
              <Link
                to={portalPath}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-gray-950 text-[11px] font-extrabold transition-all duration-200 hover:scale-105 active:scale-95"
                title="Go to Institutional Dashboard"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Dashboard</span>
              </Link>

              {/* Sign Out button */}
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 text-[11px] font-medium transition-colors active:scale-95"
                title="Sign out of current session"
              >
                <LogOut className="w-3 h-3 text-red-300" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Student Login */}
              <Link
                to="/student-login"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-gray-950 hover:bg-amber-300 font-extrabold text-[11px] shadow-xs transition-all duration-200 hover:scale-105"
                title="Student Login Portal"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </Link>

              {/* Institute Staff Login */}
              <Link
                to="/institute-login"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white hover:bg-white/25 font-bold text-[11px] shadow-xs transition-all duration-200 hover:scale-105"
                title="Institute Staff & Faculty Login"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Institute Login</span>
              </Link>
            </div>
          )}

          <span className="text-white/30">|</span>

          {/* Social Links */}
          <div className="hidden lg:flex items-center gap-1.5 pr-2.5 border-r border-white/20">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          {/* Location Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 dark:bg-white/10 text-[11px] font-semibold">
            <span className="text-xs" title="India">🇮🇳</span>
            <span className="text-white/90">Vadodara, Gujarat</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle showLabel={false} />
        </div>

      </div>
    </div>
  );
};
