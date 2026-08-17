import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FitbitService } from '../../services/hardware/fitbit.service';

@Component({
  selector: 'app-google-health-consent-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div class="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B0B9] to-blue-600 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <h2 id="consent-title" class="text-base font-bold text-gray-900 dark:text-gray-100">Google Health Data Access — Informed Consent</h2>
              <p class="text-xs text-gray-500 dark:text-zinc-400">Required before connecting your health data</p>
            </div>
          </div>
        </div>
        <!-- Body -->
        <div class="px-6 py-4 space-y-4 text-sm text-gray-700 dark:text-zinc-300">
          <div class="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 p-4">
            <p class="font-semibold text-blue-900 dark:text-blue-300 mb-2">What data will be accessed:</p>
            <ul class="space-y-1.5">
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Resting Heart Rate (bpm) — daily summary, last 30 days</li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Oxygen Saturation / SpO₂ (%) — daily average, last 30 days</li>
              <li class="flex items-start gap-2"><svg class="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Sleep duration (minutes) &amp; efficiency — nightly summary, last 30 days</li>
            </ul>
          </div>
          <div class="space-y-2">
            <p><span class="font-semibold">Purpose:</span> Clinical intelligence features in PocketGull — biometric trend analysis, care plan optimization, and AI-assisted consultation support.</p>
            <p><span class="font-semibold">Data handling:</span> Health data is held in server memory only during your session and is never written to permanent storage, sold, shared with third parties, or used for advertising.</p>
            <p><span class="font-semibold">Security:</span> Data is transmitted over HTTPS. Tokens are stored in memory only (ephemeral — cleared on server restart).</p>
            <p><span class="font-semibold">Your rights:</span> You may withdraw at any time via Imports → Google Health Disconnect. Selecting "Disconnect &amp; Erase Data" will permanently remove all synced health data from this session.</p>
            <p><span class="font-semibold">Contact:</span> <a href="mailto:dpo@pocketgull.app" class="text-blue-600 dark:text-blue-400 underline">dpo@pocketgull.app</a> (Data Protection Officer) &middot; <a href="mailto:privacy@pocketgull.app" class="text-blue-600 dark:text-blue-400 underline">privacy@pocketgull.app</a></p>
          </div>
          <div class="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-3 text-xs text-amber-800 dark:text-amber-300">
            <strong>Note:</strong> Google Health API scopes are classified as Restricted. Your own personal data is accessible immediately. Production use with other users requires Google's privacy review.
          </div>
        </div>
        <!-- Footer -->
        <div class="px-6 pb-6 pt-2 flex flex-col gap-2">
          <button id="btn-consent-accept" (click)="fitbit.acceptConsent()" class="w-full py-3 px-4 bg-gradient-to-r from-[#00B0B9] to-blue-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            I Understand &amp; Consent — Connect Google Health
          </button>
          <button id="btn-consent-decline" (click)="fitbit.declineConsent()" class="w-full py-2.5 px-4 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors cursor-pointer">
            Cancel — Do not connect
          </button>
        </div>
      </div>
    </div>
  `
})
export class GoogleHealthConsentModalComponent {
  fitbit = inject(FitbitService);
}
