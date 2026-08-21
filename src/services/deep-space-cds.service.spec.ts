import '@angular/compiler';
import { expect, describe, it, beforeEach } from 'vitest';
import { DeepSpaceCdsService } from './deep-space-cds.service';

describe('DeepSpaceCdsService Unit Suite', () => {
  let service: DeepSpaceCdsService;

  beforeEach(() => {
    service = new DeepSpaceCdsService();
  });

  it('1. Initializes flight formulary with key life-support medications and radiation metrics', () => {
    const formulary = service.flightFormulary();
    expect(formulary.length).toBeGreaterThanOrEqual(5);
    expect(formulary.some(d => d.name.includes('Tranexamic Acid'))).toBe(true);
    expect(formulary.some(d => d.name.includes('Epinephrine'))).toBe(true);
    expect(formulary.some(d => d.name.includes('Acetazolamide'))).toBe(true);
  });

  it('2. Evaluates autonomous triage for acute EVA hemorrhagic trauma with zero latency', () => {
    const result = service.evaluateAutonomousTriage(
      ['Active pulsatile bleed from right femoral puncture during airlock depressurization'],
      { heartRate: 128, systolicBp: 78, spo2Percent: 92, co2Ppm: 600 }
    );

    expect(result.triageSeverity).toBe('STAT_EMERGENCY');
    expect(result.recommendedProtocolId).toBe('EVA_HEMORRHAGE_TRAUMA');
    expect(result.immediateActions.some(a => a.includes('Tourniquet'))).toBe(true);
    expect(result.formularyItemsToDispense.some(f => f.drugName.includes('Tranexamic Acid'))).toBe(true);
    expect(result.earthTelemetryDelayMinutes).toBeGreaterThan(10);
  });

  it('3. Evaluates autonomous triage for atmospheric hypercapnia scrubber exhaustion', () => {
    const result = service.evaluateAutonomousTriage(
      ['Throbbing frontal headache', 'dyspnea on mild exertion', 'ECLSS alert'],
      { heartRate: 98, systolicBp: 135, spo2Percent: 96, co2Ppm: 5800 }
    );

    expect(result.triageSeverity).toBe('STAT_EMERGENCY');
    expect(result.recommendedProtocolId).toBe('HYPERCAPNIA_CO2_TOXICITY');
    expect(result.immediateActions.some(a => a.includes('LiOH canisters'))).toBe(true);
  });

  it('4. Retrieves step-by-step POCUS-guided emergency checklist steps', () => {
    const checklist = service.getEmergencyChecklist('EVA_HEMORRHAGE_TRAUMA');
    expect(checklist.length).toBe(3);
    expect(checklist[0].criticality).toBe('CRITICAL_IMMEDIATE');
    expect(checklist[1].pocusUltrasoundGuidance).toContain('intercostal space');
  });

  it('5. Generates formatted Earth Ground Control Telemetry Burst Packet with checksum', () => {
    const packet = service.generateTelemetryBurstPacket(
      'ASTRONAUT-ARTEMIS-07',
      'Successful TXA administration following EVA sharp debris puncture',
      { hr: 88, bp: '118/74', spo2: 98 }
    );

    expect(packet.packetId).toContain('BURST-MARS');
    expect(packet.crewId).toBe('ASTRONAUT-ARTEMIS-07');
    expect(packet.checksumSha256).toContain('SHA256:');
  });
});
