import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PocketgullIconComponent, ClinicalIconName } from './pocketgull-icon.component';

describe('PocketgullIconComponent', () => {
  let fixture: ComponentFixture<PocketgullIconComponent>;
  let component: PocketgullIconComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PocketgullIconComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketgullIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. should create and render default heart icon svg', () => {
    expect(component).toBeTruthy();
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.classList.contains('text-rose-500')).toBe(true);
  });

  it('2. should render origami seagull svg when name is seagull', () => {
    component.name = 'seagull';
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.classList.contains('text-amber-500')).toBe(true);
    const polygons = fixture.nativeElement.querySelectorAll('polygon');
    expect(polygons.length).toBeGreaterThanOrEqual(2);
  });

  it('3. should render lungs, brain, spine, tooth, and dna icons appropriately', () => {
    const iconNames: ClinicalIconName[] = ['lungs', 'brain', 'spine', 'tooth', 'dna', 'cgm', 'pill', 'shield'];
    for (const name of iconNames) {
      component.name = name;
      fixture.detectChanges();
      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeTruthy();
    }
  });

  it('4. should render fallback circle/clock icon for unhandled icon name', () => {
    component.name = 'unrecognized' as any;
    fixture.detectChanges();

    const circle = fixture.nativeElement.querySelector('circle');
    expect(circle).toBeTruthy();
  });
});
