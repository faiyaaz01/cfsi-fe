import { AttendanceRecord } from '../types';

/**
 * Attendance Records Registry.
 * Attendance is recorded daily via the 3-Slot Daily Muster Roll by the Administrator,
 * synchronized in real-time with the MongoDB backend.
 */
export const initialAttendanceSeed: AttendanceRecord[] = [];
