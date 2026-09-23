import { describe, it, expect, beforeEach } from 'vitest';
import { PocketgullArchitectureAtlasComponent } from './pocketgull-architecture-atlas.component';
import { TestBed } from '@angular/core/testing';
import { NavigationShellService } from '../../services/navigation-shell.service';

describe('PocketgullArchitectureAtlasComponent', () => {
  let component: PocketgullArchitectureAtlasComponent;
  let navService: NavigationShellService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PocketgullArchitectureAtlasComponent],
      providers: [NavigationShellService]
    });

    const fixture = TestBed.createComponent(PocketgullArchitectureAtlasComponent);
    component = fixture.componentInstance;
    navService = TestBed.inject(NavigationShellService);
  });

  it('1. Initializes and correctly binds 6 spheres metadata', () => {
    expect(component).toBeTruthy();
    expect(component.atlas.totalComponents).toBeGreaterThan(300);
    expect(component.atlas.spheres.length).toBe(6);
    expect(component.selectedSphereId()).toBe('all');
    expect(component.filteredComponents().length).toBe(component.atlas.totalComponents);
  });

  it('2. Filters components when a specific sphere is selected', () => {
    component.selectedSphereId.set('biophysical_3d');
    const filtered = component.filteredComponents();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(c => c.sphere === 'biophysical_3d')).toBe(true);
  });

  it('3. Filters components by search query', () => {
    component.searchQuery.set('holodeck');
    const filtered = component.filteredComponents();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some(c => c.name.includes('holodeck'))).toBe(true);
  });

  it('4. Switches between directory view and topology view', () => {
    expect(component.activeView()).toBe('directory');
    component.activeView.set('topology');
    expect(component.activeView()).toBe('topology');
  });

  it('5. Closes the atlas via NavigationShellService', () => {
    navService.openAtlas();
    expect(navService.showAtlasModal()).toBe(true);
    component.close();
    expect(navService.showAtlasModal()).toBe(false);
  });
});
