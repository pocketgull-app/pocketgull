import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrowThyselfLegacyEngineService, UserLegacyArchetype } from '../services/grow-thyself-legacy-engine.service';

@Component({
  selector: 'app-grow-thyself-legacy-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-emerald-950/60 border border-purple-500/30 shadow-2xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🌱</span>
            <div>
              <h2 class="text-xl font-bold text-gray-100">Grow Thyself: Lifelong Vitality & Legacy Sovereign Vault</h2>
              <p class="text-xs text-gray-400 mt-1">
                Reflection lenses for active lifelong vital contributions on Earth, and posthumous open-science data directives for seven generations hence.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-xl border border-purple-500/20">
            <div class="text-right">
              <div class="text-[10px] uppercase tracking-wider font-bold text-purple-400">Total Legacy Impact</div>
              <div class="text-lg font-extrabold text-emerald-400 font-mono">{{ legacyEngine.totalLegacyImpactScore() }} pts</div>
            </div>
            <span class="text-2xl">🏛️</span>
          </div>
        </div>
      </div>

      <!-- 6 Archetype Reflection Selector -->
      <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choose Your Life's Work Archetype Lens</h3>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          @for (arch of archetypes; track arch.key) {
            <button
              (click)="legacyEngine.setArchetype(arch.key)"
              [class.border-purple-500]="legacyEngine.activeArchetype() === arch.key"
              [class.bg-purple-950\/30]="legacyEngine.activeArchetype() === arch.key"
              [class.border-zinc-800]="legacyEngine.activeArchetype() !== arch.key"
              class="p-3 rounded-xl border text-left transition-all hover:border-purple-400 cursor-pointer flex flex-col justify-between"
            >
              <span class="text-xl mb-1">{{ arch.icon }}</span>
              <div>
                <div class="text-xs font-bold text-gray-200 leading-tight">{{ arch.shortLabel }}</div>
              </div>
            </button>
          }
        </div>

        <!-- Active Archetype Focus & Motto -->
        <div class="mt-4 p-4 bg-purple-950/20 rounded-xl border border-purple-800/30">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-bold text-purple-300">{{ legacyEngine.activeArchetypeDetails().label }}</span>
            <span class="text-xs font-mono text-zinc-400">Active Archetype</span>
          </div>
          <p class="text-xs text-gray-300 mb-2">{{ legacyEngine.activeArchetypeDetails().focus }}</p>
          <p class="text-[11px] font-serif italic text-emerald-400">"{{ legacyEngine.activeArchetypeDetails().motto }}"</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ══ Lifelong Vitality Quests (Staying Active on Earth) ═══════════════ -->
        <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">🏃</span>
                <h3 class="text-sm font-bold text-gray-200">Active Earth Quests: Lifelong Health & Purpose</h3>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {{ legacyEngine.completedQuestCount() }} / {{ legacyEngine.purposeQuests().length }} Completed
              </span>
            </div>

            <div class="space-y-3">
              @for (quest of legacyEngine.purposeQuests(); track quest.id) {
                <div 
                  (click)="legacyEngine.toggleQuest(quest.id)"
                  [class.opacity-60]="quest.isCompleted"
                  class="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50 hover:border-emerald-500/40 transition cursor-pointer flex items-start gap-3"
                >
                  <input type="checkbox" [checked]="quest.isCompleted" class="mt-1 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500" />
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-gray-200" [class.line-through]="quest.isCompleted">{{ quest.title }}</span>
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">+{{ quest.impactScore }} pts</span>
                    </div>
                    <p class="text-[11px] text-gray-400 mt-1">{{ quest.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-gray-400">
            <span>Vitality Category: Physical & Purpose Alignment</span>
            <button class="text-emerald-400 hover:underline font-bold text-[11px]">➕ Add Personal Earth Goal</button>
          </div>
        </div>

        <!-- ══ Posthumous Data Directives (Legacy Living On After Earth) ══════════ -->
        <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="text-lg">🌌</span>
              <div>
                <h3 class="text-sm font-bold text-gray-200">Posthumous Sovereign Data Directives</h3>
                <p class="text-[11px] text-gray-400">Specify how your anonymized clinical data & wisdom continue benefiting humanity after Earth.</p>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Open Science Donation -->
              <div class="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-200">🧬 Open-Science Research Corpus</span>
                  <input 
                    type="checkbox" 
                    [ngModel]="legacyEngine.posthumousDirective().openScienceConsent" 
                    (ngModelChange)="legacyEngine.updatePosthumousDirective({ openScienceConsent: $event })"
                    class="rounded text-emerald-500 focus:ring-emerald-500" 
                  />
                </div>
                <p class="text-[11px] text-gray-400">Donate de-identified FHIR telemetry to open cancer, longevity, and neurodegeneration research.</p>
              </div>

              <!-- Lineage Epigenetic Protection -->
              <div class="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-200">🌲 Lineage Epigenetic Protection</span>
                  <input 
                    type="checkbox" 
                    [ngModel]="legacyEngine.posthumousDirective().lineageEpigeneticSharing" 
                    (ngModelChange)="legacyEngine.updatePosthumousDirective({ lineageEpigeneticSharing: $event })"
                    class="rounded text-emerald-500 focus:ring-emerald-500" 
                  />
                </div>
                <p class="text-[11px] text-gray-400">Provide direct family descendants with encrypted environmental & phytoncide exposure protection maps.</p>
              </div>

              <!-- Digital Wisdom Avatar -->
              <div class="p-3.5 bg-zinc-800/40 rounded-xl border border-zinc-700/50 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-gray-200">🎙️ Digital Oral History & Wisdom Avatar</span>
                  <input 
                    type="checkbox" 
                    [ngModel]="legacyEngine.posthumousDirective().digitalWisdomAvatarEnabled" 
                    (ngModelChange)="legacyEngine.updatePosthumousDirective({ digitalWisdomAvatarEnabled: $event })"
                    class="rounded text-emerald-500 focus:ring-emerald-500" 
                  />
                </div>
                <p class="text-[11px] text-gray-400">Encrypt personal oral history notes & core values for family lineage Socratic consultation.</p>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Vault Hash: {{ legacyEngine.posthumousDirective().encryptedVaultHash.slice(0, 16) }}...</span>
            <span class="text-emerald-400 font-bold text-[11px]">🔐 Sovereign Encrypted</span>
          </div>
        </div>
      </div>

      <!-- ══ Continuous Living Experience & Citizen Science Submission Stream ════════ -->
      <div class="p-6 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">✍️</span>
            <div>
              <h3 class="text-sm font-bold text-gray-200">Continuous Experience Submissions & Citizen Science Stream</h3>
              <p class="text-[11px] text-gray-400">Publish ongoing health discoveries, recovery milestones, and personal reflections to accelerate open medical research.</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {{ legacyEngine.livingSubmissions().length }} Submissions Published
          </span>
        </div>

        <!-- Experience Input Form -->
        <div class="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/60 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input 
              [(ngModel)]="newTitle" 
              placeholder="Title of experience or discovery (e.g. Zone-2 HRV Recovery)" 
              class="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 focus:border-purple-500" 
            />
            <select [(ngModel)]="newCategory" class="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 focus:border-purple-500">
              <option value="INTERVENTION_OUTCOME">🫀 Clinical Intervention Outcome</option>
              <option value="LIFESTYLE_DISCOVERY">🌿 Lifestyle / Environmental Discovery</option>
              <option value="PHILOSOPHICAL_WISDOM">📜 Philosophical / Life Wisdom</option>
              <option value="RECOVERY_MILESTONE">🏆 Recovery Milestone</option>
            </select>
          </div>

          <textarea 
            [(ngModel)]="newNarrative" 
            rows="3" 
            placeholder="Share your detailed reflection, biometrics observed, or personal wisdom..." 
            class="w-full text-xs p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-gray-200 focus:border-purple-500"
          ></textarea>

          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" [(ngModel)]="newConsent" class="rounded text-emerald-500 focus:ring-emerald-500" />
              <span>Share anonymously to Open Science Research Corpus</span>
            </label>
            <button 
              (click)="submitExperience()" 
              [disabled]="!newTitle.trim() || !newNarrative.trim()"
              class="px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition cursor-pointer shadow-md"
            >
              🚀 Publish to Legacy Stream
            </button>
          </div>
        </div>

        <!-- Experience Feed -->
        <div class="space-y-3 pt-2">
          @for (sub of legacyEngine.livingSubmissions(); track sub.id) {
            <div class="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/40 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {{ sub.category }}
                  </span>
                  <span class="text-xs font-bold text-gray-200">{{ sub.title }}</span>
                </div>
                <span class="text-[10px] font-mono text-zinc-500">{{ sub.timestamp | date:'short' }}</span>
              </div>
              <p class="text-xs text-gray-300">{{ sub.narrative }}</p>
              <div class="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>SNOMED-CT Code: <code class="font-mono text-purple-400">{{ sub.snomedCode || 'N/A' }}</code></span>
                <span class="text-emerald-400">👍 {{ sub.upvotesCount }} Peer Endorsements</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class GrowThyselfLegacyVaultComponent {
  readonly legacyEngine = inject(GrowThyselfLegacyEngineService);

  readonly archetypes: { key: UserLegacyArchetype; icon: string; shortLabel: string }[] = [
    { key: 'CREATIVE_ARTISAN', icon: '🎨', shortLabel: 'Creative Artisan' },
    { key: 'KNOWLEDGE_SCHOLAR', icon: '🧠', shortLabel: 'Knowledge Scholar' },
    { key: 'LAND_STEWARD', icon: '🌲', shortLabel: 'Land Steward' },
    { key: 'PHYSICAL_PRACTITIONER', icon: '🫀', shortLabel: 'Physical Practitioner' },
    { key: 'CIVIC_BUILDER', icon: '🏛️', shortLabel: 'Civic Builder' },
    { key: 'OPEN_SCIENCE_CONTRIBUTOR', icon: '🧬', shortLabel: 'Open Science' }
  ];

  newTitle = '';
  newNarrative = '';
  newCategory: 'INTERVENTION_OUTCOME' | 'LIFESTYLE_DISCOVERY' | 'PHILOSOPHICAL_WISDOM' | 'RECOVERY_MILESTONE' = 'INTERVENTION_OUTCOME';
  newConsent = true;

  submitExperience(): void {
    if (!this.newTitle.trim() || !this.newNarrative.trim()) return;

    this.legacyEngine.submitExperience({
      title: this.newTitle,
      narrative: this.newNarrative,
      category: this.newCategory,
      researchConsent: this.newConsent
    });

    this.newTitle = '';
    this.newNarrative = '';
  }
}
