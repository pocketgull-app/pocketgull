import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SecureStorageService } from './secure-storage.service';

export interface IOrcidWork {
  title: string;
  url?: string;
  type?: string;
  year?: string;
}

export interface IOrcidProfile {
  orcidId: string;
  name: string;
  keywords: string[];
  works: IOrcidWork[];
  urls: { name: string; url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrcidService {
  private http = inject(HttpClient);
  private storage = inject(SecureStorageService);

  readonly orcidId = signal<string | null>(null);
  readonly orcidProfile = signal<IOrcidProfile | null>(null);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Computed helper to check if connected
  readonly isConnected = computed(() => !!this.orcidId());

  constructor() {
    const savedId = this.storage.getItem('orcid_id');
    if (savedId) {
      this.orcidId.set(savedId);
      this.fetchProfile(savedId);
    }
  }

  /**
   * Connects an ORCID iD and fetches the public record
   */
  async connectOrcid(id: string): Promise<boolean> {
    const cleanId = id.trim().replace(/https?:\/\/orcid\.org\//, '');
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(cleanId)) {
      this.error.set('Invalid ORCID iD format. Expected: 0000-0002-1825-0097');
      return false;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const data = await this.http.get<any>(`/api/orcid/${cleanId}`).toPromise();
      const parsed = this.parseOrcidData(cleanId, data);
      
      this.orcidId.set(cleanId);
      this.orcidProfile.set(parsed);
      
      this.storage.setItem('orcid_id', cleanId);
      return true;
    } catch (err: any) {
      console.error('Failed to load ORCID profile:', err);
      this.error.set(err.error?.error || 'Failed to fetch profile from ORCID.');
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Disconnects ORCID connection
   */
  disconnect() {
    this.orcidId.set(null);
    this.orcidProfile.set(null);
    this.error.set(null);
    this.storage.removeItem('orcid_id');
  }

  private async fetchProfile(id: string) {
    try {
      const data = await this.http.get<any>(`/api/orcid/${id}`).toPromise();
      const parsed = this.parseOrcidData(id, data);
      this.orcidProfile.set(parsed);
    } catch (err: any) {
      console.error('Failed to auto-refresh ORCID profile:', err);
      this.error.set('Failed to load saved ORCID profile.');
    }
  }

  /**
   * Parse the ORCID JSON record response into a clean clinical context model
   */
  private parseOrcidData(orcidId: string, raw: any): IOrcidProfile {
    const person = raw?.person;
    const givenNames = person?.name?.['given-names']?.value || '';
    const familyName = person?.name?.['family-name']?.value || '';
    const name = `${givenNames} ${familyName}`.trim() || 'Anonymous Researcher';

    const keywords: string[] = [];
    if (person?.keywords?.keyword && Array.isArray(person.keywords.keyword)) {
      for (const k of person.keywords.keyword) {
        if (k?.content) keywords.push(k.content);
      }
    }

    const urls: { name: string; url: string }[] = [];
    if (person?.['researcher-urls']?.['researcher-url'] && Array.isArray(person['researcher-urls']['researcher-url'])) {
      for (const u of person['researcher-urls']['researcher-url']) {
        if (u?.url?.value) {
          urls.push({ name: u['url-name'] || u.url.value, url: u.url.value });
        }
      }
    }

    const works: IOrcidWork[] = [];
    const groups = raw?.['activities-summary']?.works?.group;
    if (groups && Array.isArray(groups)) {
      for (const group of groups) {
        const summaries = group?.['work-summary'];
        if (summaries && Array.isArray(summaries) && summaries.length > 0) {
          const work = summaries[0]; // Get primary summary
          const title = work?.title?.title?.value;
          if (title) {
            works.push({
              title,
              url: work.url?.value,
              type: work.type,
              year: work['publication-date']?.year?.value
            });
          }
        }
      }
    }

    return { orcidId, name, keywords, works, urls };
  }
}
