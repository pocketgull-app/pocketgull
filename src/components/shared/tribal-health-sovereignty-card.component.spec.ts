import '@angular/compiler';
import { TribalHealthSovereigntyCardComponent } from './tribal-health-sovereignty-card.component';
import { TribalHealthSovereigntyService } from '../../services/tribal-health-sovereignty.service';
import { signal } from '@angular/core';

describe('TribalHealthSovereigntyCardComponent Suite', () => {
  let component: TribalHealthSovereigntyCardComponent;

  beforeEach(() => {
    const mockPatientState = {
      vitals: signal({
        bp: '120/80',
        hr: '72',
        temp: '98.6',
        spO2: '98',
        weight: '70',
        height: '175'
      }),
      issues: signal({})
    } as any;

    const mockService = new TribalHealthSovereigntyService(mockPatientState);
    component = new TribalHealthSovereigntyCardComponent(mockService);
  });

  it('1. Initializes with active Tribal Health Sovereignty Report and TIRB seal', () => {
    expect(component.report()).toBeDefined();
    expect(component.report().tribalIrbSeal).toMatch(/^TRIBAL-SOVEREIGN-SEAL-[0-9A-F]{8}$/);
    expect(component.report().carePrinciples.length).toBe(4);
    expect(component.report().botanicalCodexMatches.length).toBeGreaterThanOrEqual(6);
    expect(component.report().first1000DaysProtocol.length).toBe(6);
  });

  it('2. Supports tab switching across CARE principles, herbal codex, and maternal care', () => {
    expect(component.activeTab()).toBe('care');
    component.activeTab.set('herbs');
    expect(component.activeTab()).toBe('herbs');
    component.activeTab.set('maternal');
    expect(component.activeTab()).toBe('maternal');
  });
});
