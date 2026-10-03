import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostItNotesComponent } from './post-it-notes.component';
import { PatientStateService } from '../../services/patient-state.service';
import { signal } from '@angular/core';

describe('PostItNotesComponent', () => {
  let component: PostItNotesComponent;
  let fixture: ComponentFixture<PostItNotesComponent>;
  let mockPatientState: any;

  beforeEach(async () => {
    mockPatientState = {
      patientName: signal('Jane Doe')
    };

    await TestBed.configureTestingModule({
      imports: [PostItNotesComponent],
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostItNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes with default clinical sticky notes and patient state', () => {
    expect(component).toBeTruthy();
    expect(component.notes().length).toBe(5);
    expect(component.todayDate).toBeTruthy();
    expect(component.notes()[0].id).toBe('n_rx');
    expect(component.notes()[0].title).toContain('Mandatory Clinical Prescription');
  });

  it('2. Emits closeModal output when close action is triggered', () => {
    const closeSpy = vi.fn();
    component.closeModal.subscribe(closeSpy);

    component.closeModal.emit();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('3. Adds quick template notes for sun, vagal, tea, hawking, and water', () => {
    const initialCount = component.notes().length;

    component.addTemplate('sun');
    expect(component.notes().length).toBe(initialCount + 1);
    expect(component.notes().at(-1)?.title).toContain('Morning Light Walk');
    expect(component.notes().at(-1)?.color).toBe('yellow');

    component.addTemplate('vagal');
    expect(component.notes().length).toBe(initialCount + 2);
    expect(component.notes().at(-1)?.title).toContain('Resonant Breathing Break');
    expect(component.notes().at(-1)?.color).toBe('mint');

    component.addTemplate('tea');
    expect(component.notes().length).toBe(initialCount + 3);
    expect(component.notes().at(-1)?.title).toContain('Warm Jujube');
    expect(component.notes().at(-1)?.color).toBe('rose');

    component.addTemplate('hawking');
    expect(component.notes().length).toBe(initialCount + 4);
    expect(component.notes().at(-1)?.title).toContain('Stephen Hawking');
    expect(component.notes().at(-1)?.color).toBe('lavender');

    component.addTemplate('water');
    expect(component.notes().length).toBe(initialCount + 5);
    expect(component.notes().at(-1)?.title).toContain('Lao Tzu Be Like Water');
  });

  it('4. Deletes a specific note by ID', () => {
    const noteToDelete = component.notes()[1].id;
    const initialCount = component.notes().length;

    component.deleteNote(noteToDelete);

    expect(component.notes().length).toBe(initialCount - 1);
    expect(component.notes().some(n => n.id === noteToDelete)).toBe(false);
  });

  it('5. Triggers window.print when printNotes is invoked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    component.printNotes();
    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });
});
