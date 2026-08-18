import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BionicReadingService {
  /** Global toggle signal for Bionic Reading Mode across all components. */
  readonly isBionicReadingEnabled = signal<boolean>(false);

  /** Notification signal for assistive screen readers when mode changes. */
  readonly accessibilityNotice = signal<string>('');

  constructor() {
    this.initStoredPreference();
    this.initKeyboardShortcutListener();
  }

  /**
   * Reads persistent preference from localStorage if available.
   */
  private initStoredPreference(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem('pocketgull_bionic_reading');
      if (stored === 'true') {
        this.isBionicReadingEnabled.set(true);
        this.syncDomState(true);
      }
    } catch {
      // Storage unavailable in private browsing mode
    }
  }

  /**
   * Synchronizes Bionic Focus mode state with DOM root classes and localStorage.
   */
  private syncDomState(enabled: boolean): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('bionic-focus-mode', enabled);
      document.documentElement.classList.toggle('bionic-reading-active', enabled);
      if (document.body) {
        document.body.classList.toggle('bionic-focus-mode', enabled);
        document.body.classList.toggle('bionic-reading-active', enabled);
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('pocketgull_bionic_reading', String(enabled));
      } catch {
        // Ignore storage quota errors
      }
    }
  }

  /**
   * Initializes global keyboard shortcut (Alt + B / Option + B) for rapid accessibility toggle.
   */
  private initKeyboardShortcutListener(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // Check for Alt+B or Option+B without active input/textarea focus
      if (event.altKey && (event.key === 'b' || event.key === 'B')) {
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        event.preventDefault();
        this.toggleBionicReading();
      }
    });
  }

  /**
   * Toggles Bionic Reading Mode globally across all components.
   */
  toggleBionicReading(): void {
    const nextState = !this.isBionicReadingEnabled();
    this.isBionicReadingEnabled.set(nextState);
    this.syncDomState(nextState);
    this.accessibilityNotice.set(`Bionic Reading mode ${nextState ? 'enabled (40% fixation active across all components)' : 'disabled'}`);
  }

  /**
   * Sets Bionic Reading Mode state explicitly.
   */
  setBionicReading(enabled: boolean): void {
    this.isBionicReadingEnabled.set(enabled);
    this.syncDomState(enabled);
    this.accessibilityNotice.set(`Bionic Reading mode ${enabled ? 'enabled (40% fixation active across all components)' : 'disabled'}`);
  }

  /**
   * Converts plain text string or HTML content into Bionic Reading HTML string.
   * Accurately extracts leading non-word prefixes (punctuation, quotes, brackets, parens)
   * and trailing punctuation, bolding the initial 40-50% of characters in each word
   * for accelerated reading focus and accessibility across all components.
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
            ? `<strong class="${highlightClass} bionic-fixation">${letters}</strong>`
            : `<b class="bionic-fixation">${letters}</b>`;
        }

        const boldLen = Math.max(1, Math.ceil(letters.length * 0.45));
        const boldPart = letters.slice(0, boldLen);
        const restPart = letters.slice(boldLen);

        return highlightClass
          ? `<strong class="${highlightClass} bionic-fixation">${boldPart}</strong>${restPart}`
          : `<b class="bionic-fixation">${boldPart}</b>${restPart}`;
      });
    });
  }
}
