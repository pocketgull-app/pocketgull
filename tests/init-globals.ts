const defaultNg = { config: { production: false } };
const defaultConfig = { production: false };

function ensureGlobals(target: any) {
  if (!target) return;
  try {
    if (!target.ng) {
      target.ng = { config: { production: false } };
    } else if (!target.ng.config) {
      target.ng.config = { production: false };
    }

    if (!target.config) {
      target.config = { production: false };
    }
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

