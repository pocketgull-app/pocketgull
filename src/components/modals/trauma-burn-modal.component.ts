import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraumaBurn3dLensComponent } from '../anatomy-3d/trauma-burn-3d-lens.component';

@Component({
  selector: 'app-trauma-burn-modal',
  standalone: true,
  imports: [CommonModule, TraumaBurn3dLensComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[1200] bg-black/85 backdrop-blur-2xl p-2 sm:p-6 flex items-center justify-center overflow-y-auto font-mono text-zinc-100 animate-in fade-in duration-200"
         role="dialog" aria-modal="true" aria-labelledby="trauma-modal-title">
      
      <div class="w-full max-w-6xl h-[90vh] bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        <!-- Modal Close Button Floating Top-Right -->
        <button type="button" (click)="close.emit()" aria-label="Close modal"
                class="absolute top-4 right-4 z-30 w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 flex items-center justify-center transition cursor-pointer">
          ✕
        </button>

        <app-trauma-burn-3d-lens class="h-full w-full" />

      </div>
    </div>
  `
})
export class TraumaBurnModalComponent {
  close = output<void>();
}
