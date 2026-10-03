import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { WalkthroughTourComponent } from './walkthrough-tour.component';
import { WalkthroughTourService } from '../services/walkthrough-tour.service';

describe('WalkthroughTourComponent Unit Suite', () => {
  let component: WalkthroughTourComponent;
  let tourService: WalkthroughTourService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkthroughTourComponent],
      providers: [WalkthroughTourService]
    }).compileComponents();

    const fixture = TestBed.createComponent(WalkthroughTourComponent);
    component = fixture.componentInstance;
    tourService = TestBed.inject(WalkthroughTourService);
  });

  afterEach(() => {
    tourService.dismiss();
  });

  it('1. Instantiates successfully with inactive tour default', () => {
    expect(component).toBeTruthy();
    expect(tourService.isActive()).toBe(false);
    expect(component.rect()).toBeNull();
    expect(component.stepDef()).toBeNull();
  });

  it('2. Computes active step definition when tour starts', () => {
    tourService.forceStart('family-hero');
    expect(tourService.isActive()).toBe(true);
    expect(tourService.currentStep()).toBe(0);
    expect(component.stepDef()).toBeTruthy();
    expect(component.stepsArray().length).toBeGreaterThan(0);
    expect(component.isLastStep()).toBe(false);
  });

  it('3. Computes centre fallback card style when rect is null', () => {
    const style = component.cardStyle();
    expect(style.top).toBe('50%');
    expect(style.left).toBe('50%');
    expect(style.transform).toBe('translate(-50%, -50%)');
  });

  it('4. Computes card position when target rect is set', () => {
    tourService.forceStart('clinical-provider');
    component.rect.set({ top: 100, left: 200, width: 300, height: 150 });
    const style = component.cardStyle();
    expect(style.top).toBeDefined();
    expect(style.left).toBeDefined();
    expect(style.transform).toBe('none');
  });

  it('5. Advances and detects last step', () => {
    tourService.forceStart('family-hero');
    const totalSteps = component.stepsArray().length;
    tourService.currentStep.set(totalSteps - 1);
    expect(component.isLastStep()).toBe(true);
  });

  it('6. Handles backdrop clicks and dismisses', () => {
    tourService.forceStart('clinical-provider');
    expect(tourService.isActive()).toBe(true);

    const dismissSpy = vi.spyOn(tourService, 'dismiss');
    const dummyEl = document.createElement('div');
    dummyEl.classList.add('tour-backdrop');
    component.onBackdropClick({ target: dummyEl } as unknown as MouseEvent);
    expect(dismissSpy).toHaveBeenCalled();
  });
});
