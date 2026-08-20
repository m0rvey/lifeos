import type { AppData } from '../types';
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

type HistoryAction =
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

export interface HistoryState {
  past: HistoryAction[];
  present: AppData;
  future: HistoryAction[];
}

function inverseAction(action: HistoryAction): HistoryAction {
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
    case 'ADD_ENTITY': {
      const payloadObj = (action.payload && typeof action.payload === 'object' ? action.payload : {}) as Record<string, unknown>;
      const id = typeof payloadObj.id === 'string' && payloadObj.id ? payloadObj.id : '';
      return {
        type: 'DELETE_ENTITY',
        entity: action.entity,
        id,
        previousState: action.payload,
      };
    }
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

function applyHistoryAction(state: AppData, action: HistoryAction): AppData {
  switch (action.type) {
    case 'REPLACE_STATE':
      return action.newState;
    case 'UPDATE_FIELDS':
      return { ...state, ...action.newFields };
    case 'ADD_ENTITY': {
      const arr = state[action.entity];
      if (Array.isArray(arr)) {
        const payloadObj = (action.payload && typeof action.payload === 'object' ? action.payload : {}) as Record<string, unknown>;
        const id = payloadObj.id;
        if (id && arr.some((item) => item && typeof item === 'object' && 'id' in item && item.id === id)) {
          return state;
        }
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

export function dataReducer(state: HistoryState, action: DataAction): HistoryState {
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
            const payloadObj = (action.payload && typeof action.payload === 'object' ? action.payload : {}) as Record<string, unknown>;
            const entityId = typeof payloadObj.id === 'string' && payloadObj.id
              ? payloadObj.id
              : `ent_${Math.random().toString(36).slice(2, 9)}`;
            const sanitizedPayload = { ...payloadObj, id: entityId };
            newPresent = { ...present, [action.entity]: [...arr, sanitizedPayload] };
            historyAction = { type: 'ADD_ENTITY', entity: action.entity, payload: sanitizedPayload };
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
