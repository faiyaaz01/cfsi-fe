import { AttendanceRecord } from '../types';

/**
 * =========================================================================
 * INITIAL ATTENDANCE SEED DATA
 * =========================================================================
 * Seed data for practical ground drills, tower simulations, and theory classes.
 * Loaded into localStorage on first run; afterwards localStorage is the source
 * of truth (and can be replaced with GET/POST /api/attendance when backend is linked).
 * =========================================================================
 */

const todayIso = new Date().toISOString().split('T')[0];

export const initialAttendanceSeed: AttendanceRecord[] = [
  // --- TODAY'S 3-SLOT MUSTER ROLL ---
  {
    id: 'att-today-101-1',
    certificateNumber: 'CFSI-2023-0101',
    date: todayIso,
    slot: 'Slot 1',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'Morning PT, Squad Marching & Hose Flaking Drill',
    remarks: 'Punctual, full gear turnout',
    markedBy: 'Chief Instructor Dave',
    createdAt: `${todayIso}T08:05:00.000Z`
  },
  {
    id: 'att-today-101-2',
    certificateNumber: 'CFSI-2023-0101',
    date: todayIso,
    slot: 'Slot 2',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'NBC Hazard Codes & Chemical Protective Suits (Level-A)',
    remarks: 'Scored 100% on safety checklist test',
    markedBy: 'Chief Instructor Dave',
    createdAt: `${todayIso}T10:35:00.000Z`
  },
  {
    id: 'att-today-101-3',
    certificateNumber: 'CFSI-2023-0101',
    date: todayIso,
    slot: 'Slot 3',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'High-Rise Drill Tower: Self-Rescue & Abseiling',
    remarks: 'Clear anchor rigging technique',
    markedBy: 'Officer Rathod',
    createdAt: `${todayIso}T14:10:00.000Z`
  },
  {
    id: 'att-today-102-1',
    certificateNumber: 'CFSI-2023-0102',
    date: todayIso,
    slot: 'Slot 1',
    course: 'Sub Fire Officer',
    status: 'Present',
    topicOrModule: 'Incident Command Group Physical Fitness & Calisthenics',
    remarks: 'Commanding posture',
    markedBy: 'Commander Solanki',
    createdAt: `${todayIso}T08:05:00.000Z`
  },
  {
    id: 'att-today-102-2',
    certificateNumber: 'CFSI-2023-0102',
    date: todayIso,
    slot: 'Slot 2',
    course: 'Sub Fire Officer',
    status: 'Present',
    topicOrModule: 'Disaster Mitigation & Urban Search Rescue Tactics',
    remarks: 'Demonstrated tactical deployment plan',
    markedBy: 'Commander Solanki',
    createdAt: `${todayIso}T10:35:00.000Z`
  },
  {
    id: 'att-today-102-3',
    certificateNumber: 'CFSI-2023-0102',
    date: todayIso,
    slot: 'Slot 3',
    course: 'Sub Fire Officer',
    status: 'Absent',
    topicOrModule: 'Hydraulic Snorkel Platform Simulator Drill',
    remarks: 'Excused for official district liaison duties',
    markedBy: 'Admin Desk',
    createdAt: `${todayIso}T14:10:00.000Z`
  },
  {
    id: 'att-today-103-1',
    certificateNumber: 'CFSI-2023-0103',
    date: todayIso,
    slot: 'Slot 1',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'Morning Squad Marching & Extinguisher Pan Drills',
    remarks: 'Speedy extinguisher deployment',
    markedBy: 'Instructor Dave',
    createdAt: `${todayIso}T08:05:00.000Z`
  },
  {
    id: 'att-today-103-2',
    certificateNumber: 'CFSI-2023-0103',
    date: todayIso,
    slot: 'Slot 2',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'Industrial First Aid, CPR & AED Automation',
    remarks: 'CPR cycle completed accurately',
    markedBy: 'Dr. Shah (Paramedic)',
    createdAt: `${todayIso}T10:35:00.000Z`
  },
  {
    id: 'att-today-103-3',
    certificateNumber: 'CFSI-2023-0103',
    date: todayIso,
    slot: 'Slot 3',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'Smoke Maze Navigation & Thermal Imaging Camera',
    remarks: 'Quick casualty extraction in smoke',
    markedBy: 'Chief Instructor Dave',
    createdAt: `${todayIso}T14:10:00.000Z`
  },
  {
    id: 'att-today-201-1',
    certificateNumber: 'CFSI-2024-0201',
    date: todayIso,
    slot: 'Slot 1',
    course: 'Industrial Safety',
    status: 'Present',
    topicOrModule: 'Refinery Gate Safety Induction & Morning Muster',
    remarks: 'PPE compliance verified',
    markedBy: 'Eng. Mehtani',
    createdAt: `${todayIso}T08:05:00.000Z`
  },
  {
    id: 'att-today-201-2',
    certificateNumber: 'CFSI-2024-0201',
    date: todayIso,
    slot: 'Slot 2',
    course: 'Industrial Safety',
    status: 'Absent',
    topicOrModule: 'HAZOP Risk Matrix & Environmental Pollution Controls',
    remarks: 'On leave with prior notice',
    markedBy: 'Eng. Mehtani',
    createdAt: `${todayIso}T10:35:00.000Z`
  },
  {
    id: 'att-today-201-3',
    certificateNumber: 'CFSI-2024-0201',
    date: todayIso,
    slot: 'Slot 3',
    course: 'Industrial Safety',
    status: 'Present',
    topicOrModule: 'Scaffolding Safety & Fall Arrest Harness Inspection',
    remarks: 'Full body harness anchor test passed',
    markedBy: 'Eng. Mehtani',
    createdAt: `${todayIso}T14:10:00.000Z`
  },

  // --- HISTORICAL SESSIONS: Rahul V. Patel (CFSI-2023-0101) ---
  {
    id: 'att-101',
    certificateNumber: 'CFSI-2023-0101',
    date: '2024-05-02',
    slot: 'Slot 1',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'High-Rise Drill Tower: Self-Rescue & Abseiling',
    remarks: 'Demonstrated exceptional anchor-rigging technique',
    markedBy: 'Chief Instructor Dave',
    createdAt: '2024-05-02T10:30:00.000Z'
  },
  {
    id: 'att-102',
    certificateNumber: 'CFSI-2023-0101',
    date: '2024-05-05',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'Hydraulics & High-Pressure Centrifugal Pumps',
    remarks: 'Full pump operation and flow calculation passed',
    markedBy: 'Officer Rathod',
    createdAt: '2024-05-05T11:00:00.000Z'
  },
  {
    id: 'att-103',
    certificateNumber: 'CFSI-2023-0101',
    date: '2024-05-08',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'BA Set (Breathing Apparatus) Smoke Maze Navigation',
    remarks: 'Clear zero-visibility search and recovery drill',
    markedBy: 'Chief Instructor Dave',
    createdAt: '2024-05-08T09:45:00.000Z'
  },
  {
    id: 'att-104',
    certificateNumber: 'CFSI-2023-0101',
    date: '2024-05-12',
    course: 'Diploma In Fire Safety',
    status: 'Absent',
    topicOrModule: 'HAZMAT Class 3 Flammable Liquid Containment',
    remarks: 'Medical leave submitted with verification',
    markedBy: 'Admin Desk',
    createdAt: '2024-05-12T09:00:00.000Z'
  },
  {
    id: 'att-105',
    certificateNumber: 'CFSI-2023-0101',
    date: '2024-05-15',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'Foam Compound Tender Operations (AFFF)',
    remarks: 'Correct proportioning and spray nozzle handling',
    markedBy: 'Officer Rathod',
    createdAt: '2024-05-15T10:15:00.000Z'
  },
  {
    id: 'att-106',
    certificateNumber: 'CFSI-2023-0101',
    date: '2024-05-18',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'Confined Space Rescue & Gas Detector Deployment',
    remarks: 'Standard operating safety guidelines followed',
    markedBy: 'Chief Instructor Dave',
    createdAt: '2024-05-18T14:00:00.000Z'
  },
  {
    id: 'att-107',
    certificateNumber: 'CFSI-2023-0101',
    date: '2024-05-22',
    course: 'Diploma In Fire Safety',
    status: 'Present',
    topicOrModule: 'Electrical Fire Substation Hazard Protocols',
    remarks: 'CO2 fixed flooding simulator drill completed',
    markedBy: 'Officer Rathod',
    createdAt: '2024-05-22T10:00:00.000Z'
  },

  // --- Amitabh S. Sharma (CFSI-2023-0102) - Sub Fire Officer ---
  {
    id: 'att-201',
    certificateNumber: 'CFSI-2023-0102',
    date: '2024-05-03',
    course: 'Sub Fire Officer',
    status: 'Present',
    topicOrModule: 'Incident Command System (ICS) & Crew Deployment',
    remarks: 'Successfully led tactical group triage exercise',
    markedBy: 'Commander Solanki',
    createdAt: '2024-05-03T09:30:00.000Z'
  },
  {
    id: 'att-202',
    certificateNumber: 'CFSI-2023-0102',
    date: '2024-05-07',
    course: 'Sub Fire Officer',
    status: 'Present',
    topicOrModule: 'Fire Station Administration & Log Book Procedures',
    remarks: 'Duty muster and apparatus maintenance ledger',
    markedBy: 'Commander Solanki',
    createdAt: '2024-05-07T11:00:00.000Z'
  },
  {
    id: 'att-203',
    certificateNumber: 'CFSI-2023-0102',
    date: '2024-05-11',
    course: 'Sub Fire Officer',
    status: 'Absent',
    topicOrModule: 'Hydraulic Platform (Snorkel) Outreach Controls',
    remarks: 'Excused for official mock drill coordination',
    markedBy: 'Admin Desk',
    createdAt: '2024-05-11T10:00:00.000Z'
  },
  {
    id: 'att-204',
    certificateNumber: 'CFSI-2023-0102',
    date: '2024-05-14',
    course: 'Sub Fire Officer',
    status: 'Present',
    topicOrModule: 'NBC (Nuclear, Biological, Chemical) First Responder Drill',
    remarks: 'Full Level-A suit decontamination procedure completed',
    markedBy: 'Commander Solanki',
    createdAt: '2024-05-14T09:15:00.000Z'
  },
  {
    id: 'att-205',
    certificateNumber: 'CFSI-2023-0102',
    date: '2024-05-19',
    course: 'Sub Fire Officer',
    status: 'Present',
    topicOrModule: 'Disaster Mitigation & Earthquake Search Dogs Handling',
    remarks: 'Acoustic search camera operation passed',
    markedBy: 'Commander Solanki',
    createdAt: '2024-05-19T13:30:00.000Z'
  },

  // --- Priyanka D. Parmar (CFSI-2023-0103) - Certificate In Fire Safety ---
  {
    id: 'att-301',
    certificateNumber: 'CFSI-2023-0103',
    date: '2024-05-04',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'Classification of Fire & Extinguisher Practical Drill',
    remarks: 'Water, Foam, Dry Powder, and CO2 live pan fires extinguished',
    markedBy: 'Instructor Dave',
    createdAt: '2024-05-04T09:30:00.000Z'
  },
  {
    id: 'att-302',
    certificateNumber: 'CFSI-2023-0103',
    date: '2024-05-09',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'First Aid, CPR Resuscitation & Burn Triage',
    remarks: 'Certified CPR practical with AED mock demonstration',
    markedBy: 'Dr. Shah (Paramedic)',
    createdAt: '2024-05-09T10:45:00.000Z'
  },
  {
    id: 'att-303',
    certificateNumber: 'CFSI-2023-0103',
    date: '2024-05-13',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'Hose Running, Flaking, and Branch Coupling Speed Drills',
    remarks: 'Clocked fastest branch coupling in squad',
    markedBy: 'Instructor Dave',
    createdAt: '2024-05-13T08:30:00.000Z'
  },
  {
    id: 'att-304',
    certificateNumber: 'CFSI-2023-0103',
    date: '2024-05-17',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'Fire Hydrant Ring Main & Booster Pressure Test',
    remarks: 'Static pressure reading and gland packing checked',
    markedBy: 'Instructor Dave',
    createdAt: '2024-05-17T11:00:00.000Z'
  },
  {
    id: 'att-305',
    certificateNumber: 'CFSI-2023-0103',
    date: '2024-05-21',
    course: 'Certificate In Fire Safety',
    status: 'Present',
    topicOrModule: 'Evacuation Drills & Emergency Escape Route Planning',
    remarks: 'Industrial evacuation timing protocol mastered',
    markedBy: 'Instructor Dave',
    createdAt: '2024-05-21T09:00:00.000Z'
  },

  // --- Hardik K. Solanki (CFSI-2024-0201) - Industrial Safety ---
  {
    id: 'att-401',
    certificateNumber: 'CFSI-2024-0201',
    date: '2024-05-06',
    course: 'Industrial Safety',
    status: 'Present',
    topicOrModule: 'OSHA / Factories Act Safety Audits & Hazard ID (HAZOP)',
    remarks: 'Chemical refinery audit simulation completed',
    markedBy: 'Eng. Mehtani',
    createdAt: '2024-05-06T10:00:00.000Z'
  },
  {
    id: 'att-402',
    certificateNumber: 'CFSI-2024-0201',
    date: '2024-05-10',
    course: 'Industrial Safety',
    status: 'Present',
    topicOrModule: 'Scaffolding Safety, Fall Arresters & Harness Checks',
    remarks: 'Standard 100% tie-off compliance inspected',
    markedBy: 'Eng. Mehtani',
    createdAt: '2024-05-10T14:30:00.000Z'
  },
  {
    id: 'att-403',
    certificateNumber: 'CFSI-2024-0201',
    date: '2024-05-16',
    course: 'Industrial Safety',
    status: 'Absent',
    topicOrModule: 'Hot Work Permit & Gas Clearance Testing',
    remarks: 'Absent without leave - notified safety dept',
    markedBy: 'Eng. Mehtani',
    createdAt: '2024-05-16T09:30:00.000Z'
  },
  {
    id: 'att-404',
    certificateNumber: 'CFSI-2024-0201',
    date: '2024-05-20',
    course: 'Industrial Safety',
    status: 'Present',
    topicOrModule: 'Personal Protective Equipment (PPE) Testing Standards',
    remarks: 'Dielectric boots and arc flash shield compliance checked',
    markedBy: 'Eng. Mehtani',
    createdAt: '2024-05-20T11:15:00.000Z'
  }
];
