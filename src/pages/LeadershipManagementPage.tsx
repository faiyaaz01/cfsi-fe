import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Shield, 
  CheckCircle2, 
  X, 
  Clock, 
  Search, 
  Filter, 
  Save, 
  Users, 
  Sliders, 
  Flame, 
  Newspaper, 
  GraduationCap, 
  Check, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Lock,
  UserPlus,
  UserMinus,
  Key
} from 'lucide-react';
import { toast } from 'sonner';
import { api, AuthUser } from '../lib/api';
import { StudentVerificationRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { FlatCard } from '../components/common/FlatCard';
import { CountUp } from '../components/common/CountUp';

interface ModuleDef {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const AVAILABLE_MODULES: ModuleDef[] = [
  {
    id: 'attendance',
    name: 'Slot-Wise Muster Attendance',
    description: 'Mark student muster attendance for authorized time-locked slots.',
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'drills',
    name: 'Ground Drills & Physical Training',
    description: 'Log and monitor cadet drill participation and safety exercises.',
    icon: Flame,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    id: 'courses',
    name: 'Academic Course Management',
    description: 'Manage curriculum details, batch syllabus, and program information.',
    icon: BookOpen,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'news',
    name: 'News, Notices & Circulars',
    description: 'Publish notices, emergency alerts, and circulars to portal feeds.',
    icon: Newspaper,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'roster',
    name: 'Student Cadets Roster',
    description: 'Inspect cadet profiles, admission records, and verification status.',
    icon: GraduationCap,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
];

const AVAILABLE_SLOTS = [
  { id: 'Slot 1', label: 'Slot 1 (Morning PT)', time: '08:00 - 10:00 AM', lock: '10:20 AM' },
  { id: 'Slot 2', label: 'Slot 2 (Theory)', time: '10:30 AM - 01:00 PM', lock: '01:20 PM' },
  { id: 'Slot 3', label: 'Slot 3 (Practical Drill)', time: '02:00 - 05:00 PM', lock: '05:20 PM' },
];

export const LeadershipManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<StudentVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'leader' | 'teacher'>('all');

  // Modal configure state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AuthUser | null>(null);
  const [editModules, setEditModules] = useState<string[]>([]);
  const [editSlots, setEditSlots] = useState<string[]>([]);

  // Promote cadet to leader modal state
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState('');
  const [promoteStudentSearch, setPromoteStudentSearch] = useState('');
  const [selectedStudentForPromotion, setSelectedStudentForPromotion] = useState<{
    id: string;
    name: string;
    rollNo: string;
    course: string;
    batch?: string;
    photoUrl?: string;
    existingUser?: AuthUser;
    isLeader: boolean;
  } | null>(null);
  const [promoteSlots, setPromoteSlots] = useState<string[]>(['Slot 1', 'Slot 2', 'Slot 3']);
  const [promoteModules, setPromoteModules] = useState<string[]>(['attendance']);
  const [promotePassword, setPromotePassword] = useState('');

  // Load all users and enrolled students
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [data, sData] = await Promise.all([
        api.users('GET'),
        api.getStudents().catch(() => [])
      ]);
      if (Array.isArray(data)) {
        setUsers(data);
      }
      if (Array.isArray(sData)) {
        setEnrolledStudents(sData);
      }
    } catch (err: any) {
      toast.error('Failed to load personnel directory: ' + (err.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Filter only leaders and teachers for table
  const eligiblePersonnel = useMemo(() => {
    return users.filter((u) => u.role === 'leader' || u.role === 'teacher');
  }, [users]);

  // Candidate students who can be assigned Leader role
  const candidateStudentList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      rollNo: string;
      course: string;
      batch?: string;
      photoUrl?: string;
      existingUser?: AuthUser;
      isLeader: boolean;
    }> = [];

    const seenIds = new Set<string>();

    enrolledStudents.forEach((s) => {
      seenIds.add(s.id);
      if (s.rollNo) seenIds.add(s.rollNo);

      const matchedUser = users.find(
        (u) => u.student_id === s.id || u.username === s.rollNo || u.username === s.id || u.id === s.id
      );

      list.push({
        id: s.id,
        name: s.name,
        rollNo: s.rollNo || s.id,
        course: s.course,
        batch: s.batch,
        photoUrl: s.photoUrl,
        existingUser: matchedUser,
        isLeader: matchedUser?.role === 'leader',
      });
    });

    // Also include any users with role 'student' or 'leader' not in enrolledStudents
    users.forEach((u) => {
      if (
        (u.role === 'student' || u.role === 'leader') &&
        !seenIds.has(u.id) &&
        !seenIds.has(u.username) &&
        (!u.student_id || !seenIds.has(u.student_id))
      ) {
        list.push({
          id: u.student_id || u.id,
          name: u.full_name || u.username,
          rollNo: u.student_id || u.username,
          course: 'Enrolled Cadet',
          existingUser: u,
          isLeader: u.role === 'leader',
        });
      }
    });

    return list;
  }, [enrolledStudents, users]);

  const filteredCandidateStudents = useMemo(() => {
    const q = promoteStudentSearch.toLowerCase().trim();
    if (!q) return candidateStudentList;
    return candidateStudentList.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.course && s.course.toLowerCase().includes(q))
    );
  }, [candidateStudentList, promoteStudentSearch]);

  // Filtered view
  const filteredPersonnel = useMemo(() => {
    return eligiblePersonnel.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        p.username.toLowerCase().includes(q) ||
        (p.student_id && p.student_id.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || p.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [eligiblePersonnel, searchQuery, roleFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalLeaders = eligiblePersonnel.filter((p) => p.role === 'leader').length;
    const totalTeachers = eligiblePersonnel.filter((p) => p.role === 'teacher').length;
    const attendanceCount = eligiblePersonnel.filter(
      (p) => (p.assigned_modules || []).includes('attendance') || p.role === 'leader'
    ).length;
    const drillCount = eligiblePersonnel.filter((p) =>
      (p.assigned_modules || []).includes('drills')
    ).length;
    return { totalLeaders, totalTeachers, attendanceCount, drillCount };
  }, [eligiblePersonnel]);

  // Open Edit Modal
  const handleOpenEdit = (person: AuthUser) => {
    setSelectedUserForEdit(person);
    // Default attendance module for leaders if empty
    const currentModules = person.assigned_modules && person.assigned_modules.length > 0
      ? person.assigned_modules
      : person.role === 'leader'
      ? ['attendance']
      : ['courses', 'attendance'];
    
    // Default all 3 slots if empty
    const currentSlots = person.assigned_slots && person.assigned_slots.length > 0
      ? person.assigned_slots
      : ['Slot 1', 'Slot 2', 'Slot 3'];

    setEditModules(currentModules);
    setEditSlots(currentSlots);
  };

  const handleToggleModule = (moduleId: string) => {
    setEditModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleToggleSlot = (slotId: string) => {
    setEditSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  // Save changes
  const handleSaveAssignments = async () => {
    if (!selectedUserForEdit) return;

    try {
      setSavingId(selectedUserForEdit.id);
      await api.users('PATCH', selectedUserForEdit.id, {
        assigned_modules: editModules,
        assigned_slots: editSlots,
      });

      toast.success(`Updated module assignments for ${selectedUserForEdit.full_name || selectedUserForEdit.username}`);
      setSelectedUserForEdit(null);
      await loadUsers();
    } catch (err: any) {
      toast.error('Failed to save assignments: ' + (err.message || 'Error'));
    } finally {
      setSavingId(null);
    }
  };

  const handleTogglePromoteSlot = (slotId: string) => {
    setPromoteSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  const handleTogglePromoteModule = (moduleId: string) => {
    setPromoteModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  // Promote / Assign Leader role to a particular student
  const handlePromoteToLeader = async () => {
    if (!selectedStudentForPromotion) {
      toast.error('Please select a student to assign the Leader role.');
      return;
    }

    try {
      setSavingId('promoting');
      const cand = candidateStudentList.find((c) => c.id === selectedStudentForPromotion.id);

      if (cand?.existingUser) {
        // Upgrade existing user account
        await api.users('PATCH', cand.existingUser.id, {
          role: 'leader',
          student_id: cand.id,
          full_name: cand.name,
          assigned_modules: promoteModules,
          assigned_slots: promoteSlots,
        });
        toast.success(`Successfully assigned Leader role to ${cand.name}!`);
      } else {
        // Create new user account for student
        await api.users('POST', '', {
          username: selectedStudentForPromotion.rollNo || selectedStudentForPromotion.id,
          password: promotePassword.trim() || 'Leader@123',
          full_name: selectedStudentForPromotion.name,
          role: 'leader',
          student_id: selectedStudentForPromotion.id,
          assigned_modules: promoteModules,
          assigned_slots: promoteSlots,
          is_active: true,
        });
        toast.success(`Created Leader account and assigned Leader role to ${selectedStudentForPromotion.name}!`);
      }

      setPromoteModalOpen(false);
      setSelectedStudentForPromotion(null);
      setPromoteStudentSearch('');
      setPromotePassword('');
      await loadUsers();
    } catch (err: any) {
      toast.error('Failed to assign Leader role: ' + (err.message || 'Error'));
    } finally {
      setSavingId(null);
    }
  };

  // Revoke Leader role (demote to regular student)
  const handleRevokeLeader = async (person: AuthUser) => {
    if (!window.confirm(`Revoke the Leader role for ${person.full_name || person.username}? Their account will return to regular Student status.`)) {
      return;
    }

    try {
      setSavingId(person.id);
      await api.users('PATCH', person.id, {
        role: 'student',
        assigned_modules: [],
        assigned_slots: [],
      });
      toast.success(`Revoked Leader role for ${person.full_name || person.username}. Account returned to Student.`);
      await loadUsers();
    } catch (err: any) {
      toast.error('Failed to revoke Leader role: ' + (err.message || 'Error'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-gray-50 dark:bg-dark-bg min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-heading font-black text-gray-900 dark:text-white">
                  Leadership & Faculty Module Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Assign system modules, operational slots, and muster permissions to Cadet Leaders and Faculty Teachers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPromoteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 shadow-sm shadow-indigo-500/20 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Appoint Cadet Leader</span>
            </button>
          </div>
        </div>

        {/* Overview Metric Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <FlatCard hoverEffect={false} className="p-4 sm:p-5 border border-indigo-500/20 bg-indigo-500/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Cadet Leaders
              </span>
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
              <CountUp value={metrics.totalLeaders} />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Time-locked muster officers
            </div>
          </FlatCard>

          <FlatCard hoverEffect={false} className="p-4 sm:p-5 border border-emerald-500/20 bg-emerald-500/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Faculty Teachers
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              <CountUp value={metrics.totalTeachers} />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Instructors & Academics
            </div>
          </FlatCard>

          <FlatCard hoverEffect={false} className="p-4 sm:p-5 border border-blue-500/20 bg-blue-500/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Muster Assigned
              </span>
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
              <CountUp value={metrics.attendanceCount} />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Authorized for attendance
            </div>
          </FlatCard>

          <FlatCard hoverEffect={false} className="p-4 sm:p-5 border border-amber-500/20 bg-amber-500/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Practical Drills
              </span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
              <CountUp value={metrics.drillCount} />
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Ground training instructors
            </div>
          </FlatCard>
        </div>

        {/* Time-Lock Rules Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white mt-0.5 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                Automated Slot Lock Policy for Cadet Leaders:
              </p>
              <p className="text-indigo-800 dark:text-indigo-300 text-xs leading-relaxed">
                Leaders can only mark attendance slot-wise on the current day during the active slot time window:
                <strong className="mx-1 font-bold underline">Slot 1 (08:00 - 10:00 AM)</strong> locks at <strong>10:20 AM</strong> • 
                <strong className="mx-1 font-bold underline">Slot 2 (10:30 AM - 01:00 PM)</strong> locks at <strong>01:20 PM</strong> • 
                <strong className="mx-1 font-bold underline">Slot 3 (02:00 - 05:00 PM)</strong> locks at <strong>05:20 PM</strong>.
                Leaders cannot mark other slots outside their designated time window. Administrators retain master override privileges.
              </p>
            </div>
          </div>
        </div>

        {/* Personnel Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leader or teacher by name, ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#161d27] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold">
              {(['all', 'leader', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    roleFilter === r
                      ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm font-bold'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {r === 'all'
                    ? `All Personnel (${eligiblePersonnel.length})`
                    : r === 'leader'
                    ? `Cadet Leaders (${metrics.totalLeaders})`
                    : `Teachers (${metrics.totalTeachers})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Personnel Roster & Assignments Table */}
        <FlatCard hoverEffect={false} className="border border-gray-200/80 dark:border-white/10 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200/60 dark:border-white/10">
                  <th className="py-3.5 px-4">Officer / Instructor</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Assigned Modules</th>
                  <th className="py-3.5 px-4">Allowed Duty Slots</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Assignment Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60 dark:divide-white/5">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="py-6 px-4">
                        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-48 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
                      </td>
                    </tr>
                  ))
                ) : filteredPersonnel.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Award className="w-8 h-8 opacity-40 text-indigo-500" />
                        <p className="font-semibold text-sm">No Leaders or Teachers Found</p>
                        <p className="text-xs">
                          {searchQuery
                            ? 'No matching personnel found.'
                            : 'Click "Appoint Cadet Leader" above to promote a cadet to the Leadership role.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPersonnel.map((person) => {
                    const assignedMods = person.assigned_modules || (person.role === 'leader' ? ['attendance'] : ['courses', 'attendance']);
                    const assignedSlots = person.assigned_slots || ['Slot 1', 'Slot 2', 'Slot 3'];

                    return (
                      <tr key={person.id} className="hover:bg-primary/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        {/* Name & Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                              person.role === 'leader'
                                ? 'from-indigo-500 to-purple-600 text-white'
                                : 'from-emerald-500 to-teal-600 text-white'
                            } flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
                              {(person.full_name || person.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{person.full_name || person.username}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                                <span>@{person.username}</span>
                                {person.student_id && (
                                  <span className="text-primary font-bold">#{person.student_id}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            person.role === 'leader'
                              ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          }`}>
                            {person.role === 'leader' ? <Award className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                            <span className="capitalize">{person.role === 'leader' ? 'Cadet Leader' : 'Faculty Teacher'}</span>
                          </span>
                        </td>

                        {/* Assigned Modules Pills */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {assignedMods.map((modId) => {
                              const mod = AVAILABLE_MODULES.find((m) => m.id === modId);
                              if (!mod) return null;
                              const Icon = mod.icon;
                              return (
                                <span
                                  key={modId}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${mod.bgColor} ${mod.color}`}
                                  title={mod.description}
                                >
                                  <Icon className="w-3 h-3" />
                                  <span>{mod.name.split(' ')[0]}</span>
                                </span>
                              );
                            })}
                            {assignedMods.length === 0 && (
                              <span className="text-[11px] text-gray-400 italic">None Assigned</span>
                            )}
                          </div>
                        </td>

                        {/* Allowed Duty Slots */}
                        <td className="py-3.5 px-4">
                          {assignedMods.includes('attendance') ? (
                            <div className="flex flex-wrap gap-1">
                              {assignedSlots.map((slot) => (
                                <span
                                  key={slot}
                                  className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold"
                                >
                                  {slot}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Muster Inactive</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {person.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-500/10 text-gray-500 border border-gray-500/20">
                              <span>Suspended</span>
                            </span>
                          )}
                        </td>

                        {/* Configure Button & Revoke */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(person)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Assign Modules</span>
                            </button>

                            {person.role === 'leader' && (
                              <button
                                type="button"
                                onClick={() => handleRevokeLeader(person)}
                                disabled={savingId === person.id}
                                className="p-1.5 rounded-xl text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                                title="Revoke Leader role and return to Student"
                              >
                                {savingId === person.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                                ) : (
                                  <UserMinus className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </FlatCard>

        {/* Configure Modules Modal */}
        <AnimatePresence>
          {selectedUserForEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-[#161d27] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Module & Duty Assignment
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                      {selectedUserForEdit.full_name || selectedUserForEdit.username}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Role: <strong className="capitalize">{selectedUserForEdit.role}</strong> • Select functional modules and time-slot authorization.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUserForEdit(null)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  
                  {/* Module Selection Grid */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                      1. Authorized Functional Modules
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {AVAILABLE_MODULES.map((mod) => {
                        const isChecked = editModules.includes(mod.id);
                        const Icon = mod.icon;
                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleToggleModule(mod.id)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isChecked
                                ? `${mod.bgColor} border-primary/40 shadow-sm`
                                : 'bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 hover:border-gray-300'
                            }`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 ${isChecked ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-xs text-gray-900 dark:text-white">
                                  {mod.name}
                                </p>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary pointer-events-none"
                                />
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                                {mod.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slot Selection Grid (Active if Attendance Module is checked) */}
                  {editModules.includes('attendance') && (
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                            2. Designated Attendance Duty Slots
                          </label>
                          <p className="text-[11px] text-blue-700 dark:text-blue-300">
                            Select which daily slots this officer is authorized to mark.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditSlots(['Slot 1', 'Slot 2', 'Slot 3'])}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Select All 3 Slots
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {AVAILABLE_SLOTS.map((s) => {
                          const isSlotChecked = editSlots.includes(s.id);
                          return (
                            <div
                              key={s.id}
                              onClick={() => handleToggleSlot(s.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSlotChecked
                                  ? 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300'
                                  : 'bg-white dark:bg-[#12181f] border-gray-200 dark:border-white/10 text-gray-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs">{s.label}</span>
                                <input
                                  type="checkbox"
                                  checked={isSlotChecked}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 text-blue-600 rounded pointer-events-none"
                                />
                              </div>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                {s.time}
                              </span>
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-1">
                                Locks at {s.lock}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Preset quick actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[11px] text-gray-400 font-bold uppercase">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditModules(['attendance', 'drills']);
                        setEditSlots(['Slot 1', 'Slot 2', 'Slot 3']);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                    >
                      Squad Drill Leader
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditModules(['attendance']);
                        setEditSlots(['Slot 1']);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                    >
                      Morning PT Only (Slot 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditModules(['attendance', 'courses', 'drills', 'news', 'roster']);
                        setEditSlots(['Slot 1', 'Slot 2', 'Slot 3']);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                    >
                      Full Faculty Incharge
                    </button>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:px-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForEdit(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(savingId)}
                    onClick={handleSaveAssignments}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {savingId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save Module Assignments</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Appoint / Assign Leader Role to Student Modal */}
        <AnimatePresence>
          {promoteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white dark:bg-[#161d27] rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden my-auto"
              >
                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        Assign Leader Role to Student
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Select an enrolled cadet to appoint as Squad Leader and configure their operational duty slots
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPromoteModalOpen(false);
                      setSelectedStudentForPromotion(null);
                      setPromoteStudentSearch('');
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {/* Search Bar for Cadets */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      1. Search Enrolled Cadet *
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={promoteStudentSearch}
                        onChange={(e) => setPromoteStudentSearch(e.target.value)}
                        placeholder="Type cadet name, roll number, or ID (e.g. 262701, Rajesh)..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                      />
                    </div>
                  </div>

                  {/* Candidate Cadets List */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                      <span>Matching Cadets ({filteredCandidateStudents.length})</span>
                      <span>Click to select</span>
                    </div>

                    <div className="border border-gray-200 dark:border-white/10 rounded-2xl max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                      {filteredCandidateStudents.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400 font-medium">
                          No students found matching "{promoteStudentSearch}".
                        </div>
                      ) : (
                        filteredCandidateStudents.slice(0, 30).map((student) => {
                          const isSelected = selectedStudentForPromotion?.id === student.id;

                          return (
                            <div
                              key={student.id}
                              onClick={() => setSelectedStudentForPromotion(student)}
                              className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                                  : 'hover:bg-gray-100/70 dark:hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/20">
                                  {student.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-gray-900 dark:text-white truncate flex items-center gap-2">
                                    <span>{student.name}</span>
                                    {student.isLeader && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                        Leader
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                                    <span>Roll #{student.rollNo}</span>
                                    <span>•</span>
                                    <span className="truncate max-w-[180px]">{student.course}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                {student.isLeader ? (
                                  <span className="text-[10px] font-bold text-indigo-500">Active Leader</span>
                                ) : student.existingUser ? (
                                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Account Linked</span>
                                ) : (
                                  <span className="text-[10px] font-medium text-gray-400">New Account</span>
                                )}

                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'border-gray-300 dark:border-white/20 text-transparent'
                                }`}>
                                  <Check className="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Selected Student Configuration Box */}
                  {selectedStudentForPromotion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-4"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-indigo-200/60 dark:border-indigo-800/30">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Selected Cadet
                          </span>
                          <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-100">
                            {selectedStudentForPromotion.name}
                          </h4>
                          <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300 font-mono">
                            Roll No: #{selectedStudentForPromotion.rollNo} • ID: {selectedStudentForPromotion.id}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Duty Slots Selection */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          2. Designated Operational Duty Slots *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'Slot 1', time: '08:00 - 10:00 AM', lock: 'Locks 10:20 AM' },
                            { id: 'Slot 2', time: '10:30 AM - 01:00 PM', lock: 'Locks 01:20 PM' },
                            { id: 'Slot 3', time: '02:00 PM - 05:00 PM', lock: 'Locks 05:20 PM' },
                          ].map((slot) => {
                            const isSlotActive = promoteSlots.includes(slot.id);
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => handleTogglePromoteSlot(slot.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSlotActive
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs">{slot.id}</span>
                                  {isSlotActive && <Check className="w-3.5 h-3.5" />}
                                </div>
                                <div className={`text-[10px] font-mono mt-0.5 ${isSlotActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {slot.time}
                                </div>
                                <div className={`text-[9px] font-semibold mt-1 ${isSlotActive ? 'text-blue-200' : 'text-amber-500'}`}>
                                  {slot.lock}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Functional Modules Selection */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                          3. Assigned Functional Modules *
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {AVAILABLE_MODULES.map((mod) => {
                            const isModActive = promoteModules.includes(mod.id);
                            const ModIcon = mod.icon;
                            return (
                              <button
                                key={mod.id}
                                type="button"
                                onClick={() => handleTogglePromoteModule(mod.id)}
                                className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                                  isModActive
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <ModIcon className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-bold text-xs truncate">{mod.name.split(' ')[0]}</span>
                                {isModActive && <Check className="w-3 h-3 ml-auto" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Password / Account Creation Notice */}
                      {!selectedStudentForPromotion.existingUser && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                            Set Login Password (Optional)
                          </label>
                          <div className="relative">
                            <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={promotePassword}
                              onChange={(e) => setPromotePassword(e.target.value)}
                              placeholder="Leave blank to use default 'Leader@123'"
                              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            Username will be the cadet's Roll Number (<span className="font-mono font-bold">#{selectedStudentForPromotion.rollNo}</span>).
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:px-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPromoteModalOpen(false);
                      setSelectedStudentForPromotion(null);
                      setPromoteStudentSearch('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedStudentForPromotion || Boolean(savingId)}
                    onClick={handlePromoteToLeader}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {savingId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                    <span>
                      {selectedStudentForPromotion
                        ? `Assign Leader Role to ${selectedStudentForPromotion.name.split(' ')[0]}`
                        : 'Select Student to Appoint'}
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
