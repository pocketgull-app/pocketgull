import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StanfordHciClinicalLensComponent } from './stanford-hci-clinical-lens.component';
import { StanfordHciClinicalLensService } from '../services/stanford-hci-clinical-lens.service';

describe('StanfordHciClinicalLensComponent', () => {
  let component: StanfordHciClinicalLensComponent;
  let fixture: ComponentFixture<StanfordHciClinicalLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StanfordHciClinicalLensComponent],
      providers: [StanfordHciClinicalLensService]
    }).compileComponents();

    fixture = TestBed.createComponent(StanfordHciClinicalLensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch active Stanford HCI principle on click', () => {
    component.hci.selectPrinciple(2);
    fixture.detectChanges();
    expect(component.hci.currentPrinciple().name).toContain('Artful 3D');
  });
});
