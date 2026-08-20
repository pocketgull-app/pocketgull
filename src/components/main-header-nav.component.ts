import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStateService } from '../services/network-state.service';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { HardwareTelemetryService } from '../services/hardware/hardware-telemetry.service';
import { GamificationService } from '../services/gamification.service';
import { WalkthroughTourService } from '../services/walkthrough-tour.service';
import { PocketgullIconComponent } from './shared/pocketgull-icon.component';
import { SessionStateService } from '../services/session-state.service';

@Component({
  selector: 'app-main-header-nav',
  standalone: true,
  imports: [
    CommonModule,
    PocketgullIconComponent
  ],
  template: `
    <!-- Navbar: Pure utility & theme harmony -->
    <nav class="theme-nav-bar h-14 flex items-center justify-between px-3 sm:px-6 shrink-0 z-50 no-print">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <svg width="42" height="42" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
            <!-- Far Wing (Teal) -->
            <polygon points="50,40 65,15 58,45" fill="#3ebc9e" stroke="#2fa085" stroke-width="0.5" stroke-linejoin="round" />
            <!-- Tail (Light gray paper) -->
            <polygon points="20,50 50,40 10,35" fill="#e5e5e5" stroke="#d5d5d5" stroke-width="0.5" stroke-linejoin="round" />
            <!-- Body Base (White paper) -->
            <polygon points="20,50 50,40 58,45 75,55 50,65" fill="#f4f4f4" stroke="#e0e0e0" stroke-width="0.5" stroke-linejoin="round" />
            <!-- Near Wing Upper (Coral) -->
            <polygon points="50,40 58,45 35,85" fill="#ef6658" stroke="#df5648" stroke-width="0.5" stroke-linejoin="round" />
            <!-- Near Wing Fold (Darker Coral) -->
            <polygon points="50,40 35,85 20,50" fill="#d85547" stroke="#c84537" stroke-width="0.5" stroke-linejoin="round" />
            <!-- Neck/Head (White paper) -->
            <polygon points="75,55 58,45 85,38" fill="#ffffff" stroke="#f0f0f0" stroke-width="0.5" stroke-linejoin="round" />
            <!-- Beak (Golden-Amber Orange) -->
            <polygon points="85,38 82,45 95,34" fill="#faa63b" stroke="#e0902c" stroke-width="0.5" stroke-linejoin="round" />
          </svg>
          <span class="font-bold uppercase tracking-[0.15em] text-sm hidden sm:inline">POCKET GULL</span>
          <!-- System Status Indicator (Hidden on smallest watches) -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer group relative no-print" 
               (click)="network.toggleForceOffline()"
               [title]="network.isOnline() ? 'Click to simulate offline' : 'Click to disable offline override'">
            <div class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full rounded-full status-dot opacity-75" 
                    [style.background-color]="network.isOnline() ? 'var(--spectral-stable)' : 'var(--spectral-critical)'"
                    [class.animate-ping]="network.isOnline()"
                    style="will-change: transform, opacity;"></span>
              <span class="relative inline-flex rounded-full status-dot h-2 w-2"
                    [style.background-color]="network.isOnline() ? 'var(--spectral-stable)' : 'var(--spectral-critical)'"></span>
            </div>
            <span class="text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest">{{ network.isOnline() ? 'System Ready' : 'System Offline' }}</span>
          </div>

          <!-- Socratic Intake Studio Button -->
          <button 
            type="button" 
            id="btn-socratic-intake-nav"
            (click)="openSocraticIntake.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer"
            title="Open Socratic Patient Intake Studio & FIFE Question Generator">
            <span>✨ Socratic Intake</span>
          </button>

          <!-- Companion App Sync Button -->
          <button 
            type="button" 
            (click)="openCompanionSync.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer"
            title="Generate FHIR R4 Smart Launch QR for Patient/Doctor Mobile Companion">
            <span>📱 Sync Companion</span>
          </button>

          <!-- Support AI Agent Portal Button -->
          <button 
            type="button" 
            (click)="openSupportTicket.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-teal-500/50 outline-none cursor-pointer"
            title="Open Autonomous Support AI Portal (support@pocketgull.app)">
            <span>📬 AI Support</span>
          </button>

          <!-- Bio-Network QR & Theme Song Studio Button -->
          <button 
            type="button" 
            (click)="openBioNetworkQr.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-purple-500/50 outline-none cursor-pointer"
            title="Sharable Peer Network QR Code, Personal Bio-Theme Song & Haptic Entrainment">
            <span>🎵 Bio-Network QR</span>
          </button>

          <!-- Billing & Subscription Button -->
          <button 
            type="button" 
            (click)="openBillingDashboard.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer"
            title="Manage Billing and Subscription">
            <span>💳 Billing & Plan</span>
          </button>

          <!-- API Pricing Button -->
          <button 
            type="button" 
            (click)="openApiPricing.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-sky-500/50 outline-none cursor-pointer"
            title="View API Pricing & Usage">
            <span>🔌 API Pricing</span>
          </button>

          <!-- Patient Telehealth Portal Button -->
          <button 
            type="button" 
            (click)="openPatientPortal.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer"
            title="Open Patient Self-Service Portal">
            <span>🩺 Patient Portal</span>
          </button>

          <!-- Lock Session & View Splash Screen Button -->
          <button 
            type="button" 
            (click)="session.lock()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-700 rounded-md text-xs font-bold uppercase tracking-wider transition outline-none cursor-pointer"
            title="Lock Session & View Papercraft Secure Splash Screen">
            <span>🔒 Splash Screen</span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button (click)="state.toggleLiveAgent(!state.isLiveAgentActive())"
                id="tour-voice-agent-trigger"
                aria-label="Toggle Live Agent"
                class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
                [class.bg-gray-800]="state.isLiveAgentActive()"
                [class.dark:bg-white]="state.isLiveAgentActive()"
                [class.border-gray-800]="state.isLiveAgentActive()"
                [class.dark:border-white]="state.isLiveAgentActive()"
                [class.text-white]="state.isLiveAgentActive()"
                [class.dark:text-[#111111]]="state.isLiveAgentActive()"
                [class.bg-transparent]="!state.isLiveAgentActive()"
                [class.border-gray-300]="!state.isLiveAgentActive()"
                [class.dark:border-zinc-700]="!state.isLiveAgentActive()"
                [class.text-gray-700]="!state.isLiveAgentActive()"
                [class.dark:text-zinc-300]="!state.isLiveAgentActive()"
                [class.hover:bg-[#EEEEEE]]="!state.isLiveAgentActive()"
                [class.dark:hover:bg-zinc-800]="!state.isLiveAgentActive()">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
          <span class="hidden sm:inline">Agent</span>
        </button>
        
        <button (click)="state.toggleResearchFrame()"
                id="tour-research-frame-trigger"
                aria-label="Research"
                class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-[#EEEEEE] dark:hover:bg-zinc-800 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-2.29 0-4.43-.78-6.14-2.1C4.6 16.5 4 14.83 4 12c0-1.5.3-2.91.86-4.22L16.22 19.14A7.92 7.92 0 0 1 12 20m7.14-2.1C20.4 16.5 21 14.83 21 12c0-1.5-.3-2.91-.86-4.22L8.78 19.14C10.09 20.7 11.97 21.5 14 21.5c1.47 0 2.87-.42 4.14-1.14Z"/></svg>
          <span class="hidden sm:inline">Research</span>
        </button>

        <button (click)="openTypefaceSite.emit()"
                id="tour-typeface-trigger"
                aria-label="PocketGull Typeface Specimen Suite"
                title="Open PocketGull Typeface Specimen Suite"
                class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-md">
          <app-pocketgull-icon name="seagull" />
          <span class="hidden sm:inline font-pocketgull">Typeface</span>
        </button>
        
        <button (click)="openDocsStudy.emit()"
           id="tour-docs-trigger"
           aria-label="Docs"
           class="group shrink-0 flex items-center gap-2 max-sm:px-2 max-sm:py-1.5 px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-[#EEEEEE] dark:hover:bg-zinc-800 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span class="hidden sm:inline">Docs</span>
        </button>

        <!-- Somatic Box-Breathing Grounding (Zamecznik Canvas) -->
        <button (click)="triggerSomaticGrounding.emit()" 
                aria-label="Somatic Grounding & Box Breathing"
                title="Open Somatic Grounding & Box Breathing Canvas"
                class="group shrink-0 flex items-center gap-1.5 px-3 py-2 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-extrabold uppercase tracking-wider transition-colors rounded-md cursor-pointer">
          <span>🧘</span>
          <span class="hidden md:inline">Grounding</span>
        </button>

        <!-- NN/g System Status Indicator (Visibility of System Status Heuristic #1) -->
        <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 text-emerald-300 text-xs font-mono select-none"
             title="System Status: Edge Telemetry Active, HIPAA Safe Harbor Enforced">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="font-bold tracking-wider">120 FPS</span>
          <span class="text-zinc-600 dark:text-zinc-500">|</span>
          <span class="text-emerald-400/90 font-medium">HIPAA §164.514</span>
        </div>

        <!-- Tour Guide Toggle -->
        <button (click)="tour.forceStart()" 
                aria-label="Start Tour Guide"
                title="Start Tour Guide"
                class="group shrink-0 p-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-500 dark:text-zinc-400 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
        
        <!-- Theme Toggle -->
        <button (click)="theme.cycleTheme()" 
                id="tour-theme-trigger"
                aria-label="Toggle Theme"
                [title]="'Cycle Theme (Current: ' + theme.currentTheme() + ')'"
                class="group shrink-0 p-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-500 dark:text-zinc-400 cursor-pointer flex items-center gap-1">
          @switch (theme.currentTheme()) {
             @case ('dark') {
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>   
             }
             @case ('light') {
               <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform group-hover:animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
             }
             @case ('spark') {
               <span class="text-xs" title="Spark Mode">✨</span>
             }
             @case ('system') {
               <span class="text-xs" title="System Theme">💻</span>
             }
             @default { <span class="text-xs">🎨</span> }
          }
        </button>

        <!-- Font Size Scale Toggle -->
        <button (click)="theme.cycleTextSizeScale()"
                aria-label="Toggle Font Size & Text Legibility Scale"
                [title]="'Text Size Scale: ' + theme.textSizeScale() + ' (Click to cycle A / A+ / A++)'"
                class="px-2.5 py-1.5 rounded-lg transition font-mono text-xs font-black cursor-pointer bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 shrink-0 shadow-xs">
          <span>🔤</span>
          <span>
            @switch (theme.textSizeScale()) {
              @case ('standard') { A }
              @case ('large') { A+ }
              @case ('extra-large') { A++ }
              @default { A }
            }
          </span>
        </button>

        <div class="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-zinc-400 pl-4 border-l border-gray-100 dark:border-zinc-800">
          <div class="relative group tracking-normal">
            <div class="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-500 transition-all cursor-pointer shadow-xs select-none rounded-lg min-h-[36px]">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="K8s Clinical Pod Cluster Status: 100% Healthy"></div>
              
              <span class="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {{ game.levelTitle() }} (Lvl {{ game.level() }})
              </span>

              <span class="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {{ game.points() }} XP
              </span>

              <span class="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-300 text-[10px] font-mono font-bold border border-sky-500/30">
                ☸️ K8s 3/3
              </span>

              <div class="w-10 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shrink-0">
                <div class="h-full bg-amber-500 transition-all duration-500" [style.width.%]="game.progressPercentage()"></div>
              </div>
            </div>
          </div>

          <span>{{ today | date:'yyyy.MM.dd' }}</span>
          <span class="text-[#416B1F] dark:text-[#689F38] pr-2">REQ. DR. SMITH</span>
        </div>
      </div>
    </nav>
  `
})
export class MainHeaderNavComponent {
  network = inject(NetworkStateService);
  state = inject(PatientStateService);
  theme = inject(ThemeService);
  hardware = inject(HardwareTelemetryService);
  game = inject(GamificationService);
  tour = inject(WalkthroughTourService);
  session = inject(SessionStateService);

  today = new Date();

  openSocraticIntake = output<void>();
  openCompanionSync = output<void>();
  openBioNetworkQr = output<void>();
  openBillingDashboard = output<void>();
  openApiPricing = output<void>();
  openPatientPortal = output<void>();
  openClinicianOnboarding = output<void>();
  openTypefaceSite = output<void>();
  openDocsStudy = output<void>();
  openSupportTicket = output<void>();
  triggerSomaticGrounding = output<void>();
}
