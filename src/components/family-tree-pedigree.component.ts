import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';

export interface IPedigreeMember {
  id: string;
  relation: string; // e.g. 'Maternal Grandmother', 'Father', 'Child'
  name: string;
  generation: 'grandparents' | 'parents' | 'offspring';
  status: 'active_risk' | 'neutralized' | 'optimal';
  riskLabel: string; // e.g. 'MTHFR C677T Heterozygous'
  biomarkers: { name: string; value: string; status: 'high' | 'optimal' | 'low' }[];
  intervention: string; // e.g. 'L-5-MTHF 800mcg + Active B12'
  bioAgeDelta: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-family-tree-pedigree',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in font-mono">
      
      <!-- Dieter Rams Braun Functional Shell -->
      <div class="w-full max-w-5xl max-h-[92vh] bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col font-['Inter'] text-zinc-100">
        
        <!-- Header -->
        <div class="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between font-mono">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-400 flex items-center justify-center text-xl font-bold shadow-inner">
              🌳
            </div>
            <div>
              <h2 class="text-base font-black uppercase text-zinc-100 tracking-wide">Family Health Pedigree Tree & Risk Branch Pruning</h2>
              <p class="text-xs text-zinc-400 font-sans mt-0.5">Trace hereditary risk lineages, drill down into biomarkers, and neutralize hazard branches</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="text-zinc-400 hover:text-white text-2xl font-semibold p-1 cursor-pointer">
            &times;
          </button>
        </div>

        <!-- Main Body: Split View (Tree + Drill-down Panel) -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          <!-- Tree Visualizer Canvas -->
          <div class="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-950 font-mono">
            
            <!-- Generation 1: Grandparents -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Generation 1 — Grandparents (Senior Caretaking)</span>
              <div class="grid grid-cols-2 gap-4">
                @for (member of getMembersByGen('grandparents'); track member.id) {
                  <div (click)="selectMember(member)"
                    [class]="selectedMember()?.id === member.id
                      ? 'p-4 rounded-2xl bg-zinc-900 border-2 border-orange-500 shadow-md cursor-pointer flex items-center justify-between'
                      : 'p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer flex items-center justify-between'">
                    <div>
                      <span class="text-[10px] font-bold uppercase text-zinc-400 block">{{ member.relation }}</span>
                      <h4 class="text-xs font-bold text-zinc-100 font-sans mt-0.5">{{ member.name }}</h4>
                      <p class="text-[11px] text-zinc-400 font-sans mt-0.5">{{ member.riskLabel }}</p>
                    </div>
                    <span [class]="getStatusBadgeClass(member.status)" class="text-[9px] px-2 py-0.5 rounded font-bold uppercase border">
                      {{ getStatusText(member.status) }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Connecting Connector Line -->
            <div class="flex justify-center">
              <div class="w-0.5 h-6 bg-zinc-800"></div>
            </div>

            <!-- Generation 2: Parents -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Generation 2 — Parents (Pre-Conception & Mid-Life)</span>
              <div class="grid grid-cols-2 gap-4">
                @for (member of getMembersByGen('parents'); track member.id) {
                  <div (click)="selectMember(member)"
                    [class]="selectedMember()?.id === member.id
                      ? 'p-4 rounded-2xl bg-zinc-900 border-2 border-orange-500 shadow-md cursor-pointer flex items-center justify-between'
                      : 'p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer flex items-center justify-between'">
                    <div>
                      <span class="text-[10px] font-bold uppercase text-zinc-400 block">{{ member.relation }}</span>
                      <h4 class="text-xs font-bold text-zinc-100 font-sans mt-0.5">{{ member.name }}</h4>
                      <p class="text-[11px] text-zinc-400 font-sans mt-0.5">{{ member.riskLabel }}</p>
                    </div>
                    <span [class]="getStatusBadgeClass(member.status)" class="text-[9px] px-2 py-0.5 rounded font-bold uppercase border">
                      {{ getStatusText(member.status) }}
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Connecting Connector Line -->
            <div class="flex justify-center">
              <div class="w-0.5 h-6 bg-zinc-800"></div>
            </div>

            <!-- Generation 3: Offspring -->
            <div class="space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Generation 3 — Offspring (Protected Healthspan)</span>
              <div class="grid grid-cols-1 gap-4">
                @for (member of getMembersByGen('offspring'); track member.id) {
                  <div (click)="selectMember(member)"
                    [class]="selectedMember()?.id === member.id
                      ? 'p-4 rounded-2xl bg-zinc-900 border-2 border-orange-500 shadow-md cursor-pointer flex items-center justify-between'
                      : 'p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer flex items-center justify-between'">
                    <div>
                      <span class="text-[10px] font-bold uppercase text-zinc-400 block">{{ member.relation }}</span>
                      <h4 class="text-xs font-bold text-zinc-100 font-sans mt-0.5">{{ member.name }}</h4>
                      <p class="text-[11px] text-zinc-400 font-sans mt-0.5">{{ member.riskLabel }}</p>
                    </div>
                    <span [class]="getStatusBadgeClass(member.status)" class="text-[9px] px-2 py-0.5 rounded font-bold uppercase border">
                      {{ getStatusText(member.status) }}
                    </span>
                  </div>
                }
              </div>
            </div>

          </div>

          <!-- Drill-Down Detail Drawer -->
          @if (selectedMember(); as member) {
            <div class="w-full lg:w-96 p-6 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900 flex flex-col justify-between overflow-y-auto space-y-6 font-mono">
            
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <span class="text-[10px] font-bold uppercase text-zinc-400">Drill-Down Member Detail</span>
                  <h3 class="text-sm font-bold text-zinc-100 font-sans mt-0.5">{{ member.name }} ({{ member.relation }})</h3>
                </div>
                <span [class]="getStatusBadgeClass(member.status)" class="text-[9px] px-2.5 py-1 rounded font-bold uppercase border">
                  {{ getStatusText(member.status) }}
                </span>
              </div>

              <!-- Biomarker Matrix -->
              <div class="space-y-2">
                <span class="text-[10px] font-bold uppercase text-zinc-400">Key Biomarker & Variant Metrics</span>
                <div class="space-y-1.5">
                  <div *ngFor="let bio of member.biomarkers" class="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                    <span class="text-zinc-400 font-sans text-xs">{{ bio.name }}</span>
                    <span class="font-bold" [class.text-orange-400]="bio.status === 'high'" [class.text-emerald-400]="bio.status === 'optimal'">
                      {{ bio.value }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Target Protocol -->
              <div class="space-y-1">
                <span class="text-[10px] font-bold uppercase text-zinc-400">Multi-Paradigm Neutralization Protocol</span>
                <p class="text-xs font-medium text-zinc-200 bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-sans leading-relaxed">
                  {{ member.intervention }}
                </p>
              </div>

              <!-- Epigenetic Delta -->
              <div class="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <span class="text-[10px] font-bold uppercase text-orange-400 block mb-0.5">Actuarial Epigenetic Delta</span>
                <p class="font-bold text-zinc-200">
                  Biological Age Delta: {{ member.bioAgeDelta }} yrs
                </p>
              </div>
            </div>

            <!-- Risk Pruning Action Button -->
            <div class="pt-4 border-t border-zinc-800 space-y-2">
              @if (member.status === 'active_risk') {
                <button 
                  (click)="neutralizeBranch(member.id)" 
                  class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-md cursor-pointer border border-orange-400/50">
                  Prune & Neutralize Risk Branch
                </button>
              } @else {
                <p class="text-center text-xs text-emerald-400 font-bold py-2">
                  ✓ Risk Branch Neutralized
                </p>
              }
            </div>

          </div>
        }
      </div>

      <!-- Footer -->
      <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between font-mono text-xs text-zinc-400">
        <span>Family Pedigree Tree • Prune branches to expand offspring healthspan</span>
        <pocket-gull-button (click)="closeModal.emit()" variant="secondary" size="sm">
          Close Visualizer
        </pocket-gull-button>
      </div>

    </div>
  </div>
  `,
  styles: [`
    .animate-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class FamilyTreePedigreeComponent {
  closeModal = output<void>();

  members = signal<IPedigreeMember[]>([
    {
      id: 'g_mat_gf',
      relation: 'Maternal Grandfather',
      name: 'Arthur Miller',
      generation: 'grandparents',
      status: 'active_risk',
      riskLabel: 'Early ApoB Cardiopulmonary Risk',
      biomarkers: [
        { name: 'ApoB', value: '142 mg/dL', status: 'high' },
        { name: 'hs-CRP', value: '3.8 mg/L', status: 'high' }
      ],
      intervention: 'Vagal Tone 6.0 bpm breathing + CoQ10 200mg + TCM Shen Harmonization',
      bioAgeDelta: +3.2
    },
    {
      id: 'g_mat_gm',
      relation: 'Maternal Grandmother',
      name: 'Evelyn Miller',
      generation: 'grandparents',
      status: 'neutralized',
      riskLabel: 'Mild Osteoarthritis & Vata Dryness',
      biomarkers: [
        { name: 'Vitamin D3', value: '52 ng/mL', status: 'optimal' },
        { name: 'RBC Magnesium', value: '6.4 mg/dL', status: 'optimal' }
      ],
      intervention: 'Ayurvedic Warm Sesame Abhyanga + Ashwagandha Root',
      bioAgeDelta: -2.1
    },
    {
      id: 'p_mother',
      relation: 'Mother',
      name: 'Sarah Miller',
      generation: 'parents',
      status: 'active_risk',
      riskLabel: 'MTHFR C677T Heterozygous',
      biomarkers: [
        { name: 'Homocysteine', value: '12.4 µmol/L', status: 'high' },
        { name: 'Serum Folate', value: 'Sub-optimal', status: 'low' }
      ],
      intervention: 'L-5-MTHF 800mcg + Methyl-B12 + Ubiquinol Oocyte Support',
      bioAgeDelta: -1.5
    },
    {
      id: 'p_father',
      relation: 'Father',
      name: 'David Miller',
      generation: 'parents',
      status: 'neutralized',
      riskLabel: 'Normal Epigenetic Profile',
      biomarkers: [
        { name: 'Fasting Insulin', value: '4.2 µIU/mL', status: 'optimal' },
        { name: 'HbA1c', value: '5.1%', status: 'optimal' }
      ],
      intervention: 'Standard Zone 2 Aerobic Biogenesis Protocol',
      bioAgeDelta: -3.0
    },
    {
      id: 'offspring_1',
      relation: 'Offspring (Target)',
      name: 'Charles Darwin Jr.',
      generation: 'offspring',
      status: 'optimal',
      riskLabel: 'Protected Offspring Epigenome',
      biomarkers: [
        { name: 'Telomere Length Ratio', value: '1.24 T/S', status: 'optimal' },
        { name: 'DNAm Age Delta', value: '-4.2 Years', status: 'optimal' }
      ],
      intervention: 'Pre-conception Methylation Optimization + Multimodal Care Plan',
      bioAgeDelta: -4.2
    }
  ]);

  selectedMember = signal<IPedigreeMember | null>(this.members()[0]);

  getMembersByGen(gen: 'grandparents' | 'parents' | 'offspring') {
    return this.members().filter(m => m.generation === gen);
  }

  selectMember(member: IPedigreeMember) {
    this.selectedMember.set(member);
  }

  neutralizeBranch(memberId: string) {
    this.members.update(list => list.map(m => m.id === memberId ? { ...m, status: 'neutralized' } : m));
    if (this.selectedMember()?.id === memberId) {
      this.selectedMember.update(m => m ? { ...m, status: 'neutralized' } : null);
    }
  }

  getStatusBadgeClass(status: 'active_risk' | 'neutralized' | 'optimal') {
    switch (status) {
      case 'active_risk':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'neutralized':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      case 'optimal':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  }

  getStatusText(status: 'active_risk' | 'neutralized' | 'optimal') {
    switch (status) {
      case 'active_risk': return 'Active Risk';
      case 'neutralized': return 'Neutralized';
      case 'optimal': return 'Protected';
    }
  }
}
