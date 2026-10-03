import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CollaborationDockComponent } from './collaboration-dock.component';
import { CollaborationService, ICollaborationNote } from '../services/collaboration.service';

describe('CollaborationDockComponent', () => {
  let component: CollaborationDockComponent;
  let fixture: ComponentFixture<CollaborationDockComponent>;
  let mockActiveClinicians: ReturnType<typeof signal<string[]>>;
  let mockCollaborationNotes: ReturnType<typeof signal<ICollaborationNote[]>>;
  let mockSendNote: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockActiveClinicians = signal<string[]>(['Dr. Alice Smith', 'Dr. Colleague']);
    mockCollaborationNotes = signal<ICollaborationNote[]>([
      {
        id: 'note-1',
        clinicianName: 'Dr. Alice Smith',
        text: 'Reviewing recent lab panel',
        timestamp: new Date().toISOString()
      },
      {
        id: 'note-2',
        clinicianName: 'Dr. Colleague',
        text: 'ECG shows normal sinus rhythm',
        timestamp: new Date().toISOString()
      }
    ]);
    mockSendNote = vi.fn((text: string) => {
      mockCollaborationNotes.update(notes => [
        ...notes,
        {
          id: `note-${notes.length + 1}`,
          clinicianName: 'Dr. Colleague',
          text,
          timestamp: new Date().toISOString()
        }
      ]);
    });

    const mockService = {
      activeClinicians: mockActiveClinicians,
      collaborationNotes: mockCollaborationNotes,
      sendNote: mockSendNote
    };

    await TestBed.configureTestingModule({
      imports: [CollaborationDockComponent],
      providers: [
        { provide: CollaborationService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CollaborationDockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('1. Initializes closed with toggle button and initial initials helper', () => {
    expect(component).toBeTruthy();
    expect(component.isOpen()).toBe(false);
    expect(component.getInitials('Dr. Alice Smith')).toBe('DA');
    expect(component.getInitials('Single')).toBe('SI');
    expect(component.getInitials('')).toBe('??');
  });

  it('2. Computes unread notes count based on notes and lastReadCount', () => {
    expect(component.unreadCount()).toBe(2);
  });

  it('3. Toggles open state and resets unread count', () => {
    component.toggleOpen();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    expect(component.unreadCount()).toBe(0);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Live Clinical Room');
    expect(el.textContent).toContain('Dr. Alice Smith');
    expect(el.textContent).toContain('Reviewing recent lab panel');
  });

  it('4. Distinguishes self notes vs peer notes', () => {
    expect(component.isSelf('Dr. Colleague')).toBe(true);
    expect(component.isSelf('Dr. Alice Smith')).toBe(false);
  });

  it('5. Sends a new note when text is entered and clears input', () => {
    vi.useFakeTimers();
    component.isOpen.set(true);
    fixture.detectChanges();

    component.draftNote.set('Patient vitals stabilized');
    component.sendNote();
    vi.advanceTimersByTime(60);
    fixture.detectChanges();

    expect(mockSendNote).toHaveBeenCalledWith('Patient vitals stabilized');
    expect(component.draftNote()).toBe('');
    vi.useRealTimers();
  });
});
