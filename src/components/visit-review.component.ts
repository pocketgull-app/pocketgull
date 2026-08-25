import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullBadgeComponent } from './shared/pocket-gull-badge.component';
import { PatientStateService } from '../services/patient-state.service';
import { HistoryEntry, IBodyPartIssue } from '../services/patient.types';

interface INotesByPart {
  partId: string;
  partName: string;
  notes: IBodyPartIssue[];
}

@Component({
  selector: 'app-visit-review',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent, PocketGullBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col bg-white dark:bg-[#09090b]">
      <!-- Header -->
      <div class="h-14 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-6 bg-white dark:bg-[#09090b] shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Visit Review</span>
          <span class="text-xs text-gray-300">|</span>
          <span class="text-xs font-semibold text-gray-900 dark:text-zinc-100">{{ visit().date }}</span>
        </div>
        <button (click)="close()" class="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        <div>
          <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Clinical Summary</h3>
          <p class="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed">{{ visit().summary }}</p>
        </div>

        <div class="pt-8 border-t border-slate-200 dark:border-zinc-800 space-y-6">
            @for (part of notesByPart(); track part.partId) {
                <div>
                    <h3 class="text-sm font-bold text-[#1C1C1C] dark:text-zinc-100 mb-3">{{ part.partName }}</h3>
                    <div class="space-y-2">
                        @for(note of part.notes; track note.noteId) {
                            <pocket-gull-button 
                                    (click)="selectNote(note)"
                                    variant="secondary"
                                    size="md"
                                    class="w-full text-left">
                                <div class="flex justify-between items-center w-full">
                                    <p class="font-medium text-gray-800 dark:text-zinc-100 flex-1 pr-4 text-xs text-left normal-case tracking-normal">{{ note.description || 'No description provided.' }}</p>
                                    <pocket-gull-badge [label]="note.painLevel + '/10'" [severity]="note.painLevel > 7 ? 'error' : note.painLevel > 4 ? 'warning' : 'neutral'" size="sm">
                                    </pocket-gull-badge>
                                </div>
                            </pocket-gull-button>
                        }
                    </div>
                </div>
            } @empty {
                <div class="text-center text-xs text-gray-500 py-8">
                    <p>No specific notes were recorded for this visit.</p>
                </div>
            }
        </div>
      </div>
    </div>
  `
})
export class VisitReviewComponent {
  state = inject(PatientStateService);
  visit = input.required<HistoryEntry & { type: 'Visit' }>();

  notesByPart = computed<INotesByPart[]>(() => {
    const issues = this.visit().state?.issues;
    if (!issues) return [];

    // Using a map to preserve order and group correctly
    const grouped = new Map<string, INotesByPart>();

    for (const partId in issues) {
      const notesForPart = issues[partId];
      if (notesForPart && notesForPart.length > 0) {
        let entry = grouped.get(partId);
        if (!entry) {
          entry = {
            partId: partId,
            partName: notesForPart[0].name,
            notes: []
          };
          grouped.set(partId, entry);
        }
        entry.notes.push(...notesForPart);
      }
    }
    return Array.from(grouped.values());
  });

  selectNote(note: IBodyPartIssue) {
    // This will trigger the app component to switch to the intake form
    this.state.selectPart(note.id);
    this.state.selectNote(note.noteId);
  }

  close() {
    // Clearing the past visit state will exit review mode entirely
    this.state.setViewingPastVisit(null);
  }
}
