import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import { ThemeStudioDrawerComponent } from './theme-studio-drawer.component';
import { ThemeService } from '../../services/theme.service';

describe('ThemeStudioDrawerComponent', () => {
  let component: ThemeStudioDrawerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ThemeStudioDrawerComponent],
      providers: [ThemeService]
    });
    const fixture = TestBed.createComponent(ThemeStudioDrawerComponent);
    component = fixture.componentInstance;
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
    component.themeService.currentTheme.set('light');
    component.cyclePrimaryTheme();
    expect(component.themeService.currentTheme()).toBe('dark');
  });
});
