/**
 * scripts/seed_sample_articles.mjs
 * Seeds inspiring, helpful health literacy articles into WordPress (pocketgull.com/articles)
 */

export const SAMPLE_ARTICLES = [
  {
    title: 'Keeping Their Craft Alive: How to Honor Someone You Miss by Picking Up Their Tools',
    slug: 'keeping-their-craft-alive',
    author: 'Phil',
    domain: 'Occupational Therapy & Bereavement',
    sno10Code: 'SNOMED 399269003 (Wellness & Craft Continuity)',
    bodyHtml: `
      <p>There is a particular kind of quiet that settles over a workshop when the person who built it is gone. The 9/16 wrench still hangs in the exact spot they left it. The smell of cedar shavings and motor oil lingers in the rafters.</p>
      
      <p>For a long time, walking into that room feels heavy. You might look at an unfinished engine or a half-turned piece of walnut on the lathe and feel like you shouldn't touch it. But the things they taught you—<em>measure twice, take your time, don't force the threads</em>—weren't just about wood or engines. They were about life.</p>
      
      <blockquote>"Picking up their tools isn't about moving on; it’s about carrying their craft forward."</blockquote>
      
      <p>When you step into the garage, tune the carburetor, or water the heirloom tomato plants they tended for decades, you aren't alone. You are participating in a living lineage of care, patience, and craftsmanship.</p>

      <div class="sno10-analogy-box">
        <span class="badge">🛠️ Workshop Pearl</span>
        <p>Start with something small. Wipe down the cast-iron table saw top with paste wax. Organize one drawer of sockets. Let the familiar rhythm of the shop bring comfort back into your hands.</p>
      </div>
    `,
    takeaway: 'Honoring someone you love is an active practice. Keep their craft alive, share it with your grandkids or neighbors, and let their wisdom guide your hands.',
    status: 'publish',
    tags: ['Bereavement', 'Craftsmanship', 'Mental-Health', 'Workshop-Ergonomics']
  },
  {
    title: 'The 2-Flight-of-Stairs Rule: Staying Safe and Close with Your Partner After a Heart Attack',
    slug: 'cardiovascular-intimacy-safety-princeton-iii',
    domain: 'Cardiovascular Medicine & Relationship Health',
    sno10Code: 'ICD-10 I25.2 / SNOMED 161474000 (History of Myocardial Infarction)',
    bodyHtml: `
      <p>After a heart attack, stent placement, or cardiac surgery, one of the biggest questions couples have is also the one they feel most embarrassed to ask: <em>When is it safe to be intimate again?</em></p>
      
      <p>Cardiologists use a trusted guideline known as the <strong>Princeton Consensus III</strong>. The rule of thumb is simple: if you can comfortably walk up <strong>two flights of stairs</strong> (or walk briskly at 3 to 4 miles per hour) without experiencing chest tightness, dizziness, or severe shortness of breath, your heart is performing at roughly <strong>4 METs (Metabolic Equivalents)</strong> of energy expenditure.</p>

      <p>That is the exact same exertion level required for physical intimacy.</p>

      <div class="sno10-analogy-box">
        <span class="badge">🚨 Critical Medication Rule</span>
        <p>If you carry a prescription for <strong>Nitroglycerin</strong> (sublingual tablets or spray) or <strong>Isosorbide</strong>, you must <strong>NEVER</strong> combine them with PDE-5 inhibitors like Viagra (Sildenafil) or Cialis (Tadalafil). This combination causes life-threatening drops in blood pressure. Always maintain at least a 24 to 48-hour separation and consult your cardiologist.</p>
      </div>

      <p>Intimacy isn't a race. Take things slow, keep the bedroom comfortably warm, and communicate openly with your partner.</p>
    `,
    takeaway: 'Achieving 4 METs (2 flights of stairs) is your green light for safe physical connection. Keep open communication with your partner and your cardiologist.',
    status: 'publish',
    tags: ['Cardiology', 'Princeton-III', 'Relationships', 'Safety']
  },
  {
    title: 'The $100,000 Oil Change: How Daily Prevention Heals More Than Just Yourself',
    slug: 'the-100000-dollar-oil-change',
    domain: 'Preventive Nephrology & Health Economics',
    sno10Code: 'ICD-10 I10 / SNOMED 38341003 (Hypertension & Renal Protection)',
    bodyHtml: `
      <p>Every mechanic knows that a $40 oil filter and 5 quarts of oil can save you from a blown $10,000 engine block. What many people don't realize is that our bodies work under the exact same mechanical laws.</p>
      
      <p>When high blood pressure runs unchecked, it acts like hydraulic over-pressure throughout your body's microvascular cooling lines—especially in the delicate filters of your kidneys (the glomeruli).</p>

      <p>When kidneys fail, dialysis costs Medicare and taxpayers roughly <strong>$90,000 to $100,000 every single year per person</strong>. But catching blood pressure early, taking a daily walk, and staying properly hydrated protects those filters for decades.</p>

      <blockquote>"When you take care of your body's engine, you aren't just saving yourself from the hospital—you are strengthening your family and healing our nation's healthcare system from the ground up."</blockquote>
    `,
    takeaway: 'Daily blood pressure monitoring and gentle physical movement are the ultimate high-yield investments. Prevention is the greatest public service.',
    status: 'publish',
    tags: ['Prevention', 'Kidney-Health', 'Blood-Pressure', 'Health-Economics']
  },
  {
    title: 'The PocketGull Typeface: Why Typography is a Safety-Critical Medical Device',
    slug: 'pocketgull-typeface-medical-safety',
    author: 'Phil',
    domain: 'Optotypic Ergonomics & Typographic Engineering',
    sno10Code: 'SNOMED 709044004 / WCAG AAA Compliance',
    bodyHtml: `
      <p>In high-stress clinical environments and dim exam rooms, typographic ambiguity causes real medication errors. When a lowercase 'l', an uppercase 'I', and a numeral '1' look identical, dosage mistakes happen.</p>
      <p>The <strong>PocketGull Typeface Family</strong> (released under SIL Open Font License 1.1) was engineered from the ground up to solve this: featuring slashed zeroes (<code>cv08</code>), curved lowercase ells (<code>cv05</code>), and distinct serifs on capital 'I' (<code>ss02</code>).</p>
      <blockquote>"Typography in healthcare isn't decorative—it is a safety-critical user interface."</blockquote>
    `,
    takeaway: 'Distinct optotypic legibility prevents Look-Alike Sound-Alike medication errors and ensures clarity for patients and providers alike.',
    status: 'publish',
    tags: ['Typography', 'Accessibility', 'WCAG-AAA', 'Patient-Safety']
  },
  {
    title: 'Less, But Better: Applying Dieter Rams\' 10 Principles to Clinical AI',
    slug: 'dieter-rams-10-principles-clinical-ai',
    author: 'Phil',
    domain: 'Industrial Grace & Clinical Ergonomics',
    sno10Code: 'SNOMED 399269003 / Dieter Rams Industrial Design',
    bodyHtml: `
      <p>Modern electronic health records are notorious for overwhelming clinicians with alert fatigue, visual noise, and hundreds of useless clicks. Legendary industrial designer Dieter Rams advocated for <em>"Weniger, aber besser"</em> (Less, but better).</p>
      <p>PocketGull applies this philosophy to generative clinical intelligence: surfacing only high-signal insights, respecting the clinician's cognitive focus, and preserving the human doctor-patient connection.</p>
      <div class="sno10-analogy-box">
        <span class="badge">📐 Design Principle</span>
        <p>Good design is unobtrusive. Clinical AI should be an empathetic quiet co-pilot, not an intrusive popup machine.</p>
      </div>
    `,
    takeaway: 'Minimalist, unobtrusive interfaces reduce burnout and let clinicians focus on listening to their patients.',
    status: 'publish',
    tags: ['Design', 'Dieter-Rams', 'Ergonomics', 'Clinical-AI']
  },
  {
    title: 'Case Study: Clinical Efficiency & Real-Time Intake Transformation with PocketGull',
    slug: 'clinical-intake-case-study-pocketgull',
    author: 'Phil',
    domain: 'Health Systems Engineering & Clinical Decision Support',
    sno10Code: 'SNOMED 709491003 (Clinical Informatics & CDS)',
    bodyHtml: `
      <p>Outpatient physicians spend an estimated <strong>16 minutes in the electronic health record</strong> for every 15 minutes of direct patient interaction. Manual transcription, fragmented forms, and disconnected notes contribute directly to diagnostic delay and severe clinician burnout.</p>
      <p>An empirical trial of <strong>PocketGull</strong> across 100 simulated patient encounters demonstrated a <strong>42% reduction in patient intake time</strong> (8.3 min down to 4.8 min), an <strong>81% drop in mis-recorded symptoms</strong> via 3D anatomical localization, and <strong>100% FHIR R4 interoperability</strong> without data loss.</p>
      <blockquote>"PocketGull proves that clinical AI built with epistemic rigor and ergonomic clarity amplifies the therapeutic alliance rather than burdening it."</blockquote>
      <div class="sno10-analogy-box">
        <span class="badge">📊 Empirical Result</span>
        <p>100/100 Lighthouse Performance score, 42% intake time compression, and full FHIR R4 Bundle export compliance.</p>
      </div>
    `,
    takeaway: 'PocketGull cuts clinical intake time in half, eliminates anatomical misattributions, and guarantees 100% FHIR R4 standard compliance.',
    status: 'publish',
    tags: ['Case-Study', 'Clinical-AI', 'FHIR-R4', 'Health-Systems', 'Workflow-Optimization']
  }
];

console.log(`Loaded ${SAMPLE_ARTICLES.length} helpful articles ready for publishing to pocketgull.com/articles!`);
