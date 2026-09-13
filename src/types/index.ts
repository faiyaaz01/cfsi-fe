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
  category: 'Training' | 'Events' | 'Certificates' | 'Equipment';
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
  id: string;
  certificateNumber: string;
  rollNo: string;
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
  photoUrl?: string;
}

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

// Student Portal & Attendance/Result Types (Designed for easy future REST/GraphQL backend wiring)
export interface StudentAccount {
  certificateNumber: string;
  username: string;
  password: string; // Demo plaintext credential for mock authentication
}

export type AttendanceStatus = 'Present' | 'Absent';

export type AttendanceSlot = 'Slot 1' | 'Slot 2' | 'Slot 3';

export interface AttendanceRecord {
  id: string;
  certificateNumber: string;
  date: string; // ISO format (YYYY-MM-DD)
  slot?: AttendanceSlot; // 3 slots each day: Slot 1 (Morning), Slot 2 (Theory), Slot 3 (Practical)
  slotTiming?: string;
  course: string;
  status: AttendanceStatus;
  topicOrModule?: string;
  remarks?: string;
  markedBy?: string;
  createdAt?: string;
}

export interface ResultRecord {
  id: string;
  certificateNumber: string;
  course: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  examDate?: string;
  semesterOrTerm?: string;
  remarks?: string;
  createdAt?: string;
}

