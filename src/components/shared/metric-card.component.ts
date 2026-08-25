import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative p-5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/50 dark:border-zinc-800/80 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 group overflow-hidden">
      <!-- Subtle top Dieter Rams grill -->
      <div class="absolute top-0 left-0 right-0 h-1 flex gap-0.5 px-6 opacity-30 group-hover:opacity-60 transition-opacity">
         <div class="flex-1" [ngClass]="colorClass()"></div>
         <div class="flex-1" [ngClass]="colorClass()"></div>
         <div class="flex-1" [ngClass]="colorClass()"></div>
      </div>
      
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-[12px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest font-mono">{{ title() }}</h3>
        
        <!-- Animated visual indicator -->
        <div class="relative flex h-2.5 w-2.5 mt-0.5">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75" [ngClass]="[pulseClass(), animationClass()]"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5" [ngClass]="colorClass()"></span>
        </div>
      </div>
      
      <div class="mt-4 flex items-baseline gap-2">
        <!-- The main value -->
        <span class="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 select-all">{{ displayValue() }}</span>
        <span class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">{{ unit() }}</span>
      </div>
      
      <!-- Trend / Info line -->
      @if (trendText()) {
        <div class="mt-3 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <!-- Trend Icon -->
          @if (trendDirection() === 'up') {
            <svg class="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
          } @else if (trendDirection() === 'down') {
            <svg class="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          } @else {
            <svg class="w-3 h-3 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
          }
          <span class="text-[12px] font-bold uppercase tracking-widest font-mono" [ngClass]="trendColorClass()">{{ trendText() }}</span>
        </div>
      }
    </div>
  `
})
export class MetricCardComponent {
  title = input.required<string>();
  value = input.required<number | string>();
  unit = input<string>('');
  
  // Theme styling controls
  status = input<'normal' | 'warning' | 'critical'>('normal');
  trendDirection = input<'up' | 'down' | 'stable'>('stable');
  trendText = input<string>('');

  displayValue = computed(() => this.value());

  colorClass = computed(() => {
    switch(this.status()) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  });

  pulseClass = computed(() => {
    switch(this.status()) {
      case 'critical': return 'bg-red-400';
      case 'warning': return 'bg-amber-400';
      default: return 'bg-emerald-400';
    }
  });

  animationClass = computed(() => {
    // Make critical status pulse faster
    return this.status() === 'critical' ? 'animate-ping' : 'animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]';
  });

  trendColorClass = computed(() => {
    switch(this.trendDirection()) {
       case 'up': return 'text-red-600 dark:text-red-400';
       case 'down': return 'text-blue-600 dark:text-blue-400';
       default: return 'text-emerald-600 dark:text-emerald-400';
    }
  });
}
