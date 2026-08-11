// Must have ZERO imports so this code executes BEFORE @angular/core or @angular/compiler is loaded.
const g: any = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});
g.ng = g.ng || {};
g.ng.config = g.ng.config || { production: false };
g.config = g.config || { production: false };
g.ngDevMode = true;

if (typeof window !== 'undefined') {
  (window as any).ng = g.ng;
  (window as any).config = g.config;
  (window as any).ngDevMode = true;
}

// Log stack trace whenever "TypeError: Cannot read properties of undefined (reading 'config')" is thrown
const NativeTypeError = globalThis.TypeError;
class DebugTypeError extends NativeTypeError {
  constructor(message?: string, options?: any) {
    super(message, options);
    if (message && message.includes('config')) {
      console.error('*** STACK TRACE FOR CONFIG ERROR ***\n', new Error().stack);
    }
  }
}
(globalThis as any).TypeError = DebugTypeError;
