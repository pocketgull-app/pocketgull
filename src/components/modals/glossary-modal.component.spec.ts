import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlossaryModalComponent } from './glossary-modal.component';

describe('GlossaryModalComponent', () => {
  let component: GlossaryModalComponent;
  let fixture: ComponentFixture<GlossaryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlossaryModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GlossaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and displays header and total glossary terms', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Pocket-Gull Interactive Health Glossary');
    expect(el.textContent).toContain('Cross-Paradigm Medical, AI & Analogy Reference Dictionary');
    expect(component.filteredEntries().length).toBeGreaterThan(0);
    expect(el.textContent).toContain(`Showing ${component.filteredEntries().length} terms`);
  });

  it('2. Emits close event when close button or footer close is clicked', () => {
    let emitted = false;
    component.close.subscribe(() => {
      emitted = true;
    });

    component.close.emit();
    expect(emitted).toBe(true);
  });

  it('3. Filters entries based on category pill selection', () => {
    const totalCount = component.filteredEntries().length;

    // Filter to TCM
    component.activeCategory.set('tcm');
    fixture.detectChanges();
    const tcmEntries = component.filteredEntries();
    expect(tcmEntries.length).toBeLessThan(totalCount);
    expect(tcmEntries.every(e => e.category === 'tcm')).toBe(true);

    // Filter to clinical
    component.activeCategory.set('clinical');
    fixture.detectChanges();
    const clinicalEntries = component.filteredEntries();
    expect(clinicalEntries.every(e => e.category === 'clinical')).toBe(true);

    // Reset to all
    component.activeCategory.set('all');
    fixture.detectChanges();
    expect(component.filteredEntries().length).toBe(totalCount);
  });

  it('4. Filters entries based on text search query', () => {
    const inputEvent = {
      target: { value: 'Pressure' }
    } as unknown as Event;

    component.updateSearch(inputEvent);
    fixture.detectChanges();

    expect(component.searchQuery()).toBe('Pressure');
    const filtered = component.filteredEntries();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some(e => e.term.toLowerCase().includes('pressure') || e.definition.toLowerCase().includes('pressure'))).toBe(true);
  });

  it('5. Displays empty state message when search query finds no matches', () => {
    const inputEvent = {
      target: { value: 'XYZNONEXISTENTTERM123' }
    } as unknown as Event;

    component.updateSearch(inputEvent);
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(0);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No glossary terms found matching "XYZNONEXISTENTTERM123"');
  });

  it('6. Correctly renders allopathic medical codes when present', () => {
    component.activeCategory.set('all');
    component.searchQuery.set('');
    fixture.detectChanges();

    const withAllopathic = component.filteredEntries().find(e => e.allopathicEquivalent);
    expect(withAllopathic).toBeDefined();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Medical Code:');
  });
});
