import { Component, ChangeDetectionStrategy, inject, signal, computed, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CollaborationService } from '../services/collaboration.service';

@Component({
  selector: 'app-collaboration-dock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Collaboration Dock Widget -->
    <div 
      class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end transition-all duration-300 ease-out"
      [class.w-80]="isOpen()"
      [class.w-16]="!isOpen()">
      
      <!-- Dock Panel (Glassmorphism) -->
      @if (isOpen()) {
        <div 
          class="w-full mb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all duration-300 origin-bottom-right"
          style="height: 400px; animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
          
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">Live Clinical Room</h3>
            </div>
            
            <!-- Active Clinicians Avatars -->
            <div class="flex -space-x-2">
              @for (clinician of activeClinicians(); track clinician) {
                <div class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[12px] font-bold border-2 border-white dark:border-zinc-900 shadow-sm" title="{{ clinician }}">
                  {{ getInitials(clinician) }}
                </div>
              }
            </div>
          </div>

          <!-- Chat Stream -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-transparent" #chatScroll>
            @if (notes().length === 0) {
              <div class="m-auto text-xs text-gray-400 text-center px-4">
                No active discussions. IVitals are being synced in the background.
              </div>
            }

            @for (note of notes(); track note.id) {
              <div class="flex flex-col gap-1 max-w-[85%]" 
                   [class.self-end]="isSelf(note.clinicianName)" 
                   [class.self-start]="!isSelf(note.clinicianName)">
                <span class="text-[12px] text-gray-400 px-1" [class.text-right]="isSelf(note.clinicianName)">
                  {{ note.clinicianName }} • {{ formatTime(note.timestamp) }}
                </span>
                <div class="px-3 py-2 rounded-2xl text-sm shadow-sm"
                     [class.bg-indigo-600]="isSelf(note.clinicianName)"
                     [class.text-white]="isSelf(note.clinicianName)"
                     [class.rounded-tr-sm]="isSelf(note.clinicianName)"
                     [class.bg-gray-100]="!isSelf(note.clinicianName)"
                     [class.dark:bg-zinc-800]="!isSelf(note.clinicianName)"
                     [class.text-gray-800]="!isSelf(note.clinicianName)"
                     [class.dark:text-gray-200]="!isSelf(note.clinicianName)"
                     [class.rounded-tl-sm]="!isSelf(note.clinicianName)">
                  {{ note.text }}
                </div>
              </div>
            }
          </div>

          <!-- Input Area -->
          <div class="p-3 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
            <form (ngSubmit)="sendNote()" class="flex gap-2 items-center">
              <input 
                type="text" 
                [(ngModel)]="draftNote" 
                name="noteInput"
                placeholder="Share a clinical insight..." 
                class="flex-1 bg-gray-50 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-shadow text-gray-900 dark:text-gray-100 placeholder-gray-400"
                autocomplete="off">
              <button 
                type="submit" 
                [disabled]="!draftNote().trim()"
                class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 translate-x-[1px] translate-y-[1px]">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Toggle Button (Floating Action Button) -->
      <button 
        (click)="toggleOpen()"
        aria-label="Toggle clinical room chat"
        class="h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10"
        [class.bg-indigo-600]="!isOpen()"
        [class.bg-zinc-800]="isOpen()">
        
        <!-- Notification Badge -->
        @if (!isOpen() && unreadCount() > 0) {
          <span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white border-2 border-white shadow-sm animate-bounce">
            {{ unreadCount() }}
          </span>
        }

        @if (!isOpen()) {
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.84 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white rotate-90 transition-transform">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        }
      </button>
    </div>

    <!-- Styles for Pop Animation -->
    <style>
      @keyframes popIn {
        0% { opacity: 0; transform: scale(0.9) translateY(10px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
    </style>
  `
})
export class CollaborationDockComponent {
  private collaboration = inject(CollaborationService);
  
  isOpen = signal<boolean>(false);
  draftNote = signal<string>('');
  
  // Track read state for the badge
  private lastReadCount = signal<number>(0);

  activeClinicians = this.collaboration.activeClinicians;
  notes = this.collaboration.collaborationNotes;

  unreadCount = computed(() => {
    const total = this.notes().length;
    const read = this.lastReadCount();
    return Math.max(0, total - read);
  });

  chatScroll = viewChild<ElementRef>('chatScroll');

  toggleOpen() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.lastReadCount.set(this.notes().length);
      this.scrollToBottom();
    }
  }

  sendNote() {
    const text = this.draftNote().trim();
    if (text) {
      this.collaboration.sendNote(text);
      this.draftNote.set('');
      this.lastReadCount.set(this.notes().length + 1);
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  isSelf(clinicianName: string): boolean {
    return clinicianName === 'Dr. Colleague'; // Match the mock user in the service
  }

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    const el = this.chatScroll()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
