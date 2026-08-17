import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IrmaaDecisionService, TaxFilingStatus, LifeChangingEvent } from '../../services/irmaa-decision.service';

@Component({
  selector: 'app-irmaa-decision-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6 bg-zinc-950/90 dark:bg-zinc-950 border border-emerald-500/30 rounded-2xl shadow-2xl text-zinc-100 max-w-4xl mx-auto backdrop-blur-xl">
      <!-- Header Badge -->
      <div class="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <span class="text-xl">📊</span>
          </div>
          <div>
            <h2 class="text-lg font-bold tracking-wide text-emerald-400">Medicare IRMAA & SSA-44 Decision Intelligence</h2>
            <p class="text-xs text-zinc-400">Income-Related Monthly Adjustment Amount & Form SSA-44 Life-Changing Event Appeals Engine</p>
          </div>
        </div>
        <span class="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
          IRS 2026/2024 Actuarial Rules
        </span>
      </div>

      <!-- Controls Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- MAGI Slider & Input -->
        <div class="space-y-3 bg-zinc-900/70 p-4 rounded-xl border border-zinc-800">
          <div class="flex justify-between items-center">
            <label class="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Modified Adjusted Gross Income (MAGI)</label>
            <span class="text-lg font-mono font-bold text-emerald-400">\${{ irmaaService.magi() | number }}</span>
          </div>
          <input 
            type="range" 
            min="50000" 
            max="600000" 
            step="5000" 
            [ngModel]="irmaaService.magi()" 
            (ngModelChange)="irmaaService.magi.set($event)"
            class="w-full accent-emerald-500 bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />
          <div class="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>$50,000</span>
            <span>$250,000</span>
            <span>$600,000+</span>
          </div>
        </div>

        <!-- Filing Status & Tier Overview -->
        <div class="space-y-3 bg-zinc-900/70 p-4 rounded-xl border border-zinc-800">
          <label class="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">Tax Filing Status</label>
          <div class="grid grid-cols-2 gap-2">
            <button 
              (click)="irmaaService.filingStatus.set('single')"
              [class.bg-emerald-600]="irmaaService.filingStatus() === 'single'"
              [class.text-white]="irmaaService.filingStatus() === 'single'"
              [class.bg-zinc-800]="irmaaService.filingStatus() !== 'single'"
              [class.text-zinc-400]="irmaaService.filingStatus() !== 'single'"
              class="py-2 text-xs font-medium rounded-lg transition-all border border-zinc-700 hover:border-emerald-500">
              Single Filer
            </button>
            <button 
              (click)="irmaaService.filingStatus.set('joint')"
              [class.bg-emerald-600]="irmaaService.filingStatus() === 'joint'"
              [class.text-white]="irmaaService.filingStatus() === 'joint'"
              [class.bg-zinc-800]="irmaaService.filingStatus() !== 'joint'"
              [class.text-zinc-400]="irmaaService.filingStatus() !== 'joint'"
              class="py-2 text-xs font-medium rounded-lg transition-all border border-zinc-700 hover:border-emerald-500">
              Married Jointly
            </button>
          </div>
        </div>
      </div>

      <!-- Analysis Results Card -->
      <div class="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 p-5 rounded-xl border border-zinc-800 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
          <div class="border-b md:border-b-0 md:border-r border-zinc-800 pb-3 md:pb-0 pr-3">
            <span class="text-[11px] font-medium text-zinc-400 uppercase">Assessed Medicare Tier</span>
            <div class="text-xl font-bold text-emerald-300 mt-1">{{ analysis().currentTier.label }}</div>
            <span class="text-xs text-zinc-400">Tier {{ analysis().currentTier.tier }} / 5</span>
          </div>

          <div class="border-b md:border-b-0 md:border-r border-zinc-800 pb-3 md:pb-0 pr-3">
            <span class="text-[11px] font-medium text-zinc-400 uppercase">Monthly Premium Surcharge</span>
            <div class="text-xl font-mono font-bold text-amber-400 mt-1">+\${{ analysis().currentTier.totalMonthlySurcharge | number:'1.2-2' }}/mo</div>
            <span class="text-xs text-zinc-400">Part B: +\${{ analysis().currentTier.partBSurchargeMonthly }} | Part D: +\${{ analysis().currentTier.partDSurchargeMonthly }}</span>
          </div>

          <div>
            <span class="text-[11px] font-medium text-zinc-400 uppercase">Annual Surcharge Realization</span>
            <div class="text-xl font-mono font-bold text-rose-400 mt-1">\${{ analysis().annualSurcharge | number:'1.2-2' }}/yr</div>
            <span class="text-xs text-zinc-400">Total out-of-pocket impact</span>
          </div>
        </div>

        <!-- Tax Cliff Warning -->
        @if (analysis().cliffBufferDistance <= 5000 && analysis().nextTier) {
          <div class="mt-4 p-3 bg-amber-950/60 border border-amber-500/50 rounded-lg text-amber-200 text-xs flex items-center gap-2">
            <span>⚡</span>
            <span><strong>TAX CLIFF WARNING:</strong> You are <strong>\${{ analysis().cliffBufferDistance | number }}</strong> away from Tier {{ analysis().nextTier?.tier }} (+\${{ (analysis().nextTier?.totalAnnualSurcharge || 0) - analysis().annualSurcharge | number:'1.2-2' }}/yr surcharge increase).</span>
          </div>
        }
      </div>

      <!-- Form SSA-44 Life-Changing Event Appeals Engine -->
      <div class="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800">
        <h3 class="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Form SSA-44 Life-Changing Event (LCE) Qualifier</h3>
        <p class="text-xs text-zinc-400 mb-4">Select qualifying events that reduced your income below prior tax return lookback levels:</p>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          @for (event of eventOptions; track event.id) {
            <button 
              (click)="toggleEvent(event.id)"
              [class.bg-emerald-900\/60]="hasEvent(event.id)"
              [class.border-emerald-500]="hasEvent(event.id)"
              [class.text-emerald-300]="hasEvent(event.id)"
              [class.bg-zinc-800\/60]="!hasEvent(event.id)"
              [class.border-zinc-700]="!hasEvent(event.id)"
              [class.text-zinc-400]="!hasEvent(event.id)"
              class="p-2 text-[11px] font-medium rounded-lg text-left border transition-all hover:border-emerald-500 flex items-center justify-between">
              <span>{{ event.label }}</span>
              @if (hasEvent(event.id)) { <span class="text-emerald-400">✓</span> }
            </button>
          }
        </div>

        <!-- Appeal Recommendation -->
        <div class="p-4 rounded-xl border" [class.bg-emerald-950\/50]="analysis().appealAssessment.isEligible" [class.border-emerald-500\/40]="analysis().appealAssessment.isEligible" [class.bg-zinc-900]="!analysis().appealAssessment.isEligible" [class.border-zinc-800]="!analysis().appealAssessment.isEligible">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold" [class.text-emerald-400]="analysis().appealAssessment.isEligible" [class.text-zinc-400]="!analysis().appealAssessment.isEligible">
              SSA-44 Appeal Status: {{ analysis().appealAssessment.isEligible ? 'QUALIFIED FOR SURCHARGE ELIMINATION' : 'NOT ELIGIBLE FOR APPEAL' }}
            </span>
            @if (analysis().appealAssessment.isEligible) {
              <span class="text-xs font-mono font-bold text-emerald-300">Save \${{ analysis().appealAssessment.estimatedAnnualSavings | number:'1.2-2' }}/yr</span>
            }
          </div>
          <p class="text-xs text-zinc-300 mb-2">{{ analysis().appealAssessment.recommendationDirective }}</p>
          
          @if (analysis().appealAssessment.requiredDocuments.length > 0) {
            <div class="text-[11px] text-zinc-400">
              <strong>Required Documentation:</strong>
              <ul class="list-disc list-inside mt-1 space-y-0.5">
                @for (doc of analysis().appealAssessment.requiredDocuments; track doc) {
                  <li>{{ doc }}</li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class IrmaaDecisionCalculatorComponent {
  public irmaaService = inject(IrmaaDecisionService);
  public analysis = this.irmaaService.analysis;

  public eventOptions: { id: LifeChangingEvent; label: string }[] = [
    { id: 'WORK_REDUCTION', label: 'Work Reduction' },
    { id: 'WORK_STOPPAGE', label: 'Retirement / Work Stoppage' },
    { id: 'DEATH_OF_SPOUSE', label: 'Spousal Death' },
    { id: 'MARRIAGE', label: 'Marriage' },
    { id: 'DIVORCE_OR_ANNULMENT', label: 'Divorce' },
    { id: 'INCOME_PROPERTY_LOSS', label: 'Income Property Loss' },
    { id: 'PENSION_PORTFOLIO_LOSS', label: 'Pension Loss' },
    { id: 'EMPLOYER_SETTLEMENT', label: 'Employer Settlement' }
  ];

  public hasEvent(id: LifeChangingEvent): boolean {
    return this.irmaaService.activeEvents().includes(id);
  }

  public toggleEvent(id: LifeChangingEvent): void {
    const current = this.irmaaService.activeEvents();
    if (current.includes(id)) {
      this.irmaaService.activeEvents.set(current.filter(e => e !== id));
    } else {
      this.irmaaService.activeEvents.set([...current, id]);
    }
  }
}
