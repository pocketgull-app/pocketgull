import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightCardComponent } from './insight-card.component';
import { KnowledgeSynthesisService, InsightNode } from '../../services/knowledge-synthesis.service';

@Component({
  selector: 'app-insight-grid',
  standalone: true,
  imports: [CommonModule, InsightCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between px-6 pt-2">
        <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
          Synthesized Cross-Paradigm Intelligence Grid ({{ activeInsights().length }})
        </h4>
        @if (synthesisService.isProcessing()) {
          <span class="text-xs text-sky-400 animate-pulse font-mono font-bold">Synthesizing...</span>
        }
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        @for (node of activeInsights(); track node.id; let idx = $index) {
          <app-insight-card 
            [node]="node" 
            class="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-synthesis fill-mode-both" 
            [style.animation-delay.ms]="idx * 100">
          </app-insight-card>
        }
      </div>
    </div>
  `
})
export class InsightGridComponent {
  synthesisService = inject(KnowledgeSynthesisService);

  private readonly sampleInsights: InsightNode[] = [
    {
      id: 'syn-1',
      title: 'Mitochondrial Incretin Synergy',
      content: 'Concurrent GLP-1 receptor agonism and CoQ10 ubiquinol supplementation enhances beta-cell bioenergetic output by 23%.',
      type: 'Action Item',
      confidence: 96
    },
    {
      id: 'syn-2',
      title: 'Vagal Resonant Tone Calibration',
      content: '6.0 bpm slow-paced diaphragmatic respiration modulates cardiac vagal efferent activity and attenuates acute sympathetic spikes.',
      type: 'Urgent Signal',
      confidence: 94
    },
    {
      id: 'syn-3',
      title: 'Tri-Paradigm Botanical Cross-Talk',
      content: 'Standardized Curcumin Meriva combined with Berberine HCl down-regulates hepatic NF-kB inflammatory cascades and stabilizes fasting glucose.',
      type: 'Context',
      confidence: 91
    }
  ];

  readonly activeInsights = computed(() => {
    const live = this.synthesisService.insights();
    return live.length > 0 ? live : this.sampleInsights;
  });
}
