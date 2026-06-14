import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openDB } from 'idb';

vi.mock('idb', () => ({
  openDB: vi.fn(),
}));

const mockOpenDB = vi.mocked(openDB);

function makeMockDb() {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn(async (_storeName: string, key: string) => store.get(key)),
    put: vi.fn(async (_storeName: string, value: unknown, key: string) => { store.set(key, value); }),
    objectStoreNames: { contains: vi.fn(() => true) },
    createObjectStore: vi.fn(),
  };
}

describe('idbEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module-level dbPromise by clearing the module registry
    vi.resetModules();
  });

  describe('hasIDBData', () => {
    it('returns true when data exists in store', async () => {
      const mockDb = makeMockDb();
      await mockDb.put('appData', { version: 3 }, 'lifeos_platform_v1');
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { hasIDBData } = await import('../storage/idbEngine');
      const result = await hasIDBData();
      expect(result).toBe(true);
    });

    it('returns false when store is empty', async () => {
      const mockDb = makeMockDb();
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
    it('saves data to store', async () => {
      const mockDb = makeMockDb();
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { saveDataIDB } = await import('../storage/idbEngine');
      const data = { version: 3, tasks: [] };
      await saveDataIDB(data);

      expect(mockDb.put).toHaveBeenCalledWith('appData', data, 'lifeos_platform_v1');
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
    it('loads and migrates data from store', async () => {
      const mockDb = makeMockDb();
      const rawData = { version: 2, tasks: [] };
      await mockDb.put('appData', rawData, 'lifeos_platform_v1');
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { loadDataIDB } = await import('../storage/idbEngine');
      const result = await loadDataIDB();
      expect(result).toBeDefined();
      expect(result.version).toBe(3);
    });

    it('returns defaults when store is empty', async () => {
      const mockDb = makeMockDb();
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { loadDataIDB } = await import('../storage/idbEngine');
      const result = await loadDataIDB();
      expect(result).toBeDefined();
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

    it('migrates data from localStorage to IDB', async () => {
      localStorage.setItem('lifeos_platform_v1', JSON.stringify({ version: 3, tasks: [] }));
      const mockDb = makeMockDb();
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { migrateFromLocalStorage } = await import('../storage/idbEngine');
      const result = await migrateFromLocalStorage();

      expect(result).toBe(true);
      expect(mockDb.put).toHaveBeenCalled();
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
      await mockDb.put('appData', { version: 3 }, 'lifeos_platform_v1');
      mockOpenDB.mockResolvedValue(mockDb as never);

      const { migrateFromLocalStorage } = await import('../storage/idbEngine');
      const result = await migrateFromLocalStorage();

      expect(result).toBe(false);
    });
  });
});
