/**
 * @file decision-curve-viewer.component.spec.ts
 * @description Unit test suite for DecisionCurveViewerComponent.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecisionCurveViewerComponent } from './decision-curve-viewer.component';

describe('DecisionCurveViewerComponent', () => {
  let component: DecisionCurveViewerComponent;
  let fixture: ComponentFixture<DecisionCurveViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecisionCurveViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DecisionCurveViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should instantiate the component with default DCA tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('dca');
  });

  it('should compute DCA summary and polylines', () => {
    const dca = component.dcaData();
    expect(dca.curvePoints.length).toBeGreaterThan(0);
    expect(component.modelPolyline().length).toBeGreaterThan(0);
    expect(component.treatAllPolyline().length).toBeGreaterThan(0);
  });

  it('should toggle tabs between dca, kl, bilateral, and prospect', () => {
    component.activeTab.set('kl');
    fixture.detectChanges();
    expect(component.klResult().prioritizedDifferential.length).toBeGreaterThan(0);

    component.activeTab.set('bilateral');
    fixture.detectChanges();
    expect(component.bilateralReport().dominantSide).toBe('Left Dominant');

    component.activeTab.set('prospect');
    fixture.detectChanges();
    expect(component.prospectProfile().lossAversionLambda).toBeGreaterThan(1.0);
  });
});
