import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KaizenQualitySuiteComponent } from './kaizen-quality-suite.component';

describe('KaizenQualitySuiteComponent', () => {
  let component: KaizenQualitySuiteComponent;
  let fixture: ComponentFixture<KaizenQualitySuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KaizenQualitySuiteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KaizenQualitySuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default ishikawa tab, 6 fishbone branches, and pareto actions', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('ishikawa');
    expect(component.fishboneBranches.length).toBe(6);
    expect(component.paretoActions.length).toBe(5);
    expect(component.spcPoints.length).toBe(7);
  });

  it('2. Switches activeTab between ishikawa, pareto, and spc', () => {
    component.activeTab.set('pareto');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('pareto');

    component.activeTab.set('spc');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('spc');

    component.activeTab.set('ishikawa');
    fixture.detectChanges();
    expect(component.activeTab()).toBe('ishikawa');
  });

  it('3. Renders all 6 Ishikawa fishbone branches with titles and root causes', () => {
    const titles = component.fishboneBranches.map(b => b.title);
    expect(titles).toContain('Genomics & Epigenetics');
    expect(titles).toContain('Biochemistry & Vitals');
    expect(titles).toContain('Environment & SDOH');
    expect(titles).toContain('Circadian & Sleep');
    expect(titles).toContain('Lifestyle & Nutrition');
    expect(titles).toContain('Pharmacology & Interventions');

    component.fishboneBranches.forEach(branch => {
      expect(branch.causes.length).toBeGreaterThan(0);
      expect(branch.icon).toBeTruthy();
    });
  });

  it('4. Renders Pareto 80/20 actions with high leverage and secondary groups', () => {
    const highLeverage = component.paretoActions.filter(a => a.leverageGroup === 'high_leverage_20');
    expect(highLeverage.length).toBe(3);

    const lastAction = component.paretoActions[component.paretoActions.length - 1];
    expect(lastAction.cumulativeImpact).toBe(100);
  });

  it('5. Exposes Statistical Process Control (SPC) data points within Shewhart limits', () => {
    expect(component.spcPoints.every(p => p.val >= 40 && p.val <= 80)).toBe(true);
  });
});
