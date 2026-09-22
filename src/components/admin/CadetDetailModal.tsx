import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Save,
  Camera,
  Trash2
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
  initialEditMode?: boolean;
}

export const CadetDetailModal: React.FC<CadetDetailModalProps> = ({
  cadet,
  onClose,
  onNavigateToAttendance,
  onStudentUpdated,
  initialEditMode = false,
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
    photoUrl: '',
  });

  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [leaderAccount, setLeaderAccount] = useState<AuthUser | null>(null);
  const [busyLeadership, setBusyLeadership] = useState<boolean>(false);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setEditForm((prev) => ({ ...prev, photoUrl: result }));
      toast.success('Photo selected! Click "Save Changes" to upload.');
    };
    reader.readAsDataURL(file);
  };

  const startEditing = (target?: StudentVerificationRecord | null | unknown) => {
    const c = (target && typeof target === 'object' && 'id' in target)
      ? (target as StudentVerificationRecord)
      : currentCadet;
    if (!c) return;
    setEditForm({
      name: c.name || '',
      fatherName: c.fatherName || '',
      motherName: c.motherName || '',
      studentPhone: c.studentPhone || '',
      fatherPhone: c.fatherPhone || '',
      motherPhone: c.motherPhone || '',
      birthDate: c.birthDate || '',
      gender: c.gender || 'MALE',
      category: c.category || 'General',
      aadharCard: c.aadharCard || '',
      email: c.email || '',
      mode: c.mode || 'REGULAR',
      centerName: c.centerName || c.centerLocation || '',
      presentAddress: c.presentAddress || '',
      photoUrl: c.photoUrl || '',
    });
    setIsEditing(true);
  };

  useEffect(() => {
    setDisplayCadet(cadet);
    if (initialEditMode && cadet) {
      startEditing(cadet);
    } else {
      setIsEditing(false);
    }
  }, [cadet, initialEditMode]);

  const currentCadet = displayCadet || cadet;

  useEffect(() => {
    if (currentCadet) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          startEditing(currentCadet);
          setIsEditing(false);
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentCadet]);

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
        photoUrl: editForm.photoUrl,
      });

      const merged: StudentVerificationRecord = {
        ...currentCadet,
        ...updatedProfile,
        photoUrl: updatedProfile.photoUrl !== undefined ? updatedProfile.photoUrl : editForm.photoUrl,
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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overscroll-contain"
      onWheel={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          startEditing(currentCadet);
          setIsEditing(false);
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-[#12181f] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden overscroll-contain">
        {/* Top Strip */}
        <div className="h-2 w-full bg-primary shrink-0" />

        {/* Fixed Modal Header */}
        <div className="p-5 sm:px-8 sm:py-5 border-b border-gray-100 dark:border-white/10 shrink-0 bg-white dark:bg-[#12181f]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            <div className="flex items-center gap-2 shrink-0">
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
                    className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-xs hover:scale-105 shrink-0 ${
                      isEditing
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20'
                    }`}
                    title={isEditing ? 'Close editing mode' : 'Edit student profile'}
                    aria-label={isEditing ? 'Close editing mode' : 'Edit student profile'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {!isLeader ? (
                    <button
                      type="button"
                      onClick={handleAssignLeader}
                      disabled={busyLeadership}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
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
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-500/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-gray-200 dark:border-white/10 whitespace-nowrap shrink-0"
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
                onClick={() => {
                  startEditing(currentCadet);
                  setIsEditing(false);
                  onClose();
                }}
                className="p-2.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Close Modal"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 overscroll-contain">
          {/* Section 1: Student Information & Academic Details */}
          <div>
            {!isEditing && (
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Student Information & Academic Details</span>
                </h3>
              </div>
            )}

            {isEditing ? (
              <div className="bg-primary/5 dark:bg-white/5 border border-primary/20 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
                {/* Upload Photo Section */}
                <div className="p-4 sm:p-4.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <UserAvatar
                      photoUrl={editForm.photoUrl}
                      name={editForm.name || currentCadet.name}
                      size="lg"
                      className="border-2 border-primary/20 shadow-sm"
                    />
                    {editForm.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, photoUrl: '' }))}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-md transition-all cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <label className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                        <Camera className="w-4 h-4" />
                        <span>{editForm.photoUrl ? 'Change Photo' : 'Upload Student Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                        />
                      </label>

                      {editForm.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditForm(prev => ({ ...prev, photoUrl: '' }))}
                          className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Upload student photo (JPG, PNG or WEBP, max 3MB). Changes will save when clicking "Save Changes".
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="Student Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Student Phone *
                    </label>
                    <input
                      type="text"
                      value={editForm.studentPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, studentPhone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="student@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer transition-all shadow-xs"
                    >
                      <option value="MALE">MALE</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer transition-all shadow-xs"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      value={editForm.aadharCard}
                      onChange={(e) => setEditForm(prev => ({ ...prev, aadharCard: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="12-digit Aadhaar"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Study Mode
                    </label>
                    <select
                      value={editForm.mode}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mode: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer transition-all shadow-xs"
                    >
                      <option value="REGULAR">REGULAR</option>
                      <option value="CORRESPONDENCE">CORRESPONDENCE</option>
                      <option value="DISTANCE">DISTANCE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Campus / Center
                    </label>
                    <input
                      type="text"
                      value={editForm.centerName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, centerName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="Center Name or Location"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      value={editForm.fatherName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="Father's Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Father's Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.fatherPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fatherPhone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="Father's contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      value={editForm.motherName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="Mother's Full Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Mother's Phone
                    </label>
                    <input
                      type="text"
                      value={editForm.motherPhone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, motherPhone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
                      placeholder="Mother's contact number"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-[12.5px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      value={editForm.presentAddress}
                      onChange={(e) => setEditForm(prev => ({ ...prev, presentAddress: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-[#161d27] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all shadow-xs"
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

          {/* Section 2: Attendance Records & History (Hidden during Editing Mode) */}
          {!isEditing && (
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
          )}
        </div>

        {/* Fixed Modal Footer Actions */}
        <div className="p-4 sm:px-8 sm:py-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 bg-gray-50/60 dark:bg-white/[0.02] shrink-0">
          {isEditing ? (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  startEditing(currentCadet);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    startEditing(currentCadet);
                    setIsEditing(false);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary hover:bg-primary/90 text-white transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Uploading Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
