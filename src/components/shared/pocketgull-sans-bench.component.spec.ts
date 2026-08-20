import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PocketgullSansBenchComponent } from './pocketgull-sans-bench.component';

describe('PocketgullSansBenchComponent', () => {
  let component: PocketgullSansBenchComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [PocketgullSansBenchComponent]
    });
    component = runInInjectionContext(injector, () => injector.get(PocketgullSansBenchComponent));
  });

  it('should create the PocketGull Sans bench component', () => {
    expect(component).toBeTruthy();
    expect(component.disambiguationPairs.length).toBeGreaterThanOrEqual(6);
    expect(component.dosageExamples.length).toBeGreaterThanOrEqual(4);
  });

  it('should initialize with all clinical OpenType disambiguation features enabled', () => {
    expect(component.enableCurvedL()).toBe(true);
    expect(component.enableSlashedZero()).toBe(true);
    expect(component.enableSerifedI()).toBe(true);
    expect(component.enableTabularNums()).toBe(true);
    expect(component.enableOpenFour()).toBe(true);

    const featureString = component.computedFeatureSettings();
    expect(featureString).toContain('"cv05" 1');
    expect(featureString).toContain('"cv08" 1');
    expect(featureString).toContain('"ss02" 1');
    expect(featureString).toContain('"tnum" 1');
    expect(featureString).toContain('"ss01" 1');
  });

  it('should toggle individual OpenType features dynamically', () => {
    component.toggleFeature('cv05');
    expect(component.enableCurvedL()).toBe(false);
    expect(component.computedFeatureSettings()).not.toContain('"cv05" 1');

    component.toggleFeature('cv08');
    expect(component.enableSlashedZero()).toBe(false);
    expect(component.computedFeatureSettings()).not.toContain('"cv08" 1');

    component.toggleFeature('ss02');
    expect(component.enableSerifedI()).toBe(false);

    component.toggleFeature('tnum');
    expect(component.enableTabularNums()).toBe(false);

    component.toggleFeature('ss01');
    expect(component.enableOpenFour()).toBe(false);

    expect(component.computedFeatureSettings()).toBe('normal');
    expect(component.activeFeatureString()).toBe('None (Standard)');
  });

  it('should update font weight, optical size, and tracking', () => {
    const mockWeightEvent = { target: { value: '700' } } as unknown as Event;
    component.updateWeight(mockWeightEvent);
    expect(component.weight()).toBe(700);

    const mockOpszEvent = { target: { value: '24' } } as unknown as Event;
    component.updateOpticalSize(mockOpszEvent);
    expect(component.opticalSize()).toBe(24);

    const mockTrackEvent = { target: { value: '0.02' } } as unknown as Event;
    component.updateLetterSpacing(mockTrackEvent);
    expect(component.letterSpacing()).toBe(0.02);
  });

  it('should handle lifecycle hooks and clear intervals on destroy', () => {
    component.ngOnInit();
    expect(component.simulatedHeartRate()).toBeGreaterThan(0);
    component.ngOnDestroy();
  });

  it('should copy CSS snippet to clipboard', () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    component.copyCssSnippet();
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('font-family: \'PocketGull Sans\'')
    );
  });
});
