import { openDB, type IDBPDatabase } from 'idb';
import type { AppData } from '../types';
import { migrateData } from './migrations';
import { getDefaultData } from './defaults';

const DB_NAME = 'lifeos';
const DB_VERSION = 2;
const KEY = 'lifeos_platform_v1';

let dbPromise: Promise<IDBPDatabase> | null = null;
let lastSavedData: AppData | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Keep old store 'appData' if it existed, but create the new modular stores
        const stores = [
          'settings', 'people', 'tasks', 'transactions', 'reminders',
          'rides', 'routes', 'maintenance', 'galleryNotes', 'journal',
          'knowledge', 'schedule', 'habits', 'workouts', 'thoughts', 'metadata'
        ];
        for (const storeName of stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        }
      },
    });
  }
  return dbPromise;
}

export function clearCacheIDB(): void {
  lastSavedData = null;
}

async function saveAllToNewStores(db: IDBPDatabase, data: AppData): Promise<void> {
  const stores = [
    'settings', 'people', 'tasks', 'transactions', 'reminders',
    'rides', 'routes', 'maintenance', 'galleryNotes', 'journal',
    'knowledge', 'schedule', 'habits', 'workouts', 'thoughts', 'metadata'
  ];
  const tx = db.transaction(stores, 'readwrite');

  await Promise.all([
    tx.objectStore('settings').put(data.settings, 'value'),
    tx.objectStore('people').put(data.people, 'value'),
    tx.objectStore('tasks').put(data.tasks, 'value'),
    tx.objectStore('transactions').put(data.transactions, 'value'),
    tx.objectStore('reminders').put(data.reminders, 'value'),
    tx.objectStore('rides').put(data.rides, 'value'),
    tx.objectStore('routes').put(data.routes, 'value'),
    tx.objectStore('maintenance').put(data.maintenance, 'value'),
    tx.objectStore('galleryNotes').put(data.galleryNotes, 'value'),
    tx.objectStore('journal').put(data.journal, 'value'),
    tx.objectStore('knowledge').put(data.knowledge, 'value'),
    tx.objectStore('schedule').put(data.schedule, 'value'),
    tx.objectStore('habits').put(data.habits, 'value'),
    tx.objectStore('workouts').put(data.workouts, 'value'),
    tx.objectStore('thoughts').put(data.thoughts, 'value'),
    tx.objectStore('metadata').put(data.version, 'version'),
    tx.objectStore('metadata').put(data.fatigue, 'fatigue'),
    tx.done,
  ]);
}

export async function loadDataIDB(): Promise<AppData> {
  try {
    const db = await getDB();
    
    // Check if migrated/initialized with version in metadata
    let hasNewStoresData = false;
    if (db.objectStoreNames.contains('metadata')) {
      const version = await db.get('metadata', 'version');
      if (version !== undefined) {
        hasNewStoresData = true;
      }
    }

    if (hasNewStoresData) {
      const [
        settings, people, tasks, transactions, reminders,
        rides, routes, maintenance, galleryNotes, journal,
        knowledge, schedule, habits, workouts, thoughts, fatigue, version
      ] = await Promise.all([
        db.get('settings', 'value'),
        db.get('people', 'value'),
        db.get('tasks', 'value'),
        db.get('transactions', 'value'),
        db.get('reminders', 'value'),
        db.get('rides', 'value'),
        db.get('routes', 'value'),
        db.get('maintenance', 'value'),
        db.get('galleryNotes', 'value'),
        db.get('journal', 'value'),
        db.get('knowledge', 'value'),
        db.get('schedule', 'value'),
        db.get('habits', 'value'),
        db.get('workouts', 'value'),
        db.get('thoughts', 'value'),
        db.get('metadata', 'fatigue'),
        db.get('metadata', 'version'),
      ]);

      const data: AppData = {
        version: (version || 3) as 3,
        settings: settings || getDefaultData().settings,
        people: people || [],
        tasks: tasks || [],
        transactions: transactions || [],
        reminders: reminders || [],
        rides: rides || [],
        routes: routes || [],
        maintenance: maintenance || [],
        galleryNotes: galleryNotes || [],
        journal: journal || [],
        knowledge: knowledge || [],
        schedule: schedule || [],
        habits: habits || [],
        workouts: workouts || [],
        thoughts: thoughts || [],
        fatigue: fatigue !== undefined ? fatigue : 0,
      };

      lastSavedData = data;
      return migrateData(data);
    }

    // Fallback migration from old 'appData' store if it exists
    if (db.objectStoreNames.contains('appData')) {
      const raw = await db.get('appData', KEY);
      if (raw) {
        const migrated = migrateData(raw);
        await saveAllToNewStores(db, migrated);
        lastSavedData = migrated;
        return migrated;
      }
    }

    const defaultDataVal = migrateData(null);
    await saveAllToNewStores(db, defaultDataVal);
    lastSavedData = defaultDataVal;
    return defaultDataVal;
  } catch (err) {
    console.error('[IDB] Error loading data, falling back to defaults:', err);
    return getDefaultData();
  }
}

export async function saveDataIDB(data: AppData): Promise<void> {
  try {
    const db = await getDB();
    const cached = lastSavedData;

    if (!cached) {
      await saveAllToNewStores(db, data);
      lastSavedData = data;
      return;
    }

    const storesToUpdate: string[] = [];

    if (data.settings !== cached.settings) storesToUpdate.push('settings');
    if (data.people !== cached.people) storesToUpdate.push('people');
    if (data.tasks !== cached.tasks) storesToUpdate.push('tasks');
    if (data.transactions !== cached.transactions) storesToUpdate.push('transactions');
    if (data.reminders !== cached.reminders) storesToUpdate.push('reminders');
    if (data.rides !== cached.rides) storesToUpdate.push('rides');
    if (data.routes !== cached.routes) storesToUpdate.push('routes');
    if (data.maintenance !== cached.maintenance) storesToUpdate.push('maintenance');
    if (data.galleryNotes !== cached.galleryNotes) storesToUpdate.push('galleryNotes');
    if (data.journal !== cached.journal) storesToUpdate.push('journal');
    if (data.knowledge !== cached.knowledge) storesToUpdate.push('knowledge');
    if (data.schedule !== cached.schedule) storesToUpdate.push('schedule');
    if (data.habits !== cached.habits) storesToUpdate.push('habits');
    if (data.workouts !== cached.workouts) storesToUpdate.push('workouts');
    if (data.thoughts !== cached.thoughts) storesToUpdate.push('thoughts');
    if (data.version !== cached.version || data.fatigue !== cached.fatigue) {
      storesToUpdate.push('metadata');
    }

    if (storesToUpdate.length > 0) {
      const tx = db.transaction(storesToUpdate, 'readwrite');
      const ops: Promise<unknown>[] = [];

      for (const store of storesToUpdate) {
        if (store === 'metadata') {
          ops.push(tx.objectStore('metadata').put(data.version, 'version'));
          ops.push(tx.objectStore('metadata').put(data.fatigue, 'fatigue'));
        } else {
          ops.push(tx.objectStore(store).put(data[store as keyof AppData], 'value'));
        }
      }
      ops.push(tx.done);
      await Promise.all(ops);
    }

    lastSavedData = data;
  } catch (err) {
    console.error('[IDB] Failed to save data:', err);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: err instanceof Error ? err : new Error('Unknown IndexedDB error'),
      }));
    }
  }
}

export async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    const lsRaw = localStorage.getItem(KEY);
    if (!lsRaw) return false;

    const db = await getDB();
    const hasData = await hasIDBData();
    if (hasData) return false;

    const parsed = migrateData(JSON.parse(lsRaw));
    await saveAllToNewStores(db, parsed);
    console.log('[IDB] Migrated data from localStorage to IndexedDB stores');
    return true;
  } catch (err) {
    console.error('[IDB] Migration from localStorage failed:', err);
    return false;
  }
}

export async function hasIDBData(): Promise<boolean> {
  try {
    const db = await getDB();
    if (db.objectStoreNames.contains('metadata')) {
      const version = await db.get('metadata', 'version');
      if (version !== undefined) return true;
    }
    if (db.objectStoreNames.contains('appData')) {
      const existing = await db.get('appData', KEY);
      return !!existing;
    }
    return false;
  } catch {
    return false;
  }
}
