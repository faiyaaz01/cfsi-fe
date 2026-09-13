import { NewsPost } from '../types';

export const initialNewsSeed: NewsPost[] = [
  {
    id: 'news-01',
    title: 'Admissions Open for Academic Year 2024-25 — Diploma & Certificate Batches',
    category: 'Announcement',
    date: '2024-08-20',
    excerpt: 'Applications are now invited for Government-recognized Diploma in Fire Safety (1 Year) and Sub Fire Officer programs. Limited seats available per batch.',
    content: 'Central Fire Safety Institute (CFSI), Vadodara announces the commencement of admissions for the upcoming session. Candidates who have passed 10th/12th or ITI are eligible to enroll for Certificate and Diploma programs. Practical training includes high-altitude rappelling, smoke chamber search and rescue, and industrial chemical fire drills. Scholarship concessions are available for merit students and children of defense/police personnel.',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80',
    author: 'Admissions Directorate',
    isPinned: true,
    createdAt: '2024-08-20T10:00:00.000Z'
  },
  {
    id: 'news-02',
    title: 'CFSI Conducts Mega Live Fire & Search Rescue Drill in Collaboration with GIDC Vadodara',
    category: 'Event',
    date: '2024-08-12',
    excerpt: 'Over 120 cadets successfully executed complex live hydrocarbon fire suppression and mass casualty evacuation in a simulated plant blackout drill.',
    content: 'A joint industrial disaster response drill was coordinated between CFSI senior instructors and Vadodara Industrial Safety authorities. Cadets operated high-capacity foam branches, mobile water monitors, and hydraulic rescue cutters to simulate real refinery emergencies. State safety inspectors praised the agility and discipline of CFSI student rescue squads.',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1000&q=80',
    author: 'Chief Training Officer',
    isPinned: false,
    createdAt: '2024-08-12T14:30:00.000Z'
  },
  {
    id: 'news-03',
    title: 'CFSI Awarded Best Fire Safety Vocational Training Institute in Western India by IFSMA',
    category: 'News',
    date: '2024-07-28',
    excerpt: 'Recognized for 100% practical ground drill curriculum, modern breathing apparatus training facility, and stellar placement records across petrochemical hubs.',
    content: 'The International Fire & Safety Management Association (IFSMA) presented the prestigious Western Regional Excellence Award to Central Fire Safety Institute Vadodara during the 15th National Fire Congress in New Delhi. The honor celebrates our continuous commitment to zero-fatality industrial safety education and ground drill standards.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    author: 'Institute Directorate',
    isPinned: false,
    createdAt: '2024-07-28T09:15:00.000Z'
  },
  {
    id: 'news-04',
    title: 'Upcoming National Fire Safety Week — Free Public Awareness & Fire Extinguisher Clinic',
    category: 'Event',
    date: '2024-09-05',
    excerpt: 'Join us at CFSI Vadodara campus for interactive safety workshops, home LPG gas safety demonstrations, and hands-on extinguisher training.',
    content: 'As part of our civic outreach initiative, CFSI faculty and senior trainees will host a 2-day open workshop for school teachers, factory supervisors, and housing society managers. Participants will learn PASS fire extinguisher usage, emergency CPR, and primary burn triage with free participation certificates.',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
    author: 'Community Outreach Cell',
    isPinned: false,
    createdAt: '2024-09-05T08:00:00.000Z'
  }
];
