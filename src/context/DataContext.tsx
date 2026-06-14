import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { AppData } from '../types';
import { loadData, loadDataAsync, saveData, saveDataAsync } from '../storage/engine';
import { getDefaultData } from '../storage/defaults';
import { calculateFatigue } from '../cognitive/helpers';

const MAX_HISTORY = 50;

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

export type DataAction =
  | { type: 'SET_DATA'; payload: Partial<AppData> }
  | { type: 'RESET' }
  | { type: 'IMPORT'; payload: AppData }
  | { type: 'ADD_ENTITY'; entity: ArrayEntities; payload: unknown }
  | { type: 'UPDATE_ENTITY'; entity: ArrayEntities; id: string; payload: unknown }
  | { type: 'DELETE_ENTITY'; entity: ArrayEntities; id: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'INITIALIZE'; payload: AppData };

export type HistoryAction =
  | { type: 'REPLACE_STATE'; previousState: AppData; newState: AppData }
  | { type: 'UPDATE_FIELDS'; previousFields: Partial<AppData>; newFields: Partial<AppData> }
  | { type: 'ADD_ENTITY'; entity: ArrayEntities; payload: unknown }
  | {
      type: 'UPDATE_ENTITY';
      entity: ArrayEntities;
      id: string;
      previousState: unknown;
      newState: unknown;
    }
  | { type: 'DELETE_ENTITY'; entity: ArrayEntities; id: string; previousState: unknown };

interface HistoryState {
  past: HistoryAction[];
  present: AppData;
  future: HistoryAction[];
}

export function inverseAction(action: HistoryAction): HistoryAction {
  switch (action.type) {
    case 'REPLACE_STATE':
      return {
        type: 'REPLACE_STATE',
        previousState: action.newState,
        newState: action.previousState,
      };
    case 'UPDATE_FIELDS':
      return {
        type: 'UPDATE_FIELDS',
        previousFields: action.newFields,
        newFields: action.previousFields,
      };
    case 'ADD_ENTITY':
      return {
        type: 'DELETE_ENTITY',
        entity: action.entity,
        id: (action.payload as { id: string }).id,
        previousState: action.payload,
      };
    case 'DELETE_ENTITY':
      return {
        type: 'ADD_ENTITY',
        entity: action.entity,
        payload: action.previousState,
      };
    case 'UPDATE_ENTITY':
      return {
        type: 'UPDATE_ENTITY',
        entity: action.entity,
        id: action.id,
        previousState: action.newState,
        newState: action.previousState,
      };
  }
}

export function applyHistoryAction(state: AppData, action: HistoryAction): AppData {
  switch (action.type) {
    case 'REPLACE_STATE':
      return action.newState;
    case 'UPDATE_FIELDS':
      return { ...state, ...action.newFields };
    case 'ADD_ENTITY': {
      const arr = state[action.entity];
      if (Array.isArray(arr)) {
        return { ...state, [action.entity]: [...arr, action.payload] };
      }
      return state;
    }
    case 'UPDATE_ENTITY': {
      const arr = state[action.entity];
      if (Array.isArray(arr)) {
        return {
          ...state,
          [action.entity]: arr.map((item) => {
            if (item && typeof item === 'object' && 'id' in item && item.id === action.id) {
              return action.newState;
            }
            return item;
          }),
        };
      }
      return state;
    }
    case 'DELETE_ENTITY': {
      const arr = state[action.entity];
      if (Array.isArray(arr)) {
        return {
          ...state,
          [action.entity]: arr.filter((item) => {
            if (item && typeof item === 'object' && 'id' in item) {
              return item.id !== action.id;
            }
            return true;
          }),
        };
      }
      return state;
    }
  }
}

function dataReducer(state: HistoryState, action: DataAction): HistoryState {
  const { past, present, future } = state;

  switch (action.type) {
    case 'INITIALIZE': {
      return {
        past: [],
        present: { ...action.payload, fatigue: calculateFatigue(action.payload) },
        future: [],
      };
    }
    case 'UNDO': {
      if (past.length === 0) return state;
      const act = past[past.length - 1];
      const inv = inverseAction(act);
      let newPresent = applyHistoryAction(present, inv);
      newPresent = { ...newPresent, fatigue: calculateFatigue(newPresent) };
      return {
        past: past.slice(0, -1),
        present: newPresent,
        future: [act, ...future],
      };
    }
    case 'REDO': {
      if (future.length === 0) return state;
      const act = future[0];
      let newPresent = applyHistoryAction(present, act);
      newPresent = { ...newPresent, fatigue: calculateFatigue(newPresent) };
      return {
        past: [...past, act],
        present: newPresent,
        future: future.slice(1),
      };
    }
    default: {
      let historyAction: HistoryAction | null = null;
      let newPresent = present;

      switch (action.type) {
        case 'SET_DATA': {
          const previousFields: Partial<AppData> = {};
          const newFields: Partial<AppData> = {};
          for (const key in action.payload) {
            const k = key as keyof AppData;
            previousFields[k] = present[k] as never;
            newFields[k] = action.payload[k] as never;
          }
          newPresent = { ...present, ...action.payload };
          historyAction = { type: 'UPDATE_FIELDS', previousFields, newFields };
          break;
        }
        case 'RESET': {
          const next = getDefaultData();
          newPresent = next;
          historyAction = { type: 'REPLACE_STATE', previousState: present, newState: next };
          break;
        }
        case 'IMPORT': {
          newPresent = action.payload;
          historyAction = {
            type: 'REPLACE_STATE',
            previousState: present,
            newState: action.payload,
          };
          break;
        }
        case 'ADD_ENTITY': {
          const arr = present[action.entity];
          if (Array.isArray(arr)) {
            newPresent = { ...present, [action.entity]: [...arr, action.payload] };
            historyAction = { type: 'ADD_ENTITY', entity: action.entity, payload: action.payload };
          }
          break;
        }
        case 'UPDATE_ENTITY': {
          const arr = present[action.entity];
          if (Array.isArray(arr)) {
            const oldItem = arr.find(
              (item) => item && typeof item === 'object' && 'id' in item && item.id === action.id
            );
            if (oldItem) {
              const updatedItem = {
                ...oldItem,
                ...(action.payload as Record<string, unknown>),
                updatedAt: new Date().toISOString(),
              };
              newPresent = {
                ...present,
                [action.entity]: arr.map((item) => {
                  if (item && typeof item === 'object' && 'id' in item && item.id === action.id) {
                    return updatedItem;
                  }
                  return item;
                }),
              };
              historyAction = {
                type: 'UPDATE_ENTITY',
                entity: action.entity,
                id: action.id,
                previousState: oldItem,
                newState: updatedItem,
              };
            }
          }
          break;
        }
        case 'DELETE_ENTITY': {
          const arr = present[action.entity];
          if (Array.isArray(arr)) {
            const oldItem = arr.find(
              (item) => item && typeof item === 'object' && 'id' in item && item.id === action.id
            );
            if (oldItem) {
              newPresent = {
                ...present,
                [action.entity]: arr.filter((item) => {
                  if (item && typeof item === 'object' && 'id' in item) {
                    return item.id !== action.id;
                  }
                  return true;
                }),
              };
              historyAction = {
                type: 'DELETE_ENTITY',
                entity: action.entity,
                id: action.id,
                previousState: oldItem,
              };
            }
          }
          break;
        }
      }

      newPresent = { ...newPresent, fatigue: calculateFatigue(newPresent) };

      return {
        past: historyAction ? [...past.slice(-MAX_HISTORY + 1), historyAction] : past,
        present: newPresent,
        future: [],
      };
    }
  }
}

export interface DataStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => AppData;
  update: () => void;
}

const StoreContext = createContext<DataStore | null>(null);
const DataStateContext = createContext<AppData | null>(null);
export const DataDispatchContext = createContext<Dispatch<DataAction> | null>(null);
const UndoContext = createContext<{ canUndo: boolean; canRedo: boolean } | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const isTesting =
    typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || !!process.env.VITEST);

  const [history, dispatch] = useReducer(dataReducer, null, () => {
    const loaded = isTesting ? loadData() : getDefaultData();
    return {
      past: [],
      present: loaded,
      future: [],
    } as HistoryState;
  });

  const [isInitialized, setIsInitialized] = useState(isTesting);

  useEffect(() => {
    if (isTesting) return;
    let active = true;
    const hydrate = async () => {
      try {
        const loaded = await loadDataAsync();
        if (active) {
          dispatch({ type: 'INITIALIZE', payload: loaded });
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('[DataProvider] Hydration failed:', err);
        if (active) {
          setIsInitialized(true);
        }
      }
    };
    hydrate();
    return () => {
      active = false;
    };
  }, [isTesting]);

  const currentDataRef = useRef(history.present);

  const listenersRef = useRef(new Set<() => void>());

  const store = useMemo<DataStore>(() => {
    return {
      subscribe(listener: () => void) {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getSnapshot() {
        return currentDataRef.current;
      },
      update() {
        listenersRef.current.forEach((l) => l());
      },
    };
  }, []);

  const prevDataRef = useRef(history.present);

  useEffect(() => {
    currentDataRef.current = history.present;
    store.update();
  }, [history.present, store]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isInitialized && prevDataRef.current !== history.present) {
      timer = setTimeout(async () => {
        await saveDataAsync(history.present);
        prevDataRef.current = history.present;
      }, 2500);
    }

    const handleBeforeUnload = () => {
      if (isInitialized && prevDataRef.current !== history.present) {
        saveData(history.present);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [history.present, isInitialized]);

  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <StoreContext.Provider value={store}>
      <DataStateContext.Provider value={history.present}>
        <DataDispatchContext.Provider value={dispatch}>
          <UndoContext.Provider
            value={{ canUndo: history.past.length > 0, canRedo: history.future.length > 0 }}
          >
            {children}
          </UndoContext.Provider>
        </DataDispatchContext.Provider>
      </DataStateContext.Provider>
    </StoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useDataStore must be used within DataProvider');
  }
  return ctx;
}

export function useData() {
  const data = useContext(DataStateContext);
  const dispatch = useContext(DataDispatchContext);
  if (!data || !dispatch) {
    throw new Error('useData must be used within DataProvider');
  }
  return { data, dispatch };
}

export function useDispatch() {
  const dispatch = useContext(DataDispatchContext);
  if (!dispatch) {
    throw new Error('useDispatch must be used within DataProvider');
  }
  return dispatch;
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
