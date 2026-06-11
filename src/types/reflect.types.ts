export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number; // 0–100
  dateISO: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  url: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // "HH:MM"
  durationMin: number;
  type: 'work' | 'personal' | 'health' | 'social' | 'learning' | 'rest';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: 'social' | 'health' | 'mind' | 'productivity' | 'other';
  completedDates: string[]; // ISO dates (YYYY-MM-DD)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutRecord {
  id: string;
  dateISO: string; // YYYY-MM-DD
  type: 'running' | 'swimming' | 'gym' | 'yoga' | 'walking' | 'other';
  durationMin: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  description: string;
  calories: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Thought {
  id: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
