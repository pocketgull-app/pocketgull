import '@angular/compiler';
import { WhoCdcHealthEquityService } from './who-cdc-health-equity.service';

describe('WhoCdcHealthEquityService Unit Suite', () => {
  let service: WhoCdcHealthEquityService;

  beforeEach(() => {
    service = new WhoCdcHealthEquityService();
  });

  it('1. Initializes default optimal WHO/CDC Health Equity Scorecard', () => {
    const scorecard = service.equityScorecard();
    expect(scorecard.compositeEquityIndex).toBe(100);
    expect(scorecard.equityTier).toBe('OPTIMAL');
    expect(scorecard.sdohRiskVectorCount).toBe(0);
  });

  it('2. Evaluates SDOH risk vectors and updates equity tier', () => {
    const updated = service.evaluateHealthEquity({
      foodInsecurity: true,
      transportationBarrier: true,
      housingInsecurity: true
    });

    expect(updated.sdohRiskVectorCount).toBe(3);
    expect(updated.compositeEquityIndex).toBe(55);
    expect(updated.equityTier).toBe('HIGH_VULNERABILITY');
    expect(updated.priorityDirectives.some(d => d.includes('SNAP'))).toBe(true);
  });

  it('3. Generates UNICEF WASH and Zero-Dose child health equity directives', () => {
    const updated = service.evaluateHealthEquity({
      cleanWaterInsecurity: true,
      childImmunizationDelay: true
    });

    expect(updated.priorityDirectives.some(d => d.includes('UNICEF/WHO WASH Alert'))).toBe(true);
    expect(updated.priorityDirectives.some(d => d.includes('UNICEF Zero-Dose Directive'))).toBe(true);
  });

  it('4. Generates BigQuery EPA air quality environmental SDOH query', () => {
    const query = service.generateBigQueryAirQualityQuery('06', '075');
    expect(query).toContain('bigquery-public-data.epa_historical_air_quality.pm25_daily_summary');
    expect(query).toContain("state_code = '06'");
    expect(query).toContain("county_code = '075'");
    expect(query).toContain('pm25_concentration_ug_m3');
  });
});
