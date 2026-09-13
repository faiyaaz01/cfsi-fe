import { ResultRecord } from '../types';

/**
 * =========================================================================
 * INITIAL RESULTS SEED DATA
 * =========================================================================
 * Semester & Module exam scores with subject marks, maximum marks, and grades.
 * Loaded into localStorage on first run; afterwards localStorage is the source
 * of truth (and can be replaced with GET/POST /api/results when backend is linked).
 * =========================================================================
 */

export const initialResultsSeed: ResultRecord[] = [
  // --- Rahul V. Patel (CFSI-2023-0101) - Diploma In Fire Safety ---
  {
    id: 'res-101',
    certificateNumber: 'CFSI-2023-0101',
    course: 'Diploma In Fire Safety',
    subject: 'Fire Prevention, Detection & Alarm Systems',
    marksObtained: 89,
    maxMarks: 100,
    grade: 'A+',
    examDate: '2023-05-10',
    semesterOrTerm: 'Term Final Examination',
    remarks: 'Outstanding performance in detector placement circuitry',
    createdAt: '2023-05-15T12:00:00.000Z'
  },
  {
    id: 'res-102',
    certificateNumber: 'CFSI-2023-0101',
    course: 'Diploma In Fire Safety',
    subject: 'Fire Fighting Hydraulics & Heavy Pump Calculations',
    marksObtained: 84,
    maxMarks: 100,
    grade: 'A',
    examDate: '2023-05-12',
    semesterOrTerm: 'Term Final Examination',
    remarks: 'Clear understanding of friction loss and relay pumping',
    createdAt: '2023-05-15T12:00:00.000Z'
  },
  {
    id: 'res-103',
    certificateNumber: 'CFSI-2023-0101',
    course: 'Diploma In Fire Safety',
    subject: 'Specialized Rescue Operations & Breathing Apparatus (BA)',
    marksObtained: 92,
    maxMarks: 100,
    grade: 'A+',
    examDate: '2023-05-15',
    semesterOrTerm: 'Term Final Examination',
    remarks: 'Top score in simulated smoke labyrinth drill',
    createdAt: '2023-05-15T12:00:00.000Z'
  },
  {
    id: 'res-104',
    certificateNumber: 'CFSI-2023-0101',
    course: 'Diploma In Fire Safety',
    subject: 'Industrial Hazards, Chemical Safety & HAZMAT Response',
    marksObtained: 89,
    maxMarks: 100,
    grade: 'A+',
    examDate: '2023-05-18',
    semesterOrTerm: 'Term Final Examination',
    remarks: 'Thorough knowledge of UN chemical codes and MSDS protocols',
    createdAt: '2023-05-15T12:00:00.000Z'
  },

  // --- Amitabh S. Sharma (CFSI-2023-0102) - Sub Fire Officer ---
  {
    id: 'res-201',
    certificateNumber: 'CFSI-2023-0102',
    course: 'Sub Fire Officer',
    subject: 'Incident Command Leadership & Emergency Strategy',
    marksObtained: 85,
    maxMarks: 100,
    grade: 'A',
    examDate: '2023-06-20',
    semesterOrTerm: 'Officer Certification Board',
    remarks: 'Excellent tactical decision making under pressure',
    createdAt: '2023-06-25T14:00:00.000Z'
  },
  {
    id: 'res-202',
    certificateNumber: 'CFSI-2023-0102',
    course: 'Sub Fire Officer',
    subject: 'Fire Station Operations & Fleet Maintenance',
    marksObtained: 81,
    maxMarks: 100,
    grade: 'A',
    examDate: '2023-06-22',
    semesterOrTerm: 'Officer Certification Board',
    remarks: 'Demonstrated proficiency in pump testing and log audits',
    createdAt: '2023-06-25T14:00:00.000Z'
  },
  {
    id: 'res-203',
    certificateNumber: 'CFSI-2023-0102',
    course: 'Sub Fire Officer',
    subject: 'Building By-Laws, National Building Code (NBC) & Fire NOC',
    marksObtained: 80,
    maxMarks: 100,
    grade: 'A',
    examDate: '2023-06-24',
    semesterOrTerm: 'Officer Certification Board',
    remarks: 'Competent architectural drawing review and egress calculation',
    createdAt: '2023-06-25T14:00:00.000Z'
  },

  // --- Priyanka D. Parmar (CFSI-2023-0103) - Certificate In Fire Safety ---
  {
    id: 'res-301',
    certificateNumber: 'CFSI-2023-0103',
    course: 'Certificate In Fire Safety',
    subject: 'Fundamentals of Combustion & Fire Chemistry',
    marksObtained: 94,
    maxMarks: 100,
    grade: 'A+',
    examDate: '2023-12-10',
    semesterOrTerm: 'Semester Assessment',
    remarks: 'Flawless distinction in fire tetrahedron theories',
    createdAt: '2023-12-15T10:00:00.000Z'
  },
  {
    id: 'res-302',
    certificateNumber: 'CFSI-2023-0103',
    course: 'Certificate In Fire Safety',
    subject: 'First Aid, Paramedic Response & Burn Trauma Care',
    marksObtained: 91,
    maxMarks: 100,
    grade: 'A+',
    examDate: '2023-12-12',
    semesterOrTerm: 'Semester Assessment',
    remarks: 'Certified CPR and triage bandaging proficiency',
    createdAt: '2023-12-15T10:00:00.000Z'
  },
  {
    id: 'res-303',
    certificateNumber: 'CFSI-2023-0103',
    course: 'Certificate In Fire Safety',
    subject: 'Hose Drills, Branch Handling & Hydrant Hydraulics',
    marksObtained: 88,
    maxMarks: 100,
    grade: 'A+',
    examDate: '2023-12-15',
    semesterOrTerm: 'Semester Assessment',
    remarks: 'Swift hose running and nozzlemanship demonstrated',
    createdAt: '2023-12-15T10:00:00.000Z'
  },

  // --- Hardik K. Solanki (CFSI-2024-0201) - Industrial Safety ---
  {
    id: 'res-401',
    certificateNumber: 'CFSI-2024-0201',
    course: 'Industrial Safety',
    subject: 'Factories Act 1948 & OSHA Compliance Norms',
    marksObtained: 78,
    maxMarks: 100,
    grade: 'B+',
    examDate: '2024-03-20',
    semesterOrTerm: 'Module Evaluation',
    remarks: 'Good grasp of statutory factory safety clauses',
    createdAt: '2024-03-25T11:00:00.000Z'
  },
  {
    id: 'res-402',
    certificateNumber: 'CFSI-2024-0201',
    course: 'Industrial Safety',
    subject: 'Hazard Identification, Risk Assessment & JSA/HAZOP',
    marksObtained: 81,
    maxMarks: 100,
    grade: 'A',
    examDate: '2024-03-22',
    semesterOrTerm: 'Module Evaluation',
    remarks: 'Solid risk matrix preparation and mitigation hierarchy',
    createdAt: '2024-03-25T11:00:00.000Z'
  }
];
