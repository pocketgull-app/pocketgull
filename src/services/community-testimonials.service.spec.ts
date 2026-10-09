import { TestBed } from '@angular/core/testing';
import { CommunityTestimonialsService, SEED_TESTIMONIALS } from './community-testimonials.service';

describe('CommunityTestimonialsService', () => {
  let service: CommunityTestimonialsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [CommunityTestimonialsService]
    });
    service = TestBed.inject(CommunityTestimonialsService);
  });

  it('should initialize with empty seed testimonials (transparently seeking real clients)', () => {
    expect(service.testimonials().length).toBe(0);
    expect(SEED_TESTIMONIALS.length).toBe(0);
  });

  it('should allow submitting a new clinician testimonial with live update', () => {
    const res = service.submitTestimonial({
      authorName: 'Dr. John Doe, MD',
      roleOrAffiliation: 'Rural Health Clinic',
      location: 'Orcas Island, WA',
      quoteText: 'PocketGull made charting effortless during our remote island visits.',
      category: 'island_rural_health',
      impactMetric: 'Saved 2 hrs daily'
    });

    expect(res.success).toBe(true);
    expect(service.testimonials()[0].authorName).toBe('Dr. John Doe, MD');
    expect(service.testimonials()[0].location).toBe('Orcas Island, WA');
  });

  it('should reject empty author or quote submissions', () => {
    const res = service.submitTestimonial({
      authorName: '',
      roleOrAffiliation: '',
      quoteText: '',
      category: 'burnout_reduction'
    });
    expect(res.success).toBe(false);
  });
});
