import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { RosettaStoneAnatomyComponent, ParadigmLens } from './rosetta-stone-anatomy.component';
import { ThemeService } from '../../services/theme.service';

describe('RosettaStoneAnatomyComponent Unit Suite', () => {
  let component: RosettaStoneAnatomyComponent;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RosettaStoneAnatomyComponent],
      providers: [ThemeService]
    }).compileComponents();

    const fixture = TestBed.createComponent(RosettaStoneAnatomyComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('1. Instantiates successfully with unified lens and liver target as default', () => {
    expect(component).toBeTruthy();
    expect(component.activeLens()).toBe('unified');
    expect(component.selectedTargetId()).toBe('liver');
    expect(component.targets.length).toBeGreaterThan(0);
    expect(component.activeTarget().id).toBe('liver');
  });

  it('2. Changes active target and updates computed activeTarget', () => {
    component.selectTarget('heart');
    expect(component.selectedTargetId()).toBe('heart');
    expect(component.activeTarget().name).toContain('Cardiac');
    expect(component.activeTarget().tcm.element).toBe('Fire');
    expect(component.activeTarget().ayurveda.chakra).toBe('Anahata (Heart)');
  });

  it('3. Changes paradigm lens and updates ThemeService', () => {
    const themeSpy = vi.spyOn(themeService, 'setParadigm');

    component.setLens('tcm');
    expect(component.activeLens()).toBe('tcm');
    expect(themeSpy).toHaveBeenCalledWith('tcm');

    component.setLens('ayurveda');
    expect(component.activeLens()).toBe('ayurveda');
    expect(themeSpy).toHaveBeenCalledWith('ayurveda');

    component.setLens('allopathic');
    expect(component.activeLens()).toBe('allopathic');
    expect(themeSpy).toHaveBeenCalledWith('western');
  });

  it('4. Handles cross-projection window event to update target node', () => {
    component.ngAfterViewInit();

    const event = new CustomEvent('rosetta-cross-projection', {
      detail: { nodeId: 'chest' }
    });
    window.dispatchEvent(event);

    expect(component.selectedTargetId()).toBe('heart');
    expect(component.activeTarget().id).toBe('heart');
  });

  it('5. Cleans up animation frame and event listeners on destroy', () => {
    component.ngAfterViewInit();
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    component.ngOnDestroy();
    expect(removeSpy).toHaveBeenCalledWith('rosetta-cross-projection', expect.any(Function));
  });
});
