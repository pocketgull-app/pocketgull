import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkStateService } from '../services/network-state.service';
import { PatientStateService } from '../services/patient-state.service';
import { ThemeService } from '../services/theme.service';
import { HardwareTelemetryService } from '../services/hardware/hardware-telemetry.service';
import { GamificationService } from '../services/gamification.service';
import { WalkthroughTourService } from '../services/walkthrough-tour.service';
import { SessionStateService } from '../services/session-state.service';
import { PocketgullIconComponent } from './shared/pocketgull-icon.component';
import { PocketgullBrandMarkComponent } from './shared/pocketgull-brand-mark.component';
import { AmbientFlowPlayerComponent } from './shared/ambient-flow-player.component';
import { AmbientFlowSoundscapeService } from '../services/ambient-flow-soundscape.service';

@Component({
  selector: 'app-main-header-nav',
  standalone: true,
  imports: [
    CommonModule,
    PocketgullIconComponent,
    PocketgullBrandMarkComponent,
    AmbientFlowPlayerComponent
  ],
  template: `
    <!-- Navbar: Pure utility & theme harmony -->
    <nav class="theme-nav-bar h-14 flex items-center justify-between px-3 sm:px-6 shrink-0 z-50 no-print relative">
      <div class="flex items-center gap-3 min-w-0">
        <a href="/" class="flex items-center gap-2.5 shrink-0 cursor-pointer group select-none">
          <app-pocketgull-brand-mark size="sm" [showSubtext]="false" />
        </a>

        <!-- System Status Indicator (Hidden on small screens) -->
        <div class="hidden 2xl:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer group relative no-print shrink-0" 
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

        <!-- Desktop Quick Utility Bar (Hidden on mobile / tablet) -->
        <div class="hidden xl:flex items-center gap-2 overflow-hidden">
          <!-- Ambient Flow Background Music Toggle Button -->
          <button 
            type="button" 
            (click)="showAmbientPlayer.set(!showAmbientPlayer())"
            [class.bg-teal-500/20]="soundscapeService.isPlaying()"
            [class.text-teal-700]="soundscapeService.isPlaying()"
            [class.dark:text-teal-300]="soundscapeService.isPlaying()"
            [class.border-teal-500/50]="soundscapeService.isPlaying()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-teal-500/50 outline-none cursor-pointer shrink-0"
            title="Toggle Ambient Flow Soundscape & Offline Binaural Focus Music">
            <span>{{ soundscapeService.isPlaying() ? '🎶 Flow Active' : '🎵 Ambient Flow' }}</span>
          </button>

          <!-- Socratic Intake Studio Button -->
          <button 
            type="button" 
            id="btn-socratic-intake-nav"
            (click)="openSocraticIntake.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer shrink-0"
            title="Open Socratic Patient Intake Studio & FIFE Question Generator">
            <span>✨ Socratic Intake</span>
          </button>

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
            class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer shrink-0"
            title="Generate FHIR R4 Smart Launch QR for Patient/Doctor Mobile Companion">
            <span>📱 Sync Companion</span>
          </button>

          <!-- Support AI Agent Portal Button -->
          <button 
            type="button" 
            (click)="openSupportTicket.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-teal-500/50 outline-none cursor-pointer shrink-0"
            title="Open Autonomous Support AI Portal (support@pocketgull.app)">
            <span>📬 AI Support</span>
          </button>

          <!-- Bio-Network QR & Theme Song Studio Button -->
          <button 
            type="button" 
            (click)="openBioNetworkQr.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-purple-500/50 outline-none cursor-pointer shrink-0"
            title="Sharable Peer Network QR Code, Personal Bio-Theme Song & Haptic Entrainment">
            <span>🎵 Bio-Network</span>
          </button>

          <!-- Billing & Subscription Button -->
          <button 
            type="button" 
            (click)="openBillingDashboard.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer shrink-0"
            title="Manage Billing and Subscription">
            <span>💳 Billing</span>
          </button>

          <!-- Zero-Knowledge Encrypted Vault Button -->
          <button 
            type="button" 
            (click)="openEncryptedVault.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-emerald-500/50 outline-none cursor-pointer shrink-0"
            title="Zero-Knowledge AES-GCM-256 Client-Side Encrypted Patient Vault">
            <span>🔐 Vault</span>
          </button>

          <!-- SMART on FHIR EHR Bridge Button -->
          <button 
            type="button" 
            (click)="openSmartFhirSync.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-sky-500/50 outline-none cursor-pointer shrink-0"
            title="SMART on FHIR R4 EHR Synchronizer (Epic, Cerner, HAPI)">
            <span>🏥 FHIR Sync</span>
          </button>

          <!-- WHO / NIH / NSF Global Health Strategic Suite Button -->
          <button 
            type="button" 
            (click)="openGlobalHealth.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-purple-500/50 outline-none cursor-pointer shrink-0"
            title="WHO SDG 3.4, ICD-11 Chapter 26 TCIM Dual-Coding & NIH Geroscience Suite">
            <span>🌐 Global Health</span>
          </button>

          <!-- Patient Telehealth Portal Button -->
          <button 
            type="button" 
            (click)="openPatientPortal.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-blue-500/50 outline-none cursor-pointer shrink-0"
            title="Open Patient Self-Service Portal">
            <span>🩺 Patient Portal</span>
          </button>

          <!-- Articles & Knowledge Hub Button -->
          <button 
            type="button" 
            (click)="openArticles.emit()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-amber-500/50 outline-none cursor-pointer shrink-0"
            title="Open Articles, SNO-10 Craft Analogies & 6th Grade Knowledge Hub">
            <span>📰 Articles</span>
          </button>
        </div>
      </div>

      <!-- Right Nav Action Suite -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Live AI Agent Consult Trigger (Always visible on mobile & desktop) -->
        <button (click)="state.toggleLiveAgent(!state.isLiveAgentActive())"
                id="tour-voice-agent-trigger"
                aria-label="Toggle Live Agent"
                class="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer shadow-xs"
                [class.bg-gray-800]="state.isLiveAgentActive()"
                [class.dark:bg-white]="state.isLiveAgentActive()"
                [class.border-gray-800]="state.isLiveAgentActive()"
                [class.dark:border-white]="state.isLiveAgentActive()"
                [class.text-white]="state.isLiveAgentActive()"
                [class.dark:text-[#111111]]="state.isLiveAgentActive()"
                [class.bg-white/80]="!state.isLiveAgentActive()"
                [class.dark:bg-zinc-900]="!state.isLiveAgentActive()"
                [class.border-gray-300]="!state.isLiveAgentActive()"
                [class.dark:border-zinc-700]="!state.isLiveAgentActive()"
                [class.text-gray-700]="!state.isLiveAgentActive()"
                [class.dark:text-zinc-300]="!state.isLiveAgentActive()">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
          <span class="text-[11px]">AI Agent</span>
        </button>

        <!-- Desktop Action Buttons (Hidden on mobile) -->
        <div class="hidden md:flex items-center gap-2">
          <button (click)="state.toggleResearchFrame()"
                  id="tour-research-frame-trigger"
                  aria-label="Research"
                  class="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-white/80 dark:bg-zinc-900">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-2.29 0-4.43-.78-6.14-2.1C4.6 16.5 4 14.83 4 12c0-1.5.3-2.91.86-4.22L16.22 19.14A7.92 7.92 0 0 1 12 20m7.14-2.1C20.4 16.5 21 14.83 21 12c0-1.5-.3-2.91-.86-4.22L8.78 19.14C10.09 20.7 11.97 21.5 14 21.5c1.47 0 2.87-.42 4.14-1.14Z"/></svg>
            <span>Research</span>
          </button>

          <button (click)="openTypefaceSite.emit()"
                  id="tour-typeface-trigger"
                  aria-label="PocketGull Typeface Specimen Suite"
                  title="Open PocketGull Typeface Specimen Suite"
                  class="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-lg">
            <app-pocketgull-icon name="seagull" />
            <span class="font-pocketgull">Typeface</span>
          </button>

          <!-- Somatic Box-Breathing Grounding -->
          <button (click)="triggerSomaticGrounding.emit()" 
                  aria-label="Somatic Grounding & Box Breathing"
                  title="Open Somatic Grounding & Box Breathing Canvas"
                  class="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-extrabold uppercase tracking-wider transition-colors rounded-lg cursor-pointer">
            <span>🧘</span>
            <span>Grounding</span>
          </button>

          <!-- Ambient Flow State Soundscape Trigger -->
          <button (click)="showAmbientPlayer.set(!showAmbientPlayer())"
                  id="tour-ambient-flow-trigger"
                  aria-label="Toggle Ambient Flow State Soundscape"
                  title="Toggle Ambient Flow State Soundscape (432 Hz, Pacific Surf, 528 Hz, 40 Hz Gamma)"
                  class="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 border transition-all rounded-lg cursor-pointer text-xs font-black uppercase tracking-wider"
                  [class.bg-teal-500/20]="soundscapeService.isPlaying()"
                  [class.border-teal-400]="soundscapeService.isPlaying()"
                  [class.text-teal-300]="soundscapeService.isPlaying()"
                  [class.border-teal-500/30]="!soundscapeService.isPlaying()"
                  [class.bg-teal-500/10]="!soundscapeService.isPlaying()"
                  [class.text-teal-700]="!soundscapeService.isPlaying()"
                  [class.dark:text-teal-400]="!soundscapeService.isPlaying()"
                  [class.hover:bg-teal-500/20]="!soundscapeService.isPlaying()">
            <span [class.animate-pulse]="soundscapeService.isPlaying()">
              {{ soundscapeService.isPlaying() ? '🎵' : '🌊' }}
            </span>
            <span>{{ soundscapeService.isPlaying() ? 'Flow: ' + soundscapeService.activePreset().carrierFreqHz + 'Hz' : 'Flow State' }}</span>
          </button>

          <!-- Theme Toggle -->
          <button (click)="theme.cycleTheme()" 
                  id="tour-theme-trigger"
                  aria-label="Toggle Theme"
                  [title]="'Cycle Theme (Current: ' + theme.currentTheme() + ')'"
                  class="group shrink-0 p-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 dark:text-zinc-400 cursor-pointer flex items-center gap-1 bg-white/80 dark:bg-zinc-900">
            @switch (theme.currentTheme()) {
               @case ('dark') {
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 transition-transform group-hover:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>   
               }
               @case ('light') {
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 transition-transform group-hover:animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
               }
               @case ('spark') {
                 <span class="text-xs">✨</span>
               }
               @case ('system') {
                 <span class="text-xs">💻</span>
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
        </div>

        <!-- Mobile Navigation Menu Toggle Button (Visible on screens < xl) -->
        <button 
          type="button"
          (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
          class="xl:hidden flex items-center justify-center p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white/90 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition cursor-pointer shadow-xs min-h-[44px] min-w-[44px]"
          aria-label="Open Mobile Navigation Menu">
          @if (isMobileMenuOpen()) {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          } @else {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </div>
    </nav>

    <!-- Mobile Drawer Overlay & Slide-out Menu -->
    @if (isMobileMenuOpen()) {
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm xl:hidden animate-in fade-in duration-200"
           (click)="isMobileMenuOpen.set(false)">
      </div>

      <div class="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto xl:hidden animate-in slide-in-from-right duration-300 overscroll-contain">
        <div class="space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div class="flex items-center gap-2">
              <app-pocketgull-icon name="seagull" />
              <span class="text-base font-bold text-zinc-900 dark:text-zinc-100 font-pocketgull-inter">PocketGull Navigation</span>
            </div>
            <button type="button" (click)="isMobileMenuOpen.set(false)" class="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white active:scale-95 cursor-pointer" aria-label="Close Mobile Menu">
              ✕
            </button>
          </div>

          <!-- Clinical Navigation Links (Fitts's Law 48px+ touch targets) -->
          <div class="space-y-2.5">
            <!-- Ambient Flow Background Music Player -->
            <button type="button" (click)="showAmbientPlayer.set(true); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🎵</span> <span>Ambient Flow Music Player</span>
            </button>

            <button type="button" (click)="openSocraticIntake.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">✨</span> <span>Socratic Intake Studio</span>
            </button>

            <button type="button" (click)="openCompanionSync.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📱</span> <span>Sync Mobile Companion</span>
            </button>

            <button type="button" (click)="openPatientPortal.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🩺</span> <span>Patient Self-Service Portal</span>
            </button>

            <button type="button" (click)="openSupportTicket.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📬</span> <span>Autonomous AI Support</span>
            </button>

            <button type="button" (click)="openBioNetworkQr.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🎵</span> <span>Bio-Network &amp; Audio HUD</span>
            </button>

            <button type="button" (click)="openBillingDashboard.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">💳</span> <span>Billing &amp; Subscription</span>
            </button>

            <button type="button" (click)="triggerSomaticGrounding.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🧘</span> <span>Somatic Grounding</span>
            </button>
          </div>

          <!-- Quick Theme & Display Toggles -->
          <div class="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <div class="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Display &amp; Accessibility</div>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" (click)="theme.cycleTheme()" class="min-h-[44px] py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer">
                <span>🎨 {{ theme.currentTheme() }}</span>
              </button>
              <button type="button" (click)="theme.cycleTextSizeScale()" class="min-h-[44px] py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer">
                <span>🔤 {{ theme.textSizeScale() }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Lock Session Footer Button -->
        <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button type="button" (click)="session.lock(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] py-3.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer shadow-md">
            <span>🔒</span> <span>Lock Session</span>
          </button>
        </div>
      </div>
    }

    <!-- Floating Ambient Flow Player Popover -->
    @if (showAmbientPlayer()) {
      <div class="fixed top-16 right-4 sm:right-6 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 max-w-[92vw]">
        <div class="relative">
          <button 
            type="button"
            (click)="showAmbientPlayer.set(false)"
            class="absolute -top-2 -right-2 z-10 w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs font-bold border border-zinc-700 cursor-pointer shadow-lg"
            title="Close Player"
          >
            ✕
          </button>
          <app-ambient-flow-player />
        </div>
      </div>
    }
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
  soundscapeService = inject(AmbientFlowSoundscapeService);

  today = new Date();
  isMobileMenuOpen = signal<boolean>(false);
  showAmbientPlayer = signal<boolean>(false);

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
  openEncryptedVault = output<void>();
  openSmartFhirSync = output<void>();
  openGlobalHealth = output<void>();
  openArticles = output<void>();
  triggerSomaticGrounding = output<void>();
}

