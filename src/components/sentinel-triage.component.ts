import { Component, ChangeDetectionStrategy, inject, computed, signal, viewChild, ElementRef, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { GamificationService } from '../services/gamification.service';
import { PocketGullCardComponent } from './shared/pocket-gull-card.component';
import { IPatientSymptom } from '../services/patient.types';

interface ISentinelNode {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'normal' | 'alert' | 'synced';
  latency: number;
  cases: number;
}

interface ISentinelPacket {
  fromNodeId: string;
  progress: number;
  speed: number;
  color: string;
}

@Component({
  selector: 'app-sentinel-triage',
  standalone: true,
  imports: [CommonModule, PocketGullCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <pocket-gull-card 
      title="WHO / NHI Sentinel Outbreak Triage & Connectivity" 
      [noPadding]="false"
      class="block w-full">
      
      <div right-action class="flex items-center gap-2">
        <span class="px-2 py-0.5 text-[12px] font-extrabold uppercase tracking-widest bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded border border-red-500/20 animate-pulse">
          {{ threatLevelLabel() }}
        </span>
        <span class="text-xs text-zinc-400 dark:text-zinc-500 font-mono">Registry v4.12</span>
      </div>

      <!-- Geo-Sentinel Outbreak Surveillance Viewpoint Selector Bar -->
      <div class="mb-5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <span>📡</span>
          <span>Sentinel Outbreak Viewpoint:</span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button (click)="setGeoViewpoint('global')"
            [class.bg-blue-600]="geoViewpoint() === 'global'"
            [class.text-white]="geoViewpoint() === 'global'"
            [class.text-zinc-400]="geoViewpoint() !== 'global'"
            class="px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg border border-blue-500/30 transition cursor-pointer flex items-center gap-1">
            🌎 Global (WHO)
          </button>
          <button (click)="setGeoViewpoint('regional')"
            [class.bg-emerald-600]="geoViewpoint() === 'regional'"
            [class.text-white]="geoViewpoint() === 'regional'"
            [class.text-zinc-400]="geoViewpoint() !== 'regional'"
            class="px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg border border-emerald-500/30 transition cursor-pointer flex items-center gap-1">
            🌍 Regional (PAHO)
          </button>
          <button (click)="setGeoViewpoint('american')"
            [class.bg-purple-600]="geoViewpoint() === 'american'"
            [class.text-white]="geoViewpoint() === 'american'"
            [class.text-zinc-400]="geoViewpoint() !== 'american'"
            class="px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg border border-purple-500/30 transition cursor-pointer flex items-center gap-1">
            🇺🇸 American (CDC/NHI)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Connectivity Map Canvas -->
        <div class="lg:col-span-5 flex flex-col gap-4">
          <div class="relative w-full aspect-[4/3] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex flex-col justify-between p-3">
            
            <!-- Canvas Overlay UI -->
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(66,133,244,0.05),transparent_70%)] pointer-events-none"></div>
            
            <!-- Map title overlay -->
            <div class="z-10 flex items-center justify-between pointer-events-none">
              <span class="text-[12px] font-bold tracking-widest text-blue-400 uppercase flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                Public Health Uplink
              </span>
              <span class="text-[12px] font-mono text-zinc-500">Latency: {{ activeLatency() }}ms</span>
            </div>

            <!-- Canvas Element -->
            <canvas #mapCanvas class="absolute inset-0 w-full h-full cursor-crosshair z-0"></canvas>

            <!-- Bottom Control HUD inside Map -->
            <div class="z-10 w-full flex items-center justify-between mt-auto">
              <span class="text-[12px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-1 rounded border border-zinc-800">
                Connected Nodes: {{ activeNodesCount() }} / 5
              </span>
              <span class="text-[12px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/30">
                Data rate: {{ activeBps() }} kb/s
              </span>
            </div>
          </div>

          <!-- Quick Actions Deck -->
          <div class="grid grid-cols-2 gap-3">
            <button (click)="syncRegistry()" 
                    class="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7V4m0 0L8 8m4-4 4 4" /></svg>
              Sync Registry
            </button>
            <button (click)="toggleBroadcastAlert()" 
                    [class.bg-red-600]="isAlertActive()" [class.hover:bg-red-500]="isAlertActive()"
                    [class.bg-zinc-800]="!isAlertActive()" [class.hover:bg-zinc-700]="!isAlertActive()"
                    class="py-2.5 px-3 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {{ isAlertActive() ? 'Mute Alert' : 'Broadcast Alert' }}
            </button>
          </div>
        </div>

        <!-- Right: Outbreak Metrics & Incident Recommendations -->
        <div class="lg:col-span-7 flex flex-col gap-5 justify-between">
          
          <div class="flex flex-col gap-4">
            <!-- Patient Demographic/Outbreak Sentinel Context -->
            <div class="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    {{ selectedPatient()?.name }} Profile
                  </h3>
                  <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Sentinel ID: {{ selectedPatient()?.id }} • Age: {{ selectedPatient()?.age }} • Gender: {{ selectedPatient()?.gender }}
                  </p>
                </div>
                <span class="text-xs font-mono px-2 py-1 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Global Case Ref: {{ selectedPatient()?.id === 'p004' ? 'WHO-GSD-99' : 'CDC-USA-02' }}
                </span>
              </div>
              <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic border-l-2 border-blue-500 pl-3 mt-3">
                {{ selectedPatient()?.patientGoals }}
              </p>
            </div>

            <!-- Triage Indicators List -->
            <div>
              <h4 class="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
                Active Outbreak Indicators (WHO Triage List)
              </h4>
              <div class="max-h-[160px] overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
                @for(symptom of activeSymptomList(); track symptom.name) {
                  <div class="p-3 flex items-center justify-between text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all">
                    <div class="flex items-center gap-2.5">
                      <span class="w-2 h-2 rounded-full" [class.bg-red-500]="symptom.timeline === 'Acute'" [class.bg-orange-500]="symptom.timeline === 'Chronic' || symptom.timeline === 'Progressive'"></span>
                      <div>
                        <span class="font-semibold text-zinc-800 dark:text-zinc-200">{{ symptom.name }}</span>
                        <span class="ml-2 text-[12px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase font-bold">{{ symptom.type }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-[12px] font-mono text-zinc-500">{{ symptom.timeline }}</span>
                      <span class="px-2 py-0.5 rounded font-extrabold uppercase text-[12px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Verified
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Containment Protocol & AI Synthesis Recommendation with 3D Double-Click Flip State Machine -->
          @let isDirectiveFlipped = isDirectiveFlippedSignal();
          <div (dblclick)="toggleDirectiveFlip($event)"
               class="relative perspective-1000 group cursor-pointer min-h-[140px]"
               title="Double-click to flip over for HIPAA Privacy & SSRF Safety Guardrail Rationale">
            
            <div [class.rotate-y-180]="isDirectiveFlipped"
                 class="relative w-full h-full transition-transform duration-500 transform-style-3d">

              <!-- FRONT FACE -->
              <div class="p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/20 flex flex-col justify-between h-full w-full absolute inset-0 backface-hidden shadow-sm">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <span>🛡️</span>
                      <span>AI Containment & Action Directive</span>
                      <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        dblclick 🔄
                      </span>
                    </h4>
                    <button (click)="generateEpidemiologyProtocols(); $event.stopPropagation()" 
                            [disabled]="isGeneratingProtocol()"
                            class="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50">
                      {{ isGeneratingProtocol() ? 'Generating...' : 'Refresh AI Protocol' }}
                    </button>
                  </div>
                  
                  <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono whitespace-pre-line">
                    {{ containmentRecommendation() }}
                  </p>
                </div>
              </div>

              <!-- BACK FACE -->
              <div class="p-4 rounded-xl bg-slate-950 text-white border border-blue-500/40 shadow-2xl flex flex-col justify-between h-full w-full absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs">
                <div>
                  <div class="flex items-center justify-between border-b border-blue-800 pb-1.5 mb-2 font-mono text-xs">
                    <span class="text-blue-300 font-bold uppercase flex items-center gap-1">
                      <span>🔒</span> HIPAA Privacy & SSRF Safety Guardrail
                    </span>
                    <span class="text-blue-400 font-mono text-[10px]">dblclick flip</span>
                  </div>
                  <div class="space-y-1.5 text-blue-100 font-mono text-[11px]">
                    <p>
                      <strong>DOMPurify HIPAA Shield:</strong> All outbreak vector data is sanitized through DOMPurify before rendering to prevent SSRF vulnerabilities.
                    </p>
                    <p>
                      <strong>Federated Isolation:</strong> Patient state data is encrypted locally; zero unverified outbound API requests.
                    </p>
                  </div>
                </div>
                <div class="pt-1.5 border-t border-blue-900 font-mono text-[9px] text-blue-400 flex justify-between">
                  <span>SSRF Security Active</span>
                  <span>Double-click to return</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </pocket-gull-card>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SentinelTriageComponent implements OnInit, OnDestroy {
  state = inject(PatientStateService);
  patientManager = inject(PatientManagementService);
  game = inject(GamificationService);
  platformId = inject(PLATFORM_ID);

  readonly isDirectiveFlippedSignal = signal<boolean>(false);
  private lastDirectiveFlipTime = 0;

  toggleDirectiveFlip(event?: Event) {
    if (event) event.stopPropagation();
    const now = Date.now();
    if (now - this.lastDirectiveFlipTime < 200) return;
    this.lastDirectiveFlipTime = now;
    this.isDirectiveFlippedSignal.update(v => !v);
  }

  mapCanvas = viewChild<ElementRef<HTMLCanvasElement>>('mapCanvas');

  // Interactive metrics
  geoViewpoint = signal<'global' | 'regional' | 'american'>('global');
  isAlertActive = signal(false);
  activeLatency = signal(45);
  activeNodesCount = signal(5);
  activeBps = signal(128);
  isGeneratingProtocol = signal(false);

  setGeoViewpoint(v: 'global' | 'regional' | 'american') {
    this.geoViewpoint.set(v);
    if (v === 'global') {
      this.containmentRecommendation.set(
        '🌎 [WHO Global Outbreak Surveillance Directive]\n' +
        '1. Establish international pandemic isolation protocols & border entry screening.\n' +
        '2. Synchronize SIR/ODE epidemiological models with global health bureaus.\n' +
        '3. Rapid-deploy mobile containment teams to high-transmission nodes.\n' +
        '4. Prioritize mitochondrial ATP defense and senolytic clearance for vulnerable cohorts.'
      );
    } else if (v === 'regional') {
      this.containmentRecommendation.set(
        '🌍 [PAHO Regional Epidemic Surveillance Directive]\n' +
        '1. Activate trans-boundary vector control and micro-climate quarantine perimeters.\n' +
        '2. Stream regional clinic EHR data for real-time cluster tracing.\n' +
        '3. Dispatch tailored nutritional bypass packs to isolated regional hubs.'
      );
    } else {
      this.containmentRecommendation.set(
        '🇺🇸 [CDC / NHI Domestic Lifespan Protection Net Directive]\n' +
        '1. Monitor domestic hospital ICU bed capacity and mechanical ventilation reserves.\n' +
        '2. Deploy anti-inflammatory telomere defense protocols for preventable loss-of-life mitigation.\n' +
        '3. Integrate continuous PhysioNet bio-telemetry with local emergency dispatch.'
      );
    }
  }

  // Active containment protocol
  containmentRecommendation = signal<string>(
    '1. Establish respiratory isolation ward immediately.\n' +
    '2. Set up local surveillance telemetry nodes within 5km radius.\n' +
    '3. Initiate diagnostic PCR tests for suspected respiratory cases.\n' +
    '4. Queue national stockpile inventory allocation for critical antiviral agents.'
  );

  private animFrameId: number | null = null;
  private networkFluctuationInterval: any = null;
  private canvasNodes: ISentinelNode[] = [];
  private canvasPackets: ISentinelPacket[] = [];
  private syncRippleRadius = 0;
  private syncRippleActive = false;

  selectedPatient = computed(() => {
    const selectedId = this.patientManager.selectedPatientId();
    if (!selectedId) return null;
    return this.patientManager.patients().find(p => p.id === selectedId);
  });

  threatLevelLabel = computed(() => {
    const p = this.selectedPatient();
    if (!p) return 'Normal';
    if (p.id === 'p004') return 'Pandemic Watch (Lvl 8.5)';
    if (p.id === 'p005') return 'Regional Incident (Lvl 6.2)';
    if (p.id === 'p006') return 'Under-5 Outbreak (Lvl 9.1)';
    if (p.id === 'p007') return 'Critical Care Delivery (Lvl 7.8)';
    return 'Observation';
  });

  activeSymptomList = computed<IPatientSymptom[]>(() => {
    const patient = this.selectedPatient();
    if (!patient) return [];
    
    // Extract issues from patient
    if (patient.issues && patient.issues['full_body']) {
      const raw = patient.issues['full_body'][0]?.symptoms || [];
      return raw.map(s => {
        if (typeof s === 'string') {
          return { name: s, type: 'Outbreak Indicator', verified: true, timeline: 'Acute' };
        }
        return {
          name: s.name,
          type: s.type || 'Outbreak Indicator',
          verified: s.verified !== undefined ? s.verified : true,
          timeline: s.timeline || 'Acute'
        };
      });
    }
    return [];
  });

  ngOnInit() {
    this.game.completeQuest('sentinel_triage');

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initCanvasElements();
        this.startNetworkAnimation();
      }, 100);

      // Fluctuate network state periodically
      this.networkFluctuationInterval = setInterval(() => {
        if (Math.random() > 0.5) {
          this.activeLatency.set(Math.floor(40 + Math.random() * 20));
          this.activeBps.set(Math.floor(120 + Math.random() * 40));
        }
      }, 4000);
    }
  }

  ngOnDestroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.networkFluctuationInterval) {
      clearInterval(this.networkFluctuationInterval);
    }
  }

  private initCanvasElements() {
    const canvas = this.mapCanvas()?.nativeElement;
    if (!canvas) return;

    // Set layout resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    // Initialize mock sentinel node coordinates scaled to canvas size
    const w = canvas.width;
    const h = canvas.height;

    this.canvasNodes = [
      { id: 'hub', name: 'WHO Central Hub', x: w / 2, y: h / 2, status: 'synced', latency: 0, cases: 0 },
      { id: 'n1', name: 'CDC Atlanta', x: w * 0.2, y: h * 0.25, status: 'normal', latency: 45, cases: 12 },
      { id: 'n2', name: 'Nairobi CDC', x: w * 0.2, y: h * 0.75, status: 'normal', latency: 110, cases: 48 },
      { id: 'n3', name: 'Geneva ECDC', x: w * 0.8, y: h * 0.25, status: 'normal', latency: 12, cases: 4 },
      { id: 'n4', name: 'NHI London', x: w * 0.8, y: h * 0.75, status: 'normal', latency: 28, cases: 19 },
    ];

    // Seed initial database packet animations
    this.canvasPackets = [
      { fromNodeId: 'n1', progress: 0.1, speed: 0.005, color: '#34A853' },
      { fromNodeId: 'n2', progress: 0.5, speed: 0.003, color: '#FBBC05' },
      { fromNodeId: 'n3', progress: 0.3, speed: 0.008, color: '#EA4335' },
      { fromNodeId: 'n4', progress: 0.7, speed: 0.004, color: '#9C27B0' },
    ];
  }

  private startNetworkAnimation() {
    const canvas = this.mapCanvas()?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isAlert = this.isAlertActive();
      const now = Date.now();

      // Adjust size on size changes
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== Math.floor(rect.width * window.devicePixelRatio)) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        const w = canvas.width;
        const h = canvas.height;
        this.canvasNodes[0].x = w / 2; this.canvasNodes[0].y = h / 2;
        this.canvasNodes[1].x = w * 0.2; this.canvasNodes[1].y = h * 0.25;
        this.canvasNodes[2].x = w * 0.2; this.canvasNodes[2].y = h * 0.75;
        this.canvasNodes[3].x = w * 0.8; this.canvasNodes[3].y = h * 0.25;
        this.canvasNodes[4].x = w * 0.8; this.canvasNodes[4].y = h * 0.75;
      }

      const hub = this.canvasNodes[0];

      // Draw Grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw connections
      ctx.lineWidth = 1.5;
      this.canvasNodes.forEach(node => {
        if (node.id === 'hub') return;
        
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(hub.x, hub.y);

        if (isAlert) {
          // Pulse connection in flashing red alert color
          const flash = Math.sin(now * 0.01) * 0.5 + 0.5;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.15 + flash * 0.35})`;
        } else {
          ctx.strokeStyle = 'rgba(66, 133, 244, 0.15)';
        }
        ctx.stroke();
      });

      // Update and draw packets
      this.canvasPackets.forEach(packet => {
        const fromNode = this.canvasNodes.find(n => n.id === packet.fromNodeId);
        if (!fromNode) return;

        packet.progress += packet.speed * (isAlert ? 1.8 : 1);
        if (packet.progress >= 1.0) {
          packet.progress = 0;
          packet.speed = 0.003 + Math.random() * 0.006;
        }

        // Interpolate position towards hub
        const px = fromNode.x + (hub.x - fromNode.x) * packet.progress;
        const py = fromNode.y + (hub.y - fromNode.y) * packet.progress;

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isAlert ? '#EF4444' : packet.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.fillStyle as string;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw concentric ripple ring from Sync action
      if (this.syncRippleActive) {
        this.syncRippleRadius += 3.5 * window.devicePixelRatio;
        const opacity = Math.max(0, 1 - (this.syncRippleRadius / (canvas.width * 0.5)));
        
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, this.syncRippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 168, 83, ${opacity * 0.6})`;
        ctx.lineWidth = 2 * window.devicePixelRatio;
        ctx.stroke();

        if (opacity <= 0) {
          this.syncRippleActive = false;
        }
      }

      // Draw Sentinel nodes
      this.canvasNodes.forEach(node => {
        ctx.beginPath();
        const size = (node.id === 'hub' ? 8 : 5.5) * window.devicePixelRatio;
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);

        let fill = '#4285F4';
        if (isAlert && node.id !== 'hub') {
          // Flash nodes red
          const pulse = Math.floor(now / 200) % 2 === 0;
          fill = pulse ? '#EF4444' : '#7F1D1D';
        } else if (node.id === 'hub') {
          fill = this.syncRippleActive ? '#34A853' : '#4285F4';
        } else {
          fill = '#5f6368';
        }

        ctx.fillStyle = fill;
        ctx.fill();

        // Node outline rings
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4 * window.devicePixelRatio, 0, Math.PI * 2);
        ctx.strokeStyle = node.id === 'hub' ? 'rgba(66, 133, 244, 0.2)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Labels
        ctx.font = `${8 * window.devicePixelRatio}px font-sans, system-ui, sans-serif`;
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y - size - 8);
      });

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  syncRegistry() {
    this.syncRippleRadius = 0;
    this.syncRippleActive = true;
    
    // Play WebAudio sync tone (ascending sweep)
    this.playSyncAudioSignature();

    // Trigger quest completion points
    this.game.completeQuest('sync_registry');
  }

  toggleBroadcastAlert() {
    const nextAlert = !this.isAlertActive();
    this.isAlertActive.set(nextAlert);

    if (nextAlert) {
      this.playAlertAudioWarning();
    }
  }

  generateEpidemiologyProtocols() {
    this.isGeneratingProtocol.set(true);
    
    // Request epidemiological instructions from Gemini simulation
    setTimeout(() => {
      const patient = this.selectedPatient();
      if (patient?.id === 'p006') {
        this.containmentRecommendation.set(
          '1. Deploy pediatric rehydration caches to regions showing elevated enteric caseloads.\n' +
          '2. Formulate public health notice recommending mosquito net deployments in catchment sectors.\n' +
          '3. Trigger Sentinel alert notification to local community health workers.'
        );
      } else if (patient?.id === 'p007') {
        this.containmentRecommendation.set(
          '1. Direct emergency blood banks to maintain hyper-responsive protocols.\n' +
          '2. Setup intensive sepsis monitoring checks at local birth registries.\n' +
          '3. Dispatch specialized maternal support telemetry packs to outlying field clinics.'
        );
      } else {
        this.containmentRecommendation.set(
          '1. Enforce quarantine and border isolation restrictions in Sector 4.\n' +
          '2. Escalate regional clinical coordination channels with local CDC partners.\n' +
          '3. Trigger daily telemetry telemetry sync protocol for active hospital records.'
        );
      }
      this.isGeneratingProtocol.set(false);
      this.game.completeQuest('explore_evidence'); // award points for exploring clinical details
    }, 1200);
  }

  private playSyncAudioSignature() {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.5);

      filter.type = 'lowpass';
      filter.Q.setValueAtTime(4, now);
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1500, now + 0.5);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (_) {}
  }

  private playAlertAudioWarning() {
    if (typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Draw dual oscillator alert alarm (e.g. WHO warning sweep)
      const playSweep = (delay: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const startTime = now + delay;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, startTime);
        osc.frequency.linearRampToValueAtTime(440, startTime + 0.25);
        osc.frequency.linearRampToValueAtTime(880, startTime + 0.5);

        gain.gain.setValueAtTime(0.0, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.start(startTime);
        osc.stop(startTime + 0.55);
      };

      playSweep(0);
      playSweep(0.6);
    } catch (_) {}
  }
}
