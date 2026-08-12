import '@angular/compiler';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ElementRef, Renderer2, createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { PatientEducationFlipDirective, IPatientEducationFlipData } from './patient-education-flip.directive';
import { DoubleFlipStateMachineService } from '../services/double-flip-state-machine.service';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';

describe('PatientEducationFlipDirective Unit Suite', () => {
  let directive: PatientEducationFlipDirective;
  let stateMachine: DoubleFlipStateMachineService;
  let elementRefMock: ElementRef;
  let rendererMock: Renderer2;
  let hapticsMock: BioHapticFeedbackService;

  beforeEach(() => {
    stateMachine = new DoubleFlipStateMachineService();

    const mockNativeElement = {
      id: 'test_card_1',
      style: {},
      classList: new Set<string>()
    };

    elementRefMock = { nativeElement: mockNativeElement } as ElementRef;

    rendererMock = {
      setStyle: vi.fn((el, prop, val) => { el.style[prop] = val; }),
      addClass: vi.fn((el, cls) => { el.classList.add(cls); }),
      removeClass: vi.fn((el, cls) => { el.classList.delete(cls); })
    } as unknown as Renderer2;

    hapticsMock = {
      triggerDualPulse: vi.fn()
    } as unknown as BioHapticFeedbackService;

    const injector = createEnvironmentInjector([
      { provide: ElementRef, useValue: elementRefMock },
      { provide: Renderer2, useValue: rendererMock },
      { provide: DoubleFlipStateMachineService, useValue: stateMachine },
      { provide: BioHapticFeedbackService, useValue: hapticsMock }
    ], undefined as any);

    directive = runInInjectionContext(injector, () => new PatientEducationFlipDirective());
  });

  it('should initialize directive with perspective 1000px', () => {
    expect(directive).toBeTruthy();
    expect(rendererMock.setStyle).toHaveBeenCalledWith(elementRefMock.nativeElement, 'perspective', '1000px');
  });

  it('should confirm flip on double click safety interlock', () => {
    expect(directive.isFlipped()).toBe(false);

    // Click 1 -> PENDING_SECOND_CLICK
    stateMachine.registerClick('test_card_1');

    // Click 2 -> CONFIRMED_ACTION
    directive.onDblClick({ stopPropagation: vi.fn() } as any);

    expect(directive.isFlipped()).toBe(true);
    expect(hapticsMock.triggerDualPulse).toHaveBeenCalledWith(25, 40, 25);
    expect(rendererMock.setStyle).toHaveBeenCalledWith(elementRefMock.nativeElement, 'transform', 'rotateY(180deg)');
  });
});
