import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractiveOnboardingTourService } from '../services/interactive-onboarding-tour.service';

@Component({
  selector: 'app-onboarding-tour-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (tourService.isTourActive()) {
      <div class="fixed inset-0 z-50 pointer-events-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="w-full max-w-lg bg-zinc-900 text-gray-100 rounded-3xl border border-purple-500/40 p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Step {{ tourService.progress().currentStepIndex + 1 }} of {{ tourService.progress().totalSteps }}
              </span>
              <span class="text-xs text-gray-400 font-mono">
                [{{ tourService.selectedPersona() }} Persona]
              </span>
            </div>
            <button 
              (click)="tourService.completeTour()"
              class="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-zinc-800 transition-all"
            >
              ✕ Skip Tour
            </button>
          </div>

          <!-- Active Step Details -->
          @if (tourService.progress().activeStep; as step) {
            <div class="space-y-3">
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                {{ step.title }}
              </h3>
              <p class="text-xs text-gray-300 leading-relaxed">
                {{ step.description }}
              </p>

              @if (step.actionHint) {
                <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-xs text-purple-200">
                  <span>💡</span>
                  <span class="font-mono">{{ step.actionHint }}</span>
                </div>
              }
            </div>
          }

          <!-- Footer Navigation Buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-zinc-800">
            <button
              (click)="tourService.previousStep()"
              [disabled]="tourService.currentStepIndex() === 0"
              class="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-200 transition-all"
            >
              ← Previous
            </button>

            <div class="flex items-center gap-2">
              <button
                (click)="tourService.nextStep()"
                class="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md"
              >
                {{ tourService.currentStepIndex() === tourService.progress().totalSteps - 1 ? 'Finish Tour 🎉' : 'Next Step →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OnboardingTourOverlayComponent {
  readonly tourService = inject(InteractiveOnboardingTourService);
}
