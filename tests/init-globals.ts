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
}
if (typeof global !== 'undefined') {
  ensureGlobals(global);
}
