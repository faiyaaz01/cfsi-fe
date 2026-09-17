import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Flame, 
  BookOpen, 
  Newspaper, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FlatCard } from '../components/common/FlatCard';
import { AttendanceSlot } from '../types';

interface SlotSchedule {
  id: AttendanceSlot;
  title: string;
  shortLabel: string;
  timeRange: string;
  startMinutes: number; // minutes from midnight
  endMinutes: number;   // cutoff minutes from midnight (including 20m grace)
  lockLabel: string;
  description: string;
}

const SLOTS_SCHEDULE: SlotSchedule[] = [
  {
    id: 'Slot 1',
    title: 'Slot 1 — Morning PT & Squad Drill',
    shortLabel: 'Slot 1 (PT)',
    timeRange: '08:00 AM – 10:00 AM',
    startMinutes: 8 * 60, // 08:00 = 480
    endMinutes: 10 * 60 + 20, // 10:20 = 620
    lockLabel: '10:20 AM',
    description: 'Physical Training, Squad Parade, Hose Running & Morning Drills.',
  },
  {
    id: 'Slot 2',
    title: 'Slot 2 — Fire Theory & Safety Codes',
    shortLabel: 'Slot 2 (Theory)',
    timeRange: '10:30 AM – 01:00 PM',
    startMinutes: 10 * 60 + 30, // 10:30 = 630
    endMinutes: 13 * 60 + 20, // 13:20 = 800
    lockLabel: '01:20 PM',
    description: 'Chemistry of Combustion, NBC Defense & Industrial Safety Regulations.',
  },
  {
    id: 'Slot 3',
    title: 'Slot 3 — Practical Apparatus & Tower Drill',
    shortLabel: 'Slot 3 (Drill)',
    timeRange: '02:00 PM – 05:00 PM',
    startMinutes: 14 * 60, // 14:00 = 840
    endMinutes: 17 * 60 + 20, // 17:20 = 1040
    lockLabel: '05:20 PM',
    description: 'Apparatus Pumping, High-Rise Rescue, Smoke Chamber & Hydrant Drills.',
  },
];

export const LeaderDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real-time ticking clock (every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Today's ISO date (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const y = currentTime.getFullYear();
    const m = String(currentTime.getMonth() + 1).padStart(2, '0');
    const d = String(currentTime.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentTime]);

  // Current minutes from midnight
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();

  // Determine slot statuses
  const slotEvaluations = useMemo(() => {
    return SLOTS_SCHEDULE.map((s) => {
      const isBefore = currentMinutes < s.startMinutes;
      const isAfter = currentMinutes >= s.endMinutes;
      const isActive = currentMinutes >= s.startMinutes && currentMinutes < s.endMinutes;

      let remainingSec = 0;
      if (isActive) {
        remainingSec = (s.endMinutes - currentMinutes) * 60 - currentSeconds;
      }

      let timeUntilOpenSec = 0;
      if (isBefore) {
        timeUntilOpenSec = (s.startMinutes - currentMinutes) * 60 - currentSeconds;
      }

      return {
        ...s,
        isActive,
        isBefore,
        isAfter,
        remainingSec,
        timeUntilOpenSec,
      };
    });
  }, [currentMinutes, currentSeconds]);

  // Find currently active slot (if any)
  const activeSlot = useMemo(() => {
    return slotEvaluations.find((s) => s.isActive) || null;
  }, [slotEvaluations]);

  // Next slot that will open
  const nextSlot = useMemo(() => {
    return slotEvaluations.find((s) => s.isBefore) || null;
  }, [slotEvaluations]);

  // Format seconds to mm:ss
  const formatCountdown = (totalSec: number) => {
    if (totalSec <= 0) return '0m 00s';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${String(secs).padStart(2, '0')}s`;
    }
    return `${mins}m ${String(secs).padStart(2, '0')}s`;
  };

  const assignedModules = user?.assigned_modules || ['attendance'];

  return (
    <div className="py-8 sm:py-12 bg-gray-50 dark:bg-dark-bg min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Leader Welcome & Real-Time Clock Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-primary text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-indigo-200 border border-white/10">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Cadet Squad Leadership Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black">
                Welcome, {user?.full_name || user?.username}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl">
                Authorized for daily parade muster and practical ground training. Attendance marking is strictly synchronized with daily training slot schedules.
              </p>
            </div>

            {/* Live Time Card */}
            <div className="bg-black/30 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/15 flex flex-col items-center md:items-end shrink-0">
              <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                <span>Institute Live Time (IST)</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight mt-0.5">
                {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-indigo-200/80 font-medium mt-1">
                {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Current Active Slot Action Hero */}
        <div className="relative">
          {activeSlot ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/15 border-2 border-emerald-500/30 text-gray-900 dark:text-white shadow-lg space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Attendance Window Open Now
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading">
                    {activeSlot.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    {activeSlot.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono">
                      Schedule: {activeSlot.timeRange}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono">
                      Locks Permanently at: {activeSlot.lockLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                  <div className="text-center sm:text-right">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                      Time Remaining Before Lock
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCountdown(activeSlot.remainingSec)}
                    </span>
                  </div>
                  <Link
                    to={`/attendance/${todayStr}/${encodeURIComponent(activeSlot.id)}`}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                  >
                    <span>Mark {activeSlot.shortLabel} Muster</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-gray-900 dark:text-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-amber-950 dark:text-amber-200">
                      Muster Marking Currently Locked
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300/90 mt-0.5">
                      {nextSlot ? (
                        <>
                          Attendance will automatically unlock when <strong>{nextSlot.title}</strong> commences at{' '}
                          <strong>{nextSlot.timeRange.split('–')[0].trim()}</strong> (in {formatCountdown(nextSlot.timeUntilOpenSec)}).
                        </>
                      ) : (
                        'All training muster slots for today have completed and locked. Tomorrow morning at 08:00 AM Slot 1 will unlock.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3 Training Slots Overview Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Daily Slot Muster Schedule & Lock Status</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">20m Grace Cutoff Applied</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {slotEvaluations.map((slot) => {
              const isOpen = slot.isActive;
              const isExpired = slot.isAfter;
              const isPending = slot.isBefore;

              return (
                <FlatCard
                  key={slot.id}
                  hoverEffect={isOpen}
                  className={`p-5 border transition-all flex flex-col justify-between ${
                    isOpen
                      ? 'border-emerald-500/50 bg-emerald-500/[0.03] shadow-md ring-2 ring-emerald-500/20'
                      : isExpired
                      ? 'border-gray-200/80 dark:border-white/10 opacity-80'
                      : 'border-blue-500/20 bg-blue-500/[0.02]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono">
                        {slot.id}
                      </span>

                      {isOpen ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Unlocked Now</span>
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <Lock className="w-3 h-3" />
                          <span>Locked at {slot.lockLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Clock className="w-3 h-3" />
                          <span>Opens at {slot.timeRange.split('–')[0].trim()}</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                        {slot.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {slot.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Slot Hours:</span>
                        <span className="font-bold font-mono">{slot.timeRange}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Cutoff Lock:</span>
                        <span className="font-bold font-mono text-amber-600 dark:text-amber-400">{slot.lockLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2">
                    {isOpen ? (
                      <Link
                        to={`/attendance/${todayStr}/${encodeURIComponent(slot.id)}`}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>Open & Mark Muster</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : isExpired ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/attendance/${todayStr}/${encodeURIComponent(slot.id)}`)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3 h-3" />
                        <span>View Past Muster (Locked)</span>
                      </button>
                    ) : (
                      <div className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center text-gray-400 bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10">
                        Opens in {formatCountdown(slot.timeUntilOpenSec)}
                      </div>
                    )}
                  </div>
                </FlatCard>
              );
            })}
          </div>
        </div>

        {/* Assigned Leader Modules */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Assigned Training & Squad Modules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Module: Attendance */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                  Slot Attendance Muster
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Mark daily attendance for enrolled squad cadets across Slot 1, 2, and 3 with live sync.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  to={`/attendance/${todayStr}/${encodeURIComponent(activeSlot ? activeSlot.id : 'Slot 1')}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>Launch Muster Console</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Module: Tactical Drills */}
            {assignedModules.includes('drills') && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    Ground Drills & Tactical Training
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Review published practical ground training drill cards, safety precautions & equipment.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>View Practical Drills</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Module: Cadet Directory */}
            {assignedModules.includes('roster') && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    Cadet Squad Directory
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Look up cadet enrollment IDs, roll numbers, and verification statuses.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to={`/attendance/${todayStr}/Slot%201`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Inspect Squad Roster</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Module: Bulletins */}
            {assignedModules.includes('news') && (
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161d27] border border-gray-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                    Notice Bulletins & News
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Check official institute announcements, parade schedules, and training circulars.
                  </p>
                </div>
                <div className="pt-4">
                  <Link
                    to="/news"
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <span>View Latest Bulletins</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
