import { Injectable, signal, computed, inject } from '@angular/core';
import { UnicefOpenDataService, IUnicefRegionalChildProfile } from './unicef-open-data.service';

export interface ISdohPrapareAssessment {
  housingInsecurity: boolean;      // LOINC 71802-3
  foodInsecurity: boolean;         // LOINC 88122-7
  transportationBarrier: boolean;   // LOINC 93300-2
  utilityInsecurity: boolean;        // LOINC 93301-0
  digitalLiteracyBarrier: boolean;  // LOINC 93302-8
  cleanWaterInsecurity?: boolean;   // UNICEF/WHO JMP Basic Drinking Water
  childImmunizationDelay?: boolean; // UNICEF Zero-Dose / Under-Immunized
}

export interface IClimateHealthMetrics {
  airQualityIndex: number;          // 0-500 AQI
  pm25MicrogramsM3: number;         // ug/m3
  extremeHeatRiskDaysYear: number;
}

export interface IWhoCdcHealthEquityScorecard {
  sdohRiskVectorCount: number;      // 0-5
  compositeEquityIndex: number;     // 0-100 (100 = Optimal Equity & Resilience)
  equityTier: 'OPTIMAL' | 'MODERATE_RISK' | 'HIGH_VULNERABILITY' | 'CRITICAL_ACTION_REQUIRED';
  priorityDirectives: string[];
  unicefBenchmark?: IUnicefRegionalChildProfile;
}

@Injectable({
  providedIn: 'root'
})
export class WhoCdcHealthEquityService {
  private readonly unicefService?: UnicefOpenDataService;

  constructor() {
    try {
      this.unicefService = inject(UnicefOpenDataService, { optional: true }) ?? undefined;
    } catch {
      // Gracefully handles instantiation outside Angular DI context (e.g. unit tests with `new`)
    }
  }

  public sdohState = signal<ISdohPrapareAssessment>({
    housingInsecurity: false,
    foodInsecurity: false,
    transportationBarrier: false,
    utilityInsecurity: false,
    digitalLiteracyBarrier: false
  });

  public climateMetrics = signal<IClimateHealthMetrics>({
    airQualityIndex: 42,
    pm25MicrogramsM3: 10.2,
    extremeHeatRiskDaysYear: 14
  });

  public equityScorecard = computed<IWhoCdcHealthEquityScorecard>(() => {
    const sdoh = this.sdohState();
    const climate = this.climateMetrics();

    let count = 0;
    if (sdoh.housingInsecurity) count++;
    if (sdoh.foodInsecurity) count++;
    if (sdoh.transportationBarrier) count++;
    if (sdoh.utilityInsecurity) count++;
    if (sdoh.digitalLiteracyBarrier) count++;

    // Calculate WHO/CDC Composite Equity Index (100 base - deductions)
    let index = 100 - (count * 15);

    if (climate.airQualityIndex > 100) index -= 10;
    if (climate.pm25MicrogramsM3 > 35) index -= 10;
    if (climate.extremeHeatRiskDaysYear > 30) index -= 5;

    index = Math.max(0, Math.min(100, index));

    let tier: IWhoCdcHealthEquityScorecard['equityTier'] = 'OPTIMAL';
    if (index < 40) tier = 'CRITICAL_ACTION_REQUIRED';
    else if (index < 65) tier = 'HIGH_VULNERABILITY';
    else if (index < 85) tier = 'MODERATE_RISK';

    const directives: string[] = [];
    if (sdoh.foodInsecurity) {
      directives.push('🍎 Connect patient with local SNAP / WIC nutrition assistance and community food banks.');
    }
    if (sdoh.transportationBarrier) {
      directives.push('🚌 Coordinate non-emergency medical transportation (NEMT) for clinical visits.');
    }
    if (sdoh.cleanWaterInsecurity) {
      directives.push('💧 UNICEF/WHO WASH Alert: Inadequate potable water access. Recommend point-of-use chlorine water purification and hygiene kit.');
    }
    if (sdoh.childImmunizationDelay) {
      directives.push('💉 UNICEF Zero-Dose Directive: Connect pediatric patient with community catch-up immunization clinic for missed primary antigens.');
    }
    if (climate.airQualityIndex > 100) {
      directives.push('🫁 Recommend HEPA air filtration and indoor activity during high AQI alerts.');
    }
    if (directives.length === 0) {
      directives.push('✅ Health equity metrics optimal. Maintain routine preventative wellness monitoring.');
    }

    const unicefBenchmark = this.unicefService?.activeRegionalProfile ? this.unicefService.activeRegionalProfile() : undefined;

    return {
      sdohRiskVectorCount: count,
      compositeEquityIndex: index,
      equityTier: tier,
      priorityDirectives: directives,
      unicefBenchmark
    };
  });

  public evaluateHealthEquity(
    sdohOverride?: Partial<ISdohPrapareAssessment>,
    climateOverride?: Partial<IClimateHealthMetrics>
  ): IWhoCdcHealthEquityScorecard {
    if (sdohOverride) {
      this.sdohState.update(s => ({ ...s, ...sdohOverride }));
    }
    if (climateOverride) {
      this.climateMetrics.update(c => ({ ...c, ...climateOverride }));
    }
    return this.equityScorecard();
  }

  /**
   * Generates a BigQuery query against the public EPA Historical Air Quality dataset
   * to extract localized PM2.5 and AQI risk metrics for environmental SDOH grounding.
   */
  public generateBigQueryAirQualityQuery(stateCode = '06', countyCode = '075'): string {
    return `-- BigQuery EPA Air Quality PM2.5 & AQI Environmental SDOH Extraction
SELECT
  state_name,
  county_name,
  date_local,
  aqi,
  arithmetic_mean AS pm25_concentration_ug_m3,
  CASE
    WHEN aqi <= 50 THEN 'GOOD'
    WHEN aqi <= 100 THEN 'MODERATE'
    WHEN aqi <= 150 THEN 'UNHEALTHY_FOR_SENSITIVE_GROUPS'
    ELSE 'UNHEALTHY_OR_HAZARDOUS'
  END AS aqi_category
FROM \`bigquery-public-data.epa_historical_air_quality.pm25_daily_summary\`
WHERE state_code = '${stateCode.replace(/'/g, '')}'
  AND county_code = '${countyCode.replace(/'/g, '')}'
  AND date_local >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
ORDER BY date_local DESC
LIMIT 100;`;
  }
}
