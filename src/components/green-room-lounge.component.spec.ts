import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GreenRoomLoungeComponent } from './green-room-lounge.component';
import { OshaWorkplaceSafetyService } from '../services/osha-workplace-safety.service';
import { DiscordActivityService } from '../services/discord-activity.service';

describe('GreenRoomLoungeComponent', () => {
  let component: GreenRoomLoungeComponent;
  let fixture: ComponentFixture<GreenRoomLoungeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreenRoomLoungeComponent],
      providers: [OshaWorkplaceSafetyService, DiscordActivityService]
    }).compileComponents();

    fixture = TestBed.createComponent(GreenRoomLoungeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes and renders Green Room Clinician & Patient Lounge header', () => {
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Green Room Clinician & Patient Lounge');
    expect(el.textContent).toContain('The Green Room — Written Reflections');
  });

  it('2. Evaluates OSHA safety compliance and displays index banner', () => {
    const osha = component.osha();
    expect(osha).toBeDefined();
    expect(osha.oshaComplianceScorePercent).toBeGreaterThanOrEqual(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('OSHA Worker & Patient Safety Index:');
    expect(el.textContent).toContain(`${osha.oshaComplianceScorePercent}% Compliant`);
  });

  it('3. Renders initial written reflections from the care team', () => {
    expect(component.reflections().length).toBeGreaterThanOrEqual(3);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dr. Sarah Lin, MD');
    expect(el.textContent).toContain('Nurse Marcus Vance, RN');
    expect(el.textContent).toContain('Elena & Family');
  });

  it('4. Adds a new written reflection note to the wall', () => {
    const initialCount = component.reflections().length;
    component.addReflection('Honored to participate in today\'s palliative care round.');
    fixture.detectChanges();

    expect(component.reflections().length).toBe(initialCount + 1);
    expect(component.reflections()[0].reflectionText).toBe('Honored to participate in today\'s palliative care round.');
    expect(component.reflections()[0].category).toBe('Compassion');

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Honored to participate in today\'s palliative care round.');
  });

  it('5. Emits closeModal and openGleeAlbum outputs', () => {
    let closeEmitted = false;
    let gleeEmitted = false;

    component.closeModal.subscribe(() => {
      closeEmitted = true;
    });
    component.openGleeAlbum.subscribe(() => {
      gleeEmitted = true;
    });

    component.openGleeAlbum.emit();
    expect(gleeEmitted).toBe(true);

    component.closeModal.emit();
    expect(closeEmitted).toBe(true);
  });
});
