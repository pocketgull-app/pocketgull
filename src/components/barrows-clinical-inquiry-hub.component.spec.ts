import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { BarrowsClinicalInquiryHubComponent } from './barrows-clinical-inquiry-hub.component';
import { BarrowsClinicalInquiryService } from '../services/barrows-clinical-inquiry.service';

describe('BarrowsClinicalInquiryHubComponent', () => {
  let component: BarrowsClinicalInquiryHubComponent;
  let service: BarrowsClinicalInquiryService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        BarrowsClinicalInquiryHubComponent,
        BarrowsClinicalInquiryService
      ]
    });

    component = runInInjectionContext(injector, () => injector.get(BarrowsClinicalInquiryHubComponent));
    service = injector.get(BarrowsClinicalInquiryService);
  });

  it('1. Initializes and defaults to hypotheses tab', () => {
    expect(component).toBeTruthy();
    expect(component.activeTab()).toBe('hypotheses');
    expect(component.hypotheses().length).toBeGreaterThanOrEqual(3);
  });

  it('2. Switches tabs between hypotheses, problem_list, and doctor_brief', () => {
    component.activeTab.set('problem_list');
    expect(component.activeTab()).toBe('problem_list');

    component.activeTab.set('doctor_brief');
    expect(component.activeTab()).toBe('doctor_brief');
  });

  it('3. Answers falsification question and updates hypothesis', () => {
    component.answerQuestion('hypo-2', 'YES');
    const hypo = component.hypotheses().find(h => h.id === 'hypo-2');
    expect(hypo?.falsificationStatus).toBe('SUPPORTED');
  });

  it('4. Resets working state when purgeSessionSlate is invoked', () => {
    component.answerQuestion('hypo-1', 'NO');
    component.purgeSessionSlate();

    expect(component.activeTab()).toBe('hypotheses');
    const hypo1 = component.hypotheses().find(h => h.id === 'hypo-1');
    expect(hypo1?.falsificationStatus).toBe('UNTESTED');
  });

  it('5. Attempts clipboard copy of doctor brief', async () => {
    await component.copyBriefToClipboard();
    expect(component.copyStatus()).toBeDefined();
  });
});
