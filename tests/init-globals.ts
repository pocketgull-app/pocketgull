const root: any = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : global);
root.ng = root.ng || { config: { production: false } };
if (!root.ng.config) {
  root.ng.config = { production: false };
}
root.ngDevMode = true;

if (typeof global !== 'undefined') {
  (global as any).ng = root.ng;
  (global as any).ngDevMode = true;
}

if (typeof window !== 'undefined') {
  (window as any).ng = root.ng;
  (window as any).ngDevMode = true;
}

import '@angular/compiler';

class MockNode {
  static ELEMENT_NODE = 1;
  static ATTRIBUTE_NODE = 2;
  static TEXT_NODE = 3;
  static COMMENT_NODE = 8;
  static DOCUMENT_NODE = 9;
  static DOCUMENT_TYPE_NODE = 10;
  static DOCUMENT_FRAGMENT_NODE = 11;
  nodeType = 1;
  nodeName = 'DIV';
  childNodes: any[] = [];
  parentNode: any = null;
}
class MockElement extends MockNode {
  tagName = 'DIV';
  attributes: any = {};
}
class MockHTMLElement extends MockElement {}
class MockHTMLDivElement extends MockHTMLElement {}
class MockHTMLInputElement extends MockHTMLElement { value = ''; }
class MockHTMLButtonElement extends MockHTMLElement { disabled = false; }
class MockHTMLAnchorElement extends MockHTMLElement { href = ''; }
class MockHTMLCanvasElement extends MockHTMLElement {
  getContext() {
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Uint8Array(4) }),
      putImageData: () => {},
      createImageData: () => ({ data: new Uint8Array(4) }),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
    };
  }
}
class MockSVGElement extends MockElement {}
class MockDocumentFragment extends MockNode {}

if (typeof (globalThis as any).Node === 'undefined') {
  (globalThis as any).Node = MockNode;
}
if (typeof (globalThis as any).Element === 'undefined') {
  (globalThis as any).Element = MockElement;
}
if (typeof (globalThis as any).HTMLElement === 'undefined') {
  (globalThis as any).HTMLElement = MockHTMLElement;
}
if (typeof (globalThis as any).HTMLDivElement === 'undefined') {
  (globalThis as any).HTMLDivElement = MockHTMLDivElement;
}
if (typeof (globalThis as any).HTMLInputElement === 'undefined') {
  (globalThis as any).HTMLInputElement = MockHTMLInputElement;
}
if (typeof (globalThis as any).HTMLButtonElement === 'undefined') {
  (globalThis as any).HTMLButtonElement = MockHTMLButtonElement;
}
if (typeof (globalThis as any).HTMLAnchorElement === 'undefined') {
  (globalThis as any).HTMLAnchorElement = MockHTMLAnchorElement;
}
if (typeof (globalThis as any).HTMLCanvasElement === 'undefined') {
  (globalThis as any).HTMLCanvasElement = MockHTMLCanvasElement;
}
if (typeof (globalThis as any).SVGElement === 'undefined') {
  (globalThis as any).SVGElement = MockSVGElement;
}
if (typeof (globalThis as any).DocumentFragment === 'undefined') {
  (globalThis as any).DocumentFragment = MockDocumentFragment;
}

if (typeof (globalThis as any).addEventListener === 'undefined') {
  const listeners = new Map<string, Function[]>();
  (globalThis as any).addEventListener = (type: string, handler: any) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type)!.push(handler);
  };
  (globalThis as any).removeEventListener = (type: string, handler: any) => {
    const list = listeners.get(type);
    if (list) {
      listeners.set(type, list.filter(fn => fn !== handler));
    }
  };
  (globalThis as any).dispatchEvent = (event: any) => {
    const list = listeners.get(event?.type);
    if (list) {
      list.forEach(fn => {
        try { fn(event); } catch {}
      });
      return true;
    }
    return false;
  };
}

if (typeof (globalThis as any).requestAnimationFrame === 'undefined') {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0) as any;
  (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
}

if (typeof (globalThis as any).matchMedia === 'undefined') {
  (globalThis as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (typeof URL !== 'undefined') {
  try {
    if (typeof (URL as any).createObjectURL === 'undefined') {
      (URL as any).createObjectURL = (_blob: any) => `blob:mock-${Date.now()}`;
    }
    if (typeof (URL as any).revokeObjectURL === 'undefined') {
      (URL as any).revokeObjectURL = (_url: string) => {};
    }
  } catch {}
}

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

if (typeof (globalThis as any).navigator === 'undefined') {
  (globalThis as any).navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    language: 'en-US',
    languages: ['en-US'],
    onLine: true,
  };
}

if (typeof (globalThis as any).KeyboardEvent === 'undefined') {
  (globalThis as any).KeyboardEvent = class KeyboardEvent extends Event {
    key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    constructor(type: string, dict: any = {}) {
      super(type, dict);
      this.key = dict.key || '';
      this.code = dict.code || '';
      this.ctrlKey = !!dict.ctrlKey;
      this.shiftKey = !!dict.shiftKey;
      this.altKey = !!dict.altKey;
      this.metaKey = !!dict.metaKey;
    }
  };
}

if (typeof (globalThis as any).ProgressEvent === 'undefined') {
  (globalThis as any).ProgressEvent = class ProgressEvent extends Event {
    loaded: number;
    total: number;
    lengthComputable: boolean;
    constructor(type: string, dict: any = {}) {
      super(type, dict);
      this.loaded = dict.loaded || 0;
      this.total = dict.total || 0;
      this.lengthComputable = !!dict.lengthComputable;
    }
  };
}

if (typeof (globalThis as any).MouseEvent === 'undefined') {
  (globalThis as any).MouseEvent = class MouseEvent extends Event {
    clientX: number;
    clientY: number;
    button: number;
    constructor(type: string, dict: any = {}) {
      super(type, dict);
      this.clientX = dict.clientX || 0;
      this.clientY = dict.clientY || 0;
      this.button = dict.button || 0;
    }
  };
}

if (typeof (globalThis as any).document === 'undefined') {
  const elementsById = new Map<string, any>();

  function createMockElement(tagName = 'div', id = '') {
    const el: any = {
      tagName: tagName.toUpperCase(),
      id: id,
      nodeType: 1,
      ownerDocument: null as any,
      attributes: {} as Record<string, string>,
      setAttribute: (name: string, val: string) => {
        el.attributes[name] = String(val);
        if (name === 'id') {
          el.id = String(val);
          elementsById.set(el.id, el);
        }
        if (name === 'class') {
          String(val).split(/\s+/).filter(Boolean).forEach(c => el.classList.add(c));
        }
      },
      getAttribute: (name: string) => (name === 'id' ? el.id : el.attributes[name] || null),
      removeAttribute: (name: string) => {
        delete el.attributes[name];
        if (name === 'id') {
          elementsById.delete(el.id);
          el.id = '';
        }
      },
      childNodes: [] as any[],
      children: [] as any[],
      _textContent: '',
      get textContent() {
        if (el.childNodes.length === 0) {
          return el._textContent || '';
        }
        return el.childNodes.map((c: any) => c.textContent ?? '').join('');
      },
      set textContent(val: string) {
        el._textContent = String(val ?? '');
        el.childNodes = [];
        el.children = [];
      },
      get innerText() {
        return el.textContent;
      },
      set innerText(val: string) {
        el.textContent = val;
      },
      appendChild: (child: any) => {
        if (child) {
          child.parentNode = el;
          el.childNodes.push(child);
          if (child.nodeType === 1) el.children.push(child);
        }
        return child;
      },
      removeChild: (child: any) => {
        if (child) {
          child.parentNode = null;
          el.childNodes = el.childNodes.filter((c: any) => c !== child);
          el.children = el.children.filter((c: any) => c !== child);
        }
        return child;
      },
      insertBefore: (newNode: any, refNode: any) => {
        if (newNode) {
          newNode.parentNode = el;
          const idx = el.childNodes.indexOf(refNode);
          if (idx >= 0) {
            el.childNodes.splice(idx, 0, newNode);
          } else {
            el.childNodes.push(newNode);
          }
          if (newNode.nodeType === 1) {
            const elemIdx = el.children.indexOf(refNode);
            if (elemIdx >= 0) {
              el.children.splice(elemIdx, 0, newNode);
            } else {
              el.children.push(newNode);
            }
          }
        }
        return newNode;
      },
      cloneNode: () => createMockElement(tagName),
      remove: () => {
        if (el.parentNode && el.parentNode.removeChild) {
          el.parentNode.removeChild(el);
        }
      },
      scrollIntoView: () => {},
      focus: () => {},
      blur: () => {},
      click: () => {},
      classList: {
        _classes: new Set<string>(),
        add(...tokens: string[]) { tokens.forEach(t => this._classes.add(t)); },
        remove(...tokens: string[]) { tokens.forEach(t => this._classes.delete(t)); },
        contains(token: string) { return this._classes.has(token); },
        toggle(token: string, force?: boolean) {
          if (force === true) { this._classes.add(token); return true; }
          if (force === false) { this._classes.delete(token); return false; }
          if (this._classes.has(token)) { this._classes.delete(token); return false; }
          this._classes.add(token); return true;
        },
      },
      style: {
        setProperty: (_name: string, _val: string) => {},
        getPropertyValue: (_name: string) => '',
        removeProperty: (_name: string) => '',
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      querySelector: (sel: string) => querySelector(sel, el),
      querySelectorAll: (sel: string) => querySelectorAll(sel, el),
      getElementsByTagName: (tag: string) => querySelectorAll(tag, el),
      getElementsByClassName: (cls: string) => querySelectorAll(`.${cls}`, el),
      contains: (node: any) => {
        let curr = node;
        while (curr) {
          if (curr === el) return true;
          curr = curr.parentNode;
        }
        return false;
      },
      innerHTML: '',
    };
    if (id) {
      elementsById.set(id, el);
    }
    return el;
  }

  function matchesSelector(node: any, sel: string): boolean {
    if (!sel || !node || node.nodeType !== 1) return false;
    if (sel.startsWith('.')) {
      const cls = sel.slice(1).replace(/\\/g, '');
      return typeof node.classList?.contains === 'function' && node.classList.contains(cls);
    }
    if (sel.startsWith('[') && sel.endsWith(']')) {
      const inner = sel.slice(1, -1);
      if (inner.includes('=')) {
        const [attr, rawVal] = inner.split('=');
        const val = rawVal.replace(/['"]/g, '');
        return typeof node.getAttribute === 'function' && node.getAttribute(attr.trim()) === val;
      }
      return typeof node.hasAttribute === 'function' ? node.hasAttribute(inner.trim()) : !!node.getAttribute?.(inner.trim());
    }
    return (node.tagName || '').toUpperCase() === sel.toUpperCase();
  }

  function querySelector(selector: string, root?: any): any {
    if (!selector) return null;
    if (selector.startsWith('#root')) {
      const id = selector.slice(1);
      if (!elementsById.has(id)) {
        const el = createMockElement('div', id);
        elementsById.set(id, el);
      }
      return elementsById.get(id);
    }
    const searchRoot = root || doc;
    if (searchRoot && searchRoot.childNodes) {
      for (const child of searchRoot.childNodes) {
        if (child.nodeType === 1) {
          if (matchesSelector(child, selector)) return child;
          const found = querySelector(selector, child);
          if (found) return found;
        }
      }
    }
    return null;
  }

  function querySelectorAll(selector: string, root?: any): any[] {
    const matches: any[] = [];
    const searchRoot = root || doc;
    if (searchRoot && searchRoot.childNodes) {
      for (const child of searchRoot.childNodes) {
        if (child.nodeType === 1) {
          if (matchesSelector(child, selector)) matches.push(child);
          matches.push(...querySelectorAll(selector, child));
        }
      }
    }
    return matches;
  }

  const mockBody = createMockElement('body');
  const mockHead = createMockElement('head');
  const mockDocElement = createMockElement('html');

  mockDocElement.appendChild(mockHead);
  mockDocElement.appendChild(mockBody);

  const doc: any = {
    createElement: (tag: string) => {
      const el = createMockElement(tag);
      el.ownerDocument = doc;
      return el;
    },
    createElementNS: (_ns: string, tag: string) => {
      const el = createMockElement(tag);
      el.ownerDocument = doc;
      return el;
    },
    createTextNode: (text: string) => {
      let _t = String(text ?? '');
      const node: any = {
        nodeType: 3,
        nodeName: '#text',
        ownerDocument: doc,
        parentNode: null as any,
        get textContent() { return _t; },
        set textContent(v: string) { _t = String(v ?? ''); },
        get nodeValue() { return _t; },
        set nodeValue(v: string) { _t = String(v ?? ''); },
        remove: () => {
          if (node.parentNode && node.parentNode.removeChild) {
            node.parentNode.removeChild(node);
          }
        }
      };
      return node;
    },
    createComment: (text = '') => {
      const node: any = {
        nodeType: 8,
        nodeName: '#comment',
        ownerDocument: doc,
        parentNode: null as any,
        textContent: String(text ?? ''),
        remove: () => {
          if (node.parentNode && node.parentNode.removeChild) {
            node.parentNode.removeChild(node);
          }
        }
      };
      return node;
    },
    createDocumentFragment: () => createMockElement('fragment'),
    head: mockHead,
    body: mockBody,
    documentElement: mockDocElement,
    implementation: {
      createHTMLDocument: (_title?: string) => {
        const d: any = { ...doc };
        const b = createMockElement('body');
        const h = createMockElement('head');
        d.body = b;
        d.head = h;
        return d;
      },
    },
    childNodes: [mockDocElement],
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: (sel: string) => querySelector(sel, doc),
    querySelectorAll: (sel: string) => querySelectorAll(sel, doc),
    getElementById: (id: string) => {
      if (!elementsById.has(id)) {
        const el = createMockElement('div', id);
        elementsById.set(id, el);
      }
      return elementsById.get(id);
    },
    getElementsByTagName: (tag: string) => {
      if (tag.toLowerCase() === 'head') return [mockHead];
      if (tag.toLowerCase() === 'body') return [mockBody];
      return [];
    },
    getElementsByClassName: () => [],
  };

  mockBody.ownerDocument = doc;
  mockHead.ownerDocument = doc;
  mockDocElement.ownerDocument = doc;

  (globalThis as any).document = doc;
}

if (typeof (globalThis as any).localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index: number) => Array.from(store.keys())[index] || null,
  };
}

if (typeof window !== 'undefined') {

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
