import '@angular/compiler';
import { AdkLiveService, uint8ArrayToBase64, base64ToUint8Array } from './adk-live.service';
import type { IOccupationalHazardProfile } from '../actuarial-longevity.service';

describe('AdkLiveService', () => {
  it('should initialize with disconnected state and default signals', () => {
    const service = new AdkLiveService();

    expect(service.isConnected()).toBe(false);
    expect(service.isListening()).toBe(false);
    expect(service.isSpeaking()).toBe(false);
    expect(service.volumeLevel()).toBe(0);
  });

  it('should encode 16-bit PCM Uint8Array chunks to base64 using zero-copy uint8ArrayToBase64', () => {
    const pcm16 = new Int16Array([0, 16384, -16384, 32767]);
    const uint8 = new Uint8Array(pcm16.buffer);
    const b64 = uint8ArrayToBase64(uint8);

    expect(b64).toBeTruthy();
    expect(typeof b64).toBe('string');

    const decoded = base64ToUint8Array(b64);
    expect(decoded.length).toBe(uint8.length);
    expect(decoded[0]).toBe(uint8[0]);
    expect(decoded[1]).toBe(uint8[1]);
  });

  it('should generate rich occupational prompt segment when occupationalProfile is provided', () => {
    const service = new AdkLiveService();
    const mockProfile: IOccupationalHazardProfile = {
      professionTitle: 'Polymaths, Renaissance Scholars & Interdisciplinary Synthesizers',
      socCode: '11-1021-POLY',
      snomedCode: '417893002',
      snomedDisplay: 'Occupational cognitive overload',
      category: 'Life Sciences & Research',
      oshaRiskLevel: 'Standard',
      actuarialQalyImpact: 4.5,
      ergonomicStrainScore: 3,
      circadianDisruptionScore: 6,
      chemicalExposureScore: 1,
      allostaticBurnoutScore: 7,
      oshaMitigationDirectives: ['Ergonomic desk optimization'],
      therapeuticHobbies: ['Polyphonic singing'],
      tcmOccupationalDirectives: [],
      ayurvedicOccupationalDirectives: [],
      arboristEcologicalDirectives: [],
      precisionOccupationalNutrition: ['L-theanine 200mg'],
      vocalResonanceProtocol: '🎵 Polyphonic Renaissance Choral Glee'
    };

    const segment = service.buildOccupationalPromptSegment(mockProfile);

    expect(segment).toContain('Polymaths, Renaissance Scholars & Interdisciplinary Synthesizers');
    expect(segment).toContain('11-1021-POLY');
    expect(segment).toContain('SNOMED: 417893002');
    expect(segment).toContain('Choral Vocal Resonance & Glee Protocol: 🎵 Polyphonic Renaissance Choral Glee');
  });

  it('should handle empty buffer encoding gracefully', () => {
    const emptyUint8 = new Uint8Array(0);
    const b64 = uint8ArrayToBase64(emptyUint8);
    expect(b64).toBe('');

    const decoded = base64ToUint8Array('');
    expect(decoded.length).toBe(0);
  });

  it('should clean up state and signals on disconnect', () => {
    const service = new AdkLiveService();
    service.disconnect();

    expect(service.isConnected()).toBe(false);
    expect(service.isListening()).toBe(false);
    expect(service.isSpeaking()).toBe(false);
    expect(service.volumeLevel()).toBe(0);
  });

  it('should return empty string prompt segment when occupationalProfile is null or undefined', () => {
    const service = new AdkLiveService();
    const segment = service.buildOccupationalPromptSegment(null as any);
    expect(segment).toBe('');
  });

  it('should define a 10-minute MAX_SESSION_DURATION_MS safety ceiling (600,000 ms)', () => {
    expect(AdkLiveService.MAX_SESSION_DURATION_MS).toBe(600000);
  });

  it('should generate rich Child Life Specialist prompt segment when isPediatric is true', () => {
    const service = new AdkLiveService();
    const segment = service.buildPediatricPromptSegment(true, 'Leo', 7);

    expect(segment).toContain('CHILD LIFE SPECIALIST & PEDIATRIC COMMUNICATION PROTOCOL');
    expect(segment).toContain('Leo');
    expect(segment).toContain('around age 7');
    expect(segment).toContain('tiny superhero castle guards');
    expect(segment).toContain('COPPA Audio Rule Safeguard');
  });

  it('should return empty string when isPediatric is false', () => {
    const service = new AdkLiveService();
    const segment = service.buildPediatricPromptSegment(false);
    expect(segment).toBe('');
  });

  it('should generate structured 3D spatial lesion prompt segment when lesions are provided', () => {
    const service = new AdkLiveService();
    const mockLesions = [
      {
        id: 'lesion_1',
        label: 'Lumbar Facet Arthropathy',
        partId: 'torso',
        position: { x: 0.12, y: 0.95, z: -0.15 },
        severity: 'critical' as const,
        morphology: 'edema' as const,
        snomedCode: '298705009',
        clinicalNotes: 'L4/L5 facet joint tenderness',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const segment = service.buildSpatialLesionPromptSegment(mockLesions);

    expect(segment).toContain('3D SPATIAL ANATOMY TELEMETRY & ACTIVE LESION MARKUP CONTEXT');
    expect(segment).toContain('[CRITICAL] Lumbar Facet Arthropathy at 3D coordinate (0.12, 0.95, -0.15)');
    expect(segment).toContain('SNOMED: 298705009');
    expect(segment).toContain('L4/L5 facet joint tenderness');
    expect(segment).toContain('Clinical Grounding Directive for 3D Lesions');
  });

  it('should return empty string when spatialLesions is empty or undefined', () => {
    const service = new AdkLiveService();
    expect(service.buildSpatialLesionPromptSegment([])).toBe('');
    expect(service.buildSpatialLesionPromptSegment(undefined)).toBe('');
  });

  it('should handle sendRealtimeLesionUpdate gracefully when disconnected', () => {
    const service = new AdkLiveService();
    expect(() => {
      service.sendRealtimeLesionUpdate({
        id: 'lesion_2',
        label: 'Patellar Tendinopathy',
        partId: 'leg_left',
        position: { x: -0.2, y: 0.45, z: 0.05 },
        severity: 'moderate' as const,
        morphology: 'inflammation' as const,
        clinicalNotes: 'Inferior pole patellar pain',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }).not.toThrow();
  });
});

