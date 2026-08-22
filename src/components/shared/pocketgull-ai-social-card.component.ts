import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pocketgull-ai-social-card',
  standalone: true,
  imports: [CommonModule],
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

      <!-- Scannable High-Contrast QR Code Area -->
      <div class="p-4 bg-white rounded-2xl shadow-inner flex flex-col items-center justify-center space-y-2.5">
        <!-- SVG Vector QR Code targeting https://pocketgull.app -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" class="w-40 h-40" shape-rendering="crispEdges">
          <!-- Background -->
          <rect width="33" height="33" fill="#ffffff"/>
          <!-- Top Left Finder Pattern -->
          <rect x="2" y="2" width="7" height="7" fill="#09090b"/>
          <rect x="3" y="3" width="5" height="5" fill="#ffffff"/>
          <rect x="4" y="4" width="3" height="3" fill="#09090b"/>
          <!-- Top Right Finder Pattern -->
          <rect x="24" y="2" width="7" height="7" fill="#09090b"/>
          <rect x="25" y="3" width="5" height="5" fill="#ffffff"/>
          <rect x="26" y="4" width="3" height="3" fill="#09090b"/>
          <!-- Bottom Left Finder Pattern -->
          <rect x="2" y="24" width="7" height="7" fill="#09090b"/>
          <rect x="3" y="25" width="5" height="5" fill="#ffffff"/>
          <rect x="4" y="26" width="3" height="3" fill="#09090b"/>
          <!-- Timing Patterns -->
          <rect x="10" y="5" width="13" height="1" fill="#09090b" stroke-dasharray="1,1"/>
          <rect x="5" y="10" width="1" height="13" fill="#09090b" stroke-dasharray="1,1"/>
          <!-- Alignment Pattern -->
          <rect x="22" y="22" width="5" height="5" fill="#09090b"/>
          <rect x="23" y="23" width="3" height="3" fill="#ffffff"/>
          <rect x="24" y="24" width="1" height="1" fill="#09090b"/>
          <!-- Stylized Data Matrix Dots -->
          <rect x="11" y="2" width="2" height="1" fill="#09090b"/>
          <rect x="15" y="2" width="1" height="2" fill="#09090b"/>
          <rect x="18" y="3" width="2" height="1" fill="#09090b"/>
          <rect x="21" y="2" width="1" height="1" fill="#09090b"/>
          <rect x="10" y="8" width="1" height="2" fill="#09090b"/>
          <rect x="13" y="7" width="2" height="1" fill="#09090b"/>
          <rect x="17" y="8" width="1" height="2" fill="#09090b"/>
          <rect x="20" y="7" width="2" height="2" fill="#09090b"/>
          <rect x="2" y="11" width="1" height="2" fill="#09090b"/>
          <rect x="4" y="12" width="2" height="1" fill="#09090b"/>
          <rect x="8" y="11" width="2" height="2" fill="#09090b"/>
          <rect x="12" y="12" width="3" height="2" fill="#09090b"/>
          <rect x="16" y="11" width="2" height="1" fill="#09090b"/>
          <rect x="20" y="12" width="1" height="3" fill="#09090b"/>
          <rect x="23" y="11" width="2" height="1" fill="#09090b"/>
          <rect x="27" y="12" width="2" height="2" fill="#09090b"/>
          <rect x="30" y="11" width="1" height="1" fill="#09090b"/>
          <rect x="10" y="15" width="2" height="2" fill="#09090b"/>
          <rect x="14" y="16" width="3" height="1" fill="#09090b"/>
          <rect x="19" y="15" width="2" height="2" fill="#09090b"/>
          <rect x="23" y="16" width="2" height="1" fill="#09090b"/>
          <rect x="27" y="15" width="1" height="2" fill="#09090b"/>
          <rect x="11" y="19" width="3" height="1" fill="#09090b"/>
          <rect x="16" y="19" width="1" height="3" fill="#09090b"/>
          <rect x="19" y="18" width="2" height="2" fill="#09090b"/>
          <rect x="2" y="20" width="2" height="2" fill="#09090b"/>
          <rect x="6" y="21" width="1" height="2" fill="#09090b"/>
          <rect x="10" y="23" width="2" height="2" fill="#09090b"/>
          <rect x="14" y="22" width="1" height="3" fill="#09090b"/>
          <rect x="17" y="24" width="2" height="2" fill="#09090b"/>
          <rect x="29" y="21" width="2" height="2" fill="#09090b"/>
          <rect x="11" y="27" width="2" height="2" fill="#09090b"/>
          <rect x="15" y="26" width="2" height="1" fill="#09090b"/>
          <rect x="19" y="28" width="1" height="2" fill="#09090b"/>
          <rect x="28" y="26" width="3" height="2" fill="#09090b"/>
          <rect x="12" y="30" width="3" height="1" fill="#09090b"/>
          <rect x="17" y="29" width="2" height="2" fill="#09090b"/>
          <rect x="21" y="30" width="2" height="1" fill="#09090b"/>
          <rect x="25" y="29" width="1" height="2" fill="#09090b"/>
          <rect x="28" y="30" width="2" height="1" fill="#09090b"/>
        </svg>

        <span class="text-[10px] font-bold font-mono text-zinc-800 tracking-wider uppercase">
          📱 Scan with Phone Camera
        </span>
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
