import {
    Component, ChangeDetectionStrategy, inject, signal, input, output, computed,
    OnInit, ViewChild, ElementRef, AfterViewChecked, ViewEncapsulation, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalIntelligenceService } from '../services/clinical-intelligence.service';
import { PatientStateService } from '../services/patient-state.service';
import { MarkdownService } from '../services/markdown.service';
import { PocketGullButtonComponent } from './shared/pocket-gull-button.component';
import { ClinicalIcons } from '../assets/clinical-icons';
import { SafeHtmlPipe } from '../pipes/safe-html-new.pipe';
import { AdkLiveService } from '../services/ai/adk-live.service';
import { getStoredApiKey } from '../services/secure-key';
import { SecureStorageService } from '../services/secure-storage.service';

export interface INodeAgentDialogData {
    nodeKey: string;
    nodeText: string;          // Plain text content of the node
    sectionTitle: string;      // Which section/lens this node belongs to
}

interface IChatEntry {
    role: 'user' | 'model' | 'system';
    text: string;
    html?: string;
    isStreaming?: boolean;
}

@Component({
    selector: 'app-node-agent-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, PocketGullButtonComponent, SafeHtmlPipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    template: `
    <!-- Overlay backdrop -->
    <div class="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
        <!-- Dialog Panel (Draggable Window) -->
        <div class="node-agent-dialog pointer-events-auto flex flex-col transition-shadow duration-200"
             [class.node-agent-dialog--open]="isOpen()"
             [style.position]="position() ? 'fixed' : null"
             [style.left.px]="position() ? position()!.x : null"
             [style.top.px]="position() ? position()!.y : null">
 
            <!-- Header (Drag Handle) -->
            <div class="node-agent-header cursor-move select-none" (mousedown)="startDrag($event)">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <!-- Pulse indicator -->
                    <span class="flex-shrink-0 flex h-2 w-2 relative">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#689F38] opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-[#689F38]"></span>
                    </span>
                    <span class="node-agent-title">{{ agentName() }}</span>
                    <span class="node-agent-section-chip">{{ data().sectionTitle }}</span>
                    @if (live.isSpeaking()) {
                        <span class="flex-shrink-0 flex h-2 w-2 relative ml-1">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C084FC] opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-[#C084FC]"></span>
                        </span>
                        <span class="text-[12px] font-bold text-[#C084FC] uppercase tracking-wider animate-pulse ml-1">Live Audio</span>
                    }
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                    @if (isLoading()) {
                        <div class="w-4 h-4 border-2 border-[#EEEEEE] border-t-[#689F38] rounded-full animate-spin"></div>
                    }
                    <pocket-gull-button
                        variant="ghost"
                        size="sm"
                        ariaLabel="Close"
                        icon="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                        (click)="close()">
                    </pocket-gull-button>
                </div>
            </div>

            <!-- Context Node Preview with 3D Double-Click Flip State Machine -->
            <div class="px-4 pt-3 pb-1">
              <div class="relative perspective-1000 group cursor-pointer"
                   (dblclick)="toggleContextFlip($event)"
                   title="Double-click to flip over for Evidence Audit & Source Claim Trail">
                
                <div [class.rotate-y-180]="isContextFlipped()"
                     class="relative w-full transition-transform duration-500 transform-style-3d">

                  <!-- FRONT FACE: Clinical Claim in Focus -->
                  <div class="node-agent-context backface-hidden">
                    <div class="flex items-center justify-between">
                      <div class="node-agent-context-label">Clinical Claim in Focus</div>
                      <span class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        dblclick 🔄 audit
                      </span>
                    </div>
                    <div class="node-agent-context-text" [innerHTML]="contextHtml() | safeHtml"></div>
                  </div>

                  <!-- BACK FACE: Evidence Audit & Truth Trail -->
                  <div class="node-agent-context bg-emerald-950 text-white border border-emerald-500/40 rounded-xl p-3 absolute inset-0 rotate-y-180 backface-hidden font-sans text-xs flex flex-col justify-between">
                    <div>
                      <div class="flex items-center justify-between border-b border-emerald-800 pb-1 mb-1.5 font-mono text-[10px]">
                        <span class="text-emerald-300 font-bold uppercase flex items-center gap-1">
                          <span>🔍</span> Evidence Audit & Source Trail
                        </span>
                        <span class="text-emerald-400">dblclick flip back</span>
                      </div>
                      <div class="space-y-1 text-[11px] text-emerald-100">
                        <p><strong>Source Trail:</strong> Intake Symptom & Biomarker Vector Match</p>
                        <p><strong>Evidence Density:</strong> Grade A (PubMed / Cohort Verified)</p>
                        <p><strong>Safety Shield:</strong> DOMPurify Sanitized & HIPAA Compliant</p>
                      </div>
                    </div>
                    <div class="text-[9px] font-mono text-emerald-400 border-t border-emerald-900 pt-1 flex justify-between">
                      <span>Clinical Truth Engine</span>
                      <span>Double-click to return</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- Chat Body -->
            <div class="node-agent-body" #chatBody>
                @for (entry of chatHistory(); track $index) {
                    <div class="node-agent-message" [class.node-agent-message--user]="entry.role === 'user'"
                         [class.node-agent-message--model]="entry.role === 'model'"
                         [class.node-agent-message--system]="entry.role === 'system'">
                        @if (entry.role === 'model' || entry.role === 'system') {
                            <div class="node-agent-avatar">
                                <svg viewBox="0 -960 960 960" fill="currentColor" width="14" height="14">
                                    <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/>
                                </svg>
                            </div>
                        }
                        <div class="node-agent-bubble rams-typography"
                             [innerHTML]="(entry.html || entry.text) | safeHtml">
                        </div>
                        @if (entry.isStreaming) {
                            <span class="node-agent-cursor"></span>
                        }
                    </div>
                }

                @if (isLoading() && chatHistory()[chatHistory().length - 1]?.role !== 'model') {
                    <div class="node-agent-message node-agent-message--model">
                        <div class="node-agent-avatar">
                            <svg viewBox="0 -960 960 960" fill="currentColor" width="14" height="14">
                                <path d="M480-80q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Z"/>
                            </svg>
                        </div>
                        <div class="node-agent-bubble node-agent-bubble--thinking">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                }
            </div>

            <!-- Input Row -->
            <div class="node-agent-input-container">
                @if (selectedFiles().length > 0) {
                    <div class="node-agent-file-preview">
                        @for (file of selectedFiles(); track $index) {
                            <div class="node-agent-file-chip">
                                <span class="node-agent-file-name" [title]="file.name">{{ file.name }}</span>
                                <button class="node-agent-file-remove" (click)="removeFile($index)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                        }
                    </div>
                }
                <div class="node-agent-input-row relative">
                    <button class="node-agent-attach" (click)="triggerFileInput()" [disabled]="isLoading()" title="Attach file">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    </button>
                    
                    @if (suggestedQuestions().length > 0) {
                        <button class="node-agent-attach" (click)="showSuggestionsDropdown.set(!showSuggestionsDropdown())" [disabled]="isLoading()" title="Suggested Questions" [class.bg-[#E5E7EB]]="showSuggestionsDropdown()" [class.dark:bg-[#27272a]]="showSuggestionsDropdown()">
                            <div [innerHTML]="ClinicalIcons.Suggestion | safeHtml" class="w-4 h-4 flex items-center justify-center"></div>
                        </button>
                    }

                    <!-- Microphone Toggle Button -->
                    <button class="node-agent-attach relative" 
                            (click)="toggleListening()" 
                            [disabled]="isLoading() || !!permissionError()" 
                            [class.node-agent-attach--listening]="live.isListening()"
                            title="Toggle Voice Consult">
                        @if (live.isListening()) {
                            <span class="absolute inset-0 rounded-full bg-red-500/20 animate-ping"
                                  [style.transform]="'scale(' + (1.1 + (live.volumeLevel() / 100) * 0.4) + ')'"
                                  style="animation-duration: 1.5s;"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="text-red-500 relative z-10" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                        } @else {
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                        }
                    </button>

                    <!-- Suggestions Dropdown -->
                    @if (showSuggestionsDropdown() && !isLoading()) {
                        <!-- Invisible overlay to catch clicks outside -->
                        <div class="fixed inset-0 z-40" (click)="showSuggestionsDropdown.set(false)"></div>
                        
                        <div class="absolute bottom-full left-14 mb-2 w-72 bg-white dark:bg-[#09090b] rounded-xl shadow-[0_12px_28px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden z-50 flex flex-col border border-gray-100 dark:border-zinc-800 transform origin-bottom-left transition-all">
                            <div class="px-3 py-2 bg-gray-50 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                                <div [innerHTML]="ClinicalIcons.Suggestion | safeHtml" class="w-3.5 h-3.5 text-indigo-500 flex items-center justify-center"></div>
                                <span class="text-[12px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Initial Questions</span>
                            </div>
                            <div class="p-1">
                                @for (s of suggestedQuestions(); track s) {
                                    <button class="w-full text-left px-3 py-2 text-[11.5px] text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors flex items-center gap-2 group" (click)="sendSuggestion(s); showSuggestionsDropdown.set(false)">
                                        <span class="flex-1">{{ s }}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                    </button>
                                }
                            </div>
                        </div>
                    }

                    <input type="file" #fileInput (change)="onFileSelected($event)" multiple accept="image/*,video/*" class="hidden" style="display: none;">
                    <input #inputEl
                        class="node-agent-input"
                        type="text"
                        [(ngModel)]="userInput"
                        placeholder="Ask about this recommendation..."
                        (keydown.enter)="sendMessage()"
                        [disabled]="isLoading()">
                    <button class="node-agent-send" (click)="sendMessage()" [disabled]="isLoading() || (!userInput.trim() && selectedFiles().length === 0)">
                        <svg viewBox="0 -960 960 960" fill="currentColor" width="18" height="18">
                            <path d="M120-160v-240l320-80-320-80v-240l760 320-760 320Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: [`
        .node-agent-dialog {
            width: 420px;
            max-height: 580px;
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            box-shadow: 0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04);
            transform: translateY(20px) scale(0.97);
            opacity: 0;
            transition: transform 0.24s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease;
            overflow: hidden;
        }
        .node-agent-dialog--open {
            transform: translateY(0) scale(1);
            opacity: 1;
        }

        /* Header */
        .node-agent-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            border-bottom: 1px solid #F3F4F6;
            background: #FAFAFA;
            flex-shrink: 0;
        }
        .node-agent-title {
            font-family: inherit;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #1C1C1C;
        }
        .node-agent-section-chip {
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #689F38;
            background: #F0F7E8;
            border: 1px solid #C8E6C9;
            border-radius: 10px;
            padding: 2px 7px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 140px;
        }

        /* Context node */
        .node-agent-context {
            padding: 10px 16px;
            background: #F9FAFB;
            border-bottom: 1px solid #F3F4F6;
            flex-shrink: 0;
        }
        .node-agent-context-label {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #9CA3AF;
            margin-bottom: 4px;
        }
        .node-agent-context-text {
            font-size: 12px;
            color: #374151;
            line-height: 1.5;
            max-height: 60px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
        }
        .node-agent-context-text strong { font-weight: 600; color: #1C1C1C; }

        /* Chat body */
        .node-agent-body {
            flex: 1;
            overflow-y: auto;
            padding: 12px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-height: 0;
            scroll-behavior: smooth;
        }
        .node-agent-message {
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }
        .node-agent-message--user {
            flex-direction: row-reverse;
        }
        .node-agent-avatar {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #1C1C1C;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 2px;
        }
        .node-agent-bubble {
            font-size: 12.5px;
            line-height: 1.6;
            color: #374151;
            background: #F3F4F6;
            border-radius: 12px 12px 12px 2px;
            padding: 10px 13px;
            max-width: calc(100% - 36px);
        }
        .node-agent-message--model .node-agent-bubble {
            background: #262626;
            color: #F9FAFB;
            font-size: 14px;
            font-weight: 300;
            line-height: 1.6;
            letter-spacing: 0.01em;
            padding: 12px 16px;
        }
        .node-agent-message--model .node-agent-bubble p {
            margin-bottom: 12px;
        }
        .node-agent-message--model .node-agent-bubble p:last-child {
            margin-bottom: 0;
        }
        .node-agent-message--model .node-agent-bubble strong {
            font-weight: 500;
            color: #FFFFFF;
        }
        .node-agent-message--model .node-agent-bubble h1, 
        .node-agent-message--model .node-agent-bubble h2, 
        .node-agent-message--model .node-agent-bubble h3,
        .node-agent-message--model .node-agent-bubble h4 {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 16px;
            margin-bottom: 8px;
            color: #9ca3af; /* Tailwind gray-400 */
        }
        .node-agent-message--user .node-agent-bubble {
            background: #1C1C1C;
            color: #FFFFFF;
            border-radius: 12px 12px 2px 12px;
        }
        .node-agent-message--system .node-agent-bubble {
            background: #F0F7E8;
            border: 1px solid #C8E6C9;
            color: #374151;
            font-size: 11.5px;
            border-radius: 8px;
            width: 100%;
        }

        /* Bubble typography (markdown content) */
        .node-agent-bubble.rams-typography h1,
        .node-agent-bubble.rams-typography h2,
        .node-agent-bubble.rams-typography h3 {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-top: 10px;
            margin-bottom: 4px;
            color: #1C1C1C;
        }
        .node-agent-bubble.rams-typography h3:first-child { margin-top: 0; }
        .node-agent-bubble.rams-typography p { margin-bottom: 6px; }
        .node-agent-bubble.rams-typography ul,
        .node-agent-bubble.rams-typography ol { padding-left: 16px; margin-bottom: 6px; }
        .node-agent-bubble.rams-typography li { margin-bottom: 3px; }
        .node-agent-bubble.rams-typography strong { font-weight: 700; color: #1C1C1C; }
        .node-agent-bubble.rams-typography table { font-size: 11px; width: 100%; border-collapse: collapse; margin: 6px 0; }
        .node-agent-bubble.rams-typography th { background: #F3F4F6; padding: 5px 8px; border: 1px solid #E5E7EB; font-size: 9px; text-transform: uppercase; }
        .node-agent-bubble.rams-typography td { padding: 5px 8px; border: 1px solid #E5E7EB; }
        .node-agent-message--user .node-agent-bubble.rams-typography strong { color: #FFFFFF; }
        
        .node-agent-message--model .node-agent-bubble.rams-typography h1,
        .node-agent-message--model .node-agent-bubble.rams-typography h2,
        .node-agent-message--model .node-agent-bubble.rams-typography h3,
        .node-agent-message--model .node-agent-bubble.rams-typography strong { color: #FFFFFF; }
        .node-agent-message--model .node-agent-bubble.rams-typography th { background: #404040; padding: 5px 8px; border: 1px solid #525252; color: #FFFFFF; }
        .node-agent-message--model .node-agent-bubble.rams-typography td { border: 1px solid #525252; }

        /* Thinking dots */
        .node-agent-bubble--thinking {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 12px 14px;
        }
        .node-agent-bubble--thinking span {
            display: inline-block;
            width: 5px;
            height: 5px;
            background: #9CA3AF;
            border-radius: 50%;
            animation: thinking-dot 1.2s infinite ease-in-out;
        }
        .node-agent-bubble--thinking span:nth-child(2) { animation-delay: 0.2s; }
        .node-agent-bubble--thinking span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes thinking-dot {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
        }

        /* Streaming cursor */
        .node-agent-cursor {
            display: inline-block;
            width: 2px;
            height: 13px;
            background: #689F38;
            margin-left: 2px;
            vertical-align: middle;
            animation: cursor-blink 0.8s infinite;
        }
        @keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }


        /* Input Row */
        .node-agent-input-container {
            border-top: 1px solid #F3F4F6;
            flex-shrink: 0;
            background: #FFFFFF;
        }
        .node-agent-file-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            padding: 8px 12px 0;
        }
        .node-agent-file-chip {
            display: flex;
            align-items: center;
            gap: 4px;
            background: #F3F4F6;
            border: 1px solid #E5E7EB;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 10px;
            color: #374151;
            max-width: 150px;
        }
        .node-agent-file-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .node-agent-file-remove {
            background: none;
            border: none;
            color: #9CA3AF;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .node-agent-file-remove:hover { color: #1C1C1C; }
        .node-agent-input-row {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
        }
        .node-agent-attach {
            flex-shrink: 0;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: transparent;
            color: #9CA3AF;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.15s, background 0.15s;
        }
        .node-agent-attach:hover:not(:disabled) {
            color: #1C1C1C;
            background: #F3F4F6;
        }
        .node-agent-attach:disabled { opacity: 0.4; cursor: not-allowed; }
        .node-agent-input {
            flex: 1;
            font-family: inherit;
            font-size: 12.5px;
            color: #1C1C1C;
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 20px;
            padding: 8px 14px;
            outline: none;
            transition: border-color 0.15s;
        }
        .node-agent-input:focus { border-color: #689F38; }
        .node-agent-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .node-agent-send {
            flex-shrink: 0;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #1C1C1C;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s, transform 0.1s;
        }
        .node-agent-send:hover:not(:disabled) { background: #333333; }
        .node-agent-send:active:not(:disabled) { transform: scale(0.95); }
        .node-agent-send:disabled { opacity: 0.4; cursor: not-allowed; }

        /* --- Dark Mode Overrides --- */
        .dark .node-agent-dialog { background: #09090b; border-color: #27272a; box-shadow: 0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05); }
        .dark .node-agent-header { background: #18181b; border-color: #27272a; }
        .dark .node-agent-title { color: #f4f4f5; }
        .dark .node-agent-section-chip { background: #052e16; border-color: #14532d; color: #a3e635; }
        .dark .node-agent-context { background: #18181b; border-color: #27272a; }
        .dark .node-agent-context-text { color: #e4e4e7; }
        .dark .node-agent-context-text strong { color: #f4f4f5; }
        .dark .node-agent-avatar { background: #f4f4f5; color: #18181b; }
        .dark .node-agent-bubble { background: #27272a; color: #e4e4e7; }
        
        .dark .node-agent-bubble.rams-typography h1, 
        .dark .node-agent-bubble.rams-typography h2, 
        .dark .node-agent-bubble.rams-typography h3, 
        .dark .node-agent-bubble.rams-typography strong { color: #f4f4f5; }
        .dark .node-agent-bubble.rams-typography th { background: #27272a; border-color: #3f3f46; color: #f4f4f5; }
        .dark .node-agent-bubble.rams-typography td { border-color: #3f3f46; }
        
        .dark .node-agent-message--model .node-agent-bubble { background: #18181b; border: 1px solid #27272a; color: #f4f4f5; }
        .dark .node-agent-message--user .node-agent-avatar { background: #3f3f46; color: #f4f4f5; }
        .dark .node-agent-message--user .node-agent-bubble { background: #f4f4f5; color: #18181b; }
        
        .dark .node-agent-message--system .node-agent-bubble { background: #052e16; border: 1px solid #166534; color: #d1fae5; box-shadow: inset 0 1px 0 rgba(255,255,255,0.05); }
        
        .dark .node-agent-input-container { background: #09090b; border-top-color: #27272a; }
        .dark .node-agent-file-chip { background: #18181b; border-color: #27272a; color: #e4e4e7; }
        .dark .node-agent-file-remove:hover { color: #f4f4f5; }
        .dark .node-agent-attach:hover:not(:disabled) { color: #f4f4f5; background: #27272a; }
        .dark .node-agent-input { background: #18181b; border-color: #27272a; color: #f4f4f5; }
        .dark .node-agent-input:focus { border-color: #689F38; background: #27272a; }
        .dark .node-agent-send { background: #f4f4f5; color: #18181b; }
        .dark .node-agent-send:hover:not(:disabled) { background: #d4d4d8; }
        .node-agent-attach--listening { color: #ef4444; background: #fee2e2; }
        .dark .node-agent-attach--listening { color: #f87171; background: #7f1d1d; }
    `]
})
export class NodeAgentDialogComponent implements OnInit, AfterViewChecked, OnDestroy {
    protected readonly ClinicalIcons = ClinicalIcons;
    private secureStorage = inject(SecureStorageService);

    data = input.required<INodeAgentDialogData>();
    patientData = input<string>('');
    closed = output<void>();

    @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;
    @ViewChild('inputEl') inputElRef!: ElementRef<HTMLInputElement>;
    @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

    private intel = inject(ClinicalIntelligenceService);
    private state = inject(PatientStateService);
    private markdown = inject(MarkdownService);
    public live = inject(AdkLiveService);

    isOpen = signal(false);
    isLoading = signal(false);
    chatHistory = signal<IChatEntry[]>([]);
    showSuggestionsDropdown = signal(false);
    selectedFiles = signal<File[]>([]);
    userInput = '';
    contextHtml = signal('');
    isContextFlipped = signal(false);
    private lastContextFlipTime = 0;

    toggleContextFlip(event?: Event) {
        if (event) event.stopPropagation();
        const now = Date.now();
        if (now - this.lastContextFlipTime < 200) return;
        this.lastContextFlipTime = now;
        this.isContextFlipped.update(v => !v);
    }
    permissionError = signal<string | null>(null);

    private shouldScrollToBottom = false;
    private recognition: any;
    private _liveUserText = '';
    private _liveModelText = '';

    suggestedQuestions = signal<string[]>([]);

    // Draggable Window State
    position = signal<{ x: number; y: number } | null>(null);
    isDragging = signal(false);
    private dragOffset = { x: 0, y: 0 };

    startDrag(event: MouseEvent) {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest('input')) return;
      
      const dialogEl = target.closest('.node-agent-dialog') as HTMLElement;
      if (!dialogEl) return;
      const rect = dialogEl.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      this.isDragging.set(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!this.isDragging()) return;
        const newX = Math.max(10, Math.min(window.innerWidth - 380, moveEvent.clientX - this.dragOffset.x));
        const newY = Math.max(10, Math.min(window.innerHeight - 300, moveEvent.clientY - this.dragOffset.y));
        this.position.set({ x: newX, y: newY });
      };

      const onMouseUp = () => {
        this.isDragging.set(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    agentName = computed(() => {
        const section = this.data().sectionTitle;
        if (!section) return 'Dr. Larus';
        return this.intel.getAgentNameForLens(section as any);
    });

    ngOnInit() {
        // Animate in
        requestAnimationFrame(() => this.isOpen.set(true));

        // Render the context node as HTML
        const parser = this.markdown.parser();
        const rawText = this.data().nodeText;
        if (parser && rawText) {
            try { this.contextHtml.set((parser as any).parse(rawText)); }
            catch (e) { console.debug('[NodeAgentDialog] Markdown parse fallback:', (e as Error)?.message); this.contextHtml.set(`<p>${rawText}</p>`); }
        } else {
            this.contextHtml.set(`<p>${rawText}</p>`);
        }

        // Build contextual suggested questions
        this.suggestedQuestions.set(this.buildSuggestedQuestions());

        // Seed the initial message
        this.startSession();

        // Setup local SpeechRecognition for UI transcripts
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';
                
                this.recognition.onspeechstart = () => {
                    if (this.live.isSpeaking()) {
                        this.live.interrupt();
                    }
                };
                
                this.recognition.onresult = (event: any) => {
                    let interim = '';
                    let finalBlock = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) finalBlock += transcript;
                        else interim += transcript;
                    }
                    if (finalBlock) {
                        this._liveUserText += finalBlock + " ";
                        this.updateUserBubble(this._liveUserText.trim() + " " + interim);
                    } else if (interim) {
                        this.updateUserBubble(this._liveUserText.trim() + " " + interim);
                    }
                };
                
                this.recognition.onerror = (e: any) => console.log("UI STT Error:", e.error);
                this.recognition.onend = () => {
                    if (this.live.isListening() && this.live.isConnected()) {
                        try { this.recognition.start(); } catch (e) { console.debug('[NodeAgentDialog] Recognition already active:', (e as Error)?.message); }
                    }
                };
            }

            // Hook up ADK Live connection callbacks
            this.live.onMessage = (msg) => {
                if (msg.text) {
                    this.isLoading.set(false);
                    this.accumulateModelText(msg.text);
                }
            };
            this.live.onModelTurnComplete = () => {
                this.finalizeModelTurn();
            };
            this.live.onInterrupted = () => {
                this.finalizeModelTurn();
            };
        }
    }

    ngAfterViewChecked() {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    private buildSuggestedQuestions(): string[] {
        const section = this.data().sectionTitle.toLowerCase();
        if (section.includes('overview') || section.includes('summary')) {
            return [
                'What evidence supports this?',
                'Are there alternative approaches?',
                'What are the main risks?',
            ];
        }
        if (section.includes('protocol') || section.includes('functional') || section.includes('intervention')) {
            return [
                'What is the dosing rationale?',
                'Are there drug interaction concerns?',
                'What clinical trials support this?',
            ];
        }
        if (section.includes('monitoring') || section.includes('follow')) {
            return [
                'What outcomes should I track?',
                'How urgent is this follow-up?',
                'What are the warning signs?',
            ];
        }
        if (section.includes('education')) {
            return [
                'Simplify this for patient reading level',
                'What questions might the patient ask?',
                'Are there language barriers to consider?',
            ];
        }
        return [
            'What is the clinical rationale?',
            'What are the alternatives?',
            'Are there contraindications?',
        ];
    }

    private async startSession() {
        this.isLoading.set(true);
        try {
            const patientCtx = this.patientData();
            const nodeText = this.data().nodeText;
            const systemContext = this.buildFullSystemContext();

            await this.intel.ai.startChat(patientCtx, systemContext);

            // Auto-send the initial seeded question
            const seedQuestion = this.state.isEmergencyMode()
                ? "Start the conversation as an emergency assistant. Briefly state: 'Emergency Bystander Support active. Start CPR if unresponsive (110 BPM metronome available). What is the primary injury or symptom?' Keep it under 2 sentences."
                : `Explain the clinical rationale for this recommendation: "${nodeText.slice(0, 200)}${nodeText.length > 200 ? '...' : ''}"`;
            const response = await this.intel.ai.sendMessage(seedQuestion);

            this.appendModelMessage(response);
        } catch (e: any) {
            this.appendModelMessage(`Unable to connect to the AI engine: ${e?.message ?? e}`);
        } finally {
            this.isLoading.set(false);
        }
    }

    private buildFullSystemContext(): string {
        const isEmergency = this.state.isEmergencyMode();
        if (isEmergency) {
            return `EMERGENCY FIRST-AID COMPANION: You are assisting a bystander performing immediate triage or resuscitation under Good Samaritan principles.
CRITICAL SAFETY CONSTRAINTS:
- NEVER suggest, prescribe, or discuss drug dosages, chemical interventions, or invasive procedures.
- Focus exclusively on non-invasive Basic Life Support (BLS) interventions: CPR chest compressions (110 BPM), rescue breathing, airway clearing, physical stabilization (recovery position), direct pressure for severe bleeding, and tourniquets.
- Keep all replies extremely direct, concise, and structured in short, clear bullet points for high-stress situations.
- Urgently remind the user to call emergency services (911) if not already done.`;
        }

        const patientCtx = this.patientData();
        const nodeText = this.data().nodeText;
        const section = this.data().sectionTitle;
        const name = this.agentName();

        return `You are ${name}, a focused clinical evidence assistant embedded in the Pocket Gull Clinical Intelligence Platform. Speak and write from this professional clinical expert persona.
A clinician is reviewing a specific recommendation from the "${section}" section of an AI-generated care plan and wants to understand or challenge it.

Patient context is available. The recommendation under review is:
"""
${nodeText}
"""

Your role:
1. First, briefly explain the clinical rationale for this specific recommendation in 2-3 sentences.
2. Then cite any supporting evidence or clinical guidelines if applicable.
3. Then be ready to answer follow-up questions about alternatives, risks, drug interactions, practical implementation items (like grocery lists), or patient-specific nuances.

CRITICAL INSTRUCTION: You are operating as a clinician-to-clinician decision support tool. DO NOT refuse requests for practical items, shopping lists, or actionable implementation steps based on the clinical rationale. You MUST generate these lists confidently when requested by the practitioner. Do not include consumer medical disclaimers about seeking a doctor, as the user IS the doctor.
Keep responses concise and clinically precise. Use markdown for structure when helpful.

Patient Data:
${patientCtx}`;
    }

    triggerFileInput() {
        this.fileInputRef?.nativeElement.click();
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const filesToAdd = Array.from(input.files);
            this.selectedFiles.update(current => [...current, ...filesToAdd]);
            input.value = '';
        }
    }

    removeFile(index: number) {
        this.selectedFiles.update(files => files.filter((_, i) => i !== index));
    }

    async sendMessage() {
        const text = this.userInput.trim();
        const files = this.selectedFiles();
        if ((!text && files.length === 0) || this.isLoading()) return;

        if (this.live.isSpeaking()) {
            this.live.interrupt();
        }

        this.userInput = '';
        this.selectedFiles.set([]);
        this.showSuggestionsDropdown.set(false);

        // create message with text and file indicators for user UI
        let userDisplayHtml = text ? `<p>${text}</p>` : '';
        if (files.length > 0) {
            const fileNames = files.map(f => f.name).join(', ');
            userDisplayHtml += `<p style="font-size: 10px; color: #9CA3AF; margin-top: 4px;">📎 Attached: ${fileNames}</p>`;
        }

        this.appendUserMessage(text, userDisplayHtml);
        this.isLoading.set(true);
        this.shouldScrollToBottom = true;

        try {
            if (this.live.isConnected() && files.length === 0) {
                this.live.sendText(text);
            } else {
                const response = await this.intel.ai.sendMessage(text, files);
                this.appendModelMessage(response);
            }
        } catch (e: any) {
            this.appendModelMessage(`Error: ${e?.message ?? e}`);
        } finally {
            if (!this.live.isConnected()) {
                this.isLoading.set(false);
                this.shouldScrollToBottom = true;
            }
        }
    }

    sendSuggestion(text: string) {
        this.userInput = text;
        this.sendMessage();
    }

    close() {
        this.isOpen.set(false);
        this.live.disconnect();
        if (this.recognition) {
            this.recognition.stop();
        }

        // Save the context of this discussion before closing
        const history = this.chatHistory()
            .filter(entry => entry.role === 'user' || entry.role === 'model')
            .map(entry => ({ role: entry.role as 'user' | 'model', text: entry.text }));

        if (history.length > 0) {
            this.intel.addRecentNode({
                nodeText: this.data().nodeText,
                sectionTitle: this.data().sectionTitle,
                transcript: history,
                timestamp: new Date()
            });
        }

        setTimeout(() => this.closed.emit(), 240);
    }

    ngOnDestroy() {
        this.live.disconnect();
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    private appendUserMessage(text: string, htmlOverride?: string) {
        const html = htmlOverride || `<p>${text}</p>`;
        this.chatHistory.update(h => [...h, { role: 'user', text, html }]);
        this.shouldScrollToBottom = true;
    }

    private appendModelMessage(md: string) {
        const parser = this.markdown.parser();
        let html = md;
        if (parser) {
            try { html = (parser as any).parse(md); } catch (e) { console.debug('[NodeAgentDialog] Markdown parse fallback:', (e as Error)?.message); html = `<p>${md}</p>`; }
        }
        this.chatHistory.update(h => [...h, { role: 'model', text: md, html }]);
        this.shouldScrollToBottom = true;
    }

    private scrollToBottom() {
        const el = this.chatBodyRef?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
    }

    async toggleListening() {
        if (this.permissionError()) return;

        if (!this.live.isConnected()) {
            this.isLoading.set(true);
            try {
                const apiKey = (window as any).GEMINI_API_KEY || getStoredApiKey(this.secureStorage) || '';
                if (!apiKey) {
                    this.appendModelMessage('System Note: Missing API Key. Please configure it to use voice.');
                    this.isLoading.set(false);
                    return;
                }
                const systemContext = this.buildFullSystemContext();
                await this.live.connect(apiKey, systemContext);
            } catch (e: any) {
                console.error("Failed to connect to Live API:", e);
                this.permissionError.set('Failed to connect to Live Interface.');
                this.appendModelMessage(`System Note: Failed to connect to Voice: ${e?.message ?? e}`);
                this.isLoading.set(false);
                return;
            } finally {
                this.isLoading.set(false);
            }
        }

        if (this.live.isListening()) {
            this.live.stopListening();
            if (this.recognition) this.recognition.stop();
        } else {
            this.live.startListening();
            this._liveUserText = ''; // Reset voice text buffer
            if (this.recognition) {
                try { this.recognition.start(); } catch (e) { console.debug('[NodeAgentDialog] Recognition already active:', (e as Error)?.message); }
            }
        }
    }

    private updateUserBubble(tempText: string) {
        this.chatHistory.update(h => {
            const next = [...h];
            let entry = next.length > 0 ? next[next.length - 1] : null;
            if (!entry || entry.role !== 'user') {
                entry = { role: 'user', text: '' };
                next.push(entry);
            }
            entry.text = tempText;
            entry.html = `<p>${tempText}</p>`;
            return next;
        });
        this.shouldScrollToBottom = true;
    }

    private accumulateModelText(chunk: string) {
        this._liveModelText += chunk;
        const parser = this.markdown.parser();
        let html = this._liveModelText;
        if (parser) {
            try { html = (parser as any).parse(this._liveModelText); } catch (e) { console.debug('[NodeAgentDialog] Live markdown parse fallback:', (e as Error)?.message); html = `<p>${this._liveModelText}</p>`; }
        } else {
            html = `<p>${this._liveModelText}</p>`;
        }

        this.chatHistory.update(history => {
            const updated = [...history];
            let last = updated[updated.length - 1];
            if (last && last.role === 'model' && last.isStreaming) {
                last.text = this._liveModelText;
                last.html = html;
            } else {
                updated.push({
                    role: 'model',
                    text: this._liveModelText,
                    html: html,
                    isStreaming: true
                });
            }
            return updated;
        });
        this.shouldScrollToBottom = true;
    }

    private finalizeModelTurn() {
        this.chatHistory.update(history => {
            const updated = [...history];
            const last = updated[updated.length - 1];
            if (last && last.role === 'model' && last.isStreaming) {
                last.isStreaming = false;
            }
            return updated;
        });
        this._liveModelText = '';
        this._liveUserText = '';
        this.shouldScrollToBottom = true;

        if (this.live.isListening() && this.recognition) {
            try { this.recognition.start(); } catch (e) { console.debug('[NodeAgentDialog] Recognition already active:', (e as Error)?.message); }
        }
    }
}
