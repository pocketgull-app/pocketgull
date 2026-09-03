import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhispySwarmBioreactor3dComponent } from './whispy-swarm-bioreactor-3d.component';
import { WhispySwarmBioreactorService } from '../../services/whispy-swarm-bioreactor.service';
import { ScaffoldExporterService } from '../../services/scaffold-exporter.service';

describe('WhispySwarmBioreactor3dComponent Unit Suite', () => {
  let component: WhispySwarmBioreactor3dComponent;
  let fixture: ComponentFixture<WhispySwarmBioreactor3dComponent>;
  let service: WhispySwarmBioreactorService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhispySwarmBioreactor3dComponent],
      providers: [WhispySwarmBioreactorService, ScaffoldExporterService]
    }).compileComponents();

    fixture = TestBed.createComponent(WhispySwarmBioreactor3dComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(WhispySwarmBioreactorService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('1. Initializes cleanly with 3D canvas and default scan phase', () => {
    expect(component).toBeTruthy();
    expect(service.currentPhase()).toBe('SCAN_INGESTION');
    expect(component.formatPhaseLabel('SCAN_INGESTION')).toContain('1. Scan Ingestion');
  });

  it('2. Advances phase when advancePhase() is called', () => {
    component.advancePhase();
    expect(service.currentPhase()).toBe('MIST_INOCULATION');
    expect(component.formatPhaseLabel('MIST_INOCULATION')).toContain('2. Mist Inoculation');
  });

  it('3. Handles slider input events for acoustic pressure, frequency, and bioelectric bias', () => {
    const mockPressureEvent = { target: { value: '1.9' } } as unknown as Event;
    component.onPressureChange(mockPressureEvent);
    expect(service.controls().acousticPressureMpa).toBe(1.9);

    const mockFreqEvent = { target: { value: '300' } } as unknown as Event;
    component.onFrequencyChange(mockFreqEvent);
    expect(service.controls().transducerFrequencyKhz).toBe(300);

    const mockBioEvent = { target: { value: '95' } } as unknown as Event;
    component.onBioelectricChange(mockBioEvent);
    expect(service.controls().bioelectricFieldMvMm).toBe(95);
  });

  it('4. Resets chamber cleanly from interactive console button', () => {
    component.advancePhase();
    component.advancePhase();
    expect(service.currentPhase()).toBe('ACOUSTIC_SCULPTING');

    component.resetChamber();
    expect(service.currentPhase()).toBe('SCAN_INGESTION');
    expect(component.isAutoRunning()).toBe(false);
  });

  it('5. Exports physical CAD STL and glTF 2.0 files and displays status notice', () => {
    component.exportStl();
    expect(component.exportNotice()).toContain('STL CAD exported');

    component.exportGltf();
    expect(component.exportNotice()).toContain('glTF 2.0 exported');
  });
});
