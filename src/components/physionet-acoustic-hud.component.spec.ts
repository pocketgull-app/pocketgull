import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PhysioNetAcousticHudComponent } from './physionet-acoustic-hud.component';
import { PhysioNetAcousticService, AuscultationSite, IPcgAcousticAnalysis } from '../services/physionet-acoustic.service';

describe('PhysioNetAcousticHudComponent', () => {
  let component: PhysioNetAcousticHudComponent;
  let fixture: ComponentFixture<PhysioNetAcousticHudComponent>;
  let mockAcousticService: {
    activeSite: ReturnType<typeof signal<AuscultationSite>>;
    lastAnalysis: ReturnType<typeof signal<IPcgAcousticAnalysis>>;
    analyzeAcousticPcgStream: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAcousticService = {
      activeSite: signal<AuscultationSite>('Mitral/Apex'),
      lastAnalysis: signal<IPcgAcousticAnalysis>({
        site: 'Mitral/Apex',
        presence: 'Absent',
        timing: 'None',
        grade: 'Grade 0/VI',
        confidenceScore: 0.965,
        s1PeakFrequencyHz: 48,
        s2PeakFrequencyHz: 72,
        heartRateBpm: 72,
        diagnosticInterpretation: 'Normal S1 & S2 physiological heart sound envelope. Zero pathological systolic or diastolic murmurs detected.'
      }),
      analyzeAcousticPcgStream: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PhysioNetAcousticHudComponent],
      providers: [
        { provide: PhysioNetAcousticService, useValue: mockAcousticService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PhysioNetAcousticHudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component with initial default site', () => {
    expect(component).toBeTruthy();
    expect(component.sites).toEqual(['Aortic', 'Pulmonic', 'Tricuspid', 'Mitral/Apex']);
    expect(mockAcousticService.activeSite()).toBe('Mitral/Apex');
  });

  it('should render header with title and 20Hz-400Hz PCG Bandpass badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('PhysioNet MedGemma Acoustic PCG Stethoscope AI');
    expect(compiled.textContent).toContain('20Hz-400Hz PCG Bandpass');
  });

  it('should render all 4 auscultation site buttons and trigger selectSite', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Aortic');
    expect(compiled.textContent).toContain('Pulmonic');
    expect(compiled.textContent).toContain('Tricuspid');
    expect(compiled.textContent).toContain('Mitral/Apex');

    component.selectSite('Aortic');
    expect(mockAcousticService.analyzeAcousticPcgStream).toHaveBeenCalledWith('Aortic', false);
  });

  it('should render PCG canvas oscilloscope and peak frequencies', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('canvas')).toBeTruthy();
    expect(compiled.textContent).toContain('S1 Peak: 48Hz');
    expect(compiled.textContent).toContain('S2 Peak: 72Hz');
    expect(compiled.textContent).toContain('Phonocardiogram (PCG) Acoustic Audio Envelope');
  });

  it('should display murmur classification and confidence score', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Murmur Classification');
    expect(compiled.textContent).toContain('Absent');
    expect(compiled.textContent).toContain('Grade 0/VI');
    expect(compiled.textContent).toContain('MedGemma Confidence');
    expect(compiled.textContent).toContain('96.5%');
    expect(compiled.textContent).toContain('HR 72 bpm');
  });

  it('should run simulation analysis for normal and murmur PCGs', () => {
    component.runAnalysis(false);
    expect(mockAcousticService.analyzeAcousticPcgStream).toHaveBeenCalledWith('Mitral/Apex', false);

    component.runAnalysis(true);
    expect(mockAcousticService.analyzeAcousticPcgStream).toHaveBeenCalledWith('Mitral/Apex', true);
  });

  it('should render MedGemma diagnostic interpretation text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('MedGemma Electrophysiology & Murmur Diagnosis');
    expect(compiled.textContent).toContain('Normal S1 & S2 physiological heart sound envelope');
  });
});
