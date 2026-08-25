import '@angular/compiler';
import { TalentHrPortalComponent } from './talent-hr-portal.component';

describe('TalentHrPortalComponent', () => {
  let component: TalentHrPortalComponent;

  beforeEach(() => {
    component = new TalentHrPortalComponent();
  });

  it('1. Initializes with 6 domain tracks and defaults to allopathic-icu', () => {
    expect(component.domainTracks.length).toBe(6);
    expect(component.selectedTrackId()).toBe('allopathic-icu');
    expect(component.activeTrack().title).toBe('Allopathic & ICU Critical Care');
  });

  it('2. Switches active track and computes correct metadata', () => {
    component.selectTrack('pharmacogenomics');
    expect(component.selectedTrackId()).toBe('pharmacogenomics');
    expect(component.activeTrack().title).toBe('Pharmacogenomics & Toxicology');
    expect(component.activeTrack().badge).toBe('PharmD / Toxicologist');
    expect(component.applicantTrackTitle()).toBe('Pharmacogenomics & Toxicology');
  });

  it('3. Activates and applies clinical red-team critiques in sandbox', () => {
    expect(component.activeCritique()).toBeNull();

    component.applyRedTeamCritique('CONTRAINDICATION_OMISSION');
    expect(component.activeCritiqueType()).toBe('CONTRAINDICATION_OMISSION');
    expect(component.activeCritique()?.title).toContain('Renal Insufficiency');

    component.applyRedTeamCritique('CROSSWALK_GAP');
    expect(component.activeCritiqueType()).toBe('CROSSWALK_GAP');
    expect(component.activeCritique()?.title).toContain('Ayurvedic Ama');
  });

  it('4. Validates and submits specialist application form', () => {
    expect(component.isFormValid()).toBe(false);

    component.applicantName.set('Dr. Aris Thorne');
    component.applicantEmail.set('thorne@institution.edu');
    component.applicantDomain.set('Critical Care & Toxicology');
    component.applicantPrompt.set('I want to benchmark acute drug-drug interaction safety rails for renal failure patients.');

    expect(component.isFormValid()).toBe(true);

    component.submitApplication();
    expect(component.applicationSubmitted()).toBe(true);

    component.resetForm();
    expect(component.applicationSubmitted()).toBe(false);
    expect(component.applicantName()).toBe('');
  });
});
