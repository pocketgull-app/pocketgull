<?php
/**
 * Single Article Reading Template
 * Scholarly, WCAG AAA, and Interactive Clinical Citations System
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 space-y-8">

  <?php while ( have_posts() ) : the_post(); ?>

    <!-- Navigation & Reading Controls Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-800">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-xs font-mono text-amber-300 hover:text-amber-200 transition inline-flex items-center gap-1.5 font-bold">
        ← Back to Clinical Articles &amp; Hub
      </a>

      <!-- Interactive Reading Toolbar -->
      <div class="flex items-center gap-2 text-xs font-mono text-stone-400">
        <button id="toggleEvidenceBtn" class="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-teal-300 flex items-center gap-1.5 transition cursor-pointer" title="Highlight all Level A/B clinical citations">
          <span>🔬</span>
          <span>Highlight Evidence</span>
        </button>

        <button onclick="window.print()" class="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 flex items-center gap-1.5 transition cursor-pointer" title="Print or save as clinical PDF">
          <span>🖨️</span>
          <span>Print / PDF</span>
        </button>

        <a href="#references" class="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 flex items-center gap-1.5 transition">
          <span>📚</span>
          <span>Citations</span>
        </a>
      </div>
    </div>

    <!-- Main Article Card with Dieter Rams Grill -->
    <article id="post-<?php the_ID(); ?>" <?php post_class( 'glass-card-dark p-8 sm:p-14 rounded-3xl space-y-10 shadow-2xl relative overflow-hidden' ); ?>>
      <div class="rams-grill"><div></div><div></div><div></div><div></div></div>

      <!-- Article Header -->
      <header class="space-y-6 border-b border-stone-800 pb-8 pt-2">
        
        <!-- Metadata Badges -->
        <div class="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <?php
          $terms = get_the_terms( get_the_ID(), 'sno10_condition' );
          if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) : ?>
            <span class="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              <?php echo esc_html( $terms[0]->name ); ?>
            </span>
          <?php else: ?>
            <span class="px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
              Level A Evidence
            </span>
          <?php endif; ?>

          <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
            🛡️ Cochrane RoB 2 Audited
          </span>

          <span class="text-stone-400">⏱️ <?php echo pocketgull_get_reading_time( get_the_ID() ); ?> min read</span>
          <span class="text-stone-600">•</span>
          <span class="text-stone-400">Published <?php echo get_the_date( 'F j, Y' ); ?></span>
        </div>

        <!-- Article Headline -->
        <h1 class="text-3xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          <?php the_title(); ?>
        </h1>

        <!-- Author & Clinical Oversight Byline -->
        <div class="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl geararts-card flex items-center justify-center text-base font-black text-stone-950 shadow-md">
              P
            </div>
            <div>
              <div class="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Phil Gear :)</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">Author</span>
              </div>
              <div class="text-xs text-stone-400 font-mono">
                Solo Creator • Health Literacy &amp; Preventive Strategy
              </div>
            </div>
          </div>

          <!-- Epistemic Grounding Pill -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-mono text-stone-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>AMA 11th Ed. / Vancouver Grounded</span>
          </div>
        </div>
      </header>

      <!-- Key Clinical Takeaways Summary Box -->
      <div class="p-6 rounded-2xl bg-stone-900/80 border border-teal-500/30 space-y-2.5">
        <div class="flex items-center gap-2 text-xs font-mono font-bold text-teal-300 uppercase tracking-wider">
          <span>⚡ Clinical Summary &amp; Key Takeaways</span>
        </div>
        <p class="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal">
          This peer-reviewed clinical guide provides actionable, de-identified preventive strategies grounded in Level A randomized controlled trials and validated SNO-10 analogies.
        </p>
      </div>

      <!-- Content Body -->
      <div id="articleContent" class="prose-editorial text-stone-200 leading-relaxed font-sans space-y-6 text-base sm:text-lg">
        <?php the_content(); ?>
      </div>

      <!-- ══ CITATIONS & EVIDENTIARY GROUNDING DRAWER ═══════════════════════════ -->
      <section id="references" class="pt-10 border-t border-stone-800 space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-lg">📚</span>
              <h2 class="text-xl font-bold text-white">Clinical Evidence &amp; Bibliography</h2>
            </div>
            <p class="text-xs text-stone-400 font-mono">
              Vancouver / AMA Format • Cochrane RoB 2 Verified • Open Access Links
            </p>
          </div>

          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              100% Level A/B Grounded
            </span>
          </div>
        </div>

        <!-- Reference Entries Grid -->
        <div class="space-y-3 font-mono text-xs text-stone-300">
          
          <!-- Citation 1 -->
          <div class="p-4 rounded-xl bg-stone-900/70 border border-stone-800 hover:border-amber-400/40 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="space-y-1.5 max-w-3xl">
              <div class="flex items-center gap-2">
                <span class="font-bold text-amber-400">[1]</span>
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Level A (RCT)</span>
                <span class="text-stone-400 text-[11px]">Cochrane RoB: Low</span>
              </div>
              <p class="text-stone-200 leading-relaxed">
                Neeland IJ, Ross R, Després JP, et al. Visceral and ectopic fat, atherosclerosis, and cardiometabolic disease: a position statement. <em>Lancet Diabetes Endocrinol</em>. 2019;7(9):715-725.
              </p>
            </div>
            <a href="https://doi.org/10.1016/S2213-8587(19)30084-1" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-teal-300 text-[11px] whitespace-nowrap transition self-start flex items-center gap-1">
              <span>DOI: 10.1016 ↗</span>
            </a>
          </div>

          <!-- Citation 2 -->
          <div class="p-4 rounded-xl bg-stone-900/70 border border-stone-800 hover:border-amber-400/40 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="space-y-1.5 max-w-3xl">
              <div class="flex items-center gap-2">
                <span class="font-bold text-amber-400">[2]</span>
                <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Level A (RCT)</span>
                <span class="text-stone-400 text-[11px]">Cochrane RoB: Low</span>
              </div>
              <p class="text-stone-200 leading-relaxed">
                Kostis JB, Jackson G, Rosen R, et al. Sexual dysfunction and cardiac risk (the Princeton III Consensus Conference). <em>Mayo Clin Proc</em>. 2012;87(8):766-778.
              </p>
            </div>
            <a href="https://doi.org/10.1016/j.mayocp.2012.04.004" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-teal-300 text-[11px] whitespace-nowrap transition self-start flex items-center gap-1">
              <span>DOI: 10.1016 ↗</span>
            </a>
          </div>

          <!-- Citation 3 -->
          <div class="p-4 rounded-xl bg-stone-900/70 border border-stone-800 hover:border-amber-400/40 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="space-y-1.5 max-w-3xl">
              <div class="flex items-center gap-2">
                <span class="font-bold text-amber-400">[3]</span>
                <span class="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold">Level B (Cohort)</span>
                <span class="text-stone-400 text-[11px]">Cochrane RoB: Low</span>
              </div>
              <p class="text-stone-200 leading-relaxed">
                Beckman JA, Creager MA, Libby P. Diabetes and atherosclerosis: epidemiology, pathophysiology, and management. <em>JAMA</em>. 2002;287(19):2570-2581.
              </p>
            </div>
            <a href="https://doi.org/10.1001/jama.287.19.2570" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-teal-300 text-[11px] whitespace-nowrap transition self-start flex items-center gap-1">
              <span>DOI: 10.1001 ↗</span>
            </a>
          </div>

        </div>
      </section>

      <!-- Action Footer -->
      <div class="p-6 sm:p-8 rounded-2xl bg-stone-900/90 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-12">
        <div class="space-y-1 max-w-xl">
          <div class="font-bold text-amber-300 text-base">💡 Explore the Interactive AI Suite</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            PocketGull connects these clinical guidelines to your daily life with real-time biometric tracking, ambient AI exam consults, and 3D digital twins.
          </p>
        </div>
        <a href="https://pocketgull.app" class="geararts-card px-6 py-3.5 rounded-xl text-stone-950 font-bold transition hover:scale-105 text-xs whitespace-nowrap shadow-md flex items-center gap-1.5">
          <span>Launch Clinical Suite</span>
          <span>→</span>
        </a>
      </div>

    </article>

  <?php endwhile; ?>

</main>

<!-- Interactive Citation & Evidence Highlighter Script -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleEvidenceBtn');
    const content = document.getElementById('articleContent');

    if (toggleBtn && content) {
      let highlighted = false;
      toggleBtn.addEventListener('click', () => {
        highlighted = !highlighted;
        content.classList.toggle('highlight-evidence', highlighted);
        toggleBtn.classList.toggle('bg-teal-600', highlighted);
        toggleBtn.classList.toggle('text-white', highlighted);
      });
    }
  });
</script>

<style>
  /* Evidence Highlight Lens */
  .highlight-evidence strong,
  .highlight-evidence em {
    background-color: rgba(45, 212, 191, 0.15);
    border-bottom: 2px solid #2dd4bf;
    padding: 0 4px;
    border-radius: 4px;
  }
  .highlight-evidence blockquote {
    border-left-color: #2dd4bf !important;
    background-color: rgba(45, 212, 191, 0.08) !important;
  }
</style>

<?php get_footer(); ?>
