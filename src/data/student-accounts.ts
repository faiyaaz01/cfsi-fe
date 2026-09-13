import { StudentAccount } from '../types';

/**
 * =========================================================================
 * DEMO STUDENT ACCOUNTS (Frontend Mock / Client-Side Demonstration)
 * =========================================================================
 * NOTE: These accounts use mock plaintext credentials for frontend demonstration
 * only, mirroring the existing admin dashboard security design.
 * 
 * BACKEND INTEGRATION NOTE:
 * When connecting a real server (Node.js/Express, Django, Laravel, Go, etc.),
 * this file will be replaced by a secure authentication API:
 * POST /api/auth/student-login -> returns JWT / Session Cookie.
 * =========================================================================
 */

export const studentAccountsData: StudentAccount[] = [
  {
    // Rahul V. Patel — Diploma In Fire Safety (Roll: CFSI/DFS/23/042)
    certificateNumber: 'CFSI-2023-0101',
    username: 'rahul',
    password: 'password123',
  },
  {
    // Amitabh S. Sharma — Sub Fire Officer (Roll: CFSI/SFO/23/018)
    certificateNumber: 'CFSI-2023-0102',
    username: 'amitabh',
    password: 'password123',
  },
  {
    // Priyanka D. Parmar — Certificate In Fire Safety (Roll: CFSI/CFS/23/089)
    certificateNumber: 'CFSI-2023-0103',
    username: 'priyanka',
    password: 'password123',
  },
  {
    // Hardik K. Solanki — Industrial Safety (Roll: CFSI/IS/24/005)
    certificateNumber: 'CFSI-2024-0201',
    username: 'hardik',
    password: 'password123',
  },
  {
    // Manish R. Yadav — Diploma In Fire Safety (Roll: CFSI/DFS/23/094)
    certificateNumber: 'CFSI-2024-0202',
    username: 'manish',
    password: 'password123',
  }
];
