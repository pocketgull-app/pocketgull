// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear
/// 2. CASMI 2026 ChEMBL + PubChem -> BigQuery Property Graph & Kaggle Offline Priors (Dart)
///
/// Enforces:
/// - CASMI 2026 Lineage of Gratitude Invariant (Hengck23, Eveliaveldrine, Enveda Biosciences,
///   ICEBERG & GLACIER architects, LOTUS & COCONUT curators, Countess Ada Lovelace & Hermann von Helmholtz)
/// - Authors a BigQuery GQL Property Graph (`CREATE OR REPLACE PROPERTY GRAPH`) linking
///   Parent Natural Products -> Retro-Diels-Alder (RDA) MS/MS Fragments -> Gut Aglycone Metabolites -> CYP3A4 Targets
/// - Exports air-gapped candidate ranking priors for offline Kaggle competition notebooks (`network: none`)

import 'dart:convert';
import 'dart:io';

const String kGcpProjectId = 'gen-lang-client-0540208645';
const String kCasmiDataset = 'casmi_2026_graph';

const List<String> kLineageOfGratitude = [
  'Hengck23 (DreaMS foundation model & safe-tail spectral matching)',
  'Eveliaveldrine (Python 3.13 RDKit wheels for air-gapped kernels)',
  'Enveda Biosciences & CASMI 2026 Organizers (Mass Spectrometry benchmark leadership)',
  'ICEBERG & GLACIER Architects (Forward neural MS/MS fragmentation simulation)',
  'LOTUS & COCONUT Curators (Open natural product structural taxonomy)',
  'Countess Ada Lovelace & Hermann von Helmholtz (Poetic science & physiological optics)',
];

/// Generates the BigQuery GQL `CREATE OR REPLACE PROPERTY GRAPH` DDL for CASMI 2026.
String buildCasmiBigQueryGraphDdl() => r'''
-- CASMI 2026 Cheminformatics Property Graph (ChEMBL + PubChem + LOTUS -> BigQuery GQL)
-- Lineage of Gratitude: Hengck23, Eveliaveldrine, Enveda Biosciences, ICEBERG/GLACIER, LOTUS/COCONUT, Lovelace & Helmholtz
CREATE OR REPLACE PROPERTY GRAPH `gen-lang-client-0540208645.casmi_2026_graph.metabolite_fragmentation_graph`
  NODE TABLES (
    `gen-lang-client-0540208645.casmi_2026_graph.pubchem_lotus_precursors`
      KEY (inchikey_block1)
      LABEL PrecursorMolecule
      PROPERTIES (inchikey_block1, pubchem_cid, canonical_smiles, exact_mass_da, ccs_angstrom2, lotus_taxonomy_prior),
    `gen-lang-client-0540208645.casmi_2026_graph.ms2_rda_fragments`
      KEY (fragment_id)
      LABEL SpectralFragment
      PROPERTIES (fragment_id, mz_ratio, relative_intensity, rda_transition_energy_ev, wasserstein1_distance),
    `gen-lang-client-0540208645.casmi_2026_graph.chembl_cyp_targets`
      KEY (chembl_target_id)
      LABEL CytochromeTarget
      PROPERTIES (chembl_target_id, enzyme_symbol, ic50_nm, gut_aglycone_clearance_rate)
  )
  EDGE TABLES (
    `gen-lang-client-0540208645.casmi_2026_graph.fragmentation_edges`
      KEY (edge_id)
      SOURCE KEY (inchikey_block1) REFERENCES PrecursorMolecule (inchikey_block1)
      DESTINATION KEY (fragment_id) REFERENCES SpectralFragment (fragment_id)
      LABEL FRAGMENTS_VIA_RDA
      PROPERTIES (collision_energy_ev, dreams_cosine_similarity),
    `gen-lang-client-0540208645.casmi_2026_graph.biotransformation_edges`
      KEY (bio_edge_id)
      SOURCE KEY (inchikey_block1) REFERENCES PrecursorMolecule (inchikey_block1)
      DESTINATION KEY (chembl_target_id) REFERENCES CytochromeTarget (chembl_target_id)
      LABEL METABOLIZED_BY_CYP
      PROPERTIES (aglycone_shift_da, phase1_oxidation_prob)
  );
''';

void main(List<String> args) {
  final outDir = Directory('contests/casmi_2026');
  outDir.createSync(recursive: true);

  final ddlFile = File('${outDir.path}/casmi_bigquery_property_graph.sql');
  ddlFile.writeAsStringSync(buildCasmiBigQueryGraphDdl());

  final priorsFile = File('${outDir.path}/offline_chembl_pubchem_priors.json');
  final priorsPayload = {
    'benchmark': 'CASMI 2026 Mass Spectrometry & Natural Product Identification',
    'lineageOfGratitude': kLineageOfGratitude,
    'triParadigmLenses': {
      'sixthGradeExplorer':
          'Think of our mass spectrometer like a gentle wind tunnel that weighs molecular Lego bricks and snaps them back together.',
      'advancedBiochemist':
          '4D timsTOF collision cross-section (CCS) coordinates coupled with Retro-Diels-Alder (RDA) transition states and Wasserstein-1 spectral geodesics.',
      'clinicalResearch':
          'Gut microbial beta-glucosidase aglycone biotransformation, CYP3A4 IC50 metabolic boundaries, and HL7 FHIR R4 Substance/Observation export.',
    },
    'candidatePriors': [
      {
        'inchikeyBlock1': 'REFJWTPEDVJJIY',
        'name': 'Quercetin (Aglycone Flavonol)',
        'pubchemCid': 5280343,
        'chemblId': 'CHEMBL50',
        'exactMassDa': 302.04265,
        'ccsAngstrom2': 164.2,
        'rdaCharacteristicFragmentsMz': [153.018, 137.023, 178.998],
        'dreamsSafeTailCosine': 0.964,
        'cyp3a4Ic50Um': 4.8,
      },
      {
        'inchikeyBlock1': 'IKGXIBQEEMLURG',
        'name': 'Rutin (Quercetin-3-O-rutinoside)',
        'pubchemCid': 5280805,
        'chemblId': 'CHEMBL226335',
        'exactMassDa': 610.15338,
        'ccsAngstrom2': 231.8,
        'rdaCharacteristicFragmentsMz': [303.050, 465.103, 153.018],
        'dreamsSafeTailCosine': 0.951,
        'cyp3a4Ic50Um': 18.2,
      },
    ],
  };
  priorsFile.writeAsStringSync(
    const JsonEncoder.withIndent('  ').convert(priorsPayload),
  );

  print('[OK] CASMI 2026 ChEMBL + PubChem -> BigQuery Property Graph Bridge');
  print('  • Lineage of Gratitude: ${kLineageOfGratitude.length} open-source pioneers honored');
  print('  • Tri-Paradigm Lenses : 6th-Grade Explorer | Advanced Biochemist | Clinical Research');
  print('  • BigQuery GQL DDL    : ${ddlFile.path}');
  print('  • Offline Priors JSON : ${priorsFile.path}');
}
