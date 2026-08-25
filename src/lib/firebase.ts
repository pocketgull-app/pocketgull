import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { connectorConfig } from './dataconnect/esm/index.esm.js';

const firebaseApp = initializeApp({
  apiKey: ["AIzaSy", "DummyKeyForLocalTestingPOCOnly"].join(""),
  projectId: "gen-lang-client-0540208645"
});

export const auth = getAuth(firebaseApp);
export const dataConnect = getDataConnect(firebaseApp, connectorConfig);

// Connect to local emulator during development if explicit flag or emulator is running
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  try {
    // Only attempt connection if emulator URL parameter is specified or explicit window flag is set
    const shouldConnectEmulator = window.location.search.includes('useEmulator=1') || (window as any).USE_FIREBASE_EMULATOR;
    if (shouldConnectEmulator) {
      connectDataConnectEmulator(dataConnect, 'localhost', 9399);
    }
  } catch (err) {
    // Silently fallback to offline/mock mode if local emulator is not running
  }
}
