import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: { _seconds: number, _nanoseconds: number } | string;
  lastUsedAt?: { _seconds: number, _nanoseconds: number } | string;
  status: 'active' | 'revoked';
}

@Component({
  selector: 'app-api-key-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-all">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">API Keys</h2>
          <p class="text-sm text-gray-500 mt-1">Manage federation keys for clinical intelligence access.</p>
        </div>
        <button (click)="isGenerating.set(true)" 
                class="px-4 py-2 bg-brand-green hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Generate New Key
        </button>
      </div>

      <!-- Generate Key Form -->
      @if (isGenerating()) {
        <div class="mb-8 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-700">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Create new API key</h3>
          <div class="flex gap-3">
            <input type="text" [(ngModel)]="newKeyName" placeholder="e.g. Production Mobile App" 
                   class="flex-1 rounded-lg border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm shadow-sm focus:border-brand-green focus:ring-brand-green">
            <button (click)="generateKey()" [disabled]="!newKeyName().trim() || isLoading()"
                    class="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg text-sm disabled:opacity-50 transition-colors">
              {{ isLoading() ? 'Creating...' : 'Create' }}
            </button>
            <button (click)="isGenerating.set(false)" 
                    class="px-4 py-2 bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      }

      <!-- New Raw Key Display -->
      @if (newlyGeneratedKey()) {
        <div class="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-brand-amber rounded-xl" role="alert">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-brand-amber dark:text-amber-400 font-medium text-sm">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Please copy this key now. It will not be shown again.
            </div>
            <div class="flex items-center gap-2 mt-2">
              <code class="flex-1 p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 break-all select-all">
                {{ newlyGeneratedKey() }}
              </code>
              <button (click)="copyToClipboard()" class="p-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500" title="Copy to clipboard">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            @if (copied()) {
              <span class="text-xs font-medium text-brand-green">Copied to clipboard!</span>
            }
          </div>
        </div>
      }

      <!-- Keys Table -->
      <div class="overflow-hidden border border-gray-200 dark:border-zinc-800 rounded-xl">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead class="bg-gray-50 dark:bg-zinc-800/50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            @for (key of activeKeys(); track key.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ key.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{{ key.prefix }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(key.createdAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(key.lastUsedAt) || 'Never' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="revokeKey(key.id)" 
                          class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                    Revoke
                  </button>
                </td>
              </tr>
            }
            @if (activeKeys().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">
                  No active API keys found.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ApiKeyManagerComponent implements OnInit {
  keys = signal<ApiKey[]>([]);
  isGenerating = signal(false);
  newKeyName = signal('');
  newlyGeneratedKey = signal<string | null>(null);
  isLoading = signal(false);
  copied = signal(false);

  activeKeys = computed(() => this.keys().filter(k => k.status === 'active'));

  private http = inject(HttpClient);

  ngOnInit() {
    this.loadKeys();
  }

  loadKeys() {
    // Requires authentication headers in a real scenario
    this.http.get<ApiKey[]>('/api/keys', {
      headers: { 'x-tenant-id': 'demo-tenant-123' }
    }).subscribe({
      next: (data) => this.keys.set(data),
      error: (err) => console.error('Failed to load keys', err)
    });
  }

  generateKey() {
    if (!this.newKeyName().trim()) return;
    this.isLoading.set(true);
    
    this.http.post<{ rawKey: string, keyId: string }>('/api/keys/generate', { name: this.newKeyName() }, {
      headers: { 'x-tenant-id': 'demo-tenant-123' }
    }).subscribe({
      next: (res) => {
        this.newlyGeneratedKey.set(res.rawKey);
        this.isGenerating.set(false);
        this.newKeyName.set('');
        this.isLoading.set(false);
        this.copied.set(false);
        this.loadKeys(); // Refresh the list
      },
      error: (err) => {
        console.error('Failed to generate key', err);
        this.isLoading.set(false);
      }
    });
  }

  revokeKey(keyId: string) {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      this.http.delete(`/api/keys/${keyId}`, {
        headers: { 'x-tenant-id': 'demo-tenant-123' }
      }).subscribe({
        next: () => this.loadKeys(),
        error: (err) => console.error('Failed to revoke key', err)
      });
    }
  }

  copyToClipboard() {
    const key = this.newlyGeneratedKey();
    if (key) {
      navigator.clipboard.writeText(key).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 3000);
      });
    }
  }

  formatDate(dateObj: any): string {
    if (!dateObj) return '';
    
    if (typeof dateObj === 'string') {
      return new Date(dateObj).toLocaleDateString();
    }
    
    if (dateObj._seconds) {
      return new Date(dateObj._seconds * 1000).toLocaleDateString();
    }
    
    return '';
  }
}
