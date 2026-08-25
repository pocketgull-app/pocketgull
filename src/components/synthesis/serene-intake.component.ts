import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-serene-intake',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[40vh]">
      <div class="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 class="text-3xl font-light text-zinc-800 dark:text-zinc-100 tracking-tight">What's on your mind?</h2>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-medium tracking-wide">Speak freely or paste your unstructured data. We will distill the signal from the noise.</p>
      </div>

      <div class="w-full relative group animate-in zoom-in-95 fade-in duration-700 delay-150 fill-mode-both">
        <!-- Glow effect -->
        <div class="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-blue-500/20 via-teal-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
        
        <div class="relative bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl border border-white/40 dark:border-zinc-700/50 rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-500 focus-within:ring-2 focus-within:ring-blue-500/50">
          <textarea 
            [(ngModel)]="inputText"
            class="w-full min-h-[160px] p-8 bg-transparent text-lg text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 border-none outline-none resize-none font-medium leading-relaxed" 
            placeholder="Type or paste medical notes, research abstracts, or symptom descriptions..."></textarea>
            
          <div class="flex items-center justify-between px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
            <button class="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              <span class="text-sm font-semibold tracking-wide">Use Voice</span>
            </button>
            <button 
              [disabled]="!inputText()"
              class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
              Synthesize
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SereneIntakeComponent {
  inputText = signal('');
}
