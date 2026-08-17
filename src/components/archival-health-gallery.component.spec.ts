import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArchivalHealthGalleryComponent } from './archival-health-gallery.component';
import { PatientStateService } from '../services/patient-state.service';
import { PatientManagementService } from '../services/patient-management.service';
import { IntelligenceProviderToken } from '../services/ai/intelligence.provider.token';
import { vi } from 'vitest';

describe('ArchivalHealthGalleryComponent', () => {
  let component: ArchivalHealthGalleryComponent;
  let fixture: ComponentFixture<ArchivalHealthGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivalHealthGalleryComponent],
      providers: [
        PatientStateService,
        PatientManagementService,
        {
          provide: IntelligenceProviderToken,
          useValue: { generateContent: vi.fn(), generateStream: vi.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArchivalHealthGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the archival health gallery component', () => {
    expect(component).toBeTruthy();
  });

  it('should render initial archival health milestone cards', () => {
    const cards = component.galleryCards();
    expect(cards.length).toBe(3);
    expect(cards[0].vignetteTheme).toBe('origami_vagal_gull');
    expect(cards[1].vignetteTheme).toBe('quilling_mitochondria');
    expect(cards[2].vignetteTheme).toBe('papercut_lighthouse');
  });

  it('should set selectedCard when openMilestoneDetail is called', () => {
    const firstCard = component.galleryCards()[0];
    component.openMilestoneDetail(firstCard);
    expect(component.selectedCard()).toBe(firstCard);
  });
});
