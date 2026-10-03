import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlackIntegrationCardComponent } from './slack-integration-card.component';
import { SlackIntegrationService } from '../services/slack-integration.service';
import { TeledentistryService } from '../services/teledentistry.service';
import { PatientStateService } from '../services/patient-state.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';

describe('SlackIntegrationCardComponent', () => {
  let component: SlackIntegrationCardComponent;
  let fixture: ComponentFixture<SlackIntegrationCardComponent>;
  let slackService: SlackIntegrationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlackIntegrationCardComponent],
      providers: [
        SlackIntegrationService,
        TeledentistryService,
        PatientStateService,
        {
          provide: IntelligenceProviderToken,
          useValue: {
            generateContent: vi.fn().mockResolvedValue('Mock CDS response'),
            streamContent: vi.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SlackIntegrationCardComponent);
    component = fixture.componentInstance;
    slackService = TestBed.inject(SlackIntegrationService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Slack Clinical Command header and connection badge', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Slack Clinical Command & AI Triage Integration');
    expect(el.textContent).toContain('Slack Webhook Endpoint URL');
    expect(el.textContent).toContain('Interactive Slack Slash Command Tester');
  });

  it('2. Initializes activeBlockKit on startup with default slash query', () => {
    expect(component.activeBlockKit()).toBeDefined();
    expect(component.activeBlockKit()?.text).toBeDefined();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Live Slack Channel Block Kit Preview');
  });

  it('3. Updates webhook URL when onWebhookChange is called', () => {
    const inputEvent = {
      target: { value: 'https://hooks.slack.com/services/TEST/123/XYZ' }
    } as unknown as Event;

    component.onWebhookChange(inputEvent);
    expect(slackService.webhookUrl()).toBe('https://hooks.slack.com/services/TEST/123/XYZ');
  });

  it('4. Dispatches triage alert when testDispatchAlert is triggered', async () => {
    const sendSpy = vi.spyOn(slackService, 'sendTriageAlert').mockResolvedValue(true);

    await component.testDispatchAlert();

    expect(sendSpy).toHaveBeenCalled();
    expect(component.isDispatching()).toBe(false);
  });

  it('5. Processes slash commands and updates preview when runSlashCommand is invoked', () => {
    component.slashQuery.set('/pocketgull help');
    component.runSlashCommand();
    fixture.detectChanges();

    expect(component.activeBlockKit()).toBeDefined();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pocket Gull Clinical AI Response');
  });
});
