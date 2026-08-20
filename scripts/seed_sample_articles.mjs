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
  }
];

console.log(`Loaded ${SAMPLE_ARTICLES.length} helpful articles ready for publishing to pocketgull.com/articles!`);
