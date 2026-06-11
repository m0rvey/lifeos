export const Depth = {
  CORE: 'core',
  INNER: 'inner',
  SOCIAL: 'social',
  PERIPHERY: 'periphery',
} as const;
export type Depth = typeof Depth[keyof typeof Depth];

export const Archetype = {
  INTELLECTUAL: 'intellectual',
  EMOTIONAL: 'emotional',
  BUSINESS: 'business',
} as const;
export type Archetype = typeof Archetype[keyof typeof Archetype];

export const PersonStatus = {
  ACTIVE: 'active',
  OCCASIONAL: 'occasional',
  DISTANT: 'distant',
  CONFLICT: 'conflict',
  LOST: 'lost',
  MENTOR: 'mentor',
} as const;
export type PersonStatus = typeof PersonStatus[keyof typeof PersonStatus];

export interface Person {
  id: string;
  name: string;
  depth: Depth;
  archetype: Archetype;
  status: PersonStatus;
  energy: number;        // 0–100
  resonance: number;     // 0–100
  reciprocity: number;   // 0–100
  volatility: number;    // 0–100
  lastContactISO: string; // ISO date (YYYY-MM-DD)
  reflection: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
