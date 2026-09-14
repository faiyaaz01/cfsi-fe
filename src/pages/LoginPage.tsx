import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Users, 
  Clock, 
  Calendar,
  Lock
} from 'lucide-react';
import { FlatCard } from '../components/common/FlatCard';
import { useAuth, homeFor } from '../context/AuthContext';
import cfsiLogo from '../assets/cfsi-logo.jpg';

export const LoginPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="py-12 sm:py-20 bg-gray-50 dark:bg-dark-bg min-h-screen flex items-center justify-center transition-colors duration-300 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        
        {/* Top Back Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Active Session Banner */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-gray-800 dark:text-gray-200 flex items-center justify-between"
          >
            <div>
              <p className="font-bold text-primary dark:text-primary-light">
                Active Session ({user.role.toUpperCase()})
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Signed in as <span className="font-semibold">{user.full_name || user.username}</span>
              </p>
            </div>
            <Link
              to={homeFor(user)}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-dark transition-colors"
            >
              Go to Dashboard →
            </Link>
          </motion.div>
        )}

        {/* Portal Gateway Header */}
        <div className="text-center mb-10">
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden p-1 bg-gradient-to-tr from-primary via-accent to-amber-400 shadow-lg mb-4">
            <img
              src={cfsiLogo}
              alt="CFSI Vadodara Official Logo"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <h1 className="text-3xl font-heading font-black text-gray-900 dark:text-white">
            CFSI Institutional Portals
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Please select your authorized portal gateway below to sign in with your credentials.
          </p>
        </div>

        {/* Dual Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Option 1: Student Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <FlatCard className="p-6 h-full flex flex-col justify-between border-2 border-orange-200 hover:border-accent dark:border-white/10 dark:hover:border-accent/60 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden bg-white dark:bg-[#161d27]">
              <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-accent absolute top-0 left-0" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500/10 text-accent text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Student Access
                </div>

                <h2 className="text-xl font-heading font-black text-gray-900 dark:text-white mb-2">
                  Student Login
                </h2>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  For CFSI Students. Sign in with your Roll Number (e.g. 262701) and Date of Birth password to track muster attendance and profiles.
                </p>

                <div className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>Real-time 48h attendance logs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Default password: Birthdate (DDMMYYYY)</span>
                  </div>
                </div>
              </div>

              <Link
                to="/student-login"
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-accent hover:bg-accent-hover shadow-md shadow-accent/25 transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3"
              >
                <span>Access Student Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </FlatCard>
          </motion.div>

          {/* Option 2: Institute Staff Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="h-full"
          >
            <FlatCard className="p-6 h-full flex flex-col justify-between border-2 border-blue-200 hover:border-primary dark:border-white/10 dark:hover:border-primary-light/60 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden bg-white dark:bg-[#161d27]">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 to-primary absolute top-0 left-0" />
              
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  Official Staff
                </div>

                <h2 className="text-xl font-heading font-black text-gray-900 dark:text-white mb-2">
                  Institute Login
                </h2>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                  For CFSI Instructors, Directors, Examination Officers, and Administrative staff. Sign in with your official institute email and credentials.
                </p>

                <div className="space-y-1.5 text-[11px] text-gray-600 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                    <span>Student Registry & Bulk CSV/XLS Import</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary dark:text-primary-light" />
                    <span>Muster Attendance Updates & Management</span>
                  </div>
                </div>
              </div>

              <Link
                to="/institute-login"
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/25 transition-all duration-200 flex items-center justify-center gap-2 group-hover:gap-3"
              >
                <span>Access Institute Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </FlatCard>
          </motion.div>

        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>CFSI Vadodara Institutional Portals • Protected by 256-Bit SSL Encryption</span>
        </div>

      </div>
    </div>
  );
};
