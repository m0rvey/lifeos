import { Depth, PersonStatus, Archetype } from '../../types';

export const getDepthLabel = (depth: Depth, t: (key: string) => string): string => {
  switch (depth) {
    case Depth.CORE:
      return t('social.depth.core');
    case Depth.INNER:
      return t('social.depth.inner');
    case Depth.SOCIAL:
      return t('social.depth.social');
    case Depth.PERIPHERY:
      return t('social.depth.periphery');
    default:
      return depth;
  }
};

export const getStatusLabel = (status: PersonStatus, t: (key: string) => string): string => {
  switch (status) {
    case PersonStatus.ACTIVE:
      return t('social.status.active');
    case PersonStatus.OCCASIONAL:
      return t('social.status.occasional');
    case PersonStatus.DISTANT:
      return t('social.status.distant');
    case PersonStatus.CONFLICT:
      return t('social.status.conflict');
    case PersonStatus.LOST:
      return t('social.status.lost');
    case PersonStatus.MENTOR:
      return t('social.status.mentor');
    default:
      return status;
  }
};

export const getArchetypeLabel = (archetype: Archetype, t: (key: string) => string): string => {
  switch (archetype) {
    case Archetype.INTELLECTUAL:
      return t('social.archetype.intellectual');
    case Archetype.EMOTIONAL:
      return t('social.archetype.emotional');
    case Archetype.BUSINESS:
      return t('social.archetype.business');
    default:
      return archetype;
  }
};

export const statusPills: Record<PersonStatus, { bg: string; color: string }> = {
  [PersonStatus.ACTIVE]: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  [PersonStatus.OCCASIONAL]: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' },
  [PersonStatus.DISTANT]: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
  [PersonStatus.CONFLICT]: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  [PersonStatus.LOST]: { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b' },
  [PersonStatus.MENTOR]: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
};
