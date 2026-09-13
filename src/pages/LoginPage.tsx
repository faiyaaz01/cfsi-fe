import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  Shield, 
  KeyRound
} from 'lucide-react';
import { loginStudent, getLoggedStudent } from '../lib/studentAuth';
import { studentAccountsData } from '../data/student-accounts';
import { studentsData } from '../data/students';
import { FlatCard } from '../components/common/FlatCard';
import cfsiLogo from '../assets/cfsi-logo.jpg';

const ADMIN_PASSWORD = 'cfsiadmin'; // Client-side demo admin PIN

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Set initial role from query param ?role=admin or ?role=student, default to 'student'
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'student';
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>(initialRole);

  const currentStudent = getLoggedStudent();
  const isAdminLogged = sessionStorage.getItem('cfsi_admin_logged') === 'true';

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab if search param changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'admin') setActiveRole('admin');
    else if (roleParam === 'student') setActiveRole('student');
  }, [searchParams]);

  const handleRoleSwitch = (role: 'student' | 'admin') => {
    setActiveRole(role);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter your password or PIN.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Smart credential check:
      // 1. If user entered admin credentials (cfsiadmin or username === 'admin')
      const isInputAdmin = password.trim() === ADMIN_PASSWORD;
      
      // 2. Check if cadet credentials match
      const studentResult = username.trim() ? loginStudent(username, password) : null;

      if (activeRole === 'admin') {
        if (isInputAdmin) {
          sessionStorage.setItem('cfsi_admin_logged', 'true');
          toast.success('Admin Dashboard Unlocked');
          navigate('/dashboard');
        } else if (studentResult && studentResult.success && studentResult.student) {
          // Smart fallback: cadet logged in on admin tab
          toast.success(`Welcome cadet ${studentResult.student.name}!`, {
            description: 'Redirecting to your Student Portal.'
          });
          navigate('/student/dashboard');
        } else {
          setError('Invalid Admin PIN. (Default demo PIN: cfsiadmin)');
        }
      } else {
        // Active role is student
        if (studentResult && studentResult.success && studentResult.student) {
          toast.success(`Welcome back, ${studentResult.student.name}!`, {
            description: 'Accessing your attendance and examination records.'
          });
          navigate('/student/dashboard');
        } else if (isInputAdmin) {
          // Smart fallback: admin logged in on student tab
          sessionStorage.setItem('cfsi_admin_logged', 'true');
          toast.success('Admin Credentials Detected — Unlocking Admin Dashboard');
          navigate('/dashboard');
        } else {
          setError('Invalid cadet credentials. Please check your username and password, or use a demo account below.');
        }
      }
    }, 300);
  };

  // Quick fill student credentials
  const handleQuickFillStudent = (demoUsername: string) => {
    setActiveRole('student');
    setUsername(demoUsername);
    setPassword('password123');
    setError('');
    toast.info(`Filled cadet credentials for "${demoUsername}"`);
  };

  // Quick fill admin credentials
  const handleQuickFillAdmin = () => {
    setActiveRole('admin');
    setUsername('admin');
    setPassword('cfsiadmin');
    setError('');
    toast.info('Filled Administrator demo PIN (cfsiadmin)');
  };

  return (
    <div className="py-12 sm:py-20 bg-gray-50 dark:bg-dark-bg min-h-screen flex items-center justify-center transition-colors duration-300 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        
        {/* Top Back and Session Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          {(currentStudent || isAdminLogged) && (
            <Link
              to="/verify"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Certificate</span>
            </Link>
          )}
        </div>

        {/* Existing Session Banners */}
        {currentStudent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-primary dark:text-primary-light">Active Cadet Session</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Logged in as <span className="font-semibold">{currentStudent.name}</span>
              </p>
            </div>
            <Link
              to="/student/dashboard"
              className="px-3 py-1 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-colors"
            >
              My Portal →
            </Link>
          </motion.div>
        )}

        {isAdminLogged && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-2xl bg-accent/10 border border-accent/20 text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-accent">Active Admin Session</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Dashboard unlocked with administrator privileges
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-3 py-1 rounded-lg bg-accent text-white font-bold text-xs hover:bg-accent-hover transition-colors"
            >
              Admin Desk →
            </Link>
          </motion.div>
        )}

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <FlatCard className="p-7 sm:p-9 border border-gray-200/80 dark:border-white/10 shadow-xl relative overflow-hidden">
            
            {/* Top decorative gradient accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary absolute top-0 left-0" />

            {/* Header Identity */}
            <div className="text-center mb-6 pt-2">
              <div className="relative w-16 h-16 mx-auto rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-primary to-accent shadow-md mb-3">
                <img
                  src={cfsiLogo}
                  alt="CFSI Vadodara Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>

              <h1 className="text-2xl font-heading font-black text-gray-900 dark:text-white">
                CFSI Institutional Portal
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Unified gateway for enrolled cadets and institute administrators.
              </p>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl mb-6 border border-gray-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeRole === 'student'
                    ? 'bg-white dark:bg-[#12181f] text-primary dark:text-primary-light shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Cadet / Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeRole === 'admin'
                    ? 'bg-white dark:bg-[#12181f] text-accent shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Institute Admin</span>
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username (Displayed for Student or optional Admin handle) */}
              {activeRole === 'student' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Cadet Username or Roll No *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setError(''); }}
                      placeholder="e.g. rahul"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Admin Identifier
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username || 'admin'}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      autoComplete="username"
                    />
                  </div>
                </div>
              )}

              {/* Password / PIN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {activeRole === 'student' ? 'Cadet Password *' : 'Administrative PIN *'}
                  </label>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {activeRole === 'student' ? 'password123' : 'cfsiadmin'}
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder={activeRole === 'student' ? 'Enter password' : 'Enter admin PIN'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                    autoComplete="current-password"
                    required
                  />
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
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 disabled:opacity-50 ${
                  activeRole === 'student'
                    ? 'bg-primary hover:bg-[#1648a8] shadow-primary/20'
                    : 'bg-accent hover:bg-accent-hover shadow-accent/20'
                }`}
              >
                <span>
                  {isSubmitting
                    ? 'Authenticating...'
                    : activeRole === 'student'
                    ? 'Sign In to Cadet Portal'
                    : 'Unlock Admin Management'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* Quick-Fill Demo Credentials Section */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" />
                  <span>Quick Demo Accounts:</span>
                </span>
                <span className="text-[10px] text-gray-400">Click to autofill</span>
              </div>

              {activeRole === 'student' ? (
                <div className="grid grid-cols-2 gap-2">
                  {studentAccountsData.slice(0, 4).map((acc) => {
                    const student = studentsData.find(
                      (s) => s.certificateNumber.toUpperCase() === acc.certificateNumber.toUpperCase()
                    );
                    const isSelected = username.toLowerCase() === acc.username.toLowerCase();
                    return (
                      <button
                        key={acc.username}
                        type="button"
                        onClick={() => handleQuickFillStudent(acc.username)}
                        className={`text-left p-2 rounded-xl text-xs transition-all border ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary dark:text-primary-light font-bold'
                            : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="font-bold truncate">{student?.name || acc.username}</div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {acc.username} • {student?.course?.split(' ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickFillAdmin}
                  className="w-full p-2.5 rounded-xl text-xs border border-accent/30 bg-accent/10 text-accent font-bold hover:bg-accent/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    <span>Administrator Demo Account</span>
                  </div>
                  <span className="font-mono text-[11px] bg-accent/20 px-2 py-0.5 rounded">cfsiadmin</span>
                </button>
              )}

              <div className="mt-3 text-[11px] text-gray-400 text-center leading-relaxed">
                Frontend demonstration credentials. Ready for REST/GraphQL API integration.
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="mt-5 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <Link to="/contact" className="hover:text-primary transition-colors">
                Need Help? Contact Campus Desk
              </Link>
              <Link to="/courses" className="hover:text-primary transition-colors flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>View Courses</span>
              </Link>
            </div>

          </FlatCard>
        </motion.div>

      </div>
    </div>
  );
};
