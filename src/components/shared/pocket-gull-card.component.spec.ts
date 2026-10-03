import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PocketGullCardComponent } from './pocket-gull-card.component';
import { signal } from '@angular/core';

describe('PocketGullCardComponent', () => {
  let component: PocketGullCardComponent;
  let fixture: ComponentFixture<PocketGullCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketGullCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketGullCardComponent);
    component = fixture.componentInstance;

    (component as any).title = signal('Clinical Card Title');
    (component as any).icon = signal('M12 2L2 7l10 5 10-5-10-5z');
    (component as any).personaBadge = signal('Gulliver');
    (component as any).flippable = signal(true);
    (component as any).plainText = signal('Plain language explanation for patients.');
    fixture.detectChanges();
  });

  it('1. Initializes and renders card title and persona badge', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Clinical Card Title');
    expect(component.personaBadge()).toBe('Gulliver');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Clinical Card Title');
    expect(el.textContent).toContain('Gulliver');
  });

  it('2. Computes SVG icon markup from path data', () => {
    const iconHtml = component.iconHtml();
    expect(iconHtml).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.bg-primary-10')).toBeTruthy();
  });

  it('3. Renders flippable hint when flippable input is true', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('dblclick 🔄 flip');
  });

  it('4. Flips card over on toggleFlip', () => {
    expect(component.isFlipped()).toBe(false);

    component.toggleFlip();
    fixture.detectChanges();

    expect(component.isFlipped()).toBe(true);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Plain-Language Clinical Rationale');
    expect(el.textContent).toContain('Plain language explanation for patients.');
  });

  it('5. Flips card back when toggleFlip is invoked again after debounce', () => {
    component.toggleFlip();
    fixture.detectChanges();
    expect(component.isFlipped()).toBe(true);

    // Reset debounce timestamp so second flip executes
    (component as any).lastFlipTime = 0;

    component.toggleFlip();
    fixture.detectChanges();
    expect(component.isFlipped()).toBe(false);
  });
});
