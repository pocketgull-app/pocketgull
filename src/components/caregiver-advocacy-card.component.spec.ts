import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaregiverAdvocacyCardComponent } from './caregiver-advocacy-card.component';
import { CaregiverReliefService } from '../services/caregiver-relief.service';

describe('CaregiverAdvocacyCardComponent', () => {
  let component: CaregiverAdvocacyCardComponent;
  let fixture: ComponentFixture<CaregiverAdvocacyCardComponent>;
  let caregiverService: CaregiverReliefService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaregiverAdvocacyCardComponent],
      providers: [CaregiverReliefService]
    }).compileComponents();

    fixture = TestBed.createComponent(CaregiverAdvocacyCardComponent);
    component = fixture.componentInstance;
    caregiverService = TestBed.inject(CaregiverReliefService);
    fixture.detectChanges();
  });

  it('1. Initializes and renders Family Caregiver Shadow Portal header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Family Caregiver Shadow Portal & Respite Shield');
    expect(el.textContent).toContain('Intergenerational Dignity • Seven Generations');
  });

  it('2. Defaults role to ADULT_CHILD and manages role signal', () => {
    expect(component.selectedRole()).toBe('ADULT_CHILD');
    component.selectedRole.set('SPOUSE');
    expect(component.selectedRole()).toBe('SPOUSE');
  });

  it('3. Assesses caregiver wellbeing based on burnout score and sleep hours', () => {
    component.burnoutScore.set(3);
    component.sleepHours.set(8);
    let status = component.caregiverStatus();
    expect(status.riskLevel).toBe('LOW');

    component.burnoutScore.set(9);
    component.sleepHours.set(4);
    status = component.caregiverStatus();
    expect(status.riskLevel).toBe('CRITICAL_BURNOUT');
  });

  it('4. Records a new shift memo and resets input field', () => {
    const recordSpy = vi.spyOn(caregiverService, 'recordShiftMemo');
    component.quickMemoInput.set('Patient had breakfast and walked with cane.');
    component.recordCurrentMemo();

    expect(recordSpy).toHaveBeenCalledWith('Patient had breakfast and walked with cane.', 'ADULT_CHILD');
    expect(component.quickMemoInput()).toBe('');
  });

  it('5. Ignores empty shift memo submissions', () => {
    const recordSpy = vi.spyOn(caregiverService, 'recordShiftMemo');
    component.quickMemoInput.set('   ');
    component.recordCurrentMemo();

    expect(recordSpy).not.toHaveBeenCalled();
  });
});
