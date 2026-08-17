import '@angular/compiler';
import { SlackIntegrationService } from './slack-integration.service';
import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('SlackIntegrationService', () => {
  let service: SlackIntegrationService;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    injector = createEnvironmentInjector([], undefined as any);

    runInInjectionContext(injector, () => {
      service = new SlackIntegrationService();
    });
  });

  it('should initialize in simulation mode with empty webhook URL', () => {
    expect(service).toBeTruthy();
    expect(service.isSimulatedMode()).toBe(true);
    expect(service.webhookUrl()).toBe('');
  });

  it('should format a valid HIPAA-sanitized Slack Block Kit payload', () => {
    const kit = service.formatTriageAlertBlockKit(
      'Homo Sapiens (Female, Neurological, 34y)',
      75,
      2.35,
      ['Periodontal Probing Depth >= 4mm', 'Vagal HRV Strain']
    );

    expect(kit.text).toContain('Homo Sapiens');
    expect(kit.blocks[0].text?.text).toContain('CRITICAL SIBI ALERT');
    expect(kit.blocks.length).toBeGreaterThanOrEqual(3);
    expect(kit.blocks[0].type).toBe('header');
  });

  it('should process /pocketgull slash command correctly', () => {
    const kit = service.processSlashCommand('/pocketgull consult SIBI inflammatory risk');

    expect(kit.text).toContain('SIBI inflammatory risk');
    expect(kit.blocks[0].type).toBe('section');
  });

  it('should dispatch simulated triage alert successfully', async () => {
    const success = await service.sendTriageAlert(
      'Homo Sapiens (Male, Cardiopulmonary, 58y)',
      62,
      1.85,
      ['Elevated hs-CRP']
    );

    expect(success).toBe(true);
    expect(service.lastAlertStatus()).toContain('[SIMULATED]');
  });
});
