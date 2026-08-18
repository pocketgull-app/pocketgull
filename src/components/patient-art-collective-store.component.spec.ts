import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PatientArtCollectiveStoreComponent } from './patient-art-collective-store.component';
import { StoreSourcingService } from '../services/store-sourcing.service';

describe('PatientArtCollectiveStoreComponent', () => {
  let component: PatientArtCollectiveStoreComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientArtCollectiveStoreComponent],
      providers: [StoreSourcingService]
    }).compileComponents();

    const fixture = TestBed.createComponent(PatientArtCollectiveStoreComponent);
    component = fixture.componentInstance;
  });

  it('should initialize with 5 patient artworks and featured selection', () => {
    expect(component.artworks().length).toBe(5);
    expect(component.featuredArtwork()).toBeDefined();
    expect(component.featuredArtwork().title).toContain('Mitochondrial');
  });

  it('should filter artworks by category', () => {
    component.selectedArtCategory.set('origami');
    const filtered = component.filteredArtworks();
    expect(filtered.length).toBe(2);
    expect(filtered.every(a => a.category === 'origami')).toBe(true);
  });

  it('should change frame style classes dynamically', () => {
    component.activeFrameFinish.set('gold_leaf');
    expect(component.getFrameClass()).toContain('border-[#ca8a04]');

    component.activeFrameFinish.set('dark_walnut');
    expect(component.getFrameClass()).toContain('border-[#3e2314]');
  });

  it('should load Amazon affiliate catalog on storefront tab', () => {
    component.activeMainTab.set('storefront');
    expect(component.affiliateCatalog().length).toBeGreaterThanOrEqual(8);
  });

  it('should handle relief tips and toast state', () => {
    component.contributeRelief(15);
    expect(component.tipToast()).toContain('$15');
  });

  it('should emit closeModal output', () => {
    let closed = false;
    component.closeModal.subscribe(() => {
      closed = true;
    });

    component.closeModal.emit();
    expect(closed).toBe(true);
  });
});
