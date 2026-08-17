const defaultNg = { config: { production: false } };
const defaultConfig = { production: false };

function ensureGlobals(target: any) {
  if (!target) return;
  if (!target.ng) {
    target.ng = defaultNg;
  } else if (!target.ng.config) {
    target.ng.config = { production: false };
  }

  if (!target.config) {
    target.config = defaultConfig;
  }
  target.ngDevMode = true;
}

ensureGlobals(globalThis);
if (typeof window !== 'undefined') {
  ensureGlobals(window);
}



