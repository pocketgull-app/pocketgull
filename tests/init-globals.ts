// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

import '@angular/compiler';
import { webcrypto } from 'node:crypto';

const root: any =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : global;

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

// --- WebCrypto fallback when jsdom omits crypto.subtle ---
try {
  if (typeof globalThis.crypto === 'undefined' || typeof globalThis.crypto.subtle === 'undefined') {
    Object.defineProperty(globalThis, 'crypto', {
      value: webcrypto,
      writable: true,
      configurable: true
    });
  }
  if (typeof window !== 'undefined' && (typeof window.crypto === 'undefined' || typeof window.crypto.subtle === 'undefined')) {
    Object.defineProperty(window, 'crypto', {
      value: globalThis.crypto,
      writable: true,
      configurable: true
    });
  }
} catch {}

// --- Real browser-API shims not implemented by jsdom ---

if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  class ResizeObserverShim {
    observe(_target: Element): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
  }
  (globalThis as any).ResizeObserver = ResizeObserverShim;
  if (typeof window !== 'undefined') {
    (window as any).ResizeObserver = ResizeObserverShim;
  }
}

if (typeof (globalThis as any).IntersectionObserver === 'undefined') {
  class IntersectionObserverShim {
    readonly root: Element | Document | null = null;
    readonly rootMargin = '0px';
    readonly thresholds: ReadonlyArray<number> = [0];
    observe(_target: Element): void {}
    unobserve(_target: Element): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  (globalThis as any).IntersectionObserver = IntersectionObserverShim;
  if (typeof window !== 'undefined') {
    (window as any).IntersectionObserver = IntersectionObserverShim;
  }
}

if (typeof (globalThis as any).matchMedia === 'undefined') {
  const matchMediaShim = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
  (globalThis as any).matchMedia = matchMediaShim;
  if (typeof window !== 'undefined') {
    (window as any).matchMedia = matchMediaShim;
  }
}

if (typeof (globalThis as any).AudioContext === 'undefined') {
  const createAudioParam = (initial = 0) => ({
    value: initial,
    setValueAtTime: () => {},
    linearRampToValueAtTime: () => {},
    exponentialRampToValueAtTime: () => {},
    setTargetAtTime: () => {},
    cancelScheduledValues: () => {}
  });

  const createAudioNode = () => ({
    connect: () => createAudioNode(),
    disconnect: () => {},
    start: () => {},
    stop: () => {},
    gain: createAudioParam(1),
    frequency: createAudioParam(440),
    detune: createAudioParam(0),
    Q: createAudioParam(1),
    pan: createAudioParam(0),
    delayTime: createAudioParam(0),
    threshold: createAudioParam(-24),
    knee: createAudioParam(30),
    ratio: createAudioParam(12),
    attack: createAudioParam(0.003),
    release: createAudioParam(0.25),
    positionX: createAudioParam(0),
    positionY: createAudioParam(0),
    positionZ: createAudioParam(0),
    orientationX: createAudioParam(1),
    orientationY: createAudioParam(0),
    orientationZ: createAudioParam(0),
    setPosition: () => {},
    setOrientation: () => {},
    panningModel: 'HRTF',
    distanceModel: 'inverse',
    refDistance: 1,
    maxDistance: 10000,
    rolloffFactor: 1,
    coneInnerAngle: 360,
    coneOuterAngle: 360,
    coneOuterGain: 0,
    curve: null as Float32Array | null,
    oversample: 'none',
    type: 'sine',
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    frequencyBinCount: 1024,
    getByteTimeDomainData: (arr: Uint8Array) => arr.fill(128),
    getByteFrequencyData: (arr: Uint8Array) => arr.fill(0),
    getFloatTimeDomainData: (arr: Float32Array) => arr.fill(0)
  });

  class AudioContextShim {
    state: AudioContextState = 'running';
    sampleRate = 44100;
    currentTime = 0;
    destination = createAudioNode();
    listener = {
      positionX: createAudioParam(0),
      positionY: createAudioParam(0),
      positionZ: createAudioParam(0),
      forwardX: createAudioParam(0),
      forwardY: createAudioParam(0),
      forwardZ: createAudioParam(-1),
      upX: createAudioParam(0),
      upY: createAudioParam(1),
      upZ: createAudioParam(0),
      setPosition: () => {},
      setOrientation: () => {}
    };
    createOscillator = () => createAudioNode();
    createGain = () => createAudioNode();
    createBiquadFilter = () => createAudioNode();
    createAnalyser = () => createAudioNode();
    createDynamicsCompressor = () => createAudioNode();
    createPanner = () => createAudioNode();
    createStereoPanner = () => createAudioNode();
    createWaveShaper = () => createAudioNode();
    createDelay = (_maxDelayTime?: number) => createAudioNode();
    createChannelMerger = (_numberOfInputs?: number) => createAudioNode();
    createChannelSplitter = (_numberOfOutputs?: number) => createAudioNode();
    createBuffer = (channels: number, length: number, sampleRate: number) => ({
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: () => new Float32Array(length)
    });
    createBufferSource = () => ({
      ...createAudioNode(),
      buffer: null,
      loop: false
    });
    createMediaStreamSource = () => createAudioNode();
    createScriptProcessor = () => ({
      ...createAudioNode(),
      onaudioprocess: null
    });
    decodeAudioData = async () => ({
      numberOfChannels: 1,
      length: 1,
      sampleRate: 44100,
      duration: 0,
      getChannelData: () => new Float32Array(1)
    });
    resume = async () => { this.state = 'running'; };
    suspend = async () => { this.state = 'suspended'; };
    close = async () => { this.state = 'closed'; };
  }

  (globalThis as any).AudioContext = AudioContextShim;
  (globalThis as any).webkitAudioContext = AudioContextShim;
  if (typeof window !== 'undefined') {
    (window as any).AudioContext = AudioContextShim;
    (window as any).webkitAudioContext = AudioContextShim;
  }
}

if (typeof (globalThis as any).SpeechSynthesisUtterance === 'undefined') {
  class SpeechSynthesisUtteranceShim {
    text: string;
    lang = 'en-US';
    rate = 1;
    pitch = 1;
    volume = 1;
    voice: SpeechSynthesisVoice | null = null;
    onstart: ((ev: any) => void) | null = null;
    onend: ((ev: any) => void) | null = null;
    onerror: ((ev: any) => void) | null = null;
    constructor(text = '') {
      this.text = text;
    }
  }
  (globalThis as any).SpeechSynthesisUtterance = SpeechSynthesisUtteranceShim;
  if (typeof window !== 'undefined') {
    (window as any).SpeechSynthesisUtterance = SpeechSynthesisUtteranceShim;
  }
}

if (typeof window !== 'undefined' && typeof (window as any).speechSynthesis === 'undefined') {
  const synthShim = {
    speaking: false,
    pending: false,
    paused: false,
    onvoiceschanged: null,
    getVoices: () => [],
    speak: (utterance: any) => {
      try { utterance?.onstart?.({}); } catch {}
      try { utterance?.onend?.({}); } catch {}
    },
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  };
  (window as any).speechSynthesis = synthShim;
  (globalThis as any).speechSynthesis = synthShim;
}

if (typeof (globalThis as any).requestAnimationFrame === 'undefined') {
  (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number;
  (globalThis as any).cancelAnimationFrame = (id: number) => clearTimeout(id);
}

if (typeof URL !== 'undefined') {
  try {
    if (typeof (URL as any).createObjectURL !== 'function') {
      (URL as any).createObjectURL = (_blob: unknown) => `blob:jsdom-${Date.now()}`;
    }
    if (typeof (URL as any).revokeObjectURL !== 'function') {
      (URL as any).revokeObjectURL = (_url: string) => {};
    }
  } catch {}
}

// --- Real HTMLCanvasElement 2D/WebGL context stub (jsdom omits canvas backend) ---
if (typeof HTMLCanvasElement !== 'undefined') {
  const createCanvas2dContext = (canvas: HTMLCanvasElement) => {
    const baseCtx: Record<string, unknown> = {
      canvas,
      fillRect: () => {},
      clearRect: () => {},
      strokeRect: () => {},
      getImageData: (_x: number, _y: number, w = 1, h = 1) => ({
        data: new Uint8ClampedArray(Math.max(1, w) * Math.max(1, h) * 4),
        width: w,
        height: h
      }),
      putImageData: () => {},
      createImageData: (w = 1, h = 1) => ({
        data: new Uint8ClampedArray(Math.max(1, w) * Math.max(1, h) * 4),
        width: w,
        height: h
      }),
      setTransform: () => {},
      resetTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      strokeText: () => {},
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
      ellipse: () => {},
      rect: () => {},
      roundRect: () => {},
      clip: () => {},
      setLineDash: () => {},
      getLineDash: () => [],
      bezierCurveTo: () => {},
      quadraticCurveTo: () => {},
      fill: () => {},
      measureText: (text: string) => ({
        width: text ? text.length * 8 : 0,
        actualBoundingBoxAscent: 10,
        actualBoundingBoxDescent: 2,
        fontBoundingBoxAscent: 10,
        fontBoundingBoxDescent: 2
      }),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => null
    };
    return new Proxy(baseCtx, {
      get(target, prop: string) {
        if (prop in target) {
          return target[prop];
        }
        return () => {};
      }
    });
  };

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    writable: true,
    value: function (this: HTMLCanvasElement, type: string) {
      if (type && (type.includes('webgl') || type.includes('experimental'))) {
        return null;
      }
      return createCanvas2dContext(this);
    }
  });

  Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
    configurable: true,
    writable: true,
    value: () =>
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  });
}

// --- Element / Window UI stubs missing or throwing "Not implemented" in jsdom ---
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}

if (typeof window !== 'undefined') {
  try {
    window.alert = () => {};
    window.confirm = () => true;
    window.prompt = () => null;
    window.open = () => null;
    window.print = () => {};
    window.scrollTo = () => {};
    window.scroll = () => {};

    // Stateful location wrapper to prevent jsdom "Not implemented: navigation" on href/search mutations
    let currentUrl = 'http://localhost:4000/';
    let currentSearch = '';
    let currentPathname = '/';
    let currentHash = '';
    const locationShim = {
      get href() { return currentUrl; },
      set href(val: string) {
        currentUrl = String(val);
        try {
          const parsed = new URL(currentUrl, 'http://localhost:4000');
          currentPathname = parsed.pathname;
          currentSearch = parsed.search;
          currentHash = parsed.hash;
        } catch {}
      },
      assign: (url: string) => { locationShim.href = url; },
      replace: (url: string) => { locationShim.href = url; },
      reload: () => {},
      toString: () => currentUrl,
      origin: 'http://localhost:4000',
      protocol: 'http:',
      host: 'localhost:4000',
      hostname: 'localhost',
      port: '4000',
      get pathname() { return currentPathname; },
      set pathname(val: string) { currentPathname = String(val); },
      get search() { return currentSearch; },
      set search(val: string) { currentSearch = String(val); },
      get hash() { return currentHash; },
      set hash(val: string) { currentHash = String(val); }
    };
    try {
      delete (window as any).location;
      (window as any).location = locationShim;
    } catch {
      Object.defineProperty(window, 'location', {
        value: locationShim,
        writable: true,
        configurable: true
      });
    }

    // Prevent jsdom "Not implemented: navigation" on anchor clicks and form submits
    if (typeof document !== 'undefined') {
      document.addEventListener(
        'click',
        (e: MouseEvent) => {
          const target = (e.target as HTMLElement)?.closest?.('a');
          if (target && target.getAttribute('href')) {
            e.preventDefault();
          }
        },
        true
      );

      document.addEventListener(
        'submit',
        (e: Event) => {
          e.preventDefault();
        },
        true
      );
    }
  } catch {
    // Ignore in non-DOM contexts
  }
}
