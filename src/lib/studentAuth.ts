import { studentAccountsData } from '../data/student-accounts';
import { studentsData } from '../data/students';
import { StudentVerificationRecord } from '../types';
import { api, setToken, clearAuth, getStoredUser } from './api';

const STUDENT_SESSION_KEY = 'cfsi_student_cert';

export interface LoginResult {
  success: boolean;
  error?: string;
  student?: StudentVerificationRecord;
  role?: 'admin' | 'student';
}

/**
 * Unified async login that authenticates against FastAPI + MongoDB with bcrypt & JWT,
 * with fallback to local seed accounts for maximum reliability.
 */
export const loginWithBackend = async (
  username: string,
  password: string,
  role?: 'admin' | 'student' | 'auto'
): Promise<LoginResult> => {
  try {
    const authData = await api.login(username, password, role);
    if (authData.role === 'admin') {
      sessionStorage.setItem('cfsi_admin_logged', 'true');
      return {
        success: true,
        role: 'admin',
      };
    } else {
      const cert = authData.user.certificate_number;
      if (cert) {
        sessionStorage.setItem(STUDENT_SESSION_KEY, cert);
      }
      const matched = studentsData.find(
        (s) => s.certificateNumber.toUpperCase() === (cert || '').toUpperCase()
      );
      return {
        success: true,
        role: 'student',
        student: matched,
      };
    }
  } catch (err: any) {
    // If backend is unreachable or returned error, try client-side demo fallback
    const normalizedUser = username.trim().toLowerCase();
    
    // Check demo admin
    if ((normalizedUser === 'admin' || !normalizedUser) && password === 'cfsiadmin') {
      sessionStorage.setItem('cfsi_admin_logged', 'true');
      return {
        success: true,
        role: 'admin',
      };
    }

    // Check demo student
    const account = studentAccountsData.find(
      (acc) => acc.username.toLowerCase() === normalizedUser && acc.password === password
    );

    if (account) {
      const student = studentsData.find(
        (s) => s.certificateNumber.toUpperCase() === account.certificateNumber.toUpperCase()
      );
      if (student) {
        sessionStorage.setItem(STUDENT_SESSION_KEY, account.certificateNumber);
        return {
          success: true,
          role: 'student',
          student,
        };
      }
    }

    return {
      success: false,
      error: err.message || 'Invalid username or password.',
    };
  }
};

/** Synchronous local login helper */
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
    student,
    role: 'student',
  };
};

export const getLoggedStudentCert = (): string | null => {
  try {
    const cert = sessionStorage.getItem(STUDENT_SESSION_KEY);
    if (cert) return cert;
    const stored = getStoredUser();
    return stored?.certificate_number || null;
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
    clearAuth();
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
