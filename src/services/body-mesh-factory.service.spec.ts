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
      'acupoint_gv20', 'acupoint_cv17'
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

  it('should assign valid layer metadata to all anatomical meshes', () => {
    const { group } = service.createMannequinGroup('III', 'ecorche');
    const validLayers = new Set(['skin', 'muscle', 'bone', 'organ', 'neurovascular', 'dermatome', 'chakra', 'acupoint']);

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
});
