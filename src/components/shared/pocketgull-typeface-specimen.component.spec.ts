import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PocketgullTypefaceSpecimenComponent } from './pocketgull-typeface-specimen.component';

describe('PocketgullTypefaceSpecimenComponent', () => {
  let component: PocketgullTypefaceSpecimenComponent;
  let fixture: ComponentFixture<PocketgullTypefaceSpecimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketgullTypefaceSpecimenComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketgullTypefaceSpecimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default preview text and sandbox tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeSpecimenTab()).toBe('sandbox');
    expect(component.previewText()).toBe('PocketGull 2026');
    expect(component.showBezierNodes()).toBe(false);
    expect(component.previewTextArray().length).toBe('PocketGull 2026'.length);
  });

  it('2. Switches specimen tabs between sandbox, telemetry, grid, and ladder', () => {
    component.activeSpecimenTab.set('telemetry');
    fixture.detectChanges();
    expect(component.activeSpecimenTab()).toBe('telemetry');

    component.activeSpecimenTab.set('grid');
    fixture.detectChanges();
    expect(component.activeSpecimenTab()).toBe('grid');

    component.activeSpecimenTab.set('ladder');
    fixture.detectChanges();
    expect(component.activeSpecimenTab()).toBe('ladder');
  });

  it('3. Toggles Bézier node handle inspector visibility', () => {
    expect(component.showBezierNodes()).toBe(false);
    component.showBezierNodes.set(true);
    expect(component.showBezierNodes()).toBe(true);
    component.showBezierNodes.set(false);
    expect(component.showBezierNodes()).toBe(false);
  });

  it('4. Updates preview text on input event and appends characters from glyph palette', () => {
    const fakeEvent = {
      target: { value: 'Clinical Rx 500mg' }
    } as unknown as Event;

    component.updateText(fakeEvent);
    expect(component.previewText()).toBe('Clinical Rx 500mg');
    expect(component.previewTextArray().join('')).toBe('Clinical Rx 500mg');

    component.appendChar('!');
    expect(component.previewText()).toBe('Clinical Rx 500mg!');
  });

  it('5. Resolves accurate SVG glyph vector paths for catalog characters', () => {
    const pathP = component.getGlyphPath('P');
    expect(pathP).toContain('M 25 15 L 25 105');

    const pathZero = component.getGlyphPath('0');
    expect(pathZero).toContain('M 50 20');

    // Case-insensitive fallback
    const pathLowerP = component.getGlyphPath('p');
    expect(pathLowerP).toBeTruthy();
  });

  it('6. Generates deterministic algorithmic SVG path fallback for uncataloged characters', () => {
    const uncatalogedPath = component.getGlyphPath('$');
    expect(uncatalogedPath).toMatch(/^M 20 \d+ L \d+ \d+/);
  });

  it('7. Contains complete clinical glyph catalog across uppercase, lowercase, numeral, and symbols', () => {
    expect(component.glyphCatalog.length).toBeGreaterThanOrEqual(20);
    const categories = new Set(component.glyphCatalog.map(g => g.category));
    expect(categories.has('uppercase')).toBe(true);
    expect(categories.has('lowercase')).toBe(true);
    expect(categories.has('numeral')).toBe(true);
    expect(categories.has('symbol')).toBe(true);
  });
});
