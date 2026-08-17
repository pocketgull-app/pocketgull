import { Injectable, signal, computed, inject } from '@angular/core';
import { LegalConsentSovereigntyService } from './legal-consent-sovereignty.service';
import { GrowThyselfLegacyEngineService } from './grow-thyself-legacy-engine.service';

export interface ILegalZoomTrustPackage {
  packageId: string;
  packageName: string;
  legalZoomPriceUsd: number;
  includesDigitalDataWill: boolean;
  includesLivingWill: boolean;
  includesHipaaRelease: boolean;
  documentFormat: 'STANDARDIZED_FHIR_PDF_BUNDLE' | 'JSON_ESTATE_DIRECTIVE';
  exportMode: 'CLIENT_SIDE_SOVEREIGN_EXPORT';
  officialPartnerProgramUrl: string;
  impactRadiusPartnerTrackingUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class LegalZoomIntegrationService {
  private legalService = inject(LegalConsentSovereigntyService);
  private legacyEngine = inject(GrowThyselfLegacyEngineService);

  readonly availablePackages = signal<ILegalZoomTrustPackage[]>([
    {
      packageId: 'lz_digital_data_will_01',
      packageName: 'Sovereign Digital Data & Living Will Package',
      legalZoomPriceUsd: 149,
      includesDigitalDataWill: true,
      includesLivingWill: true,
      includesHipaaRelease: true,
      documentFormat: 'STANDARDIZED_FHIR_PDF_BUNDLE',
      exportMode: 'CLIENT_SIDE_SOVEREIGN_EXPORT',
      officialPartnerProgramUrl: 'https://www.legalzoom.com/partner-programs',
      impactRadiusPartnerTrackingUrl: 'https://app.impact.com/secure/mediapartner/checklist/checklist-instance.ihtml?id=___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL'
    },
    {
      packageId: 'lz_estate_trust_bundle_02',
      packageName: 'Complete Epigenetic Estate Trust Bundle',
      legalZoomPriceUsd: 299,
      includesDigitalDataWill: true,
      includesLivingWill: true,
      includesHipaaRelease: true,
      documentFormat: 'JSON_ESTATE_DIRECTIVE',
      exportMode: 'CLIENT_SIDE_SOVEREIGN_EXPORT',
      officialPartnerProgramUrl: 'https://www.legalzoom.com/partner-programs',
      impactRadiusPartnerTrackingUrl: 'https://app.impact.com/secure/mediapartner/checklist/checklist-instance.ihtml?id=___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL'
    }
  ]);

  readonly totalLegalZoomAffiliateRevUsd = signal<number>(180.00);

  generateLegalZoomPayload(): { estateTrustName: string; executorEmail: string; dataDirectives: any } {
    const consent = this.legalService.consentSettings();
    const directive = this.legacyEngine.posthumousDirective();

    return {
      estateTrustName: consent.legalEstateTrustName || 'Pocketgull Sovereign Trust',
      executorEmail: consent.designatedDataExecutorEmail || 'executor@family-estate.org',
      dataDirectives: {
        openScienceConsent: directive.openScienceConsent,
        targetResearchArea: directive.targetResearchArea,
        lineageEpigeneticSharing: directive.lineageEpigeneticSharing,
        digitalWisdomAvatarEnabled: directive.digitalWisdomAvatarEnabled,
        endowmentPledgeFund: directive.endowmentPledgeFund,
        vaultHash: directive.encryptedVaultHash
      }
    };
  }

  checkoutLegalZoomPackage(packageId: string): void {
    const pkg = this.availablePackages().find(p => p.packageId === packageId);
    if (pkg) {
      const payload = this.generateLegalZoomPayload();
      if (typeof window !== 'undefined') {
        alert(`Exporting Client-Side Estate Bundle for ${pkg.packageName}.\nFormat: ${pkg.documentFormat}\nTrust Name: "${payload.estateTrustName}"\nExecutor: ${payload.executorEmail}\nData Sovereignty Enforced (Zero External API Dependency).`);
      }
    }
  }
}
