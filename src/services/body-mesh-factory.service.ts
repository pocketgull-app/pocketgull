import { Injectable, inject } from '@angular/core';
import * as THREE from 'three';
import { AdobeFireflyTextureService } from './adobe-firefly-texture.service';

export type FitzpatrickSkinType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

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
      default: return 0x38bdf8;
    }
  }

  /**
   * Creates the standard human mannequin group with skin, muscle, bone, organ, chakra, and meridian layers.
   */
  createMannequinGroup(phototype: FitzpatrickSkinType = 'III'): { group: THREE.Group; parts: Map<string, THREE.Group | THREE.Mesh> } {
    const mannequinGroup = new THREE.Group();
    const parts = new Map<string, THREE.Group | THREE.Mesh>();

    const skinTexture = this.fireflyTexture.getFireflyTexture('skin');
    const muscleTexture = this.fireflyTexture.getFireflyTexture('muscle');
    const boneTexture = this.fireflyTexture.getFireflyTexture('skeleton');

    const skinColor = this.getFitzpatrickColor(phototype);
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: skinColor, bumpMap: skinTexture, bumpScale: 0.04, roughness: 0.35, metalness: 0.15, emissive: 0x0369a1, emissiveIntensity: 0.05, transparent: true, opacity: 0.88, depthWrite: true
    });
    const muscleMaterial = new THREE.MeshStandardMaterial({
      color: 0xbe123c, bumpMap: muscleTexture, bumpScale: 0.08, roughness: 0.65, metalness: 0.1, transparent: true, opacity: 0.75, depthWrite: false
    });
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f4, bumpMap: boneTexture, bumpScale: 0.03, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.85, depthWrite: false
    });
    const organMaterial = new THREE.MeshStandardMaterial({
      color: 0xe11d48, roughness: 0.3, metalness: 0.2, emissive: 0x9f1239, emissiveIntensity: 0.2, transparent: true, opacity: 0.9
    });
    const heartMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706, roughness: 0.25, metalness: 0.3, emissive: 0xb45309, emissiveIntensity: 0.3, transparent: true, opacity: 0.95
    });
    const lungMaterial = new THREE.MeshStandardMaterial({
      color: 0x0284c7, roughness: 0.4, metalness: 0.1, emissive: 0x0369a1, emissiveIntensity: 0.2, transparent: true, opacity: 0.85
    });
    const liverMaterial = new THREE.MeshStandardMaterial({
      color: 0x854d0e, roughness: 0.45, metalness: 0.15, emissive: 0x713f12, emissiveIntensity: 0.25, transparent: true, opacity: 0.9
    });
    const kidneyMaterial = new THREE.MeshStandardMaterial({
      color: 0x991b1b, roughness: 0.35, metalness: 0.2, emissive: 0x7f1d1d, emissiveIntensity: 0.2, transparent: true, opacity: 0.9
    });
    const chakraMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, roughness: 0.1, metalness: 0.8, emissive: 0xa855f7, emissiveIntensity: 0.6, transparent: true, opacity: 0.9
    });
    const meridianMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981, roughness: 0.1, metalness: 0.5, emissive: 0x34d399, emissiveIntensity: 0.5, transparent: true, opacity: 0.9
    });
    const toothMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafaf9, roughness: 0.2, metalness: 0.1, emissive: 0xe7e5e4, emissiveIntensity: 0.1
    });

    const addPart = (id: string, mesh: THREE.Mesh | THREE.Group) => {
      mesh.userData['id'] = id;
      parts.set(id, mesh);
      mannequinGroup.add(mesh);
    };

    // 1. Head & Cranial Vault
    const headGroup = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), skinMaterial.clone());
    headMesh.position.y = 1.75;
    headGroup.add(headMesh);

    // Brain
    const brainMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 24, 24), organMaterial.clone());
    brainMesh.position.set(0, 1.76, -0.02);
    brainMesh.scale.set(0.9, 0.8, 1.1);
    headGroup.add(brainMesh);
    addPart('head', headGroup);
    addPart('brain', brainMesh);

    // 2. Thyroid & Endocrine Gland
    const thyroidMesh = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.015, 16, 32), organMaterial.clone());
    thyroidMesh.position.set(0, 1.52, 0.08);
    thyroidMesh.rotation.x = Math.PI / 2;
    addPart('thyroid', thyroidMesh);

    // 3. Chest & Thorax
    const chestGroup = new THREE.Group();
    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 32), skinMaterial.clone());
    chestMesh.position.y = 1.25;
    chestGroup.add(chestMesh);

    // Heart
    const heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), heartMaterial);
    heartMesh.position.set(-0.04, 1.28, 0.04);
    chestGroup.add(heartMesh);
    addPart('heart', heartMesh);

    // Lungs (Right & Left)
    const rLungMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.2, 16, 16), lungMaterial);
    rLungMesh.position.set(0.12, 1.26, 0.02);
    chestGroup.add(rLungMesh);

    const lLungMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.19, 16, 16), lungMaterial);
    lLungMesh.position.set(-0.13, 1.26, 0.02);
    chestGroup.add(lLungMesh);
    addPart('lungs', chestGroup);

    // 4. Abdomen & Digestive Organs
    const abdoGroup = new THREE.Group();
    const abdoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 0.4, 32), skinMaterial.clone());
    abdoMesh.position.y = 0.8;
    abdoGroup.add(abdoMesh);

    // Liver
    const liverMesh = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 24), liverMaterial);
    liverMesh.position.set(0.09, 0.88, 0.03);
    liverMesh.rotation.z = -Math.PI / 6;
    abdoGroup.add(liverMesh);
    addPart('liver', liverMesh);

    // Stomach
    const stomachMesh = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.04, 16, 24), organMaterial.clone());
    stomachMesh.position.set(-0.08, 0.86, 0.03);
    abdoGroup.add(stomachMesh);
    addPart('stomach', stomachMesh);

    // Bilateral Kidneys
    const rKidneyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), kidneyMaterial);
    rKidneyMesh.position.set(0.1, 0.78, -0.08);
    rKidneyMesh.scale.set(0.8, 1.2, 0.7);
    abdoGroup.add(rKidneyMesh);

    const lKidneyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), kidneyMaterial);
    lKidneyMesh.position.set(-0.1, 0.78, -0.08);
    lKidneyMesh.scale.set(0.8, 1.2, 0.7);
    abdoGroup.add(lKidneyMesh);
    addPart('kidneys', abdoGroup);
    addPart('abdomen', abdoGroup);

    // 5. Spine Bony Skeleton Column
    const cervicalSpineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.2, 16), boneMaterial);
    cervicalSpineMesh.position.set(0, 1.55, -0.1);
    mannequinGroup.add(cervicalSpineMesh);
    addPart('spine_cervical', cervicalSpineMesh);

    const thoracicSpineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.45, 16), boneMaterial);
    thoracicSpineMesh.position.set(0, 1.22, -0.11);
    mannequinGroup.add(thoracicSpineMesh);
    addPart('spine_thoracic', thoracicSpineMesh);

    const lumbarSpineMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.35, 16), boneMaterial);
    lumbarSpineMesh.position.set(0, 0.82, -0.1);
    mannequinGroup.add(lumbarSpineMesh);
    addPart('spine_lumbar', lumbarSpineMesh);

    // 6. Pelvis
    const pelvisGroup = new THREE.Group();
    const pelvisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.3, 32), skinMaterial.clone());
    pelvisMesh.position.y = 0.45;
    pelvisGroup.add(pelvisMesh);
    addPart('pelvis', pelvisGroup);

    // 6.1 Upper Extremities (Arms & Hands)
    const rShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), skinMaterial.clone());
    rShoulder.position.set(0.35, 1.38, 0);
    addPart('r_shoulder', rShoulder);

    const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), skinMaterial.clone());
    lShoulder.position.set(-0.35, 1.38, 0);
    addPart('l_shoulder', lShoulder);

    const rArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.5, 16, 32), skinMaterial.clone());
    rArm.position.set(0.4, 1.05, 0);
    rArm.rotation.z = Math.PI / 16;
    addPart('r_arm', rArm);

    const lArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.5, 16, 32), skinMaterial.clone());
    lArm.position.set(-0.4, 1.05, 0);
    lArm.rotation.z = -Math.PI / 16;
    addPart('l_arm', lArm);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), skinMaterial.clone());
    rHand.scale.set(0.8, 1.2, 0.4);
    rHand.position.set(0.45, 0.7, 0);
    rHand.rotation.z = Math.PI / 16;
    addPart('r_hand', rHand);

    const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), skinMaterial.clone());
    lHand.scale.set(0.8, 1.2, 0.4);
    lHand.position.set(-0.45, 0.7, 0);
    lHand.rotation.z = -Math.PI / 16;
    addPart('l_hand', lHand);

    // 6.2 Lower Extremities (Legs & Feet)
    const rThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.5, 16, 32), skinMaterial.clone());
    rThigh.position.set(0.14, 0.05, 0);
    addPart('r_thigh', rThigh);

    const lThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.5, 16, 32), skinMaterial.clone());
    lThigh.position.set(-0.14, 0.05, 0);
    addPart('l_thigh', lThigh);

    const rShin = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 16, 32), skinMaterial.clone());
    rShin.position.set(0.14, -0.52, 0);
    addPart('r_shin', rShin);

    const lShin = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 16, 32), skinMaterial.clone());
    lShin.position.set(-0.14, -0.52, 0);
    addPart('l_shin', lShin);

    const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.28), skinMaterial.clone());
    rFoot.position.set(0.14, -0.82, 0.05);
    addPart('r_foot', rFoot);

    const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.28), skinMaterial.clone());
    lFoot.position.set(-0.14, -0.82, 0.05);
    addPart('l_foot', lFoot);

    // 7. FDI 32-Tooth Odontogram Dental Arch Mesh
    const dentalArchGroup = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const angle = (i / 15) * Math.PI - Math.PI / 2;
      const toothMesh = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.012), toothMaterial);
      toothMesh.position.set(Math.cos(angle) * 0.06, 1.68, Math.sin(angle) * 0.06 + 0.12);
      dentalArchGroup.add(toothMesh);
    }
    dentalArchGroup.userData['id'] = 'oral_fdi_teeth';
    addPart('oral_fdi_teeth', dentalArchGroup);

    // 8. 7 Sushumna Chakra Vortex Spheres
    const chakraHeights = [1.82, 1.73, 1.55, 1.28, 0.88, 0.62, 0.42];
    const chakraIds = [
      'chakra_sahasrara', 'chakra_ajna', 'chakra_vishuddha',
      'chakra_anahata', 'chakra_manipura', 'chakra_svadhisthana', 'chakra_muladhara'
    ];
    chakraHeights.forEach((h, idx) => {
      const cMesh = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), chakraMaterial);
      cMesh.position.set(0, h, 0);
      addPart(chakraIds[idx], cMesh);
    });

    // 9. 12 Jing-Luo Meridian Acupoint Spheres
    const acupoints = [
      { id: 'acupoint_gv20', x: 0, y: 1.84, z: 0 },
      { id: 'acupoint_cv17', x: 0, y: 1.28, z: 0.18 },
      { id: 'acupoint_cv12', x: 0, y: 0.88, z: 0.16 },
      { id: 'acupoint_st36_r', x: 0.14, y: 0.12, z: 0.06 },
      { id: 'acupoint_st36_l', x: -0.14, y: 0.12, z: 0.06 },
      { id: 'acupoint_li4_r', x: 0.36, y: 1.05, z: 0.1 },
      { id: 'acupoint_li4_l', x: -0.36, y: 1.05, z: 0.1 },
      { id: 'acupoint_sp6_r', x: 0.12, y: -0.15, z: 0.04 },
      { id: 'acupoint_sp6_l', x: -0.12, y: -0.15, z: 0.04 }
    ];
    acupoints.forEach(ap => {
      const aMesh = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 16), meridianMaterial);
      aMesh.position.set(ap.x, ap.y, ap.z);
      addPart(ap.id, aMesh);
    });

    return { group: mannequinGroup, parts };
  }
}
