import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PocketgullDesktopSuiteComponent } from './pocketgull-desktop-suite.component';

describe('PocketgullDesktopSuiteComponent', () => {
  let component: PocketgullDesktopSuiteComponent;
  let fixture: ComponentFixture<PocketgullDesktopSuiteComponent>;
  let alertSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);

    await TestBed.configureTestingModule({
      imports: [PocketgullDesktopSuiteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PocketgullDesktopSuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should create the component with initial releases and active tray', () => {
    expect(component).toBeTruthy();
    expect(component.isSystemTrayActive()).toBe(true);
    expect(component.desktopReleases().length).toBe(6);
  });

  it('should render header with Tauri v2 badge and tray button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pocket-Gull Desktop Suite (macOS & Windows 11)');
    expect(compiled.textContent).toContain('Tauri v2 + Rust Core');
    expect(compiled.textContent).toContain('🟢 Tray Active');
  });

  it('should toggle system tray state between active and inactive', () => {
    component.toggleSystemTray();
    fixture.detectChanges();
    expect(component.isSystemTrayActive()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('⚪ Launch Tray');

    component.toggleSystemTray();
    fixture.detectChanges();
    expect(component.isSystemTrayActive()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('🟢 Tray Active');
  });

  it('should render all 4 desktop feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Menu Bar & System Tray Telemetry');
    expect(compiled.textContent).toContain('Ambient EHR Dictation Hotkey');
    expect(compiled.textContent).toContain('Option + Space');
    expect(compiled.textContent).toContain('WebGPU & Metal Hardware Acceleration');
    expect(compiled.textContent).toContain('SMART on FHIR v2 EHR Launch');
  });

  it('should render all 6 desktop installer download cards with platforms and hashes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('macOS (Universal M1-M4 / Intel)');
    expect(compiled.textContent).toContain('Windows 11 (x64 Intel / AMD)');
    expect(compiled.textContent).toContain('Windows 11 (ARM64 Snapdragon / Surface Pro)');
    expect(compiled.textContent).toContain('Linux (Ubuntu / Debian / Snap Store)');
    expect(compiled.textContent).toContain('Linux Standalone (Universal AppImage)');
    expect(compiled.textContent).toContain('Chrome Web Store (Browser Extension)');
  });

  it('should handle installer download action and alert user', () => {
    const macRelease = component.desktopReleases()[0];
    component.downloadInstaller(macRelease);

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Downloading macOS (Universal M1-M4 / Intel)')
    );
  });

  it('should copy SHA-256 hash to clipboard and alert confirmation', () => {
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: clipboardSpy }
    });

    component.copyHash('test-sha256-hash-value');
    expect(clipboardSpy).toHaveBeenCalledWith('test-sha256-hash-value');
    expect(alertSpy).toHaveBeenCalledWith('Copied SHA-256 Checksum: test-sha256-hash-value');
  });
});
