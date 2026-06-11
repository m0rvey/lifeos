import type { Person } from './person.types';
import type { Task } from './task.types';
import type { Transaction, BillReminder } from './finance.types';
import type { RideRecord, CycleRoute, MaintenanceRecord, GalleryNote } from './cycling.types';
import type { JournalEntry, KnowledgeItem, ScheduleBlock, Habit, WorkoutRecord, Thought } from './reflect.types';

export type ModuleKey = 'hub' | 'social' | 'finance' | 'cycling' | 'reflect' | 'analytics' | 'settings';

export type ThemeType = 'mindveyz' | 'cyclist' | 'reflect' | 'slate';

export interface AppSettings {
  theme: ThemeType;
  accentColor: 'purple' | 'orange' | 'green' | 'blue' | 'rose';
  fontSizeScale: number; // 0.8 — 1.2, шаг 0.05
  isAdaptive: boolean; // авто-смена темы под модуль
  graphSensitivity: number; // 1–10
  graphWeights: GraphWeights;
  weekStartDay: 0 | 1; // 0=воскресенье, 1=понедельник
}

export interface GraphWeights {
  energy: number;      // 0.0–1.0
  resonance: number;   // 0.0–1.0
  reciprocity: number; // 0.0–1.0
  volatility: number;  // 0.0–1.0
  recency: number;     // 0.0–1.0
}

export interface AppData {
  version: 3;
  settings: AppSettings;
  people: Person[];
  tasks: Task[];
  transactions: Transaction[];
  reminders: BillReminder[];
  rides: RideRecord[];
  routes: CycleRoute[];
  maintenance: MaintenanceRecord[];
  galleryNotes: GalleryNote[];
  journal: JournalEntry[];
  knowledge: KnowledgeItem[];
  schedule: ScheduleBlock[];
  habits: Habit[];
  workouts: WorkoutRecord[];
  thoughts: Thought[];
  fatigue: number; // 0–100
}
