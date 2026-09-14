import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  ArrowLeft, 
  Calendar,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { loginWithBackend } from '../lib/studentAuth';
import { FlatCard } from '../components/common/FlatCard';
import { useAuth, homeFor } from '../context/AuthContext';
import cfsiLogo from '../assets/cfsi-logo.jpg';

export const StudentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  // Form states
  const [rollNo, setRollNo] = useState('');
  const [dobPassword, setDobPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanRollNo = rollNo.trim();
    const cleanPassword = dobPassword.trim();

    if (!cleanRollNo) {
      setError('Please enter your Student ID / Roll Number (e.g. 262701).');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your Date of Birth password (DDMMYYYY format).');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginWithBackend(cleanRollNo, cleanPassword, 'auto');
      setIsSubmitting(false);

      if (result.success) {
        await refresh();

        if (result.role === 'student') {
          toast.success(`Welcome back, ${result.student?.name ? result.student.name : 'Student'}!`, {
            description: 'Accessing your attendance muster and student profile.'
          });
          navigate('/student/dashboard');
        } else if (result.role === 'admin' || result.role === 'teacher') {
          // If staff used student login, welcome them and redirect
          toast.success(`Institute Staff Account Detected (${result.role.toUpperCase()})`, {
            description: 'Redirecting to your management portal.'
          });
          navigate(result.role === 'admin' ? '/dashboard' : '/teacher/dashboard');
        } else if (user) {
          navigate(homeFor(user));
        } else {
          navigate('/');
        }
      } else {
        setError(
          result.error || 
          'Invalid Student ID or Date of Birth. Format: Roll No (e.g. 262701) and Birthdate (DDMMYYYY).'
        );
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Student login failed. Please verify your credentials.');
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-gradient-to-b from-orange-50/50 via-gray-50 to-gray-50 dark:from-dark-bg dark:via-dark-bg dark:to-[#0f141c] min-h-screen flex items-center justify-center transition-colors duration-300 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
        {/* Top Back and Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-accent dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <Link
            to="/institute-login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-light hover:underline"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Institute Login →</span>
          </Link>
        </div>

        {/* Existing Session Banner if already logged in */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-accent">
                Active Session ({user.role.toUpperCase()})
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Logged in as <span className="font-semibold">{user.full_name || user.username}</span>
              </p>
            </div>
            <Link
              to={homeFor(user)}
              className="px-3 py-1 rounded-lg bg-accent text-white font-bold text-xs hover:bg-accent-hover transition-colors"
            >
              Go to Dashboard →
            </Link>
          </motion.div>
        )}

        {/* Student Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <FlatCard className="p-6 sm:p-8 border border-orange-200/60 dark:border-white/10 shadow-xl relative overflow-hidden bg-white dark:bg-[#161d27]">
            
            {/* Top decorative gradient accent (Safety Orange & Flame) */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-accent to-amber-500 absolute top-0 left-0" />

            {/* Header Identity */}
            <div className="text-center mb-6 pt-2">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-accent to-amber-400 shadow-md mb-3">
                <img
                  src={cfsiLogo}
                  alt="CFSI Vadodara Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-accent dark:bg-orange-500/20 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Portal</span>
              </div>

              <h1 className="text-2xl font-heading font-black text-gray-900 dark:text-white">
                Student Login
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter your assigned Roll Number and Date of Birth to access your portal.
              </p>
            </div>

            {/* Helper Instructions Box */}
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px] leading-relaxed">
                <p>
                  <strong className="font-semibold">Student ID:</strong> Batch Year + Roll No (e.g., <code className="bg-white/80 dark:bg-black/30 px-1 py-0.5 rounded font-mono font-bold text-amber-700 dark:text-amber-300">262701</code>).
                </p>
                <p>
                  <strong className="font-semibold">Password:</strong> Your Date of Birth in <code className="bg-white/80 dark:bg-black/30 px-1 py-0.5 rounded font-mono font-bold text-amber-700 dark:text-amber-300">DDMMYYYY</code> format (e.g. 23/10/2006 → <code className="bg-white/80 dark:bg-black/30 px-1 py-0.5 rounded font-mono font-bold text-amber-700 dark:text-amber-300">23102006</code>).
                </p>
              </div>
            </div>

            {/* Student Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Student ID / Roll No */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Student ID / Roll Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => { setRollNo(e.target.value); setError(''); }}
                    placeholder="e.g. 262701"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent font-medium"
                    autoComplete="username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password (Date of Birth) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Password (Date of Birth: DDMMYYYY) *
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={dobPassword}
                    onChange={(e) => { setDobPassword(e.target.value); setError(''); }}
                    placeholder="e.g. 23102006"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent font-mono"
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
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Default password is your 8-digit birthdate without slashes or dashes.
                </p>
              </div>

              {/* Inline Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-medium flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-md bg-accent hover:bg-accent-hover shadow-accent/25 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {isSubmitting ? 'Verifying Student Record...' : 'Sign In as Student'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Portal Highlights */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10 grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Real-time Attendance</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Muster Slot Tracker</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>24-Hour Live Updates</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Verified Student Profile</span>
              </span>
            </div>

            {/* Switch to Institute Login */}
            <div className="mt-5 pt-3 border-t border-gray-100 dark:border-white/10 text-center text-xs text-gray-500 dark:text-gray-400">
              <span>Are you CFSI Faculty or Administrative Staff? </span>
              <Link to="/institute-login" className="text-primary dark:text-primary-light font-bold hover:underline">
                Institute Login →
              </Link>
            </div>

          </FlatCard>
        </motion.div>

      </div>
    </div>
  );
};
