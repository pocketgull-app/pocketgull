import '@angular/compiler';
import { expect, describe, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DeepSpaceCdsTerminalComponent } from './deep-space-cds-terminal.component';
import { DeepSpaceCdsService } from '../services/deep-space-cds.service';

describe('DeepSpaceCdsTerminalComponent Unit Suite', () => {
  let component: DeepSpaceCdsTerminalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeepSpaceCdsTerminalComponent],
      providers: [DeepSpaceCdsService],
    });

    component = TestBed.createComponent(DeepSpaceCdsTerminalComponent).componentInstance;
  });

  it('1. Initializes and renders default autonomous SANS triage state', () => {
    expect(component).toBeTruthy();
    expect(component.activeTriage()).not.toBeNull();
    expect(component.activeTriage()?.primaryDiagnosis).toContain('SANS');
  });

  it('2. Triggers emergency trauma protocol and dispenses TXA', () => {
    component.triggerEmergency('EVA_HEMORRHAGE_TRAUMA');
    const triage = component.activeTriage();
    expect(triage?.triageSeverity).toBe('STAT_EMERGENCY');
    expect(triage?.recommendedProtocolId).toBe('EVA_HEMORRHAGE_TRAUMA');
    expect(triage?.formularyItemsToDispense.some(d => d.drugName.includes('Tranexamic Acid'))).toBe(true);
  });

  it('3. Safely invokes transmitEarthBurst without throwing errors', () => {
    expect(() => component.transmitEarthBurst()).not.toThrow();
  });
});
