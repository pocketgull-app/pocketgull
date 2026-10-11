import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommunityTestimonialModalComponent } from './community-testimonial-modal.component';
import { CommunityTestimonialsService } from '../../services/community-testimonials.service';

describe('CommunityTestimonialModalComponent', () => {
  let component: CommunityTestimonialModalComponent;
  let fixture: ComponentFixture<CommunityTestimonialModalComponent>;
  let service: CommunityTestimonialsService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CommunityTestimonialModalComponent],
      providers: [CommunityTestimonialsService]
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityTestimonialModalComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(CommunityTestimonialsService);
    fixture.detectChanges();
  });

  it('should render seeking clients message in read mode when empty', () => {
    expect(component.viewMode()).toBe('read');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent?.toLowerCase()).toContain('seeking clients');
    expect(el.textContent?.toLowerCase()).toContain('customers');
  });

  it('should toggle to write mode and allow submitting a testimonial', () => {
    component.viewMode.set('write');
    component.authorName = 'Dr. Sarah Connor, MD';
    component.roleOrAffiliation = 'Emergency Medicine';
    component.quoteText = 'PocketGull accelerated our triage protocol significantly.';
    component.onSubmitTestimonial();

    expect(component.submissionMessage()).toContain('Thank you');
    expect(service.testimonials().some(t => t.authorName === 'Dr. Sarah Connor, MD')).toBe(true);
  });
});
