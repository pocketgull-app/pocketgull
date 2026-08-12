import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface IVertexSearchResult {
    document: {
        name: string;
        id: string;
        derivedStructData?: {
            title?: string;
            link?: string;
            snippets?: Array<{
                snippet?: string;
                snippet_status?: string;
            }>;
            extractive_answers?: Array<{
                content?: string;
            }>;
        };
    };
}

@Component({
    selector: 'app-vertex-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="vertex-search-container max-w-4xl mx-auto w-full font-sans">
            <!-- Search Header -->
            <div class="flex items-center gap-3 mb-6 relative">
                <div class="relative w-full group">
                    <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg class="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        [(ngModel)]="searchQuery" 
                        (keyup.enter)="performSearch()"
                        placeholder="Search enterprise clinical protocols (GenAI App Builder)..." 
                        class="w-full pl-12 pr-12 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        [disabled]="isLoading()"
                    />
                    <button 
                        (click)="performSearch()"
                        [disabled]="isLoading() || !searchQuery().trim()"
                        class="absolute inset-y-2 right-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center">
                        @if (isLoading()) {
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        } @else {
                            <span>Search</span>
                        }
                    </button>
                </div>
            </div>

            <!-- Error State -->
            @if (error()) {
                <div class="mb-6 p-4 bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                    <svg class="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div class="text-sm text-red-800 dark:text-red-200">{{ error() }}</div>
                </div>
            }

            <!-- Results List -->
            @if (results().length > 0) {
                <div class="space-y-4">
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 flex items-center justify-between">
                        <span>Top Enterprise Results</span>
                        <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Vertex AI Search</span>
                    </div>
                    
                    @for (result of results(); track result.document.id) {
                        <div class="group p-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-zinc-800 transition-all duration-200 cursor-default">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {{ getTitle(result) }}
                            </h3>
                            
                            @if (getLink(result)) {
                                <a [href]="getLink(result)" target="_blank" rel="noopener noreferrer" class="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    View Source Document
                                </a>
                            }

                            <div class="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed" [innerHTML]="getSnippet(result)"></div>
                        </div>
                    }
                </div>
            } @else if (hasSearched() && !isLoading()) {
                <div class="text-center py-12 px-4 bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 backdrop-blur-sm">
                    <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 mb-4">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">No protocols found</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your clinical terminology.</p>
                </div>
            }
        </div>
    `
})
export class VertexSearchComponent {
    private http = inject(HttpClient);
    private sanitizer = inject(DomSanitizer);

    searchQuery = signal('');
    isLoading = signal(false);
    hasSearched = signal(false);
    error = signal<string | null>(null);
    results = signal<IVertexSearchResult[]>([]);

    async performSearch() {
        const query = this.searchQuery().trim();
        if (!query) return;

        this.isLoading.set(true);
        this.error.set(null);
        this.hasSearched.set(true);

        try {
            this.http.post<{ results?: IVertexSearchResult[] }>('/api/ai/vertex-search', { query })
                .subscribe({
                    next: (res) => {
                        this.results.set(res.results || []);
                        this.isLoading.set(false);
                    },
                    error: (err) => {
                        console.error('Vertex Search Error:', err);
                        this.error.set('Failed to connect to Vertex AI Search. ' + (err.error?.error || err.message));
                        this.isLoading.set(false);
                        this.results.set([]);
                    }
                });
        } catch (err: any) {
            this.error.set(err.message || 'An unexpected error occurred.');
            this.isLoading.set(false);
        }
    }

    getTitle(result: IVertexSearchResult): string {
        return result.document?.derivedStructData?.title || 'Clinical Protocol Document';
    }

    getLink(result: IVertexSearchResult): string | null {
        return result.document?.derivedStructData?.link || null;
    }

    getSnippet(result: IVertexSearchResult): SafeHtml {
        let snippetText = result.document?.derivedStructData?.snippets?.[0]?.snippet || 
                          result.document?.derivedStructData?.extractive_answers?.[0]?.content || 
                          'No snippet available.';
        
        // Vertex AI returns HTML bold tags for highlights, we must sanitize it
        return this.sanitizer.bypassSecurityTrustHtml(snippetText);
    }
}
