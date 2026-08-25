import { SecureStorageService } from './secure-storage.service';

const STORAGE_KEY = '_pg_g_ak';

export function getStoredApiKey(storage?: SecureStorageService): string {
  try {
    const raw = storage ? storage.getItem(STORAGE_KEY) : null;
    if (!raw) return '';
    // Reverse and base64 decode to deobfuscate
    return atob(raw.split('').reverse().join(''));
  } catch (e) {
    console.debug('[SecureKey] API key retrieval failed:', (e as Error)?.message);
    return '';
  }
}

export function setStoredApiKey(key: string, storage?: SecureStorageService): void {
  if (!storage) return;
  try {
    if (!key) {
      storage.removeItem(STORAGE_KEY);
      return;
    }
    // Base64 encode and reverse to obfuscate
    const obfuscated = btoa(key).split('').reverse().join('');
    storage.setItem(STORAGE_KEY, obfuscated);
  } catch (e) {
    console.error('Failed to save configuration key:', e);
  }
}
