import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { BigQueryAnalyticsService, ITrajectoryRequest } from '../src/services/bigquery-analytics.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('BigQueryAnalyticsService & Trajectory Engine Suite', () => {
  let service: BigQueryAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BigQueryAnalyticsService
      ]
    });
    service = TestBed.inject(BigQueryAnalyticsService);
  });

  it('1. Computes deterministic local trajectory for continuous glucose with 90-day horizon', () => {
    const req: ITrajectoryRequest = {
      patientId: 'p001',
      metric: 'glucose_cgm',
      baselineValue: 120,
      timeHorizonDays: 90,
      interventionScenario: 'optimized_nutrition'
    };

    const res = service.computeLocalTrajectory(req);

    expect(res.success).toBe(true);
    expect(res.metric).toBe('glucose_cgm');
    expect(res.points.length).toBe(90);
    expect(res.qalyLongevityImpactYears).toBe(1.8);
    expect(res.projectedDelta).toBeLessThan(0); // Glucose decreases under nutrition protocol
  });

  it('2. Verifies 95% confidence intervals are mathematically bounded', () => {
    const req: ITrajectoryRequest = {
      patientId: 'p002',
      metric: 'blood_pressure_sbp',
      baselineValue: 135,
      timeHorizonDays: 30,
      interventionScenario: 'baseline'
    };

    const res = service.computeLocalTrajectory(req);

    res.points.forEach(pt => {
      expect(pt.upperConfidenceBound).toBeGreaterThanOrEqual(pt.predictedValue);
      expect(pt.lowerConfidenceBound).toBeLessThanOrEqual(pt.predictedValue);
      expect(pt.upperConfidenceBound).toBeGreaterThan(pt.lowerConfidenceBound);
    });
  });

  it('3. Simulates sedentary drift negative QALY impact', () => {
    const req: ITrajectoryRequest = {
      patientId: 'p003',
      metric: 'glucose_cgm',
      baselineValue: 110,
      timeHorizonDays: 60,
      interventionScenario: 'sedentary_drift'
    };

    const res = service.computeLocalTrajectory(req);

    expect(res.qalyLongevityImpactYears).toBe(-1.4);
    expect(res.projectedDelta).toBeGreaterThan(0); // Glucose increases with sedentary lifestyle
  });

  it('4. Generates valid BQML ARIMA_PLUS DDL template containing correct dataset identifiers', () => {
    const req: ITrajectoryRequest = {
      patientId: 'p004',
      metric: 'heart_rate_variability',
      baselineValue: 52,
      timeHorizonDays: 30
    };

    const res = service.computeLocalTrajectory(req);

    expect(res.bqmlSqlDdl).toContain('CREATE OR REPLACE MODEL');
    expect(res.bqmlSqlDdl).toContain('ARIMA_PLUS');
    expect(res.bqmlSqlDdl).toContain('pocketgull_analytics');
    expect(res.bqmlSqlDdl).toContain('heart_rate_variability_model');
  });
});
