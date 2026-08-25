import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AGENT_PERSONAS, IAgentPersona } from '../services/agent-personas';

@Component({
  selector: 'app-gull-squadron-showcase',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
            🪺
          </div>
          <div>
            <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              The Gull Squadron — Avian Agent Personas
              <span class="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                ADK Orchestrator
              </span>
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive anthropomorphic personas, animated props, and specialized diagnostic talent profiles.
            </p>
          </div>
        </div>
        <span class="text-xs font-mono font-medium text-zinc-400">
          DESIGN.md §7
        </span>
      </div>

      <!-- Agent Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (key of personaKeys; track key) {
          @let persona = getPersona(key);
          <div 
            class="paper-card p-4 rounded-2xl cursor-pointer transition-all duration-300 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50"
            [class.ring-2]="selectedAgent() === key"
            [class.ring-amber-500]="selectedAgent() === key"
            (click)="selectAgent(key)"
          >
            <!-- Card Top Bar: Emoji & Name -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <span class="z-10">{{ persona.emoji }}</span>
                  <!-- Animated SVG Accent Backdrop -->
                  <div class="absolute inset-0 opacity-25" [style.backgroundColor]="persona.accentColor"></div>
                </div>
                <div>
                  <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {{ persona.name }}
                  </h4>
                  <span class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {{ persona.role }}
                  </span>
                </div>
              </div>
              <span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {{ persona.adkMapping }}
              </span>
            </div>

            <!-- Quote / Tagline -->
            <p class="text-xs italic text-zinc-700 dark:text-zinc-300 mb-3 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60">
              "{{ persona.tagline }}"
            </p>

            <!-- Props Badges -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              @for (prop of persona.props; track prop) {
                <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <span class="w-1 h-1 rounded-full bg-amber-500"></span>
                  {{ prop }}
                </span>
              }
            </div>
          </div>
        }
      </div>

      <!-- Expanded Persona Detail Sheet -->
      @if (activePersona(); as active) {
        <div class="mt-6 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 origami-unfold relative">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="text-3xl p-2 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-amber-500/30">
                {{ active.emoji }}
              </div>
              <div>
                <h4 class="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  {{ active.name }} — Anthropomorphic Diagnostic Talent
                </h4>
                <p class="text-xs text-zinc-600 dark:text-zinc-400">
                  ADK Orchestrator Node: <code class="font-mono text-amber-600 dark:text-amber-400">{{ active.adkMapping }}</code>
                </p>
              </div>
            </div>
            <button 
              type="button"
              class="px-3 py-1 text-xs font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300"
              (click)="selectedAgent.set(null)"
            >
              Close
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span class="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">🎭 Persona Personality</span>
              <p class="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Embodying clinical empathy and specialized domain reasoning. Designed to humanize AI telemetry and mitigate clinician fatigue.
              </p>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span class="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">🎒 Signature Props</span>
              <ul class="space-y-1 text-zinc-600 dark:text-zinc-400">
                @for (prop of active.props; track prop) {
                  <li class="flex items-center gap-1.5">
                    <span class="text-amber-500">✓</span> {{ prop }}
                  </li>
                }
              </ul>
            </div>
            <div class="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <span class="font-bold text-zinc-900 dark:text-zinc-100 block mb-1">⚡ Keyframe Animation</span>
              <div class="flex items-center gap-2 mt-2">
                <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold" [class]="'anim-' + active.svgAnimation">
                  ✨
                </div>
                <span class="font-mono text-zinc-600 dark:text-zinc-400">{{ active.svgAnimation }}</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class GullSquadronShowcaseComponent {
  personaKeys = Object.keys(AGENT_PERSONAS);
  selectedAgent = signal<string | null>('gulliver');

  getPersona(key: string): IAgentPersona {
    return AGENT_PERSONAS[key];
  }

  selectAgent(key: string) {
    if (this.selectedAgent() === key) {
      this.selectedAgent.set(null);
    } else {
      this.selectedAgent.set(key);
    }
  }

  activePersona = computed<IAgentPersona | null>(() => {
    const key = this.selectedAgent();
    return key ? AGENT_PERSONAS[key] : null;
  });
}
