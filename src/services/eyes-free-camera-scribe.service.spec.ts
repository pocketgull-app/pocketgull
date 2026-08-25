import '@angular/compiler';
import { EyesFreeCameraScribeService } from './eyes-free-camera-scribe.service';

describe('EyesFreeCameraScribeService Unit Suite', () => {
  let service: EyesFreeCameraScribeService;

  beforeEach(() => {
    service = new EyesFreeCameraScribeService();
  });

  it('1. Initializes cleanly with default Medication Identifier mode and inactive camera', () => {
    expect(service).toBeTruthy();
    expect(service.isCameraStreaming()).toBe(false);
    expect(service.activeMode()).toBe('MEDICATION_IDENTIFIER');
    expect(service.lastInspection()).toBeTruthy();
    expect(service.lastInspection()?.headline).toContain('Metformin');
  });

  it('2. Starts and stops camera streaming cleanly', () => {
    service.startCamera();
    expect(service.isCameraStreaming()).toBe(true);

    service.stopCamera();
    expect(service.isCameraStreaming()).toBe(false);
  });

  it('3. Switches modes and updates visual inspection result for Room Navigation and Document OCR', async () => {
    vi.useFakeTimers();
    service.setMode('ROOM_NAVIGATION');
    expect(service.activeMode()).toBe('ROOM_NAVIGATION');
    expect(service.isAnalyzing()).toBe(true);

    vi.advanceTimersByTime(200);
    expect(service.isAnalyzing()).toBe(false);
    expect(service.lastInspection()?.headline).toContain('Living Room Doorway');

    service.setMode('DOCUMENT_READER');
    vi.advanceTimersByTime(200);
    expect(service.lastInspection()?.headline).toContain('Discharge Care Summary');
    vi.useRealTimers();
  });
});
