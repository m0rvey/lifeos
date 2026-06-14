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
import { dataReducer, type DataAction, type HistoryState } from './dataHistory';

export interface DataStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => AppData;
  update: () => void;
}

const StoreContext = createContext<DataStore | null>(null);
const DataStateContext = createContext<AppData | null>(null);
const DataDispatchContext = createContext<Dispatch<DataAction> | null>(null);
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
