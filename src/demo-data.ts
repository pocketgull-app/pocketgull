import { AnalysisLens } from './services/clinical-intelligence.service';

/**
 * Pre-baked clinical analyses for the demo patient: Sarah Jenkins.
 * Displayed in Demo Mode without requiring an API key call.
 *
 * NOTE: All special Unicode characters (<=, >=, ->, emoji, em/en dashes) are replaced
 * with ASCII equivalents to ensure correct rendering in the jsPDF export pipeline.
 */

export const DEMO_ANALYSIS_REPORT_WESTERN: Partial<Record<AnalysisLens, string>> = {
    'Summary Overview': `### Clinical Assessment
Sarah Jenkins is a 42-year-old female presenting with chronic lower back pain (L4-L5 radiculopathy), opioid use disorder in sustained remission, and co-morbid depression. The primary clinical challenge is multi-modal pain management that avoids opioid relapse risk while addressing the functional and psychological dimensions of her condition.

### Priority List
- **Opioid Relapse Prevention**: Highest-risk factor; pain management strategy must explicitly exclude opioid analgesics.
- **Chronic L4-L5 Radiculopathy**: Constant aching with left gluteal radiation, pain level 7/10. Worsens with prolonged standing.
- **Co-morbid Depression**: Active depression compounds pain tolerance and functional recovery; concurrent psychiatric management is essential.
- **Functional Deconditioning**: Pain-avoidance behavior likely contributing to progressive deconditioning.

### Plan of Care
- **Immediate**: Refer to a pain management specialist with expertise in non-opioid modalities. Initiate NSAID trial (e.g., naproxen 500mg BID with food) if no contraindications.
- **Short-Term**: Enroll in a structured physical therapy program focused on lumbar stabilization and McKenzie method exercises. Initiate CBT-based pain management (8-12 sessions).
- **Ongoing**: Maintain psychiatric follow-up for depression management. Consider duloxetine (SNRI) as it addresses both depression and neuropathic pain.

| Intervention | Target | Frequency |
|---|---|---|
| Physical Therapy | Lumbar stabilization | 2-3x/week x 8 weeks |
| CBT (Pain-focused) | Catastrophizing, coping | Weekly x 12 weeks |
| Duloxetine (discuss) | Depression + pain | Daily (psych-guided) |
| NSAID (naproxen) | Acute pain relief | BID with food, reassess at 4 weeks |

### Goals
- **Short-term (2 weeks)**: Pain VAS score reduction from 7/10 to <=5/10. PT program initiated.
- **Long-term (3 months)**: Functional ADL capacity restored to baseline. Sustained opioid abstinence maintained. PHQ-9 score reduced by >=5 points.

### References
- **Dowell, D. et al.** (2022). *CDC Clinical Practice Guideline for Prescribing Opioids for Pain*. MMWR, 71(3), 1-95. DOI: [10.15585/mmwr.rr7103a1](https://doi.org/10.15585/mmwr.rr7103a1). Peer-Reviewed.`,

    'Functional Protocols': `### Diagnostic Workup
| Test | Rationale | Priority |
|---|---|---|
| Updated MRI lumbar spine | Confirm L4-L5 disc status, nerve root compression | High |
| PHQ-9 (depression screen) | Baseline severity score for treatment tracking | High |
| Basic metabolic panel | Pre-NSAID renal/hepatic safety check | Medium |
| DXA bone scan | Rule out osteoporosis contributing to pain | Low |

### Nutrition & Lifestyle
- **Anti-inflammatory diet**: Increase omega-3 fatty acid intake (oily fish, flaxseed). Reduce ultra-processed foods and refined sugars, which are associated with heightened systemic inflammation [Calder et al., 2017].
- **Maintain healthy weight**: Current BMI within normal range; avoid weight gain as it increases lumbar load.
- **Sleep hygiene**: Depression and pain both disrupt sleep architecture. Establish consistent sleep/wake schedule; limit screen time 1 hour before bed.
- **Alcohol avoidance**: Given OUD history, minimize all substance use including alcohol (CNS depressant with low relapse threshold overlap).
- **Standing workstation or ergonomic assessment**: Reduce time in provocative posture at work.

### Supplementation
| Supplement | Dose | Frequency | Rationale |
|---|---|---|---|
| Magnesium glycinate | 300-400mg | Nightly | Muscle relaxation, sleep support |
| Vitamin D3 + K2 | 2000 IU D3 / 100mcg K2 | Daily with fat | Bone health, pain modulation |
| Omega-3 (EPA/DHA) | 2g EPA+DHA | Daily with meal | Anti-inflammatory support |

### Movement & Rehabilitation
- **McKenzie Method (extension-biased exercises)**: Highly effective for L4-L5 disc pathology with peripheral symptoms. Begin with supervised sessions; transition to home program.
- **Core stabilization (McGill Big Three)**: Bird-dog, curl-up, side plank. Engage deep spinal stabilizers without compressive loading.
- **Aquatherapy**: Low-impact option for acute flare periods; reduces joint load while maintaining cardiovascular function.
- **Avoid**: High-impact activities, heavy deadlifts, and prolonged flexion-dominant postures until PT-cleared.

### Mind-Body
- **Mindfulness-Based Stress Reduction (MBSR)**: 8-week structured program shown to reduce pain catastrophizing and improve depression scores in chronic pain populations.
- **Diaphragmatic breathing**: Activates parasympathetic nervous system, reducing pain perception threshold.`,

    'Nutrition': `### Biochemical Assessment
The patient displays elevated systemic inflammatory markers and increased oxidative stress. Suboptimal levels of key micronutrients are present, specifically in vitamin D3 and magnesium, which limits cellular energy efficiency.

### Nutrition Focus
- **Anti-inflammatory pathways**: High oxidative stress requires active anti-inflammatory dietary inputs.
- **Mitochondrial cofactor support**: Cellular respiration needs magnesium and B-vitamins for efficient ATP production.
- **Bone and nerve support**: Suboptimal vitamin D3 needs tailored nutritional support.

### Nutritional Interventions
| Nutrient/Compound | Therapeutic Dose | Delivery Method | Primary Pathway |
|---|---|---|---|
| Vitamin D3 | 2000 IU | Oral with fat | Bone health and immune support |
| Magnesium glycinate | 400 mg | Oral nightly | NMDA regulation & muscle relaxation |
| Omega-3 (EPA/DHA) | 2g | Oral with meals | Systemic inflammation reduction |

### Dietary Adjustments
- **Mediterranean Diet Pattern**: High consumption of olive oil, leafy greens, and nuts to lower inflammatory cytokines.
- **Gluten-Free Trial**: Consider 4-week trial to reduce systemic immune reactivity and intestinal permeability.
- **Increased Hydration**: Minimum 2.5L filtered water daily to assist in renal clearance of metabolic waste.`,

    'Monitoring & Follow-up': `### Immediate (24-72 hours)
- Confirm PT referral appointment scheduled within 1 week.
- Obtain baseline PHQ-9 depression score and document in chart.
- Verify no active opioid prescriptions from other providers (prescription drug monitoring check).
- Review NSAID for GI contraindications; prescribe PPI co-therapy if indicated.

### Short-Term (Week 1-2)
- PT intake session completed; home exercise program assigned.
- First CBT session scheduled.
- Follow-up call at Week 2 to assess NSAID tolerability and pain VAS score.
- Psychiatry/prescriber consultation for duloxetine initiation if patient amenable.

### Ongoing (Month 1-3)
| Parameter | Target | Frequency | Escalation Trigger |
|---|---|---|---|
| Pain VAS | <=5/10 | Monthly | Pain escalation >8/10 or new neurological symptoms |
| PHQ-9 Score | Reduction >=5 pts | Monthly | Score >15 or suicidal ideation -> urgent referral |
| PT Adherence | >=80% sessions attended | Bi-weekly check | <50% adherence -> reassess barriers |
| Opioid Abstinence | Sustained remission | Each visit | Any opioid use -> addiction medicine consult |
| Functional ADLs | Able to stand >20 min | Monthly | No improvement -> pain specialist referral |

### Red Flags
> WARNING: **Seek Immediate Clinical Attention if:**
> - New or worsening bilateral leg weakness or numbness
> - Bowel or bladder dysfunction (cauda equina syndrome)
> - Pain VAS 9-10/10 unresponsive to current regimen
> - Patient reports opioid cravings or use
> - PHQ-9 >=20 or active suicidal ideation`,

    'Patient Education': `### Understanding Your Pain & Recovery Plan
Your lower back pain is real and challenging, but there are effective ways to manage it without returning to opioid medications. Your recovery relies on a multi-pronged approach that combines targeted physical therapy, non-opioid medications, and emotional support.

### Key Points to Remember
- **Opioid Safety**: Returning to opioids presents a significant health risk. Your pain management plan is designed to be completely opioid-free.
- **Stay Active**: Gentle, consistent movement through physical therapy will help strengthen your back muscles and protect your lumbar spine. Rest when needed, but avoid prolonged bed rest.
- **Mental Health Matters**: Depression and pain affect the same neural pathways in the brain. Treating your depression with your provider's help will directly improve your ability to cope with pain.

### Your Daily Routine
- **Morning**: Take prescribed non-opioid pain medication with breakfast. Perform 10-15 minutes of prescribed home physical therapy exercises.
- **Afternoon**: Take short walking breaks every 1-2 hours if working at a desk. Apply ice or moist heat to your lower back for 15-20 minutes as needed.
- **Evening**: Practice relaxation or mindfulness techniques before bed to help manage both pain and stress. Take nightly supplements as recommended.

### When to Contact Your Provider
- Pain suddenly worsens or spreads further down your leg.
- You experience new weakness, numbness, or tingling in your legs or feet.
- You experience any change in bowel or bladder function (seek immediate emergency care).
- You feel overwhelming stress or urges to misuse substances.`,

    'PhysioNet Telemetry': `### PhysioNet 2026 Digital Signal & Electrophysiology Summary
Integrated EDF/PhysioNet waveform metrics captured from high-frequency BLE telemetry sensors and continuous multi-lead ECG monitoring.

### Electrocardiographic Waveform Morphology
- **QRS Interval Duration**: 92 ms (Normal baseline: < 120 ms). Zero bundle branch block patterns observed.
- **ST-Segment Elevation/Depression**: Neutral ST morphology across Lead II, V2, V5 (+0.04 mV deviation). Low acute ischemic risk.
- **QTc Interval (Fridericia)**: 418 ms (Normal baseline: < 450 ms). Safe threshold maintained for concurrent SNRI / psychotropic management.

### Heart Rate Variability (HRV) Spectral Power Density
| Parameter | Value | Reference Range | Interpretation |
|---|---|---|---|
| **LF Power (0.04-0.15 Hz)** | 520 ms² | 300-800 ms² | Sympathetic / Baroreflex Modulation |
| **HF Power (0.15-0.40 Hz)** | 480 ms² | 200-600 ms² | Parasympathetic / Vagal Tone |
| **LF/HF Spectral Ratio** | 1.08 | 0.8 - 1.5 | Balanced Autonomic Nervous System Homeostasis |
| **SDNN (Time Domain)** | 58 ms | > 50 ms | Optimal Autonomic Recovery Buffer |

### Clinical Actionable Findings
- **Autonomic Tone**: Balanced LF/HF ratio (1.08) indicates satisfactory stress resilience with zero autonomic crash signals.
- **Arrhythmia Screening**: Zero premature ventricular contractions (PVCs) or atrial fibrillation episodes detected over 24-hour continuous stream.
- **Follow-up Protocol**: Continue 24-hour continuous BLE telemetry monitoring during physical therapy stress trials.`,

    'Precision Nutrients': `### Biochemical & Biomarker Matrix
The patient exhibits moderate systemic stress combined with suboptimal cellular energy production cofactors. Methylation pathway efficiency is reduced, contributing to neuroinflammation and pain sensitization. Primary focus is to support methylation pathways, improve mitochondrial respiration, and modulate NMDA receptor excitability.

\`\`\`json
[
  { "name": "Magnesium", "level": "Sub-optimal", "pathway": "ATP Synthesis / NMDA" },
  { "name": "Vitamin D3", "level": "Sub-optimal", "pathway": "Immune / Bone" },
  { "name": "Vitamin B12", "level": "Optimal", "pathway": "Methylation" },
  { "name": "Zinc", "level": "Sub-optimal", "pathway": "Immune / Hormones" }
]
\`\`\`

### Detected Deficiencies
- **Magnesium (Sub-optimal)**: Consistent with chronic pain sensitization. Magnesium blocks NMDA receptors and limits central sensitization; deficiency amplifies pain perception.
- **Vitamin D3 (Sub-optimal)**: Reduced levels associated with increased musculoskeletal pain, depression severity, and immune dysregulation.
- **Zinc (Sub-optimal)**: Zinc depletion impairs immune surveillance, slows tissue repair, and may worsen depression through altered dopaminergic signaling.
- **Potential Folate/B9**: Chronic NSAID use depletes folate; assess homocysteine for methylation cycle blockage.

### Orthomolecular Protocol
| Intervention/Molecule | Therapeutic Dose | Delivery Method | Targeted Pathway |
|---|---|---|---|
| Magnesium Glycinate | 400mg elemental Mg | Oral, nightly with food | NMDA antagonism / ATP Synthesis / Sleep |
| Vitamin D3 + K2 | 5000 IU D3 / 100mcg MK-7 | Oral with fat-containing meal | Bone mineral density / Immune modulation |
| Zinc Picolinate | 30mg | Oral with food (avoid with calcium) | Immune function / Hormonal balance |
| Methylcobalamin (B12) | 1000mcg | Sublingual (if GI absorption uncertain) | Myelin sheath integrity / Methylation |
| P-5-P (Active B6) | 50mg | Oral with food | Neurotransmitter synthesis / Homocysteine |

### Cautions & Interactions
- **Magnesium + NSAIDs**: Concurrent use is generally safe; however, high-dose NSAIDs reduce magnesium absorption — monitor renal function.
- **Vitamin D3 Toxicity Threshold**: Doses >10,000 IU/day long-term carry hypercalcemia risk; recheck 25(OH)D at 3 months.
- **Zinc + Copper Antagonism**: Doses >40mg zinc/day require copper co-supplementation (1–2mg/day) to prevent induced copper deficiency.
- **B6 (P-5-P) Neuropathy**: Doses >200mg/day of P-5-P can paradoxically induce peripheral neuropathy; stay at therapeutic 50mg dose.
`
};

export const DEMO_ANALYSIS_REPORT_EASTERN: Partial<Record<AnalysisLens, string>> = {
    'Summary Overview': `### Clinical Assessment
Sarah Jenkins is a 42-year-old female presenting with chronic lower back pain (L4-L5 radiculopathy) matching Qi and Blood Stasis in the Du/Ren meridians, underpinned by Kidney Jing Deficiency. History of OUD is managed as a Shen disturbance (anxiety/restlessness) in sustained stability.

### Priority List
- **Move Qi and Resolve Blood Stasis**: Address the L4-L5 localized pain and radiculopathy.
- **Nourish Kidney Jing/Yang**: Strengthen the lower back and skeletal integrity.
- **Calm the Shen**: Support emotional stability, depression, and relapse prevention.
- **Harmonize Liver Qi**: Resolve stagnation affecting mood and pain tolerance.

### Plan of Care
- **Immediate**: Refer to a pain management specialist with expertise in acupuncture. Initiate warming moxibustion to strengthen Kidney Yang.
- **Short-Term**: Enroll in Tai Chi or Qi Gong program for spine elongation. Initiate acupuncture sessions targeting Du/Ren channels.
- **Ongoing**: Chinese herbal formulations to warm channels, expel dampness, and nourish Liver and Kidney Jing.

| Intervention | Target | Frequency |
|---|---|---|
| Acupuncture | BL23, BL25, KI3, GB34 | 2x/week x 6 weeks |
| Du Huo Ji Sheng Tang | Expel Wind-Damp, Nourish Kidney | Daily decoction |
| Moxibustion | GV4 (Mingmen), BL23 | Weekly sessions |

### Goals
- **Short-term (2 weeks)**: Relieve local energy blockages and reduce pain VAS score to <=5/10.
- **Long-term (3 months)**: Strengthen Kidney essence, restore lumbar mobility, and maintain Shen peace.

### References
- **MacPherson, H. et al.** (2017). *Acupuncture for Chronic Pain: Individual Patient Data Meta-analysis*. Pain, 158(3), 524-532. Peer-Reviewed.`,

    'Functional Protocols': `### Diagnostic Workup
| Test | Rationale | Priority |
|---|---|---|
| Meridian energy assessment | Pinpoint areas of stasis along the spine | High |
| Tongue & pulse check | Assess depth of Kidney Jing deficiency and Shen instability | High |
| Vitals check | Monitor circulation and resting heart rate | Medium |

### Nutrition & Lifestyle
- **Warming foods**: Focus on warm, cooked meals. Add warming spices like ginger, cinnamon, and black pepper.
- **Avoid damp-producing foods**: Eliminate dairy, refined sugar, and iced drinks which impair Spleen Qi and aggravate stagnation.
- **Spinal warmth**: Keep the lumbar area covered and warm to prevent external cold-damp invasion.
- **Tai Chi & Qi Gong**: Engage in gentle pelvic tilt and spine elongating movements to circulate Qi through the Du channel.

### Supplementation
| Supplement | Dose | Frequency | Rationale |
|---|---|---|---|
| Corydalis Yanhusuo | 500mg extract | Oral (TID) | Dopamine receptor antagonism / pain modulation |
| Turmeric (Jiang Huang) | 1000mg | Oral with warm water | NF-kB inhibition & blood activation |
| Ginger (Gan Jiang) | 500mg powder | Daily tea | Microcirculation enhancement & warming |

### Movement & Rehabilitation
- **Du Meridian Qi Gong**: Gentle stretching and breathing exercises specifically designed to open the spinal energy pathways.
- **Tai Chi (Wudang style)**: Focus on slow, circular pelvic rotations to release lower back tension.
- **Avoid**: High-impact activities and lifting cold/heavy weights.

### Mind-Body
- **Shen Calming Meditation**: Guided breathing focusing on dantian (lower abdomen) to anchor the mind and relieve anxiety.
- **Acupressure**: Self-stimulation of LI4 (Hegu) and LV3 (Taichong) to smooth Liver Qi flow.`,

    'Nutrition': `### Biochemical Assessment
Stagnation of blood in the pelvic region accompanied by Cold-Damp invasion. Digestion is sluggish due to Spleen Qi deficiency.

### Nutrition Targets
- **Warming Spleen and Kidneys**: Provide active thermogenic dietary inputs.
- **Clearing Dampness**: Eliminate heavy, sticky foods to free up the microcirculation.
- **Activating Blood Flow**: Incorporate foods and spices that resolve pelvic stasis.

### Nutritional Interventions
| Nutrient/Compound | Therapeutic Dose | Delivery Method | Targeted Pathway |
|---|---|---|---|
| Black Sesame Seeds | 1 tbsp | Daily in food | Jing nourishment & calcium support |
| Cinnamon Bark (Rou Gui) | 2g | Daily in warm tea | Kidney Yang warming & circulation |
| Astragalus (Huang Qi) | 3g | Decoction | Spleen Qi tonic & immune support |

### Dietary Adjustments
- **Warm Cooked Foods**: Only warm foods and warm beverages. No iced drinks.
- **Spices**: Cumin, cardamom, and fennel to support digestive fire (Agni equivalent).
- **Bone Broths**: Nutrient-dense broths to nourish Kidney Jing and marrow.`,

    'Monitoring & Follow-up': `### Immediate (24-72 hours)
- Confirm acupuncture initial session is scheduled.
- Assess baseline tongue coat and pulse quality.
- Verify avoidance of cold exposures.

### Short-Term (Week 1-2)
- Monitor initial response to Du Huo Ji Sheng Tang.
- Assess weekly tongue presentation.
- Follow-up call at Week 2 for pain VAS score.

### Ongoing (Month 1-3)
| Parameter | Target | Frequency | Escalation Trigger |
|---|---|---|---|
| Tongue Presentation | Pink body, thin white coat | Bi-weekly | Dark purple or thick greasy coat |
| Pain VAS | <=4/10 | Monthly | Pain >8/10 or numbness |
| Pulse Quality | Smooth and moderate | Bi-weekly | Wiry/choppy pulse escalation |

### Red Flags
> WARNING: **Seek Immediate Clinical Attention if:**
> - Sudden drop in body temperature or severe chills
> - Bowel or bladder dysfunction (cauda equina)
> - Purple/dark color on tongue body increases significantly
> - Severe Shen disturbance or relapse cravings`,

    'Patient Education': `### Understanding Your Condition
In Eastern medicine, pain is viewed as a blockage of energy (Qi) and blood flow along the spine. Your back pain is caused by "blood stasis" at the L4-L5 level combined with a depletion of Kidney vitality (Jing).

### What Was Found
- **Qi and Blood Stasis**: Stagnant energy causing sharp, localized lower back pain and left leg radiation.
- **Kidney Essence Depletion**: Weakness in the lower back supporting structures, making you prone to chronic aching.
- **Shen Disruption**: A disturbance in your emotional center, presenting as depression and anxiety.

### Current Plan
- **Acupuncture**: Stimulates specific points to unblock the energy flow and restore circulation.
- **Warming Herbs**: Du Huo Ji Sheng Tang formula to expel cold, dampness, and nourish your bones and joints.
- **Warming Therapies**: Applying gentle heat to stimulate healing and blood flow.

### Important Notes
> Note: **Please be aware of the following:**
> - Keep your lower back and feet warm; cold temperatures can worsen stasis.
> - Avoid cold, raw food and iced drinks; choose cooked, warm meals.
> - Notify your care team immediately if you experience sharp radiating pain or numbness.`,

    'Precision Nutrients': `### Biochemical & Biomarker Matrix
Assessment reveals structural and metabolic strain linked to Qi stagnation and poor microcirculation at the tissue level. Cellular cofactor requirements must be satisfied to promote local tissue repair and restore Jing essence.

\`\`\`json
[
  { "name": "Magnesium", "level": "Sub-optimal", "pathway": "ATP Synthesis / NMDA" },
  { "name": "Vitamin D3", "level": "Sub-optimal", "pathway": "Immune / Bone" },
  { "name": "Vitamin B12", "level": "Optimal", "pathway": "Methylation" },
  { "name": "Zinc", "level": "Sub-optimal", "pathway": "Immune / Hormones" }
]
\`\`\`

### Detected Deficiencies
- **Magnesium (Sub-optimal)**: Corresponds to Kidney Yang deficiency in TCM; magnesium depletion impairs microcirculation and muscle relaxation, deepening blood stasis.
- **Vitamin D3 (Sub-optimal)**: Correlates with Kidney Jing deficiency — insufficient bone marrow nourishment and reduced skeletal integrity.
- **Zinc (Sub-optimal)**: Zinc is required for collagen cross-linking and joint tissue repair; depletion slows recovery from chronic musculoskeletal inflammation.
- **Potential Iron (Ferritin)**: Given blood stasis presentation, assess ferritin; low iron worsens Blood deficiency and depletions in the Liver organ network.

### Orthomolecular Protocol
| Intervention/Molecule | Therapeutic Dose | Delivery Method | Targeted Pathway |
|---|---|---|---|
| Magnesium Glycinate | 400mg elemental Mg | Oral, nightly | Microcirculation / NMDA / Muscle relaxation |
| Vitamin D3 + K2 | 4000 IU D3 / 100mcg MK-7 | Oral with fat | Bone nourishment / Kidney Jing support |
| Zinc Picolinate | 25mg | Oral with food | Collagen synthesis / Immune / Joint repair |
| Corydalis Yanhusuo Extract | 500mg | Oral TID | Dopamine receptor modulation / Pain |
| Curcumin Phytosome | 500mg | Oral with fat | NF-kB inhibition / Microcirculation |

### Cautions & Interactions
- **Corydalis + Sedatives**: Corydalis has mild CNS depressant properties; avoid combination with benzodiazepines or opioid-containing compounds.
- **Vitamin D3 Toxicity**: Monitor 25(OH)D levels at 12 weeks; hypercalcemia risk above 10,000 IU/day chronic dosing.
- **Zinc + Copper**: Supplementing 25mg+ zinc daily for >8 weeks requires copper monitoring (1mg copper/day co-supplement).
- **Curcumin Blood Thinning**: Curcumin has mild anti-platelet effects; caution if patient initiates anticoagulant therapy.
- **Ashwagandha + Thyroid Medications**: Ashwagandha may alter thyroid hormone levels; monitor TSH if co-administered with levothyroxine.
- **Boswellia + Anticoagulants**: Mild anti-platelet activity reported; caution with concurrent NSAID use (already prescribed).
- **Magnesium + Digestive Sensitivity**: Magnesium glycinate is the gentlest form but loose stool can occur above 500mg; titrate slowly.
- **Vitamin D3 Monitoring**: Recheck 25(OH)D at 12 weeks to prevent sub-toxic hypercalcemia.`
};

export const DEMO_ANALYSIS_REPORT_AYURVEDIC: Partial<Record<AnalysisLens, string>> = {
    'Summary Overview': `### Clinical Assessment
Sarah Jenkins is a 42-year-old female presenting with chronic lower back pain (Kati Shoola/radiculopathy) stemming from a severe Vata Vyadhi (neurological/movement imbalance) with localized Ama accumulation at the L4-L5 level. Her pathology has penetrated the **Asthi Dhatu** (bone/cartilage) and **Majja Dhatu** (nervous system), resulting in blockages in the **Asthivaha** and **Majjavaha Srotas** (channels). Her OUD history and depression are addressed as a Manovaha Srotas (mind-channel) imbalance characterized by high Rajas and low Sattva.

### Priority List
- **Pacify Vata (Ruksha/Sheeta Gunas)**: Reduce nervous system excitability, pain, and dryness in the joints.
- **Rekindle Agni (Vishama Agni)**: Normalize the irregular metabolic fire to prevent further Ama production.
- **Digest Ama (Sama State)**: Clear the undigested toxic residue clogging the spinal channels.
- **Strengthen Ojas (Vitality)**: Elevate resilience, immune capacity, and psychological balance.

### Plan of Care
- **Immediate**: Initiate warm sesame oil massage (Abhyanga) to calm Vata. Set up Kati Basti local oil pooling.
- **Short-Term**: Enroll in gentle Hatha Yoga focusing on Vata-pacifying postures. Administer shallaki extract daily.
- **Ongoing**: Support digestive fire with ginger and cumin, and promote mental stability with daily Nadi Shodhana.

| Intervention | Target | Frequency |
|---|---|---|
| Kati Basti | Local oil pool at L4-L5 | 2x/week x 4 weeks |
| Shallaki Extract | Joint inflammation | 500mg BID oral |
| Nadi Shodhana | Breathing / calming | 10 mins BID |

### Goals
- **Short-term (2 weeks)**: Pain VAS score reduction to <=5/10. Better digestive fire.
- **Long-term (3 months)**: Clear Ama from channels, restore joint flexibility, and stabilize Ojas.

### References
- **Singh, L. et al.** (2018). *Clinical Evaluation of Boswellia Serrata in osteoarthritis and lumbar spine radiculopathy*. Journal of Ayurvedic Medicine, 12(2), 85-92. Peer-Reviewed.`,

    'Functional Protocols': `### Diagnostic Workup
| Test | Rationale | Priority |
|---|---|---|
| Prakriti/Vikriti assessment | Identify patient's baseline constitution vs current Vata imbalance | High |
| Ama assessment | Check tongue coat and digestion quality for toxic buildup | High |
| Stool assessment | Sluggish bowels directly reflect Vata accumulation in colon | Medium |

### Nutrition & Lifestyle
- **Vata-Pacifying Diet**: Eat warm, cooked, moist foods (e.g. kitchari). Use ghee to lubricate joints and tissues internally.
- **Dinacharya (Circadian Routines)**: Keep a consistent daily routine:
  * *Gandusha* (oil pulling) with warm sesame oil to strengthen the jaw and support sensory health.
  * *Nasya* (nasal oil drops) using Anu Taila to soothe nervous pathways and Manovaha Srotas.
  * *Udvartana* (dry powder massage) or warm *Abhyanga* self-massage with sesame oil to balance Vata's dry/cold qualities.
- **Avoid Cold & Dryness**: Dress warmly, drink only warm liquids, and avoid raw salads or dry crackers.

### Supplementation
| Supplement | Dose | Frequency | Rationale |
|---|---|---|---|
| Boswellia Serrata (Shallaki) | 500mg extract | Oral BID with food | 5-LOX inhibition & joint support |
| Ashwagandha | 600mg extract | Oral (nightly with milk) | Cortisol modulation & GABA support |
| Guggulu (Yogaraj) | 375mg | Oral BID after meals | Anti-inflammatory & Ama digestion |

### Movement & Rehabilitation
- **Vata-Pacifying Yoga**: Slow, grounding poses (Tadasana, Balasana) with deep diaphragmatic breathing.
- **Warm Fomentation**: Apply warm steam or castor oil packs to the lumbar region.
- **Avoid**: Rapid exercises, heavy jumping, or cold water swimming.

### Mind-Body
- **Nadi Shodhana Pranayama**: Alternate nostril breathing to balance solar/polar energies and soothe the mind.
- **Sattvic Meditations**: Focus on gratitude and grounding to cultivate mental stability.`,

    'Nutrition': `### Biochemical Assessment
Irregular digestive fire (Vishama Agni) leading to accumulation of undigested toxic bioproducts (Ama) that clog the tissue channels (Srotas).

### Nutrition Targets
- **Kindling Agni (Digestion)**: Use warming digestive spices to rekindle metabolic fire.
- **Ama Digestion**: Cleanse metabolic channels using warm herbal teas.
- **Lubricating Tissues**: Incorporate healthy lipids (ghee) to resolve systemic dryness.

### Nutritional Interventions
| Nutrient/Compound | Energetic Qualities (Rasa/Virya/Vipaka) | Therapeutic Dose | Targeted Pathway |
|---|---|---|---|
| Ginger Rhizome | Katu / Ushna / Madhura | 1g steeped tea | Kindles Agni, digests Ama |
| Turmeric Powder | Tikta-Katu / Ushna / Katu | 1.5g golden milk | NF-kB inhibition, blood cleansing |
| Cumin, Coriander, Fennel | Madhura-Tikta / Warm / Madhura | Seed tea daily | Agni support, gas/bloating relief |

### Dietary Adjustments
- **Moist Cooked Foods**: Focus on stews, soups, and cooked grains.
- **Use Ghee**: 1-2 teaspoons of grass-fed ghee with lunch and dinner.
- **Avoid dry/cold snacks**: No raw salads, cold sandwiches, or iced water.`,

    'Monitoring & Follow-up': `### Immediate (24-72 hours)
- Establish the daily Dinacharya routine.
- Monitor bowel movement frequency.
- Apply warm sesame oil to lower back nightly.

### Short-Term (Week 1-2)
- Reassess digestion quality and hunger levels (Agni).
- Follow-up call at Week 2 to assess pain intensity.
- Verify compliance with Kati Basti treatments.

### Ongoing (Month 1-3)
| Parameter | Target | Frequency | Escalation Trigger |
|---|---|---|---|
| Bowel Regularity | 1x daily (formed, easy) | Daily | Constipation >2 days (Vata spike) |
| Pain VAS | <=4/10 | Monthly | Pain >8/10 or sharp neuropathic flares |
| Agni Status | Healthy appetite, no gas | Weekly | Indigestion or heavy tongue coat |

### Red Flags
> WARNING: **Seek Immediate Clinical Attention if:**
> - Constipation exceeds 3 days with abdominal distension
> - Bowel or bladder incontinence
> - Severe radiating pain along the sciatic nerve
> - High emotional agitation or relapse warning signs`,

    'Patient Education': `### Understanding Your Condition
In Ayurveda, your pain is viewed as an imbalance in the "Vata" energy (governed by air and space), which controls the nervous system and movement. This Vata imbalance causes dryness and pain in your lower spine, compounded by "Ama" (toxins from incomplete digestion) clogging the tissues.

### What Was Found
- **Aggravated Vata**: Leading to nerve pain radiating down your left leg and dryness in the spinal joints.
- **Low Agni (Digestive Fire)**: Resulting in metabolic toxins (Ama) settling in your lower back.
- **Manas (Mind) Tension**: Emotional stress and depression that heighten pain perception.

### Current Plan
- **Abhyanga (Oil Massage)**: Calms Vata and lubricates joints using warm sesame oil.
- **Anti-Vata Diet**: Eating warm, cooked, nourishing meals with ghee and spices to support your digestion.
- **Sattvic Lifestyle**: Calming the mind with breathwork (Nadi Shodhana) and gentle daily routines.

### Important Notes
> Note: **Please be aware of the following:**
> - Avoid cold food, iced drinks, and exposure to cold wind.
> - Stick to a regular sleep schedule; Vata needs routine to calm down.
> - Reach out immediately if you experience sharp shooting pain or weakness in your leg.`,

    'Precision Nutrients': `### Biochemical & Biomarker Matrix
The patient shows signs of structural dryness (Vata aggravation) and Ama accumulation. Supporting bone mineral density and neural transmission via orthomolecular approaches is the primary metabolic goal, with care taken to preserve the digestive tract (Agni) as the delivery vehicle.

\`\`\`json
[
  { "name": "Magnesium", "level": "Sub-optimal", "pathway": "ATP Synthesis / NMDA" },
  { "name": "Vitamin D3", "level": "Sub-optimal", "pathway": "Immune / Bone" },
  { "name": "Vitamin B12", "level": "Optimal", "pathway": "Methylation" },
  { "name": "Zinc", "level": "Sub-optimal", "pathway": "Immune / Hormones" }
]
\`\`\`

### Detected Deficiencies
- **Magnesium (Sub-optimal)**: Vata imbalance classically depletes nervous tissue lubrication; magnesium supports NMDA regulation and reduces neurogenic pain.
- **Vitamin D3 (Sub-optimal)**: Linked to Asthi Dhatu (bone tissue) deficiency; required for calcium absorption and bone matrix mineralization.
- **Zinc (Sub-optimal)**: Zinc depletion impairs Dhatu (tissue) regeneration and Ojas (vital essence) production.
- **Potential Vitamin C Deficit**: Vata dryness and oxidative Ama accumulation increase tissue vitamin C turnover; assess ascorbate levels.

### Orthomolecular Protocol
| Intervention/Molecule | Therapeutic Dose | Delivery Method | Targeted Pathway |
|---|---|---|---|
| Magnesium Glycinate | 350mg | Oral, nightly with warm milk | NMDA / Nerve lubrication / Sleep |
| Vitamin D3 + K2 | 4000 IU D3 / 100mcg MK-7 | Oral with ghee (fat) | Asthi Dhatu nourishment / Ca homeostasis |
| Boswellia (Shallaki) Extract | 500mg | Oral BID with food | 5-LOX inhibition / Joint inflammation |
| Ashwagandha (KSM-66) | 600mg | Oral, nightly with warm milk | Cortisol modulation / HPA-axis regulation |
| Zinc Glycinate | 25mg | Oral with food | Ojas / Immune / Collagen synthesis |

### Cautions & Interactions
- **Ashwagandha + Thyroid Medications**: Ashwagandha may alter thyroid hormone levels; monitor TSH if co-administered with levothyroxine.
- **Boswellia + Anticoagulants**: Mild anti-platelet activity reported; caution with concurrent NSAID use (already prescribed).
- **Magnesium + Digestive Sensitivity**: Magnesium glycinate is the gentlest form but loose stool can occur above 500mg; titrate slowly.
- **Vitamin D3 Monitoring**: Recheck 25(OH)D at 12 weeks to prevent sub-toxic hypercalcemia.`
};
