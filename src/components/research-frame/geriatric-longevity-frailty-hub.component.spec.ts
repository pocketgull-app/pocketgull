import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GeriatricLongevityFrailtyHubComponent } from './geriatric-longevity-frailty-hub.component';
import { PatientStateService } from '../../services/patient-state.service';

describe('GeriatricLongevityFrailtyHubComponent Suite', () => {
  let component: GeriatricLongevityFrailtyHubComponent;
  let fixture: ComponentFixture<GeriatricLongevityFrailtyHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeriatricLongevityFrailtyHubComponent],
      providers: [PatientStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(GeriatricLongevityFrailtyHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes GeriatricLongevityFrailtyHubComponent with Geriatric 5Ms and default frailty tier', () => {
    expect(component).toBeTruthy();
    expect(component.fiveMs.length).toBe(5);
    expect(component.frailtyScore()).toBe(2);
    expect(component.frailtyTier()).toBe('Fit & Resilient');
  });

  it('2. Switches between Geriatric 5Ms tabs (Mind, Mobility, Medications, Complexity, Matters Most)', () => {
    component.activeM.set('MOBILITY');
    fixture.detectChanges();
    expect(component.activeM()).toBe('MOBILITY');

    component.activeM.set('MIND');
    fixture.detectChanges();
    expect(component.activeM()).toBe('MIND');
  });

  it('3. Contains AGS 2023 Beers Criteria warnings with safer de-prescribing alternatives', () => {
    const warnings = component.beersWarnings;
    expect(warnings.length).toBeGreaterThanOrEqual(3);

    const antihistamine = warnings.find(w => w.riskCategory === 'HIGH_ANTICHOLINERGIC');
    expect(antihistamine).toBeDefined();
    expect(antihistamine?.saferAlternatives.length).toBeGreaterThan(0);
  });

  it('4. Emits selectQuery output when steering AGS evidence', () => {
    let emitted: { query: string; engine: 'pubmed' | 'gse' | 'google' } | undefined;
    component.selectQuery.subscribe((event) => {
      emitted = event;
    });

    const agsTopic = component.evidenceTopics.find(t => t.id === 'ags-beers-2023');
    expect(agsTopic).toBeDefined();

    component.steerEvidence(agsTopic!);

    expect(emitted).toBeDefined();
    expect(emitted?.engine).toBe('pubmed');
    expect(emitted?.query).toContain('Beers Criteria');
  });
});
