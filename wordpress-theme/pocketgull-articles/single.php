<?php
/**
 * Single Article Reading Template
 * Matches pocketgull.com styling
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-8">

  <?php while ( have_posts() ) : the_post(); ?>

    <!-- Back Button -->
    <div>
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-xs font-pocketgull-mono text-amber-300 hover:text-amber-200 transition inline-flex items-center gap-1.5 font-bold">
        ← Back to All Guides
      </a>
    </div>

    <article id="post-<?php the_ID(); ?>" <?php post_class( 'glass-card-dark p-8 sm:p-12 rounded-3xl space-y-8 shadow-2xl' ); ?>>

      <!-- Article Header -->
      <header class="space-y-4 border-b border-stone-800 pb-8">
        <div class="flex items-center gap-3 text-xs font-pocketgull-mono">
          <?php
          $terms = get_the_terms( get_the_ID(), 'sno10_condition' );
          if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) : ?>
            <span class="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
              <?php echo esc_html( $terms[0]->name ); ?>
            </span>
          <?php endif; ?>
          <span class="text-stone-400">⏱️ <?php echo pocketgull_get_reading_time( get_the_ID() ); ?> min read</span>
          <span class="text-stone-600">•</span>
          <span class="text-stone-400">Published <?php echo get_the_date( 'F j, Y' ); ?></span>
        </div>

        <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-pocketgull leading-tight">
          <?php the_title(); ?>
        </h1>

        <!-- Author Byline: Phil -->
        <div class="flex items-center gap-3 pt-2">
          <div class="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm font-bold text-amber-300 font-sans shadow-xs">
            P
          </div>
          <div>
            <div class="text-xs font-bold text-white font-sans">Phil</div>
            <div class="text-[10px] text-stone-400 font-pocketgull-mono">Health Literacy & Preventive Care</div>
          </div>
        </div>
      </header>

      <!-- Content Body -->
      <div class="prose-editorial text-stone-200 leading-relaxed font-sans space-y-5 text-base sm:text-lg">
        <?php the_content(); ?>
      </div>

      <!-- Action Footer -->
      <div class="p-6 rounded-2xl bg-stone-900/90 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
        <div class="space-y-1">
          <div class="font-bold text-amber-300 font-pocketgull text-sm">💡 Actionable Health Pearl</div>
          <p class="text-xs text-stone-300 leading-relaxed">
            Prevention is the most powerful tool we have. Share this guide with a loved one, and always consult your doctor with questions.
          </p>
        </div>
        <a href="https://pocketgull.com" class="geararts-card px-5 py-2.5 rounded-xl text-stone-950 font-bold font-sans transition hover:scale-105 text-xs whitespace-nowrap shadow-md">
          Explore PocketGull App →
        </a>
      </div>

    </article>

  <?php endwhile; ?>

</main>

<?php get_footer(); ?>
