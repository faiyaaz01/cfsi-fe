import { TrainingPost } from '../types';

/**
 * Tactical Ground Training Modules Registry.
 * Demo drill data has been completely cleared.
 * Live training modules are managed in real time via the Web Management portal and MongoDB backend.
 */
export const trainingData: TrainingPost[] = [];

const DEMO_PREFIXES = ['tr-01', 'tr-02', 'tr-03'];

export const getStoredTrainings = (): TrainingPost[] => {
  try {
    const saved = localStorage.getItem('cfsi_training_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item.id && !DEMO_PREFIXES.some(p => item.id.startsWith(p)));
      }
    }
  } catch (e) {
    console.error(e);
  }
  return trainingData;
};
