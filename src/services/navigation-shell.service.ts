import { Injectable, signal } from '@angular/core';

export type MainTabType = 'chart' | 'analysis' | 'intake' | 'directory' | 'research' | 'tasks' | 'settings';

@Injectable({
  providedIn: 'root'
})
export class NavigationShellService {
  /** Active main shell tab. Defaults to clinical chart. */
  readonly activeTab = signal<MainTabType>('chart');

  /** Modal visibility states. */
  readonly showGlossaryModal = signal<boolean>(false);
  readonly showCompanionSyncModal = signal<boolean>(false);
  readonly showFhirCallback = signal<boolean>(false);
  readonly showApiKeyModal = signal<boolean>(false);
  readonly showPatientDirectoryModal = signal<boolean>(false);
  readonly showDictationModal = signal<boolean>(false);

  /**
   * Switches active main tab.
   */
  public selectTab(tab: MainTabType): void {
    this.activeTab.set(tab);
  }

  /**
   * Toggles modal overlays.
   */
  public openGlossary(): void { this.showGlossaryModal.set(true); }
  public closeGlossary(): void { this.showGlossaryModal.set(false); }

  public openCompanionSync(): void { this.showCompanionSyncModal.set(true); }
  public closeCompanionSync(): void { this.showCompanionSyncModal.set(false); }

  public openApiKeyModal(): void { this.showApiKeyModal.set(true); }
  public closeApiKeyModal(): void { this.showApiKeyModal.set(false); }

  public openDictation(): void { this.showDictationModal.set(true); }
  public closeDictation(): void { this.showDictationModal.set(false); }
}
