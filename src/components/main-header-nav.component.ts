import { Component, inject, output, signal, effect } from '@angular/core';
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
import { ConsoleIntegrityBadgeComponent } from './console-integrity-badge.component';
import { AmbientFlowSoundscapeService } from '../services/ambient-flow-soundscape.service';
import { NavigationShellService } from '../services/navigation-shell.service';
import { BionicReadingService } from '../services/bionic-reading.service';
import { CmsRpmSuperbillService } from '../services/cms-rpm-superbill.service';
import { SocraticMultilingualTranslatorService } from '../services/socratic-multilingual-translator.service';
import { FrontlineVernacularVoiceService, VernacularLanguageCode } from '../services/frontline-vernacular-voice.service';

@Component({
  selector: 'app-main-header-nav',
  standalone: true,
  imports: [
    CommonModule,
    PocketgullIconComponent,
    PocketgullBrandMarkComponent,
    AmbientFlowPlayerComponent,
    ConsoleIntegrityBadgeComponent
  ],
  template: `
    <!-- Navbar: Pure utility & theme harmony -->
    <nav class="theme-nav-bar h-14 flex items-center justify-between px-3 sm:px-6 shrink-0 z-50 no-print relative">
      <div class="flex items-center gap-3 shrink-0">
        <a href="/" class="flex items-center gap-2.5 shrink-0 cursor-pointer group select-none">
          <app-pocketgull-brand-mark size="sm" [showSubtext]="false" />
        </a>

        <!-- System Status Indicator (Accessible Button) -->
        <button type="button" class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all cursor-pointer group relative no-print shrink-0" 
             (click)="network.toggleForceOffline()"
             [title]="'Network: ' + network.networkQuality() + ' • RTT: ' + network.latencyMs() + 'ms • Speed: ' + network.connectionSpeed() + (network.pendingQueueCount() > 0 ? ' • ' + network.pendingQueueCount() + ' offline items queued' : '')">
          <div class="relative flex h-2 w-2 items-center justify-center">
            <span class="relative inline-flex rounded-full status-dot h-2 w-2 transition-colors duration-300"
                  [style.background-color]="network.isOnline() ? 'var(--spectral-stable)' : (network.isLieFiSuspected() ? '#f59e0b' : 'var(--spectral-critical)')"
                  [class.animate-pulse]="network.isLieFiSuspected()"></span>
          </div>
          <span class="text-[11px] sm:text-xs font-bold text-gray-600 dark:text-zinc-400 uppercase tracking-widest">
            {{ network.isLieFiSuspected() ? 'Lie-Fi Detected' : (network.isOnline() ? 'System Ready' : (network.forceOffline() ? 'App Forced Offline' : 'System Offline')) }}
          </span>
          @if (network.pendingQueueCount() > 0) {
            <span class="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              ⚡ {{ network.pendingQueueCount() }}
            </span>
          }
        </button>

        <!-- Ambient Flow Background Music Quick Indicator (Desktop & Thin-Clients) -->
        <div class="hidden md:flex items-center gap-2">
          <button 
            type="button" 
            id="btn-ambient-flow-trigger"
            (click)="showAmbientPlayer.set(!showAmbientPlayer())"
            [class.bg-teal-500/20]="soundscapeService.isPlaying()"
            [class.text-teal-700]="soundscapeService.isPlaying()"
            [class.dark:text-teal-300]="soundscapeService.isPlaying()"
            [class.border-teal-500/50]="soundscapeService.isPlaying()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs focus:ring-2 focus:ring-teal-500/50 outline-none cursor-pointer shrink-0"
            title="Toggle Ambient Flow Soundscape & Offline Binaural Focus Music">
            <span [class.animate-pulse]="soundscapeService.isPlaying()">{{ soundscapeService.isPlaying() ? '🎶' : '🎵' }}</span>
            <span>{{ soundscapeService.isPlaying() ? 'Flow: ' + soundscapeService.activePreset().carrierFreqHz + 'Hz' : 'Ambient Flow' }}</span>
          </button>
        </div>
      </div>

      <!-- Center Primary Navigation Tab Bar (Desktop / Thin-Clients) -->
      <div class="hidden lg:flex items-center shrink-0 p-1 bg-zinc-100/90 dark:bg-zinc-900/90 rounded-lg border border-zinc-200 dark:border-zinc-800/80 shadow-xs font-mono text-xs">
        <!-- 🩺 Chart Tab -->
        <button
          type="button"
          (click)="navShell?.selectTab('chart')"
          [class.bg-white]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
          [class.dark:bg-zinc-800]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
          [class.text-teal-900]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
          [class.dark:text-teal-200]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
          [class.shadow-xs]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
          [class.text-zinc-600]="navShell?.activeTab() !== 'chart' || state.showActiveRoom()"
          [class.dark:text-zinc-400]="navShell?.activeTab() !== 'chart' || state.showActiveRoom()"
          class="px-3 py-1 rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">
          <span>🩺</span>
          <span>Chart</span>
        </button>

        <!-- 📊 Analysis Tab -->
        <button
          type="button"
          (click)="navShell?.selectTab('analysis')"
          [class.bg-white]="navShell?.activeTab() === 'analysis'"
          [class.dark:bg-zinc-800]="navShell?.activeTab() === 'analysis'"
          [class.text-teal-900]="navShell?.activeTab() === 'analysis'"
          [class.dark:text-teal-200]="navShell?.activeTab() === 'analysis'"
          [class.shadow-xs]="navShell?.activeTab() === 'analysis'"
          [class.text-zinc-600]="navShell?.activeTab() !== 'analysis'"
          [class.dark:text-zinc-400]="navShell?.activeTab() !== 'analysis'"
          class="px-3 py-1 rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">
          <span>📊</span>
          <span>Analysis</span>
        </button>

        <!-- 📋 Active Room Tab -->
        <button
          type="button"
          (click)="toggleActiveRoomTab()"
          [class.bg-teal-600]="state.showActiveRoom() || navShell?.activeTab() === 'tasks'"
          [class.text-white]="state.showActiveRoom() || navShell?.activeTab() === 'tasks'"
          [class.shadow-xs]="state.showActiveRoom() || navShell?.activeTab() === 'tasks'"
          [class.text-zinc-600]="!state.showActiveRoom() && navShell?.activeTab() !== 'tasks'"
          [class.dark:text-zinc-400]="!state.showActiveRoom() && navShell?.activeTab() !== 'tasks'"
          class="px-3 py-1 rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">
          <span>📋</span>
          <span>Room</span>
        </button>

        <!-- 🧩 MoCA 30-Pt Battery Tab -->
        <button
          type="button"
          (click)="navShell?.openMocaSuite()"
          [class.bg-teal-600]="navShell?.showMocaSuiteModal()"
          [class.text-white]="navShell?.showMocaSuiteModal()"
          [class.shadow-xs]="navShell?.showMocaSuiteModal()"
          [class.text-zinc-600]="!navShell?.showMocaSuiteModal()"
          [class.dark:text-zinc-400]="!navShell?.showMocaSuiteModal()"
          class="px-3 py-1 rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">
          <span>🧩</span>
          <span>MoCA 30-Pt</span>
        </button>

        <!-- 🔬 Research Tab -->
        <button
          type="button"
          (click)="toggleResearchTab()"
          [class.bg-white]="state.isResearchFrameVisible()"
          [class.dark:bg-zinc-800]="state.isResearchFrameVisible()"
          [class.text-teal-900]="state.isResearchFrameVisible()"
          [class.dark:text-teal-200]="state.isResearchFrameVisible()"
          [class.shadow-xs]="state.isResearchFrameVisible()"
          [class.text-zinc-600]="!state.isResearchFrameVisible()"
          [class.dark:text-zinc-400]="!state.isResearchFrameVisible()"
          class="px-3 py-1 rounded-md font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100">
          <span>🔬</span>
          <span>Research</span>
        </button>
      </div>

      <!-- Right Nav Action Suite -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- 📋 Active Room Toggle Trigger (Desktop) -->
        <button 
          type="button" 
          id="btn-active-room-trigger"
          data-testid="header-tab-room"
          (click)="toggleActiveRoomTab()"
          aria-label="Toggle Active Room & Clinical Assessments"
          [class.bg-teal-600]="state.showActiveRoom()"
          [class.text-white]="state.showActiveRoom()"
          [class.border-teal-700]="state.showActiveRoom()"
          [class.bg-zinc-100]="!state.showActiveRoom()"
          [class.dark:bg-zinc-900]="!state.showActiveRoom()"
          [class.text-zinc-800]="!state.showActiveRoom()"
          [class.dark:text-zinc-200]="!state.showActiveRoom()"
          class="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:border-teal-500/50 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <span class="text-xs">📋</span>
          <span>Active Room</span>
        </button>

        <!-- 🧩 MoCA Cognitive Suite Trigger (Tablet / Compact viewports) -->
        <button 
          type="button" 
          id="btn-moca-suite-trigger"
          (click)="navShell?.openMocaSuite()"
          aria-label="Open Montreal Cognitive Assessment Suite"
          [class.bg-teal-600]="navShell?.showMocaSuiteModal()"
          [class.text-white]="navShell?.showMocaSuiteModal()"
          [class.border-teal-700]="navShell?.showMocaSuiteModal()"
          [class.bg-teal-50]="!navShell?.showMocaSuiteModal()"
          [class.dark:bg-teal-950/40]="!navShell?.showMocaSuiteModal()"
          [class.text-teal-800]="!navShell?.showMocaSuiteModal()"
          [class.dark:text-teal-200]="!navShell?.showMocaSuiteModal()"
          class="hidden md:flex lg:hidden items-center gap-1.5 px-3 py-1.5 border border-teal-300 dark:border-teal-700/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <span class="text-xs">🧩</span>
          <span>MoCA 30-Pt</span>
        </button>

        <!-- ⚖️ Clinical Posology & Deprescribing Trigger (Desktop 2XL) -->
        <button 
          type="button" 
          id="btn-posology-trigger"
          (click)="navShell?.openPosology()"
          aria-label="Open Clinical Posology & Deprescribing Engine"
          [class.bg-teal-600]="navShell?.showPosologyModal()"
          [class.text-white]="navShell?.showPosologyModal()"
          [class.border-teal-700]="navShell?.showPosologyModal()"
          [class.bg-teal-50]="!navShell?.showPosologyModal()"
          [class.dark:bg-teal-950/40]="!navShell?.showPosologyModal()"
          [class.text-teal-800]="!navShell?.showPosologyModal()"
          [class.dark:text-teal-200]="!navShell?.showPosologyModal()"
          class="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 border border-teal-300 dark:border-teal-700/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <span class="text-xs">⚖️</span>
          <span>Posology</span>
        </button>

        <!-- 🏥 Specialist Referral Dossier Trigger (Desktop 2XL) -->
        <button 
          type="button" 
          id="btn-specialist-referral-trigger"
          (click)="navShell?.openSpecialistReferralHub()"
          aria-label="Open Specialist Referral & Co-Management Dossier Hub"
          [class.bg-teal-600]="navShell?.showSpecialistReferralModal()"
          [class.text-white]="navShell?.showSpecialistReferralModal()"
          [class.border-teal-700]="navShell?.showSpecialistReferralModal()"
          [class.bg-teal-50]="!navShell?.showSpecialistReferralModal()"
          [class.dark:bg-teal-950/40]="!navShell?.showSpecialistReferralModal()"
          [class.text-teal-800]="!navShell?.showSpecialistReferralModal()"
          [class.dark:text-teal-200]="!navShell?.showSpecialistReferralModal()"
          class="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 border border-teal-300 dark:border-teal-700/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <span class="text-xs">🏥</span>
          <span>Specialist Dossier</span>
        </button>

        <!-- 💵 CMS RPM Superbill Trigger (Desktop 2XL) -->
        <button 
          type="button" 
          id="btn-cms-superbill-trigger"
          (click)="navShell?.openCmsSuperbill()"
          aria-label="Generate CMS Remote Patient Monitoring Superbill"
          [class.bg-emerald-600]="navShell?.showCmsSuperbillModal()"
          [class.text-white]="navShell?.showCmsSuperbillModal()"
          [class.border-emerald-700]="navShell?.showCmsSuperbillModal()"
          [class.bg-emerald-50]="!navShell?.showCmsSuperbillModal()"
          [class.dark:bg-emerald-950/40]="!navShell?.showCmsSuperbillModal()"
          [class.text-emerald-800]="!navShell?.showCmsSuperbillModal()"
          [class.dark:text-emerald-200]="!navShell?.showCmsSuperbillModal()"
          class="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <span class="text-xs">💵</span>
          <span>RPM Superbill</span>
          @if (rpmService?.rpmSummary(); as rpm) {
            <span 
              [ngClass]="rpm.isCompliant ? 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100 border-emerald-400/60' : 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 border-amber-400/60'"
              class="px-1.5 py-0.5 rounded text-[10px] font-mono border tabular-nums">
              {{ rpm.qualifyingDays }}/16d
            </span>
          }
        </button>

        <!-- 📈 3-Act Trajectory Reader Trigger (Desktop 2XL) -->
        <button 
          type="button" 
          id="btn-trajectory-reader-trigger"
          (click)="navShell?.openTrajectoryReader()"
          aria-label="Open 3-Act Clinical Trajectory Reader"
          [class.bg-indigo-600]="navShell?.showTrajectoryReaderModal()"
          [class.text-white]="navShell?.showTrajectoryReaderModal()"
          [class.border-indigo-700]="navShell?.showTrajectoryReaderModal()"
          [class.bg-indigo-50]="!navShell?.showTrajectoryReaderModal()"
          [class.dark:bg-indigo-950/40]="!navShell?.showTrajectoryReaderModal()"
          [class.text-indigo-800]="!navShell?.showTrajectoryReaderModal()"
          [class.dark:text-indigo-200]="!navShell?.showTrajectoryReaderModal()"
          class="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 border border-indigo-300 dark:border-indigo-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <span class="text-xs">📈</span>
          <span>3-Act Trajectory</span>
        </button>

        <app-console-integrity-badge class="hidden 2xl:inline-flex" />

        <!-- 📜 Institutional Compliance Certificate Trigger (Desktop XL) -->
        <button 
          type="button" 
          id="btn-compliance-cert-trigger"
          (click)="openComplianceCertificate.emit()"
          aria-label="Open Institutional Statutory Compliance Certificate (HIPAA, FDA, NIST, MSA)"
          [class.bg-emerald-600]="navShell?.showComplianceCertificateModal()"
          [class.text-white]="navShell?.showComplianceCertificateModal()"
          [class.border-emerald-700]="navShell?.showComplianceCertificateModal()"
          [class.bg-emerald-50]="!navShell?.showComplianceCertificateModal()"
          [class.dark:bg-emerald-950/40]="!navShell?.showComplianceCertificateModal()"
          [class.text-emerald-800]="!navShell?.showComplianceCertificateModal()"
          [class.dark:text-emerald-200]="!navShell?.showComplianceCertificateModal()"
          class="hidden xl:flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 dark:border-emerald-700/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
          <span class="text-xs">📜</span>
          <span>Compliance</span>
        </button>

        <!-- 🌟 Clinical Apps & Portals Hub Dropdown Button (Desktop) -->
        <div class="relative hidden md:block">
          <button 
            type="button" 
            id="btn-apps-hub-trigger"
            (click)="isAppsHubOpen.set(!isAppsHubOpen())"
            aria-label="Open Apps and Clinical Portals Hub"
            [class.bg-emerald-500/20]="isAppsHubOpen()"
            [class.border-emerald-500/60]="isAppsHubOpen()"
            class="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-zinc-800/80 rounded-xs text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer">
            <span class="text-xs">✨</span>
            <span>Apps &amp; Portals</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-zinc-500 transition-transform duration-200" [class.rotate-180]="isAppsHubOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          <!-- Apps Hub Popover Grid -->
          @if (isAppsHubOpen()) {
            <!-- Backdrop click-away -->
            <div class="fixed inset-0 z-40 bg-black/20" (click)="isAppsHubOpen.set(false)"></div>

            <div class="absolute right-0 top-full mt-1.5 w-[440px] z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-3 animate-in fade-in slide-in-from-top-1 duration-150 font-mono text-xs">
              <div class="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold tracking-widest uppercase text-zinc-500">POCKETGULL WORKSTATION HUB</span>
                </div>
                <span class="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 border border-emerald-300 dark:border-emerald-800">[24 CLINICAL MODULES]</span>
              </div>

              <!-- Categorized Grid -->
              <div class="grid grid-cols-2 gap-3 pt-2.5">
                <!-- Section: Clinical Intelligence & AI -->
                <div class="space-y-1">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block px-1">🎮 Arcade &amp; Games</span>
                  <button type="button" (click)="navShell?.openArcadeHub(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300 cursor-pointer border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30">
                    <span class="text-sm">🎮</span>
                    <div>
                      <div>Arcade &amp; Clinical Quests Hub</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Luminaries • Oregon Trail • Shift Duty • OSCE</div>
                    </div>
                  </button>

                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-1 pt-1">🧠 Clinical AI</span>
                  <button type="button" (click)="navShell?.openRoleDemo(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer border border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20">
                    <span class="text-sm">✨</span>
                    <div>
                      <div>Experience by Clinical Role</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Clinician, Resident, Researcher, Executive</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openIntimacyVitality(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">❤️</span>
                    <div>
                      <div>Cardiovascular Intimacy & Couples</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Princeton III • Nitrates/PDE-5 • Pacing</div>
                    </div>
                  </button>
                  <button type="button" (click)="openTuringSuite.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🧮</span>
                    <div>
                      <div>Turing Diagnostic Suite</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Cellular Automata &amp; Petri Nets</div>
                    </div>
                  </button>
                  <button type="button" (click)="openSocraticRounds.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">👨‍⚕️</span>
                    <div>
                      <div>Socratic Rounds</div>
                      <div class="text-[10px] text-zinc-400 font-normal">House M.D. Multi-Agent CDS</div>
                    </div>
                  </button>
                  <button type="button" (click)="openBarrowsWorkbench.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🔬</span>
                    <div>
                      <div>Dr. Barrows Workbench</div>
                      <div class="text-[10px] text-zinc-400 font-normal">PBL Inquiry &amp; Doctor Prep</div>
                    </div>
                  </button>
                  <button type="button" (click)="openKneeHologram.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🩻</span>
                    <div>
                      <div>3D Joint Hologram</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Three.js Tri-Plane Slicer</div>
                    </div>
                  </button>
                  <button type="button" (click)="openBiophysicalLenses.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🫀</span>
                    <div>
                      <div>Biophysical 3D Lenses &amp; Phenotypers</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Cardio • Pulm • Hepato • Renal • Neuro</div>
                    </div>
                  </button>
                  <button type="button" (click)="openSmartHealthPass.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">📱</span>
                    <div>
                      <div>SMART Health Pass</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Cryptographic FHIR R4 QR</div>
                    </div>
                  </button>
                  <button type="button" (click)="openSocraticIntake.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">✨</span>
                    <div>
                      <div>Socratic Intake</div>
                      <div class="text-[10px] text-zinc-400 font-normal">FIFE Question Engine</div>
                    </div>
                  </button>
                  <button type="button" (click)="openModelGarden.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🌿</span>
                    <div>
                      <div>Model Garden</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Vertex AI Registries</div>
                    </div>
                  </button>
                  <button type="button" (click)="openEncryptedVault.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🔐</span>
                    <div>
                      <div>Encrypted Vault</div>
                      <div class="text-[10px] text-zinc-400 font-normal">AES-GCM-256 Vault</div>
                    </div>
                  </button>
                  <button type="button" (click)="openSmartFhirSync.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🏥</span>
                    <div>
                      <div>SMART on FHIR</div>
                      <div class="text-[10px] text-zinc-400 font-normal">EHR Sync Bridge</div>
                    </div>
                  </button>
                </div>

                <!-- Section: Global & Community Health -->
                <div class="space-y-1">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-1">🌍 Global Health</span>
                  <button type="button" (click)="openGlobalHealth.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🌐</span>
                    <div>
                      <div>Global Health</div>
                      <div class="text-[10px] text-zinc-400 font-normal">WHO SDG 3.4 &amp; ICD-11</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openMultilingualTerminal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer border border-teal-500/20 bg-teal-50/30 dark:bg-teal-950/20">
                    <span class="text-sm">🗣️</span>
                    <div>
                      <div>Multilingual Socratic Terminal</div>
                      <div class="text-[10px] text-zinc-400 font-normal">50+ Global Dialects &amp; Translation</div>
                    </div>
                  </button>
                  <button type="button" (click)="openCompanionSync.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">📱</span>
                    <div>
                      <div>Sync Companion</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Mobile QR Launch</div>
                    </div>
                  </button>
                  <button type="button" (click)="openPatientPortal.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🩺</span>
                    <div>
                      <div>Patient Portal</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Self-Service Access</div>
                    </div>
                  </button>
                  <button type="button" (click)="openArticles.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">📰</span>
                    <div>
                      <div>Knowledge Hub</div>
                      <div class="text-[10px] text-zinc-400 font-normal">SNO-10 &amp; Articles</div>
                    </div>
                  </button>
                  <button type="button" (click)="openResearchDividend.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🧬</span>
                    <div>
                      <div>Open Science Commons</div>
                      <div class="text-[10px] text-zinc-400 font-normal">NIH All of Us • Research Commons</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openSepsisBenchmarkModal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-300 cursor-pointer border border-cyan-500/20 bg-cyan-50/40 dark:bg-cyan-950/20">
                    <span class="text-sm">📊</span>
                    <div>
                      <div>MIMIC-IV / OMOP Conformal Hub</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Preprint • 95% Coverage vs Epic ESM Sepsis</div>
                    </div>
                  </button>
                </div>

                <!-- Section: Focus, Telemetry & Wellness -->
                <div class="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-1">🎵 Wellness</span>
                  <button type="button" (click)="openBioNetworkQr.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🎵</span>
                    <div>
                      <div>Bio-Network HUD</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Haptic Sound Engine</div>
                    </div>
                  </button>
                  <button type="button" (click)="triggerSomaticGrounding.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🧘</span>
                    <div>
                      <div>Somatic Grounding</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Box Breathing Pacer</div>
                    </div>
                  </button>
                  @if (navShell?.developerMode()) {
                    <button type="button" (click)="openAmbientLivingSpace.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <span class="text-sm">🏡</span>
                      <div>
                        <div>Living Room Ambient</div>
                        <div class="text-[10px] text-zinc-400 font-normal">Dieter Rams Display Mode</div>
                      </div>
                    </button>
                    <button type="button" (click)="navShell?.openCommercialHub(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <span class="text-sm">💼</span>
                      <div>
                        <div>Commercial Hub</div>
                        <div class="text-[10px] text-zinc-400 font-normal">Practice ROI &amp; Monetization</div>
                      </div>
                    </button>
                    <button type="button" (click)="openTypefaceSite.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <span class="text-sm">🔤</span>
                      <div>
                        <div>Typeface Suite</div>
                        <div class="text-[10px] text-zinc-400 font-normal">William Caslon Fonts</div>
                      </div>
                    </button>
                  }
                </div>

                <!-- Section: Enterprise & Operations -->
                <div class="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block px-1">🏛️ Enterprise &amp; Operations</span>
                  <button type="button" (click)="navShell?.openCommercialHub(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <span class="text-sm">💼</span>
                    <div>
                      <div>Commercialization & Growth Hub</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Onboarding, Stripe Tiers, CDISC & BAA Kit</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openAmbientScribeDrawer(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer border border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20">
                    <span class="text-sm">🎙️</span>
                    <div>
                      <div>Ambient AI Scribe Ingestion</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Abridge • Nuance DAX • Suki • DDI Intercept</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openEdiClaimsModal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <span class="text-sm">🏢</span>
                    <div>
                      <div>ANSI X12 EDI Claims Defense</div>
                      <div class="text-[10px] text-zinc-400 font-normal">EDI 837P Claims &amp; 835 Remittance • CMS RPM</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openEnterpriseIdentityModal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer border border-blue-500/20 bg-blue-50/40 dark:bg-blue-950/20">
                    <span class="text-sm">🛡️</span>
                    <div>
                      <div>Enterprise Identity (SAML / SCIM)</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Okta • Microsoft Entra ID • Shift Roster</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openDirectIomtModal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300 cursor-pointer border border-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20">
                    <span class="text-sm">⌚</span>
                    <div>
                      <div>Direct IoMT Wearables (Apple / Google)</div>
                      <div class="text-[10px] text-zinc-400 font-normal">HealthKit • Health Connect • TIPPSS Trust • Zero Cloud Tax</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openEhrMarketplaceModal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300 cursor-pointer border border-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20">
                    <span class="text-sm">🏥</span>
                    <div>
                      <div>EHR Marketplace Showroom</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Epic Connection Hub • Oracle Cerner • CARIN Alliance</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openEhrWritebackModal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer border border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/20">
                    <span class="text-sm">⚡</span>
                    <div>
                      <div>EHR Bi-Directional Writeback &amp; ADT</div>
                      <div class="text-[10px] text-zinc-400 font-normal">RFC 7523 private_key_jwt • DocRef • CarePlan • Conformal Obs</div>
                    </div>
                  </button>
                  <button type="button" (click)="navShell?.openEdgeVoiceModal(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <span class="text-sm">🎙️</span>
                    <div>
                      <div>Edge Offline Voice Scribe</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Local SLM • ISMP Intercept • Store &amp; Forward FHIR</div>
                    </div>
                  </button>
                  <button type="button" (click)="openComplianceCertificate.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">📜</span>
                    <div>
                      <div>Statutory Certificate</div>
                      <div class="text-[10px] text-zinc-400 font-normal">HIPAA, FDA &amp; NIST Audit</div>
                    </div>
                  </button>
                  <button type="button" (click)="openSupportTicket.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">📬</span>
                    <div>
                      <div>AI Support Portal</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Autonomous Ticketing</div>
                    </div>
                  </button>
                  @if (navShell?.developerMode()) {
                    <button type="button" (click)="openTalentHrPortal.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <span class="text-sm">💼</span>
                      <div>
                        <div>Executive Demo</div>
                        <div class="text-[10px] text-zinc-400 font-normal">Health System ROI</div>
                      </div>
                    </button>
                    <button type="button" (click)="openDoctorShiftDemo.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <span class="text-sm">🏥</span>
                      <div>
                        <div>Hospital Shift Demo</div>
                        <div class="text-[10px] text-zinc-400 font-normal">Physician Pilot & HHS § 1557</div>
                      </div>
                    </button>
                    <button type="button" (click)="openGreenRoom.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <span class="text-sm">🌿</span>
                      <div>
                        <div>Green Room Lounge</div>
                        <div class="text-[10px] text-zinc-400 font-normal">Clinician Debrief & Reflection</div>
                      </div>
                    </button>
                    <button type="button" (click)="openPatentClaims.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                      <span class="text-sm">⚖️</span>
                      <div>
                        <div>Patent &amp; IP Registry</div>
                        <div class="text-[10px] text-zinc-400 font-normal">200 Claims &amp; Clauses</div>
                      </div>
                    </button>
                  }
                  <button type="button" (click)="openAustereHud.emit(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🛡️</span>
                    <div>
                      <div>Austere Research Profile</div>
                      <div class="text-[10px] text-zinc-400 font-normal">Zero-Egress HIPAA Safe Harbor HUD</div>
                    </div>
                  </button>
                  <button type="button" (click)="openChwSuite(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🌿</span>
                    <div>
                      <div>Frontline CHW Suite</div>
                      <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">WHO IMCI • MUAC Malnutrition • ORS &amp; Formularies</div>
                    </div>
                  </button>
                  <button type="button" (click)="openMdcpHub(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">📋</span>
                    <div>
                      <div>MDCP Clinical &amp; Standards Hub</div>
                      <div class="text-[10px] text-teal-600 dark:text-teal-400 font-normal">Pediatric Waiver • CarePlan • IEEE 11073 • ITA</div>
                    </div>
                  </button>
                  <button type="button" (click)="session.lock(); isAppsHubOpen.set(false)" class="w-full text-left p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                    <span class="text-sm">🔒</span>
                    <div>
                      <div>Lock Session &amp; Splash Screen</div>
                      <div class="text-[10px] text-zinc-400 font-normal">HIPAA Security Lock / Biometric Screen</div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Developer & Auxiliary Demos Gatekeeper Toggle -->
              <div class="pt-2.5 mt-2.5 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-1">
                <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Developer Demos:</span>
                <button type="button" (click)="navShell?.toggleDeveloperMode()" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition cursor-pointer"
                        [class.bg-emerald-100]="navShell?.developerMode()"
                        [class.dark:bg-emerald-950]="navShell?.developerMode()"
                        [class.text-emerald-800]="navShell?.developerMode()"
                        [class.dark:text-emerald-300]="navShell?.developerMode()"
                        [class.border-emerald-400]="navShell?.developerMode()"
                        [class.bg-zinc-100]="!navShell?.developerMode()"
                        [class.dark:bg-zinc-800]="!navShell?.developerMode()"
                        [class.text-zinc-500]="!navShell?.developerMode()"
                        [class.border-zinc-300]="!navShell?.developerMode()"
                        [class.dark:border-zinc-700]="!navShell?.developerMode()">
                  {{ navShell?.developerMode() ? '🛠️ DEV MODE: ON' : '🔒 DEV MODE: OFF' }}
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Live AI Agent Consult Trigger (Always visible on mobile & desktop) -->
        <button (click)="state.toggleLiveAgent(!state.isLiveAgentActive())"
                id="tour-voice-agent-trigger"
                aria-label="AI Agent"
                class="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xs border transition-colors text-xs font-mono font-bold uppercase tracking-widest cursor-pointer shadow-xs"
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
        <div class="hidden md:flex items-center gap-2 font-mono">
          <button (click)="toggleResearchTab()"
                  id="tour-research-frame-trigger"
                  aria-label="Research"
                  [class.bg-teal-600]="state.isResearchFrameVisible()"
                  [class.text-white]="state.isResearchFrameVisible()"
                  [class.border-teal-700]="state.isResearchFrameVisible()"
                  [class.bg-white/80]="!state.isResearchFrameVisible()"
                  [class.dark:bg-zinc-900]="!state.isResearchFrameVisible()"
                  [class.text-gray-700]="!state.isResearchFrameVisible()"
                  [class.dark:text-zinc-300]="!state.isResearchFrameVisible()"
                  class="group shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xs border border-gray-300 dark:border-zinc-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18c-2.29 0-4.43-.78-6.14-2.1C4.6 16.5 4 14.83 4 12c0-1.5.3-2.91.86-4.22L16.22 19.14A7.92 7.92 0 0 1 12 20m7.14-2.1C20.4 16.5 21 14.83 21 12c0-1.5-.3-2.91-.86-4.22L8.78 19.14C10.09 20.7 11.97 21.5 14 21.5c1.47 0 2.87-.42 4.14-1.14Z"/></svg>
            <span>Research</span>
          </button>

          <!-- Frontline CHW Suite & Vernacular Audio Quick-Launcher (Desktop) -->
          <button type="button"
                  (click)="openChwSuite()"
                  id="btn-desktop-chw-launcher"
                  title="Open Frontline CHW Suite & Vernacular Audio Prompts (WHO/MSF)"
                  class="group shrink-0 px-2.5 py-1.5 border border-emerald-300 dark:border-emerald-800/60 hover:border-emerald-500 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 rounded-xs transition-colors text-emerald-800 dark:text-emerald-300 cursor-pointer flex items-center gap-1.5 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs font-mono text-xs font-bold">
            <span>🌿</span>
            <span class="hidden xl:inline">Frontline CHW</span>
          </button>

          <!-- Language Translation Switcher Dropdown (Desktop) -->
          <div class="relative">
            <button 
              type="button"
              (click)="isLangMenuOpen.set(!isLangMenuOpen())"
              id="btn-desktop-lang-switcher"
              [attr.aria-expanded]="isLangMenuOpen()"
              aria-label="Language translation switcher"
              [title]="'Language: ' + translator.activeLanguage().name + ' (' + translator.activeLanguage().nativeName + ')'"
              class="group shrink-0 px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:border-teal-500/60 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 rounded-xs transition-colors text-zinc-700 dark:text-zinc-200 cursor-pointer flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900 shadow-xs">
              <span class="text-xs">{{ translator.activeLanguage().flagEmoji }}</span>
              <span class="text-[11px] font-bold font-mono tracking-tight uppercase">{{ translator.selectedLanguageCode() }}</span>
              @if (isFrontlineLanguage(translator.selectedLanguageCode())) {
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Frontline Vernacular Voice Prompts Active"></span>
              }
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-zinc-400 transition-transform duration-200" [class.rotate-180]="isLangMenuOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>

            @if (isLangMenuOpen()) {
              <!-- Backdrop click-away -->
              <div class="fixed inset-0 z-40 bg-black/20" (click)="isLangMenuOpen.set(false)"></div>

              <div class="absolute right-0 top-full mt-1.5 w-64 z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-2.5 rounded-xs font-mono text-xs max-h-80 overflow-y-auto">
                <div class="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  <span>Translate / Idioma</span>
                  <button type="button" (click)="navShell?.openMultilingualTerminal(); isLangMenuOpen.set(false)" class="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer">50+ Terminal →</button>
                </div>
                <div class="space-y-1">
                  @for (lang of primaryLanguages; track lang.code) {
                    <button 
                      type="button"
                      (click)="translator.setLanguage(lang.code); isLangMenuOpen.set(false)"
                      class="w-full text-left px-2 py-1.5 rounded transition flex items-center justify-between text-xs cursor-pointer"
                      [ngClass]="{
                        'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold border border-teal-300 dark:border-teal-700': translator.selectedLanguageCode() === lang.code,
                        'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-transparent': translator.selectedLanguageCode() !== lang.code
                      }">
                      <div class="flex items-center gap-2">
                        <span class="text-sm">{{ lang.flagEmoji }}</span>
                        <span>{{ lang.name }}</span>
                      </div>
                      <span class="text-[10px] text-zinc-400">{{ lang.nativeName }}</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Theme Toggle -->
          <button (click)="theme.cycleTheme()" 
                  id="tour-theme-trigger"
                  aria-label="Toggle Theme"
                  [title]="'Cycle Theme (Current: ' + theme.currentTheme() + ')'"
                  class="group shrink-0 p-2 border border-gray-300 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xs transition-colors text-gray-500 dark:text-zinc-400 cursor-pointer flex items-center gap-1 bg-white/80 dark:bg-zinc-900">
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
                  class="px-2.5 py-1.5 rounded-xs transition font-mono text-xs font-black cursor-pointer bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1 shrink-0 shadow-xs">
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

          <!-- Bionic Reading Mode Toggle -->
          <button (click)="bionicReading.toggleBionicReading()"
                  id="btn-bionic-toggle"
                  aria-label="Toggle Bionic Reading Mode"
                  [attr.aria-pressed]="bionicReading.isBionicReadingEnabled()"
                  [title]="bionicReading.isBionicReadingEnabled() ? 'Bionic Reading Active (Alt+B)' : 'Enable Bionic Reading Mode (Alt+B)'"
                  [class.border-amber-500]="bionicReading.isBionicReadingEnabled()"
                  [class.bg-amber-50]="bionicReading.isBionicReadingEnabled()"
                  [class.dark:bg-amber-950/40]="bionicReading.isBionicReadingEnabled()"
                  [class.text-amber-600]="bionicReading.isBionicReadingEnabled()"
                  [class.dark:text-amber-300]="bionicReading.isBionicReadingEnabled()"
                  class="group shrink-0 px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 rounded-xs transition-colors text-zinc-600 dark:text-zinc-300 cursor-pointer flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900 shadow-xs">
            <span class="text-xs">📖</span>
            <span class="hidden xl:inline text-[11px] font-bold tracking-tight">Bionic</span>
          </button>

          <!-- Philocardia Heart-Centered Sensory Mode Toggle -->
          <button (click)="theme.togglePhilocardia()"
                  id="btn-philocardia-toggle"
                  aria-label="Toggle Philocardia Heart-Centered Sensory Mode"
                  [attr.aria-pressed]="theme.isPhilocardiaEnabled()"
                  [title]="theme.isPhilocardiaEnabled() ? 'Philocardia Active (0.1Hz Vagal Mayer Pacing)' : 'Enable Philocardia (0.1Hz Heart-Centered Sensory Mode)'"
                  [class.border-rose-500]="theme.isPhilocardiaEnabled()"
                  [class.bg-rose-50]="theme.isPhilocardiaEnabled()"
                  [class.dark:bg-rose-950/40]="theme.isPhilocardiaEnabled()"
                  [class.text-rose-600]="theme.isPhilocardiaEnabled()"
                  [class.dark:text-rose-300]="theme.isPhilocardiaEnabled()"
                  class="group shrink-0 px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xs transition-colors text-zinc-600 dark:text-zinc-300 cursor-pointer flex items-center gap-1.5 bg-white/80 dark:bg-zinc-900 shadow-xs">
            <span class="text-xs" [class.animate-pulse]="theme.isPhilocardiaEnabled()">{{ theme.isPhilocardiaEnabled() ? '❤️' : '🤍' }}</span>
            <span class="hidden xl:inline text-[11px] font-bold tracking-tight">Philocardia</span>
          </button>

          <!-- Desktop Lock Session / Secure Splash Trigger -->
          <button (click)="session.lock()"
                  aria-label="Lock Session & Open Secure Splash Screen"
                  title="Lock Session (HIPAA / Secure Splash Screen)"
                  class="px-2.5 py-1.5 rounded-xs transition font-mono text-xs font-bold cursor-pointer bg-zinc-900 text-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center gap-1 shrink-0 shadow-xs">
            <span>🔒</span>
            <span class="hidden lg:inline text-[11px] uppercase tracking-wider">Lock</span>
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

          <!-- Primary Clinical Workspace Navigation (Mobile) -->
          <div class="grid grid-cols-2 gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <button type="button" (click)="navShell?.selectTab('chart'); isMobileMenuOpen.set(false);" 
                    [class.bg-teal-600]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
                    [class.text-white]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
                    [class.border-teal-700]="navShell?.activeTab() === 'chart' && !state.showActiveRoom()"
                    [class.bg-zinc-100]="navShell?.activeTab() !== 'chart' || state.showActiveRoom()"
                    [class.dark:bg-zinc-900]="navShell?.activeTab() !== 'chart' || state.showActiveRoom()"
                    class="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider cursor-pointer transition">
              <span>🩺</span> <span>Chart</span>
            </button>
            <button type="button" (click)="navShell?.selectTab('analysis'); isMobileMenuOpen.set(false);" 
                    [class.bg-teal-600]="navShell?.activeTab() === 'analysis'"
                    [class.text-white]="navShell?.activeTab() === 'analysis'"
                    [class.border-teal-700]="navShell?.activeTab() === 'analysis'"
                    [class.bg-zinc-100]="navShell?.activeTab() !== 'analysis'"
                    [class.dark:bg-zinc-900]="navShell?.activeTab() !== 'analysis'"
                    class="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider cursor-pointer transition">
              <span>📊</span> <span>Analysis</span>
            </button>
          </div>

          <!-- Clinical Navigation Links (Fitts's Law 48px+ touch targets) -->
          <div class="space-y-2.5">
            <!-- 🧩 Montreal Cognitive Assessment (MoCA 30-Point Suite) -->
            <button type="button" (click)="navShell?.openMocaSuite(); isMobileMenuOpen.set(false);" 
                    [class.bg-teal-600]="navShell?.showMocaSuiteModal()"
                    [class.text-white]="navShell?.showMocaSuiteModal()"
                    class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🧩</span> <span>MoCA 30-Point Assessment</span>
            </button>

            <!-- 🎮 Arcade & Quests Hub -->
            <button type="button" (click)="navShell?.openArcadeHub(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🎮</span> <span>Arcade &amp; Clinical Quests Hub</span>
            </button>

            <!-- Active Room & Assessments Toggle -->
            <button type="button" (click)="toggleActiveRoomTab(); isMobileMenuOpen.set(false);" 
                    [class.bg-teal-600]="state.showActiveRoom()"
                    [class.text-white]="state.showActiveRoom()"
                    class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📋</span> <span>{{ state.showActiveRoom() ? 'Hide Active Room' : 'Open Active Room' }}</span>
            </button>

            <!-- ⚖️ Clinical Posology & Deprescribing Engine -->
            <button type="button" (click)="navShell?.openPosology(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">⚖️</span> <span>Posology &amp; Deprescribing</span>
            </button>

            <!-- 💵 CMS Remote Patient Monitoring (RPM) Superbill -->
            <button type="button" (click)="navShell?.openCmsSuperbill(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <div class="flex items-center gap-3">
                <span class="text-base">💵</span> <span>CMS RPM Superbill (CPT 99453/4)</span>
              </div>
              @if (rpmService?.rpmSummary(); as rpm) {
                <span 
                  [ngClass]="rpm.isCompliant ? 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100' : 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100'"
                  class="px-2 py-0.5 rounded text-[10px] font-mono tabular-nums">
                  {{ rpm.qualifyingDays }}/16d
                </span>
              }
            </button>

            <!-- 📈 3-Act Clinical Trajectory Reader -->
            <button type="button" (click)="navShell?.openTrajectoryReader(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📈</span> <span>3-Act Clinical Trajectory</span>
            </button>

            <!-- MDCP Governance Hub -->
            <button type="button" (click)="openMdcpHub(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📋</span> <span>MDCP Governance Hub</span>
            </button>

            <button type="button" (click)="navShell?.openRoleDemo(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">✨</span> <span>Experience by Role Demo</span>
            </button>

            <button type="button" (click)="navShell?.openCommercialHub(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">💼</span> <span>Commercialization & Growth Hub</span>
            </button>

            <!-- 🎙️ Ambient AI Scribe Ingestion -->
            <button type="button" (click)="navShell?.openAmbientScribeDrawer(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🎙️</span> <span>Ambient AI Scribe Ingestion</span>
            </button>

            <!-- 🏢 ANSI X12 EDI Claims Defense -->
            <button type="button" (click)="navShell?.openEdiClaimsModal(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🏢</span> <span>ANSI X12 EDI Claims Defense</span>
            </button>

            <!-- 🛡️ Enterprise Identity & SCIM Directory -->
            <button type="button" (click)="navShell?.openEnterpriseIdentityModal(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🛡️</span> <span>Enterprise Identity (SAML / SCIM)</span>
            </button>

            <!-- ⌚ Direct IoMT Wearables (Apple / Google) -->
            <button type="button" (click)="navShell?.openDirectIomtModal(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">⌚</span> <span>Direct IoMT Wearables (Apple / Google)</span>
            </button>

            <!-- 📊 MIMIC-IV & CMS OMOP Conformal Benchmark -->
            <button type="button" (click)="navShell?.openSepsisBenchmarkModal(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 border border-cyan-300 dark:border-cyan-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📊</span> <span>MIMIC-IV &amp; OMOP Conformal Sepsis Hub</span>
            </button>

            <!-- 🏥 EHR Marketplace Showroom -->
            <button type="button" (click)="navShell?.openEhrMarketplaceModal(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🏥</span> <span>EHR Marketplace (Epic Showroom / Cerner)</span>
            </button>

            <!-- ⚡ EHR Bi-Directional Writeback & ADT -->
            <button type="button" (click)="navShell?.openEhrWritebackModal(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">⚡</span> <span>EHR Writeback &amp; ADT (RFC 7523)</span>
            </button>

            <!-- 🎙️ Edge Offline Voice Scribe -->
            <button type="button" (click)="navShell?.openEdgeVoiceModal(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🎙️</span> <span>Edge Voice Agent (Air-Gapped SLM)</span>
            </button>

            <!-- Ambient Flow Background Music Player -->
            <button type="button" (click)="showAmbientPlayer.set(true); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🎵</span> <span>Ambient Flow Music Player</span>
            </button>

            <button type="button" (click)="openSocraticRounds.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">👨‍⚕️</span> <span>Socratic Rounds (House M.D.)</span>
            </button>

            <button type="button" (click)="openKneeHologram.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🩻</span> <span>3D Joint Hologram HUD</span>
            </button>

            <button type="button" (click)="openBiophysicalLenses.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🫀</span> <span>Biophysical 3D Lenses &amp; Phenotypers</span>
            </button>

            <button type="button" (click)="openResearchDividend.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🧬</span> <span>Ethical Open Science Commons</span>
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

            <button type="button" (click)="openModelGarden.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🌿</span> <span>Vertex AI Model Garden</span>
            </button>

            <button type="button" (click)="openSupportTicket.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📬</span> <span>Autonomous AI Support</span>
            </button>

            <button type="button" (click)="openBioNetworkQr.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🎵</span> <span>Bio-Network &amp; Audio HUD</span>
            </button>

            <button type="button" (click)="openTalentHrPortal.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🤝</span> <span>Join Team &amp; Talent Hub</span>
            </button>

            <button type="button" (click)="openBillingDashboard.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">💳</span> <span>Billing &amp; Subscription</span>
            </button>

            <button type="button" (click)="openAustereHud.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🛡️</span> <span>Austere Research Profile HUD</span>
            </button>

            <button type="button" (click)="openChwSuite(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🌿</span> <span>Frontline CHW Suite (WHO/MSF)</span>
            </button>

            <button type="button" (click)="openComplianceCertificate.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">📜</span> <span>Statutory Compliance Certificate</span>
            </button>

            <button type="button" (click)="triggerSomaticGrounding.emit(); isMobileMenuOpen.set(false);" class="w-full min-h-[48px] flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition cursor-pointer">
              <span class="text-base">🧘</span> <span>Somatic Grounding</span>
            </button>
          </div>

          <!-- Quick Theme & Display Toggles -->
          <div class="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <div class="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Display &amp; Accessibility</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" (click)="theme.cycleTheme()" class="min-h-[44px] py-2.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer">
                <span>🎨 {{ theme.currentTheme() }}</span>
              </button>
              <button type="button" (click)="theme.cycleTextSizeScale()" class="min-h-[44px] py-2.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer">
                <span>🔤 {{ theme.textSizeScale() }}</span>
              </button>
              <button type="button" id="btn-bionic-mobile-toggle" (click)="bionicReading.toggleBionicReading()" [class.border-amber-500]="bionicReading.isBionicReadingEnabled()" [class.bg-amber-50]="bionicReading.isBionicReadingEnabled()" [class.dark:bg-amber-950/40]="bionicReading.isBionicReadingEnabled()" [class.text-amber-600]="bionicReading.isBionicReadingEnabled()" [class.dark:text-amber-300]="bionicReading.isBionicReadingEnabled()" class="min-h-[44px] py-2.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer">
                <span>📖 Bionic</span>
              </button>
              <button type="button" id="btn-philocardia-mobile-toggle" (click)="theme.togglePhilocardia()" [class.border-rose-500]="theme.isPhilocardiaEnabled()" [class.bg-rose-50]="theme.isPhilocardiaEnabled()" [class.dark:bg-rose-950/40]="theme.isPhilocardiaEnabled()" [class.text-rose-600]="theme.isPhilocardiaEnabled()" [class.dark:text-rose-300]="theme.isPhilocardiaEnabled()" class="min-h-[44px] py-2.5 px-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition cursor-pointer">
                <span [class.animate-pulse]="theme.isPhilocardiaEnabled()">{{ theme.isPhilocardiaEnabled() ? '❤️' : '🤍' }}</span>
                <span>Philo</span>
              </button>
            </div>

            <!-- Mobile Language Switcher -->
            <div class="pt-2">
              <div class="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">
                <span>Translate ({{ translator.activeLanguage().name }})</span>
                <button type="button" (click)="navShell?.openMultilingualTerminal(); isMobileMenuOpen.set(false)" class="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer">50+ Dialects →</button>
              </div>
              <div class="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                @for (lang of primaryLanguages.slice(0, 8); track lang.code) {
                  <button 
                    type="button" 
                    (click)="translator.setLanguage(lang.code)"
                    class="min-h-[44px] py-1 px-1 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition"
                    [ngClass]="{
                      'bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-100 border-teal-500 font-bold': translator.selectedLanguageCode() === lang.code,
                      'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800': translator.selectedLanguageCode() !== lang.code
                    }">
                    <span class="text-xs">{{ lang.flagEmoji }}</span>
                    <span class="text-[10px] uppercase font-bold">{{ lang.code }}</span>
                  </button>
                }
              </div>
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
  bionicReading = inject(BionicReadingService);
  hardware = inject(HardwareTelemetryService);
  game = inject(GamificationService);
  tour = inject(WalkthroughTourService);
  session = inject(SessionStateService);
  soundscapeService = inject(AmbientFlowSoundscapeService);
  navShell = inject(NavigationShellService, { optional: true });
  rpmService = inject(CmsRpmSuperbillService, { optional: true });
  translator = inject(SocraticMultilingualTranslatorService, { optional: true }) ?? new SocraticMultilingualTranslatorService();
  vernacularVoice = inject(FrontlineVernacularVoiceService, { optional: true });

  constructor() {
    try {
      effect(() => {
        const code = this.translator.selectedLanguageCode();
        if (this.vernacularVoice && this.isFrontlineLanguage(code)) {
          if (this.vernacularVoice.activeLanguageCode() !== code) {
            this.vernacularVoice.setLanguage(code as VernacularLanguageCode);
          }
        }
      });

      effect(() => {
        if (this.vernacularVoice) {
          const vCode = this.vernacularVoice.activeLanguageCode();
          if (this.translator.selectedLanguageCode() !== vCode) {
            this.translator.setLanguage(vCode);
          }
        }
      });
    } catch {
      // In isolated environments where ChangeDetectionScheduler is omitted from Injector.create
    }
  }

  isFrontlineLanguage(code: string): boolean {
    return ['en', 'es', 'hi', 'sw', 'ar'].includes(code);
  }

  today = new Date();
  isMobileMenuOpen = signal<boolean>(false);
  isAppsHubOpen = signal<boolean>(false);
  showAmbientPlayer = signal<boolean>(false);
  isLangMenuOpen = signal<boolean>(false);

  readonly primaryLanguages = [
    { code: 'en', name: 'English', nativeName: 'English (Plain)', flagEmoji: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇲🇽' },
    { code: 'zh', name: 'Mandarin', nativeName: '中文 (简体)', flagEmoji: '🇨🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flagEmoji: '🇮🇳' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flagEmoji: '🇸🇦' },
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flagEmoji: '🇵🇭' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flagEmoji: '🇻🇳' },
    { code: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flagEmoji: '🇧🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flagEmoji: '🇺🇦' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flagEmoji: '🇰🇪' },
  ];

  openTuringSuite = output<void>();
  openSocraticRounds = output<void>();
  openBarrowsWorkbench = output<void>();
  openKneeHologram = output<void>();
  openBiophysicalLenses = output<void>();
  openSmartHealthPass = output<void>();
  openSocraticIntake = output<void>();
  openModelGarden = output<void>();
  openTalentHrPortal = output<void>();
  openCompanionSync = output<void>();
  openBioNetworkQr = output<void>();
  openBillingDashboard = output<void>();
  openApiPricing = output<void>();
  openPatientPortal = output<void>();
  openClinicianOnboarding = output<void>();
  openTypefaceSite = output<void>();
  openDocsStudy = output<void>();
  openSupportTicket = output<void>();
  openComplianceCertificate = output<void>();
  openEncryptedVault = output<void>();
  openSmartFhirSync = output<void>();
  openGlobalHealth = output<void>();
  openArticles = output<void>();
  openResearchDividend = output<void>();
  openPatentClaims = output<void>();
  openAmbientLivingSpace = output<void>();
  openHumanDignityPact = output<void>();
  openDoctorShiftDemo = output<void>();
  openGreenRoom = output<void>();
  openAustereHud = output<void>();
  triggerSomaticGrounding = output<void>();

  openMdcpHub(): void {
    this.navShell?.openMdcpHub();
  }

  openChwSuite(): void {
    this.navShell?.openChwSuite();
  }

  toggleActiveRoomTab(): void {
    const next = !this.state.showActiveRoom();
    this.state.toggleActiveRoom(next);
    if (next) {
      this.navShell?.selectTab('tasks');
    } else {
      this.navShell?.selectTab('chart');
    }
  }

  toggleResearchTab(): void {
    const next = !this.state.isResearchFrameVisible();
    this.state.toggleResearchFrame(next);
    if (next) {
      this.navShell?.selectTab('research');
    } else {
      this.navShell?.selectTab('chart');
    }
  }
}




