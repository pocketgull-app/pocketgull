import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';

// Mock Angular effect to avoid ChangeDetectionScheduler requirement in headless Vitest tests
vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => ({ destroy: () => {} }),
    afterNextRender: () => {}
  };
});

import { SteeepQualityHudComponent } from './steeep-quality-hud.component';
import { SteeepQualityAuditService } from '../../services/steeep-quality-audit.service';

describe('SteeepQualityHudComponent', () => {
  let component: SteeepQualityHudComponent;
  let mockSteeepService: any;

  beforeEach(() => {
    const mockReport = {
      id: 'steeep-test-01',
      timestamp: '2026-09-02T12:00:00Z',
      patientId: 'patient-test',
      compositeScore: 97,
      compositeGrade: 'A',
      dimensions: {
        SAFE: { dimension: 'SAFE', title: 'Safe', icon: '🛡️', score: 98, grade: 'A', status: 'OPTIMAL', metrics: [], recommendations: [] },
        TIMELY: { dimension: 'TIMELY', title: 'Timely', icon: '⏱️', score: 95, grade: 'A', status: 'OPTIMAL', metrics: [], recommendations: [] },
        EFFECTIVE: { dimension: 'EFFECTIVE', title: 'Effective', icon: '🎯', score: 96, grade: 'A', status: 'OPTIMAL', metrics: [], recommendations: [] },
        EFFICIENT: { dimension: 'EFFICIENT', title: 'Efficient', icon: '⚡', score: 94, grade: 'A', status: 'OPTIMAL', metrics: [], recommendations: [] },
        EQUITABLE: { dimension: 'EQUITABLE', title: 'Equitable', icon: '⚖️', score: 97, grade: 'A', status: 'OPTIMAL', metrics: [], recommendations: [] },
        PATIENT_CENTERED: { dimension: 'PATIENT_CENTERED', title: 'Patient-Centered', icon: '❤️', score: 99, grade: 'A', status: 'OPTIMAL', metrics: [], recommendations: [] }
      },
      refrigeratorCareCard: {
        patientName: 'Jane Doe',
        coreDiagnosis: 'L4–L5 Lumbar Disc Herniation',
        updatedAt: 'Sep 2, 2026',
        threeActTrajectory: {
          whereYouveBeen: 'Past hurdle',
          whereYouStandToday: 'Current status',
          whereYoureGoing: 'Vitality goal'
        },
        trafficLightActionPlan: {
          green: { status: 'GREEN', actions: ['Walk daily'] },
          yellow: { status: 'YELLOW', actions: ['Rest'], alertDoctorIf: '24 hours' },
          red: { status: 'RED', actions: ['Numbness'], emergencyAction: 'Call 911' }
        },
        teachBackQuestions: ['Q1', 'Q2', 'Q3'],
        fleschKincaidGradeLevel: 4.8,
        emergencyContactLine: '1-800-555-GULL'
      },
      sha256Seal: 'sha256-nam-steeep-test-seal'
    };

    mockSteeepService = {
      activeReport: signal(mockReport),
      generateAuditReport: vi.fn(),
      generateFhirMeasureReport: vi.fn().mockReturnValue({ resourceType: 'MeasureReport' })
    };

    const injector = Injector.create({
      providers: [
        { provide: SteeepQualityAuditService, useValue: mockSteeepService },
        SteeepQualityHudComponent
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(SteeepQualityHudComponent));
  });

  it('should initialize with RADAR tab active and display composite score', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('RADAR');
    expect(component.report().compositeScore).toBe(97);
    expect(component.dimensionList().length).toBe(6);
  });

  it('should switch between RADAR, SCORECARD, REFRIGERATOR_CARD, and FHIR_MEASURE tabs', () => {
    component.activeTab.set('SCORECARD');
    expect(component.activeTab()).toBe('SCORECARD');

    component.activeTab.set('REFRIGERATOR_CARD');
    expect(component.activeTab()).toBe('REFRIGERATOR_CARD');

    component.activeTab.set('FHIR_MEASURE');
    expect(component.activeTab()).toBe('FHIR_MEASURE');
  });

  it('should compute radar visualizer geometry points for SVG polygon', () => {
    const polygon = component.getRadarPolygonPoints();
    expect(polygon).toBeTruthy();
    expect(polygon.split(' ').length).toBe(6);

    const grid = component.getRadarGridPoints(0.5);
    expect(grid).toBeTruthy();
    expect(grid.split(' ').length).toBe(6);
  });

  it('should trigger re-audit on refreshAudit()', () => {
    component.refreshAudit();
    expect(mockSteeepService.generateAuditReport).toHaveBeenCalled();
  });
});
