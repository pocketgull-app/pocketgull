import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MaternalPostpartumLensTabComponent } from './maternal-postpartum-lens-tab.component';
import { MaternalPostpartumService } from '../../services/maternal-postpartum.service';
import { ReproductiveAutonomyService } from '../../services/reproductive-autonomy.service';
import { SovereigntyHealthModelsService } from '../../services/sovereignty-health-models.service';

describe('MaternalPostpartumLensTabComponent Unit Suite', () => {
  let component: MaternalPostpartumLensTabComponent;
  let mockMaternal: any;
  let mockRepro: any;
  let mockSovereignty: any;

  beforeEach(async () => {
    mockMaternal = {
      lookupLactMedSafety: vi.fn().mockReturnValue({
        drugName: 'Sertraline',
        category: 'Antidepressant',
        riskTier: 'L2 — Safer',
        relativeInfantDosePercent: 2.1,
        milkPlasmaRatio: 0.8,
        clinicalSummary: 'Minimal excretion into breast milk.'
      }),
      epdsResponses: signal(Array(10).fill(0)),
      epdsTotalScore: signal(3),
      setEpdsAnswer: vi.fn()
    };

    mockRepro = {
      patientMedicalRiskFactors: signal(['Migraine with Aura']),
      setRiskFactor: vi.fn(),
      recommendedModalities: signal([])
    };

    mockSovereignty = {
      selectedSovereigntyJurisdiction: signal('US-Federal-Safe-Harbor')
    };

    await TestBed.configureTestingModule({
      imports: [MaternalPostpartumLensTabComponent],
      providers: [
        { provide: MaternalPostpartumService, useValue: mockMaternal },
        { provide: ReproductiveAutonomyService, useValue: mockRepro },
        { provide: SovereigntyHealthModelsService, useValue: mockSovereignty }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MaternalPostpartumLensTabComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with autonomy as default section', () => {
    expect(component).toBeTruthy();
    expect(component.activeSection()).toBe('autonomy');
    expect(component.searchMedName()).toBe('Sertraline');
    expect(component.riskFactorOptions.length).toBe(5);
    expect(component.epdsQuestionLabels.length).toBe(10);
  });

  it('2. Looks up LactMed safety profile for medication', () => {
    const med = component.activeLactMed();
    expect(med).toBeDefined();
    expect(med!.drugName).toBe('Sertraline');
    expect(med!.riskTier).toBe('L2 — Safer');
    expect(mockMaternal.lookupLactMedSafety).toHaveBeenCalledWith('Sertraline');
  });

  it('3. Computes correct CSS badge classes for LactMed safety tiers', () => {
    expect(component.getLactMedBadgeClass('L1')).toContain('text-emerald-300');
    expect(component.getLactMedBadgeClass('L2')).toContain('text-emerald-300');
    expect(component.getLactMedBadgeClass('L3')).toContain('text-amber-300');
    expect(component.getLactMedBadgeClass('L4')).toContain('text-rose-300');
  });

  it('4. Computes correct CSS badge classes for WHO MEC scores', () => {
    expect(component.getMecBadgeClass(1)).toContain('text-emerald-300');
    expect(component.getMecBadgeClass(4)).toBeDefined();
  });

  it('5. Toggles risk factor via reproductive autonomy service', () => {
    component.toggleRisk('Migraine with Aura');
    expect(mockRepro.setRiskFactor).toHaveBeenCalledWith('Migraine with Aura', false);
  });

  it('6. Switches between autonomy and postpartum tabs', () => {
    component.activeSection.set('postpartum');
    expect(component.activeSection()).toBe('postpartum');
  });
});
