import { Course } from '../types';

/**
 * Institutional Courses & Programs Registry.
 * Demo course data has been completely cleared.
 * Live course catalog is managed in real time via the Web Management portal and MongoDB backend.
 */
export const coursesData: Course[] = [];

const DEMO_PREFIXES = ['cfs-01', 'dfs-02', 'pgdfs-03', 'ffsi-04'];

export const getStoredCourses = (): Course[] => {
  try {
    const saved = localStorage.getItem('cfsi_courses_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.id && !DEMO_PREFIXES.some(p => item.id.startsWith(p)));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return coursesData;
};
