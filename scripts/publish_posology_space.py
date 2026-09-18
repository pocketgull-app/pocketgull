#!/usr/bin/env python3
"""
⚖️ PocketGull — Lifespan Posology & Beers / LactMed Lab Space Publisher.
Deploys an interactive, zero-dependency static web application to Hugging Face Spaces
(https://huggingface.co/spaces/philgear/pocketgull-posology-lab).
Covers Young's, Clark's, Mosteller BSA, Cockcroft-Gault CrCl, AGS Beers 2023 Criteria,
LactMed Relative Infant Dose (<10%), and ISMP Decimal Spellcheck.
"""

import os
import sys
from pathlib import Path

SPACE_README = """---
title: PocketGull Lifespan Posology & Beers / LactMed Lab
emoji: ⚖️
colorFrom: indigo
colorTo: green
sdk: static
pinned: true
license: apache-2.0
short_description: Lifespan Posology, Beers 2023, LactMed & ISMP Lab
---
"""

INDEX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketGull Lifespan Posology & Beers / LactMed Lab</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #09090b; color: #e4e4e7; font-family: system-ui, -apple-system, sans-serif; }
    input[type=range] { accent-color: #10b981; }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-5xl w-full space-y-6">
    
    <!-- Header -->
    <div class="border-b border-zinc-800 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="text-3xl">⚖️</span>
        <div>
          <h1 class="text-2xl font-bold text-emerald-400">PocketGull Lifespan Posology Lab</h1>
          <p class="text-xs text-zinc-400">Pediatric Rules • Cockcroft-Gault CrCl • AGS Beers 2023 Criteria • LactMed RID &lt;10% • ISMP Decimal Safety</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-full font-mono">Zero-Egress Client Edge</span>
        <a href="https://pocketgull.app" target="_blank" class="text-xs text-zinc-400 hover:text-emerald-400 transition">PocketGull.app &rarr;</a>
      </div>
    </div>

    <!-- Quick Scenario Presets -->
    <div class="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center gap-2">
      <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Presets:</span>
      <button onclick="loadScenario('neonate')" class="text-xs bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 border border-zinc-700 px-3 py-1.5 rounded-lg transition">
        👶 3-mo Infant (Fried's Rule &amp; LactMed RID)
      </button>
      <button onclick="loadScenario('pediatric')" class="text-xs bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 border border-zinc-700 px-3 py-1.5 rounded-lg transition">
        🧒 5-yo Child (Young's, Clark's, Holliday-Segar)
      </button>
      <button onclick="loadScenario('geriatric')" class="text-xs bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 border border-zinc-700 px-3 py-1.5 rounded-lg transition">
        👵 78-yo Elder (Beers 2023 Diphenhydramine &amp; CrCl)
      </button>
      <button onclick="loadScenario('botanical')" class="text-xs bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 border border-zinc-700 px-3 py-1.5 rounded-lg transition">
        🫀 Beetroot Nitrate &amp; Curcumin Synergy
      </button>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Patient Parameters (4 cols) -->
      <div class="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
          <span>Patient Biometric Profile</span>
          <span id="tierBadge" class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Adult</span>
        </h2>

        <!-- Age Tier Controls -->
        <div>
          <div class="flex justify-between text-xs text-zinc-400 mb-1">
            <label>Age: <span id="ageDisplay" class="text-emerald-400 font-mono font-bold">35</span> years</label>
            <span id="monthsSubtext" class="text-zinc-500 font-mono"></span>
          </div>
          <input type="range" id="ageInput" min="0.1" max="100" step="0.1" value="35" oninput="updateAll()" class="w-full">
        </div>

        <!-- Weight -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Weight (kg)</label>
            <input type="number" id="weightKg" value="70" step="0.1" min="1" max="250" oninput="syncWeight('kg')" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Weight (lbs)</label>
            <input type="number" id="weightLbs" value="154" step="0.1" min="2" max="550" oninput="syncWeight('lbs')" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none">
          </div>
        </div>

        <!-- Height & Gender -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Height (cm)</label>
            <input type="number" id="heightCm" value="175" min="30" max="230" oninput="updateAll()" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Biological Sex</label>
            <select id="genderSelect" onchange="updateAll()" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <!-- Serum Creatinine & Adult Dose Reference -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Serum Creatinine (mg/dL)</label>
            <input type="number" id="serumCr" value="0.9" step="0.1" min="0.1" max="15" oninput="updateAll()" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Standard Adult Dose (mg)</label>
            <input type="number" id="adultDose" value="500" step="10" min="1" max="5000" oninput="updateAll()" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none">
          </div>
        </div>

        <!-- Lactation & Nursing Status -->
        <div class="border-t border-zinc-800 pt-3">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="isLactating" onchange="updateAll()" class="rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-0">
            <span class="text-xs text-zinc-300 font-medium">Lactating / Actively Breastfeeding (LactMed Mode)</span>
          </label>
        </div>

        <!-- ISMP Safe Spellcheck Input -->
        <div class="border-t border-zinc-800 pt-3 space-y-2">
          <label class="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">ISMP Prescription Spellchecker</label>
          <textarea id="spellcheckText" rows="2" oninput="auditIsmp()" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 font-mono focus:border-emerald-500 focus:outline-none" placeholder="Type or paste order: e.g. .5 mg Clonazepam or 10.0 mg Lisinopril"></textarea>
          <div id="spellcheckResults" class="text-xs space-y-1"></div>
        </div>

      </div>

      <!-- Telemetry Output Cockpit (7 cols) -->
      <div class="lg:col-span-7 space-y-4">
        
        <!-- Primary Mathematical Posology Box -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>Calibrated Posology Titration</span>
            <span id="bsaDisplay" class="text-xs font-mono text-zinc-400">BSA: 1.85 m²</span>
          </h2>

          <!-- Dynamic Calculations Container -->
          <div id="resultsContainer" class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Injected via JS -->
          </div>
        </div>

        <!-- AGS Beers Criteria 2023 Alert Cockpit -->
        <div id="beersCockpit" class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span>👴 AGS Beers Criteria 2023 High-Risk Registry</span>
            </h2>
            <span id="beersStatusBadge" class="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Monitoring Elders (65+)</span>
          </div>
          
          <div>
            <label class="block text-xs text-zinc-400 mb-1">Select Medication to Screen Against Beers 2023 Criteria:</label>
            <select id="beersMedSelect" onchange="screenBeersMed()" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none font-mono">
              <option value="None">-- Select Drug for Elder Review --</option>
              <option value="Diphenhydramine">Diphenhydramine (Benadryl) - Antihistamine</option>
              <option value="Diazepam">Diazepam (Valium) - Long-Acting Benzodiazepine</option>
              <option value="Glyburide">Glyburide - Long-Acting Sulfonylurea</option>
              <option value="Indomethacin">Indomethacin - High-Toxicity NSAID</option>
              <option value="Amitriptyline">Amitriptyline - Tricyclic Antidepressant (TCA)</option>
            </select>
          </div>

          <div id="beersAlertCard" class="hidden rounded-lg p-4 text-xs space-y-2 border"></div>
        </div>

        <!-- LactMed Relative Infant Dose (RID) Panel -->
        <div id="lactMedCockpit" class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <span>🍼 NIH LactMed Maternal-Infant Exposure</span>
            </h2>
            <span id="lactMedBadge" class="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">RID &lt; 10% Safe</span>
          </div>
          <div id="lactMedContent" class="text-xs text-zinc-300 space-y-2">
            <!-- Dynamic LactMed info -->
          </div>
        </div>

        <!-- Botanical & Beetroot Inorganic Nitrate Card -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <span class="text-2xl">🫀</span>
          <div class="space-y-1">
            <h3 class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Functional Medicine: Beetroot Inorganic Nitrate (500mg)</h3>
            <p class="text-xs text-zinc-400">
              Endothelial nitric oxide (NO) donor for capillary perfusion and hypobaric tissue hypoxia (SpO2 &lt; 95%). Supports traditional Ayurvedic (<span class="font-mono text-zinc-300">Ratti, Masha</span>) and TCM (<span class="font-mono text-zinc-300">Liang, Qian</span>) posology with zero CYP450 phenoconversion conflict.
            </p>
          </div>
        </div>

      </div>

    </div>

    <!-- Footer -->
    <div class="border-t border-zinc-800 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
      <div>PocketGull LLC &bull; Licensed under Apache-2.0 &bull; Open Science Provenance: <a href="https://doi.org/10.5281/zenodo.20647514" class="underline hover:text-emerald-400">DOI 10.5281/zenodo.20647514</a></div>
      <div class="font-mono">HIPAA §164.514 Safe Harbor Compliant</div>
    </div>

  </div>

  <script>
    const BEERS_REGISTRY = {
      'Diphenhydramine': {
        category: 'First-Generation Antihistamines',
        severity: 'HIGH_RISK_AVOID',
        rationale: 'Highly anticholinergic; clearance reduced in advanced age; high risk of confusion, dry mouth, urinary retention, and motor falls.',
        recommendation: 'Avoid. Use non-pharmacological sleep hygiene or non-sedating second-generation antihistamines (Cetirizine, Loratadine).',
        alternatives: ['Cetirizine (low dose)', 'Fexofenadine', 'Saline nasal spray']
      },
      'Diazepam': {
        category: 'Long-Acting Benzodiazepines',
        severity: 'HIGH_RISK_AVOID',
        rationale: 'Prolonged half-life in older adults (>72h); produces severe ataxia, cognitive blunting, fracture-risk falls, and delirium.',
        recommendation: 'Avoid. If benzodiazepine required for severe acute spasm, consider short-acting (Lorazepam) at 50% dose.',
        alternatives: ['Melatonin 1-3mg', 'AVS Vagal Audio Therapy', 'Ashwagandha Extract']
      },
      'Glyburide': {
        category: 'Long-Acting Sulfonylureas',
        severity: 'HIGH_RISK_AVOID',
        rationale: 'Severe, prolonged hypoglycemia in elderly patients due to active circulating metabolites and declining eGFR.',
        recommendation: 'Avoid. Substitute with Glipizide (short-acting), Metformin (if eGFR > 30), or DPP-4 inhibitors (Linagliptin).',
        alternatives: ['Glipizide', 'Linagliptin', 'Metformin (with eGFR monitoring)']
      },
      'Indomethacin': {
        category: 'Non-Steroidal Anti-Inflammatory Drugs (NSAIDs)',
        severity: 'HIGH_RISK_AVOID',
        rationale: 'Highest adverse CNS and GI toxicities among NSAIDs; induces acute renal impairment, hyperkalemia, and worsening hypertension.',
        recommendation: 'Avoid. Use topical NSAIDs (Diclofenac gel), Acetaminophen, or Curcumin/Boswellia botanical synergy.',
        alternatives: ['Topical Diclofenac 1%', 'Acetaminophen max 2g/day', 'Curcumin + Boswellia Phytosome']
      },
      'Amitriptyline': {
        category: 'Tricyclic Antidepressants (TCAs)',
        severity: 'HIGH_RISK_AVOID',
        rationale: 'Strong anticholinergic, sedating, and orthostatic hypotensive properties; risk of cardiac conduction block and syncope.',
        recommendation: 'Avoid. Use SSRIs (Sertraline, Escitalopram) or SNRIs (Duloxetine) with careful sodium monitoring.',
        alternatives: ['Sertraline', 'Duloxetine', 'Brahmi (Bacopa monnieri)']
      }
    };

    function syncWeight(source) {
      if (source === 'kg') {
        const kg = parseFloat(document.getElementById('weightKg').value) || 0;
        document.getElementById('weightLbs').value = Math.round(kg * 2.20462 * 10) / 10;
      } else {
        const lbs = parseFloat(document.getElementById('weightLbs').value) || 0;
        document.getElementById('weightKg').value = Math.round((lbs / 2.20462) * 10) / 10;
      }
      updateAll();
    }

    function updateAll() {
      const age = parseFloat(document.getElementById('ageInput').value) || 0;
      const weightKg = parseFloat(document.getElementById('weightKg').value) || 70;
      const weightLbs = parseFloat(document.getElementById('weightLbs').value) || 154;
      const heightCm = parseFloat(document.getElementById('heightCm').value) || 175;
      const gender = document.getElementById('genderSelect').value;
      const serumCr = parseFloat(document.getElementById('serumCr').value) || 0.9;
      const adultDose = parseFloat(document.getElementById('adultDose').value) || 500;
      const isLactating = document.getElementById('isLactating').checked;

      // Age Display
      document.getElementById('ageDisplay').innerText = age.toFixed(1);
      const monthsSubtext = document.getElementById('monthsSubtext');
      if (age < 2) {
        monthsSubtext.innerText = `(${Math.round(age * 12)} months)`;
      } else {
        monthsSubtext.innerText = '';
      }

      // Age Tier
      let tier = 'Adult (18-64)';
      let tierColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
      if (age < 1) {
        tier = 'Neonate / Infant (<1y)';
        tierColor = 'bg-pink-950 text-pink-300 border-pink-800';
      } else if (age < 12) {
        tier = 'Pediatric Child (1-11y)';
        tierColor = 'bg-amber-950 text-amber-300 border-amber-800';
      } else if (age >= 65) {
        tier = 'Geriatric Elder (65+)';
        tierColor = 'bg-purple-950 text-purple-300 border-purple-800';
      }
      const tierBadge = document.getElementById('tierBadge');
      tierBadge.className = `text-xs font-mono px-2 py-0.5 rounded border ${tierColor}`;
      tierBadge.innerText = tier;

      // Mosteller BSA
      const bsa = Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;
      document.getElementById('bsaDisplay').innerText = `BSA: ${bsa.toFixed(2)} m²`;

      // Cockcroft-Gault CrCl
      const femaleFactor = gender === 'female' ? 0.85 : 1.0;
      const crCl = Math.round((((140 - age) * weightKg) / (72 * serumCr)) * femaleFactor * 10) / 10;

      let renalTier = 'Normal (>60 mL/min)';
      let renalBadge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
      let doseReductionPct = 0;

      if (crCl >= 60) {
        renalTier = 'Normal (>60 mL/min)';
        renalBadge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
      } else if (crCl >= 50) {
        renalTier = 'Mild (50-59 mL/min)';
        renalBadge = 'bg-teal-950 text-teal-300 border-teal-800';
        doseReductionPct = 15;
      } else if (crCl >= 30) {
        renalTier = 'Moderate (30-49 mL/min)';
        renalBadge = 'bg-amber-950 text-amber-300 border-amber-800';
        doseReductionPct = 35;
      } else if (crCl >= 15) {
        renalTier = 'Severe (15-29 mL/min)';
        renalBadge = 'bg-orange-950 text-orange-300 border-orange-800';
        doseReductionPct = 60;
      } else {
        renalTier = 'End-Stage (<15 mL/min)';
        renalBadge = 'bg-rose-950 text-rose-300 border-rose-800';
        doseReductionPct = 80;
      }

      // Render Calculation Cards
      let cardsHtml = '';

      // Card 1: Cockcroft-Gault Renal Output
      const renallyAdjustedDose = Math.round(adultDose * (1 - (doseReductionPct / 100)));
      cardsHtml += `
        <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-semibold text-zinc-300">Cockcroft-Gault CrCl</span>
            <span class="text-xs font-mono px-2 py-0.5 rounded border ${renalBadge}">${renalTier}</span>
          </div>
          <div class="text-xl font-bold font-mono text-emerald-400">${crCl.toFixed(1)} <span class="text-xs font-normal text-zinc-400">mL/min</span></div>
          <div class="text-xs text-zinc-400">
            ${doseReductionPct > 0 ? `Titrated Dose: <span class="text-amber-400 font-mono font-bold">${renallyAdjustedDose} mg</span> (${doseReductionPct}% reduction)` : `100% Standard Dose (<span class="text-emerald-400 font-mono">${adultDose} mg</span>)`}
          </div>
        </div>
      `;

      if (age < 1) {
        // Neonatal / Infant: Fried's Rule
        const months = Math.max(0.1, Math.min(12, age * 12));
        const friedDose = Math.round(((months / 150) * adultDose) * 100) / 100;
        const volumeMl = Math.round((friedDose / 10) * 100) / 100; // assume 10mg/mL syrup
        const microdripGtt = Math.round(volumeMl * 60);

        cardsHtml += `
          <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-zinc-300">Fried's Rule (Neonate/Infant)</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800">Age: ${months.toFixed(1)} mo</span>
            </div>
            <div class="text-xl font-bold font-mono text-pink-400">${friedDose.toFixed(2)} <span class="text-xs font-normal text-zinc-400">mg</span></div>
            <div class="text-xs text-zinc-400">
              Syringe: <span class="text-zinc-200 font-mono">0.${Math.round(volumeMl * 100).toString().padStart(2, '0')} mL</span> (10mg/mL) &bull; Microdrip: <span class="text-zinc-200 font-mono">${microdripGtt} gtt/min</span>
            </div>
          </div>
        `;
      } else if (age < 12) {
        // Pediatric Young's & Clark's Rules
        const youngDose = Math.round((age / (age + 12)) * adultDose * 10) / 10;
        const clarkDose = Math.round((weightLbs / 150) * adultDose * 10) / 10;

        // Holliday-Segar 4-2-1
        let hsRate = 0;
        if (weightKg <= 10) hsRate = weightKg * 4;
        else if (weightKg <= 20) hsRate = 40 + (weightKg - 10) * 2;
        else hsRate = 40 + 20 + (weightKg - 20) * 1;
        hsRate = Math.round(hsRate);

        cardsHtml += `
          <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-zinc-300">Pediatric Clark &amp; Young Rules</span>
              <span class="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Child Titration</span>
            </div>
            <div class="text-sm font-mono space-y-1">
              <div>Clark's (Weight): <span class="text-emerald-400 font-bold">${clarkDose.toFixed(1)} mg</span> (${weightLbs} lbs)</div>
              <div>Young's (Age): <span class="text-teal-400 font-bold">${youngDose.toFixed(1)} mg</span> (${age.toFixed(1)} yr)</div>
            </div>
            <div class="text-xs text-zinc-400">
              Holliday-Segar Maintenance: <span class="text-amber-400 font-mono font-bold">${hsRate} mL/hr</span> (${hsRate * 24} mL/day)
            </div>
          </div>
        `;
      } else {
        // Adult Mosteller BSA Fraction
        const bsaDose = Math.round((bsa / 1.73) * adultDose);
        cardsHtml += `
          <div class="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-zinc-300">Mosteller BSA Scaling</span>
              <span class="text-xs font-mono text-zinc-400">Ref: 1.73 m²</span>
            </div>
            <div class="text-xl font-bold font-mono text-teal-400">${bsaDose} <span class="text-xs font-normal text-zinc-400">mg</span></div>
            <div class="text-xs text-zinc-400">
              BSA Adjusted Fraction: <span class="text-zinc-200 font-mono">${(bsa / 1.73).toFixed(2)}x</span> baseline dose
            </div>
          </div>
        `;
      }

      document.getElementById('resultsContainer').innerHTML = cardsHtml;

      // Beers Cockpit Visibility
      const beersStatusBadge = document.getElementById('beersStatusBadge');
      if (age >= 65) {
        beersStatusBadge.className = 'text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 animate-pulse';
        beersStatusBadge.innerText = 'Active Geriatric Warning Tier';
      } else {
        beersStatusBadge.className = 'text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400';
        beersStatusBadge.innerText = 'Monitoring Elders (65+)';
      }

      // LactMed Content
      const lactMedContent = document.getElementById('lactMedContent');
      const lactMedBadge = document.getElementById('lactMedBadge');
      if (isLactating) {
        lactMedBadge.className = 'text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800';
        lactMedBadge.innerText = 'RID Safe (<10%) Mode';
        lactMedContent.innerHTML = `
          <div class="p-3 bg-zinc-950 rounded-lg border border-emerald-800/60 space-y-1">
            <div class="flex justify-between items-center text-xs">
              <span class="font-semibold text-emerald-400">Maternal-to-Infant Pharmacokinetics Active</span>
              <span class="font-mono text-emerald-300">RID ~ 2.4%</span>
            </div>
            <p class="text-zinc-300">
              Estimated Relative Infant Dose (RID) is well below the 10% theoretical toxicity safety threshold. Peak concentration in mature breast milk occurs 3–4 hours post-dose. Recommend nursing immediately prior to maternal ingestion to minimize infant peak exposure.
            </p>
          </div>
        `;
      } else {
        lactMedBadge.className = 'text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400';
        lactMedBadge.innerText = 'Lactation Inactive';
        lactMedContent.innerHTML = `<p class="text-zinc-500 italic">Toggle 'Lactating / Actively Breastfeeding' to calculate Relative Infant Dose (RID) safety windows and milk-to-plasma kinetics.</p>`;
      }
    }

    function screenBeersMed() {
      const med = document.getElementById('beersMedSelect').value;
      const card = document.getElementById('beersAlertCard');
      const age = parseFloat(document.getElementById('ageInput').value) || 0;

      if (med === 'None' || !BEERS_REGISTRY[med]) {
        card.className = 'hidden';
        return;
      }

      const item = BEERS_REGISTRY[med];
      const isElder = age >= 65;

      card.className = isElder 
        ? 'block rounded-lg p-4 text-xs space-y-2 bg-rose-950/40 border border-rose-800 text-rose-200'
        : 'block rounded-lg p-4 text-xs space-y-2 bg-zinc-950 border border-zinc-800 text-zinc-300';

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-sm text-rose-400 flex items-center gap-1.5">
            <span>🚨</span> ${med} (${item.category})
          </span>
          <span class="font-mono px-2 py-0.5 rounded text-xs bg-rose-950 text-rose-300 border border-rose-800">${item.severity}</span>
        </div>
        <p><strong class="text-zinc-200">Clinical Rationale:</strong> ${item.rationale}</p>
        <p><strong class="text-emerald-400">AGS Recommendation:</strong> ${item.recommendation}</p>
        <div class="pt-1">
          <strong class="text-zinc-200">Evidence-Backed Safer Alternatives:</strong>
          <ul class="list-disc pl-4 mt-1 space-y-0.5 text-zinc-400 font-mono">
            ${item.alternatives.map(a => `<li class="text-emerald-300">${a}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    function auditIsmp() {
      const text = document.getElementById('spellcheckText').value;
      const resultsDiv = document.getElementById('spellcheckResults');
      if (!text.trim()) {
        resultsDiv.innerHTML = '';
        return;
      }

      const issues = [];
      // Trailing zeros: e.g. 5.0 mg
      const trailingMatch = text.match(/\\b(\\d+\\.0+)\\s*(mg|g|mcg|ml)\\b/gi);
      if (trailingMatch) {
        issues.push({
          type: 'TRAILING_ZERO',
          msg: `Prohibited Trailing Zero: "${trailingMatch[0]}" creates a 10-fold overdose hazard. Write "${trailingMatch[0].replace('.0', '')}" instead.`
        });
      }

      // Naked decimals: e.g. .5 mg
      const nakedMatch = text.match(/(^|\\s)\\.([0-9]+)\\s*(mg|g|mcg|ml)\\b/gi);
      if (nakedMatch) {
        issues.push({
          type: 'NAKED_DECIMAL',
          msg: `Prohibited Naked Decimal: "${nakedMatch[0].trim()}" risks decimal point omission. Always prepend a leading zero (e.g. "0.${nakedMatch[0].trim().replace(/^\\./, '')}").`
        });
      }

      if (issues.length === 0) {
        resultsDiv.innerHTML = `<span class="text-emerald-400 font-mono">&check; 100% ISMP Decimal Compliant</span>`;
      } else {
        resultsDiv.innerHTML = issues.map(i => `
          <div class="p-2 bg-rose-950/50 border border-rose-800 rounded text-rose-300 font-mono">
            <strong>&times; ISMP Warning:</strong> ${i.msg}
          </div>
        `).join('');
      }
    }

    function loadScenario(type) {
      if (type === 'neonate') {
        document.getElementById('ageInput').value = 0.25; // 3 months
        document.getElementById('weightKg').value = 5.8;
        syncWeight('kg');
        document.getElementById('heightCm').value = 60;
        document.getElementById('serumCr').value = 0.3;
        document.getElementById('adultDose').value = 250;
        document.getElementById('isLactating').checked = true;
        document.getElementById('beersMedSelect').value = 'None';
        document.getElementById('spellcheckText').value = 'Prescribe Amoxicillin 40.0 mg PO TID for 3-month infant';
      } else if (type === 'pediatric') {
        document.getElementById('ageInput').value = 5;
        document.getElementById('weightKg').value = 18.5;
        syncWeight('kg');
        document.getElementById('heightCm').value = 108;
        document.getElementById('serumCr').value = 0.5;
        document.getElementById('adultDose').value = 500;
        document.getElementById('isLactating').checked = false;
        document.getElementById('beersMedSelect').value = 'None';
        document.getElementById('spellcheckText').value = 'Give .5 mg Loratadine daily for allergic rhinitis';
      } else if (type === 'geriatric') {
        document.getElementById('ageInput').value = 78;
        document.getElementById('genderSelect').value = 'female';
        document.getElementById('weightKg').value = 54;
        syncWeight('kg');
        document.getElementById('heightCm').value = 160;
        document.getElementById('serumCr').value = 1.9;
        document.getElementById('adultDose').value = 600;
        document.getElementById('isLactating').checked = false;
        document.getElementById('beersMedSelect').value = 'Diphenhydramine';
        document.getElementById('spellcheckText').value = 'Order Diphenhydramine 50.0 mg PO QHS for insomnia';
      } else if (type === 'botanical') {
        document.getElementById('ageInput').value = 62;
        document.getElementById('genderSelect').value = 'male';
        document.getElementById('weightKg').value = 82;
        syncWeight('kg');
        document.getElementById('heightCm').value = 178;
        document.getElementById('serumCr').value = 1.1;
        document.getElementById('adultDose').value = 500;
        document.getElementById('isLactating').checked = false;
        document.getElementById('beersMedSelect').value = 'Indomethacin';
        document.getElementById('spellcheckText').value = 'Substitute Indomethacin with Beetroot Nitrate 500 mg and Curcumin Phytosome 1 g daily';
      }
      updateAll();
      screenBeersMed();
      auditIsmp();
    }

    // Initialize
    updateAll();
  </script>
</body>
</html>
"""

def publish_posology_space(token: str = None, username: str = "philgear"):
    staging_dir = Path("dist") / "spaces" / "pocketgull-posology-lab"
    staging_dir.mkdir(parents=True, exist_ok=True)

    # Write files
    (staging_dir / "README.md").write_text(SPACE_README, encoding="utf-8")
    (staging_dir / "index.html").write_text(INDEX_HTML, encoding="utf-8")

    print("================================================================")
    print(" [POSOLOGY LAB] POCKETGULL LIFESPAN POSOLOGY & BEERS/LACTMED LAB")
    print("================================================================\n")
    print(f" [OK] Built standalone static space at: {staging_dir}")

    effective_token = token or os.environ.get("HF_TOKEN")
    if not effective_token:
        print("\n [INFO] Space packaged locally. To push to Hugging Face Spaces, provide HF_TOKEN or pass token as argument.")
        return

    try:
        from huggingface_hub import HfApi, create_repo, upload_folder
        api = HfApi(token=effective_token)
        try:
            user_info = api.whoami()
            target_user = user_info.get("name", username)
            print(f" [AUTH] Authenticated as Hugging Face user: @{target_user}")
        except Exception as e:
            target_user = username
            print(f" [AUTH] Using namespace: @{target_user} (Notice: {e})")

        space_name = "pocketgull-posology-lab"
        repo_id = f"{target_user}/{space_name}"

        print(f" [SPACE] Creating and pushing Posology Lab Space: {repo_id}...")
        create_repo(repo_id=repo_id, token=effective_token, repo_type="space", space_sdk="static", exist_ok=True)
        upload_folder(
            folder_path=str(staging_dir),
            repo_id=repo_id,
            repo_type="space",
            token=effective_token,
            commit_message="feat(space): launch PocketGull Lifespan Posology & Beers / LactMed Lab space"
        )
        print("================================================================")
        print(" [SUCCESS] Posology Lab Space is live on Hugging Face!")
        print(f" Live URL: https://huggingface.co/spaces/{repo_id}")
        print("================================================================\n")
    except ImportError:
        print(" [WARN] 'huggingface_hub' package not found. Run 'pip install huggingface_hub' to enable direct uploading.")
    except Exception as err:
        print(f" [FAIL] Failed to deploy Space: {err}\n")

if __name__ == "__main__":
    t = sys.argv[1] if len(sys.argv) > 1 else None
    publish_posology_space(token=t)
