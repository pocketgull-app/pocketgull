import '@angular/compiler';
import { AdobePdfLabDropzoneComponent } from './adobe-pdf-lab-dropzone.component';
import { PatientStateService } from '../services/patient-state.service';
import { AdobeEnterpriseSuiteService } from '../services/adobe-enterprise-suite.service';
import { signal, Injector, runInInjectionContext } from '@angular/core';

describe('AdobePdfLabDropzoneComponent', () => {
  let component: AdobePdfLabDropzoneComponent;
  let mockPatientState: any;

  beforeEach(() => {
    mockPatientState = {
      patientHistory: signal<any[]>([]),
      patientVitals: signal<any[]>([]),
      vitals: signal<any>({})
    };

    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState },
        { provide: AdobeEnterpriseSuiteService, useClass: AdobeEnterpriseSuiteService }
      ]
    });

    component = runInInjectionContext(injector, () => new AdobePdfLabDropzoneComponent());
  });

  it('should create component with default states', () => {
    expect(component).toBeTruthy();
    expect(component.isDragging()).toBe(false);
    expect(component.isExtracting()).toBe(false);
    expect(component.currentReport()).toBeNull();
  });

  it('should parse mock CMP report and extract analytes', async () => {
    component.loadSampleReport('cmp');
    expect(component.isExtracting()).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 700));

    expect(component.isExtracting()).toBe(false);
    const report = component.currentReport();
    expect(report).toBeDefined();
    expect(report?.rows.length).toBe(8);
    expect(report?.rows[0].analyte).toBe('Serum Glucose');
    expect(report?.rows[0].loincCode).toBe('2345-7');
  });

  it('should parse mock Lipid Panel and extract ApoB & hs-CRP', async () => {
    component.loadSampleReport('lipid');
    await new Promise(resolve => setTimeout(resolve, 700));

    const report = component.currentReport();
    expect(report?.reportTitle).toContain('Lipid & Inflammatory Panel');
    const apob = report?.rows.find(r => r.analyte.includes('ApoB'));
    expect(apob).toBeDefined();
    expect(apob?.value).toBe('74');
  });

  it('should ingest extracted biomarkers into PatientState signals', async () => {
    component.loadSampleReport('cmp');
    await new Promise(resolve => setTimeout(resolve, 700));

    component.ingestIntoPatientState();
    expect(component.actionToast()).toContain('Ingested 8 biomarkers');
  });
});
