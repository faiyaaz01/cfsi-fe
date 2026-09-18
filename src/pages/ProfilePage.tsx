import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext';
import { api } from '../lib/api';
import { StudentProfile } from '../types';
import { toast } from 'sonner';
import { SkeletonProfile } from '../components/common/Skeleton';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  User,
  Camera,
  Eye,
  Calendar,
  Phone,
  Mail,
  Home,
  Shield,
  CreditCard,
  Globe,
  MapPin,
  CheckCircle,
  Save,
  RefreshCw,
  X,
  AlertCircle,
  GraduationCap,
  Building,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export const ProfilePage: React.FC = () => {
  const { user, refresh: refreshAuth } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isLocked = !isAdmin;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('MALE');
  const [motherName, setMotherName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [category, setCategory] = useState('General');
  const [aadharCard, setAadharCard] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('Indian');
  const [state, setState] = useState('Gujarat');
  const [rollNo, setRollNo] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [course, setCourse] = useState('DIPLOMA IN FIRE AND SAFETY MANAGEMENT');
  const [batch, setBatch] = useState('Batch 2026-2027');
  const [mode, setMode] = useState('REGULAR');
  const [centerName, setCenterName] = useState('CENTRAL FIRE AND SAFETY INSTITUTE');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile();
      setProfile(data);
      setName(data.name || '');
      const rawPhoto = data.photoUrl || user?.photo_url || '';
      setPhotoUrl(rawPhoto.includes('unsplash.com') ? '' : rawPhoto);
      setBirthDate(data.birthDate || '');
      setGender(data.gender || 'MALE');
      setMotherName(data.motherName || '');
      setFatherName(data.fatherName || '');
      setPresentAddress(data.presentAddress || '');
      setStudentPhone(data.studentPhone || '');
      setFatherPhone(data.fatherPhone || '');
      setMotherPhone(data.motherPhone || '');
      setCategory(data.category || 'General');
      setAadharCard(data.aadharCard || '');
      setEmail(data.email || '');
      setNationality(data.nationality || 'Indian');
      setState(data.state || 'Gujarat');
      setRollNo((data as any).rollNo || (data as any).roll_no || (user as any)?.roll_no || '');
      setEnrollmentNo(data.enrollmentNo || data.id || user?.student_id || user?.username || '');
      setCourse(data.course || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT');
      setBatch(data.batch || 'Batch 2026-2027');
      setMode(data.mode || 'REGULAR');
      setCenterName(data.centerName || data.centerLocation || 'CENTRAL FIRE AND SAFETY INSTITUTE');
    } catch (err: any) {
      toast.error(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  // Handle  // Photo File Upload (Client-side base64)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) {
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size must be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoUrl(result);
      toast.success('Photo preview updated. Click "Save Profile" to keep changes.');
    };
    reader.readAsDataURL(file);
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      return;
    }
    setPhoneError('');

    // Student Phone Number is STRICTLY MANDATORY
    if (!studentPhone.trim()) {
      setPhoneError('Student Phone Number is mandatory');
      toast.error('Student Phone Number is mandatory');
      return;
    }

    try {
      setSaving(true);
      const updated = await api.updateStudentProfile({
        name,
        photoUrl,
        birthDate,
        gender,
        motherName,
        fatherName,
        presentAddress,
        studentPhone: studentPhone.trim(),
        fatherPhone: fatherPhone.trim(),
        motherPhone: motherPhone.trim(),
        category,
        aadharCard: aadharCard.trim(),
        email: email.trim(),
        nationality,
        state,
        enrollmentNo,
        mode,
        centerName,
      });

      setProfile(updated);
      await refreshAuth();
      toast.success('Student profile saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  const hardcodedUserId = profile?.id || user?.student_id || user?.username || '262701';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      
      {/* Back to Dashboard Navigation Link */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          to={user ? homeFor(user) : '/student/dashboard'}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:white transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary via-[#2055be] to-[#12387d] rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with Preview Trigger */}
            <div className="relative group shrink-0">
              <UserAvatar
                photoUrl={photoUrl}
                name={name}
                size="xl"
                className="ring-4 ring-white/30"
              />

              {/* Quick Preview Button */}
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-white text-primary hover:bg-gray-100 shadow-md transition-transform active:scale-95 cursor-pointer"
                  title="Preview Photo"
                  aria-label="Preview Photo"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* User & Registry Status */}
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
                  Student Profile
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{profile?.verificationStatus || 'Verified'}</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90">
                  {profile?.batch || 'Batch 2026-2027'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
                {name || user?.full_name || 'Student Name'}
              </h1>

              <p className="text-xs sm:text-sm text-white/80 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span><strong>Student User ID:</strong> {hardcodedUserId}</span>
                {rollNo && (
                  <>
                    <span>•</span>
                    <span><strong>Roll No:</strong> {rollNo}</span>
                  </>
                )}
                <span>•</span>
                <span><strong>Program:</strong> {course || profile?.course || 'Fire Safety Program'}</span>
                <span>•</span>
                <span><strong>Mode:</strong> {mode}</span>
              </p>
            </div>
          </div>

          {/* Back to Dashboard Button inside Banner */}
          <div className="flex items-center justify-center lg:justify-end shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <Link
              to={user ? homeFor(user) : '/student/dashboard'}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-primary hover:bg-slate-50 shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 group cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Profile Photo & Visual Verification */}
        <section className="bg-white dark:bg-[#161d27] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary dark:text-primary-light" />
              <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                Profile Photo & Preview
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Official profile photo
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20 bg-gray-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  disabled={!photoUrl}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>Check & Preview Photo</span>
                </button>

                {!isLocked && (
                  <label className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light hover:bg-primary/20 transition-all flex items-center gap-1.5 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {!isLocked && (
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Or provide image URL:
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs rounded-lg border border-gray-300 dark:border-white/10 px-3 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <fieldset disabled={isLocked} className={isLocked ? "space-y-8 select-text" : "space-y-8"}>
        {/* Section 2: Student Identification & Program Details */}
        <section className="bg-white dark:bg-[#161d27] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-white/5">
            <Shield className="w-5 h-5 text-primary dark:text-primary-light" />
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
              Student Identification & Program Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Student Roll No */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Student Roll No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={rollNo || (profile as any)?.rollNo || (profile as any)?.roll_no || '—'}
                  readOnly
                  disabled
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-sm font-mono font-bold cursor-not-allowed pl-9 select-all"
                />
                <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Institute assigned student roll number.
              </p>
            </div>

            {/* Student User ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Student User ID (Login Username)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={hardcodedUserId}
                  readOnly
                  disabled
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-gray-100 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 text-sm font-mono font-bold cursor-not-allowed pl-9 select-all"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                Student login identifier.
              </p>
            </div>

            {/* Student Name / Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Student Name (Full Name) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none pl-9"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Course Name */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Course Name / Program
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={course}
                  readOnly
                  disabled
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 text-sm font-semibold cursor-not-allowed pl-9 select-all"
                />
                <GraduationCap className="w-4 h-4 text-primary absolute left-3 top-3" />
              </div>
            </div>

            {/* Training Mode */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Mode (Reg/Correspo)
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="REGULAR">REGULAR</option>
                <option value="CORRESPONDENCE">CORRESPONDENCE</option>
              </select>
            </div>

            {/* Center Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Training Center / Campus
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={centerName}
                  readOnly
                  disabled
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 text-sm font-semibold cursor-not-allowed pl-9 select-all"
                />
                <Building className="w-4 h-4 text-primary absolute left-3 top-3" />
              </div>
            </div>

            {/* Session / Year */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Session / Year
              </label>
              <input
                type="text"
                value={batch}
                readOnly
                disabled
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 text-sm font-semibold cursor-not-allowed select-all"
              />
            </div>

          </div>
        </section>

        {/* Section 3: Personal & Family Details */}
        <section className="bg-white dark:bg-[#161d27] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-white/5">
            <Calendar className="w-5 h-5 text-primary dark:text-primary-light" />
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
              Personal & Family Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Birth Date (DOB) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Birth Date (DOB)
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Father Name
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father's full name"
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Mother Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Mother Name
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Mother's full name"
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

          </div>
        </section>

        {/* Section 4: Present Address */}
        <section className="bg-white dark:bg-[#161d27] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-white/5">
            <Home className="w-5 h-5 text-primary dark:text-primary-light" />
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
              Residential Address
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Present Address
            </label>
            <textarea
              rows={3}
              value={presentAddress}
              onChange={(e) => setPresentAddress(e.target.value)}
              placeholder="Full present address with flat/door number, street name, city, and pincode"
              className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>
        </section>

        {/* Section 5: Contact Details (3 Numbers: Student [Mandatory], Father, Mother) */}
        <section className="bg-white dark:bg-[#161d27] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary dark:text-primary-light" />
              <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
                Contact Details (3 Numbers)
              </h2>
            </div>
            <span className="text-xs font-bold text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Student Phone is Mandatory</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            
            {/* 1. Student Phone Number (MANDATORY) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Student Phone No <span className="text-red-500 font-extrabold">* (Mandatory)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => {
                    setStudentPhone(e.target.value);
                    if (phoneError) setPhoneError('');
                  }}
                  required
                  placeholder="+91 98765 43210"
                  className={`w-full rounded-xl border p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm pl-9 outline-none ${
                    phoneError
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-gray-300 dark:border-white/10 focus:ring-2 focus:ring-primary'
                  }`}
                />
                <Phone className="w-4 h-4 text-primary absolute left-3 top-3" />
              </div>
              {phoneError ? (
                <p className="text-xs text-red-500 mt-1 font-semibold">{phoneError}</p>
              ) : (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                  Primary SMS & urgent muster notifications.
                </p>
              )}
            </div>

            {/* 2. Father's Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Father's Phone No
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={fatherPhone}
                  onChange={(e) => setFatherPhone(e.target.value)}
                  placeholder="+91 98765 11111"
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm pl-9 focus:ring-2 focus:ring-primary outline-none"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Emergency parent contact 1.</p>
            </div>

            {/* 3. Mother's Phone Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Mother's Phone No
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={motherPhone}
                  onChange={(e) => setMotherPhone(e.target.value)}
                  placeholder="+91 98765 22222"
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm pl-9 focus:ring-2 focus:ring-primary outline-none"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Emergency parent contact 2.</p>
            </div>

          </div>
        </section>

        {/* Section 6: Demographics & Government ID */}
        <section className="bg-white dark:bg-[#161d27] rounded-2xl p-6 border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-white/5">
            <CreditCard className="w-5 h-5 text-primary dark:text-primary-light" />
            <h2 className="text-base font-heading font-bold text-gray-900 dark:text-white">
              Demographics, Aadhaar & State Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Aadhaar Card */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Aadhaar Card No
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={aadharCard}
                  onChange={(e) => setAadharCard(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm pl-9 focus:ring-2 focus:ring-primary outline-none"
                />
                <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Email ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm pl-9 focus:ring-2 focus:ring-primary outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nationality
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Indian"
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm pl-9 focus:ring-2 focus:ring-primary outline-none"
                />
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 p-2.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm pl-9 focus:ring-2 focus:ring-primary outline-none"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

          </div>
        </section>
        </fieldset>

        {/* Action Button Bar */}
        {!isLocked && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={loadProfile}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Discard Changes</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-dark shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving Profile...' : 'Save Profile Details'}</span>
            </button>
          </div>
        )}

      </form>

      {/* Modal: Full Photo Preview */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161d27] rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white mb-4">
              Student Photo Preview
            </h3>

            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-4 p-4">
              <UserAvatar
                photoUrl={photoUrl}
                name={name}
                size="xl"
                className="!w-36 !h-36 sm:!w-44 sm:!h-44 text-5xl"
              />
            </div>

            <div className="text-center space-y-1">
              <p className="font-bold text-sm text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">User ID: {hardcodedUserId}</p>
            </div>

            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
