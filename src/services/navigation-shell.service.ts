import { Injectable, signal } from '@angular/core';

export type MainTabType = 'chart' | 'analysis' | 'intake' | 'directory' | 'research' | 'tasks' | 'settings' | 'moca';

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
  readonly showBarrowsWorkbenchModal = signal<boolean>(false);
  readonly showComplianceCertificateModal = signal<boolean>(false);
  readonly showCmsSuperbillModal = signal<boolean>(false);
  readonly showTrajectoryReaderModal = signal<boolean>(false);
  readonly showPosologyModal = signal<boolean>(false);
  readonly showAustereHudModal = signal<boolean>(false);
  readonly showMdcpHubModal = signal<boolean>(false);
  readonly showCommercialHubModal = signal<boolean>(false);
  readonly showRoleDemoModal = signal<boolean>(false);
  readonly showIntimacyVitalityModal = signal<boolean>(false);
  readonly showArcadeHubModal = signal<boolean>(false);
  readonly showAtlasModal = signal<boolean>(false);
  readonly showChwSuiteModal = signal<boolean>(false);
  readonly showSpecialistReferralModal = signal<boolean>(false);
  readonly showMultilingualTerminalModal = signal<boolean>(false);
  readonly showMocaSuiteModal = signal<boolean>(false);
  readonly showAmbientScribeDrawer = signal<boolean>(false);
  readonly showEdiClaimsModal = signal<boolean>(false);
  readonly showEnterpriseIdentityModal = signal<boolean>(false);
  readonly showDirectIomtModal = signal<boolean>(false);
  readonly showSepsisBenchmarkModal = signal<boolean>(false);
  readonly showEhrMarketplaceModal = signal<boolean>(false);
  readonly showEhrWritebackModal = signal<boolean>(false);
  readonly showEdgeVoiceModal = signal<boolean>(false);
  readonly showCowsModal = signal<boolean>(false);
  readonly showRecoveryModal = signal<boolean>(false);
  readonly activeGameId = signal<string>('luminaries');

  /** Developer Mode: Gates investor pitch portals, experimental showcases, and auxiliary demos. Defaults to false. */
  readonly developerMode = signal<boolean>(
    (() => {
      try {
        if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
          return globalThis.localStorage.getItem('pg_developer_mode') === 'true';
        }
      } catch {
        // Fallback for sandboxed environments
      }
      return false;
    })()
  );

  /**
   * Toggles developer mode and persists to localStorage.
   */
  public toggleDeveloperMode(): void {
    const next = !this.developerMode();
    this.developerMode.set(next);
    try {
      if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
        globalThis.localStorage.setItem('pg_developer_mode', next ? 'true' : 'false');
      }
    } catch {
      // Fallback
    }
  }

  /**
   * Switches active main tab.
   */
  public selectTab(tab: MainTabType): void {
    this.activeTab.set(tab);
    if (tab === 'moca') {
      this.showMocaSuiteModal.set(true);
    }
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

  public openBarrowsWorkbench(): void { this.showBarrowsWorkbenchModal.set(true); }
  public closeBarrowsWorkbench(): void { this.showBarrowsWorkbenchModal.set(false); }

  public openComplianceCertificate(): void { this.showComplianceCertificateModal.set(true); }
  public closeComplianceCertificate(): void { this.showComplianceCertificateModal.set(false); }

  public openCmsSuperbill(): void { this.showCmsSuperbillModal.set(true); }
  public closeCmsSuperbill(): void { this.showCmsSuperbillModal.set(false); }

  public openTrajectoryReader(): void { this.showTrajectoryReaderModal.set(true); }
  public closeTrajectoryReader(): void { this.showTrajectoryReaderModal.set(false); }

  public openPosology(): void { this.showPosologyModal.set(true); }
  public closePosology(): void { this.showPosologyModal.set(false); }

  public openAustereHud(): void { this.showAustereHudModal.set(true); }
  public closeAustereHud(): void { this.showAustereHudModal.set(false); }

  public openMdcpHub(): void { this.showMdcpHubModal.set(true); }
  public closeMdcpHub(): void { this.showMdcpHubModal.set(false); }

  public openCommercialHub(): void { this.showCommercialHubModal.set(true); }
  public closeCommercialHub(): void { this.showCommercialHubModal.set(false); }

  public openRoleDemo(): void { this.showRoleDemoModal.set(true); }
  public closeRoleDemo(): void { this.showRoleDemoModal.set(false); }

  public openIntimacyVitality(): void { this.showIntimacyVitalityModal.set(true); }
  public closeIntimacyVitality(): void { this.showIntimacyVitalityModal.set(false); }

  public openArcadeHub(gameId?: string): void {
    if (gameId) {
      this.activeGameId.set(gameId);
    }
    this.showArcadeHubModal.set(true);
  }
  public closeArcadeHub(): void { this.showArcadeHubModal.set(false); }

  public openAtlas(): void { this.showAtlasModal.set(true); }
  public closeAtlas(): void { this.showAtlasModal.set(false); }

  public openChwSuite(): void { this.showChwSuiteModal.set(true); }
  public closeChwSuite(): void { this.showChwSuiteModal.set(false); }

  public openSpecialistReferralHub(): void { this.showSpecialistReferralModal.set(true); }
  public closeSpecialistReferralHub(): void { this.showSpecialistReferralModal.set(false); }

  public openMultilingualTerminal(): void { this.showMultilingualTerminalModal.set(true); }
  public closeMultilingualTerminal(): void { this.showMultilingualTerminalModal.set(false); }

  public openMocaSuite(): void {
    this.activeTab.set('moca');
    this.showMocaSuiteModal.set(true);
  }
  public closeMocaSuite(): void {
    this.showMocaSuiteModal.set(false);
    if (this.activeTab() === 'moca') {
      this.activeTab.set('chart');
    }
  }

  /**
   * Resets active shell tab to 'chart', closes all active modal overlays, and returns home.
   */
  public navigateWayBackHome(): void {
    this.activeTab.set('chart');
    this.showGlossaryModal.set(false);
    this.showCompanionSyncModal.set(false);
    this.showMocaSuiteModal.set(false);
    this.showFhirCallback.set(false);
    this.showApiKeyModal.set(false);
    this.showPatientDirectoryModal.set(false);
    this.showDictationModal.set(false);
    this.showBarrowsWorkbenchModal.set(false);
    this.showComplianceCertificateModal.set(false);
    this.showCmsSuperbillModal.set(false);
    this.showTrajectoryReaderModal.set(false);
    this.showPosologyModal.set(false);
    this.showAustereHudModal.set(false);
    this.showMdcpHubModal.set(false);
    this.showCommercialHubModal.set(false);
    this.showRoleDemoModal.set(false);
    this.showIntimacyVitalityModal.set(false);
    this.showArcadeHubModal.set(false);
    this.showAtlasModal.set(false);
    this.showChwSuiteModal.set(false);
    this.showSpecialistReferralModal.set(false);
    this.showMultilingualTerminalModal.set(false);
    this.showAmbientScribeDrawer.set(false);
    this.showEdiClaimsModal.set(false);
    this.showEnterpriseIdentityModal.set(false);
    this.showDirectIomtModal.set(false);
    this.showSepsisBenchmarkModal.set(false);
    this.showEhrMarketplaceModal.set(false);
    this.showEhrWritebackModal.set(false);
    this.showEdgeVoiceModal.set(false);
    this.showCowsModal.set(false);
    this.showRecoveryModal.set(false);
  }

  public openAmbientScribeDrawer(): void { this.showAmbientScribeDrawer.set(true); }
  public closeAmbientScribeDrawer(): void { this.showAmbientScribeDrawer.set(false); }
  public toggleAmbientScribeDrawer(): void { this.showAmbientScribeDrawer.update(v => !v); }

  public openEdiClaimsModal(): void { this.showEdiClaimsModal.set(true); }
  public closeEdiClaimsModal(): void { this.showEdiClaimsModal.set(false); }
  public toggleEdiClaimsModal(): void { this.showEdiClaimsModal.update(v => !v); }

  public openEnterpriseIdentityModal(): void { this.showEnterpriseIdentityModal.set(true); }
  public closeEnterpriseIdentityModal(): void { this.showEnterpriseIdentityModal.set(false); }
  public toggleEnterpriseIdentityModal(): void { this.showEnterpriseIdentityModal.update(v => !v); }

  public openDirectIomtModal(): void { this.showDirectIomtModal.set(true); }
  public closeDirectIomtModal(): void { this.showDirectIomtModal.set(false); }
  public toggleDirectIomtModal(): void { this.showDirectIomtModal.update(v => !v); }

  public openSepsisBenchmarkModal(): void { this.showSepsisBenchmarkModal.set(true); }
  public closeSepsisBenchmarkModal(): void { this.showSepsisBenchmarkModal.set(false); }
  public toggleSepsisBenchmarkModal(): void { this.showSepsisBenchmarkModal.update(v => !v); }

  public openEhrMarketplaceModal(): void { this.showEhrMarketplaceModal.set(true); }
  public closeEhrMarketplaceModal(): void { this.showEhrMarketplaceModal.set(false); }
  public toggleEhrMarketplaceModal(): void { this.showEhrMarketplaceModal.update(v => !v); }

  public openEhrWritebackModal(): void { this.showEhrWritebackModal.set(true); }
  public closeEhrWritebackModal(): void { this.showEhrWritebackModal.set(false); }
  public toggleEhrWritebackModal(): void { this.showEhrWritebackModal.update(v => !v); }

  public openEdgeVoiceModal(): void { this.showEdgeVoiceModal.set(true); }
  public closeEdgeVoiceModal(): void { this.showEdgeVoiceModal.set(false); }
  public toggleEdgeVoiceModal(): void { this.showEdgeVoiceModal.update(v => !v); }

  public openCowsModal(): void { this.showCowsModal.set(true); }
  public closeCowsModal(): void { this.showCowsModal.set(false); }
  public toggleCowsModal(): void { this.showCowsModal.update(v => !v); }

  public openRecoveryModal(): void { this.showRecoveryModal.set(true); }
  public closeRecoveryModal(): void { this.showRecoveryModal.set(false); }
  public toggleRecoveryModal(): void { this.showRecoveryModal.update(v => !v); }
}

