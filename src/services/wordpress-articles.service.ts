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
  },
  {
    id: 104,
    title: 'The Essential Guide to Home Blood Pressure & ECG Monitors: What Actually Matters',
    slug: 'home-blood-pressure-ecg-monitors-guide',
    date: new Date().toISOString(),
    authorName: 'Dr. Gulliver',
    readingTimeMinutes: 5,
    sno10Category: 'Diagnostic Hardware (AHA Class I-A)',
    tags: ['Blood Pressure', 'AFib', 'Medical Devices', 'HSA/FSA'],
    excerpt: 'Why upper-arm oscillometric cuffs outperform wrist monitors, how Lead-I ECGs detect silent AFib, and how to use tax-free HSA/FSA funds on Amazon and Walmart.',
    contentHtml: `
      <p>With thousands of health monitors on Amazon and Walmart, choosing the right tool can feel overwhelming. Clinical trials consistently show that <strong>bicep upper-arm cuffs</strong> are dramatically more accurate than wrist or finger sensors because they measure arterial pressure directly at the level of the tricuspid valve of your heart.</p>
      <h3>What to Look For</h3>
      <ul>
        <li><strong>FDA 510(k) Clearance:</strong> Ensures the device meets clinical validation standards (AAMI/ESH/ISO protocols).</li>
        <li><strong>Integrated Lead-I ECG:</strong> Devices like the Omron Complete or Withings BPM Core simultaneously capture rhythm strips to identify intermittent Atrial Fibrillation (AFib).</li>
        <li><strong>IRS §213(d) HSA/FSA Eligibility:</strong> Blood pressure monitors, pulse oximeters, and smart scales qualify for 100% tax-free purchase with your HSA debit card.</li>
      </ul>
      <blockquote>"Taking two blood pressure readings in the quiet of the morning provides ten times more clinical insight than a rushed reading in a stressful clinic waiting room."</blockquote>
    `
  },
  {
    id: 105,
    title: 'The Science of Sleep Architecture: Magnesium Glycinate vs. Oxide and Delta-Wave Recovery',
    slug: 'science-of-sleep-magnesium-glycinate',
    date: new Date().toISOString(),
    authorName: 'Nightingale',
    readingTimeMinutes: 4,
    sno10Category: 'Orthomolecular & Sleep Science',
    tags: ['Sleep', 'Magnesium', 'Supplements', 'Neurology'],
    excerpt: 'Why chelated magnesium glycinate crosses the blood-brain barrier to modulate GABA receptors, while cheap magnesium oxide passes straight through with only 4% absorption.',
    contentHtml: `
      <p>Not all magnesium is created equal. Most budget multivitamins contain <strong>Magnesium Oxide</strong>, which has an oral bioavailability of only about <strong>4%</strong> and primarily acts as an osmotic laxative.</p>
      <p>In contrast, <strong>Magnesium Glycinate (Bisglycinate)</strong> binds magnesium to glycine—an inhibitory neurotransmitter that crosses into the central nervous system. It gently blocks excitatory NMDA receptors while activating calming GABA-A receptors, prolonging restorative slow-wave (Delta) sleep.</p>
      <p><strong>Third-Party Quality Checklist:</strong> Always look for USP, NSF, or Informed-Sport seals on retail listings to guarantee zero heavy metal contamination and verified label potency.</p>
    `
  },
  {
    id: 106,
    title: 'Vagal Tone & Somatic Regulation: The Clinical Evidence for Acupressure Ear Seeds & Guasha',
    slug: 'vagal-tone-ear-seeds-guasha-evidence',
    date: new Date().toISOString(),
    authorName: 'Peregrine',
    readingTimeMinutes: 5,
    sno10Category: 'Somatic & Meridian Therapy',
    tags: ['TCM', 'Vagus Nerve', 'Acupressure', 'Integrative Medicine'],
    excerpt: 'Stimulating the auricular branch of the vagus nerve (ABVN) with 24k gold ear seeds promotes parasympathetic heart rate variability (HRV) and relieves chronic tension.',
    contentHtml: `
      <p>For centuries, Traditional Chinese Medicine (TCM) has utilized the ear as a microsystem reflecting the entire nervous system. Modern neuro-anatomy now confirms why: the <strong>concha and cymba conchae</strong> of the outer ear are the only places on the human body where the <strong>auricular branch of the Vagus Nerve (CN X)</strong> surfaces directly beneath the skin.</p>
      <p>Applying small 24k gold or vaccaria ear seeds to the <em>Shen Men (Divine Gate)</em> and <em>Vagus reflex points</em> triggers gentle transcutaneous autonomic stimulation, improving nocturnal Heart Rate Variability (HRV) and lowering sympathetic tone.</p>
      <p>Combined with gentle upward Guasha strokes along the trapezius and sternocleidomastoid muscles, somatic therapies provide safe, accessible home tools for managing stress and muscular stiffness.</p>
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
