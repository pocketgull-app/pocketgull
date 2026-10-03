import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompassionateNutritionCardComponent } from './compassionate-nutrition-card.component';
import { CompassionateNutritionHeritageService } from '../../services/compassionate-nutrition-heritage.service';

describe('CompassionateNutritionCardComponent', () => {
  let fixture: ComponentFixture<CompassionateNutritionCardComponent>;
  let component: CompassionateNutritionCardComponent;
  let service: CompassionateNutritionHeritageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompassionateNutritionCardComponent],
      providers: [CompassionateNutritionHeritageService]
    }).compileComponents();

    fixture = TestBed.createComponent(CompassionateNutritionCardComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(CompassionateNutritionHeritageService);
    fixture.detectChanges();
  });

  it('1. should create and render 5 cultural traditions', () => {
    expect(component).toBeTruthy();
    expect(component.traditions.length).toBe(5);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Compassionate Nutrition & Cultural Foodways');
    expect(el.textContent).toContain('African Heritage');
    expect(el.textContent).toContain('Latino & Mesoamerican');
    expect(el.textContent).toContain('Asian Traditional');
    expect(el.textContent).toContain('Mediterranean');
    expect(el.textContent).toContain('Indigenous Turtle Island');
  });

  it('2. should render default African Heritage swaps and gut barrier metrics', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(service.selectedTradition()).toBe('AFRICAN_HERITAGE');
    expect(el.textContent).toContain('Ancient Fonio Grain or Sorghum');
    expect(el.textContent).toContain('Collard Greens');
    expect(el.textContent).toContain('Zonulin Barrier Risk');
    expect(el.textContent).toContain('SCFA Butyrate Yield');
  });

  it('3. should update swaps and active class when tradition is switched', () => {
    service.setTradition('LATINO_MESOAMERICAN');
    fixture.detectChanges();

    expect(service.selectedTradition()).toBe('LATINO_MESOAMERICAN');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nixtamalized Heirloom');
    expect(el.textContent).toContain('Nopal Cactus');
  });

  it('4. should render Asian Traditional swaps with black forbidden rice and miso', () => {
    service.setTradition('ASIAN_TRADITIONAL');
    fixture.detectChanges();

    const swaps = service.activeHeritageSwaps();
    expect(swaps.length).toBeGreaterThan(0);
    expect(swaps[0].nourishingWholeFoodSwap).toContain('Forbidden Rice');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Forbidden Rice');
  });

  it('5. should update gut barrier assessment when service intake changes', () => {
    service.updateIntake(35, 3, 4, false);
    fixture.detectChanges();

    const assessment = service.gutBarrierAssessment();
    expect(assessment.estimatedZonulinRisk).toBe('Low (Intact Mucosa)');
    expect(assessment.butyrateSynthesizingCapacity).toBe('Peak Protective');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Low (Intact Mucosa)');
    expect(el.textContent).toContain('Peak Protective');
  });
});
