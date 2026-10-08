import {
  Component,
  model,
  signal,
  computed,
  inject,
  ElementRef,
  viewChild,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BrandedQrCodeService,
  QrBrandVariant,
  IBrandedQrOptions,
  QR_BRAND_PALETTES
} from '../../services/branded-qr-code.service';

@Component({
  selector: 'app-branded-qr-code',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses()">
      
      <!-- Optional Header Section (Card Mode) -->
      @if (showCard() && (title() || subtitle())) {
        <div class="mb-3 space-y-1 w-full text-center">
          @if (title()) {
            <div class="flex items-center justify-center gap-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    [class]="badgeClasses()">
                {{ variantBadgeText() }}
              </span>
              <h4 class="text-xs font-black tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                {{ title() }}
              </h4>
            </div>
          }
          @if (subtitle()) {
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
              {{ subtitle() }}
            </p>
          }
        </div>
      }

      <!-- QR Canvas Frame with Anti-Tamper Visual Cushion -->
      <div class="relative p-2.5 bg-white rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-700/80 inline-flex items-center justify-center overflow-hidden group">
        <canvas #qrCanvas
                [attr.aria-label]="ariaLabel() || title() || 'PocketGull QR Code'"
                role="img"
                class="rounded-xl transition-transform duration-300 group-hover:scale-[1.01]">
        </canvas>
      </div>

      <!-- IEEE Anti-Quishing / Destination Grounding Badge -->
      @if (showDestinationGrounding() && effectiveDestinationSummary()) {
        <div class="mt-2.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 max-w-full text-center font-mono">
          <span class="text-[9.5px] text-zinc-600 dark:text-zinc-300 font-bold block truncate"
                [attr.title]="effectiveDestinationSummary()">
            {{ effectiveDestinationSummary() }}
          </span>
          <span class="text-[8.5px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <span>🛡️</span> Verified PocketGull Protocol
          </span>
        </div>
      }

      <!-- Inline Title / Subtitle (When NOT in Card Mode) -->
      @if (!showCard() && (title() || subtitle())) {
        <div class="text-center font-mono mt-1">
          @if (title()) {
            <span class="block text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
              {{ title() }}
            </span>
          }
          @if (subtitle()) {
            <span class="block text-[9.5px] text-zinc-500 dark:text-zinc-400">
              {{ subtitle() }}
            </span>
          }
        </div>
      }

      <!-- Action Buttons (Copy & High-Res Download) -->
      @if (enableCopy() || enableDownload()) {
        <div class="mt-3 flex flex-wrap items-center justify-center gap-2 w-full pt-2.5 border-t border-zinc-200/60 dark:border-zinc-800">
          @if (enableCopy()) {
            <button type="button"
                    (click)="copyPayload()"
                    [attr.aria-label]="copied() ? 'Copied to clipboard' : 'Copy QR data to clipboard'"
                    class="px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 touch-manipulation shadow-xs"
                    [class]="buttonCopyClasses()">
              @if (copied()) {
                <span>✔ Copied!</span>
              } @else {
                <span>📋 Copy</span>
              }
            </button>
          }

          @if (enableDownload()) {
            <button type="button"
                    (click)="downloadImage()"
                    aria-label="Download high-resolution branded QR PNG"
                    class="px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 touch-manipulation shadow-xs">
              <span>📥 PNG</span>
            </button>
          }
        </div>
      }

    </div>
  `
})
export class BrandedQrCodeComponent {
  private readonly qrService = inject(BrandedQrCodeService);
  private readonly elRef = inject(ElementRef, { optional: true });

  // Core Inputs / Models
  readonly data = model<string>('');
  readonly size = model<number>(180);
  readonly variant = model<QrBrandVariant>('teal');
  readonly showLogo = model<boolean>(true);
  readonly correctionLevel = model<'M' | 'Q' | 'H'>('H');
  readonly paddingModules = model<number>(2);
  readonly dotScale = model<number>(0.88);

  // Presentation & Security Inputs (IEEE Anti-Quishing Standard)
  readonly showCard = model<boolean>(false);
  readonly showDestinationGrounding = model<boolean>(true);
  readonly title = model<string>('');
  readonly subtitle = model<string>('');
  readonly ariaLabel = model<string>('');
  readonly enableCopy = model<boolean>(false);
  readonly enableDownload = model<boolean>(false);
  readonly downloadFilename = model<string>('pocketgull-qr.png');
  readonly destinationSummary = model<string>('');

  // Internal Signals & References
  readonly copied = signal<boolean>(false);
  readonly qrCanvas = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvas');

  // IEEE Anti-Quishing: Human-Readable Destination Grounding
  readonly effectiveDestinationSummary = computed(() => {
    const custom = this.destinationSummary().trim();
    if (custom) return custom;

    const raw = this.data().trim();
    if (!raw) return '';

    // Check for standard URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const u = new URL(raw);
        return `${u.protocol}//${u.host}${u.pathname}`;
      } catch {
        return raw.slice(0, 48);
      }
    }

    // Check for offline CHW or FHIR JSON payload
    if (raw.startsWith('{') && raw.includes('POCKETGULL_CHW_HANDOFF')) {
      return 'Offline Mesh: POCKETGULL_CHW_HANDOFF';
    }

    if (raw.startsWith('{') && raw.includes('resourceType')) {
      return 'Offline HL7 FHIR R4 Bundle';
    }

    return raw.length > 40 ? `${raw.slice(0, 37)}...` : raw;
  });

  // Computed Container Classes
  readonly containerClasses = computed(() => {
    if (!this.showCard()) {
      return 'inline-flex flex-col items-center';
    }

    switch (this.variant()) {
      case 'amber':
        return 'p-5 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col items-center bg-amber-50/60 dark:bg-zinc-900 border-amber-200 dark:border-amber-900/40 text-amber-950 dark:text-amber-100';
      case 'emerald':
        return 'p-5 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col items-center bg-emerald-50/60 dark:bg-zinc-900 border-emerald-200 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-100';
      case 'obsidian':
        return 'p-5 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col items-center bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100';
      case 'teal':
      default:
        return 'p-5 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col items-center bg-teal-50/40 dark:bg-zinc-900 border-teal-200/80 dark:border-teal-900/40 text-zinc-900 dark:text-zinc-100';
    }
  });

  readonly badgeClasses = computed(() => {
    switch (this.variant()) {
      case 'amber':
        return 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30';
      case 'obsidian':
        return 'bg-zinc-500/20 text-zinc-800 dark:text-zinc-300 border border-zinc-500/30';
      case 'teal':
      default:
        return 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30';
    }
  });

  readonly variantBadgeText = computed(() => {
    switch (this.variant()) {
      case 'amber':
        return 'Ayurvedic / Amber';
      case 'emerald':
        return 'TCM / Frontline';
      case 'obsidian':
        return 'Clinical Obsidian';
      case 'teal':
      default:
        return 'PocketGull Teal';
    }
  });

  readonly buttonCopyClasses = computed(() => {
    if (this.copied()) {
      return 'bg-emerald-600 text-white border-emerald-600';
    }
    return 'bg-teal-600 hover:bg-teal-500 text-white border-transparent';
  });

  constructor() {
    // Re-render whenever reactive inputs change
    effect(() => {
      // Track reactive dependencies
      this.data();
      this.size();
      this.variant();
      this.showLogo();
      this.correctionLevel();
      this.paddingModules();
      this.dotScale();
      this.qrCanvas();

      this.renderQrCode();
    });
  }

  renderQrCode(targetCanvas?: HTMLCanvasElement): void {
    const canvasEl = targetCanvas || this.qrCanvas()?.nativeElement || (this.elRef?.nativeElement?.querySelector ? this.elRef.nativeElement.querySelector('canvas') : null);
    const payload = this.data();
    const sz = this.size();
    const vr = this.variant();
    const logo = this.showLogo();
    const corr = this.correctionLevel();
    const pad = this.paddingModules();
    const dot = this.dotScale();

    if (!canvasEl) return;

    if (!payload) {
      // Clear canvas if no data
      if (typeof canvasEl.getContext === 'function') {
        const ctx = canvasEl.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        }
      }
      return;
    }

    // IEEE / OWASP Security: Sanitize against executable script injection
    const sanitized = this.sanitizePayload(payload);

    const options: IBrandedQrOptions = {
      size: sz,
      variant: vr,
      showLogo: logo,
      correctionLevel: corr,
      paddingModules: pad,
      dotScale: dot
    };

    try {
      this.qrService.renderToCanvas(canvasEl, sanitized, options);
    } catch (err) {
      console.warn('[BrandedQrCodeComponent] Failed to render branded QR:', err);
    }
  }

  async copyPayload(): Promise<boolean> {
    const payload = this.data();
    if (!payload || typeof navigator === 'undefined' || !navigator.clipboard) return false;

    try {
      await navigator.clipboard.writeText(payload);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
      return true;
    } catch (err) {
      console.warn('[BrandedQrCodeComponent] Failed to copy QR payload:', err);
      return false;
    }
  }

  downloadImage(): void {
    const payload = this.data();
    if (!payload) return;

    const sanitized = this.sanitizePayload(payload);
    const options: IBrandedQrOptions = {
      size: Math.max(this.size() * 2, 400), // High-res download
      variant: this.variant(),
      showLogo: this.showLogo(),
      correctionLevel: this.correctionLevel(),
      paddingModules: this.paddingModules(),
      dotScale: this.dotScale()
    };

    this.qrService.downloadQrImage(sanitized, this.downloadFilename(), options);
  }

  private sanitizePayload(raw: string): string {
    if (!raw) return '';
    const trimmed = raw.trim();
    // Guard against javascript: / data:text/html executable XSS in QR readers
    if (/^(?:javascript|data:text\/html)/i.test(trimmed)) {
      return 'https://pocketgull.app/security/blocked-unsafe-uri';
    }
    return trimmed;
  }
}
