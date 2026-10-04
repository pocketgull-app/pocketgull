import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandedQrCodeComponent } from './branded-qr-code.component';

@Component({
  selector: 'app-pocketgull-ai-social-card',
  standalone: true,
  imports: [CommonModule, BrandedQrCodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Simple Scannable PocketGull AI Social Card -->
    <div class="rounded-3xl border border-teal-500/30 bg-zinc-950/95 backdrop-blur-xl p-5 shadow-2xl max-w-sm w-full mx-auto text-zinc-100 font-sans space-y-4">
      
      <!-- Card Header: Mascot + Brand -->
      <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-teal-500 p-0.5 shadow-lg shadow-teal-500/20 shrink-0">
          <img 
            src="/images/google_admin_origami_solo_whitebg_320x132.png" 
            alt="PocketGull AI Mascot" 
            class="w-full h-full object-cover object-center rounded-[14px] bg-white p-1"
          />
        </div>
        <div>
          <h4 class="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5 font-pocketgull-inter">
            <span>PocketGull AI</span>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              OFFICIAL
            </span>
          </h4>
          <span class="text-[11px] text-zinc-400 font-mono block">
            Sovereign Clinical Co-Pilot
          </span>
        </div>
      </div>

      <!-- Scannable High-Contrast Branded QR Code Area -->
      <div class="flex items-center justify-center">
        <app-branded-qr-code
          [data]="'https://pocketgull.app'"
          [size]="160"
          variant="teal"
          [title]="'Explore PocketGull'"
          [subtitle]="'Scan with Phone Camera'"
          [destinationSummary]="'https://pocketgull.app'"
          downloadFilename="pocketgull-social-card-qr.png"
          [enableCopy]="true"
          ariaLabel="Official PocketGull Application QR Code">
        </app-branded-qr-code>
      </div>

      <!-- Quick Action / Link -->
      <div class="flex items-center justify-between text-xs font-mono pt-1">
        <span class="text-zinc-400 truncate">pocketgull.app</span>
        <a 
          href="https://pocketgull.app" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition"
        >
          <span>Open Direct</span>
          <span>→</span>
        </a>
      </div>

    </div>
  `
})
export class PocketGullAiSocialCardComponent {}
