import '@angular/compiler';
import { YogaAsanaCoachingService } from './yoga-asana-coaching.service';

describe('YogaAsanaCoachingService', () => {
  let service: YogaAsanaCoachingService;

  beforeEach(() => {
    service = new YogaAsanaCoachingService();
  });

  it('should initialize with curated yoga asana library', () => {
    expect(service.curatedAsanaLibrary.length).toBeGreaterThan(0);
  });

  it('should recommend Cobra Pose for lumbar spine issues', () => {
    const pose = service.getPoseForBodyRegion('spine_lumbar');
    expect(pose.name).toBe('Cobra Pose');
    expect(pose.sanskritName).toBe('Bhujangasana');
  });

  it('should recommend Pigeon Pose for pelvic issues', () => {
    const pose = service.getPoseForBodyRegion('pelvis');
    expect(pose.name).toBe('Pigeon Pose');
    expect(pose.sanskritName).toBe('Eka Pada Rajakapotasana');
  });

  it('should fallback to default pose for unmapped region', () => {
    const pose = service.getPoseForBodyRegion('unknown_part');
    expect(pose).toBeTruthy();
  });

  it('should procedurally generate custom 3D Asana from combinatorial inputs', () => {
    const pose = service.generateProceduralAsana('standing', 'twist', 'overhead');
    expect(pose.name).toContain('Procedural STANDING TWIST');
    expect(pose.jointTransformations.shoulderRotationDeg).toBe(170);
    expect(pose.jointTransformations.spineCurvatureDeg).toBe(15);
  });
});
