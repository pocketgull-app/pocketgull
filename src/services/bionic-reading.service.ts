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
   * Converts plain text string into Bionic Reading HTML string.
   * Bolds the first 40% of characters in each word for accelerated reading focus.
   */
  formatToBionicHtml(text: string): string {
    if (!text) return '';

    // Split paragraphs while preserving formatting
    return text.split(' ').map(word => {
      // Strip trailing punctuation for accurate bolding ratio
      const match = word.match(/^([a-zA-Z0-9]+)(.*)$/);
      if (!match) return word;

      const letters = match[1];
      const punctuation = match[2] || '';

      if (letters.length <= 1) {
        return `<b>${letters}</b>${punctuation}`;
      }

      const boldLen = Math.max(1, Math.ceil(letters.length * 0.4));
      const boldPart = letters.slice(0, boldLen);
      const restPart = letters.slice(boldLen);

      return `<b>${boldPart}</b>${restPart}${punctuation}`;
    }).join(' ');
  }
}
