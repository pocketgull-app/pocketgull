import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { PracticeRoiCalculatorComponent } from './practice-roi-calculator.component';
import { PracticeRoiService } from '../../services/practice-roi.service';

describe('PracticeRoiCalculatorComponent', () => {
  let component: PracticeRoiCalculatorComponent;
  let service: PracticeRoiService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        PracticeRoiService,
        PracticeRoiCalculatorComponent
      ]
    });

    service = injector.get(PracticeRoiService);
    component = runInInjectionContext(injector, () => injector.get(PracticeRoiCalculatorComponent));
  });

  it('should initialize Practice ROI calculator component with service', () => {
    expect(component).toBeTruthy();
    expect(component.roi).toBeTruthy();
    expect(service.patientCohortCount()).toBe(200);
  });

  it('should update patient cohort when slider changes', () => {
    const event = {
      target: { value: '350' }
    } as unknown as Event;

    component.onPatientSliderChange(event);
    expect(service.patientCohortCount()).toBe(350);
  });

  it('should generate CSV export string properly without crashing', () => {
    // Mock URL and document.createElement
    const createObjectURLMock = () => 'blob:http://localhost/test';
    const revokeObjectURLMock = () => {};
    (globalThis as any).URL.createObjectURL = createObjectURLMock;
    (globalThis as any).URL.revokeObjectURL = revokeObjectURLMock;

    let clicked = false;
    const mockAnchor = {
      href: '',
      download: '',
      click: () => { clicked = true; }
    };
    const origCreateElement = document.createElement;
    document.createElement = (tag: string) => {
      if (tag === 'a') return mockAnchor as any;
      return origCreateElement.call(document, tag);
    };

    component.exportCsv();
    expect(clicked).toBe(true);
    expect(mockAnchor.download).toContain('PocketGull_Practice_ROI');

    document.createElement = origCreateElement;
  });
});
