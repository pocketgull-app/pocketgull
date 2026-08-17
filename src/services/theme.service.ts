import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SecureStorageService } from './secure-storage.service';

export type AppTheme = 'light' | 'dark' | 'system' | 'spark' | 'papercraft' | 'pocketgull-geararts' | 'hemp' | 'rice' | 'construction' | 'white-marble' | 'black-marble' | 'papyrus' | 'pool' | 'mandala' | 'curie' | 'cern';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public currentTheme = signal<AppTheme>('light');
  public activeTheme = signal<'light' | 'dark'>('light');
  public activeParadigm = signal<'western' | 'tcm' | 'ayurveda' | 'unified'>('unified');
  public reduceMotion = signal<boolean>(false);
  public isPlainLanguageMode = signal<boolean>(false);
  public analogyLensMode = signal<'clinical' | 'coach'>('clinical');
  public activeSeagullPersona = signal<'calm-gull' | 'active-skimmer' | 'deep-navigator' | 'storm-rider'>('deep-navigator');
  public textSizeScale = signal<'standard' | 'large' | 'extra-large'>('standard');
  public isDyslexiaFontEnabled = signal<boolean>(false);
  public isHighContrastEnabled = signal<boolean>(false);
  private platformId = (() => {
    try { return inject(PLATFORM_ID); } catch (e) { return 'server'; }
  })();
  private storage = (() => {
    try { return inject(SecureStorageService); } catch (e) { return new SecureStorageService(); }
  })();

  public setAnalogyLensMode(mode: 'clinical' | 'coach') {
    this.analogyLensMode.set(mode);
    if (mode !== 'clinical') {
      this.isPlainLanguageMode.set(true);
    } else {
      this.isPlainLanguageMode.set(false);
    }
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
      
      const savedPersona = this.storage.getItem('pocket_gull_seagull_persona') as any;
      if (savedPersona && ['calm-gull', 'active-skimmer', 'deep-navigator', 'storm-rider'].includes(savedPersona)) {
        this.activeSeagullPersona.set(savedPersona);
      }

      effect(() => {
        const theme = this.currentTheme();
        this.saveTheme(theme);
        this.resolveTheme(theme);
      });

      effect(() => {
        const resolvedTheme = this.activeTheme();
        this.applyThemeToDom(resolvedTheme);
      });

      effect(() => {
        const paradigm = this.activeParadigm();
        this.applyParadigmToDom(paradigm);
      });

      effect(() => {
        const persona = this.activeSeagullPersona();
        this.storage.setItem('pocket_gull_seagull_persona', persona);
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-seagull-persona', persona);
        }
      });

      effect(() => {
        const reduce = this.reduceMotion();
        this.storage.setItem('pocket_gull_reduce_motion', reduce ? 'true' : 'false');
        if (typeof document !== 'undefined') {
          if (reduce) {
            document.documentElement.classList.add('reduce-motion');
          } else {
            document.documentElement.classList.remove('reduce-motion');
          }
        }
      });

      effect(() => {
        const isPlain = this.isPlainLanguageMode();
        this.storage.setItem('pocket_gull_plain_language', isPlain ? 'true' : 'false');
        if (typeof document !== 'undefined') {
          if (isPlain) {
            document.documentElement.classList.add('plain-language-mode');
          } else {
            document.documentElement.classList.remove('plain-language-mode');
          }
        }
      });

      effect(() => {
        const scale = this.textSizeScale();
        this.storage.setItem('pocket_gull_text_size_scale', scale);
        
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('text-scale-standard', 'text-scale-large', 'text-scale-extra-large');
          document.documentElement.classList.add(`text-scale-${scale}`);
        }
      });

      effect(() => {
        const dyslexia = this.isDyslexiaFontEnabled();
        this.storage.setItem('pocket_gull_dyslexia_font', dyslexia ? 'true' : 'false');
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dyslexia-font-active', dyslexia);
        }
      });

      effect(() => {
        const highContrast = this.isHighContrastEnabled();
        this.storage.setItem('pocket_gull_high_contrast', highContrast ? 'true' : 'false');
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('high-contrast-active', highContrast);
        }
      });

      const savedReduceMotion = this.storage.getItem('pocket_gull_reduce_motion');
      if (savedReduceMotion === 'true') {
        this.reduceMotion.set(true);
      } else if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.reduceMotion.set(true);
        }
      }

      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener?.('change', (e) => {
          if (this.currentTheme() === 'system') {
            this.activeTheme.set(e.matches ? 'dark' : 'light');
          }
        });

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addEventListener?.('change', (e) => {
          this.reduceMotion.set(e.matches);
        });
      }
    }
  }

  private initTheme() {
    const savedPlainLanguage = this.storage.getItem('pocket_gull_plain_language');
    if (savedPlainLanguage === 'true') {
      this.isPlainLanguageMode.set(true);
    }

    const savedTextSize = this.storage.getItem('pocket_gull_text_size_scale') as any;
    if (savedTextSize && ['standard', 'large', 'extra-large'].includes(savedTextSize)) {
      this.textSizeScale.set(savedTextSize);
    }

    const savedDyslexia = this.storage.getItem('pocket_gull_dyslexia_font');
    if (savedDyslexia === 'true') {
      this.isDyslexiaFontEnabled.set(true);
    }

    const savedHighContrast = this.storage.getItem('pocket_gull_high_contrast');
    if (savedHighContrast === 'true') {
      this.isHighContrastEnabled.set(true);
    }

    const ALL_THEMES: AppTheme[] = ['light', 'dark', 'system', 'spark', 'papercraft', 'hemp', 'rice', 'construction', 'white-marble', 'black-marble', 'papyrus', 'pool', 'mandala', 'curie', 'cern'];
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const urlTheme = urlParams.get('theme') as AppTheme;
    if (urlTheme && ALL_THEMES.includes(urlTheme)) {
      this.currentTheme.set(urlTheme);
      this.resolveTheme(urlTheme);
    } else {
      const savedTheme = this.storage.getItem('pocket_gull_theme') as AppTheme;
      if (savedTheme && ALL_THEMES.includes(savedTheme) && savedTheme !== 'spark') {
        this.currentTheme.set(savedTheme);
      } else {
        this.currentTheme.set('light');
      }
    }

    const urlLens = urlParams.get('lens') as any;
    if (urlLens && ['clinical', 'arborist', 'mechanic', 'gentleman', 'muse'].includes(urlLens)) {
      this.setAnalogyLensMode(urlLens);
    }

    const savedReduceMotion = this.storage.getItem('pocket_gull_reduce_motion');
    if (savedReduceMotion === 'true') {
      this.reduceMotion.set(true);
    }
  }

  private saveTheme(theme: AppTheme) {
    if (isPlatformBrowser(this.platformId)) {
      this.storage.setItem('pocket_gull_theme', theme);
    }
  }

  private resolveTheme(theme: AppTheme) {
    if (theme === 'system') {
      const isSystemDark = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
      this.activeTheme.set(isSystemDark ? 'dark' : 'light');
    } else if (theme === 'spark' || theme === 'black-marble' || theme === 'papyrus' || theme === 'mandala' || theme === 'curie') {
      this.activeTheme.set('dark');
    } else if (theme === 'pool') {
      const hour = new Date().getHours();
      const isNight = hour < 6 || hour > 18;
      this.activeTheme.set(isNight ? 'dark' : 'light');
    } else if (theme === 'papercraft' || theme === 'hemp' || theme === 'rice' || theme === 'construction' || theme === 'white-marble') {
      this.activeTheme.set('light');
    } else {
      this.activeTheme.set(theme === 'dark' ? 'dark' : 'light');
    }
  }

  private applyThemeToDom(resolvedTheme: 'light' | 'dark') {
    if (typeof document === 'undefined') return;
    
    document.documentElement.classList.remove(
      'dark', 'theme-spark',
      'papercraft-mode', 'papercraft-hemp', 'papercraft-rice', 'papercraft-construction',
      'theme-white-marble', 'theme-black-marble', 'theme-papyrus',
      'theme-pool', 'theme-pool-light', 'theme-pool-dark',
      'theme-mandala', 'theme-curie', 'theme-cern'
    );
    document.documentElement.setAttribute('data-theme', this.currentTheme());

    const theme = this.currentTheme();
    if (theme === 'cern') {
      document.documentElement.classList.add('theme-cern');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#f4f4f0');
      }
    } else if (theme === 'papercraft' || theme === 'hemp' || theme === 'rice' || theme === 'construction') {
      document.documentElement.classList.add('papercraft-mode');
      if (theme === 'hemp') document.documentElement.classList.add('papercraft-hemp');
      if (theme === 'rice') document.documentElement.classList.add('papercraft-rice');
      if (theme === 'construction') document.documentElement.classList.add('papercraft-construction');

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#F9F3D9');
      }
    } else if (theme === 'spark') {
      document.documentElement.classList.add('dark', 'theme-spark');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0a0503');
      }
    } else if (theme === 'white-marble') {
      document.documentElement.classList.add('theme-white-marble');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#FAF9F6');
      }
    } else if (theme === 'black-marble') {
      document.documentElement.classList.add('dark', 'theme-black-marble');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0d0d11');
      }
    } else if (theme === 'papyrus') {
      document.documentElement.classList.add('dark', 'theme-papyrus');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#13100c');
      }
    } else if (theme === 'pool') {
      document.documentElement.classList.add('theme-pool');
      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark', 'theme-pool-dark');
      } else {
        document.documentElement.classList.add('theme-pool-light');
      }
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#081f3d' : '#7dd3fc');
      }
    } else if (theme === 'mandala') {
      document.documentElement.classList.add('dark', 'theme-mandala');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#16112d');
      }
    } else if (theme === 'curie') {
      document.documentElement.classList.add('dark', 'theme-curie');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#0f1416');
      }
    } else if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#09090B');
      }
    } else {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#F8F8F8');
      }
    }
  }

  private applyParadigmToDom(paradigm: 'western' | 'tcm' | 'ayurveda' | 'unified') {
    if (!isPlatformBrowser(this.platformId)) return;

    const root = document.documentElement;
    root.setAttribute('data-clinical-paradigm', paradigm);

    if (paradigm === 'western') {
      root.style.setProperty('--paradigm-accent', '#06b6d4'); // Cyan
      root.style.setProperty('--paradigm-accent-glow', 'rgba(6, 182, 212, 0.4)');
    } else if (paradigm === 'tcm') {
      root.style.setProperty('--paradigm-accent', '#10b981'); // Emerald
      root.style.setProperty('--paradigm-accent-glow', 'rgba(16, 185, 129, 0.4)');
    } else if (paradigm === 'ayurveda') {
      root.style.setProperty('--paradigm-accent', '#f59e0b'); // Saffron
      root.style.setProperty('--paradigm-accent-glow', 'rgba(245, 158, 11, 0.4)');
    } else {
      root.style.setProperty('--paradigm-accent', '#a855f7'); // Rosetta Purple
      root.style.setProperty('--paradigm-accent-glow', 'rgba(168, 85, 247, 0.4)');
    }
  }

  /**
   * Synthesizes Web Audio API acoustic UI feedback with frequency harmonics matched to active theme, paradigm & gesture interactions.
   */
  public playThemeUiAudioFx(actionType: 'click' | 'double-click' | 'flip' | 'state-cycle' | 'long-press' | 'toggle' | 'theme-change' | 'modal-open' | 'success' = 'click') {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      // Resolve base harmonic frequency from clinical paradigm & theme
      const paradigm = this.activeParadigm();
      let baseFreq = 528; // Default Solfeggio 528 Hz
      let waveType: OscillatorType = 'sine';

      if (paradigm === 'western') {
        baseFreq = 880; // High precision A5 note
        waveType = 'sine';
      } else if (paradigm === 'tcm') {
        baseFreq = 432; // Earth 432 Hz tone
        waveType = 'triangle';
      } else if (paradigm === 'ayurveda') {
        baseFreq = 528; // Transformation 528 Hz Medha tone
        waveType = 'sine';
      } else {
        baseFreq = 660; // E5 Rosetta Purple chime
        waveType = 'sine';
      }

      if (actionType === 'double-click' || actionType === 'flip') {
        // Double-click / Card Flip: 2-tone rising octave-fifth step (F0 -> 1.5*F0)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = waveType;
        osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc2.type = waveType;
        osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.18);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.06);
        osc2.start(ctx.currentTime + 0.06);
        osc2.stop(ctx.currentTime + 0.18);

        this.triggerHapticFeedback('double');
        return;
      }

      if (actionType === 'state-cycle') {
        // State Machine Transition: 3-note ascending arpeggio sweep (F0 -> 1.25*F0 -> 1.5*F0)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.setValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.05);
        osc.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.10);

        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.20);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.20);

        this.triggerHapticFeedback('heavy');
        return;
      }

      if (actionType === 'long-press') {
        // Long Press / Context Menu: Deep sub-bass resonance tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.30);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.30);

        this.triggerHapticFeedback('heavy');
        return;
      }

      // Standard single click / toggle / modal-open
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (actionType === 'toggle') baseFreq *= 1.25;
      if (actionType === 'theme-change') baseFreq *= 1.5;
      if (actionType === 'modal-open') baseFreq *= 0.85;

      osc.type = waveType;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      const duration = actionType === 'theme-change' ? 0.25 : 0.12;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);

      if (actionType === 'click') this.triggerHapticFeedback('light');
      else if (actionType === 'toggle') this.triggerHapticFeedback('medium');
    } catch (e) {
      console.debug('[ThemeService] AudioContext unavailable:', (e as Error)?.message);
    }
  }

  /**
   * Triggers haptic vibration feedback on supported touch & mobile devices.
   */
  public triggerHapticFeedback(pattern: 'light' | 'medium' | 'heavy' | 'double' | 'success' = 'light') {
    if (!isPlatformBrowser(this.platformId) || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    try {
      if (pattern === 'light') navigator.vibrate(10);
      else if (pattern === 'medium') navigator.vibrate(20);
      else if (pattern === 'heavy') navigator.vibrate(35);
      else if (pattern === 'double') navigator.vibrate([15, 30, 15]);
      else if (pattern === 'success') navigator.vibrate([10, 20, 25, 40]);
    } catch (e) {
      console.debug('[ThemeService] Haptic vibration unavailable:', (e as Error)?.message);
    }
  }

  public setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    this.playThemeUiAudioFx('theme-change');
    this.triggerHapticFeedback('double');
  }

  public cycleTheme(): void {
    const themes: AppTheme[] = ['light', 'dark', 'system', 'spark'];
    const current = this.currentTheme();
    const currentIndex = themes.indexOf(current);
    const nextTheme = themes[(currentIndex + 1) % themes.length] || 'light';
    this.setTheme(nextTheme);
  }

  public setParadigm(paradigm: 'western' | 'tcm' | 'ayurveda' | 'unified'): void {
    this.activeParadigm.set(paradigm);
    this.playThemeUiAudioFx('toggle');
    this.triggerHapticFeedback('medium');
  }

  public setReduceMotion(reduce: boolean): void {
    this.reduceMotion.set(reduce);
    this.triggerHapticFeedback('light');
  }

  public cycleTextSizeScale(): void {
    const curr = this.textSizeScale();
    if (curr === 'standard') this.textSizeScale.set('large');
    else if (curr === 'large') this.textSizeScale.set('extra-large');
    else this.textSizeScale.set('standard');

    this.playThemeUiAudioFx('click');
    this.triggerHapticFeedback('light');
  }

  public togglePlainLanguageMode(): void {
    this.isPlainLanguageMode.update(curr => !curr);
    this.playThemeUiAudioFx('toggle');
    this.triggerHapticFeedback('medium');
  }
}


