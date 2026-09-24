import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ARCHITECTURE_ATLAS_DATA, IComponentMetadata, ISphereMetadata } from '../../assets/architecture-atlas-data';
import { NavigationShellService } from '../../services/navigation-shell.service';

@Component({
  selector: 'app-pocketgull-architecture-atlas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden animate-fade-in font-sans">
      <div class="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        
        <!-- Top Executive Header -->
        <header class="px-6 py-4 border-b border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg border border-teal-400/30">
              🏛️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-black uppercase tracking-wider text-white">
                  Pocket-Gull Architecture Atlas &amp; Visual Showcase
                </h1>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  v1.32 Reactive DAG
                </span>
              </div>
              <p class="text-xs text-zinc-400 mt-0.5">
                Comprehensive directory of {{ atlas.totalComponents }} standalone components, {{ atlas.totalServices }} clinical services, and {{ atlas.totalComponentLoc | number }} lines of code.
              </p>
            </div>
          </div>

          <!-- Close and Navigation Actions -->
          <div class="flex items-center gap-3">
            <button 
              (click)="activeView.set('directory')"
              [class.bg-teal-600]="activeView() === 'directory'"
              [class.text-white]="activeView() === 'directory'"
              [class.bg-zinc-800]="activeView() !== 'directory'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-zinc-700 hover:border-teal-500">
              <span>📚</span> Component Directory
            </button>
            <button 
              (click)="activeView.set('topology')"
              [class.bg-teal-600]="activeView() === 'topology'"
              [class.text-white]="activeView() === 'topology'"
              [class.bg-zinc-800]="activeView() !== 'topology'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-zinc-700 hover:border-teal-500">
              <span>🕸️</span> Visual Topology
            </button>
            <button 
              (click)="close()"
              aria-label="Close Architecture Atlas"
              class="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 flex items-center justify-center transition cursor-pointer">
              ✕
            </button>
          </div>
        </header>

        <!-- KPI Metrics Ribbon -->
        <div class="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 shrink-0 text-xs font-mono">
          <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 uppercase font-bold">Components</div>
            <div class="text-base font-bold text-teal-400 mt-0.5">{{ atlas.totalComponents }}</div>
          </div>
          <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 uppercase font-bold">Clinical Services</div>
            <div class="text-base font-bold text-indigo-400 mt-0.5">{{ atlas.totalServices }}</div>
          </div>
          <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 uppercase font-bold">Component LOC</div>
            <div class="text-base font-bold text-amber-400 mt-0.5">{{ atlas.totalComponentLoc | number }}</div>
          </div>
          <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 uppercase font-bold">Spec Unit Tests</div>
            <div class="text-base font-bold text-emerald-400 mt-0.5">{{ atlas.totalSpecLoc | number }} LOC</div>
          </div>
          <div class="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div class="text-[10px] text-zinc-500 uppercase font-bold">Tested Ratio</div>
            <div class="text-base font-bold text-cyan-400 mt-0.5">{{ atlas.testCoverageRatio }}%</div>
          </div>
        </div>

        <!-- Main Body: View Switcher -->
        @if (activeView() === 'directory') {
          <!-- Filter Controls & Sphere Selection -->
          <div class="p-4 sm:p-6 pb-2 shrink-0 space-y-4">
            <!-- 6 Spheres Tabs -->
            <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button 
                (click)="selectedSphereId.set('all')"
                [class.bg-teal-500]="selectedSphereId() === 'all'"
                [class.text-zinc-950]="selectedSphereId() === 'all'"
                [class.font-bold]="selectedSphereId() === 'all'"
                [class.bg-zinc-900]="selectedSphereId() !== 'all'"
                class="px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5 shrink-0">
                <span>🌐</span> All Spheres ({{ atlas.totalComponents }})
              </button>
              @for (sphere of atlas.spheres; track sphere.id) {
                <button 
                  (click)="selectedSphereId.set(sphere.id)"
                  [class.bg-teal-500]="selectedSphereId() === sphere.id"
                  [class.text-zinc-950]="selectedSphereId() === sphere.id"
                  [class.font-bold]="selectedSphereId() === sphere.id"
                  [class.bg-zinc-900]="selectedSphereId() !== sphere.id"
                  class="px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5 shrink-0">
                  <span>{{ sphere.icon }}</span> {{ sphere.name }}
                  <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
                    {{ sphere.count }}
                  </span>
                </button>
              }
            </div>

            <!-- Search, Filter & Sort Bar -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div class="relative flex-1">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
                <input 
                  type="text" 
                  [ngModel]="searchQuery()"
                  (ngModelChange)="searchQuery.set($event)"
                  placeholder="Search components by class, selector, or clinical role..." 
                  class="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <div class="flex items-center gap-2">
                <!-- Test status filter -->
                <select 
                  [ngModel]="testFilter()"
                  (ngModelChange)="testFilter.set($event)"
                  class="bg-zinc-900 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-teal-500">
                  <option value="all">All Specs</option>
                  <option value="tested">Tested Only (Spec Exists)</option>
                  <option value="untested">Needs Test Spec</option>
                </select>

                <!-- Sort order -->
                <select 
                  [ngModel]="sortOrder()"
                  (ngModelChange)="sortOrder.set($event)"
                  class="bg-zinc-900 border border-zinc-800 text-xs rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-teal-500">
                  <option value="loc_desc">LOC (Largest First)</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="spec_desc">Test Lines (Largest First)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Component Grid Area -->
          <div class="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (comp of filteredComponents(); track comp.path) {
                <div class="p-4 rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between group shadow-sm">
                  <div>
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <span class="text-lg">{{ comp.sphereIcon }}</span>
                      <div class="flex items-center gap-1.5 font-mono text-[10px]">
                        <span class="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300">
                          {{ comp.loc }} LOC
                        </span>
                        @if (comp.hasSpec) {
                          <span class="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold" title="{{ comp.specLoc }} test LOC">
                            ✓ SPEC
                          </span>
                        } @else {
                          <span class="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-600/30 text-amber-400">
                            ⏳ NO SPEC
                          </span>
                        }
                      </div>
                    </div>

                    <h3 class="text-sm font-bold text-white group-hover:text-teal-300 transition break-all">
                      {{ comp.className }}
                    </h3>
                    <code class="text-[11px] text-teal-400 font-mono block mt-0.5">
                      &lt;{{ comp.selector }}&gt;
                    </code>

                    <p class="text-xs text-zinc-400 mt-2 line-clamp-2">
                      {{ comp.description }}
                    </p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span class="truncate max-w-[200px]" title="{{ comp.path }}">
                      {{ comp.path }}
                    </span>
                    <button 
                      (click)="triggerComponentPreview(comp)"
                      class="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 transition">
                      Inspect <span>→</span>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-16 text-center text-zinc-500">
                  <span class="text-4xl block mb-2">🔍</span>
                  <p class="text-sm font-semibold">No components match your search filters.</p>
                  <p class="text-xs mt-1">Try resetting the search bar or selecting "All Spheres".</p>
                </div>
              }
            </div>
          </div>
        } @else {
          <!-- Topology View -->
          <div class="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start space-y-8">
            <div class="max-w-4xl w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
              <h2 class="text-base font-black uppercase text-teal-300 tracking-wider mb-2 flex items-center gap-2">
                <span>🕸️</span> System Architecture Topology &amp; Signal Dataflow
              </h2>
              <p class="text-xs text-zinc-400 mb-6">
                Pocket-Gull uses a unidirectional reactive signal push/pull graph (ACM SIGPLAN verified). Telemetry flows through coarse-graining and invariant gates into the 6 specialized rendering spheres.
              </p>

              <!-- Interactive Architecture Diagram -->
              <div class="space-y-6">
                <!-- Layer 1: Ingestion & Sensing -->
                <div class="p-4 rounded-xl bg-zinc-950 border border-teal-500/30">
                  <div class="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                    <span>📡</span> 1. Ingestion &amp; Sensing Layer (Hardware &amp; FHIR)
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <strong>BLE Wearables &amp; Vitals</strong>
                      <p class="text-[11px] text-zinc-400 mt-1">Pulse, HRV, SpO2, Continuous Glucose (CGM), Ambient Barometer</p>
                    </div>
                    <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <strong>WebSpeech &amp; Acoustics</strong>
                      <p class="text-[11px] text-zinc-400 mt-1">Full-duplex audio, respiratory wheeze DSP, ambient scribe</p>
                    </div>
                    <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <strong>HL7 FHIR R4 Store</strong>
                      <p class="text-[11px] text-zinc-400 mt-1">Patient records, Observations, Conditions, CarePlans</p>
                    </div>
                  </div>
                </div>

                <!-- Downward Connector -->
                <div class="flex justify-center text-teal-500 text-lg font-bold">↓</div>

                <!-- Layer 2: Core State & Invariant Gatekeeper -->
                <div class="p-4 rounded-xl bg-zinc-950 border border-indigo-500/30">
                  <div class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                    <span>⚙️</span> 2. Central Reactive State &amp; Invariant Gatekeeper
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <strong class="text-indigo-300">PatientStateService (Signals)</strong>
                      <p class="text-[11px] text-zinc-400 mt-1">Signal push/pull graph with zero memory leaks. Manages vitals, symptoms, 3D anatomical profile.</p>
                    </div>
                    <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <strong class="text-indigo-300">Epistemic Invariant Gate</strong>
                      <p class="text-[11px] text-zinc-400 mt-1">Enforces ISMP dosage safety, 3 orthogonal counter-hypotheses, and NIST SP 800-90A CSPRNG entropy.</p>
                    </div>
                  </div>
                </div>

                <!-- Downward Connector -->
                <div class="flex justify-center text-indigo-500 text-lg font-bold">↓</div>

                <!-- Layer 3: The 6 Rendering Spheres -->
                <div class="p-4 rounded-xl bg-zinc-950 border border-amber-500/30">
                  <div class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                    <span>🏛️</span> 3. The 6 Computational &amp; Rendering Spheres
                  </div>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    @for (sphere of atlas.spheres; track sphere.id) {
                      <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                        <div class="font-bold text-zinc-200 flex items-center gap-1.5">
                          <span>{{ sphere.icon }}</span> {{ sphere.name }}
                        </div>
                        <div class="text-[11px] text-zinc-400 mt-1 font-mono">
                          {{ sphere.count }} components • {{ sphere.loc | number }} LOC
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Downward Connector -->
                <div class="flex justify-center text-amber-500 text-lg font-bold">↓</div>

                <!-- Layer 4: Output Delivery -->
                <div class="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30">
                  <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-2">
                    <span>✨</span> 4. 3-Act Trajectory &amp; Clinician/Patient Delivery
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <strong>Clinician CDS HUD</strong>
                      <p class="text-[11px] text-zinc-400 mt-1">High-throughput evidence grounding, posology cascades, and FDA 21 CFR Part 11 digital attestation.</p>
                    </div>
                    <div class="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <strong>Patient "Quiet Workshop Voice"</strong>
                      <p class="text-[11px] text-zinc-400 mt-1">Reassuring, deconflicted 24-hour chrono-pacing nudges and 3-Act roadmaps.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PocketgullArchitectureAtlasComponent {
  private nav = inject(NavigationShellService);

  readonly atlas = ARCHITECTURE_ATLAS_DATA;
  readonly activeView = signal<'directory' | 'topology'>('directory');
  readonly selectedSphereId = signal<string>('all');
  readonly searchQuery = signal<string>('');
  readonly testFilter = signal<'all' | 'tested' | 'untested'>('all');
  readonly sortOrder = signal<'loc_desc' | 'name_asc' | 'spec_desc'>('loc_desc');

  readonly filteredComponents = computed<IComponentMetadata[]>(() => {
    const sphere = this.selectedSphereId();
    const query = this.searchQuery().trim().toLowerCase();
    const testMode = this.testFilter();
    const sort = this.sortOrder();

    let list = this.atlas.allComponents;

    // 1. Filter by sphere
    if (sphere !== 'all') {
      list = list.filter(c => c.sphere === sphere);
    }

    // 2. Filter by search query
    if (query) {
      list = list.filter(c => 
        c.className.toLowerCase().includes(query) ||
        c.selector.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.path.toLowerCase().includes(query)
      );
    }

    // 3. Filter by test status
    if (testMode === 'tested') {
      list = list.filter(c => c.hasSpec);
    } else if (testMode === 'untested') {
      list = list.filter(c => !c.hasSpec);
    }

    // 4. Sort
    return [...list].sort((a, b) => {
      if (sort === 'loc_desc') return b.loc - a.loc;
      if (sort === 'spec_desc') return b.specLoc - a.specLoc;
      return a.className.localeCompare(b.className);
    });
  });

  close(): void {
    this.nav.closeAtlas();
  }

  triggerComponentPreview(comp: IComponentMetadata): void {
    // If the component matches known launchable modals, open it
    const name = comp.name.toLowerCase();
    if (name.includes('holodeck')) {
      this.nav.openAustereHud();
    } else if (name.includes('posology')) {
      this.nav.openPosology();
    } else if (name.includes('federal') || name.includes('uswds')) {
      this.nav.openFederalUswdsPortal();
    } else if (name.includes('arcade') || name.includes('luminaries')) {
      this.nav.openArcadeHub();
    } else if (name.includes('trajectory')) {
      this.nav.openTrajectoryReader();
    } else {
      // General feedback
      console.log(`Inspecting component: ${comp.className} at ${comp.path}`);
    }
  }
}
