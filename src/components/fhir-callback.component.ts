import { Component, inject , ChangeDetectionStrategy} from '@angular/core';
import { FhirIntegrationService } from '../services/fhir-integration.service';
import { PatientManagementService } from '../services/patient-management.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-fhir-callback',
  standalone: true,
  template: `
    <div class="min-h-screen bg-[#EEEEEE] dark:bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans selection:bg-green-100 selection:text-green-900">
      
      <!-- Brand Header -->
      <div class="mb-8 flex flex-col items-center">
        <div class="w-12 h-12 bg-[#1C1C1C] dark:bg-zinc-100 rounded-xl flex items-center justify-center mb-4 shadow-lg">
          <svg class="w-6 h-6 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2l.5-.5M15 5.5l.5-.5c1.5-1.26 5-2 5-2s-.5 3.74-2 5l-.5.5M12 12v.01M16 16v.01M8 8v.01M16 8v.01M8 16v.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-light text-[#1C1C1C] dark:text-zinc-100 tracking-tight">PocketGull Connection</h1>
      </div>

      <div class="bg-white dark:bg-[#09090b] shadow-xl rounded-2xl p-8 max-w-md w-full text-center space-y-6 border border-gray-100 dark:border-zinc-800 relative overflow-hidden">
        
        <!-- Top accent line -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-[#558B2F]"></div>

        @if (isProcessing) {
          <div class="py-4">
            <!-- Custom clinical spinner -->
            <div class="relative w-16 h-16 mx-auto mb-6">
              <div class="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-zinc-800"></div>
              <div class="absolute inset-0 rounded-full border-4 border-[#558B2F] border-t-transparent animate-spin"></div>
              <div class="absolute inset-4 rounded-full border-4 border-[#1C1C1C] dark:border-zinc-100 border-b-transparent animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
            </div>
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-[#1C1C1C] dark:text-zinc-100 mb-2">Connecting to Epic...</h2>
            <p class="text-sm text-gray-500 dark:text-zinc-400">Authenticating and retrieving your secure health token.</p>
          </div>
        } @else if (errorMsg) {
          <div class="py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/30">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-2">Connection Failed</h2>
            <p class="text-sm text-gray-500 dark:text-zinc-400 mb-6">{{errorMsg}}</p>
            <button (click)="returnToApp()" class="w-full uppercase tracking-[0.1em] text-xs font-bold px-6 py-3 bg-[#1C1C1C] dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-[#558B2F] dark:hover:bg-[#8bc34a] transition-all duration-200">Return to Summary</button>
          </div>
        } @else {
          <div class="py-4 animate-in fade-in zoom-in duration-300">
            <div class="relative w-20 h-20 mx-auto mb-6">
              <div class="absolute inset-0 bg-[#558B2F]/20 dark:bg-[#8bc34a]/20 rounded-full animate-ping" style="animation-duration: 2s;"></div>
              <div class="relative w-full h-full bg-[#558B2F] dark:bg-[#8bc34a] text-white dark:text-zinc-900 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
            </div>
            <h2 class="text-xs font-bold uppercase tracking-[0.2em] text-[#1C1C1C] dark:text-zinc-100 mb-2">Connected Successfully!</h2>
            <p class="text-sm text-gray-500 dark:text-zinc-400 mb-6">Your Epic MyChart data is securely linked.</p>
            
            <div class="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              <div class="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              Redirecting automatically...
            </div>
          </div>
        }
      </div>
      
      <!-- Footer Note -->
      <div class="mt-8 text-center text-xs text-gray-500 dark:text-zinc-400 max-w-sm">
        <p>Secured via SMART on FHIR&reg; OAuth 2.0</p>
      </div>
    </div>
  `
})
export class FhirCallbackComponent {
  private fhirService = inject(FhirIntegrationService);
  private patientMgmt = inject(PatientManagementService);

  isProcessing = true;
  errorMsg = '';

  constructor() {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      this.errorMsg = `Epic returned an error: ${error}`;
      this.isProcessing = false;
      return;
    }

    if (!code) {
      this.errorMsg = 'No authorization code detected in the return URL.';
      this.isProcessing = false;
      return;
    }

    // Exchange code for token
    this.fhirService.handleCallback(code).then(async success => {
      if (success) {
         try {
           const fhirBundle = await this.fhirService.fetchPatientProfile();
           if (fhirBundle) {
               this.patientMgmt.ingestFhirBundle(fhirBundle);
           }
         } catch (err) {
           console.error('Failed to ingest FHIR payload during redirect', err);
         }

         this.isProcessing = false;
         // Automatically redirect back to main app after a moment
         setTimeout(() => {
           this.returnToApp(true);
         }, 1500); 
      } else {
         this.errorMsg = "Failed to negotiate the secure token exchange with the hospital network.";
         this.isProcessing = false;
      }
    });
  }

  returnToApp(success: boolean = false) {
    if (success) {
      window.location.href = '/?epic_connected=true'; // Route back with success marker
    } else {
      window.location.href = '/'; // Route back normally
    }
  }
}
