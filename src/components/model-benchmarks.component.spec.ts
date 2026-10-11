import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModelBenchmarksComponent } from './model-benchmarks.component';

describe('ModelBenchmarksComponent', () => {
  let component: ModelBenchmarksComponent;
  let fixture: ComponentFixture<ModelBenchmarksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelBenchmarksComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModelBenchmarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders UK AISI Inspect AI header and badges', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('UK AISI Inspect AI Benchmark Matrix');
    expect(el.textContent).toContain('v1.41.0 Verified');
  });

  it('2. Renders all 4 model score cards including PocketGull 7.5B 100.0% Attending', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('PocketGull 7.5B');
    expect(el.textContent).toContain('100.0%');
    expect(el.textContent).toContain('PocketGull Edge 3.2B');
    expect(el.textContent).toContain('94.4%');
    expect(el.textContent).toContain('Meta Llama 3.2 3B');
    expect(el.textContent).toContain('Gemma 4 7B (Base)');
  });

  it('3. Filters benchmark vectors dynamically by category', () => {
    expect(component.selectedCategory()).toBe('all');
    const initialCount = component.filteredVectors().length;
    expect(initialCount).toBe(10);

    component.selectedCategory.set('clinical');
    fixture.detectChanges();
    expect(component.filteredVectors().length).toBe(2);

    component.selectedCategory.set('safety');
    fixture.detectChanges();
    expect(component.filteredVectors().length).toBe(4);

    component.selectedCategory.set('humanitarian');
    fixture.detectChanges();
    expect(component.filteredVectors().length).toBe(4);
  });

  it('4. Correctly validates PocketGull 100% score on ISMP Trailing Zero and USMLE', () => {
    const vectors = component.vectors();
    const ismp = vectors.find(v => v.id === 'ismp-trailing-zero');
    expect(ismp).toBeDefined();
    expect(ismp?.pocketgullClinical).toBe(1.00);
    expect(ismp?.llama32).toBe(0.00);

    const usmle = vectors.find(v => v.id === 'usmle-rv-stemi');
    expect(usmle).toBeDefined();
    expect(usmle?.pocketgullClinical).toBe(1.00);
    expect(usmle?.llama32).toBe(0.50);
  });
});
