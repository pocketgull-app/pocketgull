import { Component, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../../services/patient-state.service';
import { PatientManagementService } from '../../services/patient-management.service';

@Component({
  selector: 'app-nantucket-tick-case-study',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 sm:p-8 text-zinc-100 max-w-5xl mx-auto shadow-2xl space-y-6">
      
      <!-- Top Header & Geographic Context -->
      <div class="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <span>🌲 Community Case Study &bull; Nantucket Island, MA</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-zinc-50 tracking-tight">
            Vector Ecology &amp; Multi-Organ Triage on Nantucket
          </h2>
          <p class="text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
            Navigating <em>Borrelia burgdorferi</em> (Lyme Disease), <em>Babesia microti</em>, and <em>Anaplasma phagocytophilum</em> co-infections in high-incidence coastal island communities using offline Edge AI and Systems Biology.
          </p>
        </div>

        <div class="shrink-0 flex items-center gap-2">
          <button 
            type="button"
            (click)="loadNantucketCaseIntoApp()"
            class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer">
            <span>📥 Load Case into Cockpit</span>
          </button>
          <button 
            type="button"
            (click)="close.emit()"
            class="p-2 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close case study">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      <!-- 4-Column Community & Diagnostic Summary Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Vector Dynamics</div>
          <div class="text-lg font-bold text-amber-400 mt-1">&gt;40% Borrelia Rate</div>
          <p class="text-xs text-zinc-400 mt-1"><em>Ixodes scapularis</em> nymphs with 18% <em>Babesia microti</em> co-carriage in Polpis scrub.</p>
        </div>

        <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Patient Profile</div>
          <div class="text-lg font-bold text-zinc-100 mt-1">42y Groundskeeper</div>
          <p class="text-xs text-zinc-400 mt-1">Conservation brush clearing in Madaket; fatigue, night sweats, thrombocytopenia.</p>
        </div>

        <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Diagnostic Triad</div>
          <div class="text-lg font-bold text-teal-400 mt-1">Lyme + Babesiosis</div>
          <p class="text-xs text-zinc-400 mt-1">Positive C6 ELISA + Maltese cross intraerythrocytic tetrads on thin blood smear.</p>
        </div>

        <div class="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <div class="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Offline Edge Mode</div>
          <div class="text-lg font-bold text-emerald-400 mt-1">Zero-Cell Triage</div>
          <p class="text-xs text-zinc-400 mt-1">Field-tested in Coskata-Coatue without network egress or cellular towers.</p>
        </div>
      </div>

      <!-- Detailed Clinical Narrative -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left: Case Narrative & Presentation -->
        <div class="space-y-4">
          <h3 class="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>🩺 Patient Presentation &amp; Diagnostic Radar</span>
          </h3>
          
          <div class="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl text-xs space-y-3 leading-relaxed text-zinc-300">
            <p>
              <strong>History of Present Illness:</strong> A 42-year-old landscaper on Nantucket presents to the island community clinic with an 8-day history of escalating fatigue, migrating arthralgias (knees and neck), intermittent drenching night sweats, and a 6cm expanding erythematous lesion on the posterior left thigh.
            </p>
            <p>
              <strong>The Diagnostic Dilemma (Why Standard Lyme Fails Alone):</strong> While the clinician initially considered classic Lyme disease, standard monotherapy with doxycycline would have failed to clear the concurrent protozoal parasite <em>Babesia microti</em>, which was responsible for the patient's hemolytic anemia and severe night sweats.
            </p>
            <div class="p-3 bg-zinc-900 rounded border border-zinc-700/60 font-mono text-[11px] space-y-1">
              <div class="text-amber-300 font-bold">Key Telemetry &amp; Lab Markers:</div>
              <div>• Hemoglobin: 11.2 g/dL (Hemolytic drop, elevated LDH)</div>
              <div>• Platelets: 128,000 /μL (Thrombocytopenia)</div>
              <div>• Resting HR: 92 bpm | HRV RMSSD: 18 ms (Vagal Brake Collapse)</div>
              <div>• Blood Smear: Intraerythrocytic tetrads (Maltese cross)</div>
              <div>• CDC 2-Tier Serology: IgM Western Blot 23, 39, 41 kDa (+)</div>
            </div>
          </div>
        </div>

        <!-- Right: Systems Biology & Donella Meadows Leverage Hierarchy -->
        <div class="space-y-4">
          <h3 class="text-base font-bold text-zinc-100 flex items-center gap-2">
            <span>⟁ Donella Meadows Leverage Hierarchy in Vector Ecology</span>
          </h3>

          <div class="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl text-xs space-y-3 leading-relaxed text-zinc-300">
            <div class="border-l-2 border-teal-500 pl-3">
              <strong class="text-teal-300">Leverage Level 1 (Paradigm Change):</strong>
              <p class="text-zinc-400 mt-0.5">
                Support community island ecological initiatives (such as the MIT / Kevin Esvelt <em>"Mice Against Ticks"</em> engineered mouse reservoir immunity project on Nantucket &amp; Martha's Vineyard) to disrupt spirochete transmission at the ecosystem source.
              </p>
            </div>

            <div class="border-l-2 border-amber-500 pl-3">
              <strong class="text-amber-300">Leverage Level 3 (System Rules):</strong>
              <p class="text-zinc-400 mt-0.5">
                Enforce mandatory multi-pathogen co-infection screening panels (<em>Borrelia</em> + <em>Babesia</em> + <em>Anaplasma</em> + <em>Borrelia miyamotoi</em>) before attributing treatment failure to "refractory Lyme".
              </p>
            </div>

            <div class="border-l-2 border-sky-500 pl-3">
              <strong class="text-sky-300">Leverage Level 9 (Buffers &amp; Dual Clearance):</strong>
              <p class="text-zinc-400 mt-0.5">
                Dual antimicrobial protocol: <strong>Doxycycline 100mg BID</strong> (for spirochetes &amp; Anaplasma) + <strong>Atovaquone 750mg BID &amp; Azithromycin 500mg</strong> (for intraerythrocytic Babesia), coupled with evidence-based botanical biofilm disruptors (<em>Cryptolepis sanguinolenta</em>, <em>Polygonum cuspidatum</em> / resveratrol, Johns Hopkins Dr. Ying Zhang lab protocols).
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- Action Footer -->
      <div class="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-zinc-400">
          Want to simulate this case in PocketGull? Clicking below loads this exact patient dataset into the live Systems Thinking workspace.
        </div>
        <button 
          type="button"
          (click)="loadNantucketCaseIntoApp()"
          class="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg cursor-pointer">
          Launch Nantucket Case Simulation →
        </button>
      </div>

    </div>
  `
})
export class NantucketTickCaseStudyComponent {
  patientState = inject(PatientStateService);
  patientMgmt = inject(PatientManagementService, { optional: true });

  close = output<void>();
  caseLoaded = output<void>();

  loadNantucketCaseIntoApp() {
    // Populate PatientStateService with Nantucket Landscaper presentation
    this.patientState.occupation.set('Conservation Landscaper (Nantucket)');
    this.patientState.reasonForVisit.set(
      '42-year-old Nantucket conservation landscaper presenting with 8-day history of fatigue, migrating arthralgias in knees and neck, expanding atypical annular plaque on posterior thigh, night sweats, and resting tachycardia after clearing brush in Polpis.'
    );

    this.patientState.vitals.set({
      hr: '92',
      bp: '118/72',
      spO2: '98',
      temp: '38.2',
      weight: '78 kg',
      height: '178 cm',
      cgmGlucoseMgDl: '95',
      vitC: 'Normal',
      vitD3: '28 ng/mL',
      magnesium: '2.1 mg/dL',
      zinc: '85 ug/dL',
      b12: '450 pg/mL'
    });

    this.patientState.issues.set({
      thigh_left: [{
        id: 'thigh_left',
        noteId: 'note_nantucket_thigh',
        name: 'Left Thigh (Posterior)',
        painLevel: 4,
        description: '6cm expanding erythematous lesion without central clearing (atypical Lyme rash vs tick co-infection)',
        symptoms: ['Expanding Erythema Migrans Plaque', 'Pruritus', 'Fever'],
        recommendation: 'CDC Two-Tier Serology & Thin Blood Smear for Babesia microti tetrads'
      }],
      knee_left: [{
        id: 'knee_left',
        noteId: 'note_nantucket_knee',
        name: 'Left Knee Joint',
        painLevel: 5,
        description: 'Migrating arthralgia with mild joint effusion',
        symptoms: ['Migrating Joint Pain', 'Effusion', 'Stiffness'],
        recommendation: 'Weight-bearing joint rest, Doxycycline 100mg BID + Atovaquone 750mg BID'
      }]
    });

    this.caseLoaded.emit();
    this.close.emit();
  }
}
