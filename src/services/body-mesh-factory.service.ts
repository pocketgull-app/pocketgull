import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AdobeFireflyTextureService } from './adobe-firefly-texture.service';

export type FitzpatrickSkinType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
export type AnatomicalArchetype = 'homo_sapiens_female' | 'homo_sapiens_male' | 'homo_sapiens_senior' | 'homo_sapiens_pediatric' | 'ecorche' | 'pongo_pygmaeus';

export interface IMannequinBuildResult {
  group: THREE.Group;
  parts: Map<string, THREE.Group | THREE.Mesh>;
}

@Injectable({
  providedIn: 'root'
})
export class BodyMeshFactoryService {
  private fireflyTexture = inject(AdobeFireflyTextureService);

  /**
   * Returns Hex PBR color for a given Fitzpatrick skin phototype.
   */
  getFitzpatrickColor(type: FitzpatrickSkinType): number {
    switch (type) {
      case 'I': return 0xf7d0b5;
      case 'II': return 0xf3c5a6;
      case 'III': return 0xd8a07c;
      case 'IV': return 0xaa724b;
      case 'V': return 0x7a4929;
      case 'VI': return 0x422614;
      default: return 0xd8a07c;
    }
  }

  /**
   * Creates the high-fidelity anatomical mannequin group with skin, muscle, bone, organ,
   * neurovascular, dermatome, chakra, and meridian layers tailored to the chosen archetype.
   */
  createMannequinGroup(
    phototype: FitzpatrickSkinType = 'III',
    archetype: AnatomicalArchetype = 'homo_sapiens_male'
  ): IMannequinBuildResult {
    const mannequinGroup = new THREE.Group();
    mannequinGroup.name = `mannequin_${archetype}`;
    const parts = new Map<string, THREE.Group | THREE.Mesh>();

    const isEcorche = archetype === 'ecorche';
    const isFemale = archetype === 'homo_sapiens_female';
    const isSenior = archetype === 'homo_sapiens_senior';
    const isPediatric = archetype === 'homo_sapiens_pediatric';
    const isPrimate = archetype === 'pongo_pygmaeus';

    // Adobe Firefly procedural PBR textures
    const skinTexture = this.fireflyTexture.getFireflyTexture('skin');
    const muscleTexture = this.fireflyTexture.getFireflyTexture('muscle');
    const boneTexture = this.fireflyTexture.getFireflyTexture('skeleton');

    const skinColor = this.getFitzpatrickColor(phototype);

    // 1. Material Suite
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor,
      bumpMap: skinTexture,
      bumpScale: 0.04,
      roughness: 0.38,
      metalness: 0.12,
      emissive: 0x0369a1,
      emissiveIntensity: 0.04,
      transparent: true,
      opacity: isEcorche ? 0.08 : 0.88,
      depthWrite: !isEcorche
    });

    const muscleMaterial = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      bumpMap: muscleTexture,
      bumpScale: 0.08,
      roughness: 0.65,
      metalness: 0.1,
      transparent: true,
      opacity: isEcorche ? 0.95 : 0.75,
      depthWrite: isEcorche
    });

    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f4,
      bumpMap: boneTexture,
      bumpScale: 0.03,
      roughness: 0.42,
      metalness: 0.08,
      transparent: true,
      opacity: isEcorche ? 0.98 : 0.85,
      depthWrite: isEcorche
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.5,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    const organMaterial = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x9f1239,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.92
    });

    const heartMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.3,
      emissive: 0xb45309,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.95
    });

    const lungMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.88
    });

    const liverMaterial = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.45,
      metalness: 0.15,
      emissive: 0x713f12,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.92
    });

    const kidneyMaterial = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.35,
      metalness: 0.2,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.92
    });

    const arteryMaterial = new THREE.MeshStandardMaterial({
      color: 0xd63031,
      roughness: 0.35,
      metalness: 0.1,
      emissive: 0xd63031,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 0.95
    });

    const veinMaterial = new THREE.MeshStandardMaterial({
      color: 0x0984e3,
      roughness: 0.4,
      metalness: 0.05,
      emissive: 0x0984e3,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.92
    });

    const nerveMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdcb6e,
      roughness: 0.45,
      metalness: 0.0,
      emissive: 0xfdcb6e,
      emissiveIntensity: 0.25,
      transparent: true,
      opacity: 0.95
    });

    const dermatomeMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.5,
      metalness: 0.1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.65,
      wireframe: true
    });

    const chakraMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xa855f7,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9
    });

    const meridianMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.1,
      metalness: 0.5,
      emissive: 0x34d399,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });

    const toothMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafaf9,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xe7e5e4,
      emissiveIntensity: 0.1
    });

    // Helper: Register part & attach touch target proxy
    const addPart = (id: string, groupOrMesh: THREE.Group | THREE.Mesh) => {
      groupOrMesh.userData['id'] = id;
      parts.set(id, groupOrMesh);
      mannequinGroup.add(groupOrMesh);

      // Recursive tag & proxy generation
      const meshes: THREE.Mesh[] = [];
      if (groupOrMesh instanceof THREE.Mesh) {
        meshes.push(groupOrMesh);
      } else {
        groupOrMesh.traverse((child) => {
          if (child instanceof THREE.Mesh && !child.userData['isTouchProxy']) {
            meshes.push(child);
          }
        });
      }

      meshes.forEach((mesh) => {
        if (!mesh.userData['id']) mesh.userData['id'] = id;

        // Fitts's Law touch proxy (1.4x scale invisible hitbox)
        const proxyGeom = mesh.geometry.clone();
        proxyGeom.scale(1.4, 1.4, 1.4);
        const proxyMesh = new THREE.Mesh(
          proxyGeom,
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        proxyMesh.position.copy(mesh.position);
        proxyMesh.rotation.copy(mesh.rotation);
        proxyMesh.scale.copy(mesh.scale);
        proxyMesh.userData['id'] = id;
        proxyMesh.userData['isTouchProxy'] = true;
        mannequinGroup.add(proxyMesh);
      });
    };

    // Helper: Build mesh with layer metadata
    const createMesh = (
      geom: THREE.BufferGeometry,
      mat: THREE.Material,
      layer: 'skin' | 'muscle' | 'bone' | 'organ' | 'neurovascular' | 'dermatome' | 'chakra' | 'acupoint',
      pos?: [number, number, number],
      rot?: [number, number, number],
      scale?: [number, number, number]
    ): THREE.Mesh => {
      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData['layer'] = layer;
      if (pos) mesh.position.set(pos[0], pos[1], pos[2]);
      if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
      if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
      return mesh;
    };

    // --- PROPORTIONAL TUNING ---
    const headScale = isPediatric ? 1.25 : (isPrimate ? 1.15 : 1.0);
    const torsoScaleY = isPediatric ? 0.82 : 1.0;
    const limbScaleY = isPediatric ? 0.78 : (isPrimate ? 1.25 : 1.0);
    const armLengthScale = isPrimate ? 1.35 : 1.0;
    const pelvicRadius = isFemale ? 0.185 : (isPrimate ? 0.20 : 0.17);
    const qAngle = isFemale ? 0.11 : (isPrimate ? 0.04 : 0.07); // Radian Q-angle for thighs
    const chestWidth = isFemale ? 0.26 : (isPrimate ? 0.36 : 0.30);
    const kyphosisOffset = isSenior ? 0.035 : 0.0;

    // ==========================================
    // 1. HEAD & CRANIAL VAULT
    // ==========================================
    const headGroup = new THREE.Group();
    // Neurocranium & skull
    const craniumMesh = createMesh(
      new THREE.SphereGeometry(0.165 * headScale, 32, 24),
      boneMaterial,
      'bone',
      [0, 1.83, -0.01],
      [0, 0, 0],
      [0.96, 1.12, 1.15]
    );
    headGroup.add(craniumMesh);

    // Mandible & jaw
    const jawMesh = createMesh(
      new THREE.BoxGeometry(0.12 * headScale, 0.055, 0.10 * headScale),
      boneMaterial,
      'bone',
      [0, 1.67, 0.045]
    );
    headGroup.add(jawMesh);

    // Masseter muscles
    const rMasseter = createMesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), muscleMaterial, 'muscle', [0.065 * headScale, 1.69, 0.02]);
    const lMasseter = createMesh(new THREE.BoxGeometry(0.03, 0.06, 0.03), muscleMaterial, 'muscle', [-0.065 * headScale, 1.69, 0.02]);
    headGroup.add(rMasseter);
    headGroup.add(lMasseter);

    // Surface head skin
    const headSkin = createMesh(
      new THREE.SphereGeometry(0.18 * headScale, 32, 32),
      skinMaterial.clone(),
      'skin',
      [0, 1.82, 0.0],
      [0, 0, 0],
      [0.98, 1.14, 1.16]
    );
    headGroup.add(headSkin);

    addPart('head', headGroup);

    // Brain Cerebrum
    const brainGroup = new THREE.Group();
    const cerebrum = createMesh(
      new THREE.SphereGeometry(0.14 * headScale, 24, 24),
      organMaterial.clone(),
      'organ',
      [0, 1.82, -0.015],
      [0, 0, 0],
      [0.92, 0.85, 1.08]
    );
    brainGroup.add(cerebrum);
    addPart('brain', brainGroup);

    // ==========================================
    // 2. THYROID & CERVICAL SPINE
    // ==========================================
    // Thyroid Endocrine
    const thyroidMesh = createMesh(
      new THREE.TorusGeometry(0.042, 0.016, 16, 32),
      organMaterial.clone(),
      'organ',
      [0, 1.54, 0.075],
      [Math.PI / 2, 0, 0]
    );
    addPart('thyroid', thyroidMesh);

    // Cervical Spine (C1-C7)
    const cervicalGroup = new THREE.Group();
    for (let c = 0; c < 7; c++) {
      const cy = 1.60 - c * 0.024;
      const vertMesh = createMesh(
        new THREE.CylinderGeometry(0.026, 0.028, 0.018, 16),
        boneMaterial,
        'bone',
        [0, cy, -0.04 + kyphosisOffset * 0.2]
      );
      cervicalGroup.add(vertMesh);
    }
    // Cervical Neurovascular Bundle (Carotid, Jugular, Vagus)
    const rCarotid = createMesh(new THREE.CylinderGeometry(0.007, 0.007, 0.18, 8), arteryMaterial, 'neurovascular', [0.04, 1.58, 0.04]);
    const lCarotid = createMesh(new THREE.CylinderGeometry(0.007, 0.007, 0.18, 8), arteryMaterial, 'neurovascular', [-0.04, 1.58, 0.04]);
    const rJugular = createMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8), veinMaterial, 'neurovascular', [0.052, 1.58, 0.04]);
    const lJugular = createMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 8), veinMaterial, 'neurovascular', [-0.052, 1.58, 0.04]);
    const rVagus = createMesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 8), nerveMaterial, 'neurovascular', [0.046, 1.58, 0.045]);
    const lVagus = createMesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 8), nerveMaterial, 'neurovascular', [-0.046, 1.58, 0.045]);
    cervicalGroup.add(rCarotid);
    cervicalGroup.add(lCarotid);
    cervicalGroup.add(rJugular);
    cervicalGroup.add(lJugular);
    cervicalGroup.add(rVagus);
    cervicalGroup.add(lVagus);
    addPart('spine_cervical', cervicalGroup);

    // ==========================================
    // 3. THORAX & CHEST (9 Rib Pairs, Sternum, Clavicles, Pectoralis)
    // ==========================================
    const chestGroup = new THREE.Group();

    // Sternum
    const sternumMesh = createMesh(
      new THREE.BoxGeometry(0.046, 0.30 * torsoScaleY, 0.02),
      boneMaterial,
      'bone',
      [0, 1.34 * torsoScaleY, 0.135]
    );
    chestGroup.add(sternumMesh);

    // Bilateral Clavicles
    const clavicleLen = chestWidth * 0.75;
    const rClavicle = createMesh(
      new THREE.CylinderGeometry(0.012, 0.015, clavicleLen, 12),
      boneMaterial,
      'bone',
      [clavicleLen * 0.45, 1.51 * torsoScaleY, 0.06],
      [0, 0, -Math.PI * 0.44]
    );
    const lClavicle = createMesh(
      new THREE.CylinderGeometry(0.012, 0.015, clavicleLen, 12),
      boneMaterial,
      'bone',
      [-clavicleLen * 0.45, 1.51 * torsoScaleY, 0.06],
      [0, 0, Math.PI * 0.44]
    );
    chestGroup.add(rClavicle);
    chestGroup.add(lClavicle);

    // 9 Rib Pairs
    for (let r = 0; r < 9; r++) {
      const ry = (1.47 - r * 0.033) * torsoScaleY;
      const rx = (chestWidth * 0.5) + Math.sin((r / 8) * Math.PI) * 0.08;
      const rRib = createMesh(
        new THREE.TorusGeometry(rx, 0.011, 10, 24, Math.PI * 0.82),
        boneMaterial,
        'bone',
        [0.01, ry, 0.01],
        [Math.PI * 0.5, -0.1, Math.PI - 0.2]
      );
      const lRib = createMesh(
        new THREE.TorusGeometry(rx, 0.011, 10, 24, Math.PI * 0.82),
        boneMaterial,
        'bone',
        [-0.01, ry, 0.01],
        [Math.PI * 0.5, 0.1, -0.2]
      );
      chestGroup.add(rRib);
      chestGroup.add(lRib);
    }

    // Pectoralis Major Plates
    const pectRadius = isFemale ? 0.075 : (isPrimate ? 0.11 : 0.09);
    const rPectoral = createMesh(
      new THREE.CapsuleGeometry(pectRadius, 0.11, 4, 16),
      muscleMaterial,
      'muscle',
      [0.10, 1.36 * torsoScaleY, 0.105],
      [0.2, -0.18, 0.36]
    );
    const lPectoral = createMesh(
      new THREE.CapsuleGeometry(pectRadius, 0.11, 4, 16),
      muscleMaterial,
      'muscle',
      [-0.10, 1.36 * torsoScaleY, 0.105],
      [0.2, 0.18, -0.36]
    );
    chestGroup.add(rPectoral);
    chestGroup.add(lPectoral);

    // Chest Skin
    const chestSkin = createMesh(
      new THREE.CylinderGeometry(chestWidth, chestWidth * 0.88, 0.48 * torsoScaleY, 32),
      skinMaterial.clone(),
      'skin',
      [0, 1.32 * torsoScaleY, 0.0],
      [0, 0, 0],
      [1.08, 1.0, 0.88]
    );
    chestGroup.add(chestSkin);

    addPart('chest', chestGroup);

    // Heart
    const heartGroup = new THREE.Group();
    const heartMesh = createMesh(
      new THREE.SphereGeometry(0.088, 24, 24),
      heartMaterial,
      'organ',
      [-0.04, 1.28 * torsoScaleY, 0.04],
      [0, 0, 0],
      [0.9, 1.1, 0.9]
    );
    const aortaArch = createMesh(
      new THREE.TorusGeometry(0.024, 0.008, 12, 24, Math.PI),
      arteryMaterial,
      'organ',
      [-0.035, 1.37 * torsoScaleY, 0.04],
      [0, 0, Math.PI * 0.3]
    );
    heartGroup.add(heartMesh);
    heartGroup.add(aortaArch);
    addPart('heart', heartGroup);

    // Bilateral Lungs
    const lungsGroup = new THREE.Group();
    const rLung = createMesh(
      new THREE.CapsuleGeometry(0.072, 0.22 * torsoScaleY, 16, 16),
      lungMaterial,
      'organ',
      [0.12, 1.28 * torsoScaleY, 0.02]
    );
    const lLung = createMesh(
      new THREE.CapsuleGeometry(0.066, 0.20 * torsoScaleY, 16, 16),
      lungMaterial,
      'organ',
      [-0.13, 1.28 * torsoScaleY, 0.02]
    );
    lungsGroup.add(rLung);
    lungsGroup.add(lLung);
    addPart('lungs', lungsGroup);

    // Thoracic Spine (T1-T12 with Kyphotic S-curve)
    const thoracicSpineGroup = new THREE.Group();
    for (let t = 0; t < 12; t++) {
      const ty = (1.43 - t * 0.036) * torsoScaleY;
      const sCurve = Math.sin((t / 12) * Math.PI) * 0.032 + kyphosisOffset;
      const tVert = createMesh(
        new THREE.CylinderGeometry(0.030, 0.034, 0.030, 16),
        boneMaterial,
        'bone',
        [0, ty, -0.055 + sCurve]
      );
      thoracicSpineGroup.add(tVert);
    }
    addPart('spine_thoracic', thoracicSpineGroup);

    // ==========================================
    // 4. ABDOMEN & DIGESTIVE ORGANS
    // ==========================================
    const abdoGroup = new THREE.Group();

    // Segmented Rectus Abdominis (6-Pack Blocks)
    for (let a = 0; a < 3; a++) {
      const ay = (1.14 - a * 0.072) * torsoScaleY;
      const rAbs = createMesh(
        new THREE.BoxGeometry(0.072, 0.060, 0.040),
        muscleMaterial,
        'muscle',
        [0.046, ay, 0.115]
      );
      const lAbs = createMesh(
        new THREE.BoxGeometry(0.072, 0.060, 0.040),
        muscleMaterial,
        'muscle',
        [-0.046, ay, 0.115]
      );
      abdoGroup.add(rAbs);
      abdoGroup.add(lAbs);
    }

    // External Obliques
    const rOblique = createMesh(new THREE.CapsuleGeometry(0.055, 0.20, 4, 16), muscleMaterial, 'muscle', [0.18, 1.05 * torsoScaleY, 0.02], [0.1, 0, -0.2]);
    const lOblique = createMesh(new THREE.CapsuleGeometry(0.055, 0.20, 4, 16), muscleMaterial, 'muscle', [-0.18, 1.05 * torsoScaleY, 0.02], [0.1, 0, 0.2]);
    abdoGroup.add(rOblique);
    abdoGroup.add(lOblique);

    // Abdomen Skin
    const abdoSkin = createMesh(
      new THREE.CylinderGeometry(chestWidth * 0.88, pelvicRadius * 1.1, 0.40 * torsoScaleY, 32),
      skinMaterial.clone(),
      'skin',
      [0, 0.98 * torsoScaleY, 0.0],
      [0, 0, 0],
      [1.05, 1.0, 0.85]
    );
    abdoGroup.add(abdoSkin);

    addPart('abdomen', abdoGroup);

    // Liver
    const liverGroup = new THREE.Group();
    const liverMesh = createMesh(
      new THREE.ConeGeometry(0.12, 0.16, 24),
      liverMaterial,
      'organ',
      [0.09, 0.94 * torsoScaleY, 0.03],
      [0, 0, -Math.PI / 6]
    );
    liverGroup.add(liverMesh);
    addPart('liver', liverGroup);

    // Stomach
    const stomachGroup = new THREE.Group();
    const stomachMesh = createMesh(
      new THREE.TorusGeometry(0.072, 0.042, 16, 24),
      organMaterial.clone(),
      'organ',
      [-0.08, 0.92 * torsoScaleY, 0.03]
    );
    stomachGroup.add(stomachMesh);
    addPart('stomach', stomachGroup);

    // Bilateral Kidneys
    const kidneysGroup = new THREE.Group();
    const rKidney = createMesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      kidneyMaterial,
      'organ',
      [0.10, 0.86 * torsoScaleY, -0.07],
      [0, 0, 0],
      [0.8, 1.2, 0.7]
    );
    const lKidney = createMesh(
      new THREE.SphereGeometry(0.045, 16, 16),
      kidneyMaterial,
      'organ',
      [-0.10, 0.86 * torsoScaleY, -0.07],
      [0, 0, 0],
      [0.8, 1.2, 0.7]
    );
    kidneysGroup.add(rKidney);
    kidneysGroup.add(lKidney);
    addPart('kidneys', kidneysGroup);

    // Lumbar Spine (L1-L5 with Lordotic curve, L4-L5 disc and nerve marker)
    const lumbarGroup = new THREE.Group();
    for (let l = 0; l < 5; l++) {
      const ly = (0.98 - l * 0.038) * torsoScaleY;
      const lordosis = -Math.sin((l / 4) * Math.PI) * 0.024;
      const lVert = createMesh(
        new THREE.CylinderGeometry(0.035, 0.038, 0.032, 16),
        boneMaterial,
        'bone',
        [0, ly, -0.05 + lordosis]
      );
      lumbarGroup.add(lVert);
    }
    // L4-L5 Disc & Sciatic Nerve Root Marker
    const l4l5Disc = createMesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.016, 16),
      jointMaterial,
      'bone',
      [0, 0.87 * torsoScaleY, -0.035]
    );
    const sciaticNerve = createMesh(
      new THREE.SphereGeometry(0.012, 12, 12),
      nerveMaterial,
      'neurovascular',
      [0.032, 0.87 * torsoScaleY, -0.04]
    );
    lumbarGroup.add(l4l5Disc);
    lumbarGroup.add(sciaticNerve);
    addPart('spine_lumbar', lumbarGroup);

    // ==========================================
    // 5. PELVIS & SACRUM
    // ==========================================
    const pelvisGroup = new THREE.Group();

    // Pelvic Cradle Torus & Iliac Wings
    const pelvicTorus = createMesh(
      new THREE.TorusGeometry(pelvicRadius, 0.040, 14, 28, Math.PI * 1.12),
      boneMaterial,
      'bone',
      [0, 0.76 * torsoScaleY, -0.01],
      [Math.PI * 0.46, 0, 0]
    );
    const iliacWings = createMesh(
      new THREE.BoxGeometry(pelvicRadius * 1.35, 0.14, 0.07),
      boneMaterial,
      'bone',
      [0, 0.72 * torsoScaleY, 0.03]
    );
    pelvisGroup.add(pelvicTorus);
    pelvisGroup.add(iliacWings);

    // Gluteus Muscles
    const rGlute = createMesh(
      new THREE.SphereGeometry(0.082, 18, 18),
      muscleMaterial,
      'muscle',
      [0.12, 0.68 * torsoScaleY, -0.05],
      [0, 0, 0],
      [0.95, 1.15, 1.0]
    );
    const lGlute = createMesh(
      new THREE.SphereGeometry(0.082, 18, 18),
      muscleMaterial,
      'muscle',
      [-0.12, 0.68 * torsoScaleY, -0.05],
      [0, 0, 0],
      [0.95, 1.15, 1.0]
    );
    pelvisGroup.add(rGlute);
    pelvisGroup.add(lGlute);

    // Pelvic Skin
    const pelvisSkin = createMesh(
      new THREE.CylinderGeometry(pelvicRadius * 1.1, pelvicRadius * 0.95, 0.28 * torsoScaleY, 32),
      skinMaterial.clone(),
      'skin',
      [0, 0.68 * torsoScaleY, 0.0]
    );
    pelvisGroup.add(pelvisSkin);

    addPart('pelvis', pelvisGroup);

    // Sacrum & Coccyx
    const sacralGroup = new THREE.Group();
    const sacrumMesh = createMesh(
      new THREE.ConeGeometry(0.046, 0.14 * torsoScaleY, 16),
      boneMaterial,
      'bone',
      [0, 0.74 * torsoScaleY, -0.06],
      [Math.PI, 0, 0]
    );
    sacralGroup.add(sacrumMesh);
    addPart('spine_sacral', sacralGroup);

    // ==========================================
    // 6. UPPER EXTREMITIES (Shoulders, Arms, Hands)
    // ==========================================
    const shoulderX = chestWidth * 1.15;
    const armX = shoulderX + 0.08;

    // Right Shoulder
    const rShoulderGroup = new THREE.Group();
    rShoulderGroup.add(createMesh(new THREE.SphereGeometry(0.065, 16, 16), jointMaterial, 'bone', [shoulderX, 1.48 * torsoScaleY, 0.01]));
    rShoulderGroup.add(createMesh(new THREE.SphereGeometry(0.088, 18, 18), muscleMaterial, 'muscle', [shoulderX, 1.48 * torsoScaleY, 0.02]));
    rShoulderGroup.add(createMesh(new THREE.SphereGeometry(0.115, 24, 24), skinMaterial.clone(), 'skin', [shoulderX, 1.48 * torsoScaleY, 0.01]));
    addPart('r_shoulder', rShoulderGroup);

    // Left Shoulder
    const lShoulderGroup = new THREE.Group();
    lShoulderGroup.add(createMesh(new THREE.SphereGeometry(0.065, 16, 16), jointMaterial, 'bone', [-shoulderX, 1.48 * torsoScaleY, 0.01]));
    lShoulderGroup.add(createMesh(new THREE.SphereGeometry(0.088, 18, 18), muscleMaterial, 'muscle', [-shoulderX, 1.48 * torsoScaleY, 0.02]));
    lShoulderGroup.add(createMesh(new THREE.SphereGeometry(0.115, 24, 24), skinMaterial.clone(), 'skin', [-shoulderX, 1.48 * torsoScaleY, 0.01]));
    addPart('l_shoulder', lShoulderGroup);

    // Right Arm
    const rArmGroup = new THREE.Group();
    rArmGroup.add(createMesh(new THREE.CylinderGeometry(0.018, 0.022, 0.28 * armLengthScale, 12), boneMaterial, 'bone', [armX, 1.28 * torsoScaleY, 0.02]));
    rArmGroup.add(createMesh(new THREE.CapsuleGeometry(0.048, 0.24 * armLengthScale, 4, 18), muscleMaterial, 'muscle', [armX, 1.28 * torsoScaleY, 0.03]));
    rArmGroup.add(createMesh(new THREE.CylinderGeometry(0.015, 0.018, 0.26 * armLengthScale, 12), boneMaterial, 'bone', [armX, 0.98 * torsoScaleY, 0.03]));
    rArmGroup.add(createMesh(new THREE.CapsuleGeometry(0.040, 0.24 * armLengthScale, 4, 16), muscleMaterial, 'muscle', [armX, 0.98 * torsoScaleY, 0.03]));
    rArmGroup.add(createMesh(new THREE.CapsuleGeometry(0.075, 0.52 * armLengthScale, 16, 24), skinMaterial.clone(), 'skin', [armX, 1.12 * torsoScaleY, 0.02]));
    addPart('r_arm', rArmGroup);

    // Left Arm
    const lArmGroup = new THREE.Group();
    lArmGroup.add(createMesh(new THREE.CylinderGeometry(0.018, 0.022, 0.28 * armLengthScale, 12), boneMaterial, 'bone', [-armX, 1.28 * torsoScaleY, 0.02]));
    lArmGroup.add(createMesh(new THREE.CapsuleGeometry(0.048, 0.24 * armLengthScale, 4, 18), muscleMaterial, 'muscle', [-armX, 1.28 * torsoScaleY, 0.03]));
    lArmGroup.add(createMesh(new THREE.CylinderGeometry(0.015, 0.018, 0.26 * armLengthScale, 12), boneMaterial, 'bone', [-armX, 0.98 * torsoScaleY, 0.03]));
    lArmGroup.add(createMesh(new THREE.CapsuleGeometry(0.040, 0.24 * armLengthScale, 4, 16), muscleMaterial, 'muscle', [-armX, 0.98 * torsoScaleY, 0.03]));
    lArmGroup.add(createMesh(new THREE.CapsuleGeometry(0.075, 0.52 * armLengthScale, 16, 24), skinMaterial.clone(), 'skin', [-armX, 1.12 * torsoScaleY, 0.02]));
    addPart('l_arm', lArmGroup);

    // Right Hand
    const rHandGroup = new THREE.Group();
    const handY = (0.74 - (armLengthScale - 1.0) * 0.3) * torsoScaleY;
    rHandGroup.add(createMesh(new THREE.BoxGeometry(0.065, 0.12, 0.03), boneMaterial, 'bone', [armX + 0.02, handY, 0.02]));
    rHandGroup.add(createMesh(new THREE.BoxGeometry(0.075, 0.13, 0.04), muscleMaterial, 'muscle', [armX + 0.02, handY, 0.02]));
    rHandGroup.add(createMesh(new THREE.BoxGeometry(0.09, 0.15, 0.05), skinMaterial.clone(), 'skin', [armX + 0.02, handY, 0.02]));
    addPart('r_hand', rHandGroup);

    // Left Hand
    const lHandGroup = new THREE.Group();
    lHandGroup.add(createMesh(new THREE.BoxGeometry(0.065, 0.12, 0.03), boneMaterial, 'bone', [-armX - 0.02, handY, 0.02]));
    lHandGroup.add(createMesh(new THREE.BoxGeometry(0.075, 0.13, 0.04), muscleMaterial, 'muscle', [-armX - 0.02, handY, 0.02]));
    lHandGroup.add(createMesh(new THREE.BoxGeometry(0.09, 0.15, 0.05), skinMaterial.clone(), 'skin', [-armX - 0.02, handY, 0.02]));
    addPart('l_hand', lHandGroup);

    // ==========================================
    // 7. LOWER EXTREMITIES (Thighs, Knees/Shins, Feet)
    // ==========================================
    const hipX = pelvicRadius * 0.72;

    // Right Thigh (with Q-Angle, Quadriceps, Femoral Vessels)
    const rThighGroup = new THREE.Group();
    rThighGroup.add(createMesh(
      new THREE.CylinderGeometry(0.026, 0.030, 0.42 * limbScaleY, 12),
      boneMaterial,
      'bone',
      [hipX, 0.38 * limbScaleY, 0.02],
      [0, 0, -qAngle]
    ));
    rThighGroup.add(createMesh(
      new THREE.CapsuleGeometry(0.070, 0.36 * limbScaleY, 4, 18),
      muscleMaterial,
      'muscle',
      [hipX, 0.38 * limbScaleY, 0.03],
      [-0.04, 0, -qAngle]
    ));
    rThighGroup.add(createMesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.40 * limbScaleY, 8),
      arteryMaterial,
      'neurovascular',
      [hipX - 0.02, 0.38 * limbScaleY, 0.04],
      [0, 0, -qAngle]
    ));
    rThighGroup.add(createMesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.40 * limbScaleY, 8),
      veinMaterial,
      'neurovascular',
      [hipX - 0.035, 0.38 * limbScaleY, 0.04],
      [0, 0, -qAngle]
    ));
    rThighGroup.add(createMesh(
      new THREE.CapsuleGeometry(0.115, 0.46 * limbScaleY, 16, 24),
      skinMaterial.clone(),
      'skin',
      [hipX, 0.38 * limbScaleY, 0.01],
      [0, 0, -qAngle]
    ));
    addPart('r_thigh', rThighGroup);

    // Left Thigh
    const lThighGroup = new THREE.Group();
    lThighGroup.add(createMesh(
      new THREE.CylinderGeometry(0.026, 0.030, 0.42 * limbScaleY, 12),
      boneMaterial,
      'bone',
      [-hipX, 0.38 * limbScaleY, 0.02],
      [0, 0, qAngle]
    ));
    lThighGroup.add(createMesh(
      new THREE.CapsuleGeometry(0.070, 0.36 * limbScaleY, 4, 18),
      muscleMaterial,
      'muscle',
      [-hipX, 0.38 * limbScaleY, 0.03],
      [0.04, 0, qAngle]
    ));
    lThighGroup.add(createMesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.40 * limbScaleY, 8),
      arteryMaterial,
      'neurovascular',
      [-hipX + 0.02, 0.38 * limbScaleY, 0.04],
      [0, 0, qAngle]
    ));
    lThighGroup.add(createMesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.40 * limbScaleY, 8),
      veinMaterial,
      'neurovascular',
      [-hipX + 0.035, 0.38 * limbScaleY, 0.04],
      [0, 0, qAngle]
    ));
    lThighGroup.add(createMesh(
      new THREE.CapsuleGeometry(0.115, 0.46 * limbScaleY, 16, 24),
      skinMaterial.clone(),
      'skin',
      [-hipX, 0.38 * limbScaleY, 0.01],
      [0, 0, qAngle]
    ));
    addPart('l_thigh', lThighGroup);

    // Right Shin (Patella, Tibia, Gastrocnemius diamond calf)
    const kneeX = hipX + Math.sin(qAngle) * 0.22 * limbScaleY;
    const rShinGroup = new THREE.Group();
    rShinGroup.add(createMesh(new THREE.SphereGeometry(0.044, 16, 16), jointMaterial, 'bone', [kneeX, 0.16 * limbScaleY, 0.05])); // Patella
    rShinGroup.add(createMesh(new THREE.CylinderGeometry(0.020, 0.024, 0.42 * limbScaleY, 12), boneMaterial, 'bone', [kneeX, -0.06 * limbScaleY, 0.01]));
    rShinGroup.add(createMesh(new THREE.CapsuleGeometry(0.054, 0.28 * limbScaleY, 4, 18), muscleMaterial, 'muscle', [kneeX, -0.02 * limbScaleY, -0.025])); // Calf
    rShinGroup.add(createMesh(new THREE.CapsuleGeometry(0.092, 0.48 * limbScaleY, 16, 24), skinMaterial.clone(), 'skin', [kneeX, -0.06 * limbScaleY, 0.0]));
    addPart('r_shin', rShinGroup);

    // Left Shin
    const lShinGroup = new THREE.Group();
    lShinGroup.add(createMesh(new THREE.SphereGeometry(0.044, 16, 16), jointMaterial, 'bone', [-kneeX, 0.16 * limbScaleY, 0.05])); // Patella
    lShinGroup.add(createMesh(new THREE.CylinderGeometry(0.020, 0.024, 0.42 * limbScaleY, 12), boneMaterial, 'bone', [-kneeX, -0.06 * limbScaleY, 0.01]));
    lShinGroup.add(createMesh(new THREE.CapsuleGeometry(0.054, 0.28 * limbScaleY, 4, 18), muscleMaterial, 'muscle', [-kneeX, -0.02 * limbScaleY, -0.025])); // Calf
    lShinGroup.add(createMesh(new THREE.CapsuleGeometry(0.092, 0.48 * limbScaleY, 16, 24), skinMaterial.clone(), 'skin', [-kneeX, -0.06 * limbScaleY, 0.0]));
    addPart('l_shin', lShinGroup);

    // Right Foot
    const rFootGroup = new THREE.Group();
    rFootGroup.add(createMesh(new THREE.BoxGeometry(0.075, 0.042, 0.16), boneMaterial, 'bone', [kneeX, -0.31 * limbScaleY, 0.05]));
    rFootGroup.add(createMesh(new THREE.BoxGeometry(0.088, 0.055, 0.18), muscleMaterial, 'muscle', [kneeX, -0.31 * limbScaleY, 0.05]));
    rFootGroup.add(createMesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), skinMaterial.clone(), 'skin', [kneeX, -0.31 * limbScaleY, 0.06]));
    addPart('r_foot', rFootGroup);

    // Left Foot
    const lFootGroup = new THREE.Group();
    lFootGroup.add(createMesh(new THREE.BoxGeometry(0.075, 0.042, 0.16), boneMaterial, 'bone', [-kneeX, -0.31 * limbScaleY, 0.05]));
    lFootGroup.add(createMesh(new THREE.BoxGeometry(0.088, 0.055, 0.18), muscleMaterial, 'muscle', [-kneeX, -0.31 * limbScaleY, 0.05]));
    lFootGroup.add(createMesh(new THREE.BoxGeometry(0.11, 0.08, 0.24), skinMaterial.clone(), 'skin', [-kneeX, -0.31 * limbScaleY, 0.06]));
    addPart('l_foot', lFootGroup);

    // ==========================================
    // 8. DERMATOMES (C6-C8 & L4-L5 SENSORY BANDS)
    // ==========================================
    const dermC6C8Group = new THREE.Group();
    const dermC6 = createMesh(new THREE.CapsuleGeometry(0.080, 0.44 * armLengthScale, 4, 16), dermatomeMaterial.clone(), 'dermatome', [armX + 0.01, 1.12 * torsoScaleY, 0.04]);
    dermC6C8Group.add(dermC6);
    addPart('dermatome_c6_c8', dermC6C8Group);

    const dermL4L5Group = new THREE.Group();
    const dermL4 = createMesh(new THREE.CapsuleGeometry(0.098, 0.46 * limbScaleY, 4, 16), dermatomeMaterial.clone(), 'dermatome', [kneeX + 0.01, -0.06 * limbScaleY, 0.03]);
    dermL4L5Group.add(dermL4);
    addPart('dermatome_l4_l5', dermL4L5Group);

    // ==========================================
    // 9. FDI 32-TOOTH DENTAL ARCH ODONTOGRAM
    // ==========================================
    const dentalArchGroup = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const angle = (i / 15) * Math.PI - Math.PI / 2;
      // Maxillary tooth
      const maxTooth = createMesh(
        new THREE.BoxGeometry(0.011, 0.016, 0.011),
        toothMaterial,
        'bone',
        [Math.cos(angle) * 0.056 * headScale, 1.70, Math.sin(angle) * 0.056 + 0.11]
      );
      // Mandibular tooth
      const mandTooth = createMesh(
        new THREE.BoxGeometry(0.010, 0.015, 0.010),
        toothMaterial,
        'bone',
        [Math.cos(angle) * 0.054 * headScale, 1.66, Math.sin(angle) * 0.054 + 0.105]
      );
      dentalArchGroup.add(maxTooth);
      dentalArchGroup.add(mandTooth);
    }
    addPart('oral_fdi_teeth', dentalArchGroup);

    // ==========================================
    // 10. 7 SUSHUMNA CHAKRA VORTEX NODES
    // ==========================================
    const chakraHeights = [
      1.88 * headScale,    // Sahasrara
      1.75 * headScale,    // Ajna
      1.54 * torsoScaleY,  // Vishuddha
      1.28 * torsoScaleY,  // Anahata
      0.96 * torsoScaleY,  // Manipura
      0.72 * torsoScaleY,  // Svadhisthana
      0.54 * torsoScaleY   // Muladhara
    ];
    const chakraIds = [
      'chakra_sahasrara', 'chakra_ajna', 'chakra_vishuddha',
      'chakra_anahata', 'chakra_manipura', 'chakra_svadhisthana', 'chakra_muladhara'
    ];
    chakraHeights.forEach((h, idx) => {
      const cMesh = createMesh(
        new THREE.SphereGeometry(0.036, 16, 16),
        chakraMaterial,
        'chakra',
        [0, h, 0]
      );
      addPart(chakraIds[idx], cMesh);
    });

    // ==========================================
    // 11. 12 JING-LUO MERIDIAN ACUPOINTS
    // ==========================================
    const acupoints = [
      { id: 'acupoint_gv20', x: 0, y: 1.90 * headScale, z: 0 },
      { id: 'acupoint_cv17', x: 0, y: 1.30 * torsoScaleY, z: 0.16 },
      { id: 'acupoint_cv12', x: 0, y: 0.98 * torsoScaleY, z: 0.15 },
      { id: 'acupoint_st36_r', x: kneeX, y: 0.08 * limbScaleY, z: 0.06 },
      { id: 'acupoint_st36_l', x: -kneeX, y: 0.08 * limbScaleY, z: 0.06 },
      { id: 'acupoint_li4_r', x: armX + 0.02, y: handY + 0.03, z: 0.05 },
      { id: 'acupoint_li4_l', x: -armX - 0.02, y: handY + 0.03, z: 0.05 },
      { id: 'acupoint_sp6_r', x: kneeX - 0.02, y: -0.18 * limbScaleY, z: 0.04 },
      { id: 'acupoint_sp6_l', x: -kneeX + 0.02, y: -0.18 * limbScaleY, z: 0.04 }
    ];
    acupoints.forEach((ap) => {
      const aMesh = createMesh(
        new THREE.SphereGeometry(0.024, 16, 16),
        meridianMaterial,
        'acupoint',
        [ap.x, ap.y, ap.z]
      );
      addPart(ap.id, aMesh);
    });

    return { group: mannequinGroup, parts };
  }
}
