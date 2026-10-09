import '@angular/compiler';
import { NcaaSportsScienceService } from './ncaa-sports-science.service';

describe('NcaaSportsScienceService Suite', () => {
  let service: NcaaSportsScienceService;

  beforeEach(() => {
    service = new NcaaSportsScienceService();
  });

  it('1. Initializes with Big Ten, Pac-12, and ACC partner universities (UW, Purdue, UO, UVA)', () => {
    const partners = service.academicPartners();
    expect(partners.length).toBeGreaterThanOrEqual(5);
    
    const uw = partners.find(p => p.name.includes('Washington'));
    const purdue = partners.find(p => p.name.includes('Purdue'));
    const uo = partners.find(p => p.name.includes('Oregon'));
    const uva = partners.find(p => p.name.includes('Virginia'));

    expect(uw).toBeDefined();
    expect(purdue).toBeDefined();
    expect(uo).toBeDefined();
    expect(uva).toBeDefined();
    expect(uw?.conference).toBe('Big Ten');
    expect(purdue?.network).toBe('Big Ten Network (BTN)');
    expect(uva?.conference).toBe('ACC');
    expect(uva?.network).toBe('ACC Network');
    expect(uva?.nihCtsaHub).toContain('iTHRIV');
  });

  it('2. Computes Acute-to-Chronic Workload Ratio (ACWR) and injury tier correctly', () => {
    service.acuteLoad.set(4200);
    service.chronicLoad.set(3500);
    const metrics = service.workloadAnalysis();

    expect(metrics.acwr).toBe(1.2);
    expect(metrics.injuryRiskTier).toBe('Low / Optimal (0.8 - 1.3)');
    expect(metrics.autonomicHrvScoreMs).toBeGreaterThan(60);
  });

  it('3. Identifies banned NCAA stimulants vs. safe NSF Certified for Sport supplements', () => {
    const synephrine = service.screenSupplement('synephrine');
    expect(synephrine.isBannedByNcaa).toBe(true);
    expect(synephrine.category).toBe('Stimulants');

    const tartCherry = service.screenSupplement('tart cherry extract');
    expect(tartCherry.isBannedByNcaa).toBe(false);
    expect(tartCherry.nsfCertifiedForSport).toBe(true);

    const creatine = service.screenSupplement('creatine monohydrate');
    expect(creatine.isBannedByNcaa).toBe(false);
    expect(creatine.category).toBe('Safe / Permitted');
  });

  it('4. Computes Coast-to-Coast Circadian Travel Protocols (PST to EST)', () => {
    const eastwardPlan = service.computeCircadianTravelPlan('PST', 'EST');
    expect(eastwardPlan.timeShiftHours).toBe(3);
    expect(eastwardPlan.lightExposureWindow).toContain('Morning');
    expect(eastwardPlan.melatoninRecommendation).toContain('21:30 EST');

    const westwardPlan = service.computeCircadianTravelPlan('EST', 'PST');
    expect(westwardPlan.timeShiftHours).toBe(3);
    expect(westwardPlan.lightExposureWindow).toContain('Late afternoon');
  });

  it('5. Manages Concussion Return-to-Play stage transitions', () => {
    expect(service.currentConcussionStage()).toBe(1);
    service.advanceConcussionStage();
    expect(service.currentConcussionStage()).toBe(2);

    service.resetConcussionProtocol();
    expect(service.currentConcussionStage()).toBe(1);
  });

  it('6. Generates UO Knight Campus & Bowerman Tendon Bioprinting Stepped-Care Recovery Plan', () => {
    const plan = service.getTendonBioprintingRecoveryPlan('uo_ducks', 'Achilles Tendon');
    expect(plan.partnerId).toBe('uo_ducks');
    expect(plan.partnerName).toContain('Oregon');
    expect(plan.scaffoldType).toBe('Knight Campus VAM Hydrogel');
    expect(plan.targetAnatomy).toBe('Achilles Tendon');
    expect(plan.phases.length).toBe(4);
    expect(plan.phases[0].biographeneResonanceBenchmarkHz).toContain('Delta f: -800 to -14,500 Hz');
    expect(plan.phases[2].trackKinematicsTarget).toContain('Hayward Field');
    expect(plan.phases[3].allowedMicroStrainPercent).toBe(10.0);
  });

  it('7. Computes scaffold mechanotransduction safety and collagen alignment scores', () => {
    // Early post-implant (Day 7) with low strain: should be safe
    const early = service.computeScaffoldMechanotransductionScore(1.2, 1.0, 7);
    expect(early.isSafeForProgressiveLoading).toBe(true);
    expect(early.ruptureRiskPercent).toBeLessThan(25);
    expect(early.maturationIndexPercent).toBeLessThan(20);

    // Overload on Day 14 with high strain (8%): should warn critical overload
    const overload = service.computeScaffoldMechanotransductionScore(8.0, 1.5, 14);
    expect(overload.isSafeForProgressiveLoading).toBe(false);
    expect(overload.ruptureRiskPercent).toBeGreaterThan(50);
    expect(overload.recommendation).toContain('CRITICAL OVERLOAD');

    // Mature graft on Day 90 with optimal stimulus: should be safe with high alignment
    const mature = service.computeScaffoldMechanotransductionScore(4.5, 1.2, 90);
    expect(mature.isSafeForProgressiveLoading).toBe(true);
    expect(mature.collagenAlignmentScorePercent).toBeGreaterThan(80);
  });
});

