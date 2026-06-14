import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openDB } from 'idb';
import { clearCacheIDB } from '../storage/idbEngine';

vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

const mockOpenDB = vi.mocked(openDB);

function makeMockDb() {
  const dbStores = new Map<string, Map<string, unknown>>();
  
  const getStoreMap = (storeName: string) => {
    if (!dbStores.has(storeName)) {
      dbStores.set(storeName, new Map());
    }
    return dbStores.get(storeName)!;
  };

  const getFn = vi.fn(async (storeName: string, key: string) => {
    return getStoreMap(storeName).get(key);
  });

  const putFn = vi.fn(async (storeName: string, value: unknown, key: string) => {
    getStoreMap(storeName).set(key, value);
  });

  const transactionFn = vi.fn((_storeNames: string | string[], _mode?: string) => {
    return {
      objectStore: vi.fn((storeName: string) => {
        return {
          put: vi.fn(async (value: unknown, key: string) => {
            getStoreMap(storeName).set(key, value);
          }),
          get: vi.fn(async (key: string) => {
            return getStoreMap(storeName).get(key);
          })
        };
      }),
      done: Promise.resolve()
    };
  });

  return {
    get: getFn,
    put: putFn,
    transaction: transactionFn,
    objectStoreNames: {
      contains: vi.fn((name: string) => name === 'appData' || name === 'metadata')
    },
    createObjectStore: vi.fn(),
  };
}

describe('idbEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCacheIDB();
    vi.resetModules();
  });

  describe('hasIDBData', () => {
    it('returns true when data exists in store', async () => {
      const mockDb = makeMockDb();
      await mockDb.put('metadata', 3, 'version');
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { hasIDBData } = await import('../storage/idbEngine');
      const result = await hasIDBData();
      expect(result).toBe(true);
    });

    it('returns false when store is empty', async () => {
      const mockDb = makeMockDb();
      mockDb.objectStoreNames.contains = vi.fn((name: string) => name === 'appData');
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { hasIDBData } = await import('../storage/idbEngine');
      const result = await hasIDBData();
      expect(result).toBe(false);
    });

    it('returns false on error', async () => {
      mockOpenDB.mockRejectedValue(new Error('IDB unavailable') as never);

      const { hasIDBData } = await import('../storage/idbEngine');
      const result = await hasIDBData();
      expect(result).toBe(false);
    });
  });

  describe('saveDataIDB', () => {
    it('saves data to stores', async () => {
      const mockDb = makeMockDb();
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { saveDataIDB } = await import('../storage/idbEngine');
      const data = { version: 3, tasks: [], settings: {} };
      // @ts-expect-error: Incomplete mock data for test
      await saveDataIDB(data);

      // Verify that it saved settings and metadata
      const versionSaved = await mockDb.get('metadata', 'version');
      expect(versionSaved).toBe(3);
    });

    it('dispatches storage-error on failure', async () => {
      const dispatchSpy = vi.fn();
      window.addEventListener('storage-error', dispatchSpy);
      mockOpenDB.mockRejectedValue(new Error('write failed') as never);

      const { saveDataIDB } = await import('../storage/idbEngine');
      await saveDataIDB({} as never);

      expect(dispatchSpy).toHaveBeenCalled();
      window.removeEventListener('storage-error', dispatchSpy);
    });
  });

  describe('loadDataIDB', () => {
    it('loads data from modular stores', async () => {
      const mockDb = makeMockDb();
      await mockDb.put('metadata', 3, 'version');
      await mockDb.put('tasks', [{ id: 't1', title: 'Test' }], 'value');
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { loadDataIDB } = await import('../storage/idbEngine');
      const result = await loadDataIDB();
      expect(result).toBeDefined();
      expect(result.version).toBe(3);
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Test');
    });

    it('returns defaults when store is empty', async () => {
      const mockDb = makeMockDb();
      mockDb.objectStoreNames.contains = vi.fn(() => false);
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { loadDataIDB } = await import('../storage/idbEngine');
      const result = await loadDataIDB();
      expect(result).toBeDefined();
      expect(result.tasks).toEqual([]);
    });

    it('returns defaults on error', async () => {
      mockOpenDB.mockRejectedValue(new Error('read failed') as never);

      const { loadDataIDB } = await import('../storage/idbEngine');
      const result = await loadDataIDB();
      expect(result).toBeDefined();
    });
  });

  describe('migrateFromLocalStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('migrates data from localStorage to IDB modular stores', async () => {
      localStorage.setItem('lifeos_platform_v1', JSON.stringify({ version: 3, tasks: [{ id: '1' }] }));
      const mockDb = makeMockDb();
      mockDb.objectStoreNames.contains = vi.fn(() => false); // simulate empty IDB
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { migrateFromLocalStorage } = await import('../storage/idbEngine');
      const result = await migrateFromLocalStorage();

      expect(result).toBe(true);
      const versionSaved = await mockDb.get('metadata', 'version');
      expect(versionSaved).toBe(3);
    });

    it('returns false when no localStorage data', async () => {
      const mockDb = makeMockDb();
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { migrateFromLocalStorage } = await import('../storage/idbEngine');
      const result = await migrateFromLocalStorage();

      expect(result).toBe(false);
    });

    it('returns false if IDB already has data', async () => {
      localStorage.setItem('lifeos_platform_v1', JSON.stringify({ version: 3 }));
      const mockDb = makeMockDb();
      await mockDb.put('metadata', 3, 'version');
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { migrateFromLocalStorage } = await import('../storage/idbEngine');
      const result = await migrateFromLocalStorage();

      expect(result).toBe(false);
    });
  });
});
