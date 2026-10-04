import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PocketGullAiSocialCardComponent } from './pocketgull-ai-social-card.component';

describe('PocketGullAiSocialCardComponent', () => {
  let fixture: ComponentFixture<PocketGullAiSocialCardComponent>;
  let component: PocketGullAiSocialCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketGullAiSocialCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketGullAiSocialCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('2. should render brand header with official badge and sovereign co-pilot subtitle', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PocketGull AI');
    expect(el.textContent).toContain('OFFICIAL');
    expect(el.textContent).toContain('Sovereign Clinical Co-Pilot');
  });

  it('3. should render high-contrast branded QR code', () => {
    const qr = fixture.nativeElement.querySelector('app-branded-qr-code');
    expect(qr).toBeTruthy();
  });

  it('4. should render direct link pointing to pocketgull.app with target _blank', () => {
    const anchor = fixture.nativeElement.querySelector('a') as HTMLElement;
    expect(anchor).toBeTruthy();
    expect(anchor.getAttribute('href')).toBe('https://pocketgull.app');
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toContain('noopener');
    expect(anchor.getAttribute('rel')).toContain('noreferrer');
  });
});
