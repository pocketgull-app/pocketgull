import '@angular/compiler';

const defaultNg = { config: { production: false } };
const defaultConfig = { production: false };

function ensureGlobals(target: any) {
  if (!target) return;
  try {
    target.ng = target.ng || { config: { production: false } };
    if (!target.ng.config) {
      target.ng.config = { production: false };
    }
    target.config = target.config || { production: false };
    target.ngDevMode = true;
  } catch {
    // Ignore read-only properties
  }
}

ensureGlobals(globalThis);
if (typeof window !== 'undefined') {
  ensureGlobals(window);

  // Implement browser UI and navigation stubs
  try {
    window.alert = (msg?: string) => {};
    window.confirm = (msg?: string) => true;
    window.prompt = (msg?: string) => null;
    window.open = (url?: string | URL, target?: string, features?: string) => null;
    window.print = () => {};
    window.scrollTo = (options?: ScrollToOptions | number, y?: number) => {};
    window.scroll = (options?: ScrollToOptions | number, y?: number) => {};

    // Stateful location mock to prevent JSDOM "navigation to another Document"
    let currentUrl = 'http://localhost:4000/';
    try {
      delete (window as any).location;
      (window as any).location = {
        get href() { return currentUrl; },
        set href(val: string) { currentUrl = val; },
        assign: (url: string) => { currentUrl = url; },
        replace: (url: string) => { currentUrl = url; },
        reload: () => {},
        origin: 'http://localhost:4000',
        protocol: 'http:',
        host: 'localhost:4000',
        hostname: 'localhost',
        port: '4000',
        pathname: '/',
        search: '',
        hash: ''
      };
    } catch {
      // If location is read-only, define property
      Object.defineProperty(window, 'location', {
        value: {
          get href() { return currentUrl; },
          set href(val: string) { currentUrl = val; },
          assign: (url: string) => { currentUrl = url; },
          replace: (url: string) => { currentUrl = url; },
          reload: () => {},
          origin: 'http://localhost:4000',
          protocol: 'http:',
          host: 'localhost:4000',
          hostname: 'localhost',
          port: '4000',
          pathname: '/',
          search: '',
          hash: ''
        },
        writable: true,
        configurable: true
      });
    }

    // Prevent jsdom "navigation to another Document" by capturing link and form navigations
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (e: MouseEvent) => {
        const target = (e.target as HTMLElement)?.closest?.('a');
        if (target && target.getAttribute('href')) {
          e.preventDefault();
        }
      }, true);

      document.addEventListener('submit', (e: Event) => {
        e.preventDefault();
      }, true);
    }
  } catch {
    // Ignore setup in non-DOM contexts
  }

}
if (typeof global !== 'undefined') {
  ensureGlobals(global);
}

