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
 * Institutional Cadet & Trainee Registry for Batch 2026-2027.
 * All legacy students have been removed and replaced with Batch 2026-2027 cadets.
 * Student Login IDs are formatted as 2627<rollno> (e.g. 262701 for Roll No 01).
 */
export const studentsData: StudentVerificationRecord[] = [
  {
    id: '262701',
    rollNo: '01',
    name: 'Aarav N. Sharma',
    fatherName: 'Naresh Sharma',
    course: 'Diploma In Fire Safety',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'Distinction (A+)',
    percentage: '89.5%',
    verificationStatus: 'Verified',
    issueDate: '15 June 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '262702',
    rollNo: '02',
    name: 'Diya K. Patel',
    fatherName: 'Kiritkumar Patel',
    course: 'Sub Fire Officer',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'First Class (A)',
    percentage: '84.0%',
    verificationStatus: 'Verified',
    issueDate: '28 July 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '262703',
    rollNo: '03',
    name: 'Rohan S. Mehta',
    fatherName: 'Suresh Mehta',
    course: 'Certificate In Fire Safety',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'Distinction (A+)',
    percentage: '92.0%',
    verificationStatus: 'Verified',
    issueDate: '10 January 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '262704',
    rollNo: '04',
    name: 'Ananya R. Desai',
    fatherName: 'Rajesh Desai',
    course: 'Industrial Safety',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'First Class (A)',
    percentage: '81.5%',
    verificationStatus: 'Verified',
    issueDate: '14 April 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '262705',
    rollNo: '05',
    name: 'Virendra M. Solanki',
    fatherName: 'Maheshbhai Solanki',
    course: 'Diploma In Fire Safety',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'Distinction (A+)',
    percentage: '87.2%',
    verificationStatus: 'Verified',
    issueDate: '20 June 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '262706',
    rollNo: '06',
    name: 'Sneha P. Joshi',
    fatherName: 'Pradeep Joshi',
    course: 'Sub Fire Officer',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'First Class (A)',
    percentage: '83.8%',
    verificationStatus: 'Verified',
    issueDate: '18 July 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '262707',
    rollNo: '07',
    name: 'Karan B. Rathod',
    fatherName: 'Bhaveshbhai Rathod',
    course: 'Certificate In Fire Safety',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'First Class (B+)',
    percentage: '78.5%',
    verificationStatus: 'Verified',
    issueDate: '30 July 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '262708',
    rollNo: '08',
    name: 'Pooja N. Dave',
    fatherName: 'Nileshbhai Dave',
    course: 'Industrial Safety',
    batch: 'Batch 2026-2027',
    passingYear: '2027',
    grade: 'Distinction (A+)',
    percentage: '90.4%',
    verificationStatus: 'Verified',
    issueDate: '25 June 2027',
    centerLocation: 'CFSI Vadodara Main Campus, Gujarat',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
];
