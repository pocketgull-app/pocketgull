import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpiritualDietaryConductService, FaithTraditionKey, IDietaryConductRule, IExcipientAuditResult } from '../../services/spiritual-dietary-conduct.service';
import { FastingChronobiologyTitrationService, FastingWindowType, IMedicationToTitrate, IFastingScheduleSummary } from '../../services/fasting-chronobiology-titration.service';
import { CommunitySolidarityConnectorService, IFaithSolidarityHub } from '../../services/community-solidarity-connector.service';
import { CameraBarcodeDietaryExcipientScannerService, IScanVerdict } from '../../services/camera-barcode-dietary-excipient-scanner.service';

@Component({
  selector: 'app-faith-tradition-conduct-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm transition-all">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
              Whole-Person Bioethics & Conduct
            </span>
            <span class="text-xs text-zinc-500 font-mono">FHIR R4 LOINC 8684-3</span>
          </div>
          <h2 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
            Faith Tradition, Somatic Conduct & Clinical Bioethics
          </h2>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Honoring dietary holiness, sacred rest rhythms, modesty boundaries, and bioethical medication rules across global traditions.
          </p>
        </div>

        <!-- Tradition Selector -->
        <div class="flex items-center gap-2">
          <label for="faith-select" class="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Tradition:</label>
          <select
            id="faith-select"
            [value]="selectedTradition()"
            (change)="onTraditionChange($event)"
            class="px-3 py-2 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            @for (item of allTraditions; track item.traditionKey) {
              <option [value]="item.traditionKey">{{ item.traditionName }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Core Pillars -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <!-- Principles -->
        <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
          <div class="flex items-center gap-2 text-zinc-900 dark:text-zinc-200 font-semibold text-sm mb-2">
            <span class="text-amber-600 dark:text-amber-400">📜</span> Core Ethical Principles
          </div>
          <ul class="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside">
            @for (p of activeRule().corePrinciples; track p) {
              <li>{{ p }}</li>
            }
          </ul>
        </div>

        <!-- Strict Prohibitions -->
        <div class="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50">
          <div class="flex items-center gap-2 text-red-900 dark:text-red-300 font-semibold text-sm mb-2">
            <span>⛔</span> Strict Dietary Prohibitions
          </div>
          <ul class="text-xs text-red-800 dark:text-red-300/90 space-y-1.5 list-disc list-inside">
            @for (proh of activeRule().strictProhibitions; track proh) {
              <li>{{ proh }}</li>
            }
          </ul>
        </div>

        <!-- Staples & Permitted -->
        <div class="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
          <div class="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold text-sm mb-2">
            <span>🌿</span> Permitted Sacred Staples
          </div>
          <ul class="text-xs text-emerald-800 dark:text-emerald-300/90 space-y-1.5 list-disc list-inside">
            @for (st of activeRule().permittedStaples; track st) {
              <li>{{ st }}</li>
            }
          </ul>
        </div>
      </div>

      <!-- Somatic Conduct & Daily Habits -->
      <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
        <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
          <span>🕯️</span> Somatic Daily Conduct, Sacred Rest & Clinical Autonomy
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Sacred Rest</span>
            <p class="text-xs text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">{{ activeRule().somaticConduct.sacredRestDays }}</p>
          </div>
          <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Prayer & Reflection</span>
            <p class="text-xs text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">{{ activeRule().somaticConduct.prayerMeditationRhythm }}</p>
          </div>
          <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Modesty & Touch</span>
            <p class="text-xs text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">{{ activeRule().somaticConduct.modestyPhysicalTouch }}</p>
          </div>
          <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Blood & End-of-Life</span>
            <p class="text-xs text-zinc-800 dark:text-zinc-300 font-medium leading-relaxed">{{ activeRule().somaticConduct.endOfLifeBloodPreferences }}</p>
          </div>
        </div>
      </div>

      <!-- Fasting Calendar & Clinical Adjustments -->
      @if (activeRule().fastingPractices.length > 0) {
        <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
          <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <span>⏱️</span> Fasting Seasons & Medication Titration
          </h3>
          <div class="space-y-3">
            @for (fast of activeRule().fastingPractices; track fast.name) {
              <div class="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ fast.name }}</span>
                  <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Medication Adjustment Protocol</span>
                </div>
                <p class="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{{ fast.description }}</p>
                <div class="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                  <span class="font-bold">Clinical Care Directive:</span> {{ fast.clinicalAdjustmentNotes }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Interactive Medication Excipient Checker -->
      <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <span>💊</span> Medication Excipient & Capsule Audit
          </h3>
          <span class="text-xs text-zinc-500">ISMP Multi-Tradition Safety Guard</span>
        </div>
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            (click)="testExcipient('Porcine Gelatin Capsule Shell')"
            class="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            Check Porcine Gelatin
          </button>
          <button
            type="button"
            (click)="testExcipient('Bovine Stearate')"
            class="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            Check Bovine Stearate
          </button>
          <button
            type="button"
            (click)="testExcipient('Ethanol Liquid Cough Suspension')"
            class="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            Check Ethanol Elixir
          </button>
          <button
            type="button"
            (click)="testExcipient('Human Albumin 5% IV Solution')"
            class="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
          >
            Check Albumin Fraction
          </button>
        </div>

        @if (auditResults().length > 0) {
          <div class="space-y-2 mt-3">
            @for (res of auditResults(); track res.excipient) {
              <div
                class="p-3 rounded-xl border text-xs"
                [ngClass]="{
                  'bg-red-50/80 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300': res.riskLevel === 'STRICT_PROHIBITION',
                  'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300': res.riskLevel === 'PRECAUTION',
                  'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300': res.riskLevel === 'SAFE'
                }"
              >
                <div class="flex items-center justify-between font-semibold">
                  <span>{{ res.excipient }}</span>
                  <span class="uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full font-bold"
                    [ngClass]="{
                      'bg-red-200 dark:bg-red-900/80 text-red-900 dark:text-red-200': res.riskLevel === 'STRICT_PROHIBITION',
                      'bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200': res.riskLevel === 'PRECAUTION',
                      'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200': res.riskLevel === 'SAFE'
                    }"
                  >
                    {{ res.riskLevel.replace('_', ' ') }}
                  </span>
                </div>
                <p class="mt-1">{{ res.message }}</p>
                <p class="mt-1 font-medium underline">Recommendation: {{ res.alternativeSuggestion }}</p>
              </div>
            }
          </div>
        }
      </div>

      <!-- Fasting Titration Schedule Generator -->
      <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <span>⏱️</span> Fasting Chronobiology Pharmacotherapy Titration Engine
            </h3>
            <p class="text-xs text-zinc-500 mt-0.5">
              Recalculates insulin, sulfonylureas, diuretics, and psychiatric timing around religious fasts.
            </p>
          </div>
          <button
            type="button"
            (click)="generateFastingTitration()"
            class="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm"
          >
            Compute Titration Plan
          </button>
        </div>

        @if (titrationPlan()) {
          <div class="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
            <div class="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-900/60 pb-2">
              <span class="text-xs font-bold text-amber-900 dark:text-amber-200">
                Plan: {{ titrationPlan()?.fastingWindowName }}
              </span>
              <span class="text-[11px] font-mono text-amber-700 dark:text-amber-400">
                {{ titrationPlan()?.dawnMealName }} ↔ {{ titrationPlan()?.sunsetMealName }}
              </span>
            </div>

            @for (warning of titrationPlan()?.criticalWarnings || []; track warning) {
              <div class="p-2.5 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-200 text-xs font-semibold border border-red-300 dark:border-red-800">
                ⚠️ {{ warning }}
              </div>
            }

            <div class="space-y-2 mt-2">
              @for (item of titrationPlan()?.adjustedMedications || []; track item.drugName) {
                <div class="p-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                  <div class="flex items-center justify-between font-bold">
                    <span class="text-zinc-900 dark:text-zinc-100">{{ item.drugName }} ({{ item.category }})</span>
                    <span class="px-2 py-0.5 rounded text-[10px]"
                      [ngClass]="{
                        'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300': item.hypoglycemiaOrCrisisRisk === 'CRITICAL',
                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300': item.hypoglycemiaOrCrisisRisk === 'HIGH',
                        'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300': item.hypoglycemiaOrCrisisRisk === 'LOW'
                      }">
                      {{ item.hypoglycemiaOrCrisisRisk }} RISK
                    </span>
                  </div>
                  <div class="text-zinc-500 line-through text-[11px]">Original: {{ item.originalSchedule }}</div>
                  <div class="text-emerald-700 dark:text-emerald-400 font-semibold">Titrated Fasting Schedule: {{ item.titratedFastingSchedule }}</div>
                  <div class="text-zinc-600 dark:text-zinc-400 text-[11px] mt-1">{{ item.clinicalRationale }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Zero-Egress Barcode & Excipient Camera Scanner -->
      <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <span>📷</span> Zero-Egress Camera Barcode &amp; Faith Excipient Scanner
            </h3>
            <p class="text-xs text-zinc-500 mt-0.5">
              Live edge OCR &amp; barcode audit for Porcine, Bovine, Alcohol, and dietary allergen safety.
            </p>
          </div>
          <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            W3C BarcodeDetector Active
          </span>
        </div>

        <div class="flex flex-wrap gap-2 mb-3">
          @for (demo of demoUpcs; track demo.upc) {
            <button
              type="button"
              (click)="scanUpc(demo.upc)"
              class="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Scan {{ demo.label }}
            </button>
          }
        </div>

        @if (scannedVerdict()) {
          <div
            class="p-4 rounded-xl border text-xs space-y-2"
            [ngClass]="{
              'bg-red-50/90 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200': scannedVerdict()?.overallSafety === 'STRICT_PROHIBITION',
              'bg-amber-50/90 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200': scannedVerdict()?.overallSafety === 'PRECAUTION',
              'bg-emerald-50/90 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200': scannedVerdict()?.overallSafety === 'SAFE'
            }"
          >
            <div class="flex items-center justify-between font-bold">
              <span class="text-sm">{{ scannedVerdict()?.brand }} — {{ scannedVerdict()?.productName }}</span>
              <span class="uppercase tracking-wider px-2 py-0.5 rounded text-[10px] font-bold"
                [ngClass]="{
                  'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100': scannedVerdict()?.overallSafety === 'STRICT_PROHIBITION',
                  'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100': scannedVerdict()?.overallSafety === 'PRECAUTION',
                  'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100': scannedVerdict()?.overallSafety === 'SAFE'
                }">
                {{ scannedVerdict()?.overallSafety?.replace('_', ' ') }}
              </span>
            </div>

            @if ((scannedVerdict()?.faithConductViolations || []).length > 0) {
              <div class="font-semibold text-red-800 dark:text-red-300">
                Faith Conduct Prohibitions:
                <ul class="list-disc list-inside mt-0.5 font-normal">
                  @for (v of scannedVerdict()?.faithConductViolations || []; track v) {
                    <li>{{ v }}</li>
                  }
                </ul>
              </div>
            }

            @if ((scannedVerdict()?.allergenViolations || []).length > 0) {
              <div class="font-semibold text-red-800 dark:text-red-300">
                Allergen Violations:
                <ul class="list-disc list-inside mt-0.5 font-normal">
                  @for (a of scannedVerdict()?.allergenViolations || []; track a) {
                    <li>{{ a }}</li>
                  }
                </ul>
              </div>
            }

            @if ((scannedVerdict()?.certificationsConfirmed || []).length > 0) {
              <div class="text-[11px] text-zinc-600 dark:text-zinc-400">
                ✓ Certified by: {{ scannedVerdict()?.certificationsConfirmed?.join(', ') }}
              </div>
            }
          </div>
        }
      </div>

      <!-- Community Solidarity & Langar Co-op Hubs -->
      <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
        <h3 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
          <span>🤝</span> Community Solidarity, Free Langar Kitchens &amp; Faith Co-Ops
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          @for (hub of solidarityHubs(); track hub.id) {
            <div class="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5 shadow-sm">
              <div class="flex items-start justify-between">
                <div>
                  <h4 class="text-xs font-bold text-zinc-900 dark:text-zinc-100">{{ hub.name }}</h4>
                  <div class="text-[11px] text-zinc-500">{{ hub.address }} • <strong class="text-amber-600 font-mono">{{ hub.distanceMiles }} mi</strong></div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                  {{ hub.costPolicy }}
                </span>
              </div>
              <p class="text-xs text-zinc-600 dark:text-zinc-400">{{ hub.operatingHours }}</p>
              <div class="text-[11px] text-zinc-700 dark:text-zinc-300">
                <strong>Offerings:</strong> {{ hub.offerings.join('; ') }}
              </div>
              <div class="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200/50 dark:border-amber-900/30">
                <strong>Etiquette:</strong> {{ hub.culturalEtiquetteTips.join(' • ') }}
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Community Solidarity & FHIR Export -->
      <div class="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span class="text-amber-600 font-bold">🤝 Community Solidarity:</span>
          <span>{{ activeRule().communitySolidarityBenefit }}</span>
        </div>

        <button
          type="button"
          (click)="exportFhirBundle()"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors shadow-sm"
        >
          <span>📜</span> Export FHIR R4 Spiritual Consent & Dietary Bundle
        </button>
      </div>

      @if (exportedJson()) {
        <div class="mt-4 p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] overflow-x-auto max-h-60 border border-zinc-800">
          <div class="flex justify-between items-center pb-2 border-b border-zinc-800 mb-2 text-zinc-400">
            <span>FHIR R4 Bundle Generated Successfully</span>
            <button (click)="exportedJson.set(null)" class="text-zinc-400 hover:text-white">✕ Close</button>
          </div>
          <pre>{{ exportedJson() }}</pre>
        </div>
      }
    </div>
  `
})
export class FaithTraditionConductCardComponent {
  private readonly spiritualService = inject(SpiritualDietaryConductService);
  private readonly titrationService = inject(FastingChronobiologyTitrationService);
  private readonly solidarityService = inject(CommunitySolidarityConnectorService);
  private readonly scannerService = inject(CameraBarcodeDietaryExcipientScannerService);

  readonly allTraditions = this.spiritualService.getAllTraditions();
  readonly selectedTradition = this.spiritualService.selectedTradition;
  readonly activeRule = this.spiritualService.activeTraditionRule;

  readonly auditResults = signal<IExcipientAuditResult[]>([]);
  readonly exportedJson = signal<string | null>(null);

  // Fasting Titration State
  readonly titrationPlan = signal<IFastingScheduleSummary | null>(null);

  // Barcode Scanner State
  readonly demoUpcs = this.scannerService.getDemoUpcList();
  readonly scannedVerdict = signal<IScanVerdict | null>(null);

  // Solidarity Hubs
  readonly solidarityHubs = this.solidarityService.solidarityHubs;

  onTraditionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.spiritualService.setTradition(target.value as FaithTraditionKey);
      this.auditResults.set([]);
      this.exportedJson.set(null);
      this.scannedVerdict.set(null);
      this.titrationPlan.set(null);
    }
  }

  testExcipient(name: string): void {
    const res = this.spiritualService.auditMedicationExcipients([name]);
    this.auditResults.set(res);
  }

  generateFastingTitration(): void {
    const currentTrad = this.selectedTradition();
    let fType: FastingWindowType = 'INTERMITTENT_FASTING_16_8';
    if (currentTrad === 'ISLAM_HALAL_TAYYIB') fType = 'RAMADAN_DAWN_TO_DUSK';
    else if (currentTrad === 'JUDAISM_ORTHODOX_KOSHER') fType = 'YOM_KIPPUR_25HR_TOTAL';
    else if (currentTrad === 'EASTERN_ORTHODOX_FASTING') fType = 'GREAT_LENT_ORTHODOX_VEGAN';
    else if (currentTrad === 'HINDUISM_SATTVIC_AHIMSA') fType = 'EKADASHI_PHALAHAR';
    else if (currentTrad === 'BUDDHISM_MINDFUL_FIVE_PRECEPTS') fType = 'UPOSATHA_NO_SOLIDS_AFTER_NOON';
    else if (currentTrad === 'LATTER_DAY_SAINTS_WORD_OF_WISDOM') fType = 'FAST_SUNDAY_LDS_24HR';

    const sampleMeds: IMedicationToTitrate[] = [
      {
        drugName: 'Insulin Glargine',
        category: 'DIABETIC_INSULIN',
        standardDoseSchedule: '20 units SubQ every morning',
        baselineTiming: 'MORNING'
      },
      {
        drugName: 'Hydrochlorothiazide (HCTZ)',
        category: 'ANTIHYPERTENSIVE',
        standardDoseSchedule: '25mg PO morning',
        baselineTiming: 'MORNING'
      },
      {
        drugName: 'Glipizide XL',
        category: 'DIABETIC_ORAL',
        standardDoseSchedule: '10mg PO morning with breakfast',
        baselineTiming: 'MORNING'
      }
    ];

    const plan = this.titrationService.titrateRegimen(sampleMeds, fType);
    this.titrationPlan.set(plan);
  }

  scanUpc(upc: string): void {
    const verdict = this.scannerService.evaluateBarcode(upc, ['Gluten', 'Dairy']);
    this.scannedVerdict.set(verdict);
  }

  exportFhirBundle(): void {
    const bundle = this.spiritualService.generateFhirSpiritualConductBundle();
    this.exportedJson.set(JSON.stringify(bundle, null, 2));
  }
}

