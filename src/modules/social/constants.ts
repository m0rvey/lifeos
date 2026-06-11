import { Depth, PersonStatus, Archetype } from '../../types';

export const depthLabels: Record<Depth, string> = {
  [Depth.CORE]: 'Ядро',
  [Depth.INNER]: 'Ближний круг',
  [Depth.SOCIAL]: 'Социальный слой',
  [Depth.PERIPHERY]: 'Периферия',
};

export const statusLabels: Record<PersonStatus, string> = {
  [PersonStatus.ACTIVE]: 'Активен',
  [PersonStatus.OCCASIONAL]: 'Покой',
  [PersonStatus.DISTANT]: 'На расстоянии',
  [PersonStatus.CONFLICT]: 'В конфликте',
  [PersonStatus.LOST]: 'Не общаемся',
  [PersonStatus.MENTOR]: 'Наставник',
};

export const statusPills: Record<PersonStatus, { bg: string; color: string }> = {
  [PersonStatus.ACTIVE]: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  [PersonStatus.OCCASIONAL]: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
  [PersonStatus.DISTANT]: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  [PersonStatus.CONFLICT]: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  [PersonStatus.LOST]: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' },
  [PersonStatus.MENTOR]: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
};

export const archetypeLabels: Record<Archetype, string> = {
  [Archetype.INTELLECTUAL]: 'Интеллектуальный',
  [Archetype.EMOTIONAL]: 'Эмоциональный',
  [Archetype.BUSINESS]: 'Деловой',
};
