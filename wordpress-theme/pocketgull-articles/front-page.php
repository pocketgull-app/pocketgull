<?php
/**
 * Front Page Template for WordPress Theme (pocketgull.com)
 * Incorporates all content and features from the Business Site
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="relative z-10 flex-grow space-y-20 py-12 px-4 sm:px-6 max-w-7xl mx-auto">

  <!-- 1. Handcrafted GEARARTS Card & Hero Section -->
  <section class="text-center max-w-5xl mx-auto pt-6 pb-12">
    
    <!-- GEARARTS Card -->
    <div class="max-w-xl mx-auto mb-12 text-center">
      <div class="geararts-card p-8 rounded-3xl relative overflow-hidden text-stone-950 shadow-2xl border-4 border-amber-300/50">
        
        <!-- Banner inside card -->
        <div class="bg-gradient-to-r from-teal-600 to-rose-500 text-white rounded-xl p-3 mb-6 text-center shadow-md border border-white/20">
          <div class="font-bold text-2xl tracking-wider uppercase font-pocketgull">GEARARTS</div>
          <div class="text-[10px] tracking-tight uppercase font-semibold">Creating a Sustainable Future Through Art and Technology</div>
        </div>

        <!-- QR Code Graphic Mockup -->
        <div class="w-44 h-44 mx-auto my-5 rounded-2xl bg-stone-950 p-3 shadow-inner flex flex-col justify-between relative overflow-hidden border-2 border-stone-800">
          <div class="absolute inset-0 grid grid-cols-2">
            <div class="bg-teal-500/25 p-2 flex flex-col justify-between border-r border-stone-800">
              <div class="w-8 h-8 border-4 border-teal-400 rounded-lg"></div>
              <div class="w-8 h-8 border-4 border-teal-400 rounded-lg"></div>
            </div>
            <div class="bg-rose-500/25 p-2 flex flex-col justify-between items-end">
              <div class="w-8 h-8 border-4 border-rose-400 rounded-lg"></div>
              <div class="w-5 h-5 bg-rose-400 rounded"></div>
            </div>
          </div>
          <div class="relative z-10 text-center font-pocketgull text-xs text-stone-300 font-bold bg-stone-950/90 py-1 rounded border border-stone-700">POCKETGULL AI</div>
        </div>

        <div class="text-2xl sm:text-3xl font-extrabold text-stone-950 uppercase tracking-tight font-pocketgull">
          PocketGull
        </div>
        <div class="text-xs font-bold text-stone-800 uppercase tracking-widest mt-1 font-pocketgull-mono">
          Clinical Intelligence Strategy Engine
        </div>
      </div>
    </div>

    <!-- Main Title & Copy -->
    <h1 class="text-4xl sm:text-6xl font-extrabold font-pocketgull tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
      Where <span class="text-teal-400">Artistic Craft</span> Meets <span class="text-rose-400">Medical AI Intelligence</span>
    </h1>

    <p class="text-base sm:text-xl text-stone-300 mb-10 max-w-3xl mx-auto leading-relaxed font-sans">
      PocketGull is the live co-pilot for the modern exam room and home care—reducing administrative charting overhead by <strong class="text-amber-400">42%</strong> using the open-source <strong class="text-teal-300">PocketGull Typeface</strong> and Google Gemini.
    </p>

    <!-- Search Card -->
    <div class="max-w-2xl mx-auto mb-10 text-left">
      <div class="glass-card-dark rounded-3xl p-6 shadow-2xl border-2 border-amber-500/40">
        <div class="flex items-center gap-3 mb-4 px-1">
          <div class="w-3 h-3 rounded-full bg-teal-400"></div>
          <div class="w-3 h-3 rounded-full bg-rose-400"></div>
          <span class="text-base font-bold font-pocketgull text-stone-200">GenAI Clinical Knowledge Search Engine</span>
          <span class="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full ml-auto font-semibold">28 Indexed Papers</span>
        </div>
        
        <form method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>" class="relative">
          <input type="text" name="s" placeholder="Search medical research, PocketGull Typeface, or prevention guides..." class="w-full bg-stone-900 border-2 border-stone-700 rounded-2xl px-5 py-4 text-sm sm:text-base text-stone-100 placeholder-stone-500 focus:outline-hidden focus:border-amber-400 transition-all font-pocketgull pr-32" />
          <button type="submit" class="absolute right-2 top-2 bottom-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl px-4 transition-colors flex items-center justify-center font-sans text-xs sm:text-sm cursor-pointer">
            Search Articles
          </button>
        </form>
      </div>
    </div>

  </section>

  <!-- 2. Latest Articles & Health Literacy Guides -->
  <section class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-5">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-pocketgull-mono font-bold">
          <span>📰 Featured Health Guides</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white font-pocketgull mt-2">
          Published Articles & Clinical Insights
        </h2>
      </div>
      <span class="text-xs text-stone-400 font-pocketgull-mono">Curated by Phil</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <?php
      $recent_posts = new WP_Query( array(
        'posts_per_page' => 6,
        'post_status'    => 'publish'
      ) );

      if ( $recent_posts->have_posts() ) :
        while ( $recent_posts->have_posts() ) : $recent_posts->the_post(); ?>
          <article class="glass-card-dark p-7 rounded-3xl transition duration-300 hover:border-amber-400/60 flex flex-col justify-between space-y-6 group shadow-xl">
            <div class="space-y-4">
              <div class="flex items-center justify-between text-xs font-pocketgull-mono">
                <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  SNO-10 Guide
                </span>
                <span class="text-stone-400">⏱️ <?php echo pocketgull_get_reading_time( get_the_ID() ); ?>m read</span>
              </div>
              <h3 class="text-xl font-bold text-white group-hover:text-amber-300 transition font-pocketgull leading-snug">
                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
              </h3>
              <p class="text-sm text-stone-300 leading-relaxed font-sans line-clamp-3">
                <?php echo wp_trim_words( get_the_excerpt(), 25 ); ?>
              </p>
            </div>
            <div class="pt-5 border-t border-stone-800 flex items-center justify-between text-xs font-pocketgull-mono">
              <span class="text-stone-200 font-bold">✍️ Phil</span>
              <span class="text-stone-400"><?php echo get_the_date( 'M j, Y' ); ?></span>
            </div>
          </article>
        <?php endwhile;
        wp_reset_postdata();
      endif; ?>
    </div>
  </section>

  <!-- 3. The Custom Open-Source PocketGull Typeface Spec Section -->
  <section id="typeface" class="glass-card-dark p-8 sm:p-12 rounded-3xl space-y-8 border-2 border-teal-500/30">
    <div class="max-w-3xl space-y-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-pocketgull-mono font-bold">
        <span>🖋️ SIL Open Font License 1.1</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-pocketgull">
        The PocketGull Typeface Family
      </h2>
      <p class="text-stone-300 font-sans leading-relaxed">
        Engineered specifically for high-stress medical environments, the PocketGull font family enforces unambiguous glyph differentiation (slashed zero <code class="text-teal-300">0</code>, curved lowercase <code class="text-teal-300">l</code>, and serifed capital <code class="text-teal-300">I</code>) to eliminate dosage and medication errors.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs font-pocketgull-mono">
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
        <div class="text-teal-400 font-bold text-sm">WCAG AAA Compliance</div>
        <p class="text-stone-400 leading-relaxed font-sans">Guaranteed 7.0:1 minimum contrast against dark obsidian backgrounds for LogMAR 0.0 legibility.</p>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
        <div class="text-amber-400 font-bold text-sm">ISMP Disambiguation</div>
        <p class="text-stone-400 leading-relaxed font-sans">Strictly prevents Tall Man lettering confusion between Look-Alike Sound-Alike (LASA) medications.</p>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
        <div class="text-rose-400 font-bold text-sm">SNO-10 Integration</div>
        <p class="text-stone-400 leading-relaxed font-sans">Bridges clinical SNOMED-CT codes with everyday workshop analogies for seamless patient education.</p>
      </div>
    </div>
  </section>

  <!-- 4. Dieter Rams 10 Principles of Good Design Section -->
  <section id="rams" class="glass-card-dark p-8 sm:p-12 rounded-3xl space-y-8 border-2 border-amber-500/30">
    <div class="max-w-3xl space-y-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-pocketgull-mono font-bold">
        <span>📐 Industrial Grace & Ergonomics</span>
      </div>
      <h2 class="text-3xl sm:text-4xl font-extrabold text-white font-pocketgull">
        Dieter Rams: 10 Principles of Good Clinical Design
      </h2>
      <p class="text-stone-300 font-sans leading-relaxed">
        Good healthcare software should be unobtrusive, honest, and stripped of unnecessary clutter. "Less, but better" applied to medical intelligence.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 text-xs font-sans">
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5">
        <div class="font-bold text-amber-300 font-pocketgull-mono">1. Innovative</div>
        <p class="text-stone-400">Powered by Gemini 2.5 streaming and WebAssembly edge compute.</p>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5">
        <div class="font-bold text-teal-300 font-pocketgull-mono">2. Useful</div>
        <p class="text-stone-400">Reduces administrative burden so clinicians focus on the patient.</p>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5">
        <div class="font-bold text-rose-300 font-pocketgull-mono">3. Aesthetic</div>
        <p class="text-stone-400">Harmonious dark canvas with optical kerning and living circadian rhythms.</p>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5">
        <div class="font-bold text-amber-300 font-pocketgull-mono">4. Understandable</div>
        <p class="text-stone-400">Self-explanatory SNO-10 analogy cards at Grade 6.2 reading level.</p>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5">
        <div class="font-bold text-teal-300 font-pocketgull-mono">5. Unobtrusive</div>
        <p class="text-stone-400">Leaves room for the human doctor-patient bond.</p>
      </div>
      <div class="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5">
        <div class="font-bold text-rose-300 font-pocketgull-mono">6. Honest</div>
        <p class="text-stone-400">Popperian null-hypothesis testing and Cochrane Risk of Bias transparency.</p>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>
