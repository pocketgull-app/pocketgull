import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';
import { SecureStorageService } from './secure-storage.service';

describe('ThemeService (App Themes & Accessibility Cycles)', () => {
  let service: ThemeService;

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        SecureStorageService,
        ThemeService
      ]
    });
    service = runInInjectionContext(injector, () => injector.get(ThemeService));
  });

  it('1. Initializes default light theme', () => {
    expect(service.currentTheme()).toBe('light');
  });

  it('2. Cycles theme through light -> dark -> system -> spark -> light', () => {
    expect(service.currentTheme()).toBe('light');
    
    service.cycleTheme();
    expect(service.currentTheme()).toBe('dark');

    service.cycleTheme();
    expect(service.currentTheme()).toBe('system');

    service.cycleTheme();
    expect(service.currentTheme()).toBe('spark');

    service.cycleTheme();
    expect(service.currentTheme()).toBe('light');
  });

  it('3. Enables plain language mode and dyslexia font toggles', () => {
    service.togglePlainLanguageMode();
    expect(service.isPlainLanguageMode()).toBe(true);

    service.cycleTextSizeScale();
    expect(service.textSizeScale()).toBe('large');
  });
});
