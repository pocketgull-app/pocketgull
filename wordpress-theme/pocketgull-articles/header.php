<!DOCTYPE html>
<html <?php language_attributes(); ?> class="dark">
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#09090b">
    <?php wp_head(); ?>
</head>
<body <?php body_class( 'bg-zinc-950 text-zinc-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-zinc-950' ); ?>>

<!-- Pocket-Gull Global Masthead -->
<header class="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        
        <!-- Brand Logo & Title -->
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex items-center gap-3 group">
            <!-- Origami Seagull Brand Icon -->
            <div class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-emerald-500/50 flex items-center justify-center transition shadow-xs">
                <svg viewBox="0 0 100 100" class="w-6 h-6 transform group-hover:scale-110 transition">
                    <!-- Geometric Origami Seagull Polygons -->
                    <polygon points="50,15 85,55 50,45" fill="#FFFFFF" opacity="0.95" />
                    <polygon points="50,15 15,55 50,45" fill="#E6F0FA" opacity="0.9" />
                    <polygon points="50,45 85,55 50,85" fill="#C5D9ED" opacity="0.85" />
                    <polygon points="50,45 15,55 50,85" fill="#A8C7E0" opacity="0.8" />
                    <polygon points="50,15 56,10 50,18" fill="#34A853" /> <!-- Green Beak -->
                </svg>
            </div>
            <div>
                <span class="text-base font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                    Pocket-Gull <span class="text-xs font-mono font-normal text-emerald-400">/articles</span>
                </span>
                <span class="text-[10px] text-zinc-400 block font-mono">Clinical Health Literacy & Craft Knowledge</span>
            </div>
        </a>

        <!-- Header Actions & Navigation -->
        <nav class="flex items-center gap-4 text-xs font-mono">
            <a href="https://pocketgull.com" class="hidden sm:inline-block text-zinc-400 hover:text-white transition">
                ← App Home
            </a>
            <a href="<?php echo esc_url( home_url( '/?s=' ) ); ?>" class="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition flex items-center gap-1.5">
                <span>🔍</span>
                <span class="hidden md:inline">Search Guides</span>
            </a>
            <a href="https://pocketgull.com" class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold font-sans transition shadow-xs">
                Launch Consult 🚀
            </a>
        </nav>
    </div>
</header>
