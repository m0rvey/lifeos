import { Depth, Archetype, PersonStatus } from '../types';
import type { 
  AppData, Person, Task, Transaction, BillReminder, 
  RideRecord, CycleRoute, MaintenanceRecord, GalleryNote, 
  JournalEntry, KnowledgeItem, ScheduleBlock, Habit, 
  WorkoutRecord, Thought 
} from '../types';
import { AppDataSchema } from '../validation';
import { getDefaultData } from './defaults';
import { safeSaveItem } from './atomic';

const STORAGE_KEY = 'lifeos_platform_v1';

// Translators
function mapDepth(val: unknown): Depth {
  if (val === 'Ядро' || val === 'core' || val === 'close') return Depth.CORE;
  if (val === 'Ближний круг' || val === 'inner') return Depth.INNER;
  if (val === 'Социальный слой' || val === 'social') return Depth.SOCIAL;
  if (val === 'Периферия' || val === 'periphery') return Depth.PERIPHERY;
  return Depth.PERIPHERY;
}

function mapArchetype(val: unknown): Archetype {
  if (val === 'Интеллектуальный' || val === 'intellectual') return Archetype.INTELLECTUAL;
  if (val === 'Эмоциональный' || val === 'emotional') return Archetype.EMOTIONAL;
  if (val === 'Деловой' || val === 'business') return Archetype.BUSINESS;
  return Archetype.BUSINESS;
}

function mapStatus(val: unknown): PersonStatus {
  if (val === 'Активен' || val === 'active') return PersonStatus.ACTIVE;
  if (val === 'Покой' || val === 'occasional') return PersonStatus.OCCASIONAL;
  if (val === 'На расстоянии' || val === 'distant' || val === 'С ограничениями') return PersonStatus.DISTANT;
  if (val === 'В конфликте' || val === 'conflict') return PersonStatus.CONFLICT;
  if (val === 'Не общаемся' || val === 'lost') return PersonStatus.LOST;
  if (val === 'Ментор' || val === 'mentor') return PersonStatus.MENTOR;
  return PersonStatus.ACTIVE;
}

// Sanitization helpers to enforce schema-compliance
function sanitizePerson(p: unknown): Person {
  const obj = p as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `p_${Math.random().toString(36).slice(2, 8)}`,
    name: typeof obj?.name === 'string' ? obj.name : 'Без имени',
    depth: mapDepth(obj?.depth),
    archetype: mapArchetype(obj?.archetype),
    status: mapStatus(obj?.status),
    energy: typeof obj?.energy === 'number' ? Math.max(0, Math.min(100, obj.energy)) : 50,
    resonance: typeof obj?.resonance === 'number' ? Math.max(0, Math.min(100, obj.resonance)) : 50,
    reciprocity: typeof obj?.reciprocity === 'number' ? Math.max(0, Math.min(100, obj.reciprocity)) : 50,
    volatility: typeof obj?.volatility === 'number' ? Math.max(0, Math.min(100, obj.volatility)) : 20,
    lastContactISO: typeof obj?.lastContactISO === 'string' ? obj.lastContactISO : new Date().toISOString().slice(0, 10),
    reflection: typeof obj?.reflection === 'string' ? obj.reflection : '',
    notes: typeof obj?.notes === 'string' ? obj.notes : '',
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
  };
}

function sanitizeTask(t: unknown): Task {
  const obj = t as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `t_${Math.random().toString(36).slice(2, 8)}`,
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Без названия',
    description: typeof obj?.description === 'string' ? obj.description : '',
    emotion: typeof obj?.emotion === 'number' ? Math.max(0, Math.min(100, obj.emotion)) : 50,
    urgency: typeof obj?.urgency === 'number' ? Math.max(0, Math.min(100, obj.urgency)) : 50,
    deadlineISO: typeof obj?.deadlineISO === 'string' ? obj.deadlineISO : null,
    isCompleted: typeof obj?.isCompleted === 'boolean' ? obj.isCompleted : false,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : new Date().toISOString(),
  };
}

function sanitizeTransaction(tx: unknown): Transaction {
  const obj = tx as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : String(obj?.id || `tx_${Math.random().toString(36).slice(2, 8)}`),
    type: obj?.type === 'income' ? 'income' : 'expense',
    amount: typeof obj?.amount === 'number' ? Math.max(1, obj.amount) : 100,
    category: typeof obj?.category === 'string' && obj.category ? obj.category : 'Другое',
    description: typeof obj?.description === 'string' ? obj.description : '',
    dateISO: typeof obj?.dateISO === 'string' ? obj.dateISO : new Date().toISOString().slice(0, 10),
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeReminder(r: unknown): BillReminder {
  const obj = r as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : String(obj?.id || `rem_${Math.random().toString(36).slice(2, 8)}`),
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Напоминание',
    amount: typeof obj?.amount === 'number' ? Math.max(1, obj.amount) : 100,
    dueDateISO: typeof obj?.dueDateISO === 'string' ? obj.dueDateISO : new Date().toISOString().slice(0, 10),
    isPaid: typeof obj?.isPaid === 'boolean' ? obj.isPaid : false,
    category: typeof obj?.category === 'string' && obj.category ? obj.category : 'Платежи',
    remindDaysBefore: typeof obj?.remindDaysBefore === 'number' ? Math.max(0, obj.remindDaysBefore) : 3,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeRide(r: unknown): RideRecord {
  const obj = r as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `r_${Math.random().toString(36).slice(2, 8)}`,
    dateISO: typeof obj?.dateISO === 'string' ? obj.dateISO : new Date().toISOString().slice(0, 10),
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Велопоездка',
    distanceKm: typeof obj?.distanceKm === 'number' ? Math.max(0, obj.distanceKm) : 0,
    durationMin: typeof obj?.durationMin === 'number' ? Math.max(1, obj.durationMin) : 1,
    avgSpeedKmh: typeof obj?.avgSpeedKmh === 'number' ? Math.max(0, obj.avgSpeedKmh) : 0,
    maxSpeedKmh: typeof obj?.maxSpeedKmh === 'number' ? Math.max(0, obj.maxSpeedKmh) : 0,
    elevationGainM: typeof obj?.elevationGainM === 'number' ? Math.max(0, obj.elevationGainM) : 0,
    avgPowerW: typeof obj?.avgPowerW === 'number' ? obj.avgPowerW : null,
    avgHrBpm: typeof obj?.avgHrBpm === 'number' ? obj.avgHrBpm : null,
    description: typeof obj?.description === 'string' ? obj.description : '',
    routeId: typeof obj?.routeId === 'string' ? obj.routeId : null,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeRoute(rt: unknown): CycleRoute {
  const obj = rt as Record<string, unknown> | null | undefined;
  const difficultyStr = typeof obj?.difficulty === 'string' ? obj.difficulty : '';
  const difficultyVal: CycleRoute['difficulty'] = ['easy', 'medium', 'hard', 'extreme'].includes(difficultyStr)
    ? (difficultyStr as CycleRoute['difficulty'])
    : 'medium';

  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `rt_${Math.random().toString(36).slice(2, 8)}`,
    name: typeof obj?.name === 'string' && obj.name ? obj.name : 'Маршрут',
    distanceKm: typeof obj?.distanceKm === 'number' ? Math.max(0.1, obj.distanceKm) : 10,
    elevationGainM: typeof obj?.elevationGainM === 'number' ? Math.max(0, obj.elevationGainM) : 0,
    difficulty: difficultyVal,
    waypoints: Array.isArray(obj?.waypoints) ? obj.waypoints.map(String) : [],
    isCompleted: typeof obj?.isCompleted === 'boolean' ? obj.isCompleted : false,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeMaintenance(m: unknown): MaintenanceRecord {
  const obj = m as Record<string, unknown> | null | undefined;
  const typeStr = typeof obj?.type === 'string' ? obj.type : '';
  const typeVal: MaintenanceRecord['type'] = ['repair', 'replace', 'service', 'upgrade', 'cleaning', 'inspection'].includes(typeStr)
    ? (typeStr as MaintenanceRecord['type'])
    : 'service';

  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `maint_${Math.random().toString(36).slice(2, 8)}`,
    bikePart: typeof obj?.bikePart === 'string' && obj.bikePart ? obj.bikePart : 'Запчасть',
    type: typeVal,
    description: typeof obj?.description === 'string' ? obj.description : '',
    cost: typeof obj?.cost === 'number' ? Math.max(0, obj.cost) : 0,
    dateISO: typeof obj?.dateISO === 'string' ? obj.dateISO : new Date().toISOString().slice(0, 10),
    isDone: typeof obj?.isDone === 'boolean' ? obj.isDone : false,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeGalleryNote(n: unknown): GalleryNote {
  const obj = n as Record<string, unknown> | null | undefined;
  const colorStr = typeof obj?.color === 'string' ? obj.color : '';
  const colorVal: GalleryNote['color'] = ['blue', 'green', 'orange', 'pink', 'purple'].includes(colorStr)
    ? (colorStr as GalleryNote['color'])
    : 'blue';

  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `gall_${Math.random().toString(36).slice(2, 8)}`,
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Заметка',
    content: typeof obj?.content === 'string' ? obj.content : '',
    color: colorVal,
    tags: Array.isArray(obj?.tags) ? obj.tags.map(String) : [],
    isPinned: typeof obj?.isPinned === 'boolean' ? obj.isPinned : false,
    rideId: typeof obj?.rideId === 'string' ? obj.rideId : null,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeJournal(j: unknown): JournalEntry {
  const obj = j as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `journ_${Math.random().toString(36).slice(2, 8)}`,
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Запись',
    content: typeof obj?.content === 'string' ? obj.content : '',
    mood: typeof obj?.mood === 'number' ? Math.max(0, Math.min(100, obj.mood)) : 50,
    dateISO: typeof obj?.dateISO === 'string' ? obj.dateISO : new Date().toISOString().slice(0, 10),
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeKnowledge(k: unknown): KnowledgeItem {
  const obj = k as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `know_${Math.random().toString(36).slice(2, 8)}`,
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Знание',
    content: typeof obj?.content === 'string' ? obj.content : '',
    category: typeof obj?.category === 'string' && obj.category ? obj.category : 'Общее',
    source: typeof obj?.source === 'string' ? obj.source : '',
    url: typeof obj?.url === 'string' ? obj.url : '',
    tags: Array.isArray(obj?.tags) ? obj.tags.map(String) : [],
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeSchedule(s: unknown): ScheduleBlock {
  const obj = s as Record<string, unknown> | null | undefined;
  const typeStr = typeof obj?.type === 'string' ? obj.type : '';
  const typeVal: ScheduleBlock['type'] = ['work', 'personal', 'health', 'social', 'learning', 'rest'].includes(typeStr)
    ? (typeStr as ScheduleBlock['type'])
    : 'personal';

  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `sb_${Math.random().toString(36).slice(2, 8)}`,
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Событие',
    dateISO: typeof obj?.dateISO === 'string' ? obj.dateISO : new Date().toISOString().slice(0, 10),
    startTime: typeof obj?.startTime === 'string' ? obj.startTime : '09:00',
    durationMin: typeof obj?.durationMin === 'number' ? Math.max(5, obj.durationMin) : 60,
    type: typeVal,
    isCompleted: typeof obj?.isCompleted === 'boolean' ? obj.isCompleted : false,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeHabit(h: unknown): Habit {
  const obj = h as Record<string, unknown> | null | undefined;
  const categoryStr = typeof obj?.category === 'string' ? obj.category : '';
  const categoryVal: Habit['category'] = ['social', 'health', 'mind', 'productivity', 'other'].includes(categoryStr)
    ? (categoryStr as Habit['category'])
    : 'health';

  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `habit_${Math.random().toString(36).slice(2, 8)}`,
    title: typeof obj?.title === 'string' && obj.title ? obj.title : 'Привычка',
    category: categoryVal,
    completedDates: Array.isArray(obj?.completedDates) ? obj.completedDates.map(String) : [],
    isActive: typeof obj?.isActive === 'boolean' ? obj.isActive : true,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeWorkout(w: unknown): WorkoutRecord {
  const obj = w as Record<string, unknown> | null | undefined;
  const typeStr = typeof obj?.type === 'string' ? obj.type : '';
  const typeVal: WorkoutRecord['type'] = ['running', 'swimming', 'gym', 'yoga', 'walking', 'other'].includes(typeStr)
    ? (typeStr as WorkoutRecord['type'])
    : 'other';

  const intensityVal = typeof obj?.intensity === 'number' && [1, 2, 3, 4, 5].includes(obj.intensity)
    ? (obj.intensity as WorkoutRecord['intensity'])
    : 3;

  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `work_${Math.random().toString(36).slice(2, 8)}`,
    dateISO: typeof obj?.dateISO === 'string' ? obj.dateISO : new Date().toISOString().slice(0, 10),
    type: typeVal,
    durationMin: typeof obj?.durationMin === 'number' ? Math.max(1, obj.durationMin) : 30,
    intensity: intensityVal,
    description: typeof obj?.description === 'string' ? obj.description : '',
    calories: typeof obj?.calories === 'number' ? obj.calories : null,
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

function sanitizeThought(t: unknown): Thought {
  const obj = t as Record<string, unknown> | null | undefined;
  return {
    id: typeof obj?.id === 'string' && obj.id ? obj.id : `thou_${Math.random().toString(36).slice(2, 8)}`,
    content: typeof obj?.content === 'string' && obj.content ? obj.content : 'Мысль',
    category: typeof obj?.category === 'string' ? obj.category : 'Разное',
    tags: Array.isArray(obj?.tags) ? obj.tags.map(String) : [],
    createdAt: typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString(),
    updatedAt: typeof obj?.updatedAt === 'string' ? obj.updatedAt : (typeof obj?.createdAt === 'string' ? obj.createdAt : new Date().toISOString()),
  };
}

export function sanitizeData(data: unknown): AppData {
  const def = getDefaultData();
  const obj = data as Record<string, unknown> | null | undefined;
  if (!obj || typeof obj !== 'object') return def;

  const rawSettings = (obj.settings || {}) as Record<string, unknown>;
  const rawWeights = (rawSettings.graphWeights || {}) as Record<string, unknown>;

  const themeStr = typeof rawSettings.theme === 'string' ? rawSettings.theme : '';
  const themeVal = ['mindveyz', 'cyclist', 'reflect', 'slate'].includes(themeStr) ? (themeStr as AppData['settings']['theme']) : def.settings.theme;

  const accentStr = typeof rawSettings.accentColor === 'string' ? rawSettings.accentColor : '';
  const accentVal = ['purple', 'orange', 'green', 'blue', 'rose'].includes(accentStr) ? (accentStr as AppData['settings']['accentColor']) : def.settings.accentColor;

  const themeModeStr = typeof rawSettings.themeMode === 'string' ? rawSettings.themeMode : '';
  const themeModeVal = ['manual', 'adaptive', 'system'].includes(themeModeStr) ? (themeModeStr as AppData['settings']['themeMode']) : def.settings.themeMode;

  return {
    version: 3,
    settings: {
      theme: themeVal,
      themeMode: themeModeVal,
      accentColor: accentVal,
      fontSizeScale: typeof rawSettings.fontSizeScale === 'number' ? Math.max(0.8, Math.min(1.2, rawSettings.fontSizeScale)) : def.settings.fontSizeScale,
      isAdaptive: typeof rawSettings.isAdaptive === 'boolean' ? rawSettings.isAdaptive : def.settings.isAdaptive,
      graphSensitivity: typeof rawSettings.graphSensitivity === 'number' ? Math.max(1, Math.min(10, rawSettings.graphSensitivity)) : def.settings.graphSensitivity,
      graphWeights: {
        energy: typeof rawWeights.energy === 'number' ? Math.max(0, Math.min(1, rawWeights.energy)) : def.settings.graphWeights.energy,
        resonance: typeof rawWeights.resonance === 'number' ? Math.max(0, Math.min(1, rawWeights.resonance)) : def.settings.graphWeights.resonance,
        reciprocity: typeof rawWeights.reciprocity === 'number' ? Math.max(0, Math.min(1, rawWeights.reciprocity)) : def.settings.graphWeights.reciprocity,
        volatility: typeof rawWeights.volatility === 'number' ? Math.max(0, Math.min(1, rawWeights.volatility)) : def.settings.graphWeights.volatility,
        recency: typeof rawWeights.recency === 'number' ? Math.max(0, Math.min(1, rawWeights.recency)) : def.settings.graphWeights.recency,
      },
      weekStartDay: rawSettings.weekStartDay === 0 || rawSettings.weekStartDay === 1 ? (rawSettings.weekStartDay as 0 | 1) : def.settings.weekStartDay,
    },
    people: Array.isArray(obj.people) ? obj.people.map(sanitizePerson) : def.people,
    tasks: Array.isArray(obj.tasks) ? obj.tasks.map(sanitizeTask) : def.tasks,
    transactions: Array.isArray(obj.transactions) ? obj.transactions.map(sanitizeTransaction) : def.transactions,
    reminders: Array.isArray(obj.reminders) ? obj.reminders.map(sanitizeReminder) : def.reminders,
    rides: Array.isArray(obj.rides) ? obj.rides.map(sanitizeRide) : def.rides,
    routes: Array.isArray(obj.routes) ? obj.routes.map(sanitizeRoute) : def.routes,
    maintenance: Array.isArray(obj.maintenance) ? obj.maintenance.map(sanitizeMaintenance) : def.maintenance,
    galleryNotes: Array.isArray(obj.galleryNotes) ? obj.galleryNotes.map(sanitizeGalleryNote) : def.galleryNotes,
    journal: Array.isArray(obj.journal) ? obj.journal.map(sanitizeJournal) : def.journal,
    knowledge: Array.isArray(obj.knowledge) ? obj.knowledge.map(sanitizeKnowledge) : def.knowledge,
    schedule: Array.isArray(obj.schedule) ? obj.schedule.map(sanitizeSchedule) : def.schedule,
    habits: Array.isArray(obj.habits) ? obj.habits.map(sanitizeHabit) : def.habits,
    workouts: Array.isArray(obj.workouts) ? obj.workouts.map(sanitizeWorkout) : def.workouts,
    thoughts: Array.isArray(obj.thoughts) ? obj.thoughts.map(sanitizeThought) : def.thoughts,
    fatigue: typeof obj.fatigue === 'number' ? Math.max(0, Math.min(100, obj.fatigue)) : def.fatigue,
  };
}

interface LegacySyntharaTask {
  id?: string;
  boardId?: string;
  title?: string;
  description?: string;
  emotion?: number;
  urgency?: number;
  deadline?: string;
  completed?: boolean;
  createdAt?: string;
}

interface LegacySyntharaTx {
  id?: string | number;
  type?: string;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
}


interface LegacySyntharaMaint {
  id?: string;
  bikePart?: string;
  serviceType?: string;
  notes?: string;
  mileage?: number;
  date?: string;
  status?: string;
}

interface LegacySyntharaJournal {
  id?: string;
  title?: string;
  content?: string;
  mood?: number;
  date?: string;
}

interface LegacySyntharaSchedule {
  id?: string;
  label?: string;
  time?: string;
  duration?: number;
  type?: string;
}

interface LegacySyntharaHabit {
  id?: string;
  title?: string;
  category?: string;
  logs?: string[];
}

interface LegacySyntharaWorkout {
  id?: string;
  date?: string;
  type?: string;
  duration?: number;
  intensity?: number;
  description?: string;
  calories?: number;
}

interface LegacyCyclistRide {
  id?: string;
  date?: string;
  notes?: string;
  distance?: number;
  duration?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  elevation?: number;
}

interface LegacyCyclistRoute {
  id?: string;
  name?: string;
  distance?: number;
  elevation?: number;
  completed?: boolean;
}

interface LegacyCyclistMaint {
  id?: string;
  description?: string;
  type?: string;
  cost?: number;
  date?: string;
}

interface LegacyCyclistGallery {
  id?: string;
  title?: string;
  content?: string;
  pinned?: boolean;
  date?: string | number | Date;
}

interface LegacyFinanceTx {
  id?: string | number;
  type?: string;
  amount?: number;
  category?: string;
  text?: string;
  date?: string;
}

interface LegacyMuseumThought {
  id?: string;
  text?: string;
  cat?: string;
  tags?: string[];
}

// Scans all previous localStorage keys and recovers legacy data
function recoverLegacyData(): AppData {
  const data = getDefaultData();

  // 1. Recover original m0rveyz keys
  const legacyM0rveyzState = localStorage.getItem('m0rveyz_state');
  if (legacyM0rveyzState) {
    try {
      const parsed = JSON.parse(legacyM0rveyzState) as Record<string, unknown> | null | undefined;
      if (parsed && Array.isArray(parsed.people)) {
        data.people = parsed.people.map(sanitizePerson);
      }
      if (parsed && parsed.settings && typeof parsed.settings === 'object') {
        const s = parsed.settings as Record<string, unknown>;
        if (typeof s.accentColor === 'string' && ['purple', 'orange', 'green', 'blue', 'rose'].includes(s.accentColor)) {
          data.settings.accentColor = s.accentColor as AppData['settings']['accentColor'];
        }
        if (typeof s.fontSizeScale === 'number') {
          data.settings.fontSizeScale = s.fontSizeScale;
        }
      }
    } catch { /* ignore */ }
  }

  // 2. Recover Synthara
  const syntharaRaw = localStorage.getItem('synthara-data');
  if (syntharaRaw) {
    try {
      const s = JSON.parse(syntharaRaw) as Record<string, unknown> | null | undefined;
      if (s && typeof s === 'object') {
        if (Array.isArray(s.tasks) && s.tasks.length > 0) {
          data.tasks = s.tasks.map((t: LegacySyntharaTask) => ({
            id: t.id || `t_${Math.random().toString(36).slice(2, 8)}`,
            title: t.title || 'Без названия',
            description: t.description || '',
            emotion: typeof t.emotion === 'number' ? Math.round(t.emotion * (t.emotion <= 1.0 ? 100 : 1)) : 50,
            urgency: typeof t.urgency === 'number' ? Math.round(t.urgency * (t.urgency <= 1.0 ? 100 : 1)) : 50,
            deadlineISO: t.deadline || null,
            isCompleted: !!t.completed,
            createdAt: t.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(s.transactions) && s.transactions.length > 0) {
          data.transactions = s.transactions.map((tx: LegacySyntharaTx) => ({
            id: String(tx.id || `tx_${Math.random().toString(36).slice(2, 8)}`),
            type: tx.type === 'income' ? 'income' : 'expense',
            amount: typeof tx.amount === 'number' ? tx.amount : 0,
            category: tx.category || 'Другое',
            description: tx.description || '',
            dateISO: tx.date || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(s.routes) && s.routes.length > 0) {
          data.routes = s.routes.map(sanitizeRoute);
        }
        if (Array.isArray(s.maintenanceRecords) && s.maintenanceRecords.length > 0) {
          data.maintenance = s.maintenanceRecords.map((m: LegacySyntharaMaint) => ({
            id: m.id || `maint_${Math.random().toString(36).slice(2, 8)}`,
            bikePart: m.bikePart || 'Деталь',
            type: m.serviceType === 'Замена' ? 'replace' : 'repair',
            description: m.notes || '',
            cost: m.mileage || 0,
            dateISO: m.date || new Date().toISOString().slice(0, 10),
            isDone: m.status === 'done',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(s.journalEntries) && s.journalEntries.length > 0) {
          data.journal = s.journalEntries.map((j: LegacySyntharaJournal) => ({
            id: j.id || `journ_${Math.random().toString(36).slice(2, 8)}`,
            title: j.title || 'Запись',
            content: j.content || '',
            mood: typeof j.mood === 'number' ? (j.mood <= 10 ? j.mood * 10 : j.mood) : 50,
            dateISO: j.date || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(s.knowledge) && s.knowledge.length > 0) {
          data.knowledge = s.knowledge.map(sanitizeKnowledge);
        }
        if (Array.isArray(s.scheduleBlocks) && s.scheduleBlocks.length > 0) {
          data.schedule = s.scheduleBlocks.map((sb: LegacySyntharaSchedule) => ({
            id: sb.id || `sb_${Math.random().toString(36).slice(2, 8)}`,
            title: sb.label || 'Событие',
            dateISO: new Date().toISOString().slice(0, 10),
            startTime: sb.time || '09:00',
            durationMin: sb.duration || 60,
            type: (sb.type && ['work', 'personal', 'health', 'social', 'learning', 'rest'].includes(sb.type)) ? (sb.type as ScheduleBlock['type']) : 'personal',
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(s.habits) && s.habits.length > 0) {
          data.habits = s.habits.map((h: LegacySyntharaHabit) => ({
            id: h.id || `habit_${Math.random().toString(36).slice(2, 8)}`,
            title: h.title || 'Привычка',
            category: (h.category && ['social', 'health', 'mind', 'productivity', 'other'].includes(h.category)) ? (h.category as Habit['category']) : 'health',
            completedDates: Array.isArray(h.logs) ? h.logs : [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(s.workoutRecords) && s.workoutRecords.length > 0) {
          data.workouts = s.workoutRecords.map((w: LegacySyntharaWorkout) => ({
            id: w.id || `work_${Math.random().toString(36).slice(2, 8)}`,
            dateISO: w.date || new Date().toISOString().slice(0, 10),
            type: (w.type && ['running', 'swimming', 'gym', 'yoga', 'walking', 'other'].includes(w.type)) ? (w.type as WorkoutRecord['type']) : 'other',
            durationMin: w.duration || 30,
            intensity: (w.intensity && [1, 2, 3, 4, 5].includes(w.intensity)) ? (w.intensity as WorkoutRecord['intensity']) : 3,
            description: w.description || '',
            calories: w.calories || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
      }
    } catch { /* ignore */ }
  }

  // 3. Recover Cyclist performance v2
  const cyclistRaw = localStorage.getItem('cyclist_performance_v2');
  if (cyclistRaw) {
    try {
      const c = JSON.parse(cyclistRaw) as Record<string, unknown> | null | undefined;
      if (c && typeof c === 'object') {
        if (Array.isArray(c.rides) && c.rides.length > 0) {
          const newRides = c.rides.map((r: LegacyCyclistRide) => ({
            id: r.id || `r_${Math.random().toString(36).slice(2, 8)}`,
            dateISO: r.date || new Date().toISOString().slice(0, 10),
            title: r.notes || 'Велопоездка',
            distanceKm: r.distance || 0,
            durationMin: r.duration || 1,
            avgSpeedKmh: r.avgSpeed || 0,
            maxSpeedKmh: r.maxSpeed || 0,
            elevationGainM: r.elevation || 0,
            avgPowerW: null,
            avgHrBpm: null,
            description: '',
            routeId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          const existingIds = new Set(data.rides.map(r => r.id));
          newRides.forEach((r: RideRecord) => {
            if (!existingIds.has(r.id)) {
              data.rides.push(r);
            }
          });
        }
        if (Array.isArray(c.routes) && c.routes.length > 0) {
          data.routes = c.routes.map((rt: LegacyCyclistRoute) => ({
            id: rt.id || `rt_${Math.random().toString(36).slice(2, 8)}`,
            name: rt.name || 'Маршрут',
            distanceKm: rt.distance || 10,
            elevationGainM: rt.elevation || 0,
            difficulty: 'medium',
            waypoints: [],
            isCompleted: !!rt.completed,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(c.maintenance) && c.maintenance.length > 0) {
          data.maintenance = c.maintenance.map((m: LegacyCyclistMaint) => ({
            id: m.id || `maint_${Math.random().toString(36).slice(2, 8)}`,
            bikePart: m.description ? m.description.split(' ')[0] : 'Деталь',
            type: (m.type && ['inspection', 'cleaning', 'service', 'repair', 'replace', 'upgrade'].includes(m.type)) ? (m.type as MaintenanceRecord['type']) : 'service',
            description: m.description || '',
            cost: m.cost || 0,
            dateISO: m.date || new Date().toISOString().slice(0, 10),
            isDone: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        }
        if (Array.isArray(c.gallery) && c.gallery.length > 0) {
          data.galleryNotes = c.gallery.map((g: LegacyCyclistGallery) => ({
            id: g.id || `gall_${Math.random().toString(36).slice(2, 8)}`,
            title: g.title || 'Фото-заметка',
            content: g.content || '',
            color: 'blue',
            tags: [],
            isPinned: !!g.pinned,
            rideId: null,
            createdAt: g.date ? new Date(g.date).toISOString() : new Date().toISOString(),
            updatedAt: g.date ? new Date(g.date).toISOString() : new Date().toISOString(),
          }));
        }
      }
    } catch { /* ignore */ }
  }

  const financeTxs = localStorage.getItem('finance_data');
  if (financeTxs) {
    try {
      const parsed = JSON.parse(financeTxs);
      if (Array.isArray(parsed) && parsed.length > 0) {
        data.transactions = parsed.map((tx: LegacyFinanceTx) => ({
          id: String(tx.id || `tx_${Math.random().toString(36).slice(2, 8)}`),
          type: tx.type === 'income' ? 'income' : 'expense',
          amount: typeof tx.amount === 'number' ? tx.amount : 0,
          category: tx.category || 'Другое',
          description: tx.text || '',
          dateISO: tx.date || new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch { /* ignore */ }
  }

  const socialPeople = localStorage.getItem('social-architecture-people-v1');
  if (socialPeople) {
    try {
      const parsed = JSON.parse(socialPeople);
      if (Array.isArray(parsed) && parsed.length > 0) {
        data.people = parsed.map(sanitizePerson);
      }
    } catch { /* ignore */ }
  }

  const museumThoughts = localStorage.getItem('museum_thoughts');
  if (museumThoughts) {
    try {
      const parsed = JSON.parse(museumThoughts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        data.thoughts = parsed.map((th: LegacyMuseumThought) => ({
          id: th.id || `thou_${Math.random().toString(36).slice(2, 8)}`,
          content: th.text || '',
          category: th.cat || 'Разное',
          tags: th.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch { /* ignore */ }
  }

  return data;
}

export function migrateData(raw: unknown, fallbackToDefaults = true): AppData {
  let migrated: Record<string, unknown>;

  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) {
    // If no raw V3 data, try to search for legacy keys and merge them
    migrated = recoverLegacyData() as unknown as Record<string, unknown>;
  } else {
    // If we have some raw data, upgrade versions
    const dataObj = raw as Record<string, unknown>;
    const version = dataObj.version || 0;

    if (typeof version === 'number' && version < 3) {
      migrated = { ...dataObj };

      if (Array.isArray(migrated.people)) {
        migrated.people = migrated.people.map(sanitizePerson);
      }

      if (Array.isArray(migrated.tasks)) {
        migrated.tasks = migrated.tasks.map(sanitizeTask);
      }

      migrated.version = 3;
    } else {
      migrated = dataObj;
    }
  }

  // Final sanitization to enforce structure and schema rules
  const sanitized = sanitizeData(migrated);

  // Validate via Zod AppDataSchema
  try {
    const validated = AppDataSchema.parse(sanitized);
    try {
      safeSaveItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (saveErr) {
      console.error('[Migration] Failed to save validated data (possible quota exceeded):', saveErr);
    }
    return validated;
  } catch (err) {
    console.error('[Migration] Critical: Zod schema parsing failed even after sanitization!', err);
    if (!fallbackToDefaults) {
      throw err;
    }
    const def = getDefaultData();
    try {
      safeSaveItem(STORAGE_KEY, JSON.stringify(def));
    } catch (saveErr) {
      console.error('[Migration] Failed to save default fallback data:', saveErr);
    }
    return def;
  }
}
