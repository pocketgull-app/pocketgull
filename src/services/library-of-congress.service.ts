import { Injectable, inject } from '@angular/core';
import { BionicReadingService } from './bionic-reading.service';

export interface ILocSearchItem {
  id: string;
  title: string;
  authors: string[];
  date: string;
  lccn?: string;
  subjects: string[];
  lccClass?: string;
  url: string;
  summary: string;
  digitalResourceUrl?: string;
  isPublicDomain: boolean;
}

export interface ILocSearchResult {
  query: string;
  totalResults: number;
  items: ILocSearchItem[];
}

export interface ILocSubjectHeading {
  uri: string;
  prefLabel: string;
  lccClass: string;
  category: 'clinical_medicine' | 'pharmacology_posology' | 'nursing_care' | 'psychology_mind' | 'integrative_systems';
}

export interface ILocBionicPassage {
  title: string;
  authors: string[];
  date: string;
  lccn?: string;
  lccClass?: string;
  wordCount: number;
  readingTimeSeconds450Wpm: number;
  bionicHtml: string;
  plainText: string;
  keyTerms: string[];
  sourceUrl: string;
}

/**
 * Curated Public Domain Medical & Caregiving Codices in the Library of Congress
 * Ready for immediate offline indexing and Bionic RSVP speed reading.
 */
export const LOC_HISTORICAL_MEDICAL_ARCHIVE: ILocSearchItem[] = [
  {
    id: 'loc-edwin-smith-codex',
    title: 'The Edwin Smith Surgical Papyrus: Hieroglyphic Transliteration and Translation',
    authors: ['James Henry Breasted (Translator)', 'Edwin Smith (Collector)'],
    date: '1930',
    lccn: '30030538',
    subjects: ['Surgery, Ancient', 'Medicine, Egyptian', 'Trauma, Head and Spine'],
    lccClass: 'RD19',
    url: 'https://www.loc.gov/item/30030538/',
    summary: 'The earliest known scientific surgical codex, describing 48 cases of clinical examination, diagnosis, cranial sutures, and neurological prognosis with zero magical invocation.',
    digitalResourceUrl: 'https://www.loc.gov/resource/rbc.0001.2018breasted/',
    isPublicDomain: true
  },
  {
    id: 'loc-nightingale-nursing',
    title: 'Notes on Nursing: What It Is, and What It Is Not',
    authors: ['Florence Nightingale'],
    date: '1860',
    lccn: '07024346',
    subjects: ['Nursing Care', 'Sanitation', 'Patient Environment', 'Circadian Airflow'],
    lccClass: 'RT40',
    url: 'https://www.loc.gov/item/07024346/',
    summary: 'Foundational clinical nursing text establishing the importance of clean air, gentle illumination, quiet nocturnal rest, and dietary timing for physiological recovery.',
    digitalResourceUrl: 'https://www.loc.gov/resource/rbc0001.2007nightingale/',
    isPublicDomain: true
  },
  {
    id: 'loc-osler-aequanimitas',
    title: 'Aequanimitas, with Other Addresses to Medical Students, Nurses and Practitioners',
    authors: ['Sir William Osler'],
    date: '1904',
    lccn: '04029199',
    subjects: ['Medical Ethics', 'Clinical Observation', 'Physician Resilience', 'Equanimity'],
    lccClass: 'R708',
    url: 'https://www.loc.gov/item/04029199/',
    summary: 'Classic clinical essays on cultivating imperturbability, attentive patient listening, and lifelong scientific curiosity at the hospital bedside.',
    digitalResourceUrl: 'https://www.loc.gov/resource/rbc0001.2004osler/',
    isPublicDomain: true
  },
  {
    id: 'loc-holt-child-posology',
    title: 'The Care and Feeding of Children: A Catechism for the Use of Mothers and Children’s Nurses',
    authors: ['L. Emmett Holt, M.D.'],
    date: '1894',
    lccn: '00004928',
    subjects: ['Pediatrics', 'Infant Nutrition', 'Pediatric Posology', 'Hydration'],
    lccClass: 'RJ61',
    url: 'https://www.loc.gov/item/00004928/',
    summary: 'Historic pediatric clinical guide establishing standardized weight-based feeding intervals, nursery air quality, and plain-language parent-facing dosage communication.',
    digitalResourceUrl: 'https://www.loc.gov/resource/rbc0001.2000holt/',
    isPublicDomain: true
  },
  {
    id: 'loc-sushruta-samhita',
    title: 'An English Translation of the Sushruta Samhita, Based on Original Sanskrit Text',
    authors: ['Kaviraj Kunja Lal Bhishagratna (Translator)'],
    date: '1907',
    lccn: '11005244',
    subjects: ['Ayurvedic Medicine', 'Surgery, Ancient', 'Rhinoplasty', 'Marmas and Channels'],
    lccClass: 'R127.2',
    url: 'https://www.loc.gov/item/11005244/',
    summary: 'One of the foundational treatises of traditional Ayurvedic medicine and surgery, detailing anatomical marma points, herbal therapeutics, and surgical instruments.',
    digitalResourceUrl: 'https://www.loc.gov/resource/rbc0001.2011bhishagratna/',
    isPublicDomain: true
  }
];

@Injectable({
  providedIn: 'root'
})
export class LibraryOfCongressService {
  private readonly bionic = inject(BionicReadingService, { optional: true });

  /**
   * Official Library of Congress Subject Headings (LCSH) & LCC Class mapping
   */
  private readonly subjectRegistry: Record<string, ILocSubjectHeading> = {
    cardiovascular: {
      uri: 'http://id.loc.gov/authorities/subjects/sh85020227',
      prefLabel: 'Cardiovascular system--Diseases',
      lccClass: 'RC666-RC701',
      category: 'clinical_medicine'
    },
    renal: {
      uri: 'http://id.loc.gov/authorities/subjects/sh85072255',
      prefLabel: 'Kidneys--Diseases',
      lccClass: 'RC902-RC918',
      category: 'clinical_medicine'
    },
    posology: {
      uri: 'http://id.loc.gov/authorities/subjects/sh85105374',
      prefLabel: 'Drugs--Dosage (Posology)',
      lccClass: 'RM145',
      category: 'pharmacology_posology'
    },
    bibliotherapy: {
      uri: 'http://id.loc.gov/authorities/subjects/sh85013893',
      prefLabel: 'Bibliotherapy',
      lccClass: 'RC489.B48',
      category: 'psychology_mind'
    },
    nursing: {
      uri: 'http://id.loc.gov/authorities/subjects/sh85093362',
      prefLabel: 'Nursing Care & Patient Environment',
      lccClass: 'RT40-RT120',
      category: 'nursing_care'
    },
    osteopathy: {
      uri: 'http://id.loc.gov/authorities/subjects/sh85095982',
      prefLabel: 'Osteopathic medicine',
      lccClass: 'RZ301-RZ399',
      category: 'integrative_systems'
    },
    autonomic: {
      uri: 'http://id.loc.gov/authorities/subjects/sh85010414',
      prefLabel: 'Autonomic nervous system',
      lccClass: 'QP368',
      category: 'clinical_medicine'
    }
  };

  /**
   * Searches public domain medical literature from the Library of Congress.
   * Leverages live loc.gov JSON API with fallback to curated offline codices.
   */
  async searchHistoricalMedicalTexts(query: string, limit: number = 5): Promise<ILocSearchResult> {
    const cleanQuery = query.trim().toLowerCase();

    // 1. Check offline curated collection first for instant latency & offline reliability
    const matchedCurated = LOC_HISTORICAL_MEDICAL_ARCHIVE.filter(item => {
      const fullContent = `${item.title} ${item.summary} ${item.subjects.join(' ')}`.toLowerCase();
      return cleanQuery.split(/\s+/).some(term => fullContent.includes(term));
    });

    if (matchedCurated.length > 0) {
      return {
        query,
        totalResults: matchedCurated.length,
        items: matchedCurated.slice(0, limit)
      };
    }

    // 2. Query Live LOC JSON API if online
    if (typeof fetch !== 'undefined') {
      try {
        const url = `https://www.loc.gov/books/?q=${encodeURIComponent(query)}&fo=json&c=${Math.min(limit, 10)}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(4000)
        });

        if (response.ok) {
          const data = await response.json();
          const results = data?.results || [];

          const items: ILocSearchItem[] = results.map((res: any, idx: number) => ({
            id: `loc-live-${res.id || idx}`,
            title: res.title || 'Historical Medical Work',
            authors: Array.isArray(res.contributor) ? res.contributor : [res.contributor || 'Library of Congress Collection'],
            date: res.date || 'Historical',
            lccn: res.shelf_id || undefined,
            subjects: Array.isArray(res.subject) ? res.subject.slice(0, 4) : [],
            lccClass: res.call_number ? res.call_number[0] : 'R',
            url: res.url || `https://www.loc.gov/item/${res.id || ''}`,
            summary: Array.isArray(res.description) ? res.description[0] : (res.description || res.title || ''),
            digitalResourceUrl: res.image_url ? res.image_url[0] : undefined,
            isPublicDomain: true
          }));

          if (items.length > 0) {
            return {
              query,
              totalResults: data.pagination?.total || items.length,
              items: items.slice(0, limit)
            };
          }
        }
      } catch {
        // Fall back gracefully to curated catalog on timeout or offline mode
      }
    }

    // Return general curated catalog as safe deterministic fallback
    return {
      query,
      totalResults: LOC_HISTORICAL_MEDICAL_ARCHIVE.length,
      items: LOC_HISTORICAL_MEDICAL_ARCHIVE.slice(0, limit)
    };
  }

  /**
   * Resolves a clinical or lifestyle query to canonical Library of Congress Subject Headings (LCSH)
   */
  resolveSubjectHeading(queryTerm: string): ILocSubjectHeading {
    const term = queryTerm.toLowerCase().trim();
    for (const [key, heading] of Object.entries(this.subjectRegistry)) {
      if (term.includes(key) || heading.prefLabel.toLowerCase().includes(term)) {
        return heading;
      }
    }

    return {
      uri: 'http://id.loc.gov/authorities/subjects/sh85083064',
      prefLabel: 'Medicine--History and philosophy',
      lccClass: 'R131-R687',
      category: 'clinical_medicine'
    };
  }

  /**
   * Adapts a Library of Congress item into a Bionic Reading study passage
   * with Optimal Recognition Point (ORP) fixation anchors.
   */
  convertToBionicPassage(item: ILocSearchItem): ILocBionicPassage {
    const passageText = `${item.title}. Author: ${item.authors.join(', ')} (${item.date}). ${item.summary}`;
    const words = passageText.trim().split(/\s+/);
    const wordCount = words.length;
    // 450 words per minute clinical reading speed
    const readingTimeSeconds = Math.max(3, Math.round((wordCount / 450) * 60));

    const bionicHtml = this.bionic
      ? this.bionic.formatToBionicHtml(passageText, 'bionic-fixation font-extrabold text-teal-600 dark:text-teal-400')
      : `<strong>${item.title}</strong>: ${item.summary}`;

    return {
      title: item.title,
      authors: item.authors,
      date: item.date,
      lccn: item.lccn,
      lccClass: item.lccClass,
      wordCount,
      readingTimeSeconds450Wpm: readingTimeSeconds,
      bionicHtml,
      plainText: passageText,
      keyTerms: item.subjects,
      sourceUrl: item.url
    };
  }
}
