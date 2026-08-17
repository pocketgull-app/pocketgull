import { TestBed } from '@angular/core/testing';
import { AdobeCloudServicesService } from './adobe-cloud-services.service';

describe('AdobeCloudServicesService', () => {
  let service: AdobeCloudServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdobeCloudServicesService]
    });
    service = TestBed.inject(AdobeCloudServicesService);
  });

  it('should be created with active consoleConfig and default endpoints', () => {
    expect(service).toBeTruthy();
    expect(service.consoleConfig().orgId).toBe('00AF226E687833EB0A495CEE@AdobeOrg');
    expect(service.consoleConfig().projectId).toBe('4315712');
    expect(service.consoleConfig().workspaceId).toBe('4566206088345737690');
    expect(service.activeApis().length).toBeGreaterThan(5);
  });

  it('should manage reactive signals and isBusy computation during asset generation', async () => {
    expect(service.isGenerating()).toBe(false);
    expect(service.isBusy()).toBe(false);

    const genPromise = service.generateFireflyAsset({
      prompt: 'Edwin Smith Codex: Micro-vascular cardiac endothelium',
      stylePreset: 'biophotonic-sss'
    });

    const result = await genPromise;
    expect(result.imageUrl).toContain('firefly_organs.png');
    expect(service.lastGeneratedAssetUrl()).toBe(result.imageUrl);
    expect(service.isGenerating()).toBe(false);
    expect(service.isBusy()).toBe(false);
  });

  it('should extract clinical PDF into FHIR R4 structured JSON', async () => {
    const mockBlob = new Blob(['%PDF-1.4 Mock Clinical Report'], { type: 'application/pdf' });
    const extractResult = await service.extractClinicalPdf(mockBlob);

    expect(extractResult.documentId).toBeDefined();
    expect(extractResult.pageCount).toBe(2);
    expect(extractResult.extractedTables.length).toBeGreaterThan(0);
    expect(extractResult.fhirCompatibleJson['resourceType']).toBe('Bundle');
    expect(extractResult.fhirCompatibleJson['type']).toBe('document');
  });

  it('should generate clinical dossier with C2PA digital seal', async () => {
    const res = await service.generateClinicalDossierPdf({
      patientRefId: 'PAT-8823-CURIE',
      title: 'Care Plan & 504 Folio',
      templateId: 'care-plan',
      clinicalData: { hr: 72, spo2: 98 }
    });

    expect(res.pdfBlobUrl).toContain('PAT-8823-CURIE');
    expect(res.c2paSignature).toContain('urn:c2pa:adobe:pocketgull:PAT-8823-CURIE');
  });
});
