const TEMP_PREFIX = '_temp_';

export function safeSaveItem(key: string, value: string): void {
  const tempKey = TEMP_PREFIX + key;
  try {
    // Write to temp key first
    localStorage.setItem(tempKey, value);

    // Verify it was correctly written
    const written = localStorage.getItem(tempKey);
    if (written !== value) {
      throw new Error(
        `Atomic write verification failed: written length ${written?.length ?? 0} vs target ${value.length}`
      );
    }

    // Overwrite original key directly
    localStorage.setItem(key, value);
  } catch (err) {
    // If temp key write failed due to quota or storage limit, attempt direct save
    try {
      localStorage.removeItem(tempKey);
      localStorage.setItem(key, value);
    } catch (directErr) {
      console.error(`[Storage] Atomic write failed for key "${key}":`, directErr);
      throw directErr;
    }
  } finally {
    try {
      localStorage.removeItem(tempKey);
    } catch {
      // ignore
    }
  }
}
