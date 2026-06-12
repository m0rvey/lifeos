/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode, type Dispatch } from 'react';
import type { AppData } from '../types';
import { loadData, saveData } from '../storage/engine';
import { getDefaultData } from '../storage/defaults';
import { calculateFatigue } from '../cognitive/helpers';

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
  | { type: 'DELETE_ENTITY'; entity: ArrayEntities; id: string };

function dataReducer(state: AppData, action: DataAction): AppData {
  let newState = state;
  switch (action.type) {
    case 'SET_DATA':
      newState = { ...state, ...action.payload };
      break;
    case 'RESET':
      newState = getDefaultData();
      break;
    case 'IMPORT':
      newState = action.payload;
      break;
    case 'ADD_ENTITY': {
      const arr = state[action.entity];
      if (Array.isArray(arr)) {
        newState = { ...state, [action.entity]: [...arr, action.payload] };
      }
      break;
    }
    case 'UPDATE_ENTITY': {
      const arr = state[action.entity];
      if (Array.isArray(arr)) {
        newState = {
          ...state,
          [action.entity]: arr.map(item => {
            if (item && typeof item === 'object' && 'id' in item && item.id === action.id) {
              return {
                ...item,
                ...(action.payload as Record<string, unknown>),
                updatedAt: new Date().toISOString(),
              };
            }
            return item;
          }),
        };
      }
      break;
    }
    case 'DELETE_ENTITY': {
      const arr = state[action.entity];
      if (Array.isArray(arr)) {
        newState = {
          ...state,
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
    default:
      return state;
  }

  return {
    ...newState,
    fatigue: calculateFatigue(newState),
  };
}

const DataStateContext = createContext<AppData | null>(null);
const DataDispatchContext = createContext<Dispatch<DataAction> | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(dataReducer, null, () => {
    const loaded = loadData();
    return {
      ...loaded,
      fatigue: calculateFatigue(loaded),
    };
  });
  const prevDataRef = useRef(data);

  // Auto-save on every change, debounced 2.5s. Also handle page unload.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (prevDataRef.current !== data) {
      timer = setTimeout(() => {
        saveData(data);
        prevDataRef.current = data;
      }, 2500);
    }
    
    const handleBeforeUnload = () => {
      if (prevDataRef.current !== data) {
        saveData(data);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data]);

  return (
    <DataStateContext.Provider value={data}>
      <DataDispatchContext.Provider value={dispatch}>
        {children}
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
