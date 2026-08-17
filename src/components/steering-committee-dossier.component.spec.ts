import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SteeringCommitteeDossierComponent } from './steering-committee-dossier.component';
import { ClinicalSteeringCommitteeDossierService } from '../services/clinical-steering-committee-dossier.service';

describe('SteeringCommitteeDossierComponent', () => {
  let component: SteeringCommitteeDossierComponent;
  let fixture: ComponentFixture<SteeringCommitteeDossierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SteeringCommitteeDossierComponent],
      providers: [ClinicalSteeringCommitteeDossierService]
    }).compileComponents();

    fixture = TestBed.createComponent(SteeringCommitteeDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the steering committee dossier component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute the governance dossier with FDA 520o and Cochrane metrics', () => {
    const d = component.dossier();
    expect(d).toBeDefined();
    expect(d.fdaSection520oComplianceScore).toBeGreaterThanOrEqual(99);
    expect(d.cochraneEvidenceTiers.tierA_RCTsPercent).toBeGreaterThan(70);
    expect(d.regulatoryComplianceMatrix.length).toBeGreaterThanOrEqual(5);
  });
});
