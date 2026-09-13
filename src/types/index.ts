export type NewsCategory = 'News' | 'Event' | 'Announcement' | 'Institute Updates';

export interface NewsPost {
  id: string;
  title: string;
  category: NewsCategory;
  date: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  author?: string;
  isPinned?: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  duration: string;
  eligibility: string;
  fee: string;
  feeNumber: number;
  badge?: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  syllabus: string[];
  physicalRequirements?: string[];
  careerOpportunities: string[];
  certificationBody: string;
}

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  category: 'Practical Drill' | 'Fire Demo' | 'Search & Rescue' | 'Campus Life';
  duration: string;
  description: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: 'Training' | 'Events' | 'Equipment';
  imageUrl: string;
  caption: string;
  date: string;
}

export interface TrainingPost {
  id: string;
  title: string;
  tag: string;
  duration: string;
  image: string;
  description: string;
  highlights: string[];
  equipmentUsed: string[];
}

export interface StudentVerificationRecord {
  id: string; // Student ID (e.g. 262701 or 2600DFS26101)
  rollNo: string; // Roll number (e.g. 01)
  enrollmentNo?: string;
  name: string;
  fatherName: string;
  course: string;
  batch: string;
  passingYear: string;
  grade: string;
  percentage: string;
  verificationStatus: 'Verified' | 'Pending' | 'Suspended';
  issueDate: string;
  centerLocation: string;
  centerName?: string;
  gender?: string;
  mode?: string;
  photoUrl?: string;
  motherName?: string;
  birthDate?: string;
  presentAddress?: string;
  studentPhone?: string;
  fatherPhone?: string;
  motherPhone?: string;
  category?: string;
  aadharCard?: string;
  email?: string;
  nationality?: string;
  state?: string;
}

export interface StudentProfile {
  id: string; // Cadet Student ID - Hardcoded / Read-only
  rollNo?: string;
  enrollmentNo?: string;
  name: string; // Full Name
  photoUrl?: string;
  birthDate?: string;
  gender?: string;
  motherName?: string;
  fatherName?: string;
  presentAddress?: string;
  studentPhone: string; // Mandatory
  fatherPhone?: string;
  motherPhone?: string;
  category?: string;
  aadharCard?: string;
  email?: string;
  nationality?: string;
  state?: string;
  course?: string;
  batch?: string;
  mode?: string;
  passingYear?: string;
  grade?: string;
  percentage?: string;
  verificationStatus?: string;
  issueDate?: string;
  centerLocation?: string;
  centerName?: string;
}

export type CadetRecord = StudentVerificationRecord;

export interface JobListing {
  id: string;
  title: string;
  department: string;
  type: string;
  experience: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedDate: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  courseInterest: string;
  subject: string;
  message: string;
}

export interface CareerApplicationData {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  coverLetter?: string;
  resumeFileName?: string;
}

// Student Portal & Attendance Types (Designed for REST backend)
export interface StudentAccount {
  studentId: string;
  username: string;
  password: string;
}

export type AttendanceStatus = 'Present' | 'Absent';

export type AttendanceSlot = 'Slot 1' | 'Slot 2' | 'Slot 3';

export interface AttendanceRecord {
  id: string;
  studentId: string; // Student ID (e.g. 262701)
  rollNo?: string;
  date: string; // ISO format (YYYY-MM-DD)
  slot?: AttendanceSlot; // 3 slots each day: Slot 1 (Morning), Slot 2 (Theory), Slot 3 (Practical)
  slotTiming?: string;
  course: string;
  status: AttendanceStatus;
  topicOrModule?: string;
  remarks?: string;
  markedBy?: string;
  createdAt?: string;
  uploadedAt?: string;
  isLocked?: boolean;
  canEditUntil?: string;
}

