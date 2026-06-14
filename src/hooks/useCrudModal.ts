import { useState, useCallback } from 'react';
import { useDispatch } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { useI18n } from '../i18n';
import { type AppData } from '../types';

type ArrayEntities = Extract<
  keyof AppData,
  | 'people'
  | 'tasks'
  | 'transactions'
  | 'reminders'
  | 'rides'
  | 'routes'
  | 'maintenance'
  | 'galleryNotes'
  | 'journal'
  | 'knowledge'
  | 'schedule'
  | 'habits'
  | 'workouts'
  | 'thoughts'
>;

interface UseCrudModalOptions<T> {
  entity: ArrayEntities;
  createDefaults: (entryData?: Partial<T>) => T;
  toastKeys: { created: string; updated: string; deleted: string };
}

export function useCrudModal<T extends { id: string }>(options: UseCrudModalOptions<T>) {
  const dispatch = useDispatch();
  const { addToast } = useApp();
  const { t } = useI18n();

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const openAdd = useCallback(() => {
    setEditingItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setIsOpen(true);
  }, []);

  const openDelete = useCallback((id: string) => {
    setItemToDelete(id);
    setIsDeleteOpen(true);
  }, []);

  const closeAll = useCallback(() => {
    setIsOpen(false);
    setIsDeleteOpen(false);
    setEditingItem(null);
    setItemToDelete(null);
  }, []);

  const handleSave = useCallback(
    (itemData: Partial<T>) => {
      if (editingItem) {
        dispatch({
          type: 'UPDATE_ENTITY',
          entity: options.entity,
          id: editingItem.id,
          payload: itemData,
        });
        addToast(t(options.toastKeys.updated), 'success');
      } else {
        const newItem = options.createDefaults(itemData);
        dispatch({
          type: 'ADD_ENTITY',
          entity: options.entity,
          payload: newItem,
        });
        addToast(t(options.toastKeys.created), 'success');
      }
      setIsOpen(false);
    },
    [editingItem, dispatch, addToast, t, options]
  );

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: options.entity,
        id: itemToDelete,
      });
      addToast(t(options.toastKeys.deleted), 'warning');
      setItemToDelete(null);
    }
    setIsDeleteOpen(false);
  }, [itemToDelete, dispatch, addToast, t, options]);

  return {
    isOpen,
    editingItem,
    isDeleteOpen,
    itemToDelete,
    openAdd,
    openEdit,
    openDelete,
    handleSave,
    confirmDelete,
    closeAll,
    setIsOpen,
    setIsDeleteOpen,
  };
}
