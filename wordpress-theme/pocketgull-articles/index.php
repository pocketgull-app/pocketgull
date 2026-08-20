<?php
/**
 * Main Article Index & Archive Template
 * Matches pocketgull.com styling
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 flex-1">

  <!-- Hero Section -->
  <div class="text-center space-y-4 max-w-3xl mx-auto py-8">
    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-pocketgull-mono font-bold">
      <span>✨ Health Literacy & Preventive Knowledge</span>
    </div>
    
    <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-pocketgull leading-tight">
      Empowering everyday people to take care of what matters.
    </h1>
    
    <p class="text-base sm:text-lg text-stone-300 leading-relaxed font-sans max-w-2xl mx-auto">
      Clear, honest medical guides written by Phil. No complex jargon or terrifying searches—just practical advice, everyday analogies, and actionable steps to stay healthy.
    </p>
  </div>

  <!-- Articles Grid -->
  <?php if ( have_posts() ) : ?>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <?php while ( have_posts() ) : the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class( 'glass-card-dark p-7 rounded-3xl transition duration-300 hover:border-amber-400/60 flex flex-col justify-between space-y-6 group shadow-xl' ); ?>>
          
          <div class="space-y-4">
            <!-- Taxonomy Tag & Reading Time -->
            <div class="flex items-center justify-between text-xs font-pocketgull-mono">
              <?php
              $terms = get_the_terms( get_the_ID(), 'sno10_condition' );
              if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) : ?>
                <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  <?php echo esc_html( $terms[0]->name ); ?>
                </span>
              <?php else : ?>
                <span class="px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold">
                  General Prevention
                </span>
              <?php endif; ?>

              <span class="text-stone-400">
                ⏱️ <?php echo pocketgull_get_reading_time( get_the_ID() ); ?> min read
              </span>
            </div>

            <!-- Title -->
            <h2 class="text-xl font-bold text-white group-hover:text-amber-300 transition font-pocketgull leading-snug">
              <a href="<?php the_permalink(); ?>">
                <?php the_title(); ?>
              </a>
            </h2>

            <!-- Excerpt -->
            <p class="text-sm text-stone-300 leading-relaxed font-sans line-clamp-3">
              <?php echo wp_trim_words( get_the_excerpt(), 28 ); ?>
            </p>
          </div>

          <!-- Author & Footer Info -->
          <div class="pt-5 border-t border-stone-800 flex items-center justify-between text-xs font-pocketgull-mono">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs text-amber-300 font-bold font-sans">
                P
              </div>
              <span class="text-stone-200 font-bold">Phil</span>
            </div>
            <span class="text-stone-400"><?php echo get_the_date( 'M j, Y' ); ?></span>
          </div>

        </article>
      <?php endwhile; ?>
    </div>

    <!-- Pagination -->
    <div class="pt-10 flex justify-center text-xs font-pocketgull-mono">
      <?php
      the_posts_pagination( array(
        'mid_size'  => 2,
        'prev_text' => __( '← Newer Articles', 'pocketgull-articles' ),
        'next_text' => __( 'Older Articles →', 'pocketgull-articles' ),
      ) );
      ?>
    </div>

  <?php else : ?>
    <div class="glass-card-dark p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
      <span class="text-4xl">🕊️</span>
      <h3 class="text-xl font-bold text-white font-pocketgull">No Articles Published Yet</h3>
      <p class="text-sm text-stone-300 leading-relaxed">
        Write your first article from the WordPress dashboard or run <code class="px-2 py-0.5 rounded bg-stone-900 text-amber-300 font-mono text-xs">npm run wp:publish</code>!
      </p>
    </div>
  <?php endif; ?>

</main>

<?php get_footer(); ?>
