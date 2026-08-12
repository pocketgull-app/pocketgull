import {
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  HostListener,
  Renderer2,
  inject,
  signal,
  computed
} from '@angular/core';
import { DoubleFlipStateMachineService } from '../services/double-flip-state-machine.service';
import { BioHapticFeedbackService } from '../services/hardware/bio-haptic-feedback.service';

export interface IPatientEducationFlipData {
  title: string;
  gradeLevel?: string;
  diagnosis: string;
  analogy?: string;
  socraticInquiry?: string;
  spanishTranslation?: string;
  homeCareSteps?: string[];
}

@Directive({
  selector: '[appPatientEducationFlip]',
  standalone: true
})
export class PatientEducationFlipDirective {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly stateMachine = inject(DoubleFlipStateMachineService);
  private readonly haptics = inject(BioHapticFeedbackService);

  @Input('appPatientEducationFlip') educationData: IPatientEducationFlipData | string | null = null;
  @Input() flipElementId = '';
  @Output() cardFlipped = new EventEmitter<boolean>();

  readonly isFlipped = signal<boolean>(false);

  constructor() {
    // Add base 3D perspective styles to host element
    this.renderer.setStyle(this.el.nativeElement, 'perspective', '1000px');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'transform 0.4s ease-in-out');
  }

  @HostListener('dblclick', ['$event'])
  onDblClick(event: MouseEvent): void {
    event.stopPropagation();
    const targetId = this.flipElementId || this.el.nativeElement.id || 'gen_flip_' + Math.random().toString(36).substring(2, 7);

    // 1. Double-Click Safety Interlock (300ms confirmation window)
    const result = this.stateMachine.registerClick(targetId);

    if (result === 'CONFIRMED_ACTION') {
      // 2. Trigger Double-Flip Bistable State Machine
      this.stateMachine.triggerDoubleFlip();

      // 3. Tactile Dual-Pulse Haptic Feedback
      this.haptics.triggerDualPulse(25, 40, 25);

      // 4. Toggle Flip Signal State
      const newState = !this.isFlipped();
      this.isFlipped.set(newState);

      // 5. Apply 3D CSS Card Flip Animation
      if (newState) {
        this.renderer.addClass(this.el.nativeElement, 'patient-lens-flipped');
        this.renderer.setStyle(this.el.nativeElement, 'transform', 'rotateY(180deg)');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'patient-lens-flipped');
        this.renderer.setStyle(this.el.nativeElement, 'transform', 'rotateY(0deg)');
      }

      this.cardFlipped.emit(newState);
    }
  }

  /**
   * Programmatically trigger flip state
   */
  toggleFlip(): void {
    const newState = !this.isFlipped();
    this.isFlipped.set(newState);
    if (newState) {
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'rotateY(180deg)');
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'transform', 'rotateY(0deg)');
    }
    this.cardFlipped.emit(newState);
  }
}
