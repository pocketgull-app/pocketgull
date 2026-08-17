import { TestBed } from '@angular/core/testing';
import { ClinicalCodingCopilotComponent } from './clinical-coding-copilot.component';
import { ClinicalCodingCopilotService } from '../services/clinical-coding-copilot.service';

describe('ClinicalCodingCopilotComponent (HIM Auditor Workstation)', () => {
  let component: ClinicalCodingCopilotComponent;
  let service: ClinicalCodingCopilotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClinicalCodingCopilotService]
    });
    service = TestBed.inject(ClinicalCodingCopilotService);
    component = TestBed.runInInjectionContext(() => new ClinicalCodingCopilotComponent());
    component.ngOnInit();
  });

  it('should initialize and auto-audit the clinical demo chart on load', () => {
    expect(component.activeReport()).toBeDefined();
    expect(component.activeReport()?.suggestions.length).toBeGreaterThanOrEqual(4);
    expect(component.totalSuggestionsCount()).toBeGreaterThanOrEqual(4);
  });

  it('should toggle eye care theme modes seamlessly', () => {
    expect(component.copilotService.eyeCareMode()).toBe('warm-amber');
    expect(component.containerThemeClass()).toContain('bg-[#0f0c08]');

    component.copilotService.setEyeCareMode('oled-dark');
    expect(component.containerThemeClass()).toContain('bg-[#000000]');
  });

  it('should handle keyboard navigation J/K and hotkeys A/D', () => {
    const initialIdx = component.copilotService.selectedIndex();
    expect(initialIdx).toBe(0);

    // J -> Next
    component.handleKeyboardHotkeys(new KeyboardEvent('keydown', { key: 'j' }));
    expect(component.copilotService.selectedIndex()).toBe(1);

    // K -> Prev
    component.handleKeyboardHotkeys(new KeyboardEvent('keydown', { key: 'k' }));
    expect(component.copilotService.selectedIndex()).toBe(0);

    // A -> Accept
    component.handleKeyboardHotkeys(new KeyboardEvent('keydown', { key: 'a' }));
    expect(component.acceptedCount()).toBe(1);
  });
});
