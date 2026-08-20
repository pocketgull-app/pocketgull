import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { AwcimIntegrativePrescriberComponent } from './awcim-integrative-prescriber.component';

describe('AwcimIntegrativePrescriberComponent', () => {
  let component: AwcimIntegrativePrescriberComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [AwcimIntegrativePrescriberComponent]
    });
    component = runInInjectionContext(injector, () => injector.get(AwcimIntegrativePrescriberComponent));
  });

  it('should initialize with default botanical and tabs', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('botanicals');
    expect(component.activeBotanical().id).toBe('curcumin');
    expect(component.botanicalCatalog.length).toBe(5);
  });

  it('should switch botanicals and provide multi-paradigm energetics', () => {
    const ashwagandha = component.botanicalCatalog.find(b => b.id === 'ashwagandha')!;
    component.selectBotanical(ashwagandha);

    expect(component.activeBotanical().id).toBe('ashwagandha');
    expect(component.activeBotanical().ayurvedic.sanskritName).toContain('अश्वगन्धा');
    expect(component.activeBotanical().tcm.chineseName).toContain('南非醉茄');
    expect(component.activeBotanical().allopathicMechanism).toContain('HPA');
  });

  it('should compute 4-7-8 breathwork states and toggle safely', () => {
    expect(component.isBreathActive()).toBe(false);
    expect(component.breathPhaseText()).toBe('READY');

    component.toggleBreathwork();
    expect(component.isBreathActive()).toBe(true);
    expect(component.breathPhase()).toBe('inhale');
    expect(component.breathPhaseText()).toBe('INHALE');

    component.toggleBreathwork();
    expect(component.isBreathActive()).toBe(false);
    expect(component.breathPhase()).toBe('idle');
  });

  it('should clean up timers on destroy', () => {
    component.toggleBreathwork();
    expect(component.isBreathActive()).toBe(true);
    component.ngOnDestroy();
    expect(component).toBeTruthy();
  });
});
