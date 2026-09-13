import { Course } from '../types';

export const coursesData: Course[] = [
  {
    id: 'cfs-01',
    title: 'Certificate In Fire Safety',
    slug: 'certificate-in-fire-safety',
    duration: '6 Months',
    eligibility: '10th Standard Pass (SSC)',
    fee: '₹15,000',
    feeNumber: 15000,
    badge: 'Popular Foundation',
    icon: 'Flame',
    shortDescription: 'Comprehensive entry-level fire prevention, basic firefighting tactics, and emergency protocol drills.',
    fullDescription: 'The Certificate in Fire Safety is crafted for students seeking immediate employment in building safety, mall security, industrial warehousing, and corporate fire response teams. The program blends foundational fire science with daily practical drills.',
    syllabus: [
      'Fundamentals of Fire Chemistry & Combustion',
      'Classification of Fire & Extinguishing Agents',
      'Fire Fighting Equipment & Hydrant Systems',
      'First Aid, CPR & Emergency Casualty Handling',
      'Breathing Apparatus (BA Set) Handling',
      'Evacuation Drills & Smoke Chamber Navigation'
    ],
    physicalRequirements: [
      'Height: Minimum 165 cm (Male) / 155 cm (Female)',
      'Chest: 81 cm (Normal) - 86 cm (Expanded)',
      'Vision: 6/6 without color blindness',
      'No physical deformity impairing active firefighting'
    ],
    careerOpportunities: [
      'Fire Guard / Fireman',
      'Fire Equipment Inspector',
      'Safety Warden in Commercial Complexes',
      'Industrial Safety Assistant'
    ],
    certificationBody: 'Affiliated with IFSMA & Recognized by State Fire Safety Councils'
  },
  {
    id: 'dfs-02',
    title: 'Diploma In Fire Safety',
    slug: 'diploma-in-fire-safety',
    duration: '1 Year (2 Semesters)',
    eligibility: '12th Standard Pass (HSC Science/Commerce/Arts)',
    fee: '₹25,000',
    feeNumber: 25000,
    badge: 'Flagship Career Program',
    icon: 'ShieldAlert',
    shortDescription: 'Advanced fire engineering, hazard identification, industrial safety norms, and active squad leadership.',
    fullDescription: 'The Diploma in Fire Safety is our premier 1-year professional course designed to produce certified Fire Officers and Safety Supervisors. Students undergo intensive ground drills, chemical fire mitigation, and industrial attachment.',
    syllabus: [
      'Advanced Fire Hydraulics & Pump Operations',
      'Fixed Fire Protection Systems & Sprinklers',
      'Building Codes & National Building Code (NBC) Compliance',
      'Industrial Toxicology & Chemical Fire Fighting',
      'Risk Assessment & HAZOP Methodologies',
      'High-Rise Building Rescue Techniques & Arial Platforms',
      'Live Ground Tactical Operations & Incident Command'
    ],
    physicalRequirements: [
      'Height: Minimum 165 cm (Male) / 155 cm (Female)',
      'Running: 1.6 km in under 7 minutes',
      'Rope Climbing: Minimum 15 feet',
      'Lifting: Carrying 50kg dummy for 50 meters'
    ],
    careerOpportunities: [
      'Fire Safety Supervisor / Officer',
      'Health & Safety Executive (HSE)',
      'Refinery & Petrochemical Safety Officer',
      'Airport Fire Service Specialist'
    ],
    certificationBody: 'Government Approved & IFSMA Accredited National Diploma'
  },
  {
    id: 'sfo-03',
    title: 'Sub Fire Officer (SFO)',
    slug: 'sub-fire-officer',
    duration: '6 Months',
    eligibility: '12th Pass + Mandatory Physical Fitness Standard',
    fee: '₹18,000',
    feeNumber: 18000,
    badge: 'Municipal & Govt Fast-Track',
    icon: 'Award',
    shortDescription: 'Specialized tactical training for municipal fire brigades, emergency services, and port authorities.',
    fullDescription: 'The Sub Fire Officer course is tailored to meet the strict entry criteria of municipal corporations, state fire services, and public sector undertakings (PSUs). Emphasizes tactical command, swift water rescue, and advanced apparatus.',
    syllabus: [
      'Station Management & Fire Record Keeping',
      'Municipal Fire Acts & Legal By-laws',
      'Specialized Rescue Operations (Earthquake / Flood / Collapse)',
      'Hydraulic Ladder & Snorkel Operations',
      'Incident Command System (ICS) & Disaster Management',
      'Communication Systems & Command Vehicle Coordination'
    ],
    physicalRequirements: [
      'Height: Minimum 167 cm (Male) / 157 cm (Female)',
      'Chest: 81 cm to 86 cm',
      'High Jump: 1.20 meters / Long Jump: 3.50 meters',
      '100 Meter Sprint: Under 14 seconds'
    ],
    careerOpportunities: [
      'Municipal Sub Fire Officer (SFO)',
      'Government Port Fire Officer',
      'Oil & Gas Terminal Safety Commander',
      'Industrial Fire Station In-Charge'
    ],
    certificationBody: 'IFSMA Accredited & Municipal Examination Prep Standard'
  },
  {
    id: 'is-04',
    title: 'Industrial Safety',
    slug: 'industrial-safety',
    duration: '3 Months (Certificate / Executive)',
    eligibility: 'Any Graduate (B.Sc / B.E / Diploma / B.Com / Arts)',
    fee: '₹12,000',
    feeNumber: 12000,
    badge: 'Executive & Plant Focus',
    icon: 'HardHat',
    shortDescription: 'Plant safety, OSHA/Factories Act compliance, chemical containment, and environmental hazard management.',
    fullDescription: 'Geared towards technical graduates and working professionals in manufacturing, pharmaceutical, chemical, and construction sectors. Focuses on zero-accident philosophy, PPE audit, and statutory workplace compliance.',
    syllabus: [
      'Factories Act 1948 & OSHA Compliance',
      'Hazard Identification & Risk Assessment (HIRA)',
      'Electrical, Mechanical & Machine Guarding Safety',
      'Chemical Safety, MSDS & Hazchem Placarding',
      'Job Safety Analysis (JSA) & Work Permit Systems',
      'Environmental Health & Safety (EHS) Auditing'
    ],
    careerOpportunities: [
      'Industrial EHS Specialist',
      'Safety Auditor & Compliance Officer',
      'Manufacturing Plant Safety Coordinator',
      'Construction Safety Supervisor'
    ],
    certificationBody: 'National Safety Council Standards & IFSMA Affiliation'
  }
];
