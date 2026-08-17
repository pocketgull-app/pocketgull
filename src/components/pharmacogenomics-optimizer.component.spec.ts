import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacogenomicsOptimizerComponent } from './pharmacogenomics-optimizer.component';
import { PharmacogenomicsService } from '../services/pharmacogenomics.service';

describe('PharmacogenomicsOptimizerComponent', () => {
  let component: PharmacogenomicsOptimizerComponent;
  let fixture: ComponentFixture<PharmacogenomicsOptimizerComponent>;
  let pgxService: PharmacogenomicsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacogenomicsOptimizerComponent],
      providers: [PharmacogenomicsService]
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacogenomicsOptimizerComponent);
    component = fixture.componentInstance;
    pgxService = TestBed.inject(PharmacogenomicsService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display active profile variants and contraindications', () => {
    const profile = pgxService.activeProfile();
    expect(profile).toBeTruthy();
    expect(profile?.variants.length).toBe(6);
    expect(pgxService.contraindicatedCount()).toBeGreaterThan(0);
  });

  it('should emit close output when close is triggered', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.close.emit();
    expect(closed).toBe(true);
  });
});
