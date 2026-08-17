import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clinical-gauge-svg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative flex flex-col items-center justify-center">
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 100 100" class="transform -rotate-90">
        <!-- Background Track -->
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          stroke="currentColor" 
          stroke-width="8" 
          fill="transparent" 
          class="text-zinc-800/80" />
        
        <!-- Progress Arc -->
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          stroke="currentColor" 
          stroke-width="8" 
          fill="transparent" 
          [attr.stroke-dasharray]="strokeDashArray" 
          [attr.stroke-dashoffset]="strokeDashOffset()" 
          stroke-linecap="round" 
          [class]="colorClass()" 
          class="transition-all duration-700 ease-out" />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span class="text-lg font-bold font-mono text-gray-100">{{ value() }}</span>
        @if (unit()) {
          <span class="text-[9px] text-gray-400 font-medium">{{ unit() }}</span>
        }
      </div>
    </div>
  `
})
export class ClinicalGaugeSvgComponent {
  value = input<number>(50);
  min = input<number>(0);
  max = input<number>(100);
  size = input<number>(80);
  unit = input<string>('%');

  readonly strokeDashArray = 2 * Math.PI * 40; // 251.327

  normalizedPercentage = computed(() => {
    const clamped = Math.max(this.min(), Math.min(this.max(), this.value()));
    return (clamped - this.min()) / (this.max() - this.min());
  });

  strokeDashOffset = computed(() => {
    return this.strokeDashArray * (1 - this.normalizedPercentage());
  });

  colorClass = computed(() => {
    const pct = this.normalizedPercentage();
    if (pct >= 0.75) return 'text-rose-500';
    if (pct >= 0.50) return 'text-amber-500';
    if (pct >= 0.25) return 'text-yellow-500';
    return 'text-emerald-500';
  });
}
