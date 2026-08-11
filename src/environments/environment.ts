import { APP_VERSION } from '../version';

export const environment = {
  production: true,
  appVersion: APP_VERSION,
  firebase: {
    projectId: 'gen-lang-client-0540208645',
    appId: '1:0540208645:web:pocketgull',
    storageBucket: 'gen-lang-client-0540208645.appspot.com',
    apiKey: typeof process !== 'undefined' && process.env?.['FIREBASE_API_KEY'] ? process.env['FIREBASE_API_KEY'] : 'AIzaSy_gen_lang_client_pocketgull',
    authDomain: 'gen-lang-client-0540208645.firebaseapp.com',
    messagingSenderId: '0540208645'
  }
};
