import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupportTicketModalComponent } from './support-ticket-modal.component';
import { ClinicalSupportAgentService, ISupportTicket } from '../../services/clinical-support-agent.service';

describe('SupportTicketModalComponent', () => {
  let component: SupportTicketModalComponent;
  let fixture: ComponentFixture<SupportTicketModalComponent>;
  let supportAgent: ClinicalSupportAgentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportTicketModalComponent],
      providers: [ClinicalSupportAgentService]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportTicketModalComponent);
    component = fixture.componentInstance;
    supportAgent = TestBed.inject(ClinicalSupportAgentService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders modal header with PocketGull AI Support Agent', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PocketGull AI Support Agent');
    expect(el.textContent).toContain('support@pocketgull.app');
  });

  it('2. Initializes with default form fields for clinician support query', () => {
    expect(component.senderEmail).toBe('dr.smith@metrohealth.org');
    expect(component.category).toBe('EHR_INTEGRATION');
    expect(component.subject).toContain('SMART-on-FHIR');
    expect(component.isProcessing()).toBe(false);
  });

  it('3. Formats priority CSS badge classes correctly', () => {
    expect(component.getPriorityClass('P1_CRITICAL')).toContain('text-red-400');
    expect(component.getPriorityClass('P2_HIGH')).toContain('text-amber-400');
    expect(component.getPriorityClass('P3_STANDARD')).toContain('text-blue-400');
  });

  it('4. Submits inquiry and displays resolved ticket output', async () => {
    const mockTicket: ISupportTicket = {
      id: 'tkt-test-999',
      senderEmail: 'test@clinic.org',
      subject: 'Test Subject',
      body: 'Test Body',
      category: 'CLINICAL_QUERY',
      priority: 'P3_STANDARD',
      timestamp: new Date().toISOString(),
      status: 'RESOLVED_BY_AI',
      aiResponse: 'Thank you for contacting support. Here is your resolution.'
    };

    vi.spyOn(supportAgent, 'submitSupportInquiry').mockResolvedValue(mockTicket);

    await component.submitInquiry();
    fixture.detectChanges();

    expect(component.activeTicket()).toEqual(mockTicket);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('tkt-test-999');
    expect(el.textContent).toContain('Thank you for contacting support. Here is your resolution.');
  });

  it('5. Emits closed output when closeModal is invoked', () => {
    let closedEmitted = false;
    component.closed.subscribe(() => {
      closedEmitted = true;
    });

    component.closeModal();
    expect(closedEmitted).toBe(true);
  });
});
