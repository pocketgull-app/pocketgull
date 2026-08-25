import '@angular/compiler';
import { Injector, runInInjectionContext, PLATFORM_ID } from '@angular/core';
import { ThemeStudioDrawerComponent } from './theme-studio-drawer.component';
import { ThemeService } from '../../services/theme.service';

vi.mock('@angular/core', async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    effect: () => {
      return {
        destroy: () => {}
      };
    }
  };
});

describe('ThemeStudioDrawerComponent', () => {

  const createStudio = () => {
    const injector = Injector.create({
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ThemeService, useFactory: () => new ThemeService() }
      ]
    });
    return runInInjectionContext(injector, () => new ThemeStudioDrawerComponent());
  };

  it('should initialize theme options and categories', () => {
    const studio = createStudio();
    expect(studio).toBeTruthy();
    expect(studio.categories.length).toBe(4);
    expect(studio.themeOptions.length).toBe(14);
  });

  it('should filter themes by category cleanly', () => {
    const studio = createStudio();
    const clinical = studio.getThemesByCategory('Clinical');
    expect(clinical.length).toBe(3);
    expect(clinical.some(t => t.id === 'light')).toBe(true);
  });

  it('should cycle primary themes correctly on fast cycle', () => {
    const studio = createStudio();
    studio.themeService.currentTheme.set('light');
    studio.cyclePrimaryTheme();
    expect(studio.themeService.currentTheme()).toBe('dark');
  });
});
