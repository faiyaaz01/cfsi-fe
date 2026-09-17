import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ArrowLeft, 
  GraduationCap,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { loginWithBackend } from '../lib/studentAuth';
import { clearAuth } from '../lib/api';
import { FlatCard } from '../components/common/FlatCard';
import { useAuth, homeFor } from '../context/AuthContext';
import cfsiLogo from '../assets/cfsi-logo.jpg';

export const InstituteLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setError('Please enter your official Institute Email or Username (e.g. admin@cfsi.com).');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your administrative password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithBackend(cleanUsername, cleanPassword, 'institute');
      setIsSubmitting(false);

      if (result.success) {
        // Enforce: only admin and teacher are permitted in Institute Login
        if (result.role === 'student' || result.role === 'leader') {
          clearAuth();
          setError(
            'Access restricted: Student and Cadet Leader accounts cannot log in through Institute Login. Please use the Student Login portal.'
          );
          return;
        }

        await refresh();

        if (result.role === 'admin') {
          toast.success('Admin Management Console Unlocked', {
            description: 'Full institutional control and registry access active.'
          });
          navigate('/dashboard');
        } else if (result.role === 'teacher') {
          toast.success('Faculty Dashboard Unlocked', {
            description: 'Accessing training schedules and muster attendance.'
          });
          navigate('/teacher/dashboard', { replace: true });
        } else if (user) {
          navigate(homeFor(user));
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(
          result.error || 
          'Authentication failed. Invalid official email or administrative password.'
        );
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Institutional login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-gradient-to-b from-blue-50/50 via-gray-50 to-gray-50 dark:from-dark-bg dark:via-dark-bg dark:to-[#0c121d] min-h-screen flex items-center justify-center transition-colors duration-300 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
        {/* Top Back and Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <Link
            to="/student-login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student Login →</span>
          </Link>
        </div>

        {/* Existing Session Banner if already logged in */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-primary dark:text-primary-light">
                Active Session ({user.role.toUpperCase()})
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Logged in as <span className="font-semibold">{user.full_name || user.username}</span>
              </p>
            </div>
            <Link
              to={homeFor(user)}
              className="px-3 py-1 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-colors"
            >
              Go to Dashboard →
            </Link>
          </motion.div>
        )}

        {/* Institute Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <FlatCard className="p-6 sm:p-8 border border-blue-200/70 dark:border-white/10 shadow-xl relative overflow-hidden bg-white dark:bg-[#161d27]">
            
            {/* Top decorative gradient accent (Navy Blue Institutional) */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-primary to-slate-800 absolute top-0 left-0" />

            {/* Header Identity */}
            <div className="text-center mb-6 pt-2">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-primary to-blue-500 shadow-md mb-3">
                <img
                  src={cfsiLogo}
                  alt="CFSI Vadodara Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>

              <h1 className="text-2xl font-heading font-black text-gray-900 dark:text-white">
                Institute Login
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Authorized management portal for CFSI Instructors, Officers & Admin.
              </p>
            </div>

            {/* Institute Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Official Email / Username */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Official Email or Username *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="e.g. admin@cfsi.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    autoComplete="username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Administrative Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Administrative Password *
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Inline Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{error}</span>
                    {(error.includes('Student') || error.includes('student')) && (
                      <div className="mt-2">
                        <Link
                          to="/student-login"
                          className="inline-flex items-center gap-1 font-bold text-accent hover:underline text-xs"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Switch to Student Login Portal →</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-md bg-primary hover:bg-primary-dark shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {isSubmitting ? 'Authenticating Institute Session...' : 'Sign In to Institute Portal'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Switch to Student Login */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 text-center text-xs text-gray-500 dark:text-gray-400">
              <span>Are you a CFSI Student? </span>
              <Link to="/student-login" className="text-accent font-bold hover:underline">
                Student Login →
              </Link>
            </div>

          </FlatCard>
        </motion.div>

      </div>
    </div>
  );
};
