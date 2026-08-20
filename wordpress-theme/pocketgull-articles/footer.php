<!-- Global Footer -->
<footer class="mt-auto border-t border-zinc-800 bg-zinc-950 py-12 text-xs text-zinc-400">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="space-y-2">
                <div class="font-bold text-white text-sm font-sans flex items-center gap-2">
                    <span>🕊️</span>
                    <span>Pocket-Gull Articles</span>
                </div>
                <p class="text-zinc-400 leading-relaxed">
                    Clear, compassionate medical guides and craft health literacy designed to keep everyday people healthy, active in their workshops, and out of the hospital.
                </p>
            </div>

            <div class="space-y-2 font-mono text-[11px]">
                <div class="font-bold text-zinc-300 uppercase tracking-wider text-xs">Clinical Standards</div>
                <ul class="space-y-1 text-zinc-400">
                    <li>• SNO-10 Dual Coding (SNOMED-CT + ICD-10)</li>
                    <li>• Princeton Consensus III Cardiology Guidelines</li>
                    <li>• Grade 6.2 Plain-Language Health Literacy</li>
                    <li>• HIPAA §164.514 Safe Harbor De-Identification</li>
                </ul>
            </div>

            <div class="space-y-2 font-mono text-[11px]">
                <div class="font-bold text-zinc-300 uppercase tracking-wider text-xs">Grassroots Prevention</div>
                <p class="text-zinc-400 leading-relaxed">
                    Preventing one heart attack, fall, or episode of kidney failure saves over $100,000 in emergency care while healing our nation's healthcare balance sheet from the ground up.
                </p>
            </div>
        </div>

        <div class="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
            <div>
                © <?php echo date('Y'); ?> Pocket-Gull. Open Source under Apache 2.0.
            </div>
            <div class="text-zinc-400">
                Medical Disclaimer: Articles are for educational and health literacy purposes. Always consult your physician.
            </div>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
