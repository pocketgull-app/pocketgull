const g: any = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});
g.config = { production: false };
g.ng = g.ng || {};
g.ng.config = { production: false };
g.ngDevMode = true;

if (typeof window !== 'undefined') {
  (window as any).ng = g.ng;
  (window as any).config = g.config;
  (window as any).ngDevMode = true;
}
