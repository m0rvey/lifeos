import type { AppData } from '../types';

export function getDefaultData(): AppData {
  return {
    version: 3,
    settings: {
      theme: 'mindveyz',
      themeMode: 'adaptive',
      accentColor: 'purple',
      fontSizeScale: 1.0,
      isAdaptive: true,
      graphSensitivity: 5,
      graphWeights: {
        energy: 0.42,
        resonance: 0.3,
        reciprocity: 0.24,
        volatility: 0.2,
        recency: 0.15,
      },
      weekStartDay: 1,
    },
    people: [],
    tasks: [],
    transactions: [],
    reminders: [],
    rides: [],
    routes: [],
    maintenance: [],
    galleryNotes: [],
    journal: [],
    knowledge: [],
    schedule: [],
    habits: [],
    workouts: [],
    thoughts: [],
    fatigue: 10,
  };
}
