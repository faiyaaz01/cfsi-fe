import { studentsData } from '../data/students';
import { StudentVerificationRecord } from '../types';
import { api, clearAuth, getStoredUser } from './api';

export const loginWithBackend = async (username: string, password: string, role?: string) => {
  try {
    const data = await api.login(username, password, role);
    const sid = data.user?.student_id;
    const uname = data.user?.username;
    const student = studentsData.find(
      (s) =>
        (sid && s.id.toUpperCase() === sid.toUpperCase()) ||
        s.id.toUpperCase() === uname?.toUpperCase() ||
        s.rollNo.toUpperCase() === uname?.toUpperCase() ||
        (s.id && s.id === username.trim()) ||
        s.rollNo === username.trim()
    );
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
  return (
    studentsData.find(
      (s) =>
        (sid && s.id.toUpperCase() === sid.toUpperCase()) ||
        s.id.toUpperCase() === uname?.toUpperCase() ||
        s.rollNo.toUpperCase() === uname?.toUpperCase()
    ) || null
  );
};

export const logoutStudent = () => {
  void api.logout().finally(clearAuth);
};
