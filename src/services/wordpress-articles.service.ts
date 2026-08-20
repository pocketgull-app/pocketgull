import { Injectable, signal, computed } from '@angular/core';

export interface IWordPressPost {
  id: number | string;
  title: string;
  slug: string;
  contentHtml: string;
  excerpt: string;
  date: string;
  authorName: string;
  readingTimeMinutes: number;
  sno10Category?: string;
  tags: string[];
}

export const FALLBACK_SEED_ARTICLES: IWordPressPost[] = [
  {
    id: 101,
    title: 'Keeping Their Craft Alive: How to Honor Someone You Miss by Picking Up Their Tools',
    slug: 'keeping-their-craft-alive',
    date: new Date().toISOString(),
    authorName: 'Phil',
    readingTimeMinutes: 4,
    sno10Category: 'Bereavement & Craft Continuity',
    tags: ['Bereavement', 'Craftsmanship', 'Mental Health'],
    excerpt: 'There is a particular kind of quiet that settles over a workshop when the person who built it is gone. Picking up their tools carries their craft and wisdom forward.',
    contentHtml: `
      <p>There is a particular kind of quiet that settles over a workshop when the person who built it is gone. The 9/16 wrench still hangs in the exact spot they left it. The smell of cedar shavings and motor oil lingers in the rafters.</p>
      <p>For a long time, walking into that room feels heavy. You might look at an unfinished engine or a half-turned piece of walnut on the lathe and feel like you shouldn't touch it. But the things they taught you—<em>measure twice, take your time, don't force the threads</em>—weren't just about wood or engines. They were about life.</p>
      <blockquote>"Picking up their tools isn't about moving on; it’s about carrying their craft forward."</blockquote>
      <p>When you step into the garage, tune the carburetor, or water the heirloom tomato plants they tended for decades, you aren't alone. You are participating in a living lineage of care, patience, and craftsmanship.</p>
    `
  },
  {
    id: 102,
    title: 'The 2-Flight-of-Stairs Rule: Staying Safe and Close with Your Partner After a Heart Attack',
    slug: 'cardiovascular-intimacy-safety-princeton-iii',
    date: new Date().toISOString(),
    authorName: 'Phil',
    readingTimeMinutes: 5,
    sno10Category: 'Cardiovascular Safety (I25.2)',
    tags: ['Cardiology', 'Princeton-III', 'Relationships'],
    excerpt: 'Cardiologists use the Princeton Consensus III guidelines: if you can comfortably ascend 2 flights of stairs (~4 METs), you have achieved the safe threshold for intimacy.',
    contentHtml: `
      <p>After a heart attack, stent placement, or cardiac surgery, one of the biggest questions couples have is also the one they feel most embarrassed to ask: <em>When is it safe to be intimate again?</em></p>
      <p>Cardiologists use a trusted guideline known as the <strong>Princeton Consensus III</strong>. If you can comfortably walk up <strong>two flights of stairs</strong> without chest tightness, dizziness, or severe breathlessness, your heart is performing at roughly <strong>4 METs (Metabolic Equivalents)</strong>—the exact exertion level needed for intimacy.</p>
      <p><strong>Critical Medication Safety:</strong> Never combine prescription Nitrates (Nitroglycerin, Isosorbide) with PDE-5 inhibitors (Viagra, Cialis). Maintain at least 24 to 48 hours separation to prevent dangerous hypotensive collapse.</p>
    `
  },
  {
    id: 103,
    title: 'The $100,000 Oil Change: How Daily Prevention Heals More Than Just Yourself',
    slug: 'the-100000-dollar-oil-change',
    date: new Date().toISOString(),
    authorName: 'Phil',
    readingTimeMinutes: 4,
    sno10Category: 'Preventive Nephrology (N18.9)',
    tags: ['Prevention', 'Kidney Health', 'Health Economics'],
    excerpt: 'Catching blood pressure early and protecting renal filtration preserves independence and averts $100,000/year dialysis costs, healing the national balance sheet.',
    contentHtml: `
      <p>Every mechanic knows that a $40 oil filter can save you from a blown $10,000 engine block. Our bodies operate under the exact same mechanical principles.</p>
      <p>When blood pressure runs high, it acts like hydraulic over-pressure against the delicate glomeruli filters of your kidneys. Preventing kidney failure avoids dialysis—which costs over $90,000 to $100,000 every single year per patient.</p>
      <blockquote>"When you take care of your body's engine, you aren't just saving yourself from the hospital—you are strengthening your family and healing our nation's healthcare balance sheet from the ground up."</blockquote>
    `
  }
];

@Injectable({
  providedIn: 'root'
})
export class WordPressArticlesService {
  private posts = signal<IWordPressPost[]>(FALLBACK_SEED_ARTICLES);
  private loading = signal<boolean>(false);
  private selectedPostSlug = signal<string | null>(null);

  readonly allPosts = computed(() => this.posts());
  readonly isLoading = computed(() => this.loading());
  readonly activePost = computed(() => {
    const slug = this.selectedPostSlug();
    if (!slug) return this.posts()[0] || null;
    return this.posts().find(p => p.slug === slug) || this.posts()[0] || null;
  });

  public selectPost(slug: string): void {
    this.selectedPostSlug.set(slug);
  }

  public clearSelection(): void {
    this.selectedPostSlug.set(null);
  }

  /**
   * Fetches articles from WordPress REST API endpoint (with automatic fallback to offline seeds).
   */
  public async fetchWordPressArticles(apiUrl = 'https://wordpress.pocketgull.com/wp-json/wp/v2/posts'): Promise<IWordPressPost[]> {
    this.loading.set(true);
    try {
      const response = await fetch(`${apiUrl}?_embed&per_page=20`);
      if (!response.ok) {
        throw new Error(`WordPress REST API returned HTTP ${response.status}`);
      }
      const rawPosts = await response.json();
      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const mapped: IWordPressPost[] = rawPosts.map((p: any) => ({
          id: p.id,
          title: p.title?.rendered || 'Untitled Article',
          slug: p.slug || 'article-' + p.id,
          contentHtml: p.content?.rendered || '',
          excerpt: (p.excerpt?.rendered || '').replace(/<[^>]*>?/gm, '').trim(),
          date: p.date || new Date().toISOString(),
          authorName: p._embedded?.author?.[0]?.name || 'Pocket-Gull Editorial',
          readingTimeMinutes: p.reading_time_minutes || Math.ceil((p.content?.rendered || '').split(/\s+/).length / 200),
          tags: []
        }));
        this.posts.set(mapped);
        return mapped;
      }
    } catch {
      // Graceful offline fallback
      this.posts.set(FALLBACK_SEED_ARTICLES);
    } finally {
      this.loading.set(false);
    }
    return this.posts();
  }
}
