<?php
/**
 * Main Article Index & Archive Template
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10 flex-1">

    <!-- Hero Header -->
    <div class="text-center space-y-4 max-w-2xl mx-auto py-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
            <span>✨ Everyday Health Literacy & Craft Medicine</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Clear, honest guides to help you take care of what matters.
        </h1>
        <p class="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans">
            No medical jargon or terrifying web diagnoses. Just doctor-backed advice, everyday workshop analogies, and simple steps to stay active and healthy.
        </p>
    </div>

    <!-- SNO-10 Condition Filter Tabs -->
    <?php
    $conditions = get_terms( array(
        'taxonomy'   => 'sno10_condition',
        'hide_empty' => false,
    ) );
    if ( ! empty( $conditions ) && ! is_wp_error( $conditions ) ) : ?>
        <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin text-xs font-mono">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-white font-bold whitespace-nowrap">
                All Guides
            </a>
            <?php foreach ( $conditions as $cond ) : ?>
                <a href="<?php echo esc_url( get_term_link( $cond ) ); ?>" class="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 whitespace-nowrap transition">
                    <?php echo esc_html( $cond->name ); ?>
                </a>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>

    <!-- Articles Grid -->
    <?php if ( have_posts() ) : ?>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php while ( have_posts() ) : the_post(); ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class( 'p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-4 group' ); ?>>
                    
                    <div class="space-y-3">
                        <!-- SNO-10 Tag / Category -->
                        <div class="flex items-center justify-between text-[11px] font-mono">
                            <?php
                            $terms = get_the_terms( get_the_ID(), 'sno10_condition' );
                            if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) : ?>
                                <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                    <?php echo esc_html( $terms[0]->name ); ?>
                                </span>
                            <?php else : ?>
                                <span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                    General Health
                                </span>
                            <?php endif; ?>

                            <span class="text-zinc-500">
                                ⏱️ <?php echo pocketgull_get_reading_time( get_the_ID() ); ?> min read
                            </span>
                        </div>

                        <!-- Post Title -->
                        <h2 class="text-lg font-bold text-white group-hover:text-emerald-400 transition font-sans leading-snug">
                            <a href="<?php the_permalink(); ?>">
                                <?php the_title(); ?>
                            </a>
                        </h2>

                        <!-- Excerpt -->
                        <p class="text-xs text-zinc-400 leading-relaxed font-sans line-clamp-3">
                            <?php echo wp_trim_words( get_the_excerpt(), 25 ); ?>
                        </p>
                    </div>

                    <!-- Author & Date Metadata -->
                    <div class="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px]">
                                👤
                            </div>
                            <span class="text-zinc-300"><?php the_author(); ?></span>
                        </div>
                        <span class="text-zinc-500"><?php echo get_the_date( 'M j, Y' ); ?></span>
                    </div>

                </article>
            <?php endwhile; ?>
        </div>

        <!-- Pagination -->
        <div class="pt-8 flex justify-center text-xs font-mono">
            <?php
            the_posts_pagination( array(
                'mid_size'  => 2,
                'prev_text' => __( '← Newer Guides', 'pocketgull-articles' ),
                'next_text' => __( 'Older Guides →', 'pocketgull-articles' ),
            ) );
            ?>
        </div>

    <?php else : ?>
        <div class="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
            <span class="text-3xl">🕊️</span>
            <h3 class="text-base font-bold text-white font-sans">No Articles Published Yet</h3>
            <p class="text-xs text-zinc-400 max-w-md mx-auto">
                Check back soon or write the first guide to help patients, families, and craftspeople stay healthy!
            </p>
        </div>
    <?php endif; ?>

</main>

<?php get_footer(); ?>
