import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OhsumiAutophagyChronometerComponent } from './ohsumi-autophagy-chronometer.component';

describe('OhsumiAutophagyChronometerComponent', () => {
  let fixture: ComponentFixture<OhsumiAutophagyChronometerComponent>;
  let component: OhsumiAutophagyChronometerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OhsumiAutophagyChronometerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OhsumiAutophagyChronometerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders Yoshinori Ohsumi header and default 18h fasting badge', () => {
    expect(component).toBeTruthy();
    expect(component.fastingHours()).toBe(18);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Autophagy & Lysosomal Recycling (Ohsumi Model)');
    expect(el.textContent).toContain('2016 Nobel Prize — Yoshinori Ohsumi');
    expect(el.textContent).toContain('Fasting: 18h');
  });

  it('2. Computes autophagosome clearance flux percentage at 18h (Phase 2)', () => {
    // 35 + ((18 - 12)/12) * 55 = 35 + 27.5 = 62.5 -> 63%
    expect(component.fluxPercentage()).toBe(63);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('63%');
  });

  it('3. Updates fasting duration via onFastingChange for Phase 1 (< 12h)', () => {
    const mockEvent = {
      target: { value: '6' }
    } as unknown as Event;

    component.onFastingChange(mockEvent);
    fixture.detectChanges();

    expect(component.fastingHours()).toBe(6);
    // (6 / 12) * 35 = 17.5 -> 18%
    expect(component.fluxPercentage()).toBe(18);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Fasting: 6h');
    expect(el.textContent).toContain('18%');
  });

  it('4. Updates fasting duration for Phase 3 (>= 24h) and caps at 100%', () => {
    // 36 hours: 90 + ((36 - 24)/24) * 10 = 90 + 5 = 95%
    component.onFastingChange({ target: { value: '36' } } as unknown as Event);
    fixture.detectChanges();

    expect(component.fastingHours()).toBe(36);
    expect(component.fluxPercentage()).toBe(95);

    // 48 hours: 90 + 10 = 100%
    component.onFastingChange({ target: { value: '48' } } as unknown as Event);
    fixture.detectChanges();

    expect(component.fastingHours()).toBe(48);
    expect(component.fluxPercentage()).toBe(100);

    // 60 hours cap: min(100, ...)
    component.onFastingChange({ target: { value: '60' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.fluxPercentage()).toBe(100);
  });

  it('5. Renders all three autophagy phase labels in gauge grid', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Phase 1: Glycogen');
    expect(el.textContent).toContain('mTOR Active');
    expect(el.textContent).toContain('Phase 2: Autophagy Peak');
    expect(el.textContent).toContain('AMPK Activated');
    expect(el.textContent).toContain('Phase 3: Stem Renewal');
    expect(el.textContent).toContain('Immune Rejuvenation');
  });
});
