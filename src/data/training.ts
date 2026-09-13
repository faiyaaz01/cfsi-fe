import { TrainingPost } from '../types';

export const trainingData: TrainingPost[] = [
  {
    id: 'tr-01',
    title: 'Search & Rescue Tactical Operations',
    tag: 'Tactical Rescue',
    duration: '45 Hours Intensive',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    description: 'Comprehensive physical and tactical simulation for victim location in collapsed structures, dense smoke labyrinths, and industrial debris fields.',
    highlights: [
      'Zero-visibility thermal imaging & blind search patterns',
      'Structural collapse shoring and victim stabilization',
      'SCBA breathing endurance drills & buddy air sharing',
      'Two-man rescue carry and spine board extraction'
    ],
    equipmentUsed: ['Thermal Imaging Camera', 'SCBA BA Set', 'Hydraulic Spreader', 'Spine Board Stretcher']
  },
  {
    id: 'tr-02',
    title: 'Rope Climbing & High-Altitude Rescue',
    tag: 'Vertical Rescue',
    duration: '40 Hours Practical Ground',
    image: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80',
    description: 'High-angle rope rescue protocols for multi-storey residential complexes, industrial towers, wind turbines, and elevated crane emergencies.',
    highlights: [
      'Mastery of figure-8, bowline, clove hitch & prusik knots',
      'Controlled vertical rappelling & Australian abseiling',
      'High-line Tyrolean traverse for river/valley crossing',
      'Suspension trauma prevention & casualty harness hoist'
    ],
    equipmentUsed: ['Static & Dynamic Kernmantle Ropes', 'Descenders & Ascenders', 'Full-Body Harness', 'Tripod Winch']
  },
  {
    id: 'tr-03',
    title: 'HAZMAT & Chemical Fire Mitigation',
    tag: 'Hazardous Materials',
    duration: '50 Hours Specialist',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
    description: 'Specialized chemical containment, gas vapor dispersal, pipeline leak mitigation, and toxic industrial spill countermeasures designed for refinery belts.',
    highlights: [
      'Level-A and Level-B chemical encapsulated suit donning',
      'Hazchem code placards, ERG manual & plume modeling',
      'Foam proportioning and hydrocarbon fuel blanketing',
      'Decontamination corridor establishment & toxic run-off control'
    ],
    equipmentUsed: ['Level-A Gas Suits', 'Foam Induction Branch', 'Multi-Gas Detector', 'Decon Showers']
  }
];
