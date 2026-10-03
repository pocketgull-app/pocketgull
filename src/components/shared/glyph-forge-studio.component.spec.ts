import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { GlyphForgeStudioComponent } from './glyph-forge-studio.component';

describe('GlyphForgeStudioComponent Unit Suite', () => {
  let component: GlyphForgeStudioComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlyphForgeStudioComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(GlyphForgeStudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Instantiates successfully with default typography parameters', () => {
    expect(component).toBeTruthy();
    expect(component.nibStyle()).toBe('bold');
    expect(component.variableWeight()).toBe(700);
    expect(component.activeChar()).toBe('P');
    expect(component.pointCount()).toBe(0);
  });

  it('2. Switches nib styles across PocketGull superfamily axes', () => {
    component.nibStyle.set('chiseltip');
    expect(component.nibStyle()).toBe('chiseltip');

    component.nibStyle.set('fineliner');
    expect(component.nibStyle()).toBe('fineliner');

    component.nibStyle.set('mono');
    expect(component.nibStyle()).toBe('mono');
  });

  it('3. Handles variable font weight slider changes', () => {
    const mockEvent = {
      target: { value: '450' }
    } as unknown as Event;

    component.onWeightSliderChange(mockEvent);
    expect(component.variableWeight()).toBe(450);
    expect(component.nibStyle()).toBe('variable');
  });

  it('4. Toggles typographic metric guide lines', () => {
    expect(component.showGridLines()).toBe(true);
    expect(component.showOvershoot()).toBe(true);
    expect(component.showExtrema()).toBe(true);

    component.showGridLines.set(false);
    expect(component.showGridLines()).toBe(false);

    component.showOvershoot.set(false);
    expect(component.showOvershoot()).toBe(false);

    component.showExtrema.set(false);
    expect(component.showExtrema()).toBe(false);
  });

  it('5. Loads character presets and clears drawn strokes', () => {
    component.pointCount.set(42);
    component.loadPreset('G');
    expect(component.activeChar()).toBe('G');
    expect(component.pointCount()).toBe(0);

    component.loadPreset('Ø');
    expect(component.activeChar()).toBe('Ø');
  });

  it('6. Clears canvas and resets drawn points state', () => {
    component.pointCount.set(15);
    component.clearCanvas();
    expect(component.pointCount()).toBe(0);
  });

  it('7. Activates copied signal when copySvgPath is invoked', () => {
    expect(component.copied()).toBe(false);
    component.copySvgPath();
    expect(component.copied()).toBe(true);
  });
});
