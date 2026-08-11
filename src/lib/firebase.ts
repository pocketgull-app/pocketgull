import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { connectorConfig } from './dataconnect/esm/index.esm.js';
import { environment } from '../environments/environment';

// Initialize or reuse Firebase App instance targeting gen-lang-client-0540208645
const firebaseApp = getApps().length === 0 ? initializeApp(environment.firebase) : getApp();

export const auth = getAuth(firebaseApp);
export const dataConnect = getDataConnect(firebaseApp, connectorConfig);

// Connect to local emulator during development if explicit flag or emulator parameter is specified
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  try {
    const shouldConnectEmulator = window.location.search.includes('useEmulator=1') || (window as any).USE_FIREBASE_EMULATOR;
    if (shouldConnectEmulator) {
      connectDataConnectEmulator(dataConnect, 'localhost', 9399);
    }
  } catch (err) {
    // Silently fallback to memory signal state if emulator is not active
  }
}
