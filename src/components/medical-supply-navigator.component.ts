import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderTreatmentNetworkService } from '../services/provider-treatment-network.service';
import { PatientStateService } from '../services/patient-state.service';
import { MedicalDecoderService } from '../services/medical-decoder.service';

export interface IMedicalSupplyItem {
  id: string;
  name: string;
  category: 'Diagnostic Vitals' | 'Emergency & Resuscitation' | 'Wound Care & Sterile' | 'Metabolic & Diabetes' | 'Dental & Oral Health Care';
  availability: 'Over-the-Counter (OTC)' | 'DME Prescription Required' | 'Hospital Emergency Supply';
  typicalCostRange: string;
  whereToAcquire: string[];
  clinicalIndication: string;
  patientPlainSummary: string;
  loincOrStandardCode?: string;
  isUrgentNeed: boolean;
}

@Component({
  selector: 'app-medical-supply-navigator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-5 bg-white dark:bg-zinc-900 border border-blue-500/30 rounded-2xl shadow-xl space-y-6 font-sans">
      <!-- Title Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-lg">
            🚑
          </div>
          <div>
            <h3 class="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              Medical Supply & Hospital Navigation Hub
            </h3>
            <p class="text-xs text-gray-500 dark:text-zinc-400">
              Locate off-the-shelf medical supplies, 24/7 pharmacies, and emergency triage centers nearby.
            </p>
          </div>
        </div>

        <!-- Filter Buttons -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button (click)="selectedCategory.set('all')" 
                  [class.bg-blue-600]="selectedCategory() === 'all'"
                  [class.text-white]="selectedCategory() === 'all'"
                  [class.bg-gray-100]="selectedCategory() !== 'all'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'all'"
                  [class.text-gray-700]="selectedCategory() !== 'all'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'all'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer">
            All Items
          </button>
          <button (click)="selectedCategory.set('Diagnostic Vitals')" 
                  [class.bg-blue-600]="selectedCategory() === 'Diagnostic Vitals'"
                  [class.text-white]="selectedCategory() === 'Diagnostic Vitals'"
                  [class.bg-gray-100]="selectedCategory() !== 'Diagnostic Vitals'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'Diagnostic Vitals'"
                  [class.text-gray-700]="selectedCategory() !== 'Diagnostic Vitals'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'Diagnostic Vitals'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer">
            🩸 Vitals Devices
          </button>
          <button (click)="selectedCategory.set('Emergency & Resuscitation')" 
                  [class.bg-blue-600]="selectedCategory() === 'Emergency & Resuscitation'"
                  [class.text-white]="selectedCategory() === 'Emergency & Resuscitation'"
                  [class.bg-gray-100]="selectedCategory() !== 'Emergency & Resuscitation'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'Emergency & Resuscitation'"
                  [class.text-gray-700]="selectedCategory() !== 'Emergency & Resuscitation'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'Emergency & Resuscitation'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer">
            ⚡ Emergency & CPR
          </button>
          <button (click)="selectedCategory.set('Metabolic & Diabetes')" 
                  [class.bg-blue-600]="selectedCategory() === 'Metabolic & Diabetes'"
                  [class.text-white]="selectedCategory() === 'Metabolic & Diabetes'"
                  [class.bg-gray-100]="selectedCategory() !== 'Metabolic & Diabetes'"
                  [class.dark:bg-zinc-800]="selectedCategory() !== 'Metabolic & Diabetes'"
                  [class.text-gray-700]="selectedCategory() !== 'Metabolic & Diabetes'"
                  [class.dark:text-zinc-300]="selectedCategory() !== 'Metabolic & Diabetes'"
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer">
            🥑 Glucose & CGM
          </button>
        </div>
      </div>

      <!-- Emergency Triage Banner -->
      <div class="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-lg">🚨</span>
          <div>
            <span class="font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide block">
              Immediate Red-Flag Emergency Triage
            </span>
            <span class="text-gray-600 dark:text-zinc-300">
              For chest pain, severe dyspnea, stroke symptoms, or unresponsiveness, call 911 immediately.
            </span>
          </div>
        </div>
        <a href="tel:911" class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-xs uppercase transition shadow">
          Call 911 Now
        </a>
      </div>

      <!-- Supply Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (item of filteredSupplies(); track item.id) {
          <div class="p-4 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 rounded-xl space-y-3 hover:border-blue-500/50 transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="font-extrabold text-sm text-gray-900 dark:text-gray-100">{{ item.name }}</h4>
                <span class="text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  {{ item.category }}
                </span>
              </div>

              <span [class.bg-emerald-500\/10]="item.availability === 'Over-the-Counter (OTC)'"
                    [class.text-emerald-700]="item.availability === 'Over-the-Counter (OTC)'"
                    [class.dark:text-emerald-400]="item.availability === 'Over-the-Counter (OTC)'"
                    [class.bg-amber-500\/10]="item.availability === 'DME Prescription Required'"
                    [class.text-amber-700]="item.availability === 'DME Prescription Required'"
                    [class.dark:text-amber-400]="item.availability === 'DME Prescription Required'"
                    [class.bg-rose-500\/10]="item.availability === 'Hospital Emergency Supply'"
                    [class.text-rose-700]="item.availability === 'Hospital Emergency Supply'"
                    [class.dark:text-rose-400]="item.availability === 'Hospital Emergency Supply'"
                    class="text-[10px] font-bold px-2 py-0.5 rounded border border-current">
                {{ item.availability }}
              </span>
            </div>

            <!-- Description & Guidance -->
            <p class="text-xs text-gray-600 dark:text-zinc-300">
              {{ decoder.readingLevel() === 'patient' ? item.patientPlainSummary : item.clinicalIndication }}
            </p>

            <!-- Acquisition Locations -->
            <div class="space-y-1.5 pt-2 border-t border-gray-200 dark:border-zinc-700 text-xs">
              <span class="font-bold text-gray-700 dark:text-zinc-300 block text-[11px] uppercase tracking-wider">
                📍 Where & How to Acquire:
              </span>
              <div class="flex flex-wrap gap-1.5">
                @for (loc of item.whereToAcquire; track loc) {
                  <span class="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded text-[11px] font-semibold text-gray-700 dark:text-zinc-300">
                    🏬 {{ loc }}
                  </span>
                }
              </div>
            </div>

            <!-- Cost & Standard Code Footer -->
            <div class="flex justify-between items-center text-[11px] font-mono text-gray-500 dark:text-zinc-400 pt-1">
              <span>Cost Range: {{ item.typicalCostRange }}</span>
              @if (item.loincOrStandardCode) {
                <span>Code: {{ item.loincOrStandardCode }}</span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Nearest Medical Centers List -->
      <div class="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
        <h4 class="text-xs font-black uppercase tracking-wider text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <span>🏥 Nearest Accredited Hospitals & 24/7 Medical Depots</span>
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          @for (center of networkService.treatmentCenters(); track center.id) {
            <div class="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg space-y-1">
              <div class="flex justify-between items-start">
                <span class="font-bold text-gray-900 dark:text-gray-100">{{ center.facilityName }}</span>
                <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                  {{ center.distanceMiles }} mi
                </span>
              </div>
              <div class="text-[11px] text-gray-500 dark:text-zinc-400">{{ center.cityState }} • {{ center.phone }}</div>
              <div class="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                {{ center.isEmergency247 ? '✅ 24/7 Emergency Room & Trauma Center' : '⏰ Business Hours Clinic' }}
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MedicalSupplyNavigatorComponent {
  protected readonly networkService = inject(ProviderTreatmentNetworkService);
  protected readonly state = inject(PatientStateService);
  protected readonly decoder = inject(MedicalDecoderService);

  readonly selectedCategory = signal<string>('all');

  readonly supplies = signal<IMedicalSupplyItem[]>([
    {
      id: 'sup-1',
      name: 'Finger Pulse Oximeter & SpO2 Monitor',
      category: 'Diagnostic Vitals',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$15 - $35',
      whereToAcquire: ['Retail Pharmacy (CVS/Walgreens)', 'Medical Supply Stores', 'Major Supermarkets'],
      clinicalIndication: 'Measures arterial oxygen saturation (SpO2) and photoplethysmographic pulse rate. Recommended for asthma, COPD, and viral respiratory monitor.',
      patientPlainSummary: 'A clip for your finger that checks your blood oxygen levels and pulse rate in seconds without any pain.',
      loincOrStandardCode: 'LOINC 2708-6',
      isUrgentNeed: false
    },
    {
      name: 'Automated External Defibrillator (AED) & Pocket CPR Mask',
      category: 'Emergency & Resuscitation',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$1,200 - $1,800 (AED) / $10 (Mask)',
      whereToAcquire: ['Certified Medical Equipment Distributors', 'Public Access AED Stations', 'Emergency Response Depots'],
      clinicalIndication: 'Delivers biphasic electric shock for Ventricular Fibrillation (VF) and Pulseless Ventricular Tachycardia (pVT) cardiac arrest resuscitation.',
      patientPlainSummary: 'A portable machine that provides step-by-step voice guidance to restart a heart during a cardiac emergency.',
      loincOrStandardCode: 'ECG Defibrillator',
      isUrgentNeed: true,
      id: 'sup-2'
    },
    {
      id: 'sup-3',
      name: 'Continuous Glucose Monitor (CGM) Sensors',
      category: 'Metabolic & Diabetes',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$75 - $120 / month',
      whereToAcquire: ['Retail Pharmacy', 'Direct-to-Consumer Digital Health Apps', 'DME Suppliers'],
      clinicalIndication: 'Real-time interstitial glucose monitoring with 1-minute telemetry updates and hypo/hyperglycemic trend rate alerts.',
      patientPlainSummary: 'A tiny arm sensor that tracks your blood sugar level 24/7 directly on your smartphone without finger pricks.',
      loincOrStandardCode: 'LOINC 97507-8',
      isUrgentNeed: false
    },
    {
      id: 'sup-4',
      name: 'Automated Upper-Arm Blood Pressure Cuff (AAMI Validated)',
      category: 'Diagnostic Vitals',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$30 - $70',
      whereToAcquire: ['Pharmacies', 'Medical Equipment Outlets', 'Big Box Retailers'],
      clinicalIndication: 'Oscillometric non-invasive blood pressure measurement. Essential for screening stage 1/2 hypertension and preeclampsia.',
      patientPlainSummary: 'An easy arm cuff that inflates with one button to measure your blood pressure and heart rate.',
      loincOrStandardCode: 'LOINC 85354-9',
      isUrgentNeed: false
    },
    {
      id: 'sup-5',
      name: 'Hypoallergenic Wound Closure Strips & Adhesive Bandages (Bandaids)',
      category: 'Wound Care & Sterile',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$3 - $12',
      whereToAcquire: ['Grocery Stores & Supermarkets', 'Convenience Stores & Bodegas', 'Retail Pharmacies', 'Gas Station Depots'],
      clinicalIndication: 'Sterile adhesive strips for small skin abrasions, finger-prick blood sampling sites, and superficial wound protection.',
      patientPlainSummary: 'Standard flexible bandages and clean wipes to cover small cuts or scratches anywhere you go.',
      loincOrStandardCode: 'First Aid Staples',
      isUrgentNeed: false
    },
    {
      id: 'sup-6',
      name: 'Fast-Acting Orange Juice / Rescue Glucose Gel (Rule of 15)',
      category: 'Metabolic & Diabetes',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$1 - $5',
      whereToAcquire: ['Grocery Stores & Supermarkets', 'Convenience Stores & Bodegas', 'Gas Stations', 'Vending Machines'],
      clinicalIndication: 'Rapid-acting oral simple carbohydrates (15g glucose equivalent) for acute hypoglycemia emergency reversal (Rule of 15).',
      patientPlainSummary: '4 oz of orange juice, apple juice, or glucose gel available at any grocery store or bodega to quickly rescue low blood sugar.',
      loincOrStandardCode: 'LOINC 97507-8',
      isUrgentNeed: true
    },
    {
      id: 'sup-7',
      name: 'Benzocaine 20% Toothache & Oral Anesthetic Gel',
      category: 'Dental & Oral Health Care',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$4 - $10',
      whereToAcquire: ['Grocery Stores & Supermarkets', 'Retail Pharmacies', 'Convenience Stores'],
      clinicalIndication: 'Topical ester local anesthetic for temporary pain mitigation in acute odontalgia, aphthous ulcers, and gingival irritation.',
      patientPlainSummary: 'Fast-acting numbing gel available at any grocery store or pharmacy to relieve sharp toothache or gum pain.',
      loincOrStandardCode: 'CDT D9630',
      isUrgentNeed: true
    },
    {
      id: 'sup-8',
      name: 'Eugenol Clove Oil & Zinc-Oxide Temporary Tooth Filling Putty',
      category: 'Dental & Oral Health Care',
      availability: 'Over-the-Counter (OTC)',
      typicalCostRange: '$6 - $14',
      whereToAcquire: ['Retail Pharmacies', 'Supermarkets', 'Emergency Medical Outlets'],
      clinicalIndication: 'Analgesic essential oil and temporary cavity sealant to protect exposed dentin tubules until emergency dental repair.',
      patientPlainSummary: 'A temporary dental putty with natural clove oil to cover lost fillings or cracked teeth until you see a dentist.',
      loincOrStandardCode: 'CDT D2940',
      isUrgentNeed: true
    }
  ]);

  readonly filteredSupplies = computed(() => {
    const cat = this.selectedCategory();
    const items = this.supplies();
    if (cat === 'all') return items;
    return items.filter(i => i.category === cat);
  });
}
