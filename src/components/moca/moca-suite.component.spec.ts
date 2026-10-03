import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { MocaSuiteComponent } from './moca-suite.component';
import { MocaAssessmentService } from '../../services/moca/moca-assessment.service';

describe('MocaSuiteComponent Unit Suite', () => {
  let component: MocaSuiteComponent;
  let mocaSvc: MocaAssessmentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MocaSuiteComponent],
      providers: [
        MocaAssessmentService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MocaSuiteComponent);
    component = fixture.componentInstance;
    mocaSvc = TestBed.inject(MocaAssessmentService);
  });

  it('1. Instantiates successfully with initial activeStepId as visuospatial', () => {
    expect(component).toBeTruthy();
    expect(component.activeStepId()).toBe('visuospatial');
    expect(component.steps.length).toBe(9);
  });

  it('2. Navigates between cognitive assessment steps', () => {
    component.activeStepId.set('naming');
    expect(component.activeStepId()).toBe('naming');

    component.activeStepId.set('orientation');
    expect(component.activeStepId()).toBe('orientation');
  });

  it('3. Handles sequential trail-making node clicks correctly', () => {
    expect(component.trailPath()).toEqual([]);
    
    // Click correct first node '1'
    const node1 = component.trailNodes.find(n => n.id === '1')!;
    component.onTrailNodeClick(node1);
    expect(component.trailPath()).toEqual(['1']);
    expect(component.isNodeInPath('1')).toBe(true);

    // Click correct second node 'A'
    const nodeA = component.trailNodes.find(n => n.id === 'A')!;
    component.onTrailNodeClick(nodeA);
    expect(component.trailPath()).toEqual(['1', 'A']);

    // Click incorrect node 'C' -> triggers toast error
    const nodeC = component.trailNodes.find(n => n.id === 'C')!;
    component.onTrailNodeClick(nodeC);
    expect(component.trailPath()).toEqual(['1', 'A']);
    expect(component.toastMessage()).toContain('Incorrect sequence');
  });

  it('4. Provides orientation checklist items with standard values', () => {
    expect(component.orientationItems.length).toBe(6);
    const dateItem = component.orientationItems.find(i => i.key === 'date');
    expect(dateItem).toBeDefined();
    expect(typeof dateItem!.getValue()).toBe('string');
  });

  it('5. Toggles clock guide visibility signal', () => {
    expect(component.showClockGuide()).toBe(true);
    component.showClockGuide.set(false);
    expect(component.showClockGuide()).toBe(false);
  });
});
