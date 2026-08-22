import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID, signal } from '@angular/core';
import { ThemeStudioDrawerComponent } from './theme-studio-drawer.component';
import { ThemeService } from '../../services/theme.service';

describe('ThemeStudioDrawerComponent', () => {
  let component: ThemeStudioDrawerComponent;
  let mockThemeService: any;

  beforeEach(async () => {
    mockThemeService = {
      currentTheme: signal('light'),
      currentFontFamily: signal('inter'),
      highContrastMode: signal(false),
      bionicReadingMode: signal(false),
      activeMarkerTheme: signal(false),
      reduceMotion: signal(false),
      setTheme: (t: string) => mockThemeService.currentTheme.set(t)
    };

    await TestBed.configureTestingModule({
      imports: [ThemeStudioDrawerComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ThemeStudioDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize theme options and categories', () => {
    expect(component).toBeTruthy();
    expect(component.categories.length).toBe(4);
    expect(component.themeOptions.length).toBe(14);
  });

  it('should filter themes by category cleanly', () => {
    const clinical = component.getThemesByCategory('Clinical');
    expect(clinical.length).toBe(3);
    expect(clinical.some(t => t.id === 'light')).toBe(true);
  });

  it('should cycle primary themes correctly on fast cycle', () => {
    mockThemeService.currentTheme.set('light');
    component.cyclePrimaryTheme();
    expect(mockThemeService.currentTheme()).toBe('dark');
  });
});
