import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalContextModeSwitcherComponent } from './clinical-context-mode-switcher.component';
import { ClinicalContextModeService } from '../services/clinical-context-mode.service';

describe('ClinicalContextModeSwitcherComponent', () => {
  let component: ClinicalContextModeSwitcherComponent;
  let fixture: ComponentFixture<ClinicalContextModeSwitcherComponent>;
  let modeService: ClinicalContextModeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalContextModeSwitcherComponent],
      providers: [ClinicalContextModeService]
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalContextModeSwitcherComponent);
    component = fixture.componentInstance;
    modeService = TestBed.inject(ClinicalContextModeService);
    fixture.detectChanges();
  });

  it('should create the mode switcher component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch mode when button is clicked', () => {
    component.selectMode('school_safety');
    fixture.detectChanges();

    expect(modeService.activeMode()).toBe('school_safety');
    expect(modeService.currentConfig().badge).toContain('Section 504');
  });
});
