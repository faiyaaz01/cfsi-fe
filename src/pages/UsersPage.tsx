import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Shield, 
  GraduationCap, 
  BookOpen, 
  ArrowLeft, 
  Search, 
  Edit3, 
  Trash2, 
  Lock, 
  Key, 
  User, 
  AtSign, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  X, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  LayoutDashboard,
  FileSpreadsheet,
  UserCheck,
  UserX,
  Check,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  CreditCard,
  Globe,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { api, AuthUser } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StudentVerificationRecord } from '../types';
import { FlatCard } from '../components/common/FlatCard';
import { BulkStudentImportModal } from '../components/admin/BulkStudentImportModal';
import { CountUp } from '../components/common/CountUp';
import { SkeletonStats, Skeleton } from '../components/common/Skeleton';
import { TablePagination } from '../components/common/TablePagination';

interface UserFormData {
  username: string;
  password: string;
  full_name: string;
  role: AuthUser['role'];
  student_id: string;
  is_active: boolean;
  // Student 18 CSV fields:
  enrollment_no: string;
  session_year: string;
  father_name: string;
  mother_name: string;
  present_address: string;
  student_phone: string;
  father_phone: string;
  birth_date: string;
  gender: string;
  category: string;
  aadhar_card: string;
  center_name: string;
  course: string;
  mode: string;
  email: string;
  nationality: string;
  state: string;
}

const emptyForm: UserFormData = {
  username: '',
  password: '',
  full_name: '',
  role: 'student',
  student_id: '',
  is_active: true,
  enrollment_no: '',
  session_year: '01-Jul',
  father_name: '',
  mother_name: '',
  present_address: '',
  student_phone: '',
  father_phone: '',
  birth_date: '',
  gender: 'MALE',
  category: '',
  aadhar_card: '',
  center_name: 'CENTRAL FIRE AND SAFETY INSTITUTE',
  course: 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
  mode: 'REGULAR',
  email: '',
  nationality: 'INDIAN',
  state: 'GUJARAT',
};

export function UsersPage({ isEmbedded = false }: { isEmbedded?: boolean } = {}) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<StudentVerificationRecord[]>([]);
  const [form, setForm] = useState<UserFormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'leader' | 'student'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AuthUser | null>(null);
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);

  // Selection & Bulk Management State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // Load user directory from FastAPI + MongoDB
  const loadUsers = useCallback(async () => {
    try {
      setBusy(true);
      setError('');
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
      const msg = err.message || 'Failed to load user accounts.';
      setError(msg);
      toast.error('Could not fetch user directory: ' + msg);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Modal ESC key listener and scroll locking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFormOpen) {
        handleCancelEdit();
      }
    };
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFormOpen]);

  // Filtered users calculation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (u.full_name && u.full_name.toLowerCase().includes(q)) ||
        u.username.toLowerCase().includes(q) ||
        (u.student_id && u.student_id.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'inactive' && !u.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => {
      // Prioritize admin, teacher, leader, then students in natural order
      const roleWeight = { admin: 1, teacher: 2, leader: 3, student: 4 };
      const weightA = roleWeight[a.role as keyof typeof roleWeight] || 5;
      const weightB = roleWeight[b.role as keyof typeof roleWeight] || 5;
      if (weightA !== weightB) return weightA - weightB;

      if (a.role === 'student' && b.role === 'student') {
        const matchA = (a.student_id || a.username || '').match(/\d+/);
        const matchB = (b.student_id || b.username || '').match(/\d+/);
        const numA = matchA ? parseInt(matchA[0], 10) : 999999;
        const numB = matchB ? parseInt(matchB[0], 10) : 999999;
        if (numA !== numB) return numA - numB;
      }
      return (a.full_name || a.username).localeCompare(b.full_name || b.username);
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination state & calculation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Metric stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      teachers: users.filter((u) => u.role === 'teacher').length,
      leaders: users.filter((u) => u.role === 'leader').length,
      students: users.filter((u) => u.role === 'student').length,
      active: users.filter((u) => u.is_active).length,
    };
  }, [users]);

  // Initiate Edit
  const handleStartEdit = (account: AuthUser) => {
    setEditingId(account.id);
    const student = enrolledStudents.find(
      (s) => s.id === account.student_id || s.id === account.username || s.enrollmentNo === account.student_id || s.enrollmentNo === account.username
    );

    setForm({
      username: account.username,
      password: '',
      full_name: account.full_name || student?.name || '',
      role: account.role,
      student_id: account.student_id || student?.id || account.username || '',
      is_active: account.is_active,
      enrollment_no: student?.enrollmentNo || '',
      session_year: student?.sessionYear || '01-Jul',
      father_name: student?.fatherName || '',
      mother_name: student?.motherName || '',
      present_address: student?.presentAddress || '',
      student_phone: student?.studentPhone || '',
      father_phone: student?.fatherPhone || '',
      birth_date: student?.birthDate || '',
      gender: student?.gender || 'MALE',
      category: student?.category || '',
      aadhar_card: student?.aadharCard || '',
      center_name: student?.centerName || student?.centerLocation || 'CENTRAL FIRE AND SAFETY INSTITUTE',
      course: student?.course || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
      mode: student?.mode || 'REGULAR',
      email: student?.email || '',
      nationality: student?.nationality || 'INDIAN',
      state: student?.state || 'GUJARAT',
    });
    setIsFormOpen(true);
    setError('');
    setShowPassword(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setIsFormOpen(false);
    setError('');
    setShowPassword(false);
  };

  // Quick Cadet Selector handler
  const handleCadetSelect = (studentId: string) => {
    if (!studentId) {
      setForm((prev) => ({
        ...prev,
        student_id: '',
        full_name: '',
        username: '',
        enrollment_no: '',
        session_year: '01-Jul',
        father_name: '',
        mother_name: '',
        present_address: '',
        student_phone: '',
        father_phone: '',
        birth_date: '',
        gender: 'MALE',
        category: '',
        aadhar_card: '',
        center_name: 'CENTRAL FIRE AND SAFETY INSTITUTE',
        course: 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
        mode: 'REGULAR',
        email: '',
        nationality: 'INDIAN',
        state: 'GUJARAT',
      }));
      return;
    }
    const student = enrolledStudents.find((s) => s.id === studentId);
    if (!student) return;

    let autoDobPassword = '';
    if (student.birthDate) {
      const digits = student.birthDate.replace(/\D/g, '');
      if (digits.length >= 8) {
        autoDobPassword = digits.slice(0, 8);
      }
    }

    setForm((prev) => ({
      ...prev,
      student_id: student.id,
      username: student.id,
      full_name: student.name || prev.full_name,
      enrollment_no: student.enrollmentNo || student.id,
      session_year: student.sessionYear || '01-Jul',
      father_name: student.fatherName || '',
      mother_name: student.motherName || '',
      present_address: student.presentAddress || '',
      student_phone: student.studentPhone || '',
      father_phone: student.fatherPhone || '',
      birth_date: student.birthDate || '',
      gender: student.gender || 'MALE',
      category: student.category || '',
      aadhar_card: student.aadharCard || '',
      center_name: student.centerName || student.centerLocation || 'CENTRAL FIRE AND SAFETY INSTITUTE',
      course: student.course || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
      mode: student.mode || 'REGULAR',
      email: student.email || '',
      nationality: student.nationality || 'INDIAN',
      state: student.state || 'GUJARAT',
      password: autoDobPassword || prev.password,
    }));
  };

  // Submit User Form (Create / Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (form.role === 'student') {
        const studentIdVal = form.student_id.trim() || form.username.trim() || form.enrollment_no.trim();
        if (!studentIdVal) {
          throw new Error('Student ID / Login ID is required.');
        }
        if (!form.full_name.trim()) {
          throw new Error('Student Name is required.');
        }

        // Prepare student item with all 18 fields
        const studentItem = {
          student_id: studentIdVal,
          roll_no: form.enrollment_no.slice(-2) || '01',
          enrollment_no: form.enrollment_no.trim() || studentIdVal,
          session_year: form.session_year.trim(),
          name: form.full_name.trim(),
          father_name: form.father_name.trim(),
          mother_name: form.mother_name.trim(),
          present_address: form.present_address.trim(),
          student_phone: form.student_phone.trim(),
          father_phone: form.father_phone.trim(),
          birth_date: form.birth_date.trim() || '01-01-2006',
          gender: form.gender.trim() || 'MALE',
          category: form.category.trim() || 'General',
          aadhar_card: form.aadhar_card.trim(),
          center_name: form.center_name.trim() || 'CENTRAL FIRE AND SAFETY INSTITUTE',
          course: form.course.trim() || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
          mode: form.mode.trim() || 'REGULAR',
          email: form.email.trim() || `${studentIdVal.toLowerCase()}@cfsi.edu.in`,
          nationality: form.nationality.trim() || 'INDIAN',
          state: form.state.trim() || 'GUJARAT',
          password: form.password.trim() || undefined,
          is_active: form.is_active,
        };

        // Sync with MongoDB students and users collections via bulkImport
        await api.bulkImportStudents([studentItem], form.session_year.trim() || 'Batch 2026-2027');

        if (editingId) {
          const userPatch: any = {
            full_name: form.full_name.trim(),
            is_active: form.is_active,
          };
          if (form.password.trim()) {
            userPatch.password = form.password.trim();
          }
          await api.users('PATCH', editingId, userPatch);
        }

        toast.success(`Student user "${form.full_name}" saved successfully.`);
      } else {
        const usernameVal = form.username.trim();
        if (!usernameVal) {
          throw new Error('Username is required.');
        }

        const payload: any = {
          full_name: form.full_name.trim(),
          role: form.role,
          is_active: form.is_active,
          student_id: form.role === 'leader' ? (form.student_id.trim() || null) : null,
        };

        if (form.role === 'leader' && !editingId) {
          payload.assigned_modules = ['attendance'];
          payload.assigned_slots = ['Slot 1', 'Slot 2', 'Slot 3'];
        }

        if (editingId) {
          if (form.password) {
            payload.password = form.password;
          }
          await api.users('PATCH', editingId, payload);
          toast.success(`User "${form.full_name || usernameVal}" updated successfully.`);
        } else {
          payload.username = usernameVal;
          payload.password = form.password;
          await api.users('POST', '', payload);
          toast.success(`User "${form.full_name}" created successfully.`);
        }
      }

      handleCancelEdit();
      await loadUsers();
      try {
        const studs = await api.getStudents();
        setEnrolledStudents(studs);
      } catch {
        // ignore
      }
    } catch (err: any) {
      const msg = err.message || 'Unable to save user. Please verify input fields.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  // Quick Promote Student to Cadet Leader
  const handlePromoteStudentToLeader = async (account: AuthUser) => {
    if (!window.confirm(`Assign Cadet Leader role to "${account.full_name || account.username}"?\n\nThey will gain access to the Leader Portal and slot-wise attendance marking.`)) {
      return;
    }

    try {
      setBusy(true);
      await api.users('PATCH', account.id, {
        role: 'leader',
        student_id: account.student_id || account.username,
        assigned_modules: ['attendance'],
        assigned_slots: ['Slot 1', 'Slot 2', 'Slot 3'],
      });
      toast.success(`Assigned Leader role to ${account.full_name || account.username}!`);
      await loadUsers();
    } catch (err: any) {
      toast.error('Failed to assign Leader role: ' + (err.message || 'Error'));
    } finally {
      setBusy(false);
    }
  };

  // Demote Leader to regular Student
  const handleDemoteLeaderToStudent = async (account: AuthUser) => {
    if (!window.confirm(`Demote "${account.full_name || account.username}" from Cadet Leader back to regular Student?`)) {
      return;
    }

    try {
      setBusy(true);
      await api.users('PATCH', account.id, {
        role: 'student',
        assigned_modules: [],
        assigned_slots: [],
      });
      toast.success(`Demoted ${account.full_name || account.username} back to Student.`);
      await loadUsers();
    } catch (err: any) {
      toast.error('Failed to update role: ' + (err.message || 'Error'));
    } finally {
      setBusy(false);
    }
  };

  // Delete User Confirmation
  const confirmDelete = async () => {
    if (!deleteConfirmUser) return;
    setBusy(true);
    try {
      await api.users('DELETE', deleteConfirmUser.id);
      window.dispatchEvent(new Event('attendance-refresh'));
      toast.success(`User "${deleteConfirmUser.full_name || deleteConfirmUser.username}" removed.`);
      setDeleteConfirmUser(null);
      if (editingId === deleteConfirmUser.id) {
        handleCancelEdit();
      }
      await loadUsers();
    } catch (err: any) {
      const msg = err.message || 'Failed to delete user account.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  // Check if all filtered users are selected
  const isAllSelected = useMemo(() => {
    if (filteredUsers.length === 0) return false;
    return filteredUsers.every((u) => selectedUserIds.includes(u.id));
  }, [filteredUsers, selectedUserIds]);

  const isIndeterminate = useMemo(() => {
    const count = filteredUsers.filter((u) => selectedUserIds.includes(u.id)).length;
    return count > 0 && count < filteredUsers.length;
  }, [filteredUsers, selectedUserIds]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const filteredSet = new Set(filteredUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const combined = new Set([...selectedUserIds, ...filteredUsers.map((u) => u.id)]);
      setSelectedUserIds(Array.from(combined));
    }
  };

  const handleSelectAllTotal = () => {
    setSelectedUserIds(users.map((u) => u.id));
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  // Bulk Delete Selected Users
  const handleBulkDelete = async () => {
    const targetIds = selectedUserIds.filter((id) => id !== currentUser?.id);
    if (targetIds.length === 0) {
      toast.warning('No deletable accounts selected. You cannot delete your own admin account.');
      setBulkDeleteModalOpen(false);
      return;
    }

    setIsBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const uid of targetIds) {
      try {
        await api.users('DELETE', uid);
        successCount++;
      } catch (e) {
        console.error(`Error deleting user ${uid}:`, e);
        failCount++;
      }
    }

    setIsBulkProcessing(false);
    setBulkDeleteModalOpen(false);
    setSelectedUserIds([]);
    window.dispatchEvent(new Event('attendance-refresh'));
    await loadUsers();

    if (successCount > 0) {
      toast.success(`Permanently deleted ${successCount} user account(s) from database.`);
    }
    if (failCount > 0) {
      toast.error(`Failed to delete ${failCount} account(s).`);
    }
  };

  // Bulk Status Update (Activate or Suspend)
  const handleBulkSetStatus = async (isActive: boolean) => {
    const targetIds = selectedUserIds.filter((id) => id !== currentUser?.id);
    if (targetIds.length === 0) {
      toast.warning('You cannot change the status of your own admin account.');
      return;
    }

    setIsBulkProcessing(true);
    let count = 0;
    for (const uid of targetIds) {
      try {
        await api.users('PATCH', uid, { is_active: isActive });
        count++;
      } catch (e) {
        console.error(`Error updating user status for ${uid}:`, e);
      }
    }
    setIsBulkProcessing(false);
    await loadUsers();
    toast.success(`${count} user account(s) ${isActive ? 'activated' : 'suspended'}.`);
  };

  return (
    <div className={isEmbedded ? "w-full" : "py-10 sm:py-14 bg-gray-50 dark:bg-dark-bg min-h-screen transition-colors duration-300"}>
      <div className={isEmbedded ? "w-full space-y-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"}>
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {!isEmbedded && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Dashboard</span>
              </Link>
            )}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <Users className="w-4 h-4" />
              <span>User & Account Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage accounts, roles, and access credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={loadUsers}
              disabled={busy}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/15 border border-gray-200 dark:border-white/10 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Refresh User Directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin text-primary' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm });
                setIsFormOpen(true);
                setError('');
                setShowPassword(false);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white flex items-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium">
              <span className="font-bold">Security Notice: </span>
              {error}
            </div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metrics Overview Cards */}
        {busy && users.length === 0 ? (
          <SkeletonStats count={5} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Total Accounts */}
            <FlatCard hoverEffect={false} className="p-4 border border-gray-200/80 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Users</span>
                <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 dark:text-white mt-1.5">
                <CountUp value={stats.total} />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.active} Active</span> • {stats.total - stats.active} Suspended
              </div>
            </FlatCard>

            {/* Administrators */}
            <FlatCard hoverEffect={false} className="p-4 border border-amber-500/20 dark:border-amber-500/15 bg-amber-500/[0.02]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Admins</span>
                <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1.5">
                <CountUp value={stats.admins} />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                System Administrators
              </div>
            </FlatCard>

            {/* Faculty / Instructors */}
            <FlatCard hoverEffect={false} className="p-4 border border-emerald-500/20 dark:border-emerald-500/15 bg-emerald-500/[0.02]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Faculty</span>
                <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
                <CountUp value={stats.teachers} />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Instructors & Staff
              </div>
            </FlatCard>

            {/* Leaders (Squad Leaders) */}
            <FlatCard hoverEffect={false} className="p-4 border border-indigo-500/20 dark:border-indigo-500/15 bg-indigo-500/[0.02]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Leaders</span>
                <div className="p-1.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5">
                <CountUp value={stats.leaders} />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Squad Leaders
              </div>
            </FlatCard>

            {/* Active Students */}
            <FlatCard hoverEffect={false} className="p-4 border border-primary/20 dark:border-primary/15 bg-primary/[0.02]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary dark:text-primary-light">Students</span>
                <div className="p-1.5 rounded-xl bg-primary/15 text-primary dark:text-primary-light">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-primary dark:text-primary-light mt-1.5">
                <CountUp value={stats.students} />
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Enrolled Cadets
              </div>
            </FlatCard>
          </div>
        )}

        {/* User Creation & Editing Modal Popup */}
        {createPortal(
          <AnimatePresence>
            {isFormOpen && (
              <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleCancelEdit();
                }}
              >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-full max-w-4xl bg-white dark:bg-[#161d27] rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${editingId ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                      {editingId ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className="font-heading font-black text-base sm:text-lg text-gray-900 dark:text-white">
                        {editingId ? 'Edit User Credentials' : 'Create New User Account'}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {editingId 
                          ? 'Update user information or assign a new password.'
                          : 'Enter details below to register a new system account.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveUser} autoComplete="off" className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                  {/* Account Role Selector */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                      Account Role *
                      {editingId === currentUser?.id && (
                        <span className="text-[10px] text-amber-500 font-normal ml-1">(you cannot change your own role)</span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                      <button
                        type="button"
                        disabled={editingId === currentUser?.id}
                        onClick={() => setForm(prev => ({ ...prev, role: 'student' }))}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          form.role === 'student'
                            ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Student</span>
                      </button>

                      <button
                        type="button"
                        disabled={editingId === currentUser?.id}
                        onClick={() => setForm(prev => ({ ...prev, role: 'teacher', student_id: '' }))}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          form.role === 'teacher'
                            ? 'bg-white dark:bg-white/15 text-emerald-600 dark:text-emerald-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Teacher</span>
                      </button>

                      <button
                        type="button"
                        disabled={editingId === currentUser?.id}
                        onClick={() => setForm(prev => ({ ...prev, role: 'leader' }))}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          form.role === 'leader'
                            ? 'bg-white dark:bg-white/15 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Leader</span>
                      </button>

                      <button
                        type="button"
                        disabled={editingId === currentUser?.id}
                        onClick={() => setForm(prev => ({ ...prev, role: 'admin', student_id: '' }))}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          form.role === 'admin'
                            ? 'bg-white dark:bg-white/15 text-amber-600 dark:text-amber-400 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Account Flow (All 18 Fields) */}
                  {form.role === 'student' ? (
                    <div className="space-y-5">
                      {/* Section 1: Academic & Enrollment Information */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 dark:border-white/5">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                              1. Academic & Enrollment Details
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Official enrollment number, academic session, course, mode, and institute center
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                          {/* Field 1: Enrollment No. */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Enrollment No. *
                            </label>
                            <input
                              type="text"
                              required
                              value={form.enrollment_no}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm(prev => ({
                                  ...prev,
                                  enrollment_no: val,
                                  student_id: prev.student_id ? prev.student_id : val,
                                  username: prev.username ? prev.username : val,
                                }));
                              }}
                              placeholder="e.g. 2600DFS26101"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 2: Session/Year */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Session / Year *
                            </label>
                            <input
                              type="text"
                              required
                              value={form.session_year}
                              onChange={(e) => setForm({ ...form, session_year: e.target.value })}
                              placeholder="e.g. 01-Jul or 2026-2027"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 15: Mode (Reg/Corresponding ) */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Mode (Reg / Corresponding) *
                            </label>
                            <select
                              value={form.mode}
                              onChange={(e) => setForm({ ...form, mode: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            >
                              <option value="REGULAR">REGULAR</option>
                              <option value="CORRESPONDING">CORRESPONDING</option>
                            </select>
                          </div>

                          {/* Field 14: Course Name */}
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Course Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={form.course}
                              onChange={(e) => setForm({ ...form, course: e.target.value })}
                              placeholder="e.g. DIPLOMA IN FIRE AND SAFETY MANAGEMENT"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                          </div>

                          {/* Field 13: Center Name */}
                          <div className="sm:col-span-1 lg:col-span-1">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Center Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={form.center_name}
                              onChange={(e) => setForm({ ...form, center_name: e.target.value })}
                              placeholder="e.g. CENTRAL FIRE AND SAFETY INSTITUTE"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Personal & Family Identity */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 dark:border-white/5">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                              2. Personal & Family Identity
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Student name, parentage, date of birth, identity card, and demographics
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                          {/* Field 3: Student Name */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Student Name *
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={200}
                              value={form.full_name}
                              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                              placeholder="e.g. Rahul Vijay Patel"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                          </div>

                          {/* Field 4: Father Name */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Father Name
                            </label>
                            <input
                              type="text"
                              maxLength={200}
                              value={form.father_name}
                              onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                              placeholder="e.g. Vijay Patel"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                          </div>

                          {/* Field 5: Mother Name */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Mother Name
                            </label>
                            <input
                              type="text"
                              maxLength={200}
                              value={form.mother_name}
                              onChange={(e) => setForm({ ...form, mother_name: e.target.value })}
                              placeholder="e.g. Geeta Patel"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                          </div>

                          {/* Field 9: Date of Birth */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Date of Birth (DD-MM-YYYY) *
                            </label>
                            <input
                              type="text"
                              required
                              value={form.birth_date}
                              onChange={(e) => {
                                const val = e.target.value;
                                const digits = val.replace(/\D/g, '');
                                setForm(prev => ({
                                  ...prev,
                                  birth_date: val,
                                  password: (!prev.password || prev.password.length === 8) && digits.length >= 8 ? digits.slice(0, 8) : prev.password
                                }));
                              }}
                              placeholder="e.g. 18-01-2007"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 10: Gender */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Gender *
                            </label>
                            <select
                              value={form.gender}
                              onChange={(e) => setForm({ ...form, gender: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            >
                              <option value="MALE">MALE</option>
                              <option value="FEMALE">FEMALE</option>
                              <option value="OTHER">OTHER</option>
                            </select>
                          </div>

                          {/* Field 11: Category */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              value={form.category}
                              onChange={(e) => setForm({ ...form, category: e.target.value })}
                              placeholder="e.g. General / OBC / SC / ST"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 12: Aadhar Card */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Aadhar Card
                            </label>
                            <input
                              type="text"
                              maxLength={20}
                              value={form.aadhar_card}
                              onChange={(e) => setForm({ ...form, aadhar_card: e.target.value })}
                              placeholder="e.g. 1234 5678 9012"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 17: Nationality */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Nationality
                            </label>
                            <input
                              type="text"
                              value={form.nationality}
                              onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                              placeholder="e.g. INDIAN"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 18: State */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              value={form.state}
                              onChange={(e) => setForm({ ...form, state: e.target.value })}
                              placeholder="e.g. GUJARAT"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Contact & Address Information */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200/60 dark:border-white/5">
                          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                              3. Contact & Address Details
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Cadet phone, parents emergency contact, email address, and residential address
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                          {/* Field 7: Student Contact Details */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Student Contact Details (Phone)
                            </label>
                            <input
                              type="tel"
                              maxLength={15}
                              value={form.student_phone}
                              onChange={(e) => setForm({ ...form, student_phone: e.target.value })}
                              placeholder="e.g. 9876543210"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 8: Parents Contact Details */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Parents Contact Details (Phone)
                            </label>
                            <input
                              type="tel"
                              maxLength={15}
                              value={form.father_phone}
                              onChange={(e) => setForm({ ...form, father_phone: e.target.value })}
                              placeholder="e.g. 9876543211"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 16: Email ID */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Email ID
                            </label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              placeholder="e.g. student@cfsi.edu.in"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          {/* Field 6: Present Address */}
                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Present Address
                            </label>
                            <input
                              type="text"
                              value={form.present_address}
                              onChange={(e) => setForm({ ...form, present_address: e.target.value })}
                              placeholder="e.g. At & Po. Limda, Ta. Waghodia, Dist. Vadodara, Gujarat - 391760"
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Login & Authentication Credentials */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-primary/[0.03] border border-primary/20 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-primary/10">
                          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                            <Key className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                              4. Portal Login Credentials
                            </h3>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              Cadet user credentials for student dashboard and attendance login
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                          {/* Student ID / Username */}
                          <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                              Student ID / Login ID *
                              {editingId && <span className="text-[10px] text-gray-400 font-normal lowercase ml-1">(locked)</span>}
                            </label>
                            <div className="relative">
                              <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                required
                                maxLength={100}
                                disabled={!!editingId}
                                value={form.student_id || form.username}
                                onChange={(e) => {
                                  const val = e.target.value.trim();
                                  setForm({ ...form, student_id: val, username: val });
                                }}
                                placeholder="e.g. 262701"
                                autoComplete="off"
                                className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border font-mono ${
                                  editingId
                                    ? 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/5 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Password */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                {editingId ? 'Password (optional)' : 'Password *'}
                              </label>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                {editingId ? 'Leave blank to keep current' : 'Default is DOB (DDMMYYYY)'}
                              </span>
                            </div>
                            <div className="relative">
                              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                name="cfsi_student_pwd"
                                id="cfsi_student_pwd"
                                required={!editingId}
                                minLength={8}
                                maxLength={72}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder={editingId ? '••••••••  (unchanged)' : 'DDMMYYYY or custom (min 8 chars)'}
                                autoComplete="new-password"
                                className="w-full pl-10 pr-10 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                title={showPassword ? 'Hide password' : 'Show password'}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Teacher / Admin / Leader Account Flow */
                    <div className="space-y-4">
                      {form.role === 'leader' && (
                        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                                Link Enrolled Cadet
                              </h4>
                              <p className="text-[11px] text-indigo-800/70 dark:text-indigo-300">
                                Select an enrolled student from the institute roster to assign as Leader
                              </p>
                            </div>
                          </div>

                          <div>
                            <select
                              value={form.student_id}
                              onChange={(e) => {
                                const sid = e.target.value;
                                const matched = enrolledStudents.find((s) => s.id === sid);
                                if (matched) {
                                  setForm((prev) => ({
                                    ...prev,
                                    student_id: matched.id,
                                    full_name: matched.name || prev.full_name,
                                    username: prev.username && prev.username !== '' ? prev.username : (matched.rollNo || matched.id),
                                  }));
                                } else {
                                  setForm((prev) => ({ ...prev, student_id: sid }));
                                }
                              }}
                              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="">-- Choose enrolled cadet from database --</option>
                              {enrolledStudents.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} (Roll #{s.rollNo} • {s.course})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              required
                              maxLength={200}
                              value={form.full_name}
                              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                              placeholder={form.role === 'admin' ? 'e.g. System Administrator' : 'e.g. Dr. Rajesh Kumar'}
                              autoComplete="off"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                            Username / Login ID *
                            {editingId && <span className="text-[10px] text-gray-400 font-normal lowercase ml-1">(cannot be altered)</span>}
                          </label>
                          <div className="relative">
                            <AtSign className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              required
                              minLength={3}
                              maxLength={100}
                              disabled={!!editingId}
                              value={form.username}
                              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
                              placeholder={form.role === 'admin' ? 'e.g. admin.officer' : 'e.g. rajesh.kumar'}
                              autoComplete="off"
                              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border font-mono ${
                                editingId
                                  ? 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/5 text-gray-500 cursor-not-allowed'
                                  : 'border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                          {editingId ? 'New Password (optional)' : 'Password *'}
                          <span className="text-[10px] text-gray-400 font-normal lowercase ml-1">
                            {editingId ? '(leave blank to keep current)' : '(min. 8 characters)'}
                          </span>
                        </label>
                        <div className="relative">
                          <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="cfsi_staff_secret_key"
                            id="cfsi_staff_secret_key"
                            required={!editingId}
                            minLength={8}
                            maxLength={72}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder={editingId ? '••••••••  (unchanged)' : 'Enter strong password (8+ chars)'}
                            autoComplete="new-password"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  </div>

                  {/* Modal Footer - Pinned */}
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/[0.02] shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        disabled={editingId === currentUser?.id}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Active Account Status
                      </span>
                    </label>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={busy}
                        className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
                      >
                        {busy ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {editingId
                                ? 'Update User'
                                : form.role === 'student'
                                ? 'Create Student Account'
                                : 'Create User Account'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

        {/* User Directory Filter & Table Section */}
        <div className="space-y-4">
          
          {/* Filter Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, username, or student ID..."
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

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Role filter */}
              <div className="flex items-center rounded-xl p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold overflow-x-auto no-scrollbar">
                {(['all', 'admin', 'teacher', 'leader', 'student'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors shrink-0 ${
                      roleFilter === r
                        ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm font-bold'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {r === 'all' ? `All Roles (${users.length})` : r}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center rounded-xl p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold">
                {(['all', 'active', 'inactive'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                      statusFilter === s
                        ? 'bg-white dark:bg-white/15 text-primary dark:text-white shadow-sm font-bold'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {s === 'all' ? `All Status (${users.length})` : s}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Users Table Card */}
          <FlatCard hoverEffect={false} className="border border-gray-200/80 dark:border-white/10 shadow-md overflow-hidden">
            
            {/* Selection Action Toolbar */}
            {selectedUserIds.length > 0 && (
              <div className="p-3.5 sm:px-6 bg-primary/10 dark:bg-primary/20 border-b border-primary/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                    {selectedUserIds.length}
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {selectedUserIds.length === 1 ? 'user selected' : 'users selected'}
                  </span>
                  {selectedUserIds.length < filteredUsers.length && (
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-xs font-semibold text-primary dark:text-primary-light hover:underline ml-1"
                    >
                      Select all {filteredUsers.length} visible
                    </button>
                  )}
                  {selectedUserIds.length < users.length && (
                    <button
                      type="button"
                      onClick={handleSelectAllTotal}
                      className="text-xs font-semibold text-primary dark:text-primary-light hover:underline ml-1"
                    >
                      Select all {users.length} in system
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={() => handleBulkSetStatus(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors flex items-center gap-1.5"
                    title="Activate selected accounts"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Activate</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={() => handleBulkSetStatus(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-colors flex items-center gap-1.5"
                    title="Suspend selected accounts"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Suspend</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={() => setBulkDeleteModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm flex items-center gap-1.5"
                    title="Permanently delete selected accounts from database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedUserIds.length})</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={handleClearSelection}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200/60 dark:border-white/10">
                    <th className="py-3.5 px-4 w-12 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          ref={selectAllCheckboxRef}
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleToggleSelectAll}
                          className="w-4 h-4 text-primary rounded border-gray-300 dark:border-white/20 focus:ring-primary cursor-pointer"
                          title={isAllSelected ? "Deselect all visible users" : "Select all visible users"}
                          aria-label="Select all visible users"
                        />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Student ID / Link</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60 dark:divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="w-8 h-8 opacity-40" />
                          <p className="font-semibold text-sm">No accounts found</p>
                          <p className="text-xs">Try adjusting your search query or role filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((account) => {
                      const isSelf = account.id === currentUser?.id;
                      const isSelected = selectedUserIds.includes(account.id);
                      const roleColors = {
                        admin: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                        teacher: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                        leader: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                        student: 'bg-primary/10 text-primary dark:text-primary-light border-primary/20',
                      }[account.role];

                      const roleGradient = {
                        admin: 'from-amber-500 to-orange-600 text-white',
                        teacher: 'from-emerald-500 to-teal-600 text-white',
                        leader: 'from-indigo-500 to-purple-600 text-white',
                        student: 'from-blue-500 to-indigo-600 text-white',
                      }[account.role];

                      return (
                        <tr
                          key={account.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-primary/[0.06] dark:bg-primary/[0.12]'
                              : 'hover:bg-primary/[0.02] dark:hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Row Selection Checkbox */}
                          <td className="py-3.5 px-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectUser(account.id)}
                                className="w-4 h-4 text-primary rounded border-gray-300 dark:border-white/20 focus:ring-primary cursor-pointer"
                                aria-label={`Select ${account.full_name || account.username}`}
                              />
                            </div>
                          </td>

                          {/* User Identity */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${roleGradient} flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
                                {(account.full_name || account.username).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                  <span>{account.full_name || account.username}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-primary text-white">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                                  {account.username}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Access Role */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleColors}`}>
                              {account.role === 'admin' && <Shield className="w-3 h-3" />}
                              {account.role === 'teacher' && <BookOpen className="w-3 h-3" />}
                              {account.role === 'leader' && <Award className="w-3 h-3" />}
                              {account.role === 'student' && <GraduationCap className="w-3 h-3" />}
                              <span className="capitalize">{account.role}</span>
                            </span>
                          </td>

                          {/* Linked Student ID */}
                          <td className="py-3.5 px-4">
                            {account.student_id ? (
                              <div className="flex flex-col">
                                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary dark:text-primary-light">
                                  <span>{account.student_id}</span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">
                                Staff Credential (Unlinked)
                              </span>
                            )}
                          </td>

                          {/* Account Status */}
                          <td className="py-3.5 px-4 text-center">
                            {account.is_active ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>Suspended</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Quick Promote to Leader */}
                              {account.role === 'student' && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => handlePromoteStudentToLeader(account)}
                                  className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                                  title="Appoint as Cadet Leader"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Quick Demote from Leader */}
                              {account.role === 'leader' && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => handleDemoteLeaderToStudent(account)}
                                  className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                                  title="Demote to Regular Student"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleStartEdit(account)}
                                className="p-2 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary hover:text-white transition-colors"
                                title="Edit user account"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={isSelf || busy}
                                onClick={() => setDeleteConfirmUser(account)}
                                className={`p-2 rounded-xl transition-colors ${
                                  isSelf
                                    ? 'opacity-30 cursor-not-allowed text-gray-400 bg-gray-100 dark:bg-white/5'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white'
                                }`}
                                title={isSelf ? 'Cannot delete your own active session' : 'Delete user account'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Demo Pagination Style */}
            <TablePagination
              currentPage={currentPage}
              totalEntries={filteredUsers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50, 100]}
              itemLabel="users"
            />
          </FlatCard>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {/* Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {deleteConfirmUser && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 shadow-2xl p-6 space-y-4 text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <div className="p-3 rounded-2xl bg-red-500/10">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg">Confirm Account Deletion</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Permanent security action</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Are you sure you want to permanently delete the account for{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {deleteConfirmUser.full_name || deleteConfirmUser.username}
                  </span>{' '}
                  (<span className="font-mono">{deleteConfirmUser.username}</span>)?
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    • This will invalidate all active sessions and permanently revoke portal access.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setDeleteConfirmUser(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={confirmDelete}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md flex items-center gap-1.5"
                  >
                    {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Delete User</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Bulk Delete Confirmation Modal */}
      {createPortal(
        <AnimatePresence>
          {bulkDeleteModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 shadow-2xl p-6 space-y-4 text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <div className="p-3 rounded-2xl bg-red-500/10">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg">Confirm Bulk Account Deletion</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Permanent security action</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Are you sure you want to permanently delete{' '}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedUserIds.filter((id) => id !== currentUser?.id).length}
                  </span>{' '}
                  selected user account(s) from MongoDB?
                  {selectedUserIds.includes(currentUser?.id || '') && (
                    <p className="mt-2 text-xs text-amber-500 font-medium">
                      • Note: Your active administrator account will be protected and preserved.
                    </p>
                  )}
                  <p className="mt-2 text-xs text-red-500 font-medium">
                    • This will invalidate all credentials, delete associated profiles, and purge attendance records.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={() => setBulkDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isBulkProcessing}
                    onClick={handleBulkDelete}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md flex items-center gap-1.5"
                  >
                    {isBulkProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>Delete Selected Accounts</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Bulk Student Import Modal */}
      <BulkStudentImportModal
        isOpen={bulkImportModalOpen}
        onClose={() => setBulkImportModalOpen(false)}
        onSuccess={loadUsers}
      />

    </div>
  );
}
