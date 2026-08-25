import { Component, ChangeDetectionStrategy, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { ExportService } from '../services/export.service';

export interface IDistantFamilyTree {
  id: string;
  relation: 'Mother' | 'Father' | 'Sibling' | 'Child';
  label: string;
  emoji: string;
  xRatio: number;
  yRatio: number;
  healthSyncPercent: number;
  sharedLineageTrait: string;
  preventiveRecommendation: string;
}

@Component({
  selector: 'app-patient-under-tree',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full aspect-[16/9] max-h-[500px] bg-gradient-to-b from-sky-400 via-emerald-300 to-green-900 rounded-3xl border border-zinc-800/80 overflow-hidden shadow-2xl font-sans select-none">
      
      <!-- Time of Day Dynamic Sky Overlay -->
      <div class="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-sky-400/10 to-transparent pointer-events-none"></div>

      <!-- Sun Rays Filtered Through Canopy -->
      <div class="absolute top-0 right-1/3 w-72 h-[450px] bg-gradient-to-b from-amber-200/30 via-white/10 to-transparent transform -rotate-12 blur-2xl pointer-events-none"></div>

      <!-- Canvas for Horizon Family Trees, Dappled Leaves & Falling Apples -->
      <canvas #landscapeCanvas (click)="handleCanvasClick($event)" class="absolute inset-0 w-full h-full pointer-events-auto cursor-pointer"></canvas>

      <!-- First Person UI HUD Banner -->
      <div class="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10 font-mono text-xs">
        <div class="px-3.5 py-1.5 rounded-full bg-zinc-950/70 border border-zinc-700/60 text-zinc-100 backdrop-blur-md flex items-center gap-2">
          <span class="text-sm">🧘</span>
          <span>Seated Under the Apple Tree &bull; <strong>{{ activePatientName() }}</strong></span>
        </div>

        <div class="flex items-center gap-2 pointer-events-auto">
          <button (click)="exportFhir()" 
            class="px-3 py-1.5 rounded-full font-bold uppercase transition backdrop-blur-md border border-zinc-700/60 text-[10px] bg-zinc-950/70 text-zinc-200 hover:bg-zinc-800 cursor-pointer">
            📥 FHIR R4
          </button>
          <button (click)="toggleBreathingGuide()" 
            class="px-3 py-1.5 rounded-full font-bold uppercase transition backdrop-blur-md border border-zinc-700/60 text-[10px]"
            [class.bg-emerald-500]="isBreathingActive()"
            [class.text-zinc-950]="isBreathingActive()"
            [class.bg-zinc-950/70]="!isBreathingActive()"
            [class.text-zinc-200]="!isBreathingActive()">
            {{ isBreathingActive() ? '🧘 0.1Hz Vagal Breathing Active' : '🧘 Start Vagal Reflection' }}
          </button>
        </div>
      </div>

      <!-- Vagal Resonant Breathing Visual Ring (Sky Center) -->
      @if (isBreathingActive()) {
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div class="w-48 h-48 rounded-full border-2 border-emerald-400/60 animate-ping opacity-30"></div>
          <div class="w-36 h-36 rounded-full bg-emerald-500/10 border border-emerald-400/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 animate-pulse">
            <span class="text-xs font-mono font-bold text-emerald-200 uppercase tracking-widest">Breathe In...</span>
            <span class="text-[10px] font-mono text-emerald-300/80 mt-1">0.1 Hz Baroreflex</span>
          </div>
        </div>
      }

      <!-- Selected Distant Family Member Drawer Overlay -->
      @if (selectedFamilyTree(); as f) {
        <div class="absolute bottom-20 left-4 right-4 p-4 rounded-2xl bg-zinc-950/95 border border-emerald-800/80 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans z-20 animate-in slide-in-from-bottom duration-200">
          <div>
            <div class="flex items-center gap-2 font-mono text-xs">
              <span class="text-lg">{{ f.emoji }}</span>
              <span class="font-bold text-emerald-300">{{ f.label }}</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/30 uppercase">
                {{ f.healthSyncPercent }}% Epigenetic Sync
              </span>
            </div>
            <p class="text-xs text-zinc-300 mt-1">
              <strong>Shared Lineage Trait:</strong> {{ f.sharedLineageTrait }} &bull; <em>Recommendation:</em> {{ f.preventiveRecommendation }}
            </p>
          </div>

          <button (click)="selectedFamilyTree.set(null)" class="text-xs text-zinc-400 hover:text-zinc-200 font-mono">✕ Close</button>
        </div>
      }

      <!-- Bottom Landscape Horizon Vignette & Grass Canopy -->
      <div class="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans z-10">
        <div>
          <div class="flex items-center gap-2 font-mono text-xs text-amber-300">
            <span class="text-base">🏡</span>
            <span class="font-bold uppercase tracking-wider">Patient & Distant Family Horizon Landscape</span>
          </div>
          <p class="text-xs text-zinc-300 mt-0.5">
            Looking up through dappled apple boughs. Tap distant trees on the rolling horizon to inspect immediate family health & inherited epigenetic sync!
          </p>
        </div>

        <div class="flex flex-col gap-1 font-mono text-xs w-full md:w-auto">
          <div class="flex items-center gap-1 overflow-x-auto">
            <button (click)="selectParadigm('western')"
              [class.bg-red-600]="activeParadigm() === 'western'"
              [class.text-white]="activeParadigm() === 'western'"
              [class.bg-zinc-900]="activeParadigm() !== 'western'"
              [class.text-zinc-400]="activeParadigm() !== 'western'"
              class="px-2 py-1 text-[9px] font-bold uppercase rounded-lg border border-red-500/30 transition cursor-pointer flex items-center gap-1">
              🍎 Red Oak
            </button>
            <button (click)="selectParadigm('functional')"
              [class.bg-emerald-600]="activeParadigm() === 'functional'"
              [class.text-white]="activeParadigm() === 'functional'"
              [class.bg-zinc-900]="activeParadigm() !== 'functional'"
              [class.text-zinc-400]="activeParadigm() !== 'functional'"
              class="px-2 py-1 text-[9px] font-bold uppercase rounded-lg border border-emerald-500/30 transition cursor-pointer flex items-center gap-1">
              🍏 Green Apple
            </button>
            <button (click)="selectParadigm('tcm')"
              [class.bg-amber-600]="activeParadigm() === 'tcm'"
              [class.text-white]="activeParadigm() === 'tcm'"
              [class.bg-zinc-900]="activeParadigm() !== 'tcm'"
              [class.text-zinc-400]="activeParadigm() !== 'tcm'"
              class="px-2 py-1 text-[9px] font-bold uppercase rounded-lg border border-amber-500/30 transition cursor-pointer flex items-center gap-1">
              🍊 Golden Citrus
            </button>
            <button (click)="selectParadigm('ayurvedic')"
              [class.bg-purple-600]="activeParadigm() === 'ayurvedic'"
              [class.text-white]="activeParadigm() === 'ayurvedic'"
              [class.bg-zinc-900]="activeParadigm() !== 'ayurvedic'"
              [class.text-zinc-400]="activeParadigm() !== 'ayurvedic'"
              class="px-2 py-1 text-[9px] font-bold uppercase rounded-lg border border-purple-500/30 transition cursor-pointer flex items-center gap-1">
              🥭 Sacred Fig
            </button>
          </div>
          <div class="text-[9px] text-zinc-300 truncate max-w-[320px]">
            <strong class="text-amber-300">{{ activeParadigmInfo().treeName }}</strong>: {{ activeParadigmInfo().fruitDescription }}
          </div>
        </div>
      </div>

    </div>
  `
})
export class PatientUnderTreeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('landscapeCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  patientState = inject(PatientStateService);
  patientManagement = inject(PatientManagementService);

  isBreathingActive = signal<boolean>(false);
  harvestedCount = signal<number>(2);
  selectedFamilyTree = signal<IDistantFamilyTree | null>(null);

  activeParadigm = signal<'western' | 'functional' | 'tcm' | 'ayurvedic'>('western');

  selectParadigm(p: 'western' | 'functional' | 'tcm' | 'ayurvedic') {
    this.activeParadigm.set(p);
  }

  activeParadigmInfo = computed(() => {
    const p = this.activeParadigm();
    if (p === 'western') {
      return {
        treeName: '🍎 Red Oak of Evidence',
        fruitEmoji: '🍎',
        fruitDescription: 'Red Golden Apple — Anatomy, Vital Telemetry & Clinical Trial Data'
      };
    } else if (p === 'functional') {
      return {
        treeName: '🍏 Orchard of Resiliency',
        fruitEmoji: '🍏',
        fruitDescription: 'Crisp Green Apple — Mitochondrial ATP Defense & Telomere Protection'
      };
    } else if (p === 'tcm') {
      return {
        treeName: '🍊 Five Elements Tree',
        fruitEmoji: '🍊',
        fruitDescription: 'Golden Citrus Pomegranate — Zang-Fu Meridians & Vagal Qi Flow'
      };
    } else {
      return {
        treeName: '🥭 Sacred Fig Tree',
        fruitEmoji: '🥭',
        fruitDescription: 'Golden Mango Fig — Vata-Pitta-Kapha Tridosha & Ojas Vitality'
      };
    }
  });

  private animFrameId: number | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  familyTrees: IDistantFamilyTree[] = [
    {
      id: 'ft_mother',
      relation: 'Mother',
      label: "Mother's Apple Tree",
      emoji: '👵',
      xRatio: 0.18,
      yRatio: 0.58,
      healthSyncPercent: 88,
      sharedLineageTrait: 'MTHFR Folate Methylation & Endogenous SOD2 Antioxidant Protection',
      preventiveRecommendation: 'L-Methylfolate 1mg + Mediterranean Polyphenol Rich Diet'
    },
    {
      id: 'ft_father',
      relation: 'Father',
      label: "Father's Ancestral Oak-Apple Tree",
      emoji: '👴',
      xRatio: 0.82,
      yRatio: 0.56,
      healthSyncPercent: 92,
      sharedLineageTrait: 'Cardiovascular Autonomic Recovery & Nitric Oxide Endothelium',
      preventiveRecommendation: 'CoQ10 200mg + Daily 0.1 Hz Resonant Breathing'
    },
    {
      id: 'ft_sibling',
      relation: 'Sibling',
      label: "Sibling / Children Orchard Saplings",
      emoji: '👧',
      xRatio: 0.62,
      yRatio: 0.62,
      healthSyncPercent: 95,
      sharedLineageTrait: 'BMAL1/CLOCK Circadian Gene Entrainment',
      preventiveRecommendation: 'Time-Restricted Feeding & Early Morning Sunlight Exposure'
    }
  ];

  activePatientName = computed(() => {
    const pId = this.patientManagement.selectedPatientId();
    if (!pId) return 'Charles Darwin';
    const patient = this.patientManagement.patients().find(p => p.id === pId);
    return patient ? patient.name : 'Charles Darwin';
  });

  ngAfterViewInit() {
    if (this.canvasRef?.nativeElement) {
      this.initLandscapeAnimation();
    }
  }

  ngOnDestroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private readonly exportService = inject(ExportService);

  exportFhir() {
    const id = this.patientManagement.selectedPatientId();
    const patient = this.patientManagement.patients().find(p => p.id === id);
    if (patient) {
      this.exportService.exportPatientToFhirJson(patient);
    }
  }

  toggleBreathingGuide() {
    this.isBreathingActive.update(v => !v);
  }

  handleCanvasClick(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Check if clicked any distant family tree in horizon
    for (const tree of this.familyTrees) {
      const treeX = tree.xRatio * canvas.width;
      const treeY = tree.yRatio * canvas.height;
      const dist = Math.hypot(clickX - treeX, clickY - treeY);
      
      if (dist < 40) {
        this.selectedFamilyTree.set(tree);
        return;
      }
    }
  }

  private initLandscapeAnimation() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();

    // Dappled Leaves & Falling Petals Engine
    const leaves: { x: number; y: number; r: number; dx: number; dy: number; rot: number }[] = [];
    for (let i = 0; i < 35; i++) {
      leaves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 4 + Math.random() * 6,
        dx: -0.3 + Math.random() * 0.6,
        dy: 0.2 + Math.random() * 0.5,
        rot: Math.random() * Math.PI * 2
      });
    }

    const render = () => {
      if (!this.ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      this.ctx.clearRect(0, 0, w, h);

      // 1. Draw Rolling Distant Horizon Hills
      this.ctx.fillStyle = '#065F46';
      this.ctx.beginPath();
      this.ctx.ellipse(w * 0.2, h * 0.72, w * 0.4, h * 0.3, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#047857';
      this.ctx.beginPath();
      this.ctx.ellipse(w * 0.8, h * 0.7, w * 0.45, h * 0.32, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#059669';
      this.ctx.beginPath();
      this.ctx.ellipse(w * 0.5, h * 0.76, w * 0.5, h * 0.35, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // 2. Draw Distant Immediate Family Orchard Trees on Rolling Hills
      for (const ft of this.familyTrees) {
        const tx = ft.xRatio * w;
        const ty = ft.yRatio * h;

        // Distant Trunk
        this.ctx.strokeStyle = '#451A03';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(tx, ty + 20);
        this.ctx.lineTo(tx, ty);
        this.ctx.stroke();

        // Distant Canopy
        this.ctx.fillStyle = '#10B981';
        this.ctx.beginPath();
        this.ctx.arc(tx, ty - 10, 22, 0, Math.PI * 2);
        this.ctx.fill();

        // Distant Apples / Flowers on Tree
        this.ctx.fillStyle = '#EF4444';
        this.ctx.beginPath();
        this.ctx.arc(tx - 6, ty - 14, 3, 0, Math.PI * 2);
        this.ctx.arc(tx + 8, ty - 8, 3, 0, Math.PI * 2);
        this.ctx.arc(tx, ty - 18, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Distant Tree Badge Label
        this.ctx.fillStyle = '#FEF3C7';
        this.ctx.font = 'bold 9px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${ft.emoji} ${ft.relation}`, tx, ty + 32);
      }

      // 3. Draw Overhead Patient Canopy Boughs (First Person Angle looking up)
      this.ctx.fillStyle = '#064E3B';
      this.ctx.beginPath();
      this.ctx.ellipse(w / 2, -40, w * 0.7, 180, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Branch lines extending from center top
      this.ctx.strokeStyle = '#451A03';
      this.ctx.lineWidth = 14;
      this.ctx.beginPath();
      this.ctx.moveTo(w / 2, 0);
      this.ctx.quadraticCurveTo(w * 0.2, 80, 0, 140);
      this.ctx.moveTo(w / 2, 0);
      this.ctx.quadraticCurveTo(w * 0.8, 80, w, 140);
      this.ctx.stroke();

      // 4. Draw Overhead Hanging Patient Red & Green Apples
      const hangingApples = [
        { x: w * 0.25, y: 110, color: '#EF4444', emoji: '🍎', label: 'BP Goal' },
        { x: w * 0.45, y: 130, color: '#10B981', emoji: '🍏', label: 'Hydration' },
        { x: w * 0.75, y: 100, color: '#EF4444', emoji: '🍎', label: 'HbA1c Target' },
        { x: w * 0.85, y: 150, color: '#FACC15', emoji: '🍋', label: 'Vagal HRV' }
      ];

      for (const app of hangingApples) {
        this.ctx.strokeStyle = '#78350F';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(app.x, app.y - 18);
        this.ctx.lineTo(app.x, app.y - 30);
        this.ctx.stroke();

        this.ctx.fillStyle = app.color;
        this.ctx.beginPath();
        this.ctx.arc(app.x, app.y, 16, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(app.label, app.x, app.y + 30);
      }

      // 5. Falling Leaves Animation Loop
      this.ctx.fillStyle = '#34D399';
      for (const leaf of leaves) {
        leaf.x += leaf.dx;
        leaf.y += leaf.dy;
        leaf.rot += 0.02;

        if (leaf.y > h) leaf.y = -10;
        if (leaf.x > w) leaf.x = 0;
        if (leaf.x < 0) leaf.x = w;

        this.ctx.save();
        this.ctx.translate(leaf.x, leaf.y);
        this.ctx.rotate(leaf.rot);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, leaf.r, leaf.r / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  }
}
