import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insight-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="group relative overflow-hidden rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-700/30 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer">
      <!-- Glow effect -->
      <div class="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-synthesis"></div>
      
      <div class="relative z-10 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[12px] font-bold uppercase tracking-widest border border-blue-100/50 dark:border-blue-800/50">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {{ type }}
          </span>
          <span class="text-xs font-mono font-medium text-zinc-400">Confidence: {{ confidence }}%</span>
        </div>
        
        <h3 class="text-base font-semibold text-zinc-800 dark:text-zinc-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{{ title }}</h3>
        
        <p class="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500 ease-synthesis">{{ content }}</p>
      </div>
    </div>
  `
})
export class InsightCardComponent {
  title = 'Test Title';
  content = 'Test Content';
  type = 'Insight';
  confidence = 95;
}
