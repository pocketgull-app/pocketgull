import { ComponentDrilldownUnitComponent } from './component-drilldown-unit.component';

describe('ComponentDrilldownUnitComponent', () => {
  const component = new ComponentDrilldownUnitComponent();

  it('1. Starts closed with null targetComponent', () => {
    expect(component.targetComponent()).toBeNull();
  });

  it('2. Opens drilldown target and supports Tri-Lens toggle', () => {
    component.open('biomarkers');
    expect(component.targetComponent()).toBe('biomarkers');
    expect(component.title()).toContain('Biomarker');

    component.activeLens.set('biophysics');
    expect(component.lensDescription()).toContain('Biophysics');

    component.close();
    expect(component.targetComponent()).toBeNull();
  });

  it('3. Supports opening new Kaggle and Network targets', () => {
    component.open('kaggle');
    expect(component.title()).toContain('Kaggle');

    component.open('network');
    expect(component.title()).toContain('Clinician Peer');
  });
});
