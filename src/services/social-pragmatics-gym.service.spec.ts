import { TestBed } from '@angular/core/testing';
import { SocialPragmaticsGymService } from './social-pragmatics-gym.service';

describe('SocialPragmaticsGymService', () => {
  let service: SocialPragmaticsGymService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocialPragmaticsGymService]
    });
    service = TestBed.inject(SocialPragmaticsGymService);
  });

  it('should be created and initialize default persona', () => {
    expect(service).toBeTruthy();
    expect(service.personas.length).toBe(5);
    expect(service.activePersona().name).toBe('Maya');
    expect(service.conversationHistory().length).toBe(1);
  });

  it('should process user responses and evaluate empathy and inner monologue', () => {
    const result = service.processUserResponse("Congratulations Maya! What is the theme of your exhibition?");
    expect(result.empathyScore).toBeGreaterThanOrEqual(90);
    expect(service.conversationHistory().length).toBe(3);
    expect(service.conversationHistory()[2].innerMonologue).toBeTruthy();
  });

  it('should generate comprehensive social telemetry reports', () => {
    service.processUserResponse("I hear you and understand your perspective. What do you need right now?");
    const report = service.generateTelemetryReport();
    expect(report.curiosityRatio).toBeGreaterThan(0);
    expect(report.empathyDepthTier).toContain('Level');
    expect(report.strengthsObserved.length).toBeGreaterThan(0);
  });

  it('should switch personas cleanly with resetSession', () => {
    service.resetSession('busy_colleague');
    expect(service.activePersona().name).toBe('Marcus');
    expect(service.conversationHistory().length).toBe(1);
    expect(service.conversationHistory()[0].text).toContain('client staging');
  });
});
