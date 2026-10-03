import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { VisitReviewComponent } from './visit-review.component';
import { PatientStateService } from '../services/patient-state.service';
import { HistoryEntry, IBodyPartIssue } from '../services/patient.types';

describe('VisitReviewComponent', () => {
  let mockPatientState: {
    selectPart: any;
    selectNote: any;
    setViewingPastVisit: any;
  };

  const mockVisit: HistoryEntry & { type: 'Visit' } = {
    date: '2026-09-15',
    type: 'Visit',
    summary: 'Routine metabolic follow-up and chronic migraine reassessment.',
    state: {
      issues: {
        head: [
          {
            id: 'head',
            noteId: 'NOTE-HEAD-01',
            name: 'Head / Cranial',
            description: 'Throbbing hemicranial migraine with photophobia',
            painLevel: 7,
            symptoms: ['Migraine', 'Photophobia']
          }
        ],
        spine: [
          {
            id: 'spine',
            noteId: 'NOTE-SPINE-01',
            name: 'Cervical Spine',
            description: 'Paraspinal muscular spasm and tension',
            painLevel: 4,
            symptoms: ['Muscle spasm']
          }
        ]
      }
    } as any
  };

  beforeEach(() => {
    mockPatientState = {
      selectPart: vi.fn(),
      selectNote: vi.fn(),
      setViewingPastVisit: vi.fn()
    };
  });

  const createComponent = (visitData: HistoryEntry & { type: 'Visit' } = mockVisit) => {
    const injector = Injector.create({
      providers: [
        { provide: PatientStateService, useValue: mockPatientState }
      ]
    });

    const comp = runInInjectionContext(injector, () => new VisitReviewComponent());
    (comp as any).visit = signal(visitData);
    return comp;
  };

  it('1. should create and group notes by body part correctly', () => {
    const comp = createComponent();
    expect(comp).toBeTruthy();
    expect(comp.visit().date).toBe('2026-09-15');
    expect(comp.visit().summary).toContain('Routine metabolic follow-up');

    const grouped = comp.notesByPart();
    expect(grouped.length).toBe(2);
    expect(grouped[0].partId).toBe('head');
    expect(grouped[0].partName).toBe('Head / Cranial');
    expect(grouped[0].notes.length).toBe(1);
    expect(grouped[0].notes[0].painLevel).toBe(7);

    expect(grouped[1].partId).toBe('spine');
    expect(grouped[1].notes.length).toBe(1);
    expect(grouped[1].notes[0].painLevel).toBe(4);
  });

  it('2. should return empty array when visit has no issues', () => {
    const emptyVisit: HistoryEntry & { type: 'Visit' } = {
      date: '2026-09-01',
      type: 'Visit',
      summary: 'Baseline visit without noted symptoms.',
      state: {} as any
    };

    const comp = createComponent(emptyVisit);
    expect(comp.notesByPart()).toEqual([]);
  });

  it('3. should select part and note in patient state when selectNote is called', () => {
    const comp = createComponent();
    const targetIssue: IBodyPartIssue = {
      id: 'head',
      noteId: 'NOTE-HEAD-01',
      name: 'Head / Cranial',
      description: 'Migraine note',
      painLevel: 8,
      symptoms: ['Migraine']
    };

    comp.selectNote(targetIssue);
    expect(mockPatientState.selectPart).toHaveBeenCalledWith('head');
    expect(mockPatientState.selectNote).toHaveBeenCalledWith('NOTE-HEAD-01');
  });

  it('4. should clear past visit in state when close is called', () => {
    const comp = createComponent();
    comp.close();
    expect(mockPatientState.setViewingPastVisit).toHaveBeenCalledWith(null);
  });
});
