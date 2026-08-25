import { Injectable } from '@angular/core';

// ─── Rich Media Card Interfaces ───────────────────────────────────────────────

export interface IThreeJsModel {
    id: string;
    name: string;
    description: string;
    threejsId: string;
    severity?: 'green' | 'yellow' | 'red';
    afflictionHighlight?: string;
    particles?: boolean;
}

export interface IWikimediaImage {
    title: string;
    url: string;
    thumbUrl: string;
    descriptionUrl: string;
    credit: string;
    license: string;
}

export interface IPubmedCitation {
    pmid: string;
    title: string;
    authors: string;
    journal: string;
    year: string;
    abstract: string;
    url: string;
}

export interface IPhilImage {
    id: number;
    url: string;
    thumbUrl: string;
    title: string;
    credit: string;
}

export type RichCardKind = 'model-3d' | 'image-gallery' | 'pubmed-refs' | 'phil-image';

export interface IRichMediaCard {
    kind: RichCardKind;
    query: string;
    severity?: 'green' | 'yellow' | 'red';
    afflictionHighlight?: string;
    particles?: boolean;
    // Resolved data (populated after fetching)
    models?: IThreeJsModel[];
    images?: IWikimediaImage[];
    citations?: IPubmedCitation[];
    philImages?: IPhilImage[];
    // Loading state
    loading?: boolean;
    error?: string;
}

// ─── Curated Three.js Procedural Registry ────────────────────────────────────
// Rendered locally using procedural shapes in Medical3DViewerComponent

const THREEJS_REGISTRY: Record<string, IThreeJsModel[]> = {
    'spine': [
        {
            id: 'spine',
            name: 'Vertebral Column',
            description: 'Procedural spine segment',
            threejsId: 'spine'
        }
    ],
    'vertebra': [
        {
            id: 'spine',
            name: 'Vertebra Segment',
            description: 'Procedural vertebral segment',
            threejsId: 'spine'
        }
    ],
    'disc herniation': [
        {
            id: 'spine',
            name: 'Spinal Structure',
            description: 'Procedural spine segment',
            threejsId: 'spine'
        }
    ],
    'heart': [
        {
            id: 'heart',
            name: 'Human Heart',
            description: 'Procedural cardiac form',
            threejsId: 'heart'
        }
    ],
    'brain': [
        {
            id: 'brain',
            name: 'Human Brain',
            description: 'Procedural neurological visualization',
            threejsId: 'brain'
        }
    ],
    'lungs': [
        {
            id: 'lungs',
            name: 'Human Lungs',
            description: 'Procedural pulmonary system',
            threejsId: 'lungs'
        }
    ],
    'default': [
        {
            id: 'generic',
            name: 'Organ System Reference',
            description: 'Procedural internal volume reference',
            threejsId: 'generic'
        }
    ]
};

// ─── Curated PHIL Image Registry ─────────────────────────────────────────────
// Public domain CDC images — no API key required

const PHIL_REGISTRY: Record<string, IPhilImage[]> = {
    'spine': [
        { id: 9501, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/9501/9501.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/9501/9501_lores.jpg', title: 'Spinal anatomy diagram', credit: 'CDC/PHIL' },
    ],
    'pain': [
        { id: 23258, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/23258/23258.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/23258/23258_lores.jpg', title: 'Chronic pain clinical assessment', credit: 'CDC/PHIL' },
    ],
    'opioid': [
        { id: 22940, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/22940/22940.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/22940/22940_lores.jpg', title: 'Opioid prescribing awareness', credit: 'CDC/PHIL' },
    ],
    'depression': [
        { id: 23095, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/23095/23095.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/23095/23095_lores.jpg', title: 'Mental health and depression', credit: 'CDC/PHIL' },
    ],
    'default': [
        { id: 11162, url: 'https://wwwn.cdc.gov/phil/PHIL_Images/11162/11162.jpg', thumbUrl: 'https://wwwn.cdc.gov/phil/PHIL_Images/11162/11162_lores.jpg', title: 'Clinical care setting', credit: 'CDC/PHIL' },
    ]
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class RichMediaService {

    // ─── Procedural Models (local registry) ───────────────────────────────────

    getThreeJsModels(query: string): IThreeJsModel[] {
        const q = query.toLowerCase();
        for (const key of Object.keys(THREEJS_REGISTRY)) {
            if (key === 'default') continue;
            if (q.includes(key)) return THREEJS_REGISTRY[key];
        }
        return THREEJS_REGISTRY['default'];
    }

    // ─── PHIL (curated registry) ─────────────────────────────────────────────

    getPhilImages(query: string): IPhilImage[] {
        const q = query.toLowerCase();
        for (const key of Object.keys(PHIL_REGISTRY)) {
            if (key === 'default') continue;
            if (q.includes(key)) return PHIL_REGISTRY[key];
        }
        return PHIL_REGISTRY['default'];
    }

    // ─── Wikimedia Commons ───────────────────────────────────────────────────

    /** Strip medical stop-words and return the 1–2 most specific terms. */
    private _simplifyQuery(query: string): string {
        const STOP = new Set([
            'physical', 'examination', 'assessment', 'evaluation', 'findings',
            'clinical', 'medical', 'anatomy', 'and', 'or', 'of', 'the', 'a',
            'in', 'with', 'for', 'to', 'from', 'by', 'at', 'on', 'overview',
            'management', 'treatment', 'approach', 'general', 'imaging',
            'review', 'related', 'relevant', 'associated'
        ]);
        const words = query.toLowerCase()
            .replace(/[^a-z\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP.has(w));
        // Return up to 2 words — enough for a targeted Wikimedia search
        return words.slice(0, 2).join(' ') || query.split(/\s+/).slice(0, 2).join(' ');
    }

    private async _fetchWikimedia(searchTerm: string, limit: number): Promise<IWikimediaImage[]> {
        const encoded = encodeURIComponent(`${searchTerm} anatomy`);
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encoded}&gsrlimit=${limit}&prop=imageinfo&iiprop=url|descriptionurl|extmetadata&iiurlwidth=400&format=json&origin=*`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data?.query?.pages ?? {};
        return Object.values(pages)
            .map((p: any) => {
                const ii = p.imageinfo?.[0];
                if (!ii?.url) return null;
                const meta = ii.extmetadata ?? {};
                return {
                    title: p.title?.replace('File:', '') ?? '',
                    url: ii.url ?? '',
                    thumbUrl: ii.thumburl ?? ii.url ?? '',
                    descriptionUrl: ii.descriptionurl ?? '',
                    credit: (() => {
                        let val = meta.Credit?.value ?? 'Wikimedia Commons';
                        while (/<[^>]+>/.test(val)) {
                            val = val.replace(/<[^>]+>/g, '');
                        }
                        return val;
                    })(),
                    license: meta.LicenseShortName?.value ?? 'See source'
                } as IWikimediaImage;
            })
            .filter((img): img is IWikimediaImage => img !== null)
            .filter(img => img.url.match(/\.(jpg|jpeg|png|svg|webp)$/i));
    }

    async searchWikimediaImages(query: string, limit = 6): Promise<IWikimediaImage[]> {
        try {
            // Step 1: try with simplified focused keywords
            const simplified = this._simplifyQuery(query);
            const results = await this._fetchWikimedia(simplified, limit);
            if (results.length > 0) return results;

            // Step 2: retry with just the very first keyword (broadest fallback)
            const firstWord = simplified.split(/\s+/)[0];
            if (firstWord && firstWord !== simplified) {
                const fallback = await this._fetchWikimedia(firstWord, limit);
                if (fallback.length > 0) return fallback;
            }

            // Step 3: last resort — try the raw original query (some specific terms work as-is)
            return await this._fetchWikimedia(query.split(/\s+/).slice(0, 3).join(' '), limit);
        } catch (e) {
            console.debug('[RichMediaService] Wikimedia fetch failed:', (e as Error)?.message);
            return [];
        }
    }


    // ─── PubMed ──────────────────────────────────────────────────────────────

    async searchPubmed(query: string, limit = 3): Promise<IPubmedCitation[]> {
        const encoded = encodeURIComponent(query);
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encoded}&retmax=${limit}&retmode=json&sort=relevance`;

        try {
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();
            const ids: string[] = searchData?.esearchresult?.idlist ?? [];
            if (ids.length === 0) return [];

            const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
            const summaryRes = await fetch(summaryUrl);
            const summaryData = await summaryRes.json();
            const result = summaryData?.result ?? {};

            return ids.map(id => {
                const doc = result[id];
                if (!doc) return null;
                const authors = (doc.authors ?? []).slice(0, 3).map((a: any) => a.name).join(', ');
                return {
                    pmid: id,
                    title: doc.title ?? '',
                    authors: authors + (doc.authors?.length > 3 ? ' et al.' : ''),
                    journal: doc.source ?? '',
                    year: doc.pubdate?.split(' ')[0] ?? '',
                    abstract: doc.title ?? '', // summary doesn't include abstract — use title for preview
                    url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
                } as IPubmedCitation;
            }).filter((c): c is IPubmedCitation => c !== null);
        } catch (e) {
            console.debug('[RichMediaService] PubMed fetch failed:', (e as Error)?.message);
            return [];
        }
    }

    // ─── Resolve a card (fetches live data if needed) ─────────────────────────

    async resolveCard(card: IRichMediaCard): Promise<IRichMediaCard> {
        switch (card.kind) {
            case 'model-3d':
                return { ...card, models: this.getThreeJsModels(card.query), loading: false };
            case 'phil-image':
                return { ...card, philImages: this.getPhilImages(card.query), loading: false };
            case 'image-gallery':
                return { ...card, images: await this.searchWikimediaImages(card.query), loading: false };
            case 'pubmed-refs':
                return { ...card, citations: await this.searchPubmed(card.query), loading: false };
        }
    }
}
