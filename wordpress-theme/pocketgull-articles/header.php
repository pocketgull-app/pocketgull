<!DOCTYPE html>
<html <?php language_attributes(); ?> class="dark">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="PocketGull is an autonomous clinical AI swarm, physiological digital twin, and decentralized clinical research platform.">
  <meta name="theme-color" content="#0c0a09">
  <link rel="alternate" type="text/markdown" href="<?php echo esc_url( home_url( '/llms.txt' ) ); ?>" title="LLMs.txt" />
  <title><?php wp_title( '|', true, 'right' ); ?> <?php bloginfo( 'name' ); ?></title>
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            'pocketgull-marker': ['PocketGull', 'cursive', 'sans-serif'],
            'sans': ['"PocketGull Sans"', 'Inter', '-apple-system', 'sans-serif'],
            'heading': ['"PocketGull Sans"', 'Outfit', 'sans-serif'],
            'mono': ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
          },
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
    /* 🔬 Official PocketGull Sans Variable Font */
    @font-face {
      font-family: 'PocketGull Sans';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('<?php echo get_template_directory_uri(); ?>/fonts/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2') format('woff2');
    }

    /* 🖋️ Official Open-Source PocketGull Felt-Tip Marker for Header/Footer Wordmarks */
    @font-face {
      font-family: 'PocketGull';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url('<?php echo get_template_directory_uri(); ?>/fonts/PocketGull-Bold.ttf') format('truetype');
    }

    body {
      background-color: #0c0a09;
      font-family: 'PocketGull Sans', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      text-rendering: optimizeLegibility;
      overflow-x: hidden;
      color: #f5f5f4;
      line-height: 1.6;
      letter-spacing: -0.01em;
      font-feature-settings: "cv08", "cv05", "ss02", "zero";
    }

    /* 🖋️ Headers & Titles — PocketGull Sans */
    h1, h2, h3, h4, h5, h6, .font-heading {
      font-family: 'PocketGull Sans', 'Outfit', sans-serif !important;
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.25;
      font-feature-settings: "cv08", "cv05", "ss02", "zero";
    }

    /* 🖋️ MarkerFont Reserved strictly for Header/Footer Brand Wordmark */
    .font-pocketgull-marker {
      font-family: 'PocketGull', cursive, sans-serif !important;
    }

    /* 📟 Clinical Telemetry & Code — JetBrains Mono */
    code, kbd, samp, pre, .font-mono {
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
      font-feature-settings: "zero", "ss01", "ss02";
    }

    /* 📐 Dieter Rams Functional Grill Homage */
    .rams-grill {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      display: flex;
      gap: 3px;
      padding: 0 1.5rem;
      opacity: 0.35;
    }
    .rams-grill > div {
      flex: 1;
      background-color: #71717a;
      border-radius: 2px;
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
      
      <!-- Brand Logo Wordmark with Official 400x400 Icon -->
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex items-center gap-3 group">
        <div class="w-11 h-11 rounded-2xl bg-stone-900 border border-stone-800 group-hover:border-amber-400/50 flex items-center justify-center transition shadow-md overflow-hidden p-1">
          <img src="<?php echo get_template_directory_uri(); ?>/images/icon-400x400.png" alt="PocketGull Logo" class="w-full h-full object-contain transform group-hover:scale-110 transition drop-shadow-sm" />
        </div>
        <div>
          <span class="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 font-pocketgull-marker">
            PocketGull
          </span>
          <span class="text-[10px] text-stone-400 block font-mono">Clinical Intelligence &amp; Digital Twin</span>
        </div>
      </a>

      <!-- Header Actions -->
      <nav class="flex items-center gap-4 text-xs font-mono">
        <a href="#store" class="text-stone-300 hover:text-white transition hidden md:flex items-center gap-1">
          <span>🖼️ Art Store</span>
        </a>
        <a href="#digital-twin" class="text-stone-300 hover:text-white transition hidden sm:flex items-center gap-1">
          <span>🕊️ Model MC-10</span>
        </a>
        <a href="https://pocketgull.com" class="text-stone-300 hover:text-white transition flex items-center gap-1">
          <span>←</span> <span class="hidden sm:inline">PocketGull.com</span>
        </a>
        <a href="https://pocketgull.app" class="geararts-card px-4 py-2 rounded-xl text-stone-950 font-extrabold font-sans transition hover:scale-105 shadow-md flex items-center gap-1.5 cursor-pointer">
          <span>Launch Clinical Suite</span> 🚀
        </a>
      </nav>
    </div>
  </header>
