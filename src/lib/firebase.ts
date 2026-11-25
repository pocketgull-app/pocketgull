import type { DataConnect } from 'firebase/data-connect';
import { environment } from '../environments/environment';

let cachedDataConnect: DataConnect | null = null;
let dataConnectPromise: Promise<DataConnect> | null = null;

export const isDataConnectEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.location.search.includes('useDataConnect=1') ||
    window.location.search.includes('useEmulator=1') ||
    (window as { USE_FIREBASE_DATA_CONNECT?: unknown }).USE_FIREBASE_DATA_CONNECT ||
    (window as { USE_FIREBASE_EMULATOR?: unknown }).USE_FIREBASE_EMULATOR
  );
};

export async function getDataConnectInstance(): Promise<DataConnect> {
  if (cachedDataConnect) return cachedDataConnect;
  if (!dataConnectPromise) {
    dataConnectPromise = Promise.all([
      import('firebase/app'),
      import('firebase/data-connect'),
      import('./dataconnect/esm/index.esm.js'),
    ]).then(([appMod, dcMod, connMod]) => {
      const firebaseApp = appMod.getApps().length === 0 ? appMod.initializeApp(environment.firebase) : appMod.getApp();
      const instance = dcMod.getDataConnect(firebaseApp, connMod.connectorConfig);
      if (
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ) {
        try {
          const shouldConnectEmulator =
            window.location.search.includes('useEmulator=1') ||
            (window as { USE_FIREBASE_EMULATOR?: unknown }).USE_FIREBASE_EMULATOR;
          if (shouldConnectEmulator) {
            dcMod.connectDataConnectEmulator(instance, 'localhost', 9399);
          }
        } catch {
          // Silently fallback to memory signal state if emulator is not active
        }
      }
      cachedDataConnect = instance;
      return instance;
    });
  }
  return dataConnectPromise;
}
