import { Injectable } from '@angular/core';
import * as THREE from 'three';

export interface IRaycastHitResult {
  hitPartId: string;
  partName: string;
  systemLabel: string;
  point?: THREE.Vector3;
}

const PART_NAMES: Record<string, string> = {
  'head': 'Head & Neck',
  'brain': 'Brain & Nervous System',
  'thyroid': 'Thyroid & Endocrine',
  'chest': 'Chest & Thorax',
  'heart': 'Heart & Cardiovascular System',
  'lungs': 'Lungs & Respiratory System',
  'abdomen': 'Abdomen & Digestive Tract',
  'liver': 'Liver & Hepatic System',
  'stomach': 'Stomach & Gastric Pouch',
  'kidneys': 'Kidneys & Renal System',
  'pelvis': 'Pelvis & Hips',
  'r_shoulder': 'Right Shoulder',
  'r_arm': 'Right Arm',
  'r_hand': 'Right Hand & Wrist',
  'l_shoulder': 'Left Shoulder',
  'l_arm': 'Left Arm',
  'l_hand': 'Left Hand & Wrist',
  'r_thigh': 'Right Thigh',
  'r_shin': 'Right Lower Leg',
  'r_foot': 'Right Foot',
  'l_thigh': 'Left Thigh',
  'l_shin': 'Left Lower Leg',
  'l_foot': 'Left Foot',
  'spine_cervical': 'Cervical Spine (C1-C8)',
  'spine_thoracic': 'Thoracic Spine (T1-T12)',
  'spine_lumbar': 'Lumbar Spine (L1-L5)',
  'spine_sacral': 'Sacral Spine (S1-S5)',
  'dermatome_c6_c8': 'C6-C8 Radial & Ulnar Dermatome',
  'dermatome_l4_l5': 'L4-L5 Sciatic Nerve Dermatome',
  'acupoint_gv20': 'GV-20 Baihui (Crown Hundred Convergences)',
  'acupoint_cv17': 'CV-17 Danzhong (Sea of Qi Heart Center)',
  'acupoint_cv12': 'CV-12 Zhongwan (Stomach Qi Front-Mu)',
  'acupoint_st36_r': 'ST-36 Zusanli (Right Leg Three Miles Earth Point)',
  'acupoint_st36_l': 'ST-36 Zusanli (Left Leg Three Miles Earth Point)',
  'acupoint_li4_r': 'LI-4 Hegu (Right Hand Joining Valley Yuan-Source)',
  'acupoint_li4_l': 'LI-4 Hegu (Left Hand Joining Valley Yuan-Source)',
  'acupoint_sp6_r': 'SP-6 Sanyinjiao (Right Three Yin Intersection)',
  'acupoint_sp6_l': 'SP-6 Sanyinjiao (Left Three Yin Intersection)',
  'chakra_sahasrara': 'Sahasrara (Crown 1000-Petal Lotus Chakra)',
  'chakra_ajna': 'Ajna (Third Eye Command Center Chakra)',
  'chakra_vishuddha': 'Throat & Oral FDI Odontogram Spatial Lens',
  'chakra_anahata': 'Anahata (Heart & Acoustic Respiratory Airway Lens)',
  'oral_fdi_teeth': 'Teledentistry FDI 32-Tooth Matrix & Smith-Knight TWI Lens',
  'respiratory_airway': 'Micro-Acoustic Wheeze & Stridor Spectrum Lens',
  'chakra_manipura': 'Manipura (Solar Plexus Agni Fire City)',
  'chakra_svadhisthana': 'Svadhisthana (Sacral Water Dwell Chakra)',
  'chakra_muladhara': 'Muladhara (Root Earth Base Support Chakra)'
};

@Injectable({
  providedIn: 'root'
})
export class RaycastSelectionService {
  private raycaster = new THREE.Raycaster();

  /**
   * Normalizes client coordinates into normalized device coordinates (-1 to +1).
   */
  getNormalizedMouse(clientX: number, clientY: number, containerRect: DOMRect): THREE.Vector2 {
    return new THREE.Vector2(
      ((clientX - containerRect.left) / containerRect.width) * 2 - 1,
      -((clientY - containerRect.top) / containerRect.height) * 2 + 1
    );
  }

  /**
   * Performs raycast picking against target group.
   */
  pickObject(mouse: THREE.Vector2, camera: THREE.Camera, group: THREE.Group): IRaycastHitResult | null {
    if (!camera || !group) return null;

    this.raycaster.setFromCamera(mouse, camera);
    const intersects = this.raycaster.intersectObjects(group.children, true);

    if (intersects.length > 0) {
      let hitPartId = '';
      let currObj: THREE.Object3D | null = intersects[0].object;

      while (currObj && currObj !== group) {
        if (currObj.userData['id']) {
          hitPartId = currObj.userData['id'];
          break;
        }
        currObj = currObj.parent;
      }

      if (hitPartId) {
        const partName = PART_NAMES[hitPartId] || hitPartId;
        let systemLabel = '🩺 Allopathic System';
        if (hitPartId.startsWith('acupoint_')) systemLabel = '🌿 TCM Jing-Luo Acupoint';
        else if (hitPartId.startsWith('chakra_')) systemLabel = '🧘 Sushumna Chakra Node';

        return {
          hitPartId,
          partName,
          systemLabel,
          point: intersects[0].point
        };
      }
    }
    return null;
  }
}
