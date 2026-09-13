import { studentsData } from '../data/students';
import { StudentVerificationRecord } from '../types';
import { api, clearAuth, getStoredUser } from './api';
export const loginWithBackend = async (username: string, password: string, role?: string) => {
  try {
    const data = await api.login(username, password, role);
    return {success: true, role: data.role, student: studentsData.find(s => s.certificateNumber === data.user.certificate_number), error: ''};
  } catch (err) { return {success: false, role: undefined, student: undefined, error: err instanceof Error ? err.message : 'Login failed'}; }
};
export const getLoggedStudentCert = () => getStoredUser()?.certificate_number || null;
export const getLoggedStudent = (): StudentVerificationRecord | null => studentsData.find(s => s.certificateNumber === getLoggedStudentCert()) || null;
export const logoutStudent = () => { void api.logout().finally(clearAuth); };

export const calculateGrade = (marks: number, max: number = 100): string => {
  if (max <= 0) return 'N/A';
  const percentage = (marks / max) * 100;
  if (percentage >= 85) return 'A+';
  if (percentage >= 75) return 'A';
  if (percentage >= 65) return 'B+';
  if (percentage >= 55) return 'B';
  if (percentage >= 45) return 'C';
  return 'F';
};
