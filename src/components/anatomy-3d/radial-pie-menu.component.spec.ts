import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { RadialPieMenuComponent, RadialPieAction } from './radial-pie-menu.component';

describe('RadialPieMenuComponent', () => {
  let component: RadialPieMenuComponent;

  beforeEach(() => {
    const injector = Injector.create({
      providers: []
    });

    component = runInInjectionContext(injector, () => new RadialPieMenuComponent());
    (component as any).x = () => 300;
    (component as any).y = () => 300;
    (component as any).partId = () => 'heart';
    (component as any).partName = () => 'Heart & Cardiovascular';
    (component as any).partIcon = () => '🫀';
  });

  it('should create and have correct input getters', () => {
    expect(component).toBeTruthy();
    expect(component.partId()).toBe('heart');
    expect(component.partName()).toBe('Heart & Cardiovascular');
    expect(component.partIcon()).toBe('🫀');
  });

  it('should emit actionSelected on selecting logSymptom action', () => {
    let emitted: { action: RadialPieAction; partId: string } | null = null;
    component.actionSelected.subscribe((val: any) => {
      emitted = val;
    });

    component.selectAction('logSymptom');
    expect(emitted).toEqual({ action: 'logSymptom', partId: 'heart' });
  });

  it('should emit actionSelected on selecting orderLab action', () => {
    let emitted: { action: RadialPieAction; partId: string } | null = null;
    component.actionSelected.subscribe((val: any) => {
      emitted = val;
    });

    component.selectAction('orderLab');
    expect(emitted).toEqual({ action: 'orderLab', partId: 'heart' });
  });

  it('should emit close on Escape key', () => {
    let closed = false;
    component.close.subscribe(() => {
      closed = true;
    });

    component.onEscapeKey(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toBe(true);
  });
});
