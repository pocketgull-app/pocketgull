import { Component, inject, output, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientDropdownComponent } from './patient-dropdown.component';
import { FitbitService } from '../services/hardware/fitbit.service';

@Component({
  selector: 'app-intake-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    PatientDropdownComponent
  ],
  template: `
    <!-- Patient Intake Navigation Bar -->
    <nav class="h-12 border-b border-[#EEEEEE] dark:border-zinc-800 flex items-center px-3 sm:px-6 shrink-0 bg-gray-50 dark:bg-[#09090b] z-40 no-print gap-2 sm:gap-4">
      <div class="text-xs text-gray-500 dark:text-zinc-400 font-medium hidden sm:block">INTAKE MODULE 01</div>
      <div class="h-4 w-px bg-gray-300 dark:bg-zinc-700 hidden sm:block"></div>
      <div id="tour-patient-dropdown"><app-patient-dropdown></app-patient-dropdown></div>

      <!-- Socratic Intake Studio Launcher -->
      <button 
        type="button"
        id="btn-socratic-intake-toolbar"
        (click)="openSocraticIntake.emit()"
        aria-label="Open Socratic Patient Intake Studio"
        class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/30 dark:border-emerald-500/40 text-[12px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md cursor-pointer transition-all shadow-xs">
        <span class="text-xs">✨</span>
        <span class="hidden sm:inline">Socratic Intake</span>
      </button>

      <div class="flex items-center gap-2 pr-2 pb-1 pt-1 -mb-1 -mt-1 ml-auto">
        <!-- EXPORT DROPDOWN -->
        <div class="relative group dropdown-container" (mouseenter)="exportMenuOpen.set(true)" (mouseleave)="exportMenuOpen.set(false)">
          <button
            aria-label="Export Menu Options"
            class="snap-start shrink-0 flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-zinc-700 transition-colors text-[12px] font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-500 rounded-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span class="sr-only">Export Options</span>
            <span class="hidden sm:inline" aria-hidden="true">Export</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-1 transition-transform group-hover:rotate-180 hidden sm:inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          
          @if (exportMenuOpen()) {
            <div class="absolute top-full right-0 pt-1 w-40 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden">
                <button (click)="exportPdf.emit(); exportMenuOpen.set(false)" [disabled]="!hasReport()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg> As PDF
                </button>
                <button (click)="exportJson.emit(); exportMenuOpen.set(false)" [disabled]="!hasReport()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> As JSON
                </button>
                <button (click)="exportFhir.emit(); exportMenuOpen.set(false)" [disabled]="!hasReport()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> As FHIR
                </button>
                <button (click)="exportFhirR4Bundle.emit(); exportMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                  <span>📄 HL7 FHIR R4 Bundle</span>
                </button>
                <button (click)="exportLaafHapticFhir.emit(); exportMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                  <span>⚡ LAAF Haptic FHIR</span>
                </button>
              </div>
            </div>
          }
        </div>

        <div class="w-px h-4 bg-gray-300 dark:bg-zinc-700 shrink-0 mx-1 hidden sm:block"></div>

        <!-- CONNECT / IMPORTS DROPDOWN -->
        <div class="relative group dropdown-container" (mouseenter)="connectMenuOpen.set(true)" (mouseleave)="connectMenuOpen.set(false)">
          <button
            aria-label="Imports Menu Options"
            class="shrink-0 flex items-center gap-2 px-3 py-1.5 border border-[#4285F4]/20 dark:border-[#4285F4]/30 transition-colors text-[12px] font-bold uppercase tracking-widest text-[#4285F4] dark:text-[#4285F4] bg-[#4285F4]/5 dark:bg-[#4285F4]/10 hover:bg-[#4285F4]/10 dark:hover:bg-[#4285F4]/20 rounded-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span class="sr-only">Import Options</span>
            <span class="hidden sm:inline" aria-hidden="true">Imports</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-1 transition-transform group-hover:rotate-180 hidden sm:inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>

          @if (connectMenuOpen()) {
            <div class="absolute top-full right-0 pt-1 w-48 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div class="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden">
                <button (click)="connectEpic.emit(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#E33B44] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> epic®
                </button>
                 @if (!fitbit.isConnected()) {
                   <button id="btn-fitbit-connect" (click)="fitbit.initiateAuth(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00B0B9] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                     Google Health Connect
                   </button>
                 } @else {
                   <button id="btn-fitbit-sync" (click)="fitbit.sync(); connectMenuOpen.set(false)" [disabled]="fitbit.isSyncing()" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00B0B9] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 disabled:opacity-50 cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" [class.animate-spin]="fitbit.isSyncing()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6"/><path d="M2.5 22v-6h6"/><path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.2"/></svg>
                     {{ fitbit.isSyncing() ? 'Syncing...' : 'Google Health Sync' }}
                   </button>
                   <button id="btn-fitbit-disconnect" (click)="fitbit.revoke(false); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-600 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64A9 9 0 0 1 20.77 15"/><path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                     Disconnect
                   </button>
                   <button id="btn-fitbit-purge" (click)="fitbit.revoke(true); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-500 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                     Disconnect & Erase Data
                   </button>
                 }
                 <button (click)="connectAwsHealth.emit(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#FF9900] hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> AWS HealthLake
                 </button>

                <button (click)="connectAppleHealth.emit(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path></svg> Apple Health
                </button>
                <button (click)="uploadData.emit(); connectMenuOpen.set(false)" class="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2 border-t border-gray-100 dark:border-zinc-800 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> Upload Data
                </button>
              </div>
            </div>
          }
        </div>

        <div class="w-px h-4 bg-gray-300 dark:bg-zinc-700 shrink-0 mx-1 hidden sm:block"></div>

        <button (click)="finalizeRecord.emit()"
                aria-label="Finalize and Archive Record"
                id="tour-finalize-btn"
                class="shrink-0 group flex items-center gap-2 px-3 py-1.5 border border-[#689F38]/20 dark:border-[#689F38]/30 transition-colors text-[12px] font-bold uppercase tracking-widest disabled:opacity-50 text-[#689F38] dark:text-[#689F38] bg-[#689F38]/5 dark:bg-[#689F38]/10 hover:bg-[#689F38]/10 dark:hover:bg-[#689F38]/20 rounded-md cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span class="sr-only">Finalize and Archive Record</span>
          <span class="hidden sm:inline" aria-hidden="true">Finalize & Archive</span>
        </button>
      </div>
    </nav>
  `
})
export class IntakeToolbarComponent {
  fitbit = inject(FitbitService);

  hasReport = input<boolean>(false);

  exportMenuOpen = signal<boolean>(false);
  connectMenuOpen = signal<boolean>(false);

  exportPdf = output<void>();
  exportJson = output<void>();
  exportFhir = output<void>();
  exportFhirR4Bundle = output<void>();
  exportLaafHapticFhir = output<void>();

  openSocraticIntake = output<void>();

  connectEpic = output<void>();
  connectAwsHealth = output<void>();
  connectAppleHealth = output<void>();
  uploadData = output<void>();
  finalizeRecord = output<void>();
}
