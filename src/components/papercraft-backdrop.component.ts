import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-papercraft-backdrop',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="absolute inset-0 w-full h-full min-h-full overflow-hidden pointer-events-none z-0">
      <!-- Sun/Circadian Glow Living Breathing Pulse -->
      <div class="absolute top-[25%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-gradient-to-r from-[#3ebc9e]/30 via-[#faa63b]/25 to-[#ef6658]/30 blur-[100px] avs-breathing-glow animate-pulse"></div>

      <!-- Layer 1: Back Ocean Waves -->
      <svg class="absolute -bottom-4 -left-[20%] w-[240%] h-[75%] paper-hill-back opacity-90 wave-layer min-w-[200vw]"
           [style.animation-duration.s]="wavePeriod() * 1.5"
           viewBox="0 0 2880 200" preserveAspectRatio="none">
        <path fill="currentColor" [attr.d]="getWavePath(1)"></path>
      </svg>
      
      <!-- Layer 2: Mid Ocean Waves -->
      <svg class="absolute -bottom-4 -left-[10%] w-[220%] h-[65%] paper-hill-mid wave-layer min-w-[200vw]"
           [style.animation-duration.s]="wavePeriod() * 1.2"
           viewBox="0 0 2880 200" preserveAspectRatio="none">
        <path fill="currentColor" [attr.d]="getWavePath(2)"></path>
      </svg>

      <!-- Layer 3: Sandy Beach Front Dune -->
      <svg class="absolute -bottom-4 left-0 w-[200%] h-[80%] paper-hill-front wave-layer min-w-[200vw]"
           [style.animation-duration.s]="wavePeriod() * 0.9"
           viewBox="0 0 2880 200" preserveAspectRatio="none">
        <path fill="currentColor" [attr.d]="getWavePath(3)"></path>
      </svg>

      <!-- Breezy Sandy Animation Layer -->
      <div class="absolute bottom-0 left-0 w-full h-[56%] pointer-events-none overflow-hidden z-10">
        <div class="sand-breeze-particle p1"></div>
        <div class="sand-breeze-particle p2"></div>
        <div class="sand-breeze-particle p3"></div>
        <div class="sand-breeze-particle p4"></div>
        <div class="sand-breeze-particle p5"></div>
      </div>
    </div>
  `
})
export class PapercraftBackdropComponent {
  readonly wavePeriod = input<number>(6.0);

  public getWavePath(layer: number): string {
    if (layer === 1) {
      return "M 0 100 Q 720 40 1440 100 T 2880 100 L 2880 200 L 0 200 Z";
    } else if (layer === 2) {
      return "M 0 120 Q 720 70 1440 120 T 2880 120 L 2880 200 L 0 200 Z";
    }
    return "M 0 140 Q 720 100 1440 140 T 2880 140 L 2880 200 L 0 200 Z";
  }
}
