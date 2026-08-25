import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InsightCardComponent } from './insight-card.component';

@Component({
  selector: 'app-insight-grid',
  standalone: true,
  imports: [CommonModule, InsightCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <app-insight-card *ngFor="let item of [1, 2, 3, 4, 5]" class="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-synthesis fill-mode-both" [style.animation-delay.ms]="item * 100"></app-insight-card>
    </div>
  `
})
export class InsightGridComponent {
}
