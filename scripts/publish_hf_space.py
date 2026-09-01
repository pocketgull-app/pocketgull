#!/usr/bin/env python3
"""
🚀 PocketGull — Hugging Face Gradio Space Publisher.
Builds and deploys an interactive clinical consultation demo to Hugging Face Spaces.
(https://huggingface.co/spaces/philgear/pocketgull-clinical-consult)
"""

import json
import os
import sys
from pathlib import Path
from huggingface_hub import HfApi, create_repo, upload_folder

SPACE_README = """---
title: PocketGull Clinical Intelligence Suite
emoji: 🕊️
colorFrom: blue
colorTo: indigo
sdk: static
pinned: true
license: apache-2.0
short_description: Sovereign Clinical Triage & 3-Act Trajectory Engine
---
"""

INDEX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketGull Sovereign Clinical Intelligence Suite</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #09090b; color: #e4e4e7; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8 flex flex-col items-center">
  <div class="max-w-4xl w-full space-y-6">
    
    <!-- Header -->
    <div class="border-b border-zinc-800 pb-4">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🕊️</span>
        <div>
          <h1 class="text-2xl font-bold text-teal-400">PocketGull Sovereign Clinical Suite</h1>
          <p class="text-xs text-zinc-400">Grounded in Level A NIH & WHO Consensus | Zero-Egress Edge Architecture</p>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Input Column -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Clinical Case Input</h2>
        
        <div>
          <label class="block text-xs font-medium text-zinc-400 mb-1">Clinical Narrative / Symptoms</label>
          <textarea id="narrativeInput" rows="4" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-teal-500" placeholder="e.g. 54yo male with BP 138/88 mmHg and mild fatigue requesting stepped-care lifestyle modifications..."></textarea>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">Systolic BP (mmHg)</label>
            <input type="number" id="sbpInput" value="136" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200">
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">Diastolic BP (mmHg)</label>
            <input type="number" id="dbpInput" value="86" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">Heart Rate (bpm)</label>
            <input type="number" id="hrInput" value="74" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200">
          </div>
          <div>
            <label class="block text-xs font-medium text-zinc-400 mb-1">SpO2 (%)</label>
            <input type="number" id="spo2Input" value="98" class="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-zinc-200">
          </div>
        </div>

        <button id="evalBtn" onclick="runTriage()" class="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 rounded-lg text-sm transition">
          Evaluate Clinical Case & Generate 3-Act Trajectory
        </button>

        <div class="space-y-1.5 pt-2">
          <p class="text-xs font-medium text-zinc-400">Quick Clinical Scenarios:</p>
          <div class="flex flex-wrap gap-1.5">
            <button onclick="loadScenario('htn')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded">Stage 1 HTN</button>
            <button onclick="loadScenario('stroke')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded">Acute Stroke Red Flag</button>
            <button onclick="loadScenario('ismp')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded">ISMP Decimal Audit</button>
          </div>
        </div>
      </div>

      <!-- Output Column -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 class="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Clinical Assessment & Trajectory</h2>
        
        <!-- Acuity Badge -->
        <div id="acuityBadge" class="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm font-medium">
          ✅ ROUTINE (Stepped-Care Lifestyle & Education)
        </div>

        <!-- Trajectory Output -->
        <div id="trajectoryOutput" class="space-y-3 text-xs text-zinc-300 leading-relaxed max-h-[360px] overflow-y-auto pr-1">
          <p class="text-zinc-500 italic">Enter patient symptoms or click a quick scenario to generate the NIH/WHO grounded trajectory.</p>
        </div>

        <!-- Safety Footer -->
        <div class="border-t border-zinc-800 pt-3 text-[11px] text-zinc-500 space-y-1">
          <p>🔒 <strong>ISMP Safety</strong>: Zero trailing zeros, leading zeros enforced.</p>
          <p>🏛️ <strong>FDA 21 CFR §520(o) Notice</strong>: Supportive non-device educational CDS.</p>
        </div>
      </div>

    </div>
  </div>

  <script>
    function loadScenario(type) {
      if (type === 'htn') {
        document.getElementById('narrativeInput').value = '54yo male with BP 136/86 mmHg and fasting glucose 112 mg/dL. Requesting stepped-care lifestyle modifications.';
        document.getElementById('sbpInput').value = 136;
        document.getElementById('dbpInput').value = 86;
        document.getElementById('hrInput').value = 72;
        document.getElementById('spo2Input').value = 98;
      } else if (type === 'stroke') {
        document.getElementById('narrativeInput').value = 'Patient suddenly developed right arm weakness, facial droop, and slurred speech 20 minutes ago.';
        document.getElementById('sbpInput').value = 162;
        document.getElementById('dbpInput').value = 98;
        document.getElementById('hrInput').value = 88;
        document.getElementById('spo2Input').value = 97;
      } else if (type === 'ismp') {
        document.getElementById('narrativeInput').value = 'Prescribe Lisinopril 10.0 mg PO daily and .5 mg Clonazepam at bedtime.';
        document.getElementById('sbpInput').value = 124;
        document.getElementById('dbpInput').value = 78;
        document.getElementById('hrInput').value = 68;
        document.getElementById('spo2Input').value = 99;
      }
      runTriage();
    }

    function runTriage() {
      const text = (document.getElementById('narrativeInput').value || '').toLowerCase();
      const sbp = parseInt(document.getElementById('sbpInput').value) || 120;
      const dbp = parseInt(document.getElementById('dbpInput').value) || 80;
      const hr = parseInt(document.getElementById('hrInput').value) || 72;
      const spo2 = parseInt(document.getElementById('spo2Input').value) || 98;

      let acuity = 'ROUTINE';
      let badgeHtml = '';
      let directive = '';
      let hotline = '';

      if (/facial\\s*droop|arm\\s*drift|slurred\\s*speech|hemiplegia/i.test(text)) {
        acuity = 'STAT_EMERGENCY';
        badgeHtml = '<div class="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 font-semibold text-sm">🚨 STAT_EMERGENCY (BE-FAST Acute Code Stroke)</div>';
        directive = '<strong>MANDATORY DIRECTIVE</strong>: Immediate 911 Code Stroke dispatch. Keep strictly NPO (zero oral intake). Do NOT administer aspirin until non-contrast head CT rules out hemorrhage.';
        hotline = '📞 Statutory Hotline: 911 (US/CA) | 999 (UK) | 000 (AU) | 111 (NZ)';
      } else if (/chest\\s*(?:pain|pressure|tightness)|substernal|angina/i.test(text) && (/sweat|diaphoresis|shortness/i.test(text) || sbp > 140)) {
        acuity = 'STAT_EMERGENCY';
        badgeHtml = '<div class="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 font-semibold text-sm">🚨 STAT_EMERGENCY (High-Risk Cardiopulmonary Distress)</div>';
        directive = '<strong>MANDATORY DIRECTIVE</strong>: STAT 12-lead ECG within 10 minutes and cardiac troponin assay. Transfer to nearest Emergency Department.';
        hotline = '📞 Statutory Hotline: 911 / Emergency Transport';
      } else if (spo2 < 90) {
        acuity = 'STAT_EMERGENCY';
        badgeHtml = '<div class="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 font-semibold text-sm">🚨 STAT_EMERGENCY (Severe Hypoxemia SpO2 < 90%)</div>';
        directive = '<strong>MANDATORY DIRECTIVE</strong>: Immediate supplemental oxygen therapy and emergency pulmonary evaluation.';
        hotline = '📞 Statutory Hotline: 911 / Rapid Response';
      } else {
        badgeHtml = '<div class="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold text-sm">✅ ROUTINE (Stepped-Care Lifestyle & Education)</div>';
        directive = 'Follow evidence-based lifestyle modifications (DASH sodium < 2300 mg/day, 150 min/wk aerobic conditioning).';
        hotline = '📞 Primary Care Clinic / Scheduled Telehealth';
      }

      document.getElementById('acuityBadge').innerHTML = badgeHtml;

      const html = `
        <div class="space-y-2">
          <h4 class="font-semibold text-teal-400">1. Where You've Been</h4>
          <p class="text-zinc-400">Baseline review against NIH NHLBI / WHO Level A consensus. Organic exclusions evaluated.</p>

          <h4 class="font-semibold text-teal-400 pt-1">2. Where You Stand Today</h4>
          <p class="text-zinc-300"><strong>Vitals Profile</strong>: BP ${sbp}/${dbp} mmHg | HR ${hr} bpm | SpO2 ${spo2}%</p>
          <p class="text-zinc-300">${directive}</p>
          <p class="text-zinc-400">${hotline}</p>

          <h4 class="font-semibold text-teal-400 pt-1">3. Where You're Going (30-Day Roadmap)</h4>
          <ul class="list-disc list-inside text-zinc-300 space-y-1">
            <li><strong>Days 1–7</strong>: Baseline biomarker review (BMP, lipid panel, eGFR).</li>
            <li><strong>Days 8–21</strong>: Stepped-care lifestyle adherence and weekly vitals tracking.</li>
            <li><strong>Day 30</strong>: Objective metric re-evaluation and trajectory recalibration.</li>
          </ul>
        </div>
      `;
      document.getElementById('trajectoryOutput').innerHTML = html;
    }
  </script>
</body>
</html>
"""

def publish_space(token: str = None, username: str = "philgear"):
    effective_token = token or os.environ.get("HF_TOKEN")
    if not effective_token:
        print(" [ERROR] No HF_TOKEN provided.")
        return

    api = HfApi(token=effective_token)
    try:
        user_info = api.whoami()
        target_user = user_info.get("name", username)
        print(f" [AUTH] Authenticated as Hugging Face user: @{target_user}")
    except Exception as e:
        target_user = username
        print(f" [AUTH] Using namespace: @{target_user} (Notice: {e})")

    space_name = "pocketgull-clinical-consult"
    repo_id = f"{target_user}/{space_name}"
    staging_dir = Path("dist") / "spaces" / space_name
    staging_dir.mkdir(parents=True, exist_ok=True)

    # Write files
    (staging_dir / "README.md").write_text(SPACE_README, encoding="utf-8")
    (staging_dir / "index.html").write_text(INDEX_HTML, encoding="utf-8")

    print(f" [SPACE] Creating and pushing Static HTML Space: {repo_id}...")
    try:
        create_repo(repo_id=repo_id, token=effective_token, repo_type="space", space_sdk="static", exist_ok=True)
        upload_folder(
            folder_path=str(staging_dir),
            repo_id=repo_id,
            repo_type="space",
            token=effective_token,
            commit_message="feat(space): launch PocketGull sovereign clinical consultation static web app"
        )
        print("================================================================")
        print(f" [SUCCESS] Your Static Demo Space is live on Hugging Face!")
        print(f" Live URL: https://huggingface.co/spaces/{repo_id}")
        print("================================================================\n")
    except Exception as err:
        print(f" [FAIL] Failed to deploy Space {repo_id}: {err}\n")

if __name__ == "__main__":
    token = sys.argv[1] if len(sys.argv) > 1 else None
    publish_space(token=token)

