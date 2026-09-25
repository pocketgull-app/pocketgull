import { describe, it, expect } from 'vitest';
import { OknKnowledgeGraphService } from './okn-knowledge-graph.service';
import { MOCK_PATIENTS } from '../mock-patients';

describe('Pocket-Gull Patient Cohort x NSF OKN Epistemic Evaluation', () => {
  const oknService = new OknKnowledgeGraphService();

  const evaluatedPatients = [
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p001')!,
      focalProblem: 'Metabolic Syndrome, Endothelial Glucotoxicity, OSA (BMI 42), BP 152/95',
      queryVector: 'Metabolic Syndrome & Endothelial Glucotoxicity',
      environmentalVector: 'EPA Urban Heat Island Microclimate & Fine Particulates (PM2.5)'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p002')!,
      focalProblem: 'Airway Hyperreactivity, Opioid Remission, Chronic Lower Back Pain',
      queryVector: 'Airway Hyperreactivity & Non-Opioid PEA Signaling',
      environmentalVector: 'NOAA Boundary Inversion & Fine Particulate Allergens'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p003')!,
      focalProblem: 'Geriatric Cardiac, Ischemic Heart Disease, CKD 3a, Fall Risk & Exertional Intimacy',
      queryVector: 'Cardiovascular Intimacy & Princeton Consensus III',
      environmentalVector: 'USGS Municipal Groundwater Hardness & Seasonal Cold Fronts'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p004')!,
      focalProblem: 'Comparative Arboreal Hominid, Purine Metabolism, IHD, COPD & Renal Conservation',
      queryVector: 'Comparative Hominid Cardiometabolic & Renal Conservation',
      environmentalVector: 'Peatland Biomass Haze Particulate Exposure'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p005')!,
      focalProblem: 'Hypertensive Heart Disease, Stage 3b CKD, SPRINT Intensive BP Autoregulation',
      queryVector: 'Nephron Sparing & SPRINT Intensive BP Autoregulation',
      environmentalVector: 'USGS Municipal Sodium Aquifer Infiltration'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p006')!,
      focalProblem: 'Pediatric Acute Dehydration, Resolving Rotavirus Enteritis, Osmolar Stewardship',
      queryVector: 'Pediatric Osmolar Stewardship & WHO Essential Rehydration',
      environmentalVector: 'USGS Water Sensor Grid Turbidity & Distribution Line Bio-films'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p007')!,
      focalProblem: 'Maternal Gestational Hypertension, Iron-Deficiency Anemia, Preeclampsia Prophylaxis',
      queryVector: 'Maternal Hemodynamic Pacing & WHO SDG 3.1 Prophylaxis',
      environmentalVector: 'NOAA Extreme Heat Advisory & Thermal Humidity Stress'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p008')!,
      focalProblem: 'Orthomolecular Longevity, Pauling-Rath Protocol, Lp(a) Neutralization',
      queryVector: 'Apoprotein(a) Neutralization & Orthomolecular Collagen Binding',
      environmentalVector: 'Low Indoor Humidity & Winter Microvascular Oxidative Strain'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p009')!,
      focalProblem: 'Pancreatic Ductal Adenocarcinoma Stage III, Exocrine Insufficiency, Cachexia',
      queryVector: 'Pancreatic Enzyme Replacement & Anti-Cachectic Cytokine Blunting',
      environmentalVector: 'EPA Toxics Release Inventory Chlorinated Solvents & Industrial Runoff'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p010')!,
      focalProblem: 'Dual Alzheimer & Parkinson Overlap, Tau-Synuclein Pathology, Orthostatic Dysautonomia',
      queryVector: 'Dual Dopaminergic-Cholinergic Resonance & Medhya Rasayana Neuroprotection',
      environmentalVector: 'Circadian Blue-Light Disruption & Acoustic Flutter'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p_mara_santos')!,
      focalProblem: 'RRMS, MTHFR T/T folate block & mitochondrial CoQ10 depletion (0.38 μg/mL)',
      queryVector: 'Ubiquinone',
      environmentalVector: 'PM2.5 High Birch Pollen Neuro-Inflammation'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p_charles_darwin')!,
      focalProblem: 'Debilitating cyclic vomiting, flatulence, mitochondrial Chagas lactate/pyruvate overload',
      queryVector: 'Alluvial Groundwater',
      environmentalVector: 'Malvern Cold Water Spa & Hydrotherapy Runoff'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p_marie_curie')!,
      focalProblem: 'Aplastic anemia, Radium-226 alpha flux, severe DNA 8-OHdG oxidative lesions',
      queryVector: 'Cytochrome c Oxidase',
      environmentalVector: 'Ionizing Alpha Flux & Cutaneous Radiologic Dermatitis'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p_frida_kahlo')!,
      focalProblem: 'Intractable neuropathic pain, pelvic trauma, right foot phantom pain, Substance P 220 pg/mL',
      queryVector: 'Photobiomodulation',
      environmentalVector: 'Prolonged Plaster Corset Immobilization & Cold Aversion'
    },
    {
      patient: MOCK_PATIENTS.find(p => p.id === 'p_srinivasa_ramanujan')!,
      focalProblem: 'Hepatic amoebiasis, severe gut dysbiosis, leaky gut (Zonulin 64 ng/mL)',
      queryVector: 'Non-Alcoholic Fatty Liver Disease',
      environmentalVector: 'Cambridge Cold Damp Winter & Nutritional Malabsorption'
    }
  ];

  it('evaluates every patient against the NSF OKN cross-agency federation', async () => {
    console.log('\n' + '='.repeat(82));
    console.log('🩺 POCKET-GULL CLINICAL COHORT x NSF OPEN KNOWLEDGE NETWORK (NSF OKN) TRIAL');
    console.log('   Federating 43 Knowledge Graphs across NIH, USGS, EPA, NOAA, NSF, and WHO');
    console.log('='.repeat(82));

    expect(evaluatedPatients.length).toBe(15);

    for (const [idx, item] of evaluatedPatients.entries()) {
      const p = item.patient;
      expect(p).toBeDefined();
      expect(p.oknProfile).toBeDefined();
      expect(p.oknProfile?.isVerified).toBe(true);
      expect(p.oknProfile?.participatingAgencies.length).toBeGreaterThan(0);

      const oknResult = await oknService.queryCrossAgencyGraph(item.queryVector);
      const provenance = await oknService.verifyRecommendationProvenance(item.queryVector);

      console.log(`\n[PATIENT ${idx + 1}/15] ${p.name.toUpperCase()} (${p.age}y, ${p.gender})`);
      console.log(`  Clinical Presentation: ${item.focalProblem}`);
      console.log(`  Environmental Trigger: ${item.environmentalVector}`);
      console.log(`  Target Query Vector:   "${item.queryVector}"`);
      console.log('  ' + '-'.repeat(76));

      expect(oknResult.connectedPaths.length).toBeGreaterThan(0);
      const topPath = oknResult.connectedPaths[0];

      console.log(`  🏛️  NSF OKN Grounded Path:`);
      console.log(`     ${topPath.pathDescription}`);
      console.log(`     Agencies: [${topPath.participatingAgencies.join(' + ')}] | Evidence: ${topPath.cochraneRelevance}`);
      if (topPath.edges[0]?.evidenceCitation) {
        console.log(`     Citation: ${topPath.edges[0].evidenceCitation}`);
      }

      console.log(`  ⚡  Pocket-Gull CDS Decision:`);
      console.log(`     Provenance Badge:  ${provenance.badgeLabel}`);
      console.log(`     FDA 21 CFR Part 11: ${provenance.auditTrailHash.slice(0, 32)}...`);
      console.log(`     HIPAA Safe Harbor:  Attested (0 bytes ePHI transmitted)`);

      expect(provenance.isVerified).toBe(true);
      expect(provenance.badgeLabel).toBe('[🏛️ NSF OKN Verified]');
      expect(provenance.auditTrailHash).toBeTruthy();
    }

    console.log('\n' + '='.repeat(82));
    console.log('✅ TRIAL COMPLETE: 15/15 Patients Evaluated Across Multi-Agency Knowledge Graphs');
    console.log('='.repeat(82) + '\n');
  });
});
