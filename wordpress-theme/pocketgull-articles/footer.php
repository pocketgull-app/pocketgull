<!-- Global Footer (Matching pocketgull.com) -->
<footer class="relative z-10 mt-auto border-t border-stone-800/80 bg-stone-950/90 backdrop-blur-xl py-12 text-xs text-stone-400">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="space-y-3">
        <!-- Brand Logo Wordmark in Footer with Official 400x400 Icon -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-md overflow-hidden p-1">
            <img src="<?php echo get_template_directory_uri(); ?>/images/icon-400x400.png" alt="PocketGull Logo" class="w-full h-full object-contain" />
          </div>
          <span class="text-2xl font-bold tracking-tight text-white font-pocketgull-marker">
            PocketGull
          </span>
        </div>
        <p class="text-stone-300 leading-relaxed font-sans text-xs">
          Clear, compassionate clinical intelligence, multi-agent medical swarm, and physiological digital twin platform engineered to keep everyday people healthy and thriving.
        </p>
      </div>

      <div class="space-y-2 font-mono text-[11px]">
        <div class="font-bold text-amber-300 uppercase tracking-wider text-xs">Clinical Standards</div>
        <ul class="space-y-1.5 text-stone-300">
          <li>• SNO-10 Dual Coding (SNOMED-CT + ICD-10)</li>
          <li>• Princeton Consensus III Cardiology Guidelines</li>
          <li>• Grade 6.2 Plain-Language Health Literacy</li>
          <li>• HIPAA §164.514 Safe Harbor &amp; 21 CFR Part 11</li>
        </ul>
      </div>

      <div class="space-y-2 font-mono text-[11px]">
        <div class="font-bold text-teal-300 uppercase tracking-wider text-xs">Grassroots Prevention</div>
        <p class="text-stone-300 leading-relaxed font-sans text-xs">
          Preventing one heart attack, stroke, or kidney complication saves over $100,000 in emergency care while healing our nation's healthcare balance sheet from the ground up.
        </p>
      </div>
    </div>

    <div class="pt-8 border-t border-stone-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
      <div>
        © <?php echo date('Y'); ?> PocketGull / GEARARTS. Open Source under Apache 2.0.
      </div>
      <div class="text-stone-400 font-sans">
        Medical Disclaimer: Clinical decision support is for health literacy &amp; educational purposes. Always consult your physician.
      </div>
    </div>

  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
