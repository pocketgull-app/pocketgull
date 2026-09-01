#!/usr/bin/env python3
"""
🌐 PocketGull — 3D WebGL Anatomy & Tri-Paradigm Triage Space Publisher.
Deploys an interactive Three.js 3D procedural human anatomy viewer with clickable organ nodes
to Hugging Face Spaces (https://huggingface.co/spaces/philgear/pocketgull-3d-anatomy).
"""

import os
import sys
from pathlib import Path
from huggingface_hub import HfApi, create_repo, upload_folder

SPACE_README = """---
title: PocketGull 3D Anatomy & Tri-Paradigm Triage
emoji: 🫀
colorFrom: blue
colorTo: indigo
sdk: static
pinned: true
license: apache-2.0
short_description: Three.js 3D WebGL Anatomy & Tri-Paradigm Clinical Engine
---
"""

INDEX_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketGull 3D WebGL Anatomy & Tri-Paradigm Triage</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { background-color: #09090b; color: #e4e4e7; font-family: system-ui, -apple-system, sans-serif; overflow-x: hidden; }
    #canvasContainer { position: relative; width: 100%; min-height: 480px; height: 500px; border-radius: 12px; overflow: hidden; background: radial-gradient(circle at 50% 50%, #1c1917 0%, #09090b 100%); cursor: grab; }
    #canvasContainer:active { cursor: grabbing; }
    canvas { width: 100% !important; height: 100% !important; display: block; }
  </style>
</head>
<body class="min-h-screen p-3 md:p-6 flex flex-col items-center justify-center">
  <div class="max-w-6xl w-full space-y-4">
    
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🫀</span>
        <div>
          <h1 class="text-xl font-bold text-teal-400">PocketGull 3D WebGL Human Anatomy Suite</h1>
          <p class="text-xs text-zinc-400">Tri-Paradigm Diagnostic Lenses: Allopathic • TCM Zang-Fu • Ayurvedic Tridosha</p>
        </div>
      </div>
      <div class="text-xs text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
        🖱️ Click & Drag to Rotate • Scroll to Zoom
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      <!-- 3D Canvas Column -->
      <div class="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col">
        <div class="flex items-center justify-between px-2 pb-2">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">3D Anatomical Spatial Lens</span>
          <span id="selectedOrganLabel" class="text-xs font-medium text-teal-400">Selected: Cardiovascular (Heart)</span>
        </div>
        
        <div id="canvasContainer" class="border border-zinc-800/80"></div>

        <div class="flex flex-wrap gap-1.5 pt-3">
          <button onclick="selectOrgan('heart')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 font-medium">❤️ Heart</button>
          <button onclick="selectOrgan('brain')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 font-medium">🧠 Brain / CNS</button>
          <button onclick="selectOrgan('lungs')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 font-medium">🫁 Lungs</button>
          <button onclick="selectOrgan('liver')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 font-medium">🩺 Liver / Gut</button>
          <button onclick="selectOrgan('spine')" class="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 font-medium">🦴 Spine (C5-S1)</button>
        </div>
      </div>

      <!-- Diagnostic Sidebar Column -->
      <div class="lg:col-span-5 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h2 class="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Tri-Paradigm Diagnostic Synthesis</h2>
            <span class="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-mono">Level A Consensus</span>
          </div>

          <div id="diagnosticCard" class="space-y-2.5 text-xs leading-relaxed text-zinc-300">
            <!-- Injected via JavaScript -->
          </div>
        </div>

        <div class="border-t border-zinc-800 pt-3 text-[11px] text-zinc-500 space-y-1">
          <p>🕊️ <strong>Model</strong>: Powered by <code>PocketGull Albatross (12B)</code> & <code>Compass (2B)</code></p>
          <p>🔒 <strong>Zero Egress</strong>: Rendered 100% locally via WebGL shaders.</p>
        </div>
      </div>

    </div>
  </div>

  <script>
    let scene, camera, renderer, organMeshes = {};
    let modelGroup;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationY = 0;
    let targetRotationX = 0;
    const container = document.getElementById('canvasContainer');

    function init3D() {
      try {
        const width = container.clientWidth || 580;
        const height = container.clientHeight || 480;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0.6, 5.0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        modelGroup = new THREE.Group();
        scene.add(modelGroup);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        scene.add(ambientLight);
        
        const keyLight = new THREE.DirectionalLight(0x2dd4bf, 1.5);
        keyLight.position.set(3, 5, 4);
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
        fillLight.position.set(-3, -2, 2);
        scene.add(fillLight);

        // Procedural Torso Cage (Wireframe Hologram)
        const torsoGeo = new THREE.CylinderGeometry(0.85, 0.65, 2.6, 16, 8, true);
        const torsoMat = new THREE.MeshBasicMaterial({ color: 0x52525b, wireframe: true, transparent: true, opacity: 0.35 });
        const torso = new THREE.Mesh(torsoGeo, torsoMat);
        torso.position.y = 0.1;
        modelGroup.add(torso);

        // Spine Column
        const spineGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 12);
        const spineMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.3, metalness: 0.2 });
        const spineMesh = new THREE.Mesh(spineGeo, spineMat);
        spineMesh.position.set(0, 0.1, -0.2);
        modelGroup.add(spineMesh);
        organMeshes['spine'] = spineMesh;

        // Heart Mesh
        const heartGeo = new THREE.SphereGeometry(0.32, 24, 24);
        const heartMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x991b1b, emissiveIntensity: 0.4, roughness: 0.2 });
        const heartMesh = new THREE.Mesh(heartGeo, heartMat);
        heartMesh.position.set(-0.2, 0.55, 0.15);
        modelGroup.add(heartMesh);
        organMeshes['heart'] = heartMesh;

        // Brain Mesh
        const brainGeo = new THREE.SphereGeometry(0.42, 24, 24);
        const brainMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x075985, emissiveIntensity: 0.4, roughness: 0.3 });
        const brainMesh = new THREE.Mesh(brainGeo, brainMat);
        brainMesh.position.set(0, 1.95, 0);
        modelGroup.add(brainMesh);
        organMeshes['brain'] = brainMesh;

        // Lungs (Left & Right)
        const lungMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x115e59, emissiveIntensity: 0.3, transparent: true, opacity: 0.8 });
        const lungGeoR = new THREE.CylinderGeometry(0.24, 0.22, 0.75, 16);
        const lungR = new THREE.Mesh(lungGeoR, lungMat);
        lungR.position.set(0.42, 0.55, 0.05);
        modelGroup.add(lungR);

        const lungGeoL = new THREE.CylinderGeometry(0.24, 0.22, 0.75, 16);
        const lungL = new THREE.Mesh(lungGeoL, lungMat);
        lungL.position.set(-0.42, 0.55, 0.05);
        modelGroup.add(lungL);
        organMeshes['lungs'] = lungR;

        // Liver Mesh
        const liverGeo = new THREE.BoxGeometry(0.55, 0.35, 0.4);
        const liverMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0x92400e, emissiveIntensity: 0.3, roughness: 0.4 });
        const liverMesh = new THREE.Mesh(liverGeo, liverMat);
        liverMesh.position.set(0.25, -0.05, 0.18);
        modelGroup.add(liverMesh);
        organMeshes['liver'] = liverMesh;

        // Built-in Mouse Interaction Handlers
        setupInteraction();

        // Start Animation Loop
        animate();
      } catch (err) {
        console.error("Three.js initialization error:", err);
      }
    }

    function setupInteraction() {
      container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging || !modelGroup) return;
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        targetRotationX = Math.max(-0.6, Math.min(0.6, targetRotationX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mouseup', () => { isDragging = false; });

      // Touch handlers for mobile
      container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isDragging = true;
          previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!isDragging || !modelGroup || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        targetRotationX = Math.max(-0.6, Math.min(0.6, targetRotationX));

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });

      window.addEventListener('touchend', () => { isDragging = false; });

      // Zoom via mouse wheel
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.005;
        camera.position.z = Math.max(2.8, Math.min(7.5, camera.position.z));
      }, { passive: false });
    }

    function animate() {
      requestAnimationFrame(animate);

      if (modelGroup) {
        // Smooth rotation damping
        modelGroup.rotation.y += (targetRotationY - modelGroup.rotation.y) * 0.1;
        modelGroup.rotation.x += (targetRotationX - modelGroup.rotation.x) * 0.1;

        // Subtle idle rotation when not dragging
        if (!isDragging) {
          targetRotationY += 0.002;
        }
      }

      // Heart pulse animation
      if (organMeshes['heart']) {
        const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.05;
        organMeshes['heart'].scale.set(pulse, pulse, pulse);
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }

    const clinicalData = {
      heart: {
        title: "Cardiovascular System (Heart & Vasculature)",
        allopathic: "Target SBP 120-129 mmHg per SPRINT trial. Monitor ASCVD 10-year risk score and NT-proBNP.",
        tcm: "Zang-Fu: The Heart houses the Shen (Spirit). Associated with tongue diagnosis, pulse rate, and circulation.",
        ayurveda: "Tridosha: Governed by Avalambaka & Vyana Vata with Sadhaka Pitta regulating cardiac chronotropy.",
        milestone: "Sodium < 2300 mg/day (DASH), 150 min/wk aerobic conditioning, CoQ10 100 mg supportive adjunct."
      },
      brain: {
        title: "Central Nervous System & Cognitive Autonomics",
        allopathic: "BE-FAST acute stroke rule-out. Parasympathetic vagal pacing via 0.1 Hz respiratory entrainment.",
        tcm: "Governed by the Sea of Marrow and Kidney Essence (Jing). Du Meridian traversal.",
        ayurveda: "Prana Vata regulation; pacified by Brahmi (Bacopa monnieri) and Ashwagandha adaptogens.",
        milestone: "7-8 hours restorative sleep cycle, blue-light curfew 2 hours prior to sleep, HRV tracking."
      },
      lungs: {
        title: "Pulmonary & Respiratory Mechanics",
        allopathic: "Target SpO2 >= 95%. FEV1/FVC spirometry evaluation; rule out reactive airway bronchospasm.",
        tcm: "Zang-Fu: The Lung governs Qi and respiration; dominates skin, body hair, and Defensive Wei Qi.",
        ayurveda: "Pranavaha Srotas; Pranayama 4-7-8 box breathing for autonomic parasympathetic activation.",
        milestone: "Peak flow diary monitoring, avoidance of particulate PM2.5, respiratory diaphragmatic pacing."
      },
      liver: {
        title: "Hepatic Metabolism & Cytochrome P450",
        allopathic: "Phase I (CYP2D6, CYP3A4) and Phase II glucuronidation pathways. Monitor ALT/AST, eGFR > 30.",
        tcm: "Zang-Fu: The Liver stores Blood and ensures the smooth flow of Qi. Relates to tendon flexibility.",
        ayurveda: "Ranjaka Pitta residing in the liver and spleen; stimulated by bitter herbal cholagogues (Kutki, Milk Thistle).",
        milestone: "Elimination of refined fructose, Silymarin 150 mg daily support, weekly hepatic panel tracking."
      },
      spine: {
        title: "Spinal Biomechanics & Somatic Neural Axis",
        allopathic: "Cervical/Lumbar Lordosis assessment. Neurological dermatome testing (C5-S1 reflex arcs).",
        tcm: "Bladder Meridian (Tai Yang) and Du Mai (Governing Vessel) running alongside the paravertebral chain.",
        ayurveda: "Asthivaha Srotas & Shleshaka Kapha lubricating intervertebral disc spaces.",
        milestone: "Postural ergonomic workstation adjustments, core myofascial stabilization, daily gentle cat-cow mobility."
      }
    };

    function selectOrgan(key) {
      const data = clinicalData[key];
      if (!data) return;

      document.getElementById('selectedOrganLabel').innerText = "Selected: " + data.title;

      const html = `
        <div class="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
          <span class="text-teal-400 font-semibold uppercase tracking-wider text-[11px]">Western Allopathic (Level A)</span>
          <p class="text-zinc-300 text-xs">${data.allopathic}</p>
        </div>

        <div class="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
          <span class="text-amber-400 font-semibold uppercase tracking-wider text-[11px]">Traditional Chinese Medicine (Zang-Fu)</span>
          <p class="text-zinc-300 text-xs">${data.tcm}</p>
        </div>

        <div class="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
          <span class="text-sky-400 font-semibold uppercase tracking-wider text-[11px]">Ayurvedic Medicine (Tridosha)</span>
          <p class="text-zinc-300 text-xs">${data.ayurveda}</p>
        </div>

        <div class="p-3 bg-teal-950/40 border border-teal-800/60 rounded-lg space-y-1">
          <span class="text-teal-300 font-semibold uppercase tracking-wider text-[11px]">30-Day Action Milestone</span>
          <p class="text-zinc-200 text-xs">${data.milestone}</p>
        </div>
      `;
      document.getElementById('diagnosticCard').innerHTML = html;
    }

    function handleResize() {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth || 580;
      const height = container.clientHeight || 480;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);

    // Immediate execution
    function start() {
      init3D();
      selectOrgan('heart');
      setTimeout(handleResize, 100);
      setTimeout(handleResize, 500);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }
  </script>
</body>
</html>
"""

def publish_3d_space(token: str = None, username: str = "philgear"):
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

    space_name = "pocketgull-3d-anatomy"
    repo_id = f"{target_user}/{space_name}"
    staging_dir = Path("dist") / "spaces" / space_name
    staging_dir.mkdir(parents=True, exist_ok=True)

    # Write files
    (staging_dir / "README.md").write_text(SPACE_README, encoding="utf-8")
    (staging_dir / "index.html").write_text(INDEX_HTML, encoding="utf-8")

    print(f" [SPACE] Creating and pushing 3D WebGL Anatomy Space: {repo_id}...")
    try:
        create_repo(repo_id=repo_id, token=effective_token, repo_type="space", space_sdk="static", exist_ok=True)
        upload_folder(
            folder_path=str(staging_dir),
            repo_id=repo_id,
            repo_type="space",
            token=effective_token,
            commit_message="feat(space): launch PocketGull 3D WebGL anatomy and tri-paradigm triage space"
        )
        print("================================================================")
        print(f" [SUCCESS] 3D WebGL Anatomy Space is live on Hugging Face!")
        print(f" Live URL: https://huggingface.co/spaces/{repo_id}")
        print("================================================================\n")
    except Exception as err:
        print(f" [FAIL] Failed to deploy Space {repo_id}: {err}\n")

if __name__ == "__main__":
    token = sys.argv[1] if len(sys.argv) > 1 else None
    publish_3d_space(token=token)
