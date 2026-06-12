import { z } from 'zod';
import { Depth, Archetype, PersonStatus } from '../types';

export const DepthSchema = z.nativeEnum(Depth);
export const ArchetypeSchema = z.nativeEnum(Archetype);
export const PersonStatusSchema = z.nativeEnum(PersonStatus);

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Имя обязательно'),
  depth: DepthSchema,
  archetype: ArchetypeSchema,
  status: PersonStatusSchema,
  energy: z.number().min(0).max(100),
  resonance: z.number().min(0).max(100),
  reciprocity: z.number().min(0).max(100),
  volatility: z.number().min(0).max(100),
  lastContactISO: z.string(),
  reflection: z.string(),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Название обязательно'),
  description: z.string(),
  emotion: z.number().min(0).max(100),
  urgency: z.number().min(0).max(100),
  deadlineISO: z.string().nullable(),
  isCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Сумма должна быть больше нуля'),
  category: z.string().min(1, 'Категория обязательна'),
  description: z.string(),
  dateISO: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BillReminderSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Название обязательно'),
  amount: z.number().positive('Сумма должна быть больше нуля'),
  dueDateISO: z.string(),
  isPaid: z.boolean(),
  category: z.string().min(1, 'Категория обязательна'),
  remindDaysBefore: z.number().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const RideRecordSchema = z.object({
  id: z.string(),
  dateISO: z.string(),
  title: z.string().min(1, 'Название обязательно'),
  distanceKm: z.number().nonnegative(),
  durationMin: z.number().positive(),
  avgSpeedKmh: z.number().nonnegative(),
  maxSpeedKmh: z.number().nonnegative(),
  elevationGainM: z.number().nonnegative(),
  avgPowerW: z.number().nullable(),
  avgHrBpm: z.number().nullable(),
  description: z.string(),
  routeId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CycleRouteSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Название маршрута обязательно'),
  distanceKm: z.number().positive(),
  elevationGainM: z.number().nonnegative(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'extreme']),
  waypoints: z.array(z.string()),
  isCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MaintenanceRecordSchema = z.object({
  id: z.string(),
  bikePart: z.string().min(1, 'Деталь обязательна'),
  type: z.enum(['repair', 'replace', 'service', 'upgrade', 'cleaning', 'inspection']),
  description: z.string(),
  cost: z.number().nonnegative(),
  dateISO: z.string(),
  isDone: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GalleryNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Заголовок обязателен'),
  content: z.string(),
  color: z.enum(['blue', 'green', 'orange', 'pink', 'purple']),
  tags: z.array(z.string()),
  isPinned: z.boolean(),
  rideId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const JournalEntrySchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Заголовок обязателен'),
  content: z.string(),
  mood: z.number().min(0).max(100),
  dateISO: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const KnowledgeItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Заголовок обязателен'),
  content: z.string(),
  category: z.string().min(1, 'Категория обязательна'),
  source: z.string(),
  url: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ScheduleBlockSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Название события обязательно'),
  dateISO: z.string(),
  startTime: z.string(), // "HH:MM"
  durationMin: z.number().positive(),
  type: z.enum(['work', 'personal', 'health', 'social', 'learning', 'rest']),
  isCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const HabitSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Название привычки обязательно'),
  category: z.enum(['social', 'health', 'mind', 'productivity', 'other']),
  completedDates: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const WorkoutRecordSchema = z.object({
  id: z.string(),
  dateISO: z.string(),
  type: z.enum(['running', 'swimming', 'gym', 'yoga', 'walking', 'other']),
  durationMin: z.number().positive(),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  description: z.string(),
  calories: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ThoughtSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Текст мысли обязателен'),
  category: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GraphWeightsSchema = z.object({
  energy: z.number().min(0).max(1),
  resonance: z.number().min(0).max(1),
  reciprocity: z.number().min(0).max(1),
  volatility: z.number().min(0).max(1),
  recency: z.number().min(0).max(1),
});

export const AppSettingsSchema = z.object({
  theme: z.enum(['mindveyz', 'cyclist', 'reflect', 'slate']),
  themeMode: z.enum(['manual', 'adaptive', 'system']),
  accentColor: z.enum(['purple', 'orange', 'green', 'blue', 'rose']),
  fontSizeScale: z.number().min(0.8).max(1.2),
  isAdaptive: z.boolean(),
  graphSensitivity: z.number().min(1).max(10),
  graphWeights: GraphWeightsSchema,
  weekStartDay: z.union([z.literal(0), z.literal(1)]),
});

export const AppDataSchema = z.object({
  version: z.literal(3),
  settings: AppSettingsSchema,
  people: z.array(PersonSchema),
  tasks: z.array(TaskSchema),
  transactions: z.array(TransactionSchema),
  reminders: z.array(BillReminderSchema),
  rides: z.array(RideRecordSchema),
  routes: z.array(CycleRouteSchema),
  maintenance: z.array(MaintenanceRecordSchema),
  galleryNotes: z.array(GalleryNoteSchema),
  journal: z.array(JournalEntrySchema),
  knowledge: z.array(KnowledgeItemSchema),
  schedule: z.array(ScheduleBlockSchema),
  habits: z.array(HabitSchema),
  workouts: z.array(WorkoutRecordSchema),
  thoughts: z.array(ThoughtSchema),
  fatigue: z.number().min(0).max(100),
});
