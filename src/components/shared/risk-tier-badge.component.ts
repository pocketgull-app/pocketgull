import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type RiskTierLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'OPTIMAL' | 'UNKNOWN';

@Component({
  selector: 'app-risk-tier-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      [class]="badgeClasses()"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm transition-all duration-200">
      <span class="w-1.5 h-1.5 rounded-full animate-pulse" [class]="dotClass()"></span>
      {{ label() || level() }}
    </span>
  `
})
export class RiskTierBadgeComponent {
  level = input<RiskTierLevel>('LOW');
  label = input<string>('');

  badgeClasses = computed(() => {
    switch (this.level()) {
      case 'CRITICAL':
        return 'bg-rose-950/80 border-rose-600/50 text-rose-300 shadow-rose-900/20';
      case 'HIGH':
        return 'bg-amber-950/80 border-amber-600/50 text-amber-300 shadow-amber-900/20';
      case 'MODERATE':
        return 'bg-yellow-950/80 border-yellow-600/50 text-yellow-300 shadow-yellow-900/20';
      case 'OPTIMAL':
      case 'LOW':
        return 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300 shadow-emerald-900/20';
      case 'UNKNOWN':
      default:
        return 'bg-zinc-800 border-zinc-700 text-gray-400';
    }
  });

  dotClass = computed(() => {
    switch (this.level()) {
      case 'CRITICAL':
        return 'bg-rose-400';
      case 'HIGH':
        return 'bg-amber-400';
      case 'MODERATE':
        return 'bg-yellow-400';
      case 'OPTIMAL':
      case 'LOW':
        return 'bg-emerald-400';
      case 'UNKNOWN':
      default:
        return 'bg-gray-400';
    }
  });
}
