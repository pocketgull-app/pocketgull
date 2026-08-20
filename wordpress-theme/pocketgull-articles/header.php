<!DOCTYPE html>
<html <?php language_attributes(); ?> class="dark">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php wp_title( '|', true, 'right' ); ?> <?php bloginfo( 'name' ); ?></title>
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            amberCard: '#f59e0b',
            amberCardLight: '#fbbf24',
            gearTeal: '#0d9488',
            gearTealLight: '#2dd4bf',
            gearCoral: '#f43f5e',
            gearCoralLight: '#fb7185',
            paperCream: '#fdfbf7',
          }
        }
      }
    }
  </script>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400;1,700&display=swap" rel="stylesheet">
  
  <style>
    /* 🖋️ Official Open-Source PocketGull Typeface Superfamily */
    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url('<?php echo get_template_directory_uri(); ?>/fonts/PocketGull-Fineliner.ttf') format('truetype');
    }

    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('<?php echo get_template_directory_uri(); ?>/fonts/PocketGull-Bold.ttf') format('truetype');
    }

    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 900;
      font-display: swap;
      src: url('<?php echo get_template_directory_uri(); ?>/fonts/PocketGull-Chiseltip.ttf') format('truetype');
    }

    @font-face {
      font-family: 'PocketGull Antigravity';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('<?php echo get_template_directory_uri(); ?>/fonts/PocketGull-Antigravity.ttf') format('truetype');
    }

    @font-face {
      font-family: 'PocketGull Mono';
      font-style: normal;
      font-weight: 400 700;
      font-display: swap;
      src: url('<?php echo get_template_directory_uri(); ?>/fonts/PocketGullMono-Regular.ttf') format('truetype');
    }

    body {
      background-color: #0c0a09;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-rendering: optimizeLegibility;
      overflow-x: hidden;
      color: #f5f5f4;
    }

    /* 🖋️ Headers & Display Typography matching pocketgull.app */
    h1, h2, h3, h4, h5, h6, .font-pocketgull, .font-heading {
      font-family: 'Outfit', 'Plus Jakarta Sans', 'Inter', sans-serif !important;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }

    /* 🖋️ Marker Specimen Accents */
    .font-pocketgull-marker {
      font-family: 'PocketGull', 'Outfit', cursive, sans-serif !important;
    }

    .font-pocketgull-chisel {
      font-family: 'PocketGull', 'Outfit', cursive, sans-serif !important;
      font-weight: 900;
      letter-spacing: -0.025em;
    }

    .font-pocketgull-mono {
      font-family: 'JetBrains Mono', 'PocketGull Mono', monospace !important;
    }

    .geararts-card {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d97706 100%);
      color: #0c0a09;
      box-shadow: 0 20px 40px -10px rgba(245, 158, 11, 0.4);
    }

    .glass-card-dark {
      background: rgba(28, 25, 23, 0.85);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(251, 191, 36, 0.25);
    }

    @keyframes wave-sway {
      0% { transform: translateX(0) scaleY(1); }
      50% { transform: translateX(-2%) scaleY(1.05); }
      100% { transform: translateX(0) scaleY(1); }
    }
  </style>

  <?php wp_head(); ?>
</head>
<body <?php body_class( 'text-stone-100 min-h-screen selection:bg-amber-400 selection:text-stone-950 flex flex-col relative' ); ?>>

  <!-- Living Papercraft Background Layer (Matching pocketgull.com) -->
  <div class="fixed inset-0 w-full h-full min-h-full overflow-hidden pointer-events-none z-0 mix-blend-screen opacity-60">
    <!-- Circadian Glow Pulse -->
    <div class="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-gradient-to-r from-[#0d9488]/30 via-[#f59e0b]/20 to-[#f43f5e]/30 blur-[120px] animate-pulse"></div>

    <!-- Back Ocean Waves -->
    <svg class="absolute -bottom-4 -left-[20%] w-[240%] h-[55%] opacity-90 min-w-[200vw]"
         style="animation: wave-sway 18s ease-in-out infinite alternate;"
         viewBox="0 0 2880 200" preserveAspectRatio="none">
      <path fill="rgba(13, 148, 136, 0.08)" d="M 0 100 Q 720 40 1440 100 T 2880 100 L 2880 200 L 0 200 Z"></path>
    </svg>
    
    <!-- Mid Ocean Waves -->
    <svg class="absolute -bottom-4 -left-[10%] w-[220%] h-[45%] min-w-[200vw]"
         style="animation: wave-sway 14s ease-in-out infinite alternate-reverse;"
         viewBox="0 0 2880 200" preserveAspectRatio="none">
      <path fill="rgba(244, 63, 94, 0.08)" d="M 0 120 Q 720 70 1440 120 T 2880 120 L 2880 200 L 0 200 Z"></path>
    </svg>

    <!-- Front Dune -->
    <svg class="absolute -bottom-4 left-0 w-[200%] h-[60%] min-w-[200vw]"
         style="animation: wave-sway 10s ease-in-out infinite alternate;"
         viewBox="0 0 2880 200" preserveAspectRatio="none">
      <path fill="rgba(245, 158, 11, 0.08)" d="M 0 140 Q 720 100 1440 140 T 2880 140 L 2880 200 L 0 200 Z"></path>
    </svg>
  </div>
  
  <!-- GEARARTS Top Banner -->
  <div class="relative z-10 bg-gradient-to-r from-teal-700 via-rose-600 to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-widest py-2 px-4 text-center flex items-center justify-center gap-2 shadow-md">
    <span>🎨 GEARARTS</span>
    <span class="opacity-40">•</span>
    <span>Clinical Intelligence & Research Hub</span>
    <span class="opacity-40">•</span>
    <span class="text-stone-900 bg-amber-300/80 px-2 py-0.5 rounded text-[10px] font-mono">Articles Portal</span>
  </div>

  <!-- Global Header Navigation -->
  <header class="relative z-10 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-xl sticky top-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      
      <!-- Brand Logo Wordmark with Official Origami Seagull Icon -->
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex items-center gap-3 group">
        <div class="w-11 h-11 rounded-2xl bg-stone-900 border border-stone-800 group-hover:border-amber-400/50 flex items-center justify-center transition shadow-md">
          <svg viewBox="0 0 100 100" class="w-7 h-7 transform group-hover:scale-110 transition drop-shadow-sm">
            <polygon points="50,15 85,55 50,45" fill="#FFFFFF" opacity="0.95" />
            <polygon points="50,15 15,55 50,45" fill="#E6F0FA" opacity="0.9" />
            <polygon points="50,45 85,55 50,85" fill="#C5D9ED" opacity="0.85" />
            <polygon points="50,45 15,55 50,85" fill="#A8C7E0" opacity="0.8" />
            <polygon points="50,15 56,10 50,18" fill="#34A853" /> <!-- Origami Green Beak -->
          </svg>
        </div>
        <div>
          <span class="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 font-pocketgull">
            PocketGull <span class="text-xs font-mono font-normal text-amber-400">/articles</span>
          </span>
          <span class="text-[10px] text-stone-400 block font-pocketgull-mono">Clinical Intelligence &amp; Preventive Health</span>
        </div>
      </a>

      <!-- Header Actions -->
      <nav class="flex items-center gap-4 text-xs font-pocketgull-mono">
        <a href="https://pocketgull.com" class="text-stone-300 hover:text-white transition flex items-center gap-1">
          <span>←</span> <span class="hidden sm:inline">PocketGull.com</span>
        </a>
        <a href="https://pocketgull.com" class="geararts-card px-4 py-2 rounded-xl text-stone-950 font-extrabold font-sans transition hover:scale-105 shadow-md flex items-center gap-1.5">
          <span>Launch Consult</span> 🚀
        </a>
      </nav>
    </div>
  </header>
