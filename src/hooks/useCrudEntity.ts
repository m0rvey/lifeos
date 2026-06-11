import { useState, useCallback } from 'react';

interface UseCrudEntityReturn<T> {
  editing: T | null;
  deleting: T | null;
  openAdd: () => void;
  openEdit: (item: T) => void;
  openDelete: (item: T) => void;
  closeAll: () => void;
}

export function useCrudEntity<T>(): UseCrudEntityReturn<T> {
  const [editing, setEditing] = useState<T | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);

  const openAdd = useCallback(() => setEditing(null), []);
  const openEdit = useCallback((item: T) => setEditing(item), []);
  const openDelete = useCallback((item: T) => setDeleting(item), []);
  const closeAll = useCallback(() => {
    setEditing(null);
    setDeleting(null);
  }, []);

  return { editing, deleting, openAdd, openEdit, openDelete, closeAll };
}
