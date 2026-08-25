import { Component, ChangeDetectionStrategy, signal, computed, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IClinicalMenuItem } from './clinical-menu.component';

@Component({
  selector: 'app-mobile-menu-qr-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md font-sans animate-in fade-in duration-200">
      
      <div class="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden font-mono max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-6">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
              📱 Mobile Menu QR Code — On-the-Fly Exploration
            </h3>
          </div>
          <button (click)="closeModal.emit()"
            class="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase transition cursor-pointer">
            ✕ Close
          </button>
        </div>

        <!-- Layout Grid: QR Code Generator & Mobile Phone Mockup -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          <!-- Left Column: Scan QR Code -->
          <div class="md:col-span-5 flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-center">
            <div class="p-4 bg-white rounded-2xl shadow-lg border border-zinc-200 mb-4 inline-block">
              <!-- Procedural High-Contrast QR Code Matrix (SVG) -->
              <svg viewBox="0 0 100 100" class="w-44 h-44 select-none">
                <!-- QR Finder Patterns -->
                <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                
                <!-- Top-Left Finder -->
                <rect x="6" y="6" width="28" height="28" fill="#09090b" />
                <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="14" y="14" width="12" height="12" fill="#09090b" />

                <!-- Top-Right Finder -->
                <rect x="66" y="6" width="28" height="28" fill="#09090b" />
                <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                <rect x="74" y="14" width="12" height="12" fill="#09090b" />

                <!-- Bottom-Left Finder -->
                <rect x="6" y="66" width="28" height="28" fill="#09090b" />
                <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                <rect x="14" y="74" width="12" height="12" fill="#09090b" />

                <!-- QR Data Modules -->
                <rect x="38" y="8" width="6" height="6" fill="#09090b" />
                <rect x="48" y="14" width="6" height="6" fill="#09090b" />
                <rect x="38" y="24" width="6" height="6" fill="#09090b" />
                <rect x="54" y="28" width="6" height="6" fill="#09090b" />
                
                <rect x="8" y="38" width="6" height="6" fill="#09090b" />
                <rect x="18" y="44" width="6" height="6" fill="#09090b" />
                <rect x="28" y="52" width="6" height="6" fill="#09090b" />
                <rect x="42" y="42" width="16" height="16" fill="#10b981" rx="2" />
                <rect x="68" y="38" width="6" height="6" fill="#09090b" />
                <rect x="82" y="44" width="6" height="6" fill="#09090b" />

                <rect x="38" y="68" width="6" height="6" fill="#09090b" />
                <rect x="48" y="78" width="6" height="6" fill="#09090b" />
                <rect x="58" y="84" width="6" height="6" fill="#09090b" />
                <rect x="72" y="68" width="6" height="6" fill="#09090b" />
                <rect x="82" y="78" width="6" height="6" fill="#09090b" />
              </svg>
            </div>

            <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
              📷 Scan with Any Phone Camera
            </span>
            <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
              Encodes instant mobile menu payload for {{ activePatientName() }}
            </span>
          </div>

          <!-- Right Column: Smartphone Live Preview Mockup -->
          <div class="md:col-span-7 flex flex-col items-center">
            <div class="w-full max-w-xs bg-zinc-950 text-zinc-100 rounded-[36px] p-4 border-4 border-zinc-800 shadow-2xl relative">
              
              <!-- Phone Dynamic Island Notch -->
              <div class="w-24 h-4 bg-zinc-900 rounded-full mx-auto mb-3 flex items-center justify-center">
                <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>

              <!-- Mobile Web App Header -->
              <div class="border-b border-zinc-800 pb-3 mb-3 text-center">
                <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">Pocket Gull Mobile Menu</span>
                <span class="text-xs font-bold text-zinc-100">{{ activePatientName() }}'s Nutrition Plan</span>
              </div>

              <!-- Mobile Menu Items List -->
              <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
                @for (item of menuItems(); track item.id) {
                  <div (click)="selectedItem.set(item)"
                    [class.border-emerald-500/60]="selectedItem()?.id === item.id"
                    [class.bg-zinc-900]="selectedItem()?.id === item.id"
                    class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition cursor-pointer flex items-center justify-between gap-2">
                    
                    <div class="flex items-center gap-2">
                      <span class="text-xl">{{ item.emoji }}</span>
                      <div>
                        <span class="font-bold text-zinc-100 block text-[11px] leading-tight">{{ item.name.split(' ')[0] }} {{ item.name.split(' ')[1] }}</span>
                        <span class="text-[9px] text-zinc-400">GI: {{ item.glycemicIndex }} • {{ item.tcmEnergetics }}</span>
                      </div>
                    </div>

                    <button (click)="prescribeOnMobile(item, $event)"
                      class="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider transition">
                      ➕ Add
                    </button>
                  </div>
                }
              </div>

              <!-- Phone Home Indicator Bar -->
              <div class="w-20 h-1 bg-zinc-700 rounded-full mx-auto mt-4"></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class MobileMenuQrModalComponent {
  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  menuItems = input<IClinicalMenuItem[]>([]);
  closeModal = output<void>();

  selectedItem = signal<IClinicalMenuItem | null>(null);

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  prescribeOnMobile(item: IClinicalMenuItem, event: Event) {
    event.stopPropagation();
    const noteText = `Mobile Scan Prescribed: ${item.emoji} ${item.name} (${item.activeCompounds.map(c => `${c.name} ${c.dose}`).join(', ')})`;
    this.patientState.addClinicalNote({
      id: `mobile-qr-${item.id}-${Date.now()}`,
      text: noteText,
      sourceLens: 'Nutrition',
      date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
    });
  }
}
