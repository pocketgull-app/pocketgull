/**
 * Standalone 3D Vesalian Anatomical Woodcut Proof Engine
 * 
 * Implements an interactive 3D WebGL anatomical model with:
 * - Articulated human skeletal framework (skull, spine, 12 ribs, pelvis, limbs)
 * - Muscular volume masses (pectoralis, deltoid, biceps, rectus abdominis, quads, gastrocnemius)
 * - Atelier Xylem 5 Woodcut Relief Profiles (V-Ribbed, Fluted, Reeded, Slatted, Burl) + Camaïeu Auto
 * - Physically-based relief normal bump and studio chiaroscuro lighting
 * - OrbitControls and auto-rotation
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  createVesalianWoodcutMaterial,
  WoodCutType,
  getWoodCutTypeCode
} from '../shaders/vesalian-woodcut.shader';

export interface IVesalian3DViewerAPI {
  setWoodCutType: (type: WoodCutType) => void;
  setMuscleTension: (val: number) => void;
  setReliefDepth: (val: number) => void;
  toggleAutoRotate: () => boolean;
  resetCamera: () => void;
  dispose: () => void;
}

export function initVesalian3DViewer(
  container: HTMLElement | string,
  initialOptions: {
    scotopicMode?: boolean;
    woodCutType?: WoodCutType;
    muscleTension?: number;
    reliefDepth?: number;
  } = {}
): IVesalian3DViewerAPI {
  const mountEl = typeof container === 'string' ? document.getElementById(container) : container;
  if (!mountEl) {
    throw new Error(`[Vesalian3D] Mount container not found: ${container}`);
  }

  // Clear previous content
  mountEl.innerHTML = '';

  const width = mountEl.clientWidth || 800;
  const height = mountEl.clientHeight || 560;

  // 1. Scene & Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x09090b); // Obsidian dark surface

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  mountEl.appendChild(renderer.domElement);

  // 2. Camera & OrbitControls
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
  camera.position.set(0.0, 1.1, 4.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.95, 0);
  controls.minDistance = 1.2;
  controls.maxDistance = 8.0;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1.5;

  // 3. Studio Chiaroscuro Lighting (Venetian 1543 Woodblock Studio)
  const keyLight = new THREE.DirectionalLight(0xffedd5, 2.4);
  keyLight.position.set(3.0, 4.5, 3.5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x0f172a, 0.7);
  fillLight.position.set(-3.0, 1.5, -2.5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.5);
  rimLight.position.set(0.0, 2.5, -3.8);
  scene.add(rimLight);

  const ambientLight = new THREE.AmbientLight(0x18181b, 0.9);
  scene.add(ambientLight);

  // 4. Woodcut Shader Materials
  let activeWoodCut: WoodCutType = initialOptions.woodCutType || 'camaieu_auto';
  let activeTension = initialOptions.muscleTension ?? 0.25;
  let activeRelief = initialOptions.reliefDepth ?? 1.8;

  // Muscle Tissue Woodcut Material (Fluted / Reeded / Variable Depth)
  const muscleMaterial = createVesalianWoodcutMaterial({
    hatchScale: 26.0,
    pennationAngleDeg: 35.0,
    muscleTension: activeTension,
    woodCutType: activeWoodCut,
    grainStrength: 0.88,
    reliefDepth: activeRelief,
    inkColor: 0xf59e0b, // Warm Amber Copper
    paperColor: 0x121216,
    scotopicMode: true
  });

  // Skeletal Bone Woodcut Material (Slatted / V-Ribbed Louvers)
  const boneMaterial = createVesalianWoodcutMaterial({
    hatchScale: 32.0,
    pennationAngleDeg: 0.0,
    muscleTension: 0.0,
    woodCutType: activeWoodCut === 'camaieu_auto' ? 'slatted' : activeWoodCut,
    grainStrength: 0.92,
    reliefDepth: activeRelief * 1.15,
    inkColor: 0xfef08a, // Bone Ivory Sheen
    paperColor: 0x18181f,
    scotopicMode: true
  });

  // Joint Cartilage Woodcut Material (Burl Whorls)
  const jointMaterial = createVesalianWoodcutMaterial({
    hatchScale: 24.0,
    pennationAngleDeg: 90.0,
    muscleTension: activeTension * 0.5,
    woodCutType: activeWoodCut === 'camaieu_auto' ? 'burl' : activeWoodCut,
    grainStrength: 0.95,
    reliefDepth: activeRelief * 1.25,
    inkColor: 0xfbbf24,
    paperColor: 0x1c1917,
    scotopicMode: true
  });

  // 5. Construct Detailed 3D Vesalian Anatomical Figure
  const figureGroup = new THREE.Group();
  scene.add(figureGroup);

  // Helper constructors
  const addMesh = (geom: THREE.BufferGeometry, mat: THREE.Material, pos: [number, number, number], rot?: [number, number, number], scale?: [number, number, number]) => {
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    figureGroup.add(mesh);
    return mesh;
  };

  // A. SKULL & CRANIAL VAULT
  // Neurocranium (Brain Vault)
  addMesh(new THREE.SphereGeometry(0.18, 32, 24), boneMaterial, [0, 1.84, 0], [0, 0, 0], [1.0, 1.15, 1.18]);
  // Facial skeleton & Maxilla
  addMesh(new THREE.BoxGeometry(0.14, 0.12, 0.12), boneMaterial, [0, 1.74, 0.06]);
  // Mandible (Jawbone)
  addMesh(new THREE.BoxGeometry(0.13, 0.06, 0.11), boneMaterial, [0, 1.66, 0.05]);
  // Eye Orbits (Left/Right)
  addMesh(new THREE.SphereGeometry(0.038, 16, 16), jointMaterial, [-0.045, 1.77, 0.11]);
  addMesh(new THREE.SphereGeometry(0.038, 16, 16), jointMaterial, [0.045, 1.77, 0.11]);

  // B. VERTEBRAL COLUMN & SPINE
  for (let i = 0; i < 18; i++) {
    const y = 1.58 - i * 0.042;
    const curvature = Math.sin((i / 18) * Math.PI * 2) * 0.032;
    addMesh(new THREE.CylinderGeometry(0.032, 0.036, 0.035, 16), boneMaterial, [0, y, -0.05 + curvature]);
  }

  // C. THORACIC CAGE (12 PAIRS OF RIBS & STERNUM)
  // Sternum (Breastplate)
  addMesh(new THREE.BoxGeometry(0.045, 0.32, 0.02), boneMaterial, [0, 1.34, 0.14]);
  // Rib pairs
  for (let r = 0; r < 9; r++) {
    const ry = 1.48 - r * 0.034;
    const rx = 0.14 + Math.sin((r / 8) * Math.PI) * 0.09;
    const rz = 0.10 + Math.sin((r / 8) * Math.PI) * 0.06;
    // Left Rib
    addMesh(new THREE.TorusGeometry(rx, 0.012, 10, 24, Math.PI * 0.82), boneMaterial, [-0.01, ry, 0.01], [Math.PI * 0.5, 0.1, -0.2]);
    // Right Rib
    addMesh(new THREE.TorusGeometry(rx, 0.012, 10, 24, Math.PI * 0.82), boneMaterial, [0.01, ry, 0.01], [Math.PI * 0.5, -0.1, Math.PI - 0.2]);
  }

  // Clavicles (Collarbones)
  addMesh(new THREE.CylinderGeometry(0.014, 0.016, 0.22, 12), boneMaterial, [-0.11, 1.54, 0.06], [0, 0, Math.PI * 0.42]);
  addMesh(new THREE.CylinderGeometry(0.014, 0.016, 0.22, 12), boneMaterial, [0.11, 1.54, 0.06], [0, 0, -Math.PI * 0.42]);

  // D. MUSCULAR CHEST & ABDOMEN (PECTORALIS & OBLIQUES)
  // Left Pectoralis Major Muscle Sheet
  addMesh(new THREE.CapsuleGeometry(0.08, 0.12, 4, 16), muscleMaterial, [-0.11, 1.38, 0.10], [0.2, 0.2, -0.4]);
  // Right Pectoralis Major Muscle Sheet
  addMesh(new THREE.CapsuleGeometry(0.08, 0.12, 4, 16), muscleMaterial, [0.11, 1.38, 0.10], [0.2, -0.2, 0.4]);
  // Rectus Abdominis Muscle Segments (Vesalian segmented belly)
  for (let a = 0; a < 3; a++) {
    const ay = 1.18 - a * 0.075;
    addMesh(new THREE.BoxGeometry(0.075, 0.06, 0.04), muscleMaterial, [-0.045, ay, 0.11]);
    addMesh(new THREE.BoxGeometry(0.075, 0.06, 0.04), muscleMaterial, [0.045, ay, 0.11]);
  }

  // E. PELVIS & SACRUM
  // Iliac Crests & Pelvic Bowl
  addMesh(new THREE.TorusGeometry(0.19, 0.038, 12, 28, Math.PI * 1.1), boneMaterial, [0, 0.94, -0.01], [Math.PI * 0.45, 0, 0]);
  addMesh(new THREE.BoxGeometry(0.12, 0.14, 0.06), boneMaterial, [0, 0.88, 0.04]); // Pubic bone
  addMesh(new THREE.SphereGeometry(0.052, 16, 16), jointMaterial, [-0.16, 0.86, 0]); // Left Hip Socket
  addMesh(new THREE.SphereGeometry(0.052, 16, 16), jointMaterial, [0.16, 0.86, 0]); // Right Hip Socket

  // F. UPPER EXTREMITIES (SHOULDERS, ARMS, HANDS)
  // Left Shoulder Deltoid Muscle Cap
  addMesh(new THREE.SphereGeometry(0.075, 16, 16), muscleMaterial, [-0.28, 1.49, 0.02]);
  // Right Shoulder Deltoid Muscle Cap
  addMesh(new THREE.SphereGeometry(0.075, 16, 16), muscleMaterial, [0.28, 1.49, 0.02]);

  // Left Humerus Bone & Biceps Muscle Belly
  addMesh(new THREE.CylinderGeometry(0.02, 0.024, 0.32, 12), boneMaterial, [-0.29, 1.30, 0.02]);
  addMesh(new THREE.CapsuleGeometry(0.045, 0.20, 4, 16), muscleMaterial, [-0.28, 1.30, 0.04]); // Left Biceps
  addMesh(new THREE.SphereGeometry(0.038, 14, 14), jointMaterial, [-0.29, 1.13, 0.02]); // Left Elbow

  // Right Humerus Bone & Biceps Muscle Belly
  addMesh(new THREE.CylinderGeometry(0.02, 0.024, 0.32, 12), boneMaterial, [0.29, 1.30, 0.02]);
  addMesh(new THREE.CapsuleGeometry(0.045, 0.20, 4, 16), muscleMaterial, [0.28, 1.30, 0.04]); // Right Biceps
  addMesh(new THREE.SphereGeometry(0.038, 14, 14), jointMaterial, [0.29, 1.13, 0.02]); // Right Elbow

  // Left Forearm (Radius/Ulna) & Hand
  addMesh(new THREE.CylinderGeometry(0.016, 0.02, 0.28, 12), boneMaterial, [-0.29, 0.98, 0.04]);
  addMesh(new THREE.BoxGeometry(0.04, 0.10, 0.02), boneMaterial, [-0.29, 0.80, 0.05]); // Left Hand

  // Right Forearm (Radius/Ulna) & Hand
  addMesh(new THREE.CylinderGeometry(0.016, 0.02, 0.28, 12), boneMaterial, [0.29, 0.98, 0.04]);
  addMesh(new THREE.BoxGeometry(0.04, 0.10, 0.02), boneMaterial, [0.29, 0.80, 0.05]); // Right Hand

  // G. LOWER EXTREMITIES (FEMURS, QUADS, KNEES, CALVES, FEET)
  // Left Femur Bone & Quadriceps Muscle Belly
  addMesh(new THREE.CylinderGeometry(0.026, 0.032, 0.44, 14), boneMaterial, [-0.15, 0.64, 0]);
  addMesh(new THREE.CapsuleGeometry(0.065, 0.32, 4, 18), muscleMaterial, [-0.15, 0.65, 0.03]); // Left Quads
  // Left Patella & Knee Joint
  addMesh(new THREE.SphereGeometry(0.048, 16, 16), jointMaterial, [-0.15, 0.41, 0.03]);

  // Right Femur Bone & Quadriceps Muscle Belly
  addMesh(new THREE.CylinderGeometry(0.026, 0.032, 0.44, 14), boneMaterial, [0.15, 0.64, 0]);
  addMesh(new THREE.CapsuleGeometry(0.065, 0.32, 4, 18), muscleMaterial, [0.15, 0.65, 0.03]); // Right Quads
  // Right Patella & Knee Joint
  addMesh(new THREE.SphereGeometry(0.048, 16, 16), jointMaterial, [0.15, 0.41, 0.03]);

  // Left Lower Leg (Tibia/Fibula) & Gastrocnemius Calf Muscle
  addMesh(new THREE.CylinderGeometry(0.02, 0.024, 0.40, 12), boneMaterial, [-0.15, 0.20, 0]);
  addMesh(new THREE.CapsuleGeometry(0.052, 0.24, 4, 16), muscleMaterial, [-0.15, 0.24, -0.03]); // Left Calf
  addMesh(new THREE.BoxGeometry(0.07, 0.04, 0.15), boneMaterial, [-0.15, -0.01, 0.04]); // Left Foot

  // Right Lower Leg (Tibia/Fibula) & Gastrocnemius Calf Muscle
  addMesh(new THREE.CylinderGeometry(0.02, 0.024, 0.40, 12), boneMaterial, [0.15, 0.20, 0]);
  addMesh(new THREE.CapsuleGeometry(0.052, 0.24, 4, 16), muscleMaterial, [0.15, 0.24, -0.03]); // Right Calf
  addMesh(new THREE.BoxGeometry(0.07, 0.04, 0.15), boneMaterial, [0.15, -0.01, 0.04]); // Right Foot

  // Initial Figure Orientation
  figureGroup.rotation.y = 0.25;

  // 6. Animation Loop
  let isRunning = true;
  let animFrameId = 0;
  const clock = new THREE.Clock();

  function animate() {
    if (!isRunning) return;
    animFrameId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    controls.update();

    // Subtle natural breath rise/fall
    const elapsed = clock.getElapsedTime();
    figureGroup.position.y = Math.sin(elapsed * 1.2) * 0.008;

    renderer.render(scene, camera);
  }
  animate();

  // Resize Handler
  const onResize = () => {
    if (!mountEl) return;
    const w = mountEl.clientWidth;
    const h = mountEl.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // 7. API Interface
  return {
    setWoodCutType(type: WoodCutType) {
      activeWoodCut = type;
      const code = getWoodCutTypeCode(type);
      if (muscleMaterial.uniforms['uWoodCutType']) {
        muscleMaterial.uniforms['uWoodCutType'].value = code;
      }
      if (boneMaterial.uniforms['uWoodCutType']) {
        boneMaterial.uniforms['uWoodCutType'].value = type === 'camaieu_auto' ? getWoodCutTypeCode('slatted') : code;
      }
      if (jointMaterial.uniforms['uWoodCutType']) {
        jointMaterial.uniforms['uWoodCutType'].value = type === 'camaieu_auto' ? getWoodCutTypeCode('burl') : code;
      }
    },
    setMuscleTension(val: number) {
      activeTension = Math.max(0, Math.min(1, val));
      if (muscleMaterial.uniforms['uMuscleTension']) {
        muscleMaterial.uniforms['uMuscleTension'].value = activeTension;
      }
      if (jointMaterial.uniforms['uMuscleTension']) {
        jointMaterial.uniforms['uMuscleTension'].value = activeTension * 0.5;
      }
    },
    setReliefDepth(val: number) {
      activeRelief = Math.max(0, Math.min(4.0, val));
      if (muscleMaterial.uniforms['uReliefDepth']) {
        muscleMaterial.uniforms['uReliefDepth'].value = activeRelief;
      }
      if (boneMaterial.uniforms['uReliefDepth']) {
        boneMaterial.uniforms['uReliefDepth'].value = activeRelief * 1.15;
      }
      if (jointMaterial.uniforms['uReliefDepth']) {
        jointMaterial.uniforms['uReliefDepth'].value = activeRelief * 1.25;
      }
    },
    toggleAutoRotate() {
      controls.autoRotate = !controls.autoRotate;
      return controls.autoRotate;
    },
    resetCamera() {
      camera.position.set(0.0, 1.1, 4.2);
      controls.target.set(0, 0.95, 0);
      controls.update();
    },
    dispose() {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
    }
  };
}

// Attach to window for standalone HTML proof scripts
if (typeof window !== 'undefined') {
  (window as any).initVesalian3DViewer = initVesalian3DViewer;
}
