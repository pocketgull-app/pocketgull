<!-- Global Footer (Matching pocketgull.com) -->
<footer class="relative z-10 mt-auto border-t border-stone-800/80 bg-stone-950/90 backdrop-blur-xl py-12 text-xs text-stone-400">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="space-y-3">
        <!-- Brand Logo Wordmark in Footer with Marker Font -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-md">
            <svg viewBox="0 0 100 100" class="w-5 h-5">
              <polygon points="50,15 85,55 50,45" fill="#FFFFFF" opacity="0.95" />
              <polygon points="50,15 15,55 50,45" fill="#E6F0FA" opacity="0.9" />
              <polygon points="50,45 85,55 50,85" fill="#C5D9ED" opacity="0.85" />
              <polygon points="50,45 15,55 50,85" fill="#A8C7E0" opacity="0.8" />
              <polygon points="50,15 56,10 50,18" fill="#34A853" />
            </svg>
          </div>
          <span class="text-2xl font-bold tracking-tight text-white font-pocketgull-marker">
            PocketGull
          </span>
          <span class="text-xs font-mono text-amber-400">/articles</span>
        </div>
        <p class="text-stone-300 leading-relaxed font-sans text-xs">
          Clear, compassionate medical guides and prevention literacy designed to keep everyday people healthy, active, and out of the hospital.
        </p>
      </div>

      <div class="space-y-2 font-mono text-[11px]">
        <div class="font-bold text-amber-300 uppercase tracking-wider text-xs">Clinical Standards</div>
        <ul class="space-y-1.5 text-stone-300">
          <li>• SNO-10 Dual Coding (SNOMED-CT + ICD-10)</li>
          <li>• Princeton Consensus III Cardiology Guidelines</li>
          <li>• Grade 6.2 Plain-Language Health Literacy</li>
          <li>• HIPAA §164.514 Safe Harbor Compliance</li>
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
        Medical Disclaimer: Articles are for health literacy &amp; educational purposes. Always consult your physician.
      </div>
    </div>

  </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
