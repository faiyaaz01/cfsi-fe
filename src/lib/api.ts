import { AttendanceRecord, StudentProfile, StudentVerificationRecord, Course, TrainingPost, GalleryImage, VideoItem, NewsPost } from '../types';

/**
 * Central Fire Safety Institute (CFSI) Universal API Client
 * Connects Frontend to FastAPI + MongoDB Backend with JWT Authentication.
 */

const rawApiEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
export const API_BASE_URL = rawApiEnv
  ? (rawApiEnv.endsWith('/api') ? rawApiEnv.replace(/\/$/, '') : `${rawApiEnv.replace(/\/$/, '')}/api`)
  : '/api';

export const APP_ENV = (import.meta.env.VITE_APP_ENV as string | undefined)?.trim() || (import.meta.env.DEV ? 'development' : 'production');

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(`[CFSI Client] Mode: ${import.meta.env.MODE} | Environment: ${APP_ENV} | Base URL: ${API_BASE_URL}`);
}

const TOKEN_STORAGE_KEY = 'cfsi_jwt_token';
const USER_STORAGE_KEY = 'cfsi_auth_user';

export function normalizeAttendance(record: any): AttendanceRecord {
  return {
    id: String(record.id || record._id || `att-${Date.now()}`),
    studentId: String(record.studentId || record.student_id || record.id || record.rollNo || ''),
    rollNo: record.rollNo || record.roll_no || undefined,
    date: record.date || '',
    slot: record.slot,
    course: record.course || 'Fire Safety Program',
    status: record.status || 'Present',
    topicOrModule: record.topicOrModule || record.topic_or_module || undefined,
    remarks: record.remarks || undefined,
    markedBy: record.markedBy || record.marked_by || undefined,
    createdAt: record.createdAt || record.created_at || undefined,
    uploadedAt: record.uploadedAt || record.uploaded_at || undefined,
    isLocked: Boolean(record.isLocked ?? record.is_locked),
    canEditUntil: record.canEditUntil || record.can_edit_until || undefined,
    slotTiming: record.slotTiming,
  };
}

export function getAttendanceStreamUrl(): string {
  return `${API_BASE_URL}/attendance/stream`;
}

export type UserRole = 'admin' | 'teacher' | 'student' | 'leader';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  student_id?: string | null;
  enrollment_no?: string | null;
  roll_no?: string | null;
  full_name?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  photo_url?: string | null;
  course?: string | null;
  batch?: string | null;
  center?: string | null;
  mode?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active: boolean;
  assigned_modules?: string[];
  assigned_slots?: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user: AuthUser;
}

/** Get stored JWT Bearer token */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

/** Store JWT Bearer token */
export const setToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore
  }
};

/** Get stored authenticated user */
export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/** Clear stored session */
export const clearAuth = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem('cfsi_student_cert');
    sessionStorage.removeItem('cfsi_admin_logged');
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('auth-cleared'));
};

/** Core authenticated fetch helper */
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (response.status === 401) clearAuth();
  return response;
}

export const api = {
  async logout() { await fetchWithAuth('/auth/logout', {method: 'POST'}); },
  async users(method = 'GET', id = '', body?: unknown): Promise<any> {
    const response = await fetchWithAuth(`/users${id ? '/' + encodeURIComponent(id) : ''}`, {method, ...(body ? {body: JSON.stringify(body)} : {})});
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(typeof error.detail === 'string' ? error.detail : 'Please check the user fields and try again.');
    }
    return response.status === 204 ? null : response.json();
  },
  /** Login with username and password against MongoDB hashed credentials */
  async login(username: string, password: string, role?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: role || 'auto' }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid username or password');
    }

    const data: AuthResponse = await response.json();
    if (role && role !== 'auto') {
      const target = role.toLowerCase();
      if (target === 'student' && !['student', 'leader'].includes(data.role)) {
        clearAuth();
        throw new Error('Access restricted: Administration and Faculty accounts must log in via the Institute Login portal.');
      }
      if ((target === 'institute' || target === 'admin') && !['admin', 'teacher'].includes(data.role)) {
        clearAuth();
        throw new Error('Access restricted: Student and Cadet Leader accounts must log in via the Student Login portal.');
      }
    }

    setToken(data.access_token);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    } catch {}

    return data;
  },

  /** Get current authenticated user profile */
  async getMe(): Promise<AuthUser> {
    const response = await fetchWithAuth('/auth/me');
    if (!response.ok) {
      throw new Error('Unauthorized');
    }
    return response.json();
  },

  /** Fetch attendance records */
  async getAttendance(params?: { date?: string; slot?: string; studentId?: string; course?: string }): Promise<AttendanceRecord[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.slot) query.set('slot', params.slot);
    if (params?.studentId) query.set('student_id', params.studentId);
    if (params?.course) query.set('course', params.course);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await fetchWithAuth(`/attendance${queryString}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance');
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeAttendance) : [];
  },

  /** Bulk save 3-slot muster records */
  async saveAttendanceBulk(records: any[]): Promise<AttendanceRecord[]> {
    const response = await fetchWithAuth('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
    if (!response.ok) {
      throw new Error('Failed to bulk save attendance muster');
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalizeAttendance) : [];
  },

  /** Single attendance upsert */
  async saveAttendanceSingle(record: any): Promise<AttendanceRecord> {
    const response = await fetchWithAuth('/attendance', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to save attendance record');
    }
    const data = await response.json();
    return normalizeAttendance(data);
  },

  /** Update attendance record */
  async updateAttendance(recordId: string, updates: any): Promise<AttendanceRecord> {
    const response = await fetchWithAuth(`/attendance/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update attendance record');
    }
    const data = await response.json();
    return normalizeAttendance(data);
  },

  /** Delete attendance record by ID */
  async deleteAttendance(recordId: string): Promise<void> {
    const response = await fetchWithAuth(`/attendance/${recordId}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to delete attendance record');
    }
  },

  /** Clear day attendance muster in MongoDB */
  async clearDayAttendance(date: string, course?: string): Promise<{ deleted: number; date: string }> {
    const query = course ? `?course=${encodeURIComponent(course)}` : '';
    const response = await fetchWithAuth(`/attendance/day/${date}${query}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to clear day attendance muster');
    }
    return response.json();
  },

  /** Clear all attendance muster records in MongoDB */
  async clearAllAttendance(course?: string): Promise<{ deleted: number }> {
    const query = course ? `?course=${encodeURIComponent(course)}` : '';
    const response = await fetchWithAuth(`/attendance${query}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to clear all attendance records');
    }
    return response.json();
  },

  /** Check backend health and database mode */
  async checkHealth(): Promise<{ status: string; database: string; is_mock: boolean }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  /** Get attendance SSE stream URL */
  getAttendanceStreamUrl(): string {
    return getAttendanceStreamUrl();
  },

  /** Get authenticated student profile */
  async getStudentProfile(): Promise<StudentProfile> {
    const response = await fetchWithAuth('/students/profile/me');
    if (!response.ok) {
      throw new Error('Failed to load profile');
    }
    const doc = await response.json();
    return {
      id: String(doc.id || doc._id || ''),
      rollNo: doc.rollNo || doc.roll_no,
      enrollmentNo: doc.enrollmentNo || doc.enrollment_no || doc.id || doc._id,
      name: doc.name || doc.full_name || '',
      photoUrl: doc.photoUrl || doc.photo_url,
      birthDate: doc.birthDate || doc.birth_date,
      gender: doc.gender || 'MALE',
      motherName: doc.motherName || doc.mother_name,
      fatherName: doc.fatherName || doc.father_name,
      presentAddress: doc.presentAddress || doc.present_address,
      studentPhone: doc.studentPhone || doc.student_phone || '',
      fatherPhone: doc.fatherPhone || doc.father_phone,
      motherPhone: doc.motherPhone || doc.mother_phone,
      category: doc.category,
      aadharCard: doc.aadharCard || doc.aadhar_card,
      email: doc.email,
      nationality: doc.nationality || 'Indian',
      state: doc.state || 'Gujarat',
      course: doc.course,
      batch: doc.batch,
      mode: doc.mode || 'REGULAR',
      passingYear: doc.passingYear || doc.passing_year,
      grade: doc.grade,
      percentage: doc.percentage,
      verificationStatus: doc.verificationStatus || doc.verification_status,
      issueDate: doc.issueDate || doc.issue_date,
      centerLocation: doc.centerLocation || doc.center_location || doc.centerName || doc.center_name,
      centerName: doc.centerName || doc.center_name || doc.centerLocation || doc.center_location,
    };
  },

  /** Update student profile in MongoDB */
  async updateStudentProfile(profile: Partial<StudentProfile>): Promise<StudentProfile> {
    const body: any = {
      name: profile.name,
      photoUrl: profile.photoUrl,
      birthDate: profile.birthDate,
      gender: profile.gender,
      motherName: profile.motherName,
      fatherName: profile.fatherName,
      presentAddress: profile.presentAddress,
      studentPhone: profile.studentPhone,
      fatherPhone: profile.fatherPhone,
      motherPhone: profile.motherPhone,
      category: profile.category,
      aadharCard: profile.aadharCard,
      email: profile.email,
      nationality: profile.nationality,
      state: profile.state,
      mode: profile.mode,
      enrollmentNo: profile.enrollmentNo,
      centerName: profile.centerName,
      centerLocation: profile.centerLocation,
    };
    const response = await fetchWithAuth('/students/profile/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update profile');
    }
    const doc = await response.json();
    return {
      id: String(doc.id || doc._id || ''),
      rollNo: doc.rollNo || doc.roll_no,
      enrollmentNo: doc.enrollmentNo || doc.enrollment_no || doc.id || doc._id,
      name: doc.name || doc.full_name || '',
      photoUrl: doc.photoUrl || doc.photo_url,
      birthDate: doc.birthDate || doc.birth_date,
      gender: doc.gender || 'MALE',
      motherName: doc.motherName || doc.mother_name,
      fatherName: doc.fatherName || doc.father_name,
      presentAddress: doc.presentAddress || doc.present_address,
      studentPhone: doc.studentPhone || doc.student_phone || '',
      fatherPhone: doc.fatherPhone || doc.father_phone,
      motherPhone: doc.motherPhone || doc.mother_phone,
      category: doc.category,
      aadharCard: doc.aadharCard || doc.aadhar_card,
      email: doc.email,
      nationality: doc.nationality || 'Indian',
      state: doc.state || 'Gujarat',
      course: doc.course,
      batch: doc.batch,
      mode: doc.mode || 'REGULAR',
      passingYear: doc.passingYear || doc.passing_year,
      grade: doc.grade,
      percentage: doc.percentage,
      verificationStatus: doc.verificationStatus || doc.verification_status,
      issueDate: doc.issueDate || doc.issue_date,
      centerLocation: doc.centerLocation || doc.center_location || doc.centerName || doc.center_name,
    };
  },

  /** Admin update any student profile in MongoDB */
  async adminUpdateStudent(studentId: string, profile: Partial<StudentProfile>): Promise<StudentProfile> {
    const body: any = {
      name: profile.name,
      photoUrl: profile.photoUrl,
      birthDate: profile.birthDate,
      gender: profile.gender,
      motherName: profile.motherName,
      fatherName: profile.fatherName,
      presentAddress: profile.presentAddress,
      studentPhone: profile.studentPhone,
      fatherPhone: profile.fatherPhone,
      motherPhone: profile.motherPhone,
      category: profile.category,
      aadharCard: profile.aadharCard,
      email: profile.email,
      nationality: profile.nationality,
      state: profile.state,
      mode: profile.mode,
      enrollmentNo: profile.enrollmentNo,
      centerName: profile.centerName,
      centerLocation: profile.centerLocation,
    };
    const response = await fetchWithAuth(`/students/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update student profile');
    }
    const doc = await response.json();
    return {
      id: String(doc.id || doc._id || ''),
      rollNo: doc.rollNo || doc.roll_no,
      enrollmentNo: doc.enrollmentNo || doc.enrollment_no || doc.id || doc._id,
      name: doc.name || doc.full_name || '',
      photoUrl: doc.photoUrl || doc.photo_url,
      birthDate: doc.birthDate || doc.birth_date,
      gender: doc.gender || 'MALE',
      motherName: doc.motherName || doc.mother_name,
      fatherName: doc.fatherName || doc.father_name,
      presentAddress: doc.presentAddress || doc.present_address,
      studentPhone: doc.studentPhone || doc.student_phone || '',
      fatherPhone: doc.fatherPhone || doc.father_phone,
      motherPhone: doc.motherPhone || doc.mother_phone,
      category: doc.category,
      aadharCard: doc.aadharCard || doc.aadhar_card,
      email: doc.email,
      nationality: doc.nationality || 'Indian',
      state: doc.state || 'Gujarat',
      course: doc.course,
      batch: doc.batch,
      mode: doc.mode || 'REGULAR',
      passingYear: doc.passingYear || doc.passing_year,
      grade: doc.grade,
      percentage: doc.percentage,
      verificationStatus: doc.verificationStatus || doc.verification_status,
      issueDate: doc.issueDate || doc.issue_date,
      centerLocation: doc.centerLocation || doc.center_location || doc.centerName || doc.center_name,
      centerName: doc.centerName || doc.center_name || doc.centerLocation || doc.center_location,
    };
  },

  /** Bulk import students from parsed CSV/Excel data & auto-generate user accounts */
  async bulkImportStudents(students: any[], defaultBatch?: string): Promise<{
    success: boolean;
    message: string;
    total_processed: number;
    created_count: number;
    updated_count: number;
    students: Array<{
      student_id: string;
      roll_no: string;
      name: string;
      birth_date: string;
      generated_password: string;
      status: string;
    }>;
  }> {
    const response = await fetchWithAuth('/students/bulk-import', {
      method: 'POST',
      body: JSON.stringify({ students, default_batch: defaultBatch || 'Batch 2026-2027' }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to bulk import students');
    }
    return response.json();
  },

  /** Get enrolled students list from MongoDB */
  async getStudents(course?: string): Promise<StudentVerificationRecord[]> {
    const query = course && course !== 'All' ? `?course=${encodeURIComponent(course)}` : '';
    const response = await fetchWithAuth(`/students${query}`);
    if (!response.ok) {
      throw new Error('Failed to fetch students from database');
    }
    const data = await response.json();
    return (data || []).map((doc: any): StudentVerificationRecord => ({
      id: String(doc.id || doc._id || ''),
      rollNo: String(doc.rollNo || doc.roll_no || ''),
      enrollmentNo: doc.enrollmentNo || doc.enrollment_no || doc.id || doc._id,
      sessionYear: doc.sessionYear || doc.session_year || undefined,
      name: doc.name || doc.full_name || '',
      fatherName: doc.fatherName || doc.father_name || '',
      course: doc.course || 'DIPLOMA IN FIRE AND SAFETY MANAGEMENT',
      batch: doc.batch || 'Batch 2026-2027',
      passingYear: String(doc.passingYear || doc.passing_year || '2026'),
      grade: doc.grade || 'A',
      percentage: String(doc.percentage || '85%'),
      verificationStatus: (doc.verificationStatus || doc.verification_status || 'Verified') as any,
      issueDate: doc.issueDate || doc.issue_date || '2026-06-30',
      centerLocation: doc.centerLocation || doc.center_location || doc.centerName || doc.center_name || 'CENTRAL FIRE AND SAFETY INSTITUTE',
      centerName: doc.centerName || doc.center_name || doc.centerLocation || doc.center_location || 'CENTRAL FIRE AND SAFETY INSTITUTE',
      mode: doc.mode || 'REGULAR',
      gender: doc.gender || 'MALE',
      photoUrl: doc.photoUrl || doc.photo_url || undefined,
      motherName: doc.motherName || doc.mother_name || undefined,
      birthDate: doc.birthDate || doc.birth_date || undefined,
      presentAddress: doc.presentAddress || doc.present_address || undefined,
      studentPhone: doc.studentPhone || doc.student_phone || undefined,
      fatherPhone: doc.fatherPhone || doc.father_phone || undefined,
      motherPhone: doc.motherPhone || doc.mother_phone || undefined,
      category: doc.category || undefined,
      aadharCard: doc.aadharCard || doc.aadhar_card || undefined,
      email: doc.email || undefined,
      nationality: doc.nationality || 'INDIAN',
      state: doc.state || 'GUJARAT',
    }));
  },

  /** Delete a student record and linked user account from MongoDB */
  async deleteStudent(studentId: string): Promise<void> {
    const response = await fetchWithAuth(`/students/${encodeURIComponent(studentId)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete student from database');
    }
  },

  /** Delete a user account and associated student/attendance data from MongoDB */
  async deleteUser(userId: string): Promise<void> {
    const response = await fetchWithAuth(`/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete user from database');
    }
  },

  // ==========================================
  // REAL-TIME WEB & CONTENT MANAGEMENT (MongoDB)
  // ==========================================
  async getCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/web/courses`);
    if (!response.ok) throw new Error('Failed to fetch courses from database');
    return response.json();
  },

  async createCourse(course: any): Promise<Course> {
    const response = await fetchWithAuth('/web/courses', {
      method: 'POST',
      body: JSON.stringify(course),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create course');
    }
    return response.json();
  },

  async updateCourse(id: string, updates: any): Promise<Course> {
    const response = await fetchWithAuth(`/web/courses/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update course');
    }
    return response.json();
  },

  async deleteCourse(id: string): Promise<void> {
    const response = await fetchWithAuth(`/web/courses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete course');
    }
  },

  async clearAllCourses(): Promise<void> {
    const response = await fetchWithAuth('/web/courses', { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear courses');
  },

  async getDrills(): Promise<TrainingPost[]> {
    const response = await fetch(`${API_BASE_URL}/web/drills`);
    if (!response.ok) throw new Error('Failed to fetch training drills from database');
    return response.json();
  },

  async createDrill(drill: any): Promise<TrainingPost> {
    const response = await fetchWithAuth('/web/drills', {
      method: 'POST',
      body: JSON.stringify(drill),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create drill');
    }
    return response.json();
  },

  async updateDrill(id: string, updates: any): Promise<TrainingPost> {
    const response = await fetchWithAuth(`/web/drills/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update drill');
    }
    return response.json();
  },

  async deleteDrill(id: string): Promise<void> {
    const response = await fetchWithAuth(`/web/drills/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete drill');
    }
  },

  async clearAllDrills(): Promise<void> {
    const response = await fetchWithAuth('/web/drills', { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear drills');
  },

  async getPhotos(): Promise<GalleryImage[]> {
    const response = await fetch(`${API_BASE_URL}/web/photos`);
    if (!response.ok) throw new Error('Failed to fetch photos from database');
    return response.json();
  },

  async createPhoto(photo: any): Promise<GalleryImage> {
    const response = await fetchWithAuth('/web/photos', {
      method: 'POST',
      body: JSON.stringify(photo),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add photo');
    }
    return response.json();
  },

  async updatePhoto(id: string, updates: any): Promise<GalleryImage> {
    const response = await fetchWithAuth(`/web/photos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update photo');
    }
    return response.json();
  },

  async deletePhoto(id: string): Promise<void> {
    const response = await fetchWithAuth(`/web/photos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete photo');
    }
  },

  async clearAllPhotos(): Promise<void> {
    const response = await fetchWithAuth('/web/photos', { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear photos');
  },

  async getVideos(): Promise<VideoItem[]> {
    const response = await fetch(`${API_BASE_URL}/web/videos`);
    if (!response.ok) throw new Error('Failed to fetch videos from database');
    return response.json();
  },

  async createVideo(video: any): Promise<VideoItem> {
    const response = await fetchWithAuth('/web/videos', {
      method: 'POST',
      body: JSON.stringify(video),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to add video');
    }
    return response.json();
  },

  async updateVideo(id: string, updates: any): Promise<VideoItem> {
    const response = await fetchWithAuth(`/web/videos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update video');
    }
    return response.json();
  },

  async deleteVideo(id: string): Promise<void> {
    const response = await fetchWithAuth(`/web/videos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete video');
    }
  },

  async clearAllVideos(): Promise<void> {
    const response = await fetchWithAuth('/web/videos', { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear videos');
  },

  async getDisplaySettings(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/web/display-settings`);
    if (!response.ok) throw new Error('Failed to fetch display settings');
    return response.json();
  },

  async updateDisplaySettings(settings: any): Promise<any> {
    const response = await fetchWithAuth('/web/display-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update display settings');
    }
    return response.json();
  },

  async getHomePageConfig(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/web/homepage-config`);
    if (!response.ok) throw new Error('Failed to fetch homepage configuration');
    return response.json();
  },

  async updateHomePageConfig(config: any): Promise<any> {
    const response = await fetchWithAuth('/web/homepage-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update homepage configuration');
    }
    return response.json();
  },

  async getNews(): Promise<NewsPost[]> {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) throw new Error('Failed to fetch news from database');
    return response.json();
  },

  async createNews(post: any): Promise<NewsPost> {
    const response = await fetchWithAuth('/news', {
      method: 'POST',
      body: JSON.stringify(post),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to publish news');
    }
    return response.json();
  },

  async updateNews(id: string, updates: any): Promise<NewsPost> {
    const response = await fetchWithAuth(`/news/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update news');
    }
    return response.json();
  },

  async deleteNews(id: string): Promise<void> {
    const response = await fetchWithAuth(`/news/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete news');
    }
  },
};
