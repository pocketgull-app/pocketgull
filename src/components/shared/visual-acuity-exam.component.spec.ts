import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { VisualAcuityExamComponent } from './visual-acuity-exam.component';
import { TumblingEDirection } from '../../services/visual-acuity.service';

describe('VisualAcuityExamComponent Unit Suite', () => {
  let component: VisualAcuityExamComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualAcuityExamComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(VisualAcuityExamComponent);
    component = fixture.componentInstance;
  });

  it('1. Instantiates successfully with CALIBRATION stage', () => {
    expect(component).toBeTruthy();
    expect(component.stage()).toBe('CALIBRATION');
    expect(component.cardWidthPx()).toBe(320);
    expect(component.distanceCm()).toBe(50);
    expect(component.testedEye()).toBe('OU');
  });

  it('2. Updates calibration card width and viewing distance', () => {
    component.distanceCm.set(100);
    expect(component.distanceCm()).toBe(100);

    const inputEvent = { target: { value: '380' } } as unknown as Event;
    component.onCardWidthChange(inputEvent);
    expect(component.cardWidthPx()).toBe(380);
    expect(component.currentOptotypeHeightPx()).toBeGreaterThan(0);
  });

  it('3. Starts acuity test and transitions to ACUITY stage', () => {
    component.startAcuityTest();
    expect(component.stage()).toBe('ACUITY');
    expect(component.currentLineIndex()).toBe(0);
    expect(component.currentQuestionIndex()).toBe(0);
    expect(['UP', 'DOWN', 'LEFT', 'RIGHT']).toContain(component.currentDirection());
  });

  it('4. Handles correct and incorrect answers during acuity stage', () => {
    component.startAcuityTest();
    const correctDir = component.currentDirection();

    component.submitAnswer(correctDir);
    expect(component.correctInLine()).toBe(1);
    expect(component.currentQuestionIndex()).toBe(1);
  });

  it('5. Transitions through astigmatism, amsler, and ishihara to results', () => {
    component.submitAstigmatism(false);
    expect(component.stage()).toBe('AMSLER');
    expect(component.astigmatismNoted()).toBe(false);

    component.nextToIshihara();
    expect(component.stage()).toBe('ISHIHARA');

    const correctAnswer = component.currentIshiharaPlate().correctAnswer;
    component.submitIshihara(correctAnswer);
    expect(component.stage()).toBe('RESULTS');
    expect(component.result()).toBeTruthy();
    expect(component.result()?.snellenFraction).toBeDefined();
  });

  it('6. Calculates rotation transforms for all Tumbling E directions', () => {
    expect(component.getRotationTransform('RIGHT')).toBe('rotate(0deg)');
    expect(component.getRotationTransform('DOWN')).toBe('rotate(90deg)');
    expect(component.getRotationTransform('LEFT')).toBe('rotate(180deg)');
    expect(component.getRotationTransform('UP')).toBe('rotate(270deg)');
  });

  it('7. Resets exam to initial calibration state', () => {
    component.submitAstigmatism(true);
    expect(component.stage()).toBe('AMSLER');

    component.restartExam();
    expect(component.stage()).toBe('CALIBRATION');
    expect(component.result()).toBeNull();
  });
});
