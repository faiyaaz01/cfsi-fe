import { studentAccountsData } from '../data/student-accounts';
import { studentsData } from '../data/students';
import { StudentVerificationRecord } from '../types';

/**
 * =========================================================================
 * STUDENT AUTHENTICATION HELPER (Frontend Session / Demo Storage)
 * =========================================================================
 * Mirrors the admin authentication pattern in DashboardPage.tsx.
 * 
 * BACKEND INTEGRATION NOTE:
 * When wiring the backend, replace `loginStudent` with an async API call:
 * ```ts
 * const res = await fetch('/api/auth/student-login', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ username, password })
 * });
 * const { token, student } = await res.json();
 * sessionStorage.setItem('cfsi_student_token', token);
 * ```
 * =========================================================================
 */

const STUDENT_SESSION_KEY = 'cfsi_student_cert';

export interface LoginResult {
  success: boolean;
  error?: string;
  student?: StudentVerificationRecord;
}

export const loginStudent = (username: string, password: string): LoginResult => {
  const normalizedUser = username.trim().toLowerCase();
  const account = studentAccountsData.find(
    (acc) => acc.username.toLowerCase() === normalizedUser && acc.password === password
  );

  if (!account) {
    return {
      success: false,
      error: 'Invalid username or password. Please verify credentials or click a demo account below.'
    };
  }

  const student = studentsData.find(
    (s) => s.certificateNumber.toUpperCase() === account.certificateNumber.toUpperCase()
  );

  if (!student) {
    return {
      success: false,
      error: 'Student record could not be found for this account.'
    };
  }

  sessionStorage.setItem(STUDENT_SESSION_KEY, account.certificateNumber);
  return {
    success: true,
    student
  };
};

export const getLoggedStudentCert = (): string | null => {
  try {
    return sessionStorage.getItem(STUDENT_SESSION_KEY);
  } catch {
    return null;
  }
};

export const getLoggedStudent = (): StudentVerificationRecord | null => {
  const cert = getLoggedStudentCert();
  if (!cert) return null;
  return studentsData.find((s) => s.certificateNumber.toUpperCase() === cert.toUpperCase()) || null;
};

export const logoutStudent = (): void => {
  try {
    sessionStorage.removeItem(STUDENT_SESSION_KEY);
  } catch {
    // ignore
  }
};

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
