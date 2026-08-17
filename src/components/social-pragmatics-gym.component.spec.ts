import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialPragmaticsGymComponent } from './social-pragmatics-gym.component';
import { SocialPragmaticsGymService } from '../services/social-pragmatics-gym.service';

describe('SocialPragmaticsGymComponent', () => {
  let component: SocialPragmaticsGymComponent;
  let fixture: ComponentFixture<SocialPragmaticsGymComponent>;
  let gymService: SocialPragmaticsGymService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialPragmaticsGymComponent],
      providers: [SocialPragmaticsGymService]
    }).compileComponents();

    fixture = TestBed.createComponent(SocialPragmaticsGymComponent);
    component = fixture.componentInstance;
    gymService = TestBed.inject(SocialPragmaticsGymService);
    fixture.detectChanges();
  });

  it('should create the social pragmatics gym component', () => {
    expect(component).toBeTruthy();
  });

  it('should switch persona when selected', () => {
    component.selectPersona('busy_colleague');
    fixture.detectChanges();

    expect(gymService.activePersonaId()).toBe('busy_colleague');
    expect(gymService.activePersona().name).toBe('Marcus');
  });

  it('should submit custom input and update dialogue', () => {
    component.customInput.set('How can I help you finish before the demo?');
    component.submitCustomInput();
    fixture.detectChanges();

    expect(gymService.conversationHistory().length).toBe(3);
    expect(component.customInput()).toBe('');
  });

  it('should emit close output', () => {
    let closed = false;
    component.close.subscribe(() => closed = true);

    component.close.emit();
    expect(closed).toBe(true);
  });
});
