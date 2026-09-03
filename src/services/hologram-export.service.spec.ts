import '@angular/compiler';
import { HologramExportService, IHologramExportRecord } from './hologram-export.service';

describe('HologramExportService Unit Suite', () => {
  let service: HologramExportService;

  beforeEach(() => {
    service = new HologramExportService();
  });

  it('1. Initializes with inactive recording state and null export history', () => {
    expect(service.isRecording()).toBe(false);
    expect(service.recordingProgressPct()).toBe(0);
    expect(service.lastExport()).toBeNull();
  });

  it('2. Captures 2D PNG snapshot from canvas and formats FHIR Media attachment', async () => {
    const mockCanvas = {
      width: 1920,
      height: 1080,
      toBlob: (cb: (blob: Blob | null) => void) => {
        const blob = new Blob(['PNG_MOCK_BYTES'], { type: 'image/png' });
        cb(blob);
      },
      toDataURL: () => 'data:image/png;base64,UE5HX01PQ0tfQllURVM='
    } as unknown as HTMLCanvasElement;

    const record = await service.captureCanvasSnapshot(mockCanvas, 'crispr_r_loop', false);

    expect(record).toBeTruthy();
    expect(record.mediaType).toBe('image/png');
    expect(record.paradigm).toBe('crispr_r_loop');
    expect(record.width).toBe(1920);
    expect(record.height).toBe(1080);
    expect(record.fhirAttachment?.contentType).toBe('image/png');
    expect(record.fhirAttachment?.title).toContain('CRISPR_R_LOOP');
    expect(service.lastExport()?.exportId).toBe(record.exportId);
  });

  it('3. Records WebM video stream with progress tracking and generates FHIR Media resource', async () => {
    const mockCanvas = {
      width: 1280,
      height: 720
    } as unknown as HTMLCanvasElement;

    const record = await service.recordCanvasVideo(mockCanvas, 0.2, 'condensates', false);

    expect(record).toBeTruthy();
    expect(record.mediaType).toBe('video/webm');
    expect(record.paradigm).toBe('condensates');
    expect(record.width).toBe(1280);
    expect(record.height).toBe(720);
    expect(service.isRecording()).toBe(false);

    // Test FHIR Media Resource Generator
    const fhirMedia = service.generateFhirMediaResource(record, 'PT-CHRIS-007');
    expect(fhirMedia.resourceType).toBe('Media');
    expect(fhirMedia.status).toBe('completed');
    expect(fhirMedia.subject.reference).toBe('Patient/PT-CHRIS-007');
    expect(fhirMedia.modality.coding[0].code).toBe('98253-8');
    expect(fhirMedia.modality.coding[0].display).toBe('Physical Genomics 3D Spatial Hologram');
  });

  it('4. Throws defensive error on invalid or missing canvas element', async () => {
    await expect(service.captureCanvasSnapshot(null as any)).rejects.toThrow('Invalid canvas element');
    await expect(service.recordCanvasVideo(null as any)).rejects.toThrow('Invalid canvas element');
  });
});
