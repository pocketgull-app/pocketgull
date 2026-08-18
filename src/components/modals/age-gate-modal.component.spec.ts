import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgeGateModalComponent } from './age-gate-modal.component';
import { AgeGateService, UserAgeTier } from '../../services/age-gate.service';

describe('AgeGateModalComponent', () => {
  let component: AgeGateModalComponent;
  let fixture: ComponentFixture<AgeGateModalComponent>;
  let mockAgeGateService: any;

  beforeEach(async () => {
    mockAgeGateService = {
      selectTier: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AgeGateModalComponent],
      providers: [
        { provide: AgeGateService, useValue: mockAgeGateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgeGateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the age gate modal component', () => {
    expect(component).toBeTruthy();
  });

  it('should call selectTier on service and emit tierSelected output on selection', () => {
    let emittedTier: UserAgeTier | null = null;
    component.tierSelected.subscribe((tier: UserAgeTier) => {
      emittedTier = tier;
    });

    component.selectTier('parent');

    expect(mockAgeGateService.selectTier).toHaveBeenCalledWith('parent');
    expect(emittedTier).toBe('parent');
  });

  it('should allow selecting all 4 tiers', () => {
    component.selectTier('adult');
    expect(mockAgeGateService.selectTier).toHaveBeenCalledWith('adult');

    component.selectTier('clinician');
    expect(mockAgeGateService.selectTier).toHaveBeenCalledWith('clinician');

    component.selectTier('minor');
    expect(mockAgeGateService.selectTier).toHaveBeenCalledWith('minor');
  });
});
