import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ClinicalIconName = 
  | 'heart' 
  | 'lungs' 
  | 'brain' 
  | 'spine' 
  | 'tooth' 
  | 'cgm' 
  | 'shield' 
  | 'seagull'
  | 'stethoscope'
  | 'dna'
  | 'syringe'
  | 'pill';

@Component({
  selector: 'app-pocketgull-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center justify-center text-xl pointer-events-none select-none">
      @switch (name()) {
        @case ('seagull') {
          <svg class="w-6 h-6 text-amber-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <!-- Dieter Rams Origami Seagull Clean Lines -->
            <polygon points="10,40 50,50 60,75 35,75" stroke-width="4" fill="rgba(245, 158, 11, 0.1)"/>
            <polygon points="50,50 55,25 68,20 80,50" stroke-width="4"/>
            <polygon points="68,20 90,22 92,30 75,38" fill="currentColor" stroke-width="3"/>
          </svg>
        }
        @case ('heart') {
          <svg class="w-6 h-6 text-rose-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M50 85 C15 50 10 20 35 15 C45 12 50 25 50 25 C50 25 55 12 65 15 C90 20 85 50 50 85 Z"/>
          </svg>
        }
        @case ('lungs') {
          <svg class="w-6 h-6 text-cyan-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M45 20 V80 M55 20 V80 M45 40 C20 40 15 65 25 80 C35 90 45 75 45 75 M55 40 C80 40 85 65 75 80 C65 90 55 75 55 75"/>
          </svg>
        }
        @case ('brain') {
          <svg class="w-6 h-6 text-purple-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M50 20 C30 15 15 35 20 60 C20 80 40 85 50 85 C60 85 80 80 80 60 C85 35 70 15 50 20 Z M50 20 V85"/>
          </svg>
        }
        @case ('spine') {
          <svg class="w-6 h-6 text-indigo-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M50 15 V85 M35 30 H65 M30 50 H70 M35 70 H65"/>
          </svg>
        }
        @case ('tooth') {
          <svg class="w-6 h-6 text-teal-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M25 25 C25 15 75 15 75 25 C75 45 80 50 65 85 C60 95 55 70 50 70 C45 70 40 95 35 85 C20 50 25 45 25 25 Z"/>
          </svg>
        }
        @case ('cgm') {
          <svg class="w-6 h-6 text-amber-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M50 15 C50 15 20 55 20 70 C20 85 35 90 50 90 C65 90 80 85 80 70 C80 55 50 15 50 15 Z"/>
          </svg>
        }
        @case ('stethoscope') {
          <svg class="w-6 h-6 text-blue-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M30 20 V40 C30 55 70 55 70 40 V20 M50 50 V75 M70 80 A 10 10 0 1 1 50 80 A 10 10 0 1 1 70 80"/>
          </svg>
        }
        @case ('dna') {
          <svg class="w-6 h-6 text-emerald-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M30 15 C45 35 55 65 70 85 M70 15 C55 35 45 65 30 85 M35 30 H65 M38 50 H62 M35 70 H65"/>
          </svg>
        }
        @case ('syringe') {
          <svg class="w-6 h-6 text-sky-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 80 L35 65 M30 70 L70 30 M60 20 L80 40 M75 15 L85 25"/>
          </svg>
        }
        @case ('pill') {
          <svg class="w-6 h-6 text-pink-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="25" y="40" width="50" height="20" rx="10"/>
            <line x1="50" y1="40" x2="50" y2="60"/>
          </svg>
        }
        @case ('shield') {
          <svg class="w-6 h-6 text-emerald-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M50 15 L80 25 V55 C80 75 50 90 50 90 C50 90 20 75 20 55 V25 Z"/>
          </svg>
        }
        @default {
          <svg class="w-6 h-6 text-sky-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="50" cy="50" r="35"/>
            <path d="M50 25 V50 L65 65"/>
          </svg>
        }
      }
    </span>
  `
})
export class PocketgullIconComponent {
  name = input.required<ClinicalIconName>();
}
