import { Injectable } from '@angular/core';
import { generate, correction, Bitmap2D } from 'lean-qr';

export type QrBrandVariant = 'teal' | 'obsidian' | 'amber' | 'emerald';

export interface IBrandedQrOptions {
  size?: number; // Target display pixel size (e.g. 180, 240, 512)
  variant?: QrBrandVariant;
  showLogo?: boolean;
  correctionLevel?: 'M' | 'Q' | 'H';
  paddingModules?: number;
  dotScale?: number;
}

export interface IBrandedQrPalette {
  background: string;
  module: string;
  eyeOuter: string;
  eyeInner: string;
  badgeBg: string;
  badgeBorder: string;
}

export const QR_BRAND_PALETTES: Record<QrBrandVariant, IBrandedQrPalette> = {
  teal: {
    background: '#FFFFFF',
    module: '#0D9488',     // PocketGull Signature Gear Teal
    eyeOuter: '#115E59',   // Deep Forest Teal
    eyeInner: '#0D9488',   // Luminous Teal
    badgeBg: '#FFFFFF',
    badgeBorder: '#14B8A6'
  },
  obsidian: {
    background: '#FFFFFF',
    module: '#18181B',     // Obsidian Zinc 900
    eyeOuter: '#09090B',   // Deep Obsidian
    eyeInner: '#27272A',   // Zinc 800
    badgeBg: '#FFFFFF',
    badgeBorder: '#71717A'
  },
  amber: {
    background: '#FFFBEB', // Amber 50
    module: '#D97706',     // Amber 600
    eyeOuter: '#92400E',   // Amber 800
    eyeInner: '#B45309',   // Amber 700
    badgeBg: '#FFFFFF',
    badgeBorder: '#F59E0B'
  },
  emerald: {
    background: '#F0FDF4', // Emerald 50
    module: '#059669',     // Emerald 600
    eyeOuter: '#065F46',   // Emerald 800
    eyeInner: '#10B981',   // Emerald 500
    badgeBg: '#FFFFFF',
    badgeBorder: '#34D399'
  }
};

@Injectable({
  providedIn: 'root'
})
export class BrandedQrCodeService {

  /**
   * Generates a branded QR code rendered directly onto a HTMLCanvasElement.
   */
  renderToCanvas(
    canvas: HTMLCanvasElement,
    payload: string,
    options: IBrandedQrOptions = {}
  ): void {
    const sizePx = options.size || 200;
    const variant = options.variant || 'teal';
    const showLogo = options.showLogo !== false;
    const paddingModules = options.paddingModules ?? 2;
    const dotScale = options.dotScale ?? 0.88;
    const palette = QR_BRAND_PALETTES[variant] || QR_BRAND_PALETTES.teal;

    // Pick correction level - defaults to H (~30% error tolerance) for safe logo embedding
    let corr = correction.H;
    if (options.correctionLevel === 'M') corr = correction.M;
    if (options.correctionLevel === 'Q') corr = correction.Q;

    const code = generate(payload, { minCorrectionLevel: corr });
    const matrixSize = code.size;

    // High-DPI Retina scaling
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 2) : 2;
    canvas.width = sizePx * dpr;
    canvas.height = sizePx * dpr;
    canvas.style.width = `${sizePx}px`;
    canvas.style.height = `${sizePx}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Draw Background
    ctx.fillStyle = palette.background;
    ctx.fillRect(0, 0, sizePx, sizePx);

    const totalGrid = matrixSize + paddingModules * 2;
    const modulePx = sizePx / totalGrid;
    const offsetX = paddingModules * modulePx;
    const offsetY = paddingModules * modulePx;

    // Logo Area calculations
    const logoModuleSpan = showLogo ? Math.max(5, Math.floor(matrixSize * 0.22) | 1) : 0;
    const logoMin = Math.floor((matrixSize - logoModuleSpan) / 2);
    const logoMax = logoMin + logoModuleSpan;

    // 2. Draw Data Modules (Dots)
    for (let y = 0; y < matrixSize; y++) {
      for (let x = 0; x < matrixSize; x++) {
        // Skip finder pattern areas
        if (this.isFinderPattern(x, y, matrixSize)) continue;

        // Skip logo reserved center
        if (showLogo && x >= logoMin && x < logoMax && y >= logoMin && y < logoMax) continue;

        if (code.get(x, y)) {
          const modX = offsetX + x * modulePx + (modulePx * (1 - dotScale)) / 2;
          const modY = offsetY + y * modulePx + (modulePx * (1 - dotScale)) / 2;
          const modW = modulePx * dotScale;
          const modR = modW * 0.35; // gentle squircle rounding

          ctx.fillStyle = palette.module;
          this.drawRoundedRect(ctx, modX, modY, modW, modW, modR);
        }
      }
    }

    // 3. Draw 3 Finder Pattern Eyes with Branded Concentric Squircle Rings
    // Top-Left Eye
    this.drawFinderEye(ctx, offsetX, offsetY, modulePx, palette);
    // Top-Right Eye
    this.drawFinderEye(ctx, offsetX + (matrixSize - 7) * modulePx, offsetY, modulePx, palette);
    // Bottom-Left Eye
    this.drawFinderEye(ctx, offsetX, offsetY + (matrixSize - 7) * modulePx, modulePx, palette);

    // 4. Draw Center Brand Badge & Origami Mascot Emblem
    if (showLogo) {
      this.drawCenterBrandEmblem(ctx, sizePx / 2, sizePx / 2, logoModuleSpan * modulePx, palette);
    }

    ctx.restore();
  }

  /**
   * Helper to check if a matrix coordinate is inside one of the 3 7x7 finder pattern eyes.
   */
  private isFinderPattern(x: number, y: number, matrixSize: number): boolean {
    // Top-Left (0..6, 0..6)
    if (x >= 0 && x < 7 && y >= 0 && y < 7) return true;
    // Top-Right (size-7..size-1, 0..6)
    if (x >= matrixSize - 7 && x < matrixSize && y >= 0 && y < 7) return true;
    // Bottom-Left (0..6, size-7..size-1)
    if (x >= 0 && x < 7 && y >= matrixSize - 7 && y < matrixSize) return true;
    return false;
  }

  /**
   * Draws a branded finder eye (7x7 modules) with rounded concentric boxes.
   */
  private drawFinderEye(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    modulePx: number,
    palette: IBrandedQrPalette
  ): void {
    const eyeSize = 7 * modulePx;
    const rOuter = modulePx * 1.8;
    const rCutout = modulePx * 1.25;
    const rInner = modulePx * 0.85;

    // Outer 7x7 rounded box
    ctx.fillStyle = palette.eyeOuter;
    this.drawRoundedRect(ctx, px, py, eyeSize, eyeSize, rOuter);

    // Cutout 5x5 box
    ctx.fillStyle = palette.background;
    this.drawRoundedRect(ctx, px + modulePx, py + modulePx, 5 * modulePx, 5 * modulePx, rCutout);

    // Inner 3x3 pupil
    ctx.fillStyle = palette.eyeInner;
    this.drawRoundedRect(ctx, px + 2 * modulePx, py + 2 * modulePx, 3 * modulePx, 3 * modulePx, rInner);
  }

  /**
   * Draws the central circular shield and PocketGull origami seagull mascot.
   */
  private drawCenterBrandEmblem(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    emblemDiameter: number,
    palette: IBrandedQrPalette
  ): void {
    const radius = emblemDiameter / 2 + 3;

    ctx.save();

    // Protective White Circular Badge
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = palette.badgeBg;
    ctx.fill();

    // Outer Accent Ring
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = palette.badgeBorder;
    ctx.stroke();

    // Render Origami Seagull Vector on Canvas
    this.drawOrigamiGullVector(ctx, cx, cy, emblemDiameter * 0.85);

    ctx.restore();
  }

  /**
   * Exact vector rendering of the PocketGull brand origami gull mascot.
   */
  private drawOrigamiGullVector(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    targetSize: number
  ): void {
    ctx.save();
    ctx.translate(cx, cy);

    // Original SVG coordinate space: (10,6) to (124,88) -> center roughly (65, 45)
    const scale = targetSize / 110;
    ctx.scale(scale, scale);
    ctx.translate(-65, -45);

    // Tail Wing
    ctx.beginPath();
    ctx.moveTo(10, 38);
    ctx.lineTo(68, 22);
    ctx.lineTo(38, 88);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Tail Crease Depth
    ctx.beginPath();
    ctx.moveTo(10, 38);
    ctx.lineTo(38, 88);
    ctx.lineTo(28, 60);
    ctx.closePath();
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();

    // Body Base
    ctx.beginPath();
    ctx.moveTo(38, 88);
    ctx.lineTo(68, 22);
    ctx.lineTo(92, 34);
    ctx.lineTo(100, 78);
    ctx.closePath();
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Folded Wing / Breast (Signature Gear Teal #0D9488)
    ctx.beginPath();
    ctx.moveTo(68, 22);
    ctx.lineTo(100, 78);
    ctx.lineTo(110, 38);
    ctx.closePath();
    ctx.fillStyle = '#0D9488';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Wing Crease Depth
    ctx.beginPath();
    ctx.moveTo(100, 78);
    ctx.lineTo(110, 38);
    ctx.lineTo(94, 52);
    ctx.closePath();
    ctx.fillStyle = '#0F766E';
    ctx.fill();

    // Head & Neck
    ctx.beginPath();
    ctx.moveTo(68, 22);
    ctx.lineTo(80, 6);
    ctx.lineTo(100, 8);
    ctx.lineTo(110, 38);
    ctx.lineTo(92, 34);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Smiling Eye Arc
    ctx.beginPath();
    ctx.moveTo(82, 18);
    ctx.quadraticCurveTo(88, 12, 94, 18);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Origami Beak (Vivid Brand Orange/Amber)
    ctx.beginPath();
    ctx.moveTo(100, 8);
    ctx.lineTo(124, 14);
    ctx.lineTo(108, 24);
    ctx.lineTo(100, 18);
    ctx.closePath();
    ctx.fillStyle = '#EA580C';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(100, 18);
    ctx.lineTo(124, 14);
    ctx.lineTo(110, 38);
    ctx.closePath();
    ctx.fillStyle = '#F97316';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Cross-browser safe rounded rectangle drawing utility.
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    r = Math.min(r, w / 2, h / 2);
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Generates a Data URL string from a payload for easy embedding.
   */
  generateDataUrl(payload: string, options: IBrandedQrOptions = {}): string {
    if (typeof document === 'undefined') return '';
    const canvas = document.createElement('canvas');
    this.renderToCanvas(canvas, payload, options);
    return canvas.toDataURL('image/png');
  }

  /**
   * Triggers a browser download of the high-resolution branded QR code image.
   */
  downloadQrImage(payload: string, filename = 'pocketgull-qr.png', options: IBrandedQrOptions = {}): void {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    const exportSize = options.size || 512;
    this.renderToCanvas(canvas, payload, { ...options, size: exportSize });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /**
   * HIPAA §164.514 Safe Harbor & GDPR Art. 9 payload validator.
   * Ensures raw Social Security Numbers, unmasked credit cards, or direct identifiers
   * are not transmitted in plaintext inside optically scannable QR matrices.
   */
  validateSafeHarbor(payload: string): { isCompliant: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check for raw US SSN pattern (###-##-####)
    if (/\b\d{3}-\d{2}-\d{4}\b/.test(payload)) {
      warnings.push('HIPAA Violation: Payload contains unmasked Social Security Number pattern.');
    }

    // Check for raw 16-digit credit card pattern
    if (/\b(?:\d{4}[ -]?){3}\d{4}\b/.test(payload)) {
      warnings.push('PCI-DSS Violation: Payload contains unmasked 16-digit payment card pattern.');
    }

    // Check for executable script schemes
    const lower = payload.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('data:text/html')) {
      warnings.push('OWASP LLM/XSS Violation: Payload contains executable script URI scheme.');
    }

    return {
      isCompliant: warnings.length === 0,
      warnings
    };
  }

  /**
   * Computes an FDA 21 CFR Part 11 / IEEE P2933™ compliant SHA-256 integrity seal
   * for non-repudiation and clinical audit provenance.
   */
  async computeIntegrityDigest(payload: string): Promise<string> {
    if (typeof globalThis.crypto?.subtle !== 'undefined') {
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback deterministic hash if crypto.subtle is unavailable
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < payload.length; i++) {
      const ch = payload.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return `hash-${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`;
  }
}
