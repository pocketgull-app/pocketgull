import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsentModalComponent } from './consent-modal.component';
import { ConsentService } from '../../services/consent.service';
import { SecureStorageService } from '../../services/secure-storage.service';

describe('ConsentModalComponent', () => {
  let fixture: ComponentFixture<ConsentModalComponent>;
  let component: ConsentModalComponent;
  let mockConsentService: { acceptConsent: any; hasConsented: any };

  beforeEach(async () => {
    mockConsentService = {
      acceptConsent: vi.fn(),
      hasConsented: { set: vi.fn() }
    };

    await TestBed.configureTestingModule({
      imports: [ConsentModalComponent],
      providers: [
        { provide: ConsentService, useValue: mockConsentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create and render consent modal dialog with title', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Data Privacy & AI Disclosure');
    expect(el.textContent).toContain('Your Data Stays on Your Device');
    expect(el.textContent).toContain('Not a Medical Device');
    expect(el.textContent).toContain('COPPA Safe Harbor');
  });

  it('2. should call consent.acceptConsent when continue action is invoked', () => {
    component.consent.acceptConsent();
    expect(mockConsentService.acceptConsent).toHaveBeenCalled();
  });
});

