import { Component, ChangeDetectionStrategy, inject, signal, effect, OnDestroy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictationService } from '../services/dictation.service';

import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { PocketGullInputComponent } from './shared/pocket-gull-input.component';

@Component({
  selector: 'app-dictation-modal',
  standalone: true,
  imports: [CommonModule, PocketGullButtonComponent, PocketGullInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dictation.isModalOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
           role="dialog"
           aria-modal="true"
           aria-labelledby="dictation-modal-title">
        <div class="bg-white rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-sm flex items-center justify-center transition-colors"
                   [class.bg-brand-red-100]="dictation.isListening()"
                   [class.text-brand-red-600]="dictation.isListening()"
                   [class.bg-gray-100]="!dictation.isListening()"
                   [class.text-gray-500]="!dictation.isListening()">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
              </div>
              <div>
                <h3 id="dictation-modal-title" class="text-sm font-bold text-gray-900 uppercase tracking-wide">Voice Dictation</h3>
                <p class="text-xs text-gray-500">
                  @if (dictation.isListening()) {
                    Listening... Speak clearly.
                  } @else {
                    Microphone paused. Review your text.
                  }
                </p>
              </div>
            </div>
            <pocket-gull-button 
              variant="ghost" 
              size="sm"
              (click)="cancel()" 
              icon="M18 6L6 18M6 6l12 12">
            </pocket-gull-button>
          </div>

          <!-- Content -->
          <div class="p-6 relative">
            <pocket-gull-input
              type="textarea"
              [value]="currentText()"
              (valueChange)="updateTextManual($event)"
              [rows]="10"
              placeholder="Start speaking or type here..."
              class="w-full">
            </pocket-gull-input>
            
            @if (interimText()) {
              <div class="absolute bottom-8 left-8 right-8 text-gray-500 text-sm italic truncate pointer-events-none">
                {{ interimText() }}...
              </div>
            }

            @if (dictation.lastCommand(); as cmd) {
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-green-900/90 backdrop-blur-md rounded-full text-green-100 font-bold text-sm tracking-wide shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in duration-300">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                 {{ cmd }}
              </div>
            }

            @if (dictation.isListening()) {
              <div class="absolute bottom-8 right-8 flex gap-1">
                 <span class="w-2 h-2 bg-brand-red-500 rounded-sm animate-bounce" style="animation-delay: 0ms"></span>
                 <span class="w-2 h-2 bg-brand-red-500 rounded-sm animate-bounce" style="animation-delay: 150ms"></span>
                 <span class="w-2 h-2 bg-brand-red-500 rounded-sm animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div class="flex items-center gap-2">
               <pocket-gull-button 
                 (click)="toggleListening()" 
                 [variant]="dictation.isListening() ? 'secondary' : 'danger'"
                 size="sm"
                 [icon]="dictation.isListening() ? 'M6 4h4v16H6V4zm8 0h4v16h-4V4z' : 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z'">
                 {{ dictation.isListening() ? 'Pause' : 'Resume' }}
               </pocket-gull-button>
               @if (dictation.permissionError(); as error) {
                 <span class="text-xs text-brand-red-600">{{ error }}</span>
               }
            </div>

            <div class="flex items-center gap-3">
               <pocket-gull-button 
                 variant="ghost" 
                 size="sm" 
                 (click)="cancel()">
                 Cancel
               </pocket-gull-button>
               <pocket-gull-button 
                 variant="primary" 
                 size="sm" 
                 (click)="accept()">
                 Insert Text
               </pocket-gull-button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class DictationModalComponent implements OnDestroy {
  dictation = inject(DictationService);
  currentText = signal('');
  interimText = signal('');

  constructor() {
    // Register to receive updates from the service
    this.dictation.registerResultHandler((text, isFinal) => {
      if (isFinal) {
        // Append final text
        const current = this.currentText();
        const needsSpace = current.length > 0 && !current.endsWith(' ');
        this.currentText.set(current + (needsSpace ? ' ' : '') + text);
        this.interimText.set('');
      } else {
        // Update interim text display
        this.interimText.set(text);
      }
    });

    // Reset text when modal opens
    effect(() => {
      if (this.dictation.isModalOpen()) {
        untracked(() => {
          this.currentText.set(this.dictation.initialText());
          this.interimText.set('');
        });
        this.dictation.startRecognition();
      }
    });
  }

  ngOnDestroy() {
    this.dictation.stopRecognition();
  }

  updateTextManual(text: string) {
    this.currentText.set(text);
  }

  toggleListening() {
    if (this.dictation.isListening()) {
      this.dictation.stopRecognition();
    } else {
      this.dictation.startRecognition();
    }
  }

  cancel() {
    this.dictation.cancel();
  }

  accept() {
    this.dictation.accept(this.currentText());
  }
}
