import { TestBed } from '@angular/core/testing';
import { BodyMeshFactoryService, AnatomicalArchetype, FitzpatrickSkinType } from './body-mesh-factory.service';
import { AdobeFireflyTextureService } from './adobe-firefly-texture.service';
import * as THREE from 'three';

describe('BodyMeshFactoryService', () => {
  let service: BodyMeshFactoryService;
  let mockFirefly: Partial<AdobeFireflyTextureService>;

  beforeEach(() => {
    mockFirefly = {
      getFireflyTexture: vi.fn().mockReturnValue(new THREE.Texture())
    };

    TestBed.configureTestingModule({
      providers: [
        BodyMeshFactoryService,
        { provide: AdobeFireflyTextureService, useValue: mockFirefly }
      ]
    });
    service = TestBed.inject(BodyMeshFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct Fitzpatrick skin phototype colors', () => {
    expect(service.getFitzpatrickColor('I')).toBe(0xf7d0b5);
    expect(service.getFitzpatrickColor('II')).toBe(0xf3c5a6);
    expect(service.getFitzpatrickColor('III')).toBe(0xd8a07c);
    expect(service.getFitzpatrickColor('IV')).toBe(0xaa724b);
    expect(service.getFitzpatrickColor('V')).toBe(0x7a4929);
    expect(service.getFitzpatrickColor('VI')).toBe(0x422614);
  });

  it('should construct high-fidelity mannequin group with all clinical anatomical parts', () => {
    const { group, parts } = service.createMannequinGroup('III', 'homo_sapiens_male');

    expect(group).toBeTruthy();
    expect(group instanceof THREE.Group).toBe(true);
    expect(parts.size).toBeGreaterThanOrEqual(25);

    // Verify key anatomical parts
    const requiredParts = [
      'head', 'brain', 'thyroid', 'chest', 'heart', 'lungs',
      'abdomen', 'liver', 'stomach', 'kidneys', 'pelvis',
      'spine_cervical', 'spine_thoracic', 'spine_lumbar', 'spine_sacral',
      'r_shoulder', 'l_shoulder', 'r_arm', 'l_arm', 'r_hand', 'l_hand',
      'r_thigh', 'l_thigh', 'r_shin', 'l_shin', 'r_foot', 'l_foot',
      'oral_fdi_teeth', 'chakra_sahasrara', 'chakra_muladhara',
      'acupoint_gv20', 'acupoint_cv17',
      'orthopedic_femur_fixation', 'orthopedic_lumbar_hardware', 'silica_bone_scaffold'
    ];

    for (const partId of requiredParts) {
      expect(parts.has(partId), `Part '${partId}' must be present in parts map`).toBe(true);
    }
  });

  it('should support all 6 archetypes cleanly', () => {
    const archetypes: AnatomicalArchetype[] = [
      'homo_sapiens_female',
      'homo_sapiens_male',
      'homo_sapiens_senior',
      'homo_sapiens_pediatric',
      'ecorche',
      'pongo_pygmaeus'
    ];

    for (const arch of archetypes) {
      const { group, parts } = service.createMannequinGroup('IV', arch);
      expect(group.name).toBe(`mannequin_${arch}`);
      expect(parts.size).toBeGreaterThanOrEqual(25);
    }
  });

  it('should assign valid layer metadata to all anatomical meshes including implants and silicas', () => {
    const { group } = service.createMannequinGroup('III', 'ecorche');
    const validLayers = new Set(['skin', 'muscle', 'bone', 'organ', 'neurovascular', 'dermatome', 'chakra', 'acupoint', 'implant', 'silica']);

    let nonProxyMeshCount = 0;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.userData['isTouchProxy']) {
        nonProxyMeshCount++;
        const layer = child.userData['layer'];
        expect(validLayers.has(layer), `Mesh with id '${child.userData['id']}' has unknown layer '${layer}'`).toBe(true);
      }
    });

    expect(nonProxyMeshCount).toBeGreaterThan(40);
  });

  it('should correctly model orthopedic titanium implants and bioactive silica scaffolds', () => {
    const { parts } = service.createMannequinGroup('III', 'homo_sapiens_male');

    // 1. Femur DCP fixation plate and screws
    const femurFixation = parts.get('orthopedic_femur_fixation');
    expect(femurFixation).toBeTruthy();
    let implantMeshCount = 0;
    femurFixation?.traverse(c => {
      if (c instanceof THREE.Mesh && !c.userData['isTouchProxy'] && c.userData['layer'] === 'implant') {
        implantMeshCount++;
      }
    });
    // Plate (1) + 4 Cortical screws = 5 meshes
    expect(implantMeshCount).toBe(5);

    // 2. Lumbar L4-L5 pedicle screws and fusion rods
    const lumbarHardware = parts.get('orthopedic_lumbar_hardware');
    expect(lumbarHardware).toBeTruthy();
    let lumbarHardwareMeshCount = 0;
    lumbarHardware?.traverse(c => {
      if (c instanceof THREE.Mesh && !c.userData['isTouchProxy'] && c.userData['layer'] === 'implant') {
        lumbarHardwareMeshCount++;
      }
    });
    // 4 Pedicle screws + 2 bilateral rods = 6 meshes
    expect(lumbarHardwareMeshCount).toBe(6);

    // 3. Bioactive silica scaffold and granules
    const silicaScaffold = parts.get('silica_bone_scaffold');
    expect(silicaScaffold).toBeTruthy();
    let silicaMeshCount = 0;
    silicaScaffold?.traverse(c => {
      if (c instanceof THREE.Mesh && !c.userData['isTouchProxy'] && c.userData['layer'] === 'silica') {
        silicaMeshCount++;
      }
    });
    // 1 scaffold lattice + 4 micro-granules = 5 meshes
    expect(silicaMeshCount).toBe(5);
  });

  it('should create Fitts Law touch proxies for clickable meshes', () => {
    const { group } = service.createMannequinGroup('II', 'homo_sapiens_female');
    let proxyCount = 0;

    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.userData['isTouchProxy'] === true) {
        proxyCount++;
        expect(child.userData['id']).toBeTruthy();
      }
    });

    expect(proxyCount).toBeGreaterThan(20);
  });

  it('should enforce anatomical Q-angle medial knee convergence, right kidney inferior displacement, and inward screw orientation', () => {
    const { parts } = service.createMannequinGroup('III', 'homo_sapiens_male');

    // 1. Right kidney sits inferior to left kidney due to right hepatic lobe
    const kidneysGroup = parts.get('kidneys') as THREE.Group;
    const kidneyMeshes = kidneysGroup.children.filter(c => c instanceof THREE.Mesh && !c.userData['isTouchProxy']);
    expect(kidneyMeshes.length).toBe(2);
    const [rKidney, lKidney] = kidneyMeshes;
    expect(rKidney.position.y).toBeLessThan(lKidney.position.y);

    // 2. Patella/tibia at kneeX sits medial (< hipX) to proximal femur shaft due to physiological Q-angle
    const rThigh = parts.get('r_thigh') as THREE.Group;
    const rShin = parts.get('r_shin') as THREE.Group;
    const femurMesh = rThigh.children.find(c => c instanceof THREE.Mesh && c.userData['layer'] === 'bone')!;
    const patellaMesh = rShin.children.find(c => c instanceof THREE.Mesh && c.userData['layer'] === 'bone')!;
    expect(patellaMesh.position.x).toBeLessThan(femurMesh.position.x);

    // 3. Femoral DCP cortical bone screws rotate by -PI/2 - qAngle so tips point medially (-X) into femur cortex
    const femurFixation = parts.get('orthopedic_femur_fixation') as THREE.Group;
    const implantMeshes = femurFixation.children.filter(c => c instanceof THREE.Mesh && !c.userData['isTouchProxy']);
    // implantMeshes[0] is plate, [1..4] are cortical screws
    expect(implantMeshes[1].rotation.z).toBeLessThan(-Math.PI / 2);
  });
});
