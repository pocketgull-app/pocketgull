/**
 * Standalone William Home Lizars (1788-1859) & Vesalian Anatomical Engine
 * 
 * Implements a unified dual-mode anatomical inspection engine:
 * - Mode A: 2.5D Folio Deep-Inspection Stage (Macro folio overview to microscopic intaglio burin lines)
 * - Mode B: 3D Volumetric Stage (Exploded multi-stratum peeling with 360° OrbitControls)
 * - Universal PocketGull Theme Tokens (Edinburgh 1822, Obsidian, Washi, Scotopic 650nm, Vesalian 1543)
 * - Stratigraphic Dissection Peeling (Habitus -> Myologia -> Angiologia & Neurologia -> Osteologia)
 * - Interactive Copperplate Calligraphic Annotation Pins with hairline leader lines
 * - Live 3D Model / Scan Ingestion (.glb, .gltf, .obj drag-and-drop & loader)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  createVesalianWoodcutMaterial,
  WoodCutType,
  getWoodCutTypeCode
} from '../shaders/vesalian-woodcut.shader';
import {
  getLizarsTheme,
  ILizarsThemeTokens,
  LizarsThemeKey,
  LIZARS_THEMES
} from '../shaders/lizars-theme-palette';

export type AnatomicalArchetype = 'female' | 'male' | 'ecorche' | 'custom_scan';
export type AnatomicalViewMode = 'folio' | 'sculpture_3d';

export interface IAnatomicalPin {
  id: string;
  number: number;
  latinName: string;
  englishName: string;
  category: 'artery' | 'vein' | 'nerve' | 'muscle' | 'bone';
  position: [number, number, number]; // 3D coordinates on model/folio
  clinicalNotes: string;              // John Lizars 1822 surgical note
  color: string;
}

export const LIZARS_ANATOMICAL_PINS: IAnatomicalPin[] = [
  {
    id: 'carotid',
    number: 1,
    latinName: 'A. Carotis Communis',
    englishName: 'Common Carotid Artery',
    category: 'artery',
    position: [0.08, 1.62, 0.05],
    clinicalNotes: 'Ascends in the carotid sheath lateral to the trachea; bifurcates into internal and external branches at the superior border of thyroid cartilage.',
    color: '#d63031'
  },
  {
    id: 'vagus',
    number: 2,
    latinName: 'N. Vagus (CN X)',
    englishName: 'Vagus Nerve (10th Cranial)',
    category: 'nerve',
    position: [0.098, 1.58, 0.05],
    clinicalNotes: 'Descends vertically between internal jugular vein and common carotid artery; primary parasympathetic conduit to heart and viscera.',
    color: '#fdcb6e'
  },
  {
    id: 'jugular',
    number: 3,
    latinName: 'V. Jugularis Interna',
    englishName: 'Internal Jugular Vein',
    category: 'vein',
    position: [0.115, 1.55, 0.05],
    clinicalNotes: 'Collects blood from brain, superficial face and neck; unites with subclavian vein to form the brachiocephalic vein.',
    color: '#0984e3'
  },
  {
    id: 'pectoralis',
    number: 4,
    latinName: 'M. Pectoralis Major',
    englishName: 'Great Pectoral Muscle',
    category: 'muscle',
    position: [0.135, 1.38, 0.08],
    clinicalNotes: 'Powerful adductor and medial rotator of humerus; divided into clavicular and sternocostal heads by the sternal cleft.',
    color: '#b3592b'
  },
  {
    id: 'rectus_abdominis',
    number: 5,
    latinName: 'M. Rectus Abdominis',
    englishName: 'Straight Abdominal Muscle',
    category: 'muscle',
    position: [0.045, 1.15, 0.08],
    clinicalNotes: 'Enclosed within rectus sheath; intersected by three transverse tendinous inscriptions that anchor the anterior abdominal wall.',
    color: '#b3592b'
  },
  {
    id: 'femoral_vessels',
    number: 6,
    latinName: 'A. & V. Femoralis',
    englishName: 'Femoral Artery & Vein',
    category: 'artery',
    position: [0.11, 0.82, 0.06],
    clinicalNotes: 'Passes beneath inguinal ligament into Scarpa’s femoral triangle; primary vascular conduit of the lower extremity.',
    color: '#d63031'
  },
  {
    id: 'saphenous',
    number: 7,
    latinName: 'V. Saphena Magna',
    englishName: 'Great Saphenous Vein',
    category: 'vein',
    position: [0.125, 0.40, 0.05],
    clinicalNotes: 'Longest subcutaneous vein in human body; extends from dorsal venous arch of foot to saphenous opening in fascia lata.',
    color: '#0984e3'
  },
  {
    id: 'gastrocnemius',
    number: 8,
    latinName: 'M. Gastrocnemius',
    englishName: 'Calf Muscle (Diamond Belly)',
    category: 'muscle',
    position: [0.14, 0.24, -0.02],
    clinicalNotes: 'Two robust muscular bellies arising from femoral condyles; merges with soleus into the calcaneal (Achilles) tendon.',
    color: '#b3592b'
  },
  {
    id: 'lumbar_l4_l5',
    number: 9,
    latinName: 'Radix Spinalis L4–L5',
    englishName: 'L4–L5 Nerve Root & Foramen',
    category: 'nerve',
    position: [0.0, 0.92, -0.06],
    clinicalNotes: 'Susceptible to foraminal pinching during excessive anterior pelvic tilt. Pelvic neutral opens foraminal space by +2.4 mm.',
    color: '#ef4444'
  },
  {
    id: 'patellofemoral',
    number: 10,
    latinName: 'Articulatio Patellofemoralis',
    englishName: 'Patellar Groove Alignment',
    category: 'bone',
    position: [0.115, 0.44, 0.06],
    clinicalNotes: 'Vastus medialis oblique contraction aligns the patella within the femoral sulcus, reducing lateral shear force by 80%.',
    color: '#2dd4bf'
  },
  {
    id: 'cervical_spine',
    number: 11,
    latinName: 'Vertebrae Cervicales C5–C6',
    englishName: 'C5–C6 Cervical Segment',
    category: 'bone',
    position: [0.0, 1.48, -0.05],
    clinicalNotes: 'Axial chin tuck retracts forward head carriage back onto the gravity plumb line, restoring the cervical lordotic curve.',
    color: '#38bdf8'
  }
];

export type ClinicalRegionKey = 'lumbar' | 'knee' | 'cervical' | 'full';
export type ShadingProfileKey = 'atelier' | 'clinical' | 'theatre' | 'scotopic';
export type SurfaceStyleKey = 'ecorche' | 'woodcut';

export interface IVesalian3DViewerAPI {
  setViewMode: (mode: AnatomicalViewMode) => void;
  getViewMode: () => AnatomicalViewMode;
  setArchetype: (type: AnatomicalArchetype) => AnatomicalArchetype;
  getArchetype: () => AnatomicalArchetype;
  setDissectionDepth: (val: number) => void;
  getDissectionDepth: () => number;
  setTheme: (themeKey: LizarsThemeKey | string) => void;
  getTheme: () => string;
  setWoodCutType: (type: WoodCutType) => void;
  setSurfaceStyle: (style: SurfaceStyleKey) => void;
  getSurfaceStyle: () => SurfaceStyleKey;
  setMuscleTension: (val: number) => void;
  setReliefDepth: (val: number) => void;
  toggleAutoRotate: () => boolean;
  resetCamera: () => void;
  focusRegion: (region: ClinicalRegionKey) => void;
  setShadingProfile: (profile: ShadingProfileKey) => void;
  getShadingProfile: () => ShadingProfileKey;
  setCircadianHour: (hour: number) => void;
  toggleBioPacing: () => boolean;
  setSessionFatigue: (minutes: number) => void;
  loadExternalModel: (fileOrUrl: File | string | ArrayBuffer, format?: 'glb' | 'gltf' | 'obj') => Promise<boolean>;
  onPinSelect: (callback: (pin: IAnatomicalPin) => void) => void;
  dispose: () => void;
}

export function initVesalian3DViewer(
  container: HTMLElement | string,
  initialOptions: {
    scotopicMode?: boolean;
    woodCutType?: WoodCutType;
    surfaceStyle?: SurfaceStyleKey;
    muscleTension?: number;
    reliefDepth?: number;
    archetype?: AnatomicalArchetype;
    viewMode?: AnatomicalViewMode;
    theme?: LizarsThemeKey | string;
    dissectionDepth?: number;
  } = {}
): IVesalian3DViewerAPI {
  const mountEl = typeof container === 'string' ? document.getElementById(container) : container;
  if (!mountEl) {
    throw new Error(`[Vesalian3D] Mount container not found: ${container}`);
  }

  // Clear previous content
  mountEl.innerHTML = '';
  mountEl.style.position = 'relative';

  const width = mountEl.clientWidth || 800;
  const height = mountEl.clientHeight || 560;

  // Active state
  let activeThemeKey = (initialOptions.theme as LizarsThemeKey) || 'edinburgh_1822';
  let activeThemeTokens = getLizarsTheme(activeThemeKey);
  let activeViewMode: AnatomicalViewMode = initialOptions.viewMode || 'sculpture_3d';
  let activeArchetype: AnatomicalArchetype = initialOptions.archetype || 'female';
  let activeDissectionDepth = initialOptions.dissectionDepth ?? 0.25;
  let activeWoodCut: WoodCutType = initialOptions.woodCutType || 'camaieu_auto';
  let activeTension = initialOptions.muscleTension ?? 0.25;
  let activeRelief = initialOptions.reliefDepth ?? 1.8;
  let pinSelectCallback: ((pin: IAnatomicalPin) => void) | null = null;
  let activeShadingProfile: ShadingProfileKey = 'atelier';
  let activeSurfaceStyle: SurfaceStyleKey = initialOptions.surfaceStyle || 'ecorche';
  let isBioPacingActive = false;
  let sessionFatigueMinutes = 0;
  let circadianHour = 14.0; // 2:00 PM atelier light default

  // 1. Scene & Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(activeThemeTokens.backdropColor);
  scene.fog = new THREE.FogExp2(activeThemeTokens.backdropColor, 0.06);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  mountEl.appendChild(renderer.domElement);

  // 2. Camera & OrbitControls
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
  camera.position.set(0.0, 1.1, 4.2);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.95, 0);
  controls.minDistance = 0.8;
  controls.maxDistance = 8.0;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1.5;

  // Camera animation interpolation targets
  let targetCamPos = camera.position.clone();
  let targetCamLookAt = controls.target.clone();
  let isTransitioningCamera = false;

  // 3. Studio Chiaroscuro & Dissecting Room Lighting
  const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
  keyLight.position.set(3.2, 4.5, 2.2);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x5a361e, 1.2);
  fillLight.position.set(-2.8, 1.8, 1.8);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xe59a54, 1.6);
  rimLight.position.set(0.0, 3.2, -2.5);
  scene.add(rimLight);

  const ambientLight = new THREE.AmbientLight(0x382419, 1.2);
  scene.add(ambientLight);

  function applyShadingProfile(profile: ShadingProfileKey) {
    activeShadingProfile = profile;
    if (profile === 'atelier') {
      keyLight.color.setHex(0xfff1d6);
      keyLight.intensity = 3.6;
      keyLight.position.set(3.5, 4.0, 2.0);
      fillLight.color.setHex(0x6b4728);
      fillLight.intensity = 1.0;
      fillLight.position.set(-2.8, 1.8, 1.8);
      ambientLight.color.setHex(0x3d2719);
      ambientLight.intensity = 1.1;
      rimLight.color.setHex(0xe59a54);
      rimLight.intensity = 1.6;
      scene.background = new THREE.Color(activeThemeTokens.backdropColor);
      scene.fog = new THREE.FogExp2(activeThemeTokens.backdropColor, 0.06);
    } else if (profile === 'clinical') {
      keyLight.color.setHex(0xf4f9ff);
      keyLight.intensity = 2.4;
      keyLight.position.set(0.5, 4.2, 3.2);
      fillLight.color.setHex(0xcfdbe8);
      fillLight.intensity = 1.8;
      fillLight.position.set(-2.2, 2.5, 2.5);
      ambientLight.color.setHex(0x526375);
      ambientLight.intensity = 1.6;
      rimLight.color.setHex(0x94a3b8);
      rimLight.intensity = 0.8;
      scene.background = new THREE.Color(0x10141a);
      scene.fog = new THREE.FogExp2(0x10141a, 0.05);
    } else if (profile === 'theatre') {
      keyLight.color.setHex(0xff9e3b);
      keyLight.intensity = 4.5;
      keyLight.position.set(2.8, 1.4, 1.8);
      fillLight.color.setHex(0x280f03);
      fillLight.intensity = 0.4;
      ambientLight.color.setHex(0x140602);
      ambientLight.intensity = 0.5;
      rimLight.color.setHex(0xf97316);
      rimLight.intensity = 2.2;
      scene.background = new THREE.Color(0x0a0503);
      scene.fog = new THREE.FogExp2(0x0a0503, 0.08);
    } else if (profile === 'scotopic') {
      keyLight.color.setHex(0xef4444);
      keyLight.intensity = 2.8;
      keyLight.position.set(2.0, 3.5, 2.2);
      fillLight.color.setHex(0x7f1d1d);
      fillLight.intensity = 1.2;
      ambientLight.color.setHex(0x3b0707);
      ambientLight.intensity = 0.7;
      rimLight.color.setHex(0x991b1b);
      rimLight.intensity = 1.4;
      scene.background = new THREE.Color(0x070101);
      scene.fog = new THREE.FogExp2(0x070101, 0.08);
    }
  }

  function applyCircadianHour(h: number) {
    circadianHour = Math.max(6, Math.min(24, h));
    const norm = (circadianHour - 6) / 18;
    const sunAngle = norm * Math.PI;
    const sunX = Math.cos(sunAngle) * 4.5;
    const sunY = Math.max(0.8, Math.sin(sunAngle) * 4.8);
    const sunZ = Math.sin(sunAngle * 0.5) * 2.5;
    keyLight.position.set(sunX, sunY, sunZ);

    if (circadianHour < 10) {
      keyLight.color.setHex(0xffeedb);
      keyLight.intensity = 3.0;
      ambientLight.color.setHex(0x2d241d);
    } else if (circadianHour < 17) {
      keyLight.color.setHex(0xfff5e6);
      keyLight.intensity = 3.6;
      ambientLight.color.setHex(0x382419);
    } else if (circadianHour < 21) {
      keyLight.color.setHex(0xf59e0b);
      keyLight.intensity = 3.8;
      ambientLight.color.setHex(0x331a08);
    } else {
      const nightFactor = Math.min(1.0, (circadianHour - 21) / 2.0);
      const r = 0.93;
      const g = 0.27 * (1.0 - nightFactor);
      const b = 0.27 * (1.0 - nightFactor);
      keyLight.color.setRGB(r, g, b);
      keyLight.intensity = 2.5;
      ambientLight.color.setRGB(0.23 * nightFactor + 0.1, 0.02, 0.02);
    }
  }

  // 4. Woodcut / Intaglio Shader Materials
  const shaderSurfaceStyle = activeSurfaceStyle === 'ecorche' ? 'ecorche_cast' : 'woodcut';

  const muscleMaterial = createVesalianWoodcutMaterial({
    hatchScale: 26.0,
    pennationAngleDeg: 35.0,
    muscleTension: activeTension,
    woodCutType: activeWoodCut,
    surfaceStyle: shaderSurfaceStyle,
    grainStrength: 0.88,
    reliefDepth: activeRelief,
    inkColor: activeThemeTokens.muscleColor,
    paperColor: activeThemeTokens.paperColor,
    scotopicMode: activeThemeTokens.isDark
  });

  const boneMaterial = createVesalianWoodcutMaterial({
    hatchScale: 32.0,
    pennationAngleDeg: 0.0,
    muscleTension: 0.0,
    woodCutType: activeWoodCut === 'camaieu_auto' ? 'slatted' : activeWoodCut,
    surfaceStyle: shaderSurfaceStyle,
    grainStrength: 0.92,
    reliefDepth: activeRelief * 1.15,
    inkColor: activeThemeTokens.boneColor,
    paperColor: activeThemeTokens.paperColor,
    scotopicMode: activeThemeTokens.isDark
  });

  const jointMaterial = createVesalianWoodcutMaterial({
    hatchScale: 24.0,
    pennationAngleDeg: 90.0,
    muscleTension: activeTension * 0.5,
    woodCutType: activeWoodCut === 'camaieu_auto' ? 'burl' : activeWoodCut,
    surfaceStyle: shaderSurfaceStyle,
    grainStrength: 0.95,
    reliefDepth: activeRelief * 1.25,
    inkColor: activeThemeTokens.accentColor,
    paperColor: activeThemeTokens.paperColor,
    scotopicMode: activeThemeTokens.isDark
  });

  // Neurovascular Specialized Materials
  const arteryMaterial = new THREE.MeshStandardMaterial({
    color: activeThemeTokens.arterialColor,
    roughness: 0.35,
    metalness: 0.1,
    emissive: activeThemeTokens.arterialColor,
    emissiveIntensity: 0.15
  });

  const veinMaterial = new THREE.MeshStandardMaterial({
    color: activeThemeTokens.venousColor,
    roughness: 0.4,
    metalness: 0.05,
    emissive: activeThemeTokens.venousColor,
    emissiveIntensity: 0.12
  });

  const nerveMaterial = new THREE.MeshStandardMaterial({
    color: activeThemeTokens.nerveColor,
    roughness: 0.5,
    metalness: 0.0,
    emissive: activeThemeTokens.nerveColor,
    emissiveIntensity: 0.2
  });

  // 5. Stage Architecture (Pedestal, Backdrop & 2.5D Folio Plate)
  const stageGroup = new THREE.Group();
  scene.add(stageGroup);

  // A. Architectural Backdrop (Visible in 3D Mode)
  const backdropGroup = new THREE.Group();
  stageGroup.add(backdropGroup);

  const darkWalnutMat = new THREE.MeshStandardMaterial({ color: 0x1f150e, roughness: 0.88, metalness: 0.05 });
  const carvedTeakMat = new THREE.MeshStandardMaterial({ color: 0x784a25, roughness: 0.72, metalness: 0.12 });
  const brassTrimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.45, metalness: 0.85 });

  const backboard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.40, 0.04), darkWalnutMat);
  backboard.position.set(0, 1.10, -0.75);
  backdropGroup.add(backboard);

  for (let s = 0; s < 15; s++) {
    const slatY = 0.05 + s * 0.16;
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.014, 0.014), carvedTeakMat);
    slat.position.set(0, slatY, -0.728);
    backdropGroup.add(slat);
  }

  const pillarGeo = new THREE.CylinderGeometry(0.045, 0.05, 2.35, 16);
  const leftPillar = new THREE.Mesh(pillarGeo, carvedTeakMat);
  leftPillar.position.set(-0.95, 1.10, -0.73);
  backdropGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, carvedTeakMat);
  rightPillar.position.set(0.95, 1.10, -0.73);
  backdropGroup.add(rightPillar);

  const upperPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.60, 0.09, 1.10), carvedTeakMat);
  upperPlinth.position.set(0, -0.05, -0.20);
  backdropGroup.add(upperPlinth);

  // B. 2.5D Folio Plate Display (Visible in Folio Mode)
  const folioGroup = new THREE.Group();
  stageGroup.add(folioGroup);

  // Whatman Rag Paper Mesh
  const folioTextureLoader = new THREE.TextureLoader();
  const folioMap = folioTextureLoader.load('/lizars_anatomical_folio.jpg');
  folioMap.generateMipmaps = true;
  folioMap.minFilter = THREE.LinearMipmapLinearFilter;

  const folioMaterial = new THREE.MeshStandardMaterial({
    map: folioMap,
    roughness: 0.85,
    metalness: 0.02
  });

  const folioMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.30, 1.35), folioMaterial);
  folioMesh.position.set(0, 0.95, -0.05);
  folioGroup.add(folioMesh);

  // Copperplate Platemark Bevel Rim
  const plateBevelMat = new THREE.MeshStandardMaterial({
    color: activeThemeTokens.platemarkColor,
    roughness: 0.9,
    metalness: 0.05
  });
  const plateBevel = new THREE.Mesh(new THREE.BoxGeometry(2.36, 1.41, 0.02), plateBevelMat);
  plateBevel.position.set(0, 0.95, -0.065);
  folioGroup.add(plateBevel);

  // 6. Figure & Stratigraphy Groups
  const figureGroup = new THREE.Group();
  stageGroup.add(figureGroup);

  // Anatomical Strata groups for peeling
  const habitusGroup = new THREE.Group();
  const myologyGroup = new THREE.Group();
  const neurovascularGroup = new THREE.Group();
  const osteologyGroup = new THREE.Group();
  const customScanGroup = new THREE.Group();

  figureGroup.add(habitusGroup);
  figureGroup.add(myologyGroup);
  figureGroup.add(neurovascularGroup);
  figureGroup.add(osteologyGroup);
  figureGroup.add(customScanGroup);

  // Dynamic Clinical Posture & Focal Segment Groups
  let pelvicTiltGroup = new THREE.Group();
  let headGroup = new THREE.Group();
  let l4l5DiscMesh: THREE.Mesh | null = null;
  let l4l5NerveMarker: THREE.Mesh | null = null;
  let patellaMesh: THREE.Mesh | null = null;

  // Helper mesh adder
  function addMesh(
    group: THREE.Group,
    geom: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number],
    rot?: [number, number, number],
    scale?: [number, number, number]
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    group.add(mesh);
    return mesh;
  }

  // --- BUILD FEMALE ARCHETYPE ---
  function buildFemaleArchetype() {
    // A. Head & Cervical Carriage (retracts on neck posture correction)
    headGroup = new THREE.Group();
    headGroup.position.set(0, 0, 0);
    osteologyGroup.add(headGroup);
    addMesh(headGroup, new THREE.SphereGeometry(0.165, 32, 24), boneMaterial, [0, 1.83, 0], [0, 0, 0], [0.95, 1.12, 1.15]);
    addMesh(headGroup, new THREE.BoxGeometry(0.11, 0.05, 0.095), boneMaterial, [0, 1.67, 0.045]);

    // Thoracic Spine
    for (let i = 0; i < 16; i++) {
      const y = 1.55 - i * 0.042;
      const sCurve = Math.sin((i / 16) * Math.PI * 2) * 0.038;
      addMesh(osteologyGroup, new THREE.CylinderGeometry(0.026, 0.030, 0.035, 16), boneMaterial, [0, y, -0.04 + sCurve]);
    }
    // Clavicles
    addMesh(osteologyGroup, new THREE.CylinderGeometry(0.011, 0.013, 0.19, 12), boneMaterial, [-0.095, 1.51, 0.05], [0, 0, Math.PI * 0.44]);
    addMesh(osteologyGroup, new THREE.CylinderGeometry(0.011, 0.013, 0.19, 12), boneMaterial, [0.095, 1.51, 0.05], [0, 0, -Math.PI * 0.44]);

    // Pelvic Tilt & Lumbar L4-L5 Subassembly (rotates with rehab scrubber)
    pelvicTiltGroup = new THREE.Group();
    pelvicTiltGroup.position.set(0, 0.92, 0);
    osteologyGroup.add(pelvicTiltGroup);

    addMesh(pelvicTiltGroup, new THREE.TorusGeometry(0.185, 0.042, 16, 32, Math.PI * 1.15), boneMaterial, [0, 0.02, -0.01], [Math.PI * 0.46, 0, 0]);
    addMesh(pelvicTiltGroup, new THREE.BoxGeometry(0.13, 0.15, 0.08), boneMaterial, [0, -0.04, 0.02]);
    l4l5DiscMesh = addMesh(pelvicTiltGroup, new THREE.CylinderGeometry(0.028, 0.028, 0.016, 16), jointMaterial, [0, 0.04, -0.03]);
    const nerveMarkerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    l4l5NerveMarker = addMesh(pelvicTiltGroup, new THREE.SphereGeometry(0.012, 12, 12), nerveMarkerMat, [0.03, 0.04, -0.035]);

    // Knee joints & feet
    patellaMesh = addMesh(osteologyGroup, new THREE.SphereGeometry(0.040, 16, 16), jointMaterial, [0.115, 0.44, 0.06]);
    addMesh(osteologyGroup, new THREE.SphereGeometry(0.040, 16, 16), jointMaterial, [-0.115, 0.42, 0.02]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.055, 0.035, 0.14), boneMaterial, [-0.115, -0.01, 0.04]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.055, 0.035, 0.14), boneMaterial, [0.115, -0.01, 0.06]);

    // B. Myology (Muscles)
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.068, 0.075, 4, 18), muscleMaterial, [-0.088, 1.35, 0.105], [0.22, 0.16, -0.22]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.068, 0.075, 4, 18), muscleMaterial, [0.088, 1.35, 0.105], [0.22, -0.16, 0.22]);
    addMesh(myologyGroup, new THREE.CylinderGeometry(0.105, 0.13, 0.18, 24), muscleMaterial, [0, 1.15, 0], [0, 0, 0], [1.05, 1.0, 0.85]);
    addMesh(myologyGroup, new THREE.SphereGeometry(0.082, 20, 20), muscleMaterial, [-0.17, 0.91, 0.0], [0, 0, 0], [0.92, 1.15, 1.0]);
    addMesh(myologyGroup, new THREE.SphereGeometry(0.082, 20, 20), muscleMaterial, [0.17, 0.91, 0.0], [0, 0, 0], [0.92, 1.15, 1.0]);
    // Limbs
    addMesh(myologyGroup, new THREE.SphereGeometry(0.062, 16, 16), muscleMaterial, [-0.235, 1.48, 0.01]);
    addMesh(myologyGroup, new THREE.SphereGeometry(0.062, 16, 16), muscleMaterial, [0.235, 1.48, 0.01]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.036, 0.22, 4, 16), muscleMaterial, [-0.245, 1.28, 0.02]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.036, 0.22, 4, 16), muscleMaterial, [0.245, 1.28, 0.02]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.030, 0.24, 4, 16), muscleMaterial, [-0.245, 0.96, 0.03]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.030, 0.24, 4, 16), muscleMaterial, [0.245, 0.96, 0.03]);
    // 15° Q-angle legs
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.058, 0.36, 4, 18), muscleMaterial, [-0.145, 0.65, 0.01], [0.02, 0, 0.11]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.058, 0.36, 4, 18), muscleMaterial, [0.145, 0.65, 0.02], [-0.05, 0, -0.11]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.046, 0.32, 4, 16), muscleMaterial, [-0.115, 0.22, 0.0]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.046, 0.32, 4, 16), muscleMaterial, [0.115, 0.21, 0.02]);

    // C. Neurovascular (Arteries, Veins, Nerves)
    // Carotid / Jugular / Vagus trunk
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.007, 0.007, 0.20, 8), arteryMaterial, [-0.035, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.007, 0.007, 0.20, 8), arteryMaterial, [0.035, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.008, 0.008, 0.20, 8), veinMaterial, [-0.048, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.008, 0.008, 0.20, 8), veinMaterial, [0.048, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.004, 0.004, 0.20, 8), nerveMaterial, [-0.042, 1.62, 0.035]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.004, 0.004, 0.20, 8), nerveMaterial, [0.042, 1.62, 0.035]);
    // Femoral & Saphenous conduits
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.006, 0.006, 0.44, 8), arteryMaterial, [-0.10, 0.64, 0.03], [0, 0, 0.11]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.006, 0.006, 0.44, 8), arteryMaterial, [0.10, 0.64, 0.03], [0, 0, -0.11]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.006, 0.006, 0.44, 8), veinMaterial, [-0.115, 0.64, 0.03], [0, 0, 0.11]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.006, 0.006, 0.44, 8), veinMaterial, [0.115, 0.64, 0.03], [0, 0, -0.11]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.004, 0.004, 0.44, 8), nerveMaterial, [-0.088, 0.64, 0.035], [0, 0, 0.11]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.004, 0.004, 0.44, 8), nerveMaterial, [0.088, 0.64, 0.035], [0, 0, -0.11]);

    // D. Habitus (Surface Contours & Classical Drapery)
    const skinMat = new THREE.MeshStandardMaterial({
      color: activeThemeTokens.paperColor,
      roughness: 0.75,
      transparent: true,
      opacity: 0.85
    });
    addMesh(habitusGroup, new THREE.CylinderGeometry(0.125, 0.12, 0.30, 24), skinMat, [0, 1.38, 0], [0, 0, 0], [1.1, 1.0, 0.9]);
    addMesh(habitusGroup, new THREE.SphereGeometry(0.17, 24, 24), skinMat, [0, 1.83, 0], [0, 0, 0], [0.96, 1.14, 1.16]);
  }

  // --- BUILD MALE ARCHETYPE ---
  function buildMaleArchetype() {
    // Head & Cervical Carriage
    headGroup = new THREE.Group();
    headGroup.position.set(0, 0, 0);
    osteologyGroup.add(headGroup);
    addMesh(headGroup, new THREE.SphereGeometry(0.18, 32, 24), boneMaterial, [0, 1.84, 0], [0, 0, 0], [1.0, 1.15, 1.18]);
    addMesh(headGroup, new THREE.BoxGeometry(0.145, 0.065, 0.115), boneMaterial, [0, 1.66, 0.055]);

    for (let i = 0; i < 17; i++) {
      const y = 1.56 - i * 0.042;
      const sCurve = Math.sin((i / 17) * Math.PI * 2) * 0.030;
      addMesh(osteologyGroup, new THREE.CylinderGeometry(0.032, 0.036, 0.035, 16), boneMaterial, [0, y, -0.05 + sCurve]);
    }
    // Broad 0.44 Clavicles
    addMesh(osteologyGroup, new THREE.CylinderGeometry(0.016, 0.018, 0.25, 12), boneMaterial, [-0.13, 1.54, 0.06], [0, 0, Math.PI * 0.43]);
    addMesh(osteologyGroup, new THREE.CylinderGeometry(0.016, 0.018, 0.25, 12), boneMaterial, [0.13, 1.54, 0.06], [0, 0, -Math.PI * 0.43]);

    // Pelvic Tilt & Lumbar L4-L5 Subassembly
    pelvicTiltGroup = new THREE.Group();
    pelvicTiltGroup.position.set(0, 0.92, 0);
    osteologyGroup.add(pelvicTiltGroup);

    addMesh(pelvicTiltGroup, new THREE.TorusGeometry(0.17, 0.038, 14, 28, Math.PI * 1.05), boneMaterial, [0, 0.02, -0.01], [Math.PI * 0.45, 0, 0]);
    addMesh(pelvicTiltGroup, new THREE.BoxGeometry(0.12, 0.14, 0.06), boneMaterial, [0, -0.04, 0.04]);
    l4l5DiscMesh = addMesh(pelvicTiltGroup, new THREE.CylinderGeometry(0.032, 0.032, 0.018, 16), jointMaterial, [0, 0.04, -0.03]);
    const nerveMarkerMatMale = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    l4l5NerveMarker = addMesh(pelvicTiltGroup, new THREE.SphereGeometry(0.012, 12, 12), nerveMarkerMatMale, [0.032, 0.04, -0.035]);

    patellaMesh = addMesh(osteologyGroup, new THREE.SphereGeometry(0.048, 16, 16), jointMaterial, [0.15, 0.44, 0.05]);
    addMesh(osteologyGroup, new THREE.SphereGeometry(0.048, 16, 16), jointMaterial, [-0.15, 0.41, 0.03]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.075, 0.045, 0.16), boneMaterial, [-0.15, -0.01, 0.04]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.075, 0.045, 0.16), boneMaterial, [0.15, -0.01, 0.04]);

    // Myology (Broad V-Taper & Pectoralis Plates)
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.090, 0.135, 4, 18), muscleMaterial, [-0.115, 1.38, 0.105], [0.22, 0.22, -0.38]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.090, 0.135, 4, 18), muscleMaterial, [0.115, 1.38, 0.105], [0.22, -0.22, 0.38]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.065, 0.20, 4, 16), muscleMaterial, [-0.19, 1.30, -0.02], [0.1, 0.1, -0.25]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.065, 0.20, 4, 16), muscleMaterial, [0.19, 1.30, -0.02], [0.1, -0.1, 0.25]);
    // Rectus Abdominis
    for (let a = 0; a < 3; a++) {
      const ay = 1.18 - a * 0.075;
      addMesh(myologyGroup, new THREE.BoxGeometry(0.072, 0.062, 0.045), muscleMaterial, [-0.046, ay, 0.115]);
      addMesh(myologyGroup, new THREE.BoxGeometry(0.072, 0.062, 0.045), muscleMaterial, [0.046, ay, 0.115]);
    }
    // Deltoids & Arms
    addMesh(myologyGroup, new THREE.SphereGeometry(0.086, 18, 18), muscleMaterial, [-0.31, 1.50, 0.02]);
    addMesh(myologyGroup, new THREE.SphereGeometry(0.086, 18, 18), muscleMaterial, [0.31, 1.50, 0.02]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.052, 0.22, 4, 18), muscleMaterial, [-0.31, 1.29, 0.04]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.052, 0.22, 4, 18), muscleMaterial, [0.31, 1.29, 0.04]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.042, 0.25, 4, 16), muscleMaterial, [-0.31, 0.96, 0.04]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.042, 0.25, 4, 16), muscleMaterial, [0.31, 0.96, 0.04]);
    // Straight athletic legs
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.075, 0.36, 4, 18), muscleMaterial, [-0.15, 0.64, 0.03]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.075, 0.36, 4, 18), muscleMaterial, [0.15, 0.64, 0.03]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.058, 0.26, 4, 18), muscleMaterial, [-0.15, 0.24, -0.03]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.058, 0.26, 4, 18), muscleMaterial, [0.15, 0.24, -0.03]);

    // Neurovascular
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), arteryMaterial, [-0.040, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), arteryMaterial, [0.040, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.009, 0.009, 0.22, 8), veinMaterial, [-0.054, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.009, 0.009, 0.22, 8), veinMaterial, [0.054, 1.62, 0.03]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.004, 0.004, 0.22, 8), nerveMaterial, [-0.046, 1.62, 0.035]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.004, 0.004, 0.22, 8), nerveMaterial, [0.046, 1.62, 0.035]);
    // Femoral & Brachial trunks
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.007, 0.007, 0.44, 8), arteryMaterial, [-0.12, 0.64, 0.04]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.007, 0.007, 0.44, 8), arteryMaterial, [0.12, 0.64, 0.04]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.007, 0.007, 0.44, 8), veinMaterial, [-0.135, 0.64, 0.04]);
    addMesh(neurovascularGroup, new THREE.CylinderGeometry(0.007, 0.007, 0.44, 8), veinMaterial, [0.135, 0.64, 0.04]);

    // Habitus
    const skinMat = new THREE.MeshStandardMaterial({
      color: activeThemeTokens.paperColor,
      roughness: 0.75,
      transparent: true,
      opacity: 0.85
    });
    addMesh(habitusGroup, new THREE.CylinderGeometry(0.16, 0.14, 0.36, 24), skinMat, [0, 1.38, 0], [0, 0, 0], [1.2, 1.0, 0.9]);
    addMesh(habitusGroup, new THREE.SphereGeometry(0.18, 24, 24), skinMat, [0, 1.84, 0], [0, 0, 0], [1.02, 1.16, 1.18]);
  }

  // --- BUILD ECORCHÉ ARCHETYPE (1543 VESALIUS) ---
  function buildEcorcheArchetype() {
    // Skull & Spine
    addMesh(osteologyGroup, new THREE.SphereGeometry(0.18, 32, 24), boneMaterial, [0, 1.84, 0], [0, 0, 0], [1.0, 1.15, 1.18]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.14, 0.12, 0.12), boneMaterial, [0, 1.74, 0.06]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.13, 0.06, 0.11), boneMaterial, [0, 1.66, 0.05]);
    for (let i = 0; i < 18; i++) {
      const y = 1.58 - i * 0.042;
      const curvature = Math.sin((i / 18) * Math.PI * 2) * 0.032;
      addMesh(osteologyGroup, new THREE.CylinderGeometry(0.032, 0.036, 0.035, 16), boneMaterial, [0, y, -0.05 + curvature]);
    }
    // 9 Rib Pairs & Sternum
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.045, 0.32, 0.02), boneMaterial, [0, 1.34, 0.14]);
    for (let r = 0; r < 9; r++) {
      const ry = 1.48 - r * 0.034;
      const rx = 0.14 + Math.sin((r / 8) * Math.PI) * 0.09;
      addMesh(osteologyGroup, new THREE.TorusGeometry(rx, 0.012, 10, 24, Math.PI * 0.82), boneMaterial, [-0.01, ry, 0.01], [Math.PI * 0.5, 0.1, -0.2]);
      addMesh(osteologyGroup, new THREE.TorusGeometry(rx, 0.012, 10, 24, Math.PI * 0.82), boneMaterial, [0.01, ry, 0.01], [Math.PI * 0.5, -0.1, Math.PI - 0.2]);
    }
    // Dissected Muscle Sheets
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.08, 0.12, 4, 16), muscleMaterial, [-0.11, 1.38, 0.10], [0.2, 0.2, -0.4]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.08, 0.12, 4, 16), muscleMaterial, [0.11, 1.38, 0.10], [0.2, -0.2, 0.4]);
    for (let a = 0; a < 3; a++) {
      const ay = 1.18 - a * 0.075;
      addMesh(myologyGroup, new THREE.BoxGeometry(0.075, 0.06, 0.04), muscleMaterial, [-0.045, ay, 0.11]);
      addMesh(myologyGroup, new THREE.BoxGeometry(0.075, 0.06, 0.04), muscleMaterial, [0.045, ay, 0.11]);
    }
    // Limbs & Joints
    addMesh(osteologyGroup, new THREE.TorusGeometry(0.19, 0.038, 12, 28, Math.PI * 1.1), boneMaterial, [0, 0.94, -0.01], [Math.PI * 0.45, 0, 0]);
    addMesh(osteologyGroup, new THREE.SphereGeometry(0.052, 16, 16), jointMaterial, [-0.16, 0.86, 0]);
    addMesh(osteologyGroup, new THREE.SphereGeometry(0.052, 16, 16), jointMaterial, [0.16, 0.86, 0]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.065, 0.32, 4, 18), muscleMaterial, [-0.15, 0.65, 0.03]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.065, 0.32, 4, 18), muscleMaterial, [0.15, 0.65, 0.03]);
    addMesh(osteologyGroup, new THREE.SphereGeometry(0.048, 16, 16), jointMaterial, [-0.15, 0.41, 0.03]);
    addMesh(osteologyGroup, new THREE.SphereGeometry(0.048, 16, 16), jointMaterial, [0.15, 0.41, 0.03]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.052, 0.24, 4, 16), muscleMaterial, [-0.15, 0.24, -0.03]);
    addMesh(myologyGroup, new THREE.CapsuleGeometry(0.052, 0.24, 4, 16), muscleMaterial, [0.15, 0.24, -0.03]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.07, 0.04, 0.15), boneMaterial, [-0.15, -0.01, 0.04]);
    addMesh(osteologyGroup, new THREE.BoxGeometry(0.07, 0.04, 0.15), boneMaterial, [0.15, -0.01, 0.04]);
  }

  // Clear all figures from groups
  function clearFigureGroups() {
    [habitusGroup, myologyGroup, neurovascularGroup, osteologyGroup, customScanGroup].forEach(g => {
      while (g.children.length > 0) {
        const obj = g.children[0] as THREE.Mesh;
        if (obj.geometry) obj.geometry.dispose();
        g.remove(obj);
      }
    });
  }

  function rebuildFigure() {
    clearFigureGroups();
    if (activeArchetype === 'female') {
      buildFemaleArchetype();
    } else if (activeArchetype === 'male') {
      buildMaleArchetype();
    } else if (activeArchetype === 'ecorche') {
      buildEcorcheArchetype();
    }
    applyDissectionPeeling(activeDissectionDepth);
  }

  // Apply Dissection Peeling (Z-Separation + Alpha Fading)
  function applyDissectionPeeling(depth: number) {
    activeDissectionDepth = Math.max(0, Math.min(1, depth));

    // Depth 0.00 -> 0.25: Habitus visible, starts fading
    // Depth 0.25 -> 0.50: Myology prominent
    // Depth 0.50 -> 0.75: Neurovascular glowing
    // Depth 0.75 -> 1.00: Osteology isolated
    const habitusOpacity = Math.max(0, 1.0 - activeDissectionDepth * 3.2);
    const myologyOpacity = activeDissectionDepth < 0.25
      ? 0.4 + activeDissectionDepth * 2.4
      : Math.max(0, 1.0 - (activeDissectionDepth - 0.25) * 2.0);
    const neuroOpacity = activeDissectionDepth < 0.35
      ? 0.3 + activeDissectionDepth * 2.0
      : Math.max(0.2, 1.0 - (activeDissectionDepth - 0.7) * 2.5);
    const osteoOpacity = 0.5 + activeDissectionDepth * 0.5;

    // Volumetric Z-Separation (Exploded Layers in 3D Mode)
    const zOffset = activeViewMode === 'sculpture_3d' ? activeDissectionDepth * 0.22 : 0;
    habitusGroup.position.z = zOffset * 1.5;
    myologyGroup.position.z = zOffset * 0.5;
    neurovascularGroup.position.z = -zOffset * 0.4;
    osteologyGroup.position.z = -zOffset * 1.0;

    // Apply opacities to materials
    habitusGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mat = (obj as THREE.Mesh).material as THREE.Material;
        mat.transparent = true;
        mat.opacity = habitusOpacity;
      }
    });

    myologyGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mat = (obj as THREE.Mesh).material as THREE.Material;
        mat.transparent = true;
        mat.opacity = myologyOpacity;
      }
    });

    neurovascularGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mat = (obj as THREE.Mesh).material as THREE.Material;
        mat.transparent = true;
        mat.opacity = neuroOpacity;
      }
    });
  }

  // 7. Interactive Callout Pins & DOM Projection Overlay
  const pinsContainer = document.createElement('div');
  pinsContainer.id = 'vesalianPinsContainer';
  pinsContainer.style.position = 'absolute';
  pinsContainer.style.top = '0';
  pinsContainer.style.left = '0';
  pinsContainer.style.width = '100%';
  pinsContainer.style.height = '100%';
  pinsContainer.style.pointerEvents = 'none';
  pinsContainer.style.zIndex = '15';
  mountEl.appendChild(pinsContainer);

  interface IPinDOMEntry {
    pin: IAnatomicalPin;
    el: HTMLElement;
    badge: HTMLElement;
    pill: HTMLElement;
  }
  const pinDOMElements: IPinDOMEntry[] = [];

  let activeFocalRegion: ClinicalRegionKey = 'lumbar';

  function filterFocalPin(focalPinId: string | null) {
    pinDOMElements.forEach(({ pin, el }) => {
      if (!focalPinId) {
        el.style.display = 'flex';
        el.style.opacity = '0.9';
        el.style.transform = 'translate(-50%, -50%) scale(1.0)';
      } else if (pin.id === focalPinId) {
        el.style.display = 'flex';
        el.style.opacity = '1.0';
        el.style.transform = 'translate(-50%, -50%) scale(1.12)';
        el.style.zIndex = '35';
      } else {
        el.style.display = 'none';
      }
    });
  }

  function focusRegion(region: ClinicalRegionKey) {
    activeFocalRegion = region;
    isTransitioningCamera = true;

    if (region === 'lumbar') {
      targetCamPos.set(0.0, 0.94, 1.65);
      targetCamLookAt.set(0.0, 0.90, 0.0);
      filterFocalPin('lumbar_l4_l5');
    } else if (region === 'knee') {
      targetCamPos.set(0.12, 0.48, 1.35);
      targetCamLookAt.set(0.12, 0.44, 0.0);
      filterFocalPin('patellofemoral');
    } else if (region === 'cervical') {
      targetCamPos.set(0.0, 1.50, 1.25);
      targetCamLookAt.set(0.0, 1.46, 0.0);
      filterFocalPin('cervical_spine');
    } else {
      targetCamPos.set(0.0, 1.1, 4.2);
      targetCamLookAt.set(0.0, 0.95, 0.0);
      filterFocalPin(null);
    }
  }

  function createPinDOMs() {
    pinsContainer.innerHTML = '';
    pinDOMElements.length = 0;

    LIZARS_ANATOMICAL_PINS.forEach((pin) => {
      const pinEl = document.createElement('div');
      pinEl.className = 'lizars-pin-marker';
      pinEl.style.position = 'absolute';
      pinEl.style.transform = 'translate(-50%, -50%)';
      pinEl.style.pointerEvents = 'auto';
      pinEl.style.cursor = 'pointer';
      pinEl.style.display = 'flex';
      pinEl.style.alignItems = 'center';
      pinEl.style.gap = '6px';
      pinEl.style.transition = 'transform 0.15s ease, opacity 0.2s ease';

      // Circular Number Badge
      const badge = document.createElement('div');
      badge.style.width = '20px';
      badge.style.height = '20px';
      badge.style.borderRadius = '50%';
      badge.style.background = pin.color;
      badge.style.color = '#ffffff';
      badge.style.fontSize = '10.5px';
      badge.style.fontWeight = 'bold';
      badge.style.fontFamily = "'PocketGull Mono', monospace";
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.boxShadow = '0 0 8px rgba(0,0,0,0.6)';
      badge.style.border = '1.5px solid #ffffff';
      badge.textContent = pin.number.toString();
      pinEl.appendChild(badge);

      // Callout Label Pill
      const pill = document.createElement('div');
      pill.style.background = 'rgba(24, 18, 14, 0.90)';
      pill.style.color = '#f5eedb';
      pill.style.border = `1px solid ${pin.color}`;
      pill.style.padding = '3px 8px';
      pill.style.borderRadius = '6px';
      pill.style.fontSize = '10px';
      pill.style.fontFamily = "'PocketGull Mono', monospace";
      pill.style.backdropFilter = 'blur(6px)';
      pill.style.whiteSpace = 'nowrap';
      pill.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
      pill.innerHTML = `<span style="font-style: italic; color: #ffd166;">${pin.latinName}</span>`;
      pinEl.appendChild(pill);

      // Tooltip Card (On hover or click)
      const tooltip = document.createElement('div');
      tooltip.style.display = 'none';
      tooltip.style.position = 'absolute';
      tooltip.style.top = '26px';
      tooltip.style.left = '0';
      tooltip.style.width = '240px';
      tooltip.style.background = 'rgba(20, 15, 12, 0.96)';
      tooltip.style.border = `1px solid ${pin.color}`;
      tooltip.style.padding = '8px 10px';
      tooltip.style.borderRadius = '8px';
      tooltip.style.fontSize = '10px';
      tooltip.style.color = '#e2d5c3';
      tooltip.style.zIndex = '30';
      tooltip.style.boxShadow = '0 6px 20px rgba(0,0,0,0.7)';
      tooltip.innerHTML = `
        <div style="font-weight: bold; color: ${pin.color}; font-size: 11px; margin-bottom: 2px;">
          ${pin.number}. ${pin.latinName}
        </div>
        <div style="color: #a89481; font-size: 9.5px; margin-bottom: 4px;">
          ${pin.englishName}
        </div>
        <div style="line-height: 1.4; font-size: 10px; color: #f5eedb;">
          ${pin.clinicalNotes}
        </div>
      `;
      pinEl.appendChild(tooltip);

      pinEl.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
        badge.style.transform = 'scale(1.25)';
      });
      pinEl.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        badge.style.transform = 'scale(1.0)';
      });
      pinEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pinSelectCallback) pinSelectCallback(pin);
      });

      pinsContainer.appendChild(pinEl);
      pinDOMElements.push({ pin, el: pinEl, badge, pill });
    });

    filterFocalPin(activeFocalRegion === 'full' ? null : 'lumbar_l4_l5');
  }
  createPinDOMs();

  // Project 3D Pin Coordinates to 2D Screen
  const pinVec = new THREE.Vector3();
  function updatePinsProjection() {
    if (activeViewMode === 'folio') {
      pinsContainer.style.display = 'block';
    } else if (activeFocalRegion && activeFocalRegion !== 'full') {
      pinsContainer.style.display = 'block';
    } else {
      pinsContainer.style.display = 'none';
      return;
    }
    pinsContainer.style.display = 'block';

    const halfW = (mountEl?.clientWidth || 800) / 2;
    const halfH = (mountEl?.clientHeight || 560) / 2;

    pinDOMElements.forEach(({ pin, el }) => {
      pinVec.set(pin.position[0], pin.position[1], pin.position[2]);
      pinVec.project(camera);

      // Check if pin is behind camera
      if (pinVec.z > 1.0) {
        el.style.opacity = '0';
        return;
      }

      el.style.opacity = '1';
      const x = pinVec.x * halfW + halfW;
      const y = -(pinVec.y * halfH) + halfH;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
  }

  // 8. View Mode Transition (Folio 2.5D vs 3D Volumetric Stage)
  function setViewMode(mode: AnatomicalViewMode) {
    activeViewMode = mode;
    isTransitioningCamera = true;

    if (mode === 'folio') {
      folioGroup.visible = true;
      backdropGroup.visible = false;
      figureGroup.visible = false;
      targetCamPos.set(0.0, 0.95, 2.3);
      targetCamLookAt.set(0.0, 0.95, 0.0);
      controls.autoRotate = false;
      controls.enableRotate = false; // Pure 2.5D Pan/Zoom in Folio Mode
      controls.enablePan = true;
    } else {
      folioGroup.visible = false;
      backdropGroup.visible = true;
      figureGroup.visible = true;
      targetCamPos.set(0.0, 1.1, 4.2);
      targetCamLookAt.set(0.0, 0.95, 0.0);
      controls.enableRotate = true; // Full 360° Orbit in 3D Mode
      controls.enablePan = true;
      applyDissectionPeeling(activeDissectionDepth);
    }
  }

  // 9. Theme Applicator
  function applyTheme(key: LizarsThemeKey | string) {
    activeThemeKey = key as LizarsThemeKey;
    activeThemeTokens = getLizarsTheme(key);

    scene.background = new THREE.Color(activeThemeTokens.backdropColor);
    scene.fog = new THREE.FogExp2(activeThemeTokens.backdropColor, 0.06);

    plateBevelMat.color.setHex(activeThemeTokens.platemarkColor);
    arteryMaterial.color.setHex(activeThemeTokens.arterialColor);
    veinMaterial.color.setHex(activeThemeTokens.venousColor);
    nerveMaterial.color.setHex(activeThemeTokens.nerveColor);

    if (muscleMaterial.uniforms['uInkColor']) {
      muscleMaterial.uniforms['uInkColor'].value = new THREE.Color(activeThemeTokens.muscleColor);
    }
    if (muscleMaterial.uniforms['uPaperColor']) {
      muscleMaterial.uniforms['uPaperColor'].value = new THREE.Color(activeThemeTokens.paperColor);
    }
    if (boneMaterial.uniforms['uInkColor']) {
      boneMaterial.uniforms['uInkColor'].value = new THREE.Color(activeThemeTokens.boneColor);
    }
    if (boneMaterial.uniforms['uPaperColor']) {
      boneMaterial.uniforms['uPaperColor'].value = new THREE.Color(activeThemeTokens.paperColor);
    }
    if (jointMaterial.uniforms['uInkColor']) {
      jointMaterial.uniforms['uInkColor'].value = new THREE.Color(activeThemeTokens.accentColor);
    }

    createPinDOMs();
  }

  // 10. Live 3D Scan Ingestion
  async function loadExternalModel(
    fileOrUrl: File | string | ArrayBuffer,
    format?: 'glb' | 'gltf' | 'obj'
  ): Promise<boolean> {
    try {
      let object3D: THREE.Object3D | null = null;
      const detectedFormat = format || (typeof fileOrUrl === 'string' && fileOrUrl.endsWith('.obj') ? 'obj' : 'glb');

      if (detectedFormat === 'obj') {
        const objLoader = new OBJLoader();
        if (typeof fileOrUrl === 'string') {
          object3D = await objLoader.loadAsync(fileOrUrl);
        } else if (fileOrUrl instanceof File) {
          const text = await fileOrUrl.text();
          object3D = objLoader.parse(text);
        }
      } else {
        const gltfLoader = new GLTFLoader();
        if (typeof fileOrUrl === 'string') {
          const gltf = await gltfLoader.loadAsync(fileOrUrl);
          object3D = gltf.scene;
        } else if (fileOrUrl instanceof File) {
          const buffer = await fileOrUrl.arrayBuffer();
          const gltf = await new Promise<any>((resolve, reject) => {
            gltfLoader.parse(buffer, '', resolve, reject);
          });
          object3D = gltf.scene;
        }
      }

      if (!object3D) return false;

      // Normalize model: Center at (0, 0.95, 0) and scale to 1.8m height
      const box = new THREE.Box3().setFromObject(object3D);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      const targetHeight = 1.8;
      const scaleFactor = targetHeight / (size.y || 1.0);
      object3D.scale.set(scaleFactor, scaleFactor, scaleFactor);
      object3D.position.set(-center.x * scaleFactor, 0.95 - (center.y * scaleFactor), -center.z * scaleFactor);

      // Apply Lizars / Theme shader to all meshes
      object3D.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = muscleMaterial;
        }
      });

      // Clear existing figures and set active archetype to custom_scan
      clearFigureGroups();
      customScanGroup.add(object3D);
      activeArchetype = 'custom_scan';
      setViewMode('sculpture_3d');
      return true;
    } catch (err) {
      console.error('[Lizars3D] Failed to load external 3D scan:', err);
      return false;
    }
  }

  // Viewport Drag-and-Drop Ingestion Listener
  mountEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    mountEl.style.outline = `2px dashed ${activeThemeTokens.accentColor.toString(16)}`;
  });
  mountEl.addEventListener('dragleave', () => {
    mountEl.style.outline = 'none';
  });
  mountEl.addEventListener('drop', async (e) => {
    e.preventDefault();
    mountEl.style.outline = 'none';
    if (e.dataTransfer?.files?.length) {
      const file = e.dataTransfer.files[0];
      await loadExternalModel(file);
    }
  });

  // Initial Figure Construction & View Mode Setup
  rebuildFigure();
  setViewMode(activeViewMode);
  applyTheme(activeThemeKey);

  // Initial orientation
  figureGroup.rotation.y = 0.25;

  // 11. Animation Loop
  let isRunning = true;
  let animFrameId = 0;
  const clock = new THREE.Clock();

  function animate() {
    if (!isRunning) return;
    animFrameId = requestAnimationFrame(animate);

    controls.update();

    // Smooth camera interpolation on view mode change
    if (isTransitioningCamera) {
      camera.position.lerp(targetCamPos, 0.08);
      controls.target.lerp(targetCamLookAt, 0.08);
      if (camera.position.distanceTo(targetCamPos) < 0.02) {
        camera.position.copy(targetCamPos);
        controls.target.copy(targetCamLookAt);
        isTransitioningCamera = false;
      }
    }

    // Subtle natural breath rise/fall (only in 3D mode)
    if (activeViewMode === 'sculpture_3d') {
      const elapsed = clock.getElapsedTime();
      figureGroup.position.y = Math.sin(elapsed * 1.2) * 0.008;

      // 0.1 Hz Bio-Rhythmic Eye-Pacing Light Modulation (10-second respiratory wave)
      if (isBioPacingActive) {
        const paceWave = (Math.sin(elapsed * 0.6283) + 1.0) * 0.5; // 0.0 to 1.0
        const baseKey = activeShadingProfile === 'theatre' ? 4.5 : (activeShadingProfile === 'clinical' ? 2.4 : 3.6);
        keyLight.intensity = baseKey * (0.92 + paceWave * 0.16);
        rimLight.intensity = 1.4 * (0.90 + paceWave * 0.20);
      }
    } else {
      figureGroup.position.y = 0;
    }

    // Update 2D Screen Projections for Callout Pins
    updatePinsProjection();

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

  function updateBiomechanicalState() {
    const fatigueRatio = Math.min(1.0, sessionFatigueMinutes / 120.0);
    const maxTilt = 0.22 + fatigueRatio * 0.12;
    const maxHeadJut = 0.032 + fatigueRatio * 0.018;
    const baseDiscScale = Math.max(0.60, 1.0 - fatigueRatio * 0.32);

    if (pelvicTiltGroup) {
      pelvicTiltGroup.rotation.x = (1.0 - activeTension) * maxTilt;
      pelvicTiltGroup.position.y = 0.92 + activeTension * 0.016;
    }
    if (l4l5DiscMesh) {
      l4l5DiscMesh.scale.y = baseDiscScale + activeTension * 0.50;
    }
    if (l4l5NerveMarker) {
      const mat = l4l5NerveMarker.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.color.setHex(activeTension > 0.6 ? 0x2dd4bf : 0xef4444);
      }
    }
    if (patellaMesh) {
      patellaMesh.position.x = 0.115 + (1.0 - activeTension) * 0.014;
    }
    if (headGroup) {
      headGroup.position.z = (1.0 - activeTension) * maxHeadJut;
    }

    const l4Pin = pinDOMElements.find(p => p.pin.id === 'lumbar_l4_l5');
    if (l4Pin) {
      const isDecompressed = activeTension > 0.6;
      const color = isDecompressed ? '#2dd4bf' : '#ef4444';
      l4Pin.badge.style.background = color;
      l4Pin.pill.style.borderColor = color;
      l4Pin.pill.innerHTML = isDecompressed
        ? `<span style="color: #2dd4bf; font-weight: bold;">✓ L4–L5 Decompressed (+2.4 mm)</span>`
        : `<span style="color: #ef4444; font-weight: bold;">⚠ L4–L5 Pinched (Anterior Tilt)</span>`;
    }
  }

  function setArchetype(type: AnatomicalArchetype) {
    activeArchetype = type;
    rebuildFigure();
  }

  function setDissectionDepth(val: number) {
    applyDissectionPeeling(val);
  }

  // 12. Returned Viewer API Controller
  return {
    setViewMode(mode: AnatomicalViewMode) {
      setViewMode(mode);
    },
    getViewMode() {
      return activeViewMode;
    },
    setArchetype(type: AnatomicalArchetype) {
      setArchetype(type);
      return activeArchetype;
    },
    getArchetype() {
      return activeArchetype;
    },
    setDissectionDepth(val: number) {
      setDissectionDepth(val);
    },
    getDissectionDepth() {
      return activeDissectionDepth;
    },
    setTheme(themeKey: LizarsThemeKey | string) {
      applyTheme(themeKey);
    },
    getTheme() {
      return activeThemeKey;
    },
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
    setSurfaceStyle(style: SurfaceStyleKey) {
      activeSurfaceStyle = style;
      const code = style === 'woodcut' ? 1.0 : 0.0;
      if (muscleMaterial.uniforms['uSurfaceStyle']) {
        muscleMaterial.uniforms['uSurfaceStyle'].value = code;
      }
      if (boneMaterial.uniforms['uSurfaceStyle']) {
        boneMaterial.uniforms['uSurfaceStyle'].value = code;
      }
      if (jointMaterial.uniforms['uSurfaceStyle']) {
        jointMaterial.uniforms['uSurfaceStyle'].value = code;
      }
    },
    getSurfaceStyle() {
      return activeSurfaceStyle;
    },
    setMuscleTension(val: number) {
      activeTension = Math.max(0, Math.min(1, val));
      if (muscleMaterial.uniforms['uMuscleTension']) {
        muscleMaterial.uniforms['uMuscleTension'].value = activeTension;
      }
      if (jointMaterial.uniforms['uMuscleTension']) {
        jointMaterial.uniforms['uMuscleTension'].value = activeTension * 0.5;
      }
      updateBiomechanicalState();
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
      if (activeFocalRegion && activeFocalRegion !== 'full') {
        focusRegion(activeFocalRegion);
      } else if (activeViewMode === 'folio') {
        targetCamPos.set(0.0, 0.95, 2.3);
        targetCamLookAt.set(0.0, 0.95, 0.0);
        isTransitioningCamera = true;
      } else {
        targetCamPos.set(0.0, 1.1, 4.2);
        targetCamLookAt.set(0.0, 0.95, 0.0);
        isTransitioningCamera = true;
      }
    },
    focusRegion(region: ClinicalRegionKey) {
      focusRegion(region);
    },
    setShadingProfile(profile: ShadingProfileKey) {
      applyShadingProfile(profile);
    },
    getShadingProfile() {
      return activeShadingProfile;
    },
    setCircadianHour(h: number) {
      applyCircadianHour(h);
    },
    toggleBioPacing() {
      isBioPacingActive = !isBioPacingActive;
      return isBioPacingActive;
    },
    setSessionFatigue(mins: number) {
      sessionFatigueMinutes = mins;
      updateBiomechanicalState();
    },
    loadExternalModel(fileOrUrl, format) {
      return loadExternalModel(fileOrUrl, format);
    },
    onPinSelect(cb) {
      pinSelectCallback = cb;
    },
    dispose() {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      if (mountEl.contains(pinsContainer)) {
        mountEl.removeChild(pinsContainer);
      }
    }
  };
}

// Attach to window for standalone HTML proof scripts
if (typeof window !== 'undefined') {
  (window as any).initVesalian3DViewer = initVesalian3DViewer;
  (window as any).LIZARS_ANATOMICAL_PINS = LIZARS_ANATOMICAL_PINS;
  (window as any).LIZARS_THEMES = LIZARS_THEMES;
}
