import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode, type Dispatch } from 'react';
import type { AppData } from '../types';
import { loadData, saveDataAsync } from '../storage/engine';
import { getDefaultData } from '../storage/defaults';
import { calculateFatigue } from '../cognitive/helpers';

const MAX_HISTORY = 50;

type ArrayEntities = Extract<
  keyof AppData,
  | 'people' | 'tasks' | 'transactions' | 'reminders'
  | 'rides' | 'routes' | 'maintenance' | 'galleryNotes'
  | 'journal' | 'knowledge' | 'schedule' | 'habits'
  | 'workouts' | 'thoughts'
>;

export type DataAction =
  | { type: 'SET_DATA'; payload: Partial<AppData> }
  | { type: 'RESET' }
  | { type: 'IMPORT'; payload: AppData }
  | { type: 'ADD_ENTITY'; entity: ArrayEntities; payload: unknown }
  | { type: 'UPDATE_ENTITY'; entity: ArrayEntities; id: string; payload: unknown }
  | { type: 'DELETE_ENTITY'; entity: ArrayEntities; id: string }
  | { type: 'UNDO' }
  | { type: 'REDO' };

interface HistoryState {
  past: AppData[];
  present: AppData;
  future: AppData[];
}

function dataReducer(state: HistoryState, action: DataAction): HistoryState {
  const { past, present, future } = state;

  switch (action.type) {
    case 'UNDO': {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      return {
        past: past.slice(0, -1),
        present: { ...previous, fatigue: calculateFatigue(previous) },
        future: [present, ...future],
      };
    }
    case 'REDO': {
      if (future.length === 0) return state;
      const next = future[0];
      return {
        past: [...past, present],
        present: { ...next, fatigue: calculateFatigue(next) },
        future: future.slice(1),
      };
    }
    default: {
      let newPresent = present;
      switch (action.type) {
        case 'SET_DATA':
          newPresent = { ...present, ...action.payload };
          break;
        case 'RESET':
          newPresent = getDefaultData();
          break;
        case 'IMPORT':
          newPresent = action.payload;
          break;
        case 'ADD_ENTITY': {
          const arr = present[action.entity];
          if (Array.isArray(arr)) {
            newPresent = { ...present, [action.entity]: [...arr, action.payload] };
          }
          break;
        }
        case 'UPDATE_ENTITY': {
          const arr = present[action.entity];
          if (Array.isArray(arr)) {
            newPresent = {
              ...present,
              [action.entity]: arr.map(item => {
                if (item && typeof item === 'object' && 'id' in item && item.id === action.id) {
                  return { ...item, ...(action.payload as Record<string, unknown>), updatedAt: new Date().toISOString() };
                }
                return item;
              }),
            };
          }
          break;
        }
        case 'DELETE_ENTITY': {
          const arr = present[action.entity];
          if (Array.isArray(arr)) {
            newPresent = {
              ...present,
              [action.entity]: arr.filter(item => {
                if (item && typeof item === 'object' && 'id' in item) {
                  return item.id !== action.id;
                }
                return true;
              }),
            };
          }
          break;
        }
      }

      newPresent = { ...newPresent, fatigue: calculateFatigue(newPresent) };

      return {
        past: [...past.slice(-MAX_HISTORY + 1), present],
        present: newPresent,
        future: [],
      };
    }
  }
}

const DataStateContext = createContext<AppData | null>(null);
const DataDispatchContext = createContext<Dispatch<DataAction> | null>(null);
const UndoContext = createContext<{ canUndo: boolean; canRedo: boolean } | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(dataReducer, null, () => {
    const loaded = loadData();
    return {
      past: [],
      present: { ...loaded, fatigue: calculateFatigue(loaded) },
      future: [],
    } as HistoryState;
  });

  const prevDataRef = useRef(history.present);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (prevDataRef.current !== history.present) {
      timer = setTimeout(async () => {
        await saveDataAsync(history.present);
        prevDataRef.current = history.present;
      }, 2500);
    }

    const handleBeforeUnload = () => {
      if (prevDataRef.current !== history.present) {
        saveDataAsync(history.present);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [history.present]);

  return (
    <DataStateContext.Provider value={history.present}>
      <DataDispatchContext.Provider value={dispatch}>
        <UndoContext.Provider value={{ canUndo: history.past.length > 0, canRedo: history.future.length > 0 }}>
          {children}
        </UndoContext.Provider>
      </DataDispatchContext.Provider>
    </DataStateContext.Provider>
  );
}

export function useData() {
  const data = useContext(DataStateContext);
  const dispatch = useContext(DataDispatchContext);
  if (!data || !dispatch) {
    throw new Error('useData must be used within DataProvider');
  }
  return { data, dispatch };
}

export function useUndoRedo() {
  const ctx = useContext(UndoContext);
  const dispatch = useContext(DataDispatchContext);
  if (!ctx || !dispatch) throw new Error('useUndoRedo must be used within DataProvider');
  return {
    canUndo: ctx.canUndo,
    canRedo: ctx.canRedo,
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
  };
}
