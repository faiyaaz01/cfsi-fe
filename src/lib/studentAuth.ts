import { studentsData } from '../data/students';
import { StudentVerificationRecord } from '../types';
import { api, clearAuth, getStoredUser } from './api';

export const loginWithBackend = async (username: string, password: string, role?: string) => {
  try {
    const data = await api.login(username, password, role);
    const sid = data.user?.student_id;
    const uname = data.user?.username;
    let student = studentsData.find(
      (s) =>
        (sid && s.id.toUpperCase() === sid.toUpperCase()) ||
        s.id.toUpperCase() === uname?.toUpperCase() ||
        s.rollNo.toUpperCase() === uname?.toUpperCase() ||
        (s.id && s.id === username.trim()) ||
        s.rollNo === username.trim()
    );

    if (!student && data.user && (data.role === 'student' || data.role === 'leader')) {
      student = {
        id: data.user.student_id || data.user.username,
        rollNo: data.user.roll_no || '',
        enrollmentNo: data.user.enrollment_no || data.user.student_id || data.user.username,
        name: data.user.full_name || data.user.username,
        fatherName: '',
        course: data.user.course || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
        batch: data.user.batch || 'Batch 2026-2027',
        passingYear: '2027',
        grade: 'Active Student',
        percentage: 'N/A',
        verificationStatus: 'Verified',
        issueDate: 'Ongoing',
        centerLocation: data.user.center || 'CENTRAL FIRE AND SAFETY INSTITUTE',
        centerName: data.user.center || 'CENTRAL FIRE AND SAFETY INSTITUTE',
        mode: data.user.mode || 'REGULAR',
        gender: data.user.gender || 'MALE',
        photoUrl: data.user.photo_url,
      };
    }

    return { success: true, role: data.role, student, error: '' };
  } catch (err) {
    return {
      success: false,
      role: undefined,
      student: undefined,
      error: err instanceof Error ? err.message : 'Login failed',
    };
  }
};

export const getLoggedStudentId = () => {
  const user = getStoredUser();
  return user?.student_id || user?.username || null;
};

export const getLoggedStudent = (): StudentVerificationRecord | null => {
  const user = getStoredUser();
  if (!user) return null;
  const sid = user.student_id;
  const uname = user.username;
  const found = studentsData.find(
    (s) =>
      (sid && s.id.toUpperCase() === sid.toUpperCase()) ||
      s.id.toUpperCase() === uname?.toUpperCase() ||
      s.rollNo.toUpperCase() === uname?.toUpperCase()
  );
  if (found) return found;

  if (user.role === 'student' || user.role === 'leader') {
    return {
      id: user.student_id || user.username,
      rollNo: user.roll_no || '',
      enrollmentNo: user.enrollment_no || user.student_id || user.username,
      name: user.full_name || user.username,
      fatherName: '',
      course: user.course || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
      batch: user.batch || 'Batch 2026-2027',
      passingYear: '2027',
      grade: 'Active Student',
      percentage: 'N/A',
      verificationStatus: 'Verified',
      issueDate: 'Ongoing',
      centerLocation: user.center || 'CENTRAL FIRE AND SAFETY INSTITUTE',
      centerName: user.center || 'CENTRAL FIRE AND SAFETY INSTITUTE',
      mode: user.mode || 'REGULAR',
      gender: user.gender || 'MALE',
      photoUrl: user.photo_url,
    };
  }
  return null;
};

export const logoutStudent = () => {
  void api.logout().finally(clearAuth);
};
