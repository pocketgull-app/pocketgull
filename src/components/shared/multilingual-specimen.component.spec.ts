import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { MultilingualSpecimenComponent } from './multilingual-specimen.component';

describe('MultilingualSpecimenComponent', () => {
  let component: MultilingualSpecimenComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [MultilingualSpecimenComponent]
    });
    component = runInInjectionContext(injector, () => injector.get(MultilingualSpecimenComponent));
  });

  it('should create the multilingual specimen component', () => {
    expect(component).toBeTruthy();
    expect(component.scripts.length).toBeGreaterThanOrEqual(9);
  });

  it('should initialize with Latin script by default', () => {
    expect(component.activeScript().id).toBe('latin');
    expect(component.previewText()).toContain('Patient vitals stable');
    expect(component.weight()).toBe(400);
    expect(component.computedVariationSettings()).toBe("'wght' 400, 'opsz' 14");
  });

  it('should switch active script preset to Japanese and Chinese', () => {
    const japaneseScript = component.scripts.find(s => s.id === 'japanese')!;
    component.selectScript(japaneseScript);
    expect(component.activeScript().id).toBe('japanese');
    expect(component.previewText()).toContain('心電図');

    const chineseScript = component.scripts.find(s => s.id === 'chinese')!;
    component.selectScript(chineseScript);
    expect(component.activeScript().id).toBe('chinese');
    expect(component.previewText()).toContain('足三里');
  });

  it('should correctly analyze glyphs and compute hex code points', () => {
    component.previewText.set('心 A 1');
    const glyphs = component.analyzedGlyphs();
    expect(glyphs.length).toBe(5);

    const kanjiGlyph = glyphs.find(g => g.char === '心')!;
    expect(kanjiGlyph.codePoint).toBe('U+5FC3');
    expect(kanjiGlyph.block).toBe('CJK Ideograph');

    const latinGlyph = glyphs.find(g => g.char === 'A')!;
    expect(latinGlyph.codePoint).toBe('U+0041');
  });

  it('should update font weight and optical size variation settings', () => {
    const mockWeightEvent = { target: { value: '700' } } as unknown as Event;
    component.updateWeight(mockWeightEvent);
    expect(component.weight()).toBe(700);

    const mockOpszEvent = { target: { value: '28' } } as unknown as Event;
    component.updateOpticalSize(mockOpszEvent);
    expect(component.opticalSize()).toBe(28);

    expect(component.computedVariationSettings()).toBe("'wght' 700, 'opsz' 28");
  });

  it('should toggle italic state', () => {
    expect(component.isItalic()).toBe(false);
    component.toggleItalic();
    expect(component.isItalic()).toBe(true);
    component.toggleItalic();
    expect(component.isItalic()).toBe(false);
  });

  it('should handle copy CSS snippet gracefully', () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    component.copyCssSnippet();
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('font-family: \'PocketGull VF\'')
    );
  });

  it('should toggle between single script and common translation matrix view modes', () => {
    expect(component.viewMode()).toBe('single');
    expect(component.commonTranslations.length).toBeGreaterThanOrEqual(11);

    component.toggleViewMode();
    expect(component.viewMode()).toBe('matrix');

    component.toggleViewMode();
    expect(component.viewMode()).toBe('single');
  });
});
