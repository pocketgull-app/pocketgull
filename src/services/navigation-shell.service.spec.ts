import { NavigationShellService } from './navigation-shell.service';

describe('NavigationShellService Suite', () => {
  it('manages main shell tab navigation signals', () => {
    const nav = new NavigationShellService();
    expect(nav.activeTab()).toBe('chart');

    nav.selectTab('analysis');
    expect(nav.activeTab()).toBe('analysis');

    nav.selectTab('intake');
    expect(nav.activeTab()).toBe('intake');
  });

  it('toggles modal overlays correctly', () => {
    const nav = new NavigationShellService();
    expect(nav.showGlossaryModal()).toBe(false);

    nav.openGlossary();
    expect(nav.showGlossaryModal()).toBe(true);

    nav.closeGlossary();
    expect(nav.showGlossaryModal()).toBe(false);
  });

  it('resets all navigation state and modal overlays when navigateWayBackHome is called', () => {
    const nav = new NavigationShellService();
    nav.selectTab('research');
    nav.openGlossary();
    nav.openDictation();

    nav.navigateWayBackHome();

    expect(nav.activeTab()).toBe('chart');
    expect(nav.showGlossaryModal()).toBe(false);
    expect(nav.showDictationModal()).toBe(false);
  });
});
