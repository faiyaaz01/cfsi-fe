import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Clock, 
  Plus, 
  Printer, 
  CheckCircle2,
  Award,
  UserMinus,
  RefreshCw,
  Edit3,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { StudentVerificationRecord } from '../../types';
import { useStudentData } from '../../context/StudentDataContext';
import { useAuth } from '../../context/AuthContext';
import { api, AuthUser } from '../../lib/api';
import { TablePagination } from '../common/TablePagination';
import { UserAvatar } from '../common/UserAvatar';

interface CadetDetailModalProps {
  cadet: StudentVerificationRecord | null;
  onClose: () => void;
  onNavigateToAttendance?: (cadet: StudentVerificationRecord) => void;
  onStudentUpdated?: (updated: StudentVerificationRecord) => void;
}

export const CadetDetailModal: React.FC<CadetDetailModalProps> = ({
  cadet,
  onClose,
  onNavigateToAttendance,
  onStudentUpdated,
}) => {
  const { user: currentUser } = useAuth();
  const { getStudentAttendanceSummary, getAttendanceByStudent } = useStudentData();
  const [modalAttPage, setModalAttPage] = useState(1);
  const [modalAttPageSize, setModalAttPageSize] = useState(5);

  const [displayCadet, setDisplayCadet] = useState<StudentVerificationRecord | null>(cadet);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    studentPhone: '',
    fatherPhone: '',
    motherPhone: '',
    birthDate: '',
    gender: 'MALE',
    category: 'General',
    aadharCard: '',
    email: '',
    mode: 'REGULAR',
    centerName: '',
    presentAddress: '',
  });

  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [leaderAccount, setLeaderAccount] = useState<AuthUser | null>(null);
  const [busyLeadership, setBusyLeadership] = useState<boolean>(false);

  useEffect(() => {
    setDisplayCadet(cadet);
    setIsEditing(false);
  }, [cadet]);

  const currentCadet = displayCadet || cadet;

  useEffect(() => {
    if (!currentCadet) return;
    let isMounted = true;
    api.users('GET')
      .then((users: AuthUser[]) => {
        if (!isMounted || !Array.isArray(users)) return;
        const matched = users.find(
          (u) => u.student_id === currentCadet.id || u.username === currentCadet.rollNo || u.username === currentCadet.id
        );
        if (matched) {
          setLeaderAccount(matched);
          setIsLeader(matched.role === 'leader');
        } else {
          setLeaderAccount(null);
          setIsLeader(false);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [currentCadet]);

  const startEditing = () => {
    if (!currentCadet) return;
    setEditForm({
      name: currentCadet.name || '',
      fatherName: currentCadet.fatherName || '',
      motherName: currentCadet.motherName || '',
      studentPhone: currentCadet.studentPhone || '',
      fatherPhone: currentCadet.fatherPhone || '',
      motherPhone: currentCadet.motherPhone || '',
      birthDate: currentCadet.birthDate || '',
      gender: currentCadet.gender || 'MALE',
      category: currentCadet.category || 'General',
      aadharCard: currentCadet.aadharCard || '',
      email: currentCadet.email || '',
      mode: currentCadet.mode || 'REGULAR',
      centerName: currentCadet.centerName || currentCadet.centerLocation || '',
      presentAddress: currentCadet.presentAddress || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!currentCadet) return;
    if (!editForm.name.trim()) {
      toast.error('Student Name is required');
      return;
    }
    if (!editForm.studentPhone.trim()) {
      toast.error('Student Phone Number is required');
      return;
    }

    try {
      setIsSaving(true);
      const updatedProfile = await api.adminUpdateStudent(currentCadet.id, {
        name: editForm.name.trim(),
        fatherName: editForm.fatherName.trim(),
        motherName: editForm.motherName.trim(),
        studentPhone: editForm.studentPhone.trim(),
        fatherPhone: editForm.fatherPhone.trim(),
        motherPhone: editForm.motherPhone.trim(),
        birthDate: editForm.birthDate.trim(),
        gender: editForm.gender,
        category: editForm.category,
        aadharCard: editForm.aadharCard.trim(),
        email: editForm.email.trim(),
        mode: editForm.mode,
        centerName: editForm.centerName.trim(),
        presentAddress: editForm.presentAddress.trim(),
      });

      const merged: StudentVerificationRecord = {
        ...currentCadet,
        ...updatedProfile,
        id: currentCadet.id,
        rollNo: currentCadet.rollNo,
        course: currentCadet.course,
        batch: currentCadet.batch,
        verificationStatus: currentCadet.verificationStatus,
      };

      setDisplayCadet(merged);
      setIsEditing(false);
      onStudentUpdated?.(merged);
      toast.success(`Profile for ${merged.name} updated successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignLeader = async () => {
    if (!currentCadet) return;
    if (!window.confirm(`Assign Cadet Leader role to ${currentCadet.name}?\n\nThey will gain access to the Leader Portal and slot-wise attendance marking.`)) {
      return;
    }

    try {
      setBusyLeadership(true);
      if (leaderAccount) {
        await api.users('PATCH', leaderAccount.id, {
          role: 'leader',
          student_id: currentCadet.id,
          full_name: currentCadet.name,
          assigned_modules: ['attendance'],
          assigned_slots: ['Slot 1', 'Slot 2', 'Slot 3'],
        });
      } else {
        await api.users('POST', '', {
          username: currentCadet.rollNo || currentCadet.id,
          password: 'Leader@123',
          full_name: currentCadet.name,
          role: 'leader',
          student_id: currentCadet.id,
          assigned_modules: ['attendance'],
          assigned_slots: ['Slot 1', 'Slot 2', 'Slot 3'],
          is_active: true,
        });
      }
      setIsLeader(true);
      toast.success(`Successfully appointed ${currentCadet.name} as Cadet Leader!`);
    } catch (err: any) {
      toast.error('Failed to assign Leader role: ' + (err.message || 'Error'));
    } finally {
      setBusyLeadership(false);
    }
  };

  const handleRevokeLeader = async () => {
    if (!currentCadet || !leaderAccount) return;
    if (!window.confirm(`Revoke Leader role for ${currentCadet.name}? Their account will return to regular Student status.`)) {
      return;
    }

    try {
      setBusyLeadership(true);
      await api.users('PATCH', leaderAccount.id, {
        role: 'student',
        assigned_modules: [],
        assigned_slots: [],
      });
      setIsLeader(false);
      toast.success(`Revoked Leader role for ${currentCadet.name}. Account returned to Student.`);
    } catch (err: any) {
      toast.error('Failed to revoke Leader role: ' + (err.message || 'Error'));
    } finally {
      setBusyLeadership(false);
    }
  };

  if (!currentCadet) return null;

  const summary = getStudentAttendanceSummary(currentCadet.id);
  const cadetAttRecords = getAttendanceByStudent(currentCadet.id);
  const paginatedModalRecords = cadetAttRecords.slice(
    (modalAttPage - 1) * modalAttPageSize,
    modalAttPage * modalAttPageSize
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Top Strip */}
        <div className="h-2 w-full bg-primary" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <UserAvatar
                  photoUrl={currentCadet.photoUrl}
                  name={currentCadet.name}
                  size="lg"
                />
                <div className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-[#161d27]" title="Verified">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light">
                    {currentCadet.course}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{currentCadet.verificationStatus}</span>
                  </span>
                  {isLeader && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <Award className="w-3 h-3" />
                      <span>Cadet Leader</span>
                    </span>
                  )}
                </div>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900 dark:text-white">
                  {currentCadet.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Father: <span className="font-semibold text-gray-800 dark:text-gray-200">{currentCadet.fatherName || 'N/A'}</span> • Batch: {currentCadet.batch}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser?.role === 'admin' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                      } else {
                        startEditing();
                      }
                    }}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isEditing
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'
                    }`}
                    title={isEditing ? 'Cancel editing' : 'Edit student profile details'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                  </button>

                  {!isLeader ? (
                    <button
                      type="button"
                      onClick={handleAssignLeader}
                      disabled={busyLeadership}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      title="Assign Leader role to this student"
                    >
                      {busyLeadership ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                      <span>Appoint as Leader</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRevokeLeader}
                      disabled={busyLeadership}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-500/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-gray-200 dark:border-white/10"
                      title="Revoke Leader role from this student"
                    >
                      {busyLeadership ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
                      <span>Revoke Leadership</span>
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Section 1: Student Information & Academic Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Student Information & Academic Details</span>
              </h3>
              {currentUser?.role === 'admin' && (
                !isEditing ? (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Information</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-primary dark:text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                    Editing Mode
                  </span>
                )
              )}
            </div>

            {isEditing ? (
              <div className="bg-primary/5 dark:bg-white/5 border border-primary/20 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Edit3 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">Admin Editing: {currentCadet.name}</h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">All fields will update in student registry and linked login account.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Student Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Student Phone *
                    </label>
                    <input
                      type="text"
                      value={editForm.studentPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, studentPhone: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Gender
                    </label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Category
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      value={editForm.aadharCard}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aadharCard: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="12-digit Aadhaar"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Study Mode
                    </label>
                    <select
                      value={editForm.mode}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mode: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                      <option value="REGULAR">REGULAR</option>
                      <option value="CORRESPONDENCE">CORRESPONDENCE</option>
                      <option value="DISTANCE">DISTANCE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Campus / Center
                    </label>
                    <input
                      type="text"
                      value={editForm.centerName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, centerName: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Center Name or Location"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      value={editForm.fatherName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherName: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Father's Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Father's Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.fatherPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherPhone: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Father's contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      value={editForm.motherName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Mother's Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Mother's Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.motherPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, motherPhone: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Mother's contact number"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={editForm.presentAddress}
                      onChange={(e) => setEditForm(prev => ({ ...prev, presentAddress: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#161d27] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Complete address"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Student ID (Login)</div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-primary dark:text-primary-light mt-0.5">
                    {currentCadet.id}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Roll Number</div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {currentCadet.rollNo}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Study Mode</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {currentCadet.mode || 'REGULAR'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Date of Birth</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {currentCadet.birthDate || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Gender</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {currentCadet.gender || 'MALE'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Category</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {currentCadet.category || 'General'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Aadhaar Number</div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {currentCadet.aadharCard || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Phone Number</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                    {currentCadet.studentPhone || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Email Address</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                    {currentCadet.email || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Father's Name</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                    {currentCadet.fatherName || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] font-semibold text-gray-400">Mother's Name</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                    {currentCadet.motherName || 'N/A'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 col-span-2">
                  <div className="text-[11px] font-semibold text-gray-400">Campus / Center</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                    {currentCadet.centerName || currentCadet.centerLocation}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 col-span-2">
                  <div className="text-[11px] font-semibold text-gray-400">Current Address</div>
                  <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                    {currentCadet.presentAddress || 'N/A'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Attendance Records & History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Attendance Records & History</span>
              </h3>
              {onNavigateToAttendance && (
                <button
                  type="button"
                  onClick={() => onNavigateToAttendance(currentCadet)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mark Attendance for Student</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {/* 4 Attendance Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10">
                  <div className="text-[11px] text-gray-500">Attendance Rate</div>
                  <div className="text-xl font-black text-primary dark:text-primary-light mt-0.5">
                    {summary.percentage}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                  <div className="text-[11px] text-gray-500">Total Sessions</div>
                  <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                    {summary.total}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/5 dark:bg-white/5 border border-emerald-500/10">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">Present Sessions</div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {summary.present}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-red-500/5 dark:bg-white/5 border border-red-500/10">
                  <div className="text-[11px] text-red-600 dark:text-red-400">Absent Sessions</div>
                  <div className="text-xl font-black text-red-600 dark:text-red-400 mt-0.5">
                    {summary.absent}
                  </div>
                </div>
              </div>

              {/* Compliance Bar */}
              {summary.total > 0 ? (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-gray-600 dark:text-gray-300">Overall Attendance Target (75%)</span>
                    <span className={summary.percentage >= 75 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                      {summary.percentage >= 75 ? 'Meets 75% Target' : 'Below 75% Target'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        summary.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-center">
                  <p className="text-xs text-gray-500">
                    No attendance recorded for this student yet.
                  </p>
                </div>
              )}

              {/* Recent Log Table if any */}
              {cadetAttRecords.length > 0 && (
                <div className="rounded-xl border border-gray-200/60 dark:border-white/10 overflow-hidden">
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-bold text-gray-400 sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Session</th>
                          <th className="py-2 px-3">Topic / Activity</th>
                          <th className="py-2 px-3 text-center">Status</th>
                          <th className="py-2 px-3">Instructor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {paginatedModalRecords.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{r.date}</td>
                            <td className="py-2 px-3 text-primary font-bold">{r.slot || 'Session 1'}</td>
                            <td className="py-2 px-3 text-gray-600 dark:text-gray-300 truncate max-w-xs">{r.topicOrModule || 'Ground Drill'}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-gray-400 text-[11px]">{r.markedBy || 'Instructor'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <TablePagination
                    currentPage={modalAttPage}
                    totalEntries={cadetAttRecords.length}
                    pageSize={modalAttPageSize}
                    onPageChange={setModalAttPage}
                    onPageSizeChange={setModalAttPageSize}
                    pageSizeOptions={[5, 10, 20]}
                    itemLabel="sessions"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Student Profile</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
