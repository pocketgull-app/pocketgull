import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ContactlessVitalsScannerComponent } from './contactless-vitals-scanner.component';
import { PatientStateService } from '../services/patient-state.service';

describe('ContactlessVitalsScannerComponent', () => {
  let component: ContactlessVitalsScannerComponent;
  let fixture: ComponentFixture<ContactlessVitalsScannerComponent>;
  let mockPatientState: {
    vitals: ReturnType<typeof signal<{ hr: string; spO2: string; bp: string; temp: string }>>;
    toggleContactlessScanner: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockPatientState = {
      vitals: signal({ hr: '70', spO2: '97', bp: '120/80', temp: '98.6' }),
      toggleContactlessScanner: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ContactlessVitalsScannerComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactlessVitalsScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component with initial default state', () => {
    expect(component).toBeTruthy();
    expect(component.cameraActive()).toBe(false);
    expect(component.isScanning()).toBe(false);
    expect(component.scanProgress()).toBe(0);
    expect(component.scanComplete()).toBe(false);
  });

  it('should render header with badge and placeholder instruction', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Contactless Edge Biosignal Scanner');
    expect(compiled.querySelector('pocket-gull-badge')).toBeTruthy();
    expect(compiled.textContent).toContain('rPPG Facial Optical Pulse & Vocal Acoustic Jitter');
    expect(compiled.textContent).toContain('Click Start Scan to activate your camera');
  });

  it('should start scan and advance progress using interval timer', () => {
    vi.useFakeTimers();

    component.startContactlessScan();
    expect(component.isScanning()).toBe(true);
    expect(component.scanProgress()).toBe(0);

    // Advance 5 seconds (50% progress)
    vi.advanceTimersByTime(5000);
    expect(component.scanProgress()).toBe(50);
    expect(component.isScanning()).toBe(true);
    expect(component.scanComplete()).toBe(false);

    // Advance remaining 5 seconds to complete (100%)
    vi.advanceTimersByTime(5000);
    expect(component.scanProgress()).toBe(100);
    expect(component.isScanning()).toBe(false);
    expect(component.scanComplete()).toBe(true);
  });

  it('should display computed vitals result grid when scan is complete', () => {
    component.computedHeartRate.set(74);
    component.computedHrv.set(48);
    component.computedSpo2.set(99);
    component.computedVocalPitch.set(142);
    component.computedStrainIndex.set(22);
    component.scanComplete.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Heart Rate');
    expect(compiled.textContent).toContain('74');
    expect(compiled.textContent).toContain('HRV (RMSSD)');
    expect(compiled.textContent).toContain('48');
    expect(compiled.textContent).toContain('Est. SpO2');
    expect(compiled.textContent).toContain('99');
    expect(compiled.textContent).toContain('Vocal Pitch (F0)');
    expect(compiled.textContent).toContain('142');
    expect(compiled.textContent).toContain('Strain: 22/100');
  });

  it('should apply computed vitals to patient chart and close scanner', () => {
    component.computedHeartRate.set(78);
    component.computedSpo2.set(99);
    component.scanComplete.set(true);
    fixture.detectChanges();

    component.applyVitalsToChart();

    expect(mockPatientState.vitals().hr).toBe('78');
    expect(mockPatientState.vitals().spO2).toBe('99');
    expect(mockPatientState.toggleContactlessScanner).toHaveBeenCalledWith(false);
  });

  it('should close scanner when cancel button or close X is clicked', () => {
    component.closeScanner();
    expect(mockPatientState.toggleContactlessScanner).toHaveBeenCalledWith(false);
  });

  it('should clean up scanInterval and stop active stream on destroy', () => {
    vi.useFakeTimers();
    component.startContactlessScan();
    expect(component.isScanning()).toBe(true);

    component.ngOnDestroy();
    // After destroy, advancing timers should not throw or progress further
    vi.advanceTimersByTime(5000);
  });
});
