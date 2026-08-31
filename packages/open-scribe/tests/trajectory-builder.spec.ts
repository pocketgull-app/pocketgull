import { describe, it, expect } from 'vitest';
import { TrajectoryBuilder } from '../src/trajectory-builder';

describe('TrajectoryBuilder Suite', () => {
  it('builds a comforting 3-Act trajectory without fatalism', () => {
    const transcript = 'Patient reports 3 months of knee pain and poor sleep.';
    const trajectory = TrajectoryBuilder.build(transcript, { hr: 68, bp: '118/75', spo2: 99 });

    expect(trajectory.act1WhereYouveBeen.title).toContain('Where You\'ve Been');
    expect(trajectory.act1WhereYouveBeen.historicalContext).toContain('Past flare-ups and physical fatigue were temporary signals');

    expect(trajectory.act2WhereYouStandToday.activeBiometrics.length).toBe(3);
    expect(trajectory.act2WhereYouStandToday.activeBiometrics[0]).toContain('68 bpm');

    expect(trajectory.act3WhereYoureGoing.roadmap30Day).toBeDefined();
    expect(trajectory.act3WhereYoureGoing.roadmap60Day).toBeDefined();
    expect(trajectory.act3WhereYoureGoing.roadmap90Day).toBeDefined();
  });
});
