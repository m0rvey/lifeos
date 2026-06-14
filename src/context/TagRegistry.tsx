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

function renameIn(items: EntityArray, oldName: string, newName: string): unknown[] {
  return items.map(item => {
    if (item.tags?.includes(oldName)) {
      return { ...item, tags: item.tags.map(t => t === oldName ? newName : t) };
    }
    return item;
  });
}

function removeFrom(items: EntityArray, tag: string): unknown[] {
  return items.map(item => {
    if (item.tags?.includes(tag)) {
      return { ...item, tags: item.tags.filter(t => t !== tag) };
    }
    return item;
  });
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
    dispatch({
      type: 'SET_DATA',
      payload: {
        people: renameIn(data.people, oldName, newName) as typeof data.people,
        tasks: renameIn(data.tasks, oldName, newName) as typeof data.tasks,
        galleryNotes: renameIn(data.galleryNotes, oldName, newName) as typeof data.galleryNotes,
        journal: renameIn(data.journal, oldName, newName) as typeof data.journal,
        knowledge: renameIn(data.knowledge, oldName, newName) as typeof data.knowledge,
        schedule: renameIn(data.schedule, oldName, newName) as typeof data.schedule,
        thoughts: renameIn(data.thoughts, oldName, newName) as typeof data.thoughts,
      },
    });
  };

  const deleteTag = (tag: string) => {
    dispatch({
      type: 'SET_DATA',
      payload: {
        people: removeFrom(data.people, tag) as typeof data.people,
        tasks: removeFrom(data.tasks, tag) as typeof data.tasks,
        galleryNotes: removeFrom(data.galleryNotes, tag) as typeof data.galleryNotes,
        journal: removeFrom(data.journal, tag) as typeof data.journal,
        knowledge: removeFrom(data.knowledge, tag) as typeof data.knowledge,
        schedule: removeFrom(data.schedule, tag) as typeof data.schedule,
        thoughts: removeFrom(data.thoughts, tag) as typeof data.thoughts,
      },
    });
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
