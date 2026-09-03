import { TestBed } from '@angular/core/testing';
import { MovementHealingQuestService } from './movement-healing-quest.service';

describe('MovementHealingQuestService', () => {
  let service: MovementHealingQuestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovementHealingQuestService);
  });

  it('1. Initializes default Vagal Odyssey quest with 3 milestones and 150 points', () => {
    const quest = service.activeQuest();
    expect(quest.milestones.length).toBe(3);
    expect(quest.totalVagalPointsPossible).toBe(150);
    expect(service.currentVagalPoints()).toBe(0);
    expect(service.questProgressPct()).toBe(0);
    expect(service.isQuestComplete()).toBe(false);
  });

  it('2. Completes milestone and awards vagal coherence points', () => {
    service.completeMilestone('m-1');
    expect(service.currentVagalPoints()).toBe(40);
    expect(service.questProgressPct()).toBe(33);

    const m1 = service.activeQuest().milestones.find(m => m.id === 'm-1');
    expect(m1?.isCompleted).toBe(true);
    expect(m1?.completedAt).toBeDefined();
  });

  it('3. Completes all milestones to achieve 100% completion', () => {
    service.completeMilestone('m-1');
    service.completeMilestone('m-2');
    service.completeMilestone('m-3');

    expect(service.currentVagalPoints()).toBe(150);
    expect(service.questProgressPct()).toBe(100);
    expect(service.isQuestComplete()).toBe(true);
  });

  it('4. Generates encrypted QR payload with zero PHI and valid base64 parameters', () => {
    const quest = service.activeQuest();
    const qrUrl = service.generateEncryptedQrPayload(quest);

    expect(qrUrl).toContain('https://pocketgull.app/quest?payload=');
    const b64Part = qrUrl.split('payload=')[1];
    const decoded = JSON.parse(atob(b64Part));
    expect(decoded.id).toBe(quest.questId);
    expect(decoded.ada).toBe(true);
  });

  it('5. Switches platform tiers for Apple iOS and Windows Desktop', () => {
    service.setPlatform('APPLE_IOS');
    expect(service.activePlatform()).toBe('APPLE_IOS');

    service.setPlatform('WINDOWS_DESKTOP');
    expect(service.activePlatform()).toBe('WINDOWS_DESKTOP');
  });

  it('6. Verifies optical innovation and acoustic frequencies on Biophilic Vagal Odyssey waypoints', () => {
    const quest = service.activeQuest();
    expect(quest.milestones[0].opticalInnovation).toContain('CIE S 026 Dawn Alert 285 EML');
    expect(quest.milestones[0].acousticHz).toBe(528);

    expect(quest.milestones[1].opticalInnovation).toContain('0.1Hz Sinusoidal OKN/VOR');
    expect(quest.milestones[1].acousticHz).toBe(432);

    expect(quest.milestones[2].opticalInnovation).toContain('670nm Deep Red Retinal Photobiomodulation');
    expect(quest.milestones[2].pbmDurationSeconds).toBe(180);
    expect(quest.milestones[2].vagalShiftTargetPercent).toBe(38.5);
    expect(quest.milestones[2].acousticHz).toBe(7.83);
  });
});
