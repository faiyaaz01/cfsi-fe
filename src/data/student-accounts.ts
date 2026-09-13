import { StudentAccount } from '../types';

/**
 * Student accounts registry.
 * Production accounts are securely provisioned by the Administrator via the backend API
 * and stored in MongoDB with Bcrypt hashed passwords.
 */
export const studentAccountsData: StudentAccount[] = [];
