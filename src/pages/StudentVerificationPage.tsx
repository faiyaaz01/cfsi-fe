import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Printer, 
  GraduationCap, 
  User, 
  MapPin, 
  FileText,
  Flame,
  QrCode,
  ArrowLeft,
  LayoutDashboard,
  Lock
} from 'lucide-react';
import { studentsData } from '../data/students';
import { StudentVerificationRecord } from '../types';
import { SectionHeading } from '../components/common/SectionHeading';
import { GlassCard } from '../components/common/GlassCard';
import { FlatCard } from '../components/common/FlatCard';
import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { getLoggedStudent } from '../lib/studentAuth';
import { api } from '../lib/api';
import { toast } from 'sonner';

export const StudentVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const certFromUrl = searchParams.get('cert');

  const loggedStudent = getLoggedStudent();
  const {user} = useAuth();
  const isAdminLogged = user?.role === 'admin' || user?.role === 'teacher';
  const isAuthenticated = Boolean(user);

  // Initial search value: either URL param or logged student's cert, or empty
  const initialCert = certFromUrl || (loggedStudent ? loggedStudent.certificateNumber : '');

  const [searchInput, setSearchInput] = useState(initialCert);
  const [hasSearched, setHasSearched] = useState(Boolean(initialCert));
  const [verifiedRecord, setVerifiedRecord] = useState<StudentVerificationRecord | null>(null);
  useEffect(() => {
    if (!initialCert) return;
    let active = true;
    api.verifyCertificate(initialCert).then(res => {
      if (active) setVerifiedRecord(res.verified ? res.student : null);
    }).catch(() => { if (active) setVerifiedRecord(null); });
    return () => { active = false; };
  }, [initialCert]);

  // If not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);

    try {
      const res = await api.verifyCertificate(query);
      if (res.verified && res.student) {
        setVerifiedRecord(res.student);
        triggerConfetti();
        toast.success('Certificate Verified with CFSI Registry');
        return;
      }
      setVerifiedRecord(null);
    } catch (error) {
      setVerifiedRecord(null);
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const quickSearch = async (certNo: string) => {
    setSearchInput(certNo);
    setHasSearched(true);
    setVerifiedRecord(null);
    try {
      const res = await api.verifyCertificate(certNo);
      if (res.verified && res.student) {
        setVerifiedRecord(res.student);
        triggerConfetti();
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Verification failed'); }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-dark-bg transition-colors duration-300 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Portal Navigation Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {loggedStudent ? (
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Student Dashboard</span>
            </Link>
          ) : isAdminLogged ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Dashboard</span>
            </Link>
          ) : null}

          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated Session Active ({loggedStudent ? `Cadet: ${loggedStudent.name}` : 'Institute Administrator'})</span>
          </div>
        </div>

        {/* Header */}
        <SectionHeading
          badge="Official Verification Portal"
          title="ONLINE CERTIFICATE VERIFICATION"
          subtitle="Instant authenticity verification for all Central Fire Safety Institute (CFSI) issued diplomas and course completion certificates."
        />

        {/* Search Box Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <FlatCard className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-lg">
            <form onSubmit={handleSearch} className="space-y-4">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Enter Certificate Number, Roll Number, or Student Name:
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="e.g. CFSI-2023-0101"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-medium text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark shadow-md transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-105"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify Now</span>
                </button>
              </div>

              {/* Sample test suggestions */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Quick Test Samples:</span>
                {['CFSI-2023-0101', 'CFSI-2023-0102', 'CFSI-2023-0103', 'CFSI-2024-0201', 'CFSI-2024-0202'].map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => quickSearch(cert)}
                    className="px-2 py-0.5 rounded bg-gray-100 dark:bg-white/10 hover:bg-accent/10 hover:text-accent font-mono font-bold transition-colors"
                  >
                    {cert}
                  </button>
                ))}
              </div>
            </form>
          </FlatCard>
        </motion.div>

        {/* Verification Result Display */}
        <AnimatePresence mode="wait">
          {hasSearched && verifiedRecord && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Glass Certificate Card */}
              <GlassCard className="p-6 sm:p-10 border-2 border-emerald-500/40 dark:border-emerald-500/40 relative overflow-hidden shadow-2xl">
                
                {/* Watermark Logo */}
                <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-5 pointer-events-none">
                  <Flame className="w-96 h-96 text-emerald-600" />
                </div>

                {/* Top Status Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200/60 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Official Verification Status
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          VALID & AUTHENTIC
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-heading font-black text-gray-900 dark:text-white">
                        Central Fire Safety Institute Certificate
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-white/10 hover:bg-white border border-gray-200 dark:border-white/10 shadow-sm transition-all"
                  >
                    <Printer className="w-4 h-4 text-primary" />
                    <span>Print Verification Report</span>
                  </button>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center">
                  
                  {/* Photo & Seal */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-center">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-md mb-3">
                      <img
                        src={verifiedRecord.photoUrl}
                        alt={verifiedRecord.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="font-heading font-bold text-base text-gray-900 dark:text-white">
                      {verifiedRecord.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                      Roll No: {verifiedRecord.rollNo}
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>IFSMA Verified Graduate</span>
                    </div>
                  </div>

                  {/* Specific Academic Information */}
                  <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    
                    <div className="p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Certificate Number:</div>
                      <div className="font-mono font-extrabold text-base text-primary dark:text-primary-light mt-0.5">
                        {verifiedRecord.certificateNumber}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Course Awarded:</div>
                      <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                        {verifiedRecord.course}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Father's Name:</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                        {verifiedRecord.fatherName}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Academic Batch:</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                        {verifiedRecord.batch}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Passing Year & Grade:</div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {verifiedRecord.passingYear} • {verifiedRecord.grade} ({verifiedRecord.percentage})
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Issue Date:</div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                        {verifiedRecord.issueDate}
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Examination Center:</div>
                        <div className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                          {verifiedRecord.centerLocation}
                        </div>
                      </div>
                      <QrCode className="w-10 h-10 text-gray-400" />
                    </div>

                  </div>

                </div>

                {/* Footer Security Notice */}
                <div className="pt-4 border-t border-gray-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                  <span>Cryptographic Verification Stamp: SHA-256 Verified CFSI Database</span>
                  <span>Registered under All India Fire Safety Vocational Council</span>
                </div>

              </GlassCard>
            </motion.div>
          )}

          {/* Not Found Alert Card */}
          {hasSearched && !verifiedRecord && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 border-2 border-red-500/40 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto shadow-sm">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <h3 className="font-heading font-bold text-2xl text-gray-900 dark:text-white">
                  Certificate Record Not Found
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                  No registered student record matches <span className="font-mono font-bold text-red-500">"{searchInput}"</span> in the Central Fire Safety Institute archives.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setSearchInput(''); setHasSearched(false); }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  >
                    Try Another Search
                  </button>
                  <Link
                    to="/contact"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-accent hover:bg-accent-hover transition-colors"
                  >
                    Contact Verification Cell
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="mt-12 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 space-y-2">
          <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary" />
            <span>Verification Guidelines for Employers & Government Bodies:</span>
          </h4>
          <p>
            1. All valid CFSI credentials carry a unique serial identifier in the format <code className="font-bold text-primary">CFSI-YYYY-XXXX</code>.
          </p>
          <p>
            2. For physical certificate re-issuance, transcript requests, or police background verification checks, please email <a href="mailto:verification@cfsi.co.in" className="text-primary hover:underline">verification@cfsi.co.in</a>.
          </p>
        </div>

      </div>
    </div>
  );
};
