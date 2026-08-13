import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BionicReadingService {
  /** Global toggle signal for Bionic Reading Mode across Research Frame and Care Plans. */
  readonly isBionicReadingEnabled = signal<boolean>(false);

  /**
   * Toggles Bionic Reading Mode globally.
   */
  toggleBionicReading(): void {
    this.isBionicReadingEnabled.set(!this.isBionicReadingEnabled());
  }

  /**
   * Sets Bionic Reading Mode state explicitly.
   */
  setBionicReading(enabled: boolean): void {
    this.isBionicReadingEnabled.set(enabled);
  }

  /**
   * Converts plain text string or HTML content into Bionic Reading HTML string.
   * Accurately extracts leading non-word prefixes (punctuation, quotes, brackets, parens)
   * and trailing punctuation, bolding the initial 40-50% of characters in each word
   * for accelerated reading focus and accessibility.
   *
   * @param text Plain text or HTML string to format
   * @param highlightClass Optional custom Tailwind CSS class for bolded prefix letters
   */
  formatToBionicHtml(text: string, highlightClass?: string): string {
    if (!text) return '';

    // Match HTML tags (to preserve markup) or whitespace-delimited tokens
    return text.replace(/<[^>]+>|([^\s<>]+)/g, (match) => {
      // Preserve HTML tags untouched
      if (match.startsWith('<') && match.endsWith('>')) {
        return match;
      }

      // Format individual word letter/digit runs while preserving surrounding punctuation
      return match.replace(/[a-zA-Z0-9]+/g, (letters) => {
        if (letters.length <= 1) {
          return highlightClass 
            ? `<strong class="${highlightClass}">${letters}</strong>`
            : `<b>${letters}</b>`;
        }

        const boldLen = Math.max(1, Math.ceil(letters.length * 0.45));
        const boldPart = letters.slice(0, boldLen);
        const restPart = letters.slice(boldLen);

        return highlightClass
          ? `<strong class="${highlightClass}">${boldPart}</strong>${restPart}`
          : `<b>${boldPart}</b>${restPart}`;
      });
    });
  }
}

