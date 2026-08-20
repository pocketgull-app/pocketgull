<?php
/**
 * Single Article Reading Template
 *
 * @package PocketGull_Articles
 */

get_header(); ?>

<main class="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 space-y-8">

    <?php while ( have_posts() ) : the_post(); ?>

        <!-- Back Link -->
        <div>
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition inline-flex items-center gap-1">
                ← Back to All Guides
            </a>
        </div>

        <article id="post-<?php the_ID(); ?>" <?php post_class( 'space-y-8' ); ?>>

            <!-- Article Header -->
            <header class="space-y-4 border-b border-zinc-800 pb-8">
                <!-- Taxonomy & Reading Time -->
                <div class="flex items-center gap-3 text-xs font-mono">
                    <?php
                    $terms = get_the_terms( get_the_ID(), 'sno10_condition' );
                    if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) : ?>
                        <span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                            <?php echo esc_html( $terms[0]->name ); ?>
                        </span>
                    <?php endif; ?>
                    <span class="text-zinc-400">
                        ⏱️ <?php echo pocketgull_get_reading_time( get_the_ID() ); ?> min read
                    </span>
                    <span class="text-zinc-600">•</span>
                    <span class="text-zinc-400">
                        Published <?php echo get_the_date( 'F j, Y' ); ?>
                    </span>
                </div>

                <!-- Main Title -->
                <h1 class="text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans leading-tight">
                    <?php the_title(); ?>
                </h1>

                <!-- Author Byline -->
                <div class="flex items-center gap-3 pt-2">
                    <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm shadow-xs">
                        ✍️
                    </div>
                    <div>
                        <div class="text-xs font-bold text-white font-sans"><?php the_author(); ?></div>
                        <div class="text-[11px] text-zinc-400 font-mono">Clinical Knowledge & Health Literacy</div>
                    </div>
                </div>
            </header>

            <!-- Caslon Editorial Content Body -->
            <div class="prose-editorial">
                <?php the_content(); ?>
            </div>

            <!-- Practical Takeaway / Next Action Step Card -->
            <div class="p-6 rounded-3xl bg-zinc-900/90 border border-emerald-500/30 space-y-3 mt-12">
                <div class="flex items-center gap-2 text-emerald-400 font-bold text-sm font-sans">
                    <span>💡</span>
                    <span>What You Can Do Today:</span>
                </div>
                <p class="text-xs text-zinc-300 leading-relaxed font-sans">
                    Small, daily steps add up to big health transformations. Share this guide with a loved one, practice one new tip today, and always consult your trusted physician when adjusting your care plan.
                </p>
                <div class="pt-2 flex items-center gap-3 text-xs font-mono">
                    <a href="https://pocketgull.com" class="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition">
                        Explore in Pocket-Gull App →
                    </a>
                </div>
            </div>

        </article>

    <?php endwhile; ?>

</main>

<?php get_footer(); ?>
