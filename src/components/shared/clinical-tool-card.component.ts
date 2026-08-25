import { Component, ChangeDetectionStrategy, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearchLecturesService } from '../../services/research-lectures.service';

export interface IClinicalToolItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  personalizedInstruction: string;
  suggestedUsage: string;
  patientCareTip: string;
}

@Component({
  selector: 'app-clinical-tool-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="relative"
      (contextmenu)="handleRightClick($event)">
      
      <div 
        [class]="cardCssClass()"
        (click)="handleSingleClick($event)"
        (dblclick)="handleDoubleClick($event)"
        (touchstart)="handleTouchStart($event)">

        <!-- Card Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shadow-inner border border-zinc-200 dark:border-zinc-700">
              {{ tool().icon }}
            </div>
            <div>
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">{{ tool().category }}</span>
              <h4 class="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{{ tool().name }}</h4>
            </div>
          </div>

          <!-- Gesture State Badge -->
          <button 
            (click)="cycleState($event)"
            [class]="badgeCssClass()"
            title="Single click to inspect, double click/tap to toggle state, right-click for quick actions">
            <span>{{ badgeIcon() }}</span>
            <span class="capitalize">{{ state() }}</span>
          </button>
        </div>

        <!-- Level 1 Summary Instruction -->
        <p class="mt-3 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
          {{ tool().personalizedInstruction }}
        </p>

        <!-- Level 2 Expanded Inspector Drawer -->
        @if (isExpanded()) {
          <div class="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5 font-mono text-[11px] animate-in fade-in slide-in-from-top-2 duration-200">
            <div class="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
              <span class="text-zinc-400 uppercase tracking-widest text-[9px] block font-bold">Suggested Usage Protocol</span>
              <span class="text-zinc-800 dark:text-zinc-200 font-semibold">{{ tool().suggestedUsage }}</span>
            </div>

            <div class="p-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300">
              <span class="text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[9px] block font-bold">Patient Guidance Tip</span>
              <span class="font-sans text-xs leading-normal">{{ tool().patientCareTip }}</span>
            </div>

            <!-- Grounded Research Lectures & YouTube Video Frame -->
            @if (activeLectures().length > 0) {
              <div class="p-2.5 rounded-md bg-indigo-950/30 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-indigo-400 uppercase tracking-widest text-[9px] font-bold flex items-center gap-1.5">
                    <span>🎥</span>
                    <span>Curated Research Lectures & Grounded Frame</span>
                  </span>
                  <span class="text-[9px] text-zinc-400 font-sans">({{ activeLectures()[0].duration }})</span>
                </div>

                <div class="space-y-1">
                  <h5 class="text-xs font-bold text-white leading-snug">{{ activeLectures()[0].title }}</h5>
                  <p class="text-[10px] text-indigo-300/80 font-sans italic">
                    {{ activeLectures()[0].speaker }} • {{ activeLectures()[0].institution }}
                  </p>
                </div>

                <p class="text-[10px] text-zinc-300 leading-relaxed font-sans bg-zinc-900/60 p-2 rounded border border-indigo-900/40">
                  <strong class="text-emerald-400 uppercase text-[9px] block font-mono">Key Clinical Takeaway:</strong>
                  {{ activeLectures()[0].keyTakeaway }}
                </p>

                <!-- Grounded Query Link -->
                <div class="flex items-center justify-between pt-1 text-[9px] font-mono">
                  <a 
                    [href]="researchFrameUrl()" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    (click)="$event.stopPropagation()"
                    class="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1">
                    <span>🔍 Grounded NCBI / Stanford Frame</span>
                    <span>↗</span>
                  </a>
                  <span class="text-zinc-500 font-mono">{{ activeLectures()[0].doiCitations[0] }}</span>
                </div>
              </div>
            }
          </div>
        }

        <!-- Bottom Tap Bar Hint -->
        <div class="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span>{{ isExpanded() ? '▲ Tap to collapse' : '▼ Tap for details' }}</span>
          <span class="text-[9px] opacity-70">Right-click / Long-press for menu</span>
        </div>
      </div>

      <!-- Level 4 Right-Click Floating Clinical Context Menu (Dieter Rams Aesthetic) -->
      @if (showContextMenu()) {
        <div 
          role="menu"
          aria-label="Clinical Tool Context Actions"
          class="absolute top-2 right-2 z-50 w-56 p-1.5 rounded-md bg-zinc-900 text-white border border-zinc-700 shadow-2xl font-mono text-xs animate-in zoom-in-95 duration-150 space-y-1">
          
          <div class="px-2.5 py-1 text-[9px] text-zinc-400 uppercase tracking-wider font-bold border-b border-zinc-800">
            Clinical Quick Actions
          </div>

          <button 
            role="menuitem"
            (click)="triggerContextAction('export-fhir', $event)"
            class="min-h-[36px] w-full px-2.5 py-1.5 rounded text-left hover:bg-zinc-800 flex items-center gap-2 text-zinc-200 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
            <span>📋</span>
            <span>Export FHIR R4 Resource</span>
          </button>

          <button 
            role="menuitem"
            (click)="triggerContextAction('ai-deep-dive', $event)"
            class="min-h-[36px] w-full px-2.5 py-1.5 rounded text-left hover:bg-zinc-800 flex items-center gap-2 text-emerald-400 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
            <span>🧠</span>
            <span>Gemini AI Consult</span>
          </button>

          <button 
            role="menuitem"
            (click)="triggerContextAction('pin-telemetry', $event)"
            class="min-h-[36px] w-full px-2.5 py-1.5 rounded text-left hover:bg-zinc-800 flex items-center gap-2 text-amber-300 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
            <span>📌</span>
            <span>Pin to Ground Truth</span>
          </button>

          <button 
            role="menuitem"
            (click)="triggerContextAction('add-note', $event)"
            class="min-h-[36px] w-full px-2.5 py-1.5 rounded text-left hover:bg-zinc-800 flex items-center gap-2 text-zinc-300 font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500">
            <span>✏️</span>
            <span>Attach Clinical Note</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ClinicalToolCardComponent {
  private researchLecturesService = inject(ResearchLecturesService, { optional: true }) || new ResearchLecturesService();

  tool = input.required<IClinicalToolItem>();
  state = input<'unassigned' | 'prescribed' | 'hidden'>('unassigned');

  inspect = output<string>();
  toggleState = output<string>();
  contextAction = output<{ action: string; toolId: string }>();

  isExpanded = signal<boolean>(false);
  showContextMenu = signal<boolean>(false);
  private lastTouchTime = 0;

  activeLectures = computed(() => {
    const t = this.tool();
    return t ? this.researchLecturesService.getLecturesForTool(t.id) : [];
  });

  researchFrameUrl = computed(() => {
    const t = this.tool();
    return t ? this.researchLecturesService.generateResearchFrameQueryUrl(t.name) : '#';
  });

  cardCssClass = computed(() => {
    const st = this.state();
    let base = 'p-4 rounded-2xl border transition-all duration-300 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 animate-pg-fade-in hover:scale-[1.008] active:scale-[0.99] ';
    if (st === 'prescribed') {
      base += 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/50 shadow-sm hover:shadow-md hover:border-emerald-500 animate-pg-pulse-glow';
    } else if (st === 'hidden') {
      base += 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100';
    } else {
      base += 'bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-emerald-500/30';
    }
    return base;
  });

  badgeCssClass = computed(() => {
    const st = this.state();
    if (st === 'prescribed') {
      return 'min-h-[32px] px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] shadow-sm flex items-center gap-1.5 transition-all active:scale-95 border border-emerald-500';
    }
    if (st === 'hidden') {
      return 'min-h-[32px] px-2.5 py-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-[10px] flex items-center gap-1.5 transition-transform active:scale-95 border border-zinc-300 dark:border-zinc-700';
    }
    return 'min-h-[32px] px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono font-semibold text-[10px] flex items-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-transform active:scale-95';
  });

  badgeIcon = computed(() => {
    const st = this.state();
    if (st === 'prescribed') return '✓';
    if (st === 'hidden') return '👁️‍🗨️';
    return '+';
  });

  handleSingleClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.showContextMenu()) {
      this.showContextMenu.set(false);
      return;
    }
    this.isExpanded.update(v => !v);
    this.inspect.emit(this.tool().id);
  }

  handleDoubleClick(event: MouseEvent) {
    event.stopPropagation();
    // If single click expanded the drawer during the first click of a double-click, reset it
    if (this.isExpanded()) {
      this.isExpanded.set(false);
    }
    this.toggleState.emit(this.tool().id);
  }

  cycleState(event: MouseEvent) {
    event.stopPropagation();
    this.toggleState.emit(this.tool().id);
  }

  handleRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.showContextMenu.update(v => !v);
  }

  triggerContextAction(action: string, event: MouseEvent) {
    event.stopPropagation();
    this.showContextMenu.set(false);
    this.contextAction.emit({ action, toolId: this.tool().id });
  }

  handleTouchStart(event: TouchEvent) {
    const now = Date.now();
    if (now - this.lastTouchTime < 300) {
      // Double tap detected
      event.preventDefault();
      this.toggleState.emit(this.tool().id);
    }
    this.lastTouchTime = now;
  }
}
