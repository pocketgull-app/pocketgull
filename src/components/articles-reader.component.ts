import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WordPressArticlesService, IWordPressPost } from '../services/wordpress-articles.service';

@Component({
  selector: 'app-articles-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-xs">
            📰
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-black tracking-wider text-white font-sans">
                Pocket-Gull Articles & Clinical Knowledge Hub
              </h3>
              <span class="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                WordPress REST API + Offline
              </span>
            </div>
            <p class="text-xs text-zinc-400">
              Everyday health literacy, SNO-10 craft analogies, prevention economics, and caregiver guides.
            </p>
          </div>
        </div>

        <!-- Sync Button -->
        <div class="flex items-center gap-2">
          <button (click)="syncArticles()"
                  [disabled]="isLoading()"
                  class="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-xs font-mono text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5">
            <span [class.animate-spin]="isLoading()">🔄</span>
            <span>Sync WordPress</span>
          </button>
          <a href="https://pocketgull.com/articles" target="_blank" rel="noopener noreferrer"
             class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-sans transition">
            View Live Site ↗
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

          <div class="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
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

        <!-- Right: Distraction-Free Caslon Reader -->
        <div class="lg:col-span-8 p-6 rounded-3xl bg-zinc-900/40 border border-zinc-800 space-y-6">
          @if (activePost(); as article) {
            <!-- Article Header -->
            <div class="space-y-3 border-b border-zinc-800 pb-5">
              <div class="flex items-center gap-2 text-xs font-mono">
                <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {{ article.sno10Category }}
                </span>
                <span class="text-zinc-500">•</span>
                <span class="text-zinc-400">⏱️ {{ article.readingTimeMinutes }} min read</span>
                <span class="text-zinc-500">•</span>
                <span class="text-zinc-400">By {{ article.authorName }}</span>
              </div>

              <h2 class="text-xl sm:text-2xl font-bold text-white font-sans tracking-tight leading-tight">
                {{ article.title }}
              </h2>
            </div>

            <!-- Caslon Prose Body -->
            <div class="text-sm sm:text-base leading-relaxed text-zinc-200 space-y-4 font-serif"
                 [innerHTML]="article.contentHtml">
            </div>

            <!-- Bottom Action Pearl -->
            <div class="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div class="space-y-0.5">
                <div class="font-bold text-emerald-400 font-sans">💡 Everyday Health Pearl</div>
                <div class="text-[11px] text-zinc-300 font-sans">
                  Small, daily steps add up to big health transformations. Share this guide with a loved one!
                </div>
              </div>
              <button class="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition font-sans cursor-pointer whitespace-nowrap">
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

  readonly posts = computed(() => this.articlesService.allPosts());
  readonly isLoading = computed(() => this.articlesService.isLoading());
  readonly activePost = computed<IWordPressPost | null>(() => this.articlesService.activePost());

  ngOnInit(): void {
    // Attempt background sync
    this.articlesService.fetchWordPressArticles();
  }

  selectArticle(slug: string): void {
    this.articlesService.selectPost(slug);
  }

  syncArticles(): void {
    this.articlesService.fetchWordPressArticles();
  }
}
