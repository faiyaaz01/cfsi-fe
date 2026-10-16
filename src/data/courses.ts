import { Course } from '../types';

/**
 * Institutional Courses & Programs Registry.
 * Default fallback courses for offline or pre-fetch states.
 * Live course catalog is managed in real time via the Web Management portal and MongoDB backend.
 */
export const defaultCourses: Course[] = [
  {
    id: 'course-dfs-1',
    slug: 'diploma-fire-safety-management',
    title: 'Diploma Fire & Saftey Management',
    shortDescription: 'Comprehensive 1-year diploma program focusing on fire prevention, industrial safety, and disaster management.',
    fullDescription: 'Comprehensive 1-year diploma program focusing on fire prevention, industrial safety, risk assessment, rescue procedures, and disaster management with hands-on field drills.',
    duration: '1 Year',
    eligibility: '10th / 12th / ITI Pass or Equivalent',
    fee: 'Contact Desk',
    feeNumber: 0,
    icon: 'Flame',
    certificationBody: 'Government Recognized / Affiliated',
    careerOpportunities: ['Fire Officer', 'Safety Officer', 'Fire Safety Supervisor'],
    syllabus: ['Fire Technology', 'Industrial Safety', 'Construction Safety', 'Rescue Techniques'],
    order: 1,
  },
  {
    id: 'course-sfo-2',
    slug: 'sub-fire-officer',
    title: 'Sub Fire Officer',
    shortDescription: 'Advanced 6-month operational training for supervisory roles in municipal and industrial fire brigades.',
    fullDescription: 'Advanced 6-month operational training for supervisory roles in municipal and industrial fire brigades, specialized firefighting, and emergency rescue command.',
    duration: '6 Months',
    eligibility: '12th Pass / Graduate with physical standards',
    fee: 'Contact Desk',
    feeNumber: 0,
    icon: 'ShieldAlert',
    certificationBody: 'Government Recognized / Affiliated',
    careerOpportunities: ['Sub Fire Officer', 'Fire Station In-Charge', 'Safety Engineer'],
    syllabus: ['Fire Science & Chemistry', 'Hydraulics & Pumps', 'Disaster Management'],
    order: 2,
  },
  {
    id: 'course-dcpo-3',
    slug: 'driver-cum-pump-operator',
    title: 'Driver Cum Pump Operator - DCPO',
    shortDescription: 'Specialized 1-month intensive heavy vehicle fire tender operation and pump maintenance certification.',
    fullDescription: 'Specialized 1-month intensive certification covering heavy fire vehicle operation, high-pressure pump mechanics, water tender hydraulics, and emergency driving.',
    duration: '1 Month',
    eligibility: '10th Pass with Heavy Motor Vehicle (HMV) Driving License',
    fee: 'Contact Desk',
    feeNumber: 0,
    icon: 'HardHat',
    certificationBody: 'Government Recognized / Affiliated',
    careerOpportunities: ['Fire Driver', 'Pump Operator', 'Emergency Vehicle Specialist'],
    syllabus: ['Pumps & Primers', 'Water Hydraulics', 'Emergency Vehicle Maintenance'],
    order: 3,
  },
];

export const coursesData: Course[] = defaultCourses;

const DEMO_PREFIXES = ['cfs-01', 'dfs-02', 'pgdfs-03', 'ffsi-04'];

export const getStoredCourses = (): Course[] => {
  try {
    const saved = localStorage.getItem('cfsi_courses_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter(item => item.id && !DEMO_PREFIXES.some(p => item.id.startsWith(p)));
        if (filtered.length > 0) return filtered;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return coursesData;
};

