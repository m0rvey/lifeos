import { useState, useEffect, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';

export interface SearchResult {
  id: string;
  type: 'journal' | 'knowledge' | 'thought' | 'person' | 'task';
  title: string;
  preview: string;
  module: string;
  url: string;
}

function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let matchFound = false;
  for (const word of words) {
    if (text.toLowerCase().includes(word)) {
      matchFound = true;
      break;
    }
  }
  if (!matchFound) return '';
  const lower = text.toLowerCase();
  const idx = lower.indexOf(words[0]);
  if (idx < 0) return text;
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + 80);
  const preview =
    (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
  return preview;
}

function search(query: string, data: ReturnType<typeof useData>['data']): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const entry of data.journal) {
    if (results.length >= 20) break;
    if (entry.title.toLowerCase().includes(q) || entry.content.toLowerCase().includes(q)) {
      results.push({
        id: entry.id,
        type: 'journal',
        title: entry.title,
        preview: highlightMatches(entry.content, q),
        module: 'reflect',
        url: `/reflect/journal/${entry.id}`,
      });
    }
  }

  for (const item of data.knowledge) {
    if (results.length >= 20) break;
    if (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      results.push({
        id: item.id,
        type: 'knowledge',
        title: item.title,
        preview: highlightMatches(item.content, q),
        module: 'reflect',
        url: `/reflect/knowledge`,
      });
    }
  }

  for (const thought of data.thoughts) {
    if (results.length >= 20) break;
    if (
      thought.content.toLowerCase().includes(q) ||
      thought.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      results.push({
        id: thought.id,
        type: 'thought',
        title: thought.content.slice(0, 60),
        preview: highlightMatches(thought.content, q),
        module: 'reflect',
        url: `/reflect/thoughts`,
      });
    }
  }

  for (const person of data.people) {
    if (results.length >= 20) break;
    if (person.name.toLowerCase().includes(q) || person.notes.toLowerCase().includes(q)) {
      results.push({
        id: person.id,
        type: 'person',
        title: person.name,
        preview: highlightMatches(person.notes || person.reflection, q) || person.depth,
        module: 'social',
        url: `/social/${person.id}`,
      });
    }
  }

  for (const task of data.tasks) {
    if (results.length >= 20) break;
    if (
      task.title.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q))
    ) {
      results.push({
        id: task.id,
        type: 'task',
        title: task.title,
        preview:
          highlightMatches(task.description || '', q) ||
          (task.isCompleted ? 'Completed' : 'Pending'),
        module: 'hub',
        url: '/tasks',
      });
    }
  }

  return results;
}

export function useGlobalSearch(query: string): SearchResult[] {
  const { data } = useData();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }
    return search(debouncedQuery, data);
  }, [debouncedQuery, data]);

  return results;
}
