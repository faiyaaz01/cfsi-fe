import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { api, AuthUser } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { StudentVerificationRecord } from '../types';
import { FlatCard } from '../components/common/FlatCard';
import { BulkStudentImportModal } from '../components/admin/BulkStudentImportModal';

interface UserFormData {
  username: string;
  password: string;
  full_name: string;
  role: AuthUser['role'];
  student_id: string;
  is_active: boolean;
}

const emptyForm: UserFormData = {
  username: '',
  password: '',
  full_name: '',
  role: 'student',
  student_id: '',
  is_active: true,
};

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<StudentVerificationRecord[]>([]);
  const [form, setForm] = useState<UserFormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student'>('all');
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
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Metric stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      teachers: users.filter((u) => u.role === 'teacher').length,
      students: users.filter((u) => u.role === 'student').length,
      active: users.filter((u) => u.is_active).length,
    };
  }, [users]);

  // Initiate Edit
  const handleStartEdit = (account: AuthUser) => {
    setEditingId(account.id);
    setForm({
      username: account.username,
      password: '',
      full_name: account.full_name || '',
      role: account.role,
      student_id: account.student_id || '',
      is_active: account.is_active,
    });
    setError('');
    setShowPassword(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
    setShowPassword(false);
  };

  // Quick Cadet Selector handler
  const handleCadetSelect = (studentId: string) => {
    if (!studentId) {
      setForm((prev) => ({ ...prev, student_id: '' }));
      return;
    }
    const student = enrolledStudents.find((s) => s.id === studentId);
    setForm((prev) => ({
      ...prev,
      student_id: studentId,
      full_name: prev.full_name || (student ? student.name : ''),
      username: student ? student.id : (prev.username || studentId.toLowerCase()),
    }));
  };

  // Submit User Form (Create / Update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const payload: any = {
        full_name: form.full_name.trim(),
        role: form.role,
        is_active: form.is_active,
        student_id: form.role === 'student' ? (form.student_id.trim() || null) : null,
      };

      if (editingId) {
        // PATCH update
        if (form.password) {
          payload.password = form.password;
        }
        await api.users('PATCH', editingId, payload);
        toast.success(`User "${form.full_name || form.username}" updated successfully.`);
      } else {
        // POST create
        payload.username = form.username.trim();
        payload.password = form.password;
        await api.users('POST', '', payload);
        toast.success(`User "${payload.full_name}" created successfully.`);
      }

      handleCancelEdit();
      await loadUsers();
    } catch (err: any) {
      const msg = err.message || 'Unable to save user. Please verify input fields.';
      setError(msg);
      toast.error(msg);
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
    <div className="py-10 sm:py-14 bg-gray-50 dark:bg-dark-bg min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span>Institutional Identity & Access Control</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-gray-900 dark:text-white">
              User Management & Access Control
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-3xl">
              Create, configure, and maintain authenticated Administrator, Faculty Instructor, and Cadet access credentials.
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
                handleCancelEdit();
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New User</span>
            </button>

            <button
              type="button"
              onClick={() => setBulkImportModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-sm active:scale-95 cursor-pointer"
              title="Bulk import students from CSV or Excel and auto-generate accounts"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulk Import Students (CSV/Excel)</span>
            </button>

            <Link
              to="/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 flex items-center gap-1.5 transition-opacity shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Accounts */}
          <FlatCard hoverEffect={false} className="p-5 border border-gray-200/80 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Accounts</span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2">
              {stats.total}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              {stats.active} Active • {stats.total - stats.active} Suspended
            </div>
          </FlatCard>

          {/* Administrators */}
          <FlatCard hoverEffect={false} className="p-5 border border-amber-500/20 dark:border-amber-500/15 bg-amber-500/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Administrators</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
              {stats.admins}
            </div>
            <div className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">
              Full System Access & User Controls
            </div>
          </FlatCard>

          {/* Faculty / Instructors */}
          <FlatCard hoverEffect={false} className="p-5 border border-emerald-500/20 dark:border-emerald-500/15 bg-emerald-500/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Faculty & Staff</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {stats.teachers}
            </div>
            <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              Attendance Muster & Drill Records
            </div>
          </FlatCard>

          {/* Active Cadets */}
          <FlatCard hoverEffect={false} className="p-5 border border-primary/20 dark:border-primary/15 bg-primary/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-primary-light">Active Cadets</span>
              <div className="p-2 rounded-xl bg-primary/15 text-primary dark:text-primary-light">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-primary dark:text-primary-light mt-2">
              {stats.students}
            </div>
            <div className="text-[11px] text-primary/80 dark:text-primary-light/80 mt-1">
              Individual Portal & Training Dossier
            </div>
          </FlatCard>
        </div>

        {/* User Creation & Editing Card */}
        <div ref={formRef}>
          <FlatCard hoverEffect={false} className="p-6 sm:p-8 border border-gray-200/80 dark:border-white/10 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${editingId ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                  {editingId ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg sm:text-xl text-gray-900 dark:text-white">
                    {editingId ? 'Edit User Credentials & Access Role' : 'Create New System Account'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {editingId 
                      ? 'Modifying credentials terminates existing sessions and requires the user to log in again.'
                      : 'Create accounts with assigned permissions. Student accounts must link to an official student ID.'}
                  </p>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-500 hover:bg-red-500/10 border border-gray-200 dark:border-white/10 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
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
                      placeholder="e.g. Rahul V. Patel"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>
                </div>

                {/* Username */}
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
                      placeholder="e.g. 262701"
                      autoComplete="off"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border font-mono ${
                        editingId 
                          ? 'border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/5 text-gray-500 cursor-not-allowed'
                          : 'border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    {editingId ? 'New Password (optional)' : 'Password *'}
                    <span className="text-[10px] text-gray-400 font-normal lowercase ml-1">
                      {editingId ? '(leave blank to keep unchanged)' : '(min. 8 characters)'}
                    </span>
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingId}
                      minLength={8}
                      maxLength={72}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={editingId ? '••••••••  (unchanged)' : 'Enter strong password (8+ chars)'}
                      autoComplete={editingId ? 'new-password' : 'current-password'}
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

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    System Access Role *
                    {editingId === currentUser?.id && (
                      <span className="text-[10px] text-amber-500 font-normal ml-1">(you cannot change your own role)</span>
                    )}
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={form.role}
                      disabled={editingId === currentUser?.id}
                      onChange={(e) => setForm({ ...form, role: e.target.value as AuthUser['role'] })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary font-semibold"
                    >
                      <option value="student">Student / Cadet (Access personal training logs & muster)</option>
                      <option value="teacher">Teacher / Instructor (Mark muster attendance & review roster)</option>
                      <option value="admin">Administrator (Full administrative authority & user management)</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Conditional Student ID Linking */}
              {form.role === 'student' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/15 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-primary-light uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" />
                    <span>Link Cadet Record</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Select from Registered Cadets
                      </label>
                      <select
                        value={form.student_id}
                        onChange={(e) => handleCadetSelect(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">-- Choose cadet from directory --</option>
                        {enrolledStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.id} — {s.name} (Roll {s.rollNo}, {s.course})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Or Type Student ID *
                      </label>
                      <input
                        type="text"
                        required={form.role === 'student'}
                        value={form.student_id}
                        onChange={(e) => setForm({ ...form, student_id: e.target.value.trim() })}
                        placeholder="e.g. 262701"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border border-gray-300 dark:border-white/10 bg-white dark:bg-[#12181f] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Account Status Toggle & Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-100 dark:border-white/5">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    disabled={editingId === currentUser?.id}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Active Account Status
                    </span>
                    <p className="text-[11px] text-gray-400">
                      {form.is_active ? 'User is permitted to authenticate.' : 'Suspended — login requests will be denied.'}
                    </p>
                  </div>
                </label>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all duration-200 shadow-md flex items-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    {busy ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editingId ? 'Update User Credentials' : 'Create User Account'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          </FlatCard>
        </div>

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
              <div className="flex items-center rounded-xl p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-semibold">
                {(['all', 'admin', 'teacher', 'student'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors ${
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
                    {s}
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
                    <th className="py-3.5 px-4">User Identity</th>
                    <th className="py-3.5 px-4">Access Role</th>
                    <th className="py-3.5 px-4">Cadet User ID</th>
                    <th className="py-3.5 px-4 text-center">Account Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-semibold">
                        No users found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((account) => {
                      const isSelf = account.id === currentUser?.id;
                      const isSelected = selectedUserIds.includes(account.id);
                      const roleColors = {
                        admin: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                        teacher: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                        student: 'bg-primary/10 text-primary dark:text-primary-light border-primary/20',
                      }[account.role];

                      const roleGradient = {
                        admin: 'from-amber-500 to-orange-600 text-white',
                        teacher: 'from-emerald-500 to-teal-600 text-white',
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
          </FlatCard>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <AnimatePresence>
        {bulkDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
      </AnimatePresence>

      {/* Bulk Student Import Modal */}
      <BulkStudentImportModal
        isOpen={bulkImportModalOpen}
        onClose={() => setBulkImportModalOpen(false)}
        onSuccess={loadUsers}
      />

    </div>
  );
}
