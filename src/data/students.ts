import { StudentVerificationRecord } from '../types';

/**
 * Computes Student ID based on Batch (e.g. 2026-2027 or 20262027 -> 2627) and Roll Number.
 * Format: 2627<rollno> (e.g. Roll No "01" -> "262701")
 */
export function generateStudentId(batch: string, rollNo: string | number): string {
  const digits = batch.replace(/\D/g, '');
  let prefix = '2627';
  if (digits.length >= 8) {
    prefix = `${digits.slice(2, 4)}${digits.slice(6, 8)}`;
  } else if (digits.length === 4) {
    prefix = digits;
  }
  const cleanRoll = String(rollNo).trim();
  return `${prefix}${cleanRoll}`;
}

/**
 * Institutional Student Registry.
 * Demo student data has been completely cleared.
 * Registered students are loaded dynamically from MongoDB or added via CSV/Excel Bulk Import.
 */
export const studentsData: StudentVerificationRecord[] = [];
