import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useData } from './DataContext';
import type { AppData } from '../types';

interface HasTags { tags?: string[] }
type EntityArray = HasTags[];

function extractAllTags(data: AppData): string[] {
  const set = new Set<string>();
  const collections: EntityArray[] = [
    data.people, data.tasks, data.galleryNotes,
    data.journal, data.knowledge, data.schedule, data.thoughts,
  ];
  for (const items of collections) {
    for (const item of items) {
      item.tags?.forEach(t => set.add(t));
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}


interface TagRegistryValue {
  allTags: string[];
  renameTag: (oldName: string, newName: string) => void;
  deleteTag: (tag: string) => void;
}

const TagRegistryContext = createContext<TagRegistryValue | null>(null);

export function TagRegistryProvider({ children }: { children: ReactNode }) {
  const { data, dispatch } = useData();

  const allTags = useMemo(() => extractAllTags(data), [data]);

  const renameTag = (oldName: string, newName: string) => {
    if (!oldName || !newName || oldName === newName) return;

    const collections = [
      { name: 'people' as const, items: data.people },
      { name: 'tasks' as const, items: data.tasks },
      { name: 'galleryNotes' as const, items: data.galleryNotes },
      { name: 'journal' as const, items: data.journal },
      { name: 'knowledge' as const, items: data.knowledge },
      { name: 'schedule' as const, items: data.schedule },
      { name: 'thoughts' as const, items: data.thoughts },
    ];

    for (const col of collections) {
      for (const item of col.items) {
        if (item.tags?.includes(oldName)) {
          const newTags = item.tags.map(t => t === oldName ? newName : t);
          dispatch({
            type: 'UPDATE_ENTITY',
            entity: col.name,
            id: item.id,
            payload: { tags: newTags }
          });
        }
      }
    }
  };

  const deleteTag = (tag: string) => {
    if (!tag) return;

    const collections = [
      { name: 'people' as const, items: data.people },
      { name: 'tasks' as const, items: data.tasks },
      { name: 'galleryNotes' as const, items: data.galleryNotes },
      { name: 'journal' as const, items: data.journal },
      { name: 'knowledge' as const, items: data.knowledge },
      { name: 'schedule' as const, items: data.schedule },
      { name: 'thoughts' as const, items: data.thoughts },
    ];

    for (const col of collections) {
      for (const item of col.items) {
        if (item.tags?.includes(tag)) {
          const newTags = item.tags.filter(t => t !== tag);
          dispatch({
            type: 'UPDATE_ENTITY',
            entity: col.name,
            id: item.id,
            payload: { tags: newTags }
          });
        }
      }
    }
  };

  return (
    <TagRegistryContext.Provider value={{ allTags, renameTag, deleteTag }}>
      {children}
    </TagRegistryContext.Provider>
  );
}

export function useTagRegistry() {
  const ctx = useContext(TagRegistryContext);
  if (!ctx) throw new Error('useTagRegistry must be used within TagRegistryProvider');
  return ctx;
}
