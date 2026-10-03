import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientHistoryTimelineComponent } from './patient-history-timeline.component';
import { HistoryEntry, IPatientState } from '../services/patient.types';
import { signal } from '@angular/core';

describe('PatientHistoryTimelineComponent', () => {
  let component: PatientHistoryTimelineComponent;
  let fixture: ComponentFixture<PatientHistoryTimelineComponent>;

  const mockPatientState: IPatientState = {
    selectedPartId: 'r_shoulder',
    anatomyViewMode: 'organs',
    issues: {
      r_shoulder: [
        {
          id: 'r_shoulder_pain',
          painLevel: 7,
          name: 'Rotator Cuff Tendinopathy',
          description: 'Supraspinatus impingement with nocturnal ache',
          symptoms: ['Shoulder Pain', 'Restricted ROM'],
          recommendations: ['Resonant breathing', 'Anti-inflammatory nutrition']
        }
      ]
    },
    notes: {},
    bookmarks: [],
    history: [],
    selectedConditions: []
  } as unknown as IPatientState;

  const mockVisitEntry: HistoryEntry = {
    type: 'Visit',
    date: '2026.10.01',
    summary: 'Clinical Follow-up & Rotator Cuff Ultrasound',
    state: mockPatientState
  };

  const mockSummaryEntry: HistoryEntry = {
    type: 'PatientSummaryUpdate',
    date: '2026.09.28',
    summary: 'Blood pressure baseline normalized to 118/76 mmHg.'
  };

  const mockBookmarkEntry = {
    type: 'BookmarkAdded' as const,
    date: '2026.09.25',
    summary: 'PubMed SPM Resolution Paper',
    bookmark: {
      title: 'SPM Resolution Paper',
      url: 'https://pubmed.ncbi.nlm.nih.gov/32810291/'
    }
  };

  const mockNoteEntry: HistoryEntry = {
    type: 'NoteCreated',
    date: '2026.09.20',
    summary: 'Patient reports improved sleep quality with magnesium glycinate.',
    partId: 'r_shoulder',
    noteId: 'note-101'
  };

  const mockAnalysisEntry: HistoryEntry = {
    type: 'AnalysisRun',
    date: '2026.09.15',
    summary: 'Full Multimodal Clinical Strategy Generated',
    report: {}
  };

  const mockEntries: HistoryEntry[] = [
    mockVisitEntry,
    mockSummaryEntry,
    mockBookmarkEntry,
    mockNoteEntry,
    mockAnalysisEntry
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientHistoryTimelineComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientHistoryTimelineComponent);
    component = fixture.componentInstance;
    (component as any).history = signal(mockEntries);
    (component as any).activeVisit = signal(null);
    fixture.detectChanges();
  });

  it('1. Initializes and renders history entries with timeline nodes in the DOM', () => {
    expect(component).toBeTruthy();
    expect(component.history().length).toBe(5);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Clinical Follow-up & Rotator Cuff Ultrasound');
    expect(el.textContent).toContain('Blood pressure baseline normalized');
    expect(el.textContent).toContain('PubMed SPM Resolution Paper');
    expect(el.textContent).toContain('Patient reports improved sleep quality');
  });

  it('2. Renders correct safe SVG icons for various event types and body parts', () => {
    // Visit with r_shoulder pain issue
    const visitHtml = component.getSafeIconHtml(mockVisitEntry);
    expect(visitHtml).toBeTruthy();

    // Summary update
    const summaryHtml = component.getSafeIconHtml(mockSummaryEntry);
    expect(summaryHtml).toBeTruthy();

    // Bookmark
    const bookmarkHtml = component.getSafeIconHtml(mockBookmarkEntry);
    expect(bookmarkHtml).toBeTruthy();

    // Note
    const noteHtml = component.getSafeIconHtml(mockNoteEntry);
    expect(noteHtml).toBeTruthy();

    // Analysis
    const analysisHtml = component.getSafeIconHtml(mockAnalysisEntry);
    expect(analysisHtml).toBeTruthy();

    // NoteDeleted & ChartArchived
    const noteDeleted: HistoryEntry = {
      type: 'NoteDeleted',
      date: '2026.09.10',
      summary: 'Outdated note purged',
      partId: 'head',
      noteId: 'n-old'
    };
    expect(component.getSafeIconHtml(noteDeleted)).toBeTruthy();

    const chartArchived: HistoryEntry = {
      type: 'ChartArchived',
      date: '2026.09.01',
      summary: 'Archived snapshot',
      state: mockPatientState
    };
    expect(component.getSafeIconHtml(chartArchived)).toBeTruthy();
  });

  it('3. Emits review output when a Visit entry is clicked', () => {
    let selected: HistoryEntry | null = null;
    component.review.subscribe(e => {
      selected = e;
    });

    component.review.emit(mockVisitEntry);
    expect(selected).toEqual(mockVisitEntry);
  });

  it('4. Emits reviewNote and deleteNote outputs when note interaction buttons are clicked', () => {
    let reviewedNote: HistoryEntry | null = null;
    let deletedNote: HistoryEntry | null = null;

    component.reviewNote.subscribe(e => {
      reviewedNote = e;
    });
    component.deleteNote.subscribe(e => {
      deletedNote = e;
    });

    component.reviewNote.emit(mockNoteEntry);
    component.deleteNote.emit(mockNoteEntry);

    expect(reviewedNote).toEqual(mockNoteEntry);
    expect(deletedNote).toEqual(mockNoteEntry);
  });

  it('5. Emits openBookmark and reviewAnalysis outputs when bookmark and analysis cards are triggered', () => {
    let openedUrl: string | null = null;
    let reviewedAnalysis: HistoryEntry | null = null;

    component.openBookmark.subscribe(url => {
      openedUrl = url;
    });
    component.reviewAnalysis.subscribe(e => {
      reviewedAnalysis = e;
    });

    component.openBookmark.emit(mockBookmarkEntry.bookmark.url);
    component.reviewAnalysis.emit(mockAnalysisEntry);

    expect(openedUrl).toBe('https://pubmed.ncbi.nlm.nih.gov/32810291/');
    expect(reviewedAnalysis).toEqual(mockAnalysisEntry);
  });
});
