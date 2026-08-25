import { Component, inject, signal, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-smart-health-pass-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 text-zinc-100 flex flex-col gap-5 font-sans relative">
        
        <!-- Close Modal Button -->
        <button 
          (click)="closeModal.emit()"
          class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-bold min-h-[32px] touch-manipulation">
          ✕
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div class="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-2xl font-mono">
            📱
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-semibold text-zinc-100 font-mono">
                SMART Health Card & Cryptographic Pass
              </h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FHIR R4 Verified
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              W3C Verifiable Clinical Credentials & HIPAA Safe Harbor De-Identified
            </p>
          </div>
        </div>

        <!-- Health Pass Visual Card -->
        <div class="p-4 rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-teal-950/40 border border-teal-500/30 shadow-lg flex flex-col gap-4">
          
          <div class="flex items-start justify-between gap-4">
            <div>
              <span class="text-[10px] uppercase font-mono text-teal-400 font-bold tracking-wider">Patient Archetype</span>
              <h4 class="text-sm font-bold text-zinc-100 font-mono mt-0.5">Homo Sapiens (Female, 34y)</h4>
              <span class="text-[11px] text-zinc-400 font-mono">ID: PGT-88429-FHIR</span>
            </div>
            
            <!-- Simulated SMART Health QR Matrix SVG -->
            <div class="w-20 h-20 bg-white p-1.5 rounded-lg shrink-0 flex items-center justify-center shadow">
              <svg viewBox="0 0 24 24" class="w-full h-full text-zinc-950 fill-current">
                <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm11-2h7v7h-7V2zm2 2v3h3V4h-3zM2 15h7v7H2v-7zm2 2v3h3v-3H4zm13 0h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 4h2v2h-2v-2zm2-2h-2v-2h2v2zm-2-2h2v-2h-2v2zm-4 4h2v2h-2v-2zm0-4h2v-2h-2v2zM11 2h2v2h-2V2zm0 4h2v2h-2V6zm0 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm0 4h2v2h-2v-2z" />
              </svg>
            </div>
          </div>

          <!-- Active Clinical Signals -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono border-t border-zinc-800/80 pt-3">
            <div class="flex flex-col">
              <span class="text-[10px] text-zinc-500">Primary Locus:</span>
              <span class="text-teal-300 font-semibold truncate">Medial Meniscus (M23.22)</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] text-zinc-500">Vitals Mean BP:</span>
              <span class="text-zinc-200 tabular-nums">118 / 76 mmHg</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] text-zinc-500">Popperian Null H₀:</span>
              <span class="text-emerald-400 font-semibold">p = 0.012 (Rejected)</span>
            </div>
          </div>

        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span class="text-[11px] font-mono text-zinc-500">
            🔒 0 Direct Identifiers (Safe Harbor §164.514)
          </span>

          <div class="flex items-center gap-2">
            <button 
              (click)="copyFhirJson()"
              class="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-teal-300 text-xs font-mono font-semibold transition min-h-[44px] touch-manipulation">
              {{ isCopied() ? '✓ Copied JSON' : '📋 Copy FHIR Bundle' }}
            </button>
            <button 
              (click)="downloadSmartPass()"
              class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-zinc-950 font-bold text-xs font-mono rounded-xl transition shadow-lg shadow-teal-900/30 flex items-center gap-1.5 min-h-[44px] touch-manipulation">
              <span>Save Pass</span>
              <span>⬇</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SmartHealthPassModalComponent {
  readonly patientState = inject(PatientStateService);
  readonly closeModal = output<void>();
  readonly isCopied = signal<boolean>(false);

  copyFhirJson(): void {
    const fhirBundle = {
      resourceType: 'Bundle',
      type: 'document',
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'PGT-88429-FHIR',
            gender: 'female',
            birthDate: '1992-04-12'
          }
        },
        {
          resource: {
            resourceType: 'Condition',
            code: {
              coding: [{ system: 'http://hl7.org/fhir/sid/icd-10-cm', code: 'M23.22', display: 'Radial tear of medial meniscus' }]
            },
            clinicalStatus: { coding: [{ code: 'active' }] }
          }
        }
      ]
    };

    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2)).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2000);
    });
  }

  downloadSmartPass(): void {
    // Generate simulated FHIR JSON download
    const blob = new Blob([JSON.stringify({
      verifiableCredential: {
        type: ['VerifiableCredential', 'https://smarthealth.cards#health-card', 'https://smarthealth.cards#immunization'],
        credentialSubject: { fhirVersion: '4.0.1', fhirBundle: { resourceType: 'Bundle' } }
      }
    }, null, 2)], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pocketgull-smart-health-pass.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
