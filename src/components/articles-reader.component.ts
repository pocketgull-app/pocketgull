import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WordPressArticlesService, IWordPressPost, IActionStage } from '../services/wordpress-articles.service';
import { BionicReadingService } from '../services/bionic-reading.service';
import { LongitudinalOrganSliderComponent } from './shared/longitudinal-organ-slider.component';

@Component({
  selector: 'app-articles-reader',
  standalone: true,
  imports: [CommonModule, FormsModule, LongitudinalOrganSliderComponent],
  template: `
    <div class="p-4 sm:p-6 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl space-y-6 font-sans">
      
      <!-- Top Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-xs shrink-0">
            📰
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wider text-white font-sans">
                Pocket-Gull Breakthrough Articles & Inventions Hub
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                15 Paradigms + Empirical Evidence
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              Empirical trials, multi-timeline action matrices, 3D anatomical organ models, and historical inventions.
            </p>
          </div>
        </div>

        <!-- Toolbar: Bionic Toggle, Reading Level, Sync & Live Link -->
        <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
          <!-- Bionic Reading Mode Toggle -->
          <button (click)="toggleBionic()"
                  [class.bg-amber-500]="isBionicMode()"
                  [class.text-zinc-950]="isBionicMode()"
                  [class.border-amber-400]="isBionicMode()"
                  [class.bg-zinc-900]="!isBionicMode()"
                  [class.text-zinc-300]="!isBionicMode()"
                  [class.border-zinc-800]="!isBionicMode()"
                  class="px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Toggle Bionic Reading Mode (Alt+B)">
            <span>⚡</span>
            <span>{{ isBionicMode() ? 'Bionic Active' : 'Bionic Mode' }}</span>
          </button>

          <!-- Reading Level Mode Toggle -->
          <div class="flex items-center bg-zinc-900 rounded-xl p-0.5 border border-zinc-800">
            <button (click)="readingLevel.set('standard')"
                    [class.bg-indigo-600]="readingLevel() === 'standard'"
                    [class.text-white]="readingLevel() === 'standard'"
                    [class.text-zinc-400]="readingLevel() !== 'standard'"
                    class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px]">
              🎓 Standard
            </button>
            <button (click)="readingLevel.set('grade6')"
                    [class.bg-emerald-600]="readingLevel() === 'grade6'"
                    [class.text-white]="readingLevel() === 'grade6'"
                    [class.text-zinc-400]="readingLevel() !== 'grade6'"
                    class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px]">
              🌱 6th Grade
            </button>
          </div>

          <!-- Audio Readback Button -->
          <button (click)="isSpeaking() ? stopSpeaking() : speakArticle()"
                  [class.bg-teal-600]="isSpeaking()"
                  [class.text-white]="isSpeaking()"
                  [class.bg-zinc-900]="!isSpeaking()"
                  [class.text-zinc-300]="!isSpeaking()"
                  class="px-3 py-1.5 rounded-xl border border-zinc-800 font-bold transition cursor-pointer flex items-center gap-1.5">
            <span>{{ isSpeaking() ? '🛑' : '🔊' }}</span>
            <span>{{ isSpeaking() ? 'Stop' : 'Listen' }}</span>
          </button>

          <!-- Sync Button -->
          <button (click)="syncArticles()"
                  [disabled]="isLoading()"
                  class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5">
            <span [class.animate-spin]="isLoading()">🔄</span>
            <span>Sync</span>
          </button>
          <a href="https://pocketgull.com/articles" target="_blank" rel="noopener noreferrer"
             class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition">
            Live Site ↗
          </a>
        </div>
      </div>

      <!-- Main Layout: Sidebar & Reader -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left: Article Directory -->
        <div class="lg:col-span-4 space-y-3">
          <div class="flex items-center justify-between text-xs font-mono text-zinc-400 pb-1 border-b border-zinc-800">
            <span>Published Guides ({{ posts().length }})</span>
            <span>⏱️ Read Time</span>
          </div>

          <div class="space-y-2.5 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
            @for (post of posts(); track post.id) {
              <div (click)="selectArticle(post.slug)"
                   [class.bg-zinc-900]="activePost()?.slug === post.slug"
                   [class.border-emerald-500]="activePost()?.slug === post.slug"
                   [class.bg-zinc-950]="activePost()?.slug !== post.slug"
                   [class.border-zinc-800]="activePost()?.slug !== post.slug"
                   class="p-3.5 rounded-2xl border hover:border-zinc-700 transition cursor-pointer space-y-2">
                
                <div class="flex items-center justify-between text-[10px] font-mono">
                  <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                    {{ post.sno10Category || 'General Health' }}
                  </span>
                  <span class="text-zinc-500">⏱️ {{ post.readingTimeMinutes }}m</span>
                </div>

                <h4 class="text-xs font-bold text-white font-sans leading-snug">
                  {{ post.title }}
                </h4>

                <p class="text-[11px] text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                  {{ post.excerpt }}
                </p>

                <div class="text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-900 flex items-center justify-between">
                  <span>✍️ {{ post.authorName.split(' ')[0] }}</span>
                  <span>{{ post.date | date:'MMM d' }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Right: Distraction-Free Reader + Breakthrough Framework Sections -->
        <div class="lg:col-span-8 p-5 sm:p-7 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-8">
          @if (activePost(); as article) {
            
            <!-- 1. Article Header -->
            <div class="space-y-3 border-b border-zinc-800 pb-5">
              <div class="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {{ article.sno10Category }}
                </span>
                <span class="text-zinc-500">•</span>
                <span class="text-zinc-400">⏱️ {{ article.readingTimeMinutes }} min read</span>
                <span class="text-zinc-500">•</span>
                <span class="text-zinc-400">By {{ article.authorName }}</span>
                <span class="text-zinc-500">•</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      [class.bg-emerald-500\/20]="readingLevel() === 'grade6'"
                      [class.text-emerald-300]="readingLevel() === 'grade6'"
                      [class.bg-indigo-500\/20]="readingLevel() === 'standard'"
                      [class.text-indigo-300]="readingLevel() === 'standard'">
                  {{ readingLevel() === 'grade6' ? '🌱 6th Grade Plain-Language' : '🎓 Clinical Standard' }}
                </span>
              </div>

              <h2 class="text-xl sm:text-2xl font-black text-white font-sans tracking-tight leading-tight">
                {{ article.title }}
              </h2>
            </div>

            <!-- 2. Prose Body with Dynamic Bionic & Reading Level Formatting -->
            <div class="text-sm sm:text-base leading-relaxed text-zinc-200 space-y-4 font-serif"
                 [innerHTML]="formattedBody()">
            </div>

            <!-- 3. ⏱️ Breakthrough Chronological Action Matrix (Present / Short-Term / Long-Term) -->
            @if (article.chronologicalActionMatrix; as cam) {
              <div class="p-5 rounded-3xl bg-zinc-950 border border-emerald-500/30 space-y-4 shadow-xl">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div class="flex items-center gap-2.5">
                    <span class="text-xl">⏱️</span>
                    <div>
                      <h4 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-mono">
                        Chronological Action Matrix: What to Do Now, Next & Decades Out
                      </h4>
                      <p class="text-[11px] text-zinc-400">Actionable steps grounded in verified physiological mechanisms.</p>
                    </div>
                  </div>

                  <!-- Timeline Selector Tabs -->
                  <div class="flex items-center bg-zinc-900 rounded-xl p-0.5 border border-zinc-800 font-mono text-[11px]">
                    <button (click)="activeTimelineTab.set('present')"
                            [class.bg-amber-600]="activeTimelineTab() === 'present'"
                            [class.text-white]="activeTimelineTab() === 'present'"
                            [class.text-zinc-400]="activeTimelineTab() !== 'present'"
                            class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer">
                      ⚡ Present (0-24h)
                    </button>
                    <button (click)="activeTimelineTab.set('shortTerm')"
                            [class.bg-emerald-600]="activeTimelineTab() === 'shortTerm'"
                            [class.text-white]="activeTimelineTab() === 'shortTerm'"
                            [class.text-zinc-400]="activeTimelineTab() !== 'shortTerm'"
                            class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer">
                      🗓️ Short-Term (Weeks)
                    </button>
                    <button (click)="activeTimelineTab.set('longTerm')"
                            [class.bg-indigo-600]="activeTimelineTab() === 'longTerm'"
                            [class.text-white]="activeTimelineTab() === 'longTerm'"
                            [class.text-zinc-400]="activeTimelineTab() !== 'longTerm'"
                            class="px-2.5 py-1 rounded-lg font-bold transition cursor-pointer">
                      🌟 Long-Term (Years)
                    </button>
                  </div>
                </div>

                <!-- Active Timeline Stage Card -->
                @if (getActiveActionStage(cam); as stage) {
                  <div class="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 animate-in fade-in duration-200">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-2xl">{{ stage.icon }}</span>
                        <div>
                          <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                            {{ stage.timeline }}
                          </span>
                          <h5 class="text-xs sm:text-sm font-bold text-white font-sans">
                            {{ stage.title }}
                          </h5>
                        </div>
                      </div>
                    </div>

                    <div class="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs font-sans text-zinc-200 leading-relaxed">
                      <strong class="text-emerald-300">Action Step:</strong> {{ stage.action }}
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div class="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 space-y-1">
                        <span class="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">🔬 Physiological Mechanism</span>
                        <p class="text-[11px] text-zinc-300 leading-relaxed">{{ stage.physiologicalMechanism }}</p>
                      </div>
                      <div class="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 space-y-1">
                        <span class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">📊 Empirical Proof</span>
                        <p class="text-[11px] text-zinc-300 leading-relaxed">{{ stage.empiricalProof }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- 4. 🧬 3D Organ & Longitudinal Consequence Viewer -->
            @if (article.longitudinal3dConfig) {
              <app-longitudinal-organ-slider [config]="article.longitudinal3dConfig" />
            }

            <!-- 5. 💡 Medical Inventions & Luminary Spotlight -->
            @if (article.medicalInvention; as inv) {
              <div class="p-5 rounded-3xl bg-zinc-950 border border-cyan-500/30 space-y-4 shadow-xl">
                <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <div class="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl shrink-0">
                    {{ inv.icon }}
                  </div>
                  <div>
                    <span class="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      💡 Medical Inventions & Inventor Spotlight
                    </span>
                    <h4 class="text-xs sm:text-sm font-bold text-white font-sans">
                      {{ inv.inventionTitle }}
                    </h4>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span class="text-zinc-500 text-[10px] block">INVENTOR</span>
                    <span class="text-white font-bold">{{ inv.inventorName }}</span>
                    <span class="text-zinc-400 text-[10px] block">({{ inv.inventorLifeYears }})</span>
                  </div>
                  <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span class="text-zinc-500 text-[10px] block">YEAR & ORIGIN</span>
                    <span class="text-white font-bold">{{ inv.yearInvented }}</span>
                    <span class="text-zinc-400 text-[10px] block">{{ inv.countryOfOrigin }}</span>
                  </div>
                  <div class="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                    <span class="text-zinc-500 text-[10px] block">CORE PRINCIPLE</span>
                    <span class="text-cyan-300 font-bold text-[11px]">Non-Invasive Precision</span>
                  </div>
                </div>

                <div class="space-y-2 text-xs font-sans">
                  <div class="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                    <strong class="text-amber-300 font-mono text-[11px]">The Original Prototype:</strong>
                    <p class="text-zinc-300 leading-relaxed text-[11px]">{{ inv.originalPrototypeDescription }}</p>
                  </div>
                  <div class="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                    <strong class="text-emerald-300 font-mono text-[11px]">The Breakthrough Insight:</strong>
                    <p class="text-zinc-300 leading-relaxed text-[11px]">{{ inv.breakthroughInsight }}</p>
                  </div>
                  <div class="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                    <strong class="text-cyan-300 font-mono text-[11px]">Modern Clinical Evolution:</strong>
                    <p class="text-zinc-300 leading-relaxed text-[11px]">{{ inv.modernClinicalEvolution }}</p>
                  </div>
                </div>
              </div>
            }

            <!-- 6. 📊 Empirical Evidence, Verified Citations & Statistical Charts -->
            @if (article.empiricalEvidence; as ee) {
              <div class="p-5 rounded-3xl bg-zinc-950 border border-purple-500/30 space-y-4 shadow-xl">
                <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <div class="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                    📊
                  </div>
                  <div>
                    <span class="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                      Empirical Proof & Peer-Reviewed Science
                    </span>
                    <h4 class="text-xs sm:text-sm font-bold text-white font-sans">
                      Verified Clinical Trials, Statistical Effect Sizes & DOIs
                    </h4>
                  </div>
                </div>

                <!-- Statistical Metric Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  @for (st of ee.stats; track st.label) {
                    <div class="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                      <span class="text-[10px] font-mono text-zinc-400 block">{{ st.label }}</span>
                      <div class="text-base font-black text-white font-mono">{{ st.value }}</div>
                      <div class="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-zinc-800">
                        <span class="text-emerald-400 font-bold">{{ st.delta }}</span>
                        <span class="text-purple-300">{{ st.pValue }}</span>
                      </div>
                    </div>
                  }
                </div>

                <!-- Interactive SVG Trajectory Chart -->
                <div class="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="font-bold text-white">{{ ee.chart.title }}</span>
                    <span class="text-purple-400">{{ ee.chart.unit }}</span>
                  </div>

                  <div class="w-full h-36 relative flex items-end justify-between gap-2 pt-6 pb-2 px-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                    @for (dp of ee.chart.series; track dp.timepoint; let idx = $index) {
                      <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                        <!-- Tooltip -->
                        <div class="absolute -top-7 opacity-0 group-hover:opacity-100 transition px-2 py-0.5 rounded bg-purple-900 text-purple-200 text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none z-20">
                          {{ dp.label }} ({{ dp.value }} {{ ee.chart.unit }})
                        </div>
                        <!-- Bar -->
                        <div class="w-full max-w-[42px] rounded-t-lg transition-all duration-500"
                             [style.height.%]="(dp.value / (ee.chart.targetValue || 100)) * 85"
                             [class.bg-purple-500]="idx < ee.chart.series.length - 1"
                             [class.bg-emerald-400]="idx === ee.chart.series.length - 1">
                        </div>
                        <!-- Label -->
                        <span class="text-[9px] font-mono text-zinc-400 truncate w-full text-center">{{ dp.timepoint }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Citations List -->
                <div class="space-y-2">
                  <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Peer-Reviewed Citations</span>
                  @for (cit of ee.citations; track cit.doi) {
                    <div class="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-sans space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-white">{{ cit.title }}</span>
                        <span class="px-2 py-0.2 text-[9px] font-mono rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {{ cit.evidenceLevel }}
                        </span>
                      </div>
                      <p class="text-[11px] text-zinc-300 leading-relaxed">{{ cit.finding }}</p>
                      <div class="text-[10px] font-mono text-zinc-500 flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-900">
                        <span>📖 {{ cit.journal }} ({{ cit.year }})</span>
                        <span>•</span>
                        <a [href]="'https://doi.org/' + cit.doi" target="_blank" rel="noopener noreferrer"
                           class="text-purple-400 hover:text-purple-300 underline">
                          DOI: {{ cit.doi }}
                        </a>
                        @if (cit.pmid) {
                          <span>•</span>
                          <a [href]="'https://pubmed.ncbi.nlm.nih.gov/' + cit.pmid" target="_blank" rel="noopener noreferrer"
                             class="text-cyan-400 hover:text-cyan-300 underline">
                            PMID: {{ cit.pmid }}
                          </a>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- 7. 🏛️ Historical Perspective & Root-Cause Prevention Lens -->
            @if (article.historicalPerspective; as hp) {
              <div class="p-5 rounded-3xl bg-zinc-950 border border-amber-500/30 space-y-4 shadow-xl">
                <div class="flex items-center gap-3 border-b border-zinc-800 pb-3">
                  <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                    🏛️
                  </div>
                  <div>
                    <span class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                      Historical Wisdom & Prevention Pathways
                    </span>
                    <h4 class="text-xs sm:text-sm font-bold text-white font-sans">
                      {{ hp.tradition }}
                    </h4>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
                  <div class="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1">
                    <strong class="text-amber-300 font-mono text-[11px] block">Ancient Observation:</strong>
                    <p class="text-zinc-300 leading-relaxed text-[11px]">{{ hp.historicalRoot }}</p>
                  </div>
                  <div class="p-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-1">
                    <strong class="text-emerald-300 font-mono text-[11px] block">Modern Scientific Validation:</strong>
                    <p class="text-zinc-300 leading-relaxed text-[11px]">{{ hp.modernValidation }}</p>
                  </div>
                </div>

                <div class="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/40 text-xs font-sans space-y-1">
                  <strong class="text-amber-300 font-mono text-[11px] block">🛡️ Upstream Prevention Pathway:</strong>
                  <p class="text-zinc-200 leading-relaxed text-[11px]">{{ hp.preventionPathway }}</p>
                </div>
              </div>
            }

            <!-- Bottom Action Pearl -->
            <div class="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
              <div class="space-y-0.5">
                <div class="font-bold text-emerald-400">💡 Everyday Breakthrough Pearl</div>
                <div class="text-[11px] text-zinc-300">
                  Daily mechanical and biological care compounds into lifelong vitality and freedom from preventable illness.
                </div>
              </div>
              <button class="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition cursor-pointer whitespace-nowrap">
                Share Article 🕊️
              </button>
            </div>
          }
        </div>

      </div>

    </div>
  `
})
export class ArticlesReaderComponent implements OnInit {
  private articlesService = inject(WordPressArticlesService);
  private bionicReading = inject(BionicReadingService);

  readonly posts = computed(() => this.articlesService.allPosts());
  readonly isLoading = computed(() => this.articlesService.isLoading());
  readonly activePost = computed<IWordPressPost | null>(() => this.articlesService.activePost());

  readonly readingLevel = signal<'standard' | 'grade6'>('standard');
  readonly activeTimelineTab = signal<'present' | 'shortTerm' | 'longTerm'>('present');
  readonly isBionicMode = computed(() => this.bionicReading.isBionicReadingEnabled());
  readonly isSpeaking = signal<boolean>(false);

  readonly formattedBody = computed(() => {
    const post = this.activePost();
    if (!post) return '';
    const level = this.readingLevel();
    const rawHtml = (level === 'grade6' && post.contentGrade6Html) ? post.contentGrade6Html : post.contentHtml;
    
    if (this.isBionicMode()) {
      return this.bionicReading.formatToBionicHtml(rawHtml, 'text-amber-300 font-extrabold');
    }
    return rawHtml;
  });

  ngOnInit(): void {
    // Attempt background sync
    this.articlesService.fetchWordPressArticles();
  }

  getActiveActionStage(cam: any): IActionStage | null {
    const tab = this.activeTimelineTab();
    return cam[tab] || cam.present || null;
  }

  selectArticle(slug: string): void {
    this.stopSpeaking();
    this.articlesService.selectPost(slug);
  }

  syncArticles(): void {
    this.articlesService.fetchWordPressArticles();
  }

  toggleBionic(): void {
    this.bionicReading.toggleBionicReading();
  }

  speakArticle(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in this browser environment.');
      return;
    }

    const post = this.activePost();
    if (!post) return;

    window.speechSynthesis.cancel();
    const cleanText = (this.readingLevel() === 'grade6' && post.contentGrade6Html ? post.contentGrade6Html : post.contentHtml).replace(/<[^>]+>/g, ' ');
    const textToSpeak = `${post.title}. By ${post.authorName}. ${cleanText}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking.set(false);
  }
}
