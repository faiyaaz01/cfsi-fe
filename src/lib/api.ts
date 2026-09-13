/**
 * Central Fire Safety Institute (CFSI) Universal API Client
 * Connects Frontend to FastAPI + MongoDB Backend with JWT Authentication.
 */

const API_BASE_URL = '/api';
const TOKEN_STORAGE_KEY = 'cfsi_jwt_token';
const USER_STORAGE_KEY = 'cfsi_auth_user';

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'teacher' | 'student';
  certificate_number?: string | null;
  full_name?: string | null;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: 'admin' | 'teacher' | 'student';
  user: AuthUser;
}

export interface VerifyCertificateResponse {
  verified: boolean;
  message: string;
  student?: any;
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
    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({username, password, grant_type: 'password'}),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid username or password');
    }

    const data: AuthResponse = await response.json();
    if (role && role !== 'auto' && data.role !== role) throw new Error(`This account does not have ${role} access.`);
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

  /** Verify certificate (requires authentication) */
  async verifyCertificate(certificateNumber: string): Promise<VerifyCertificateResponse> {
    const clean = encodeURIComponent(certificateNumber.trim());
    const response = await fetchWithAuth(`/students/verify/${clean}`);
    if (response.status === 401) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }
    if (!response.ok) {
      throw new Error('Certificate verification service error');
    }
    return response.json();
  },

  /** Fetch attendance records */
  async getAttendance(params?: { date?: string; slot?: string; certificateNumber?: string; course?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.slot) query.set('slot', params.slot);
    if (params?.certificateNumber) query.set('certificate_number', params.certificateNumber);
    if (params?.course) query.set('course', params.course);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await fetchWithAuth(`/attendance${queryString}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance');
    }
    return response.json();
  },

  /** Bulk save 3-slot muster records */
  async saveAttendanceBulk(records: any[]): Promise<any[]> {
    const response = await fetchWithAuth('/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
    if (!response.ok) {
      throw new Error('Failed to bulk save attendance muster');
    }
    return response.json();
  },

  /** Single attendance upsert */
  async saveAttendanceSingle(record: any): Promise<any> {
    const response = await fetchWithAuth('/attendance', {
      method: 'POST',
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      throw new Error('Failed to save attendance record');
    }
    return response.json();
  },

  /** Fetch examination results */
  async getResults(params?: { certificateNumber?: string; course?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.certificateNumber) query.set('certificate_number', params.certificateNumber);
    if (params?.course) query.set('course', params.course);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await fetchWithAuth(`/results${queryString}`);
    if (!response.ok) {
      throw new Error('Failed to fetch results');
    }
    return response.json();
  },

  /** Add result */
  async createResult(result: any): Promise<any> {
    const response = await fetchWithAuth('/results', {
      method: 'POST',
      body: JSON.stringify(result),
    });
    if (!response.ok) {
      throw new Error('Failed to create result');
    }
    return response.json();
  },

  /** Fetch news bulletins */
  async getNews(): Promise<any[]> {
    const response = await fetchWithAuth('/news');
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    return response.json();
  },

  /** Check backend health and database mode */
  async checkHealth(): Promise<{ status: string; database: string; is_mock: boolean }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};
