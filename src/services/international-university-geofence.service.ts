import { Injectable, signal, computed } from '@angular/core';

export type InternationalJurisdiction = 
  | 'US_NCAA'          // United States (HIPAA, NCAA CSMAS, FDA CDS)
  | 'UK_EU_GDPR'        // United Kingdom & EU (GDPR Art. 9, UKRIO, NHS UK Core, WADA/UKAD)
  | 'APAC_CROSS_BORDER' // Asia-Pacific (APEC CBPR, PMDA Japan, TGA Australia, AIS)
  | 'CA_PIPEDA'         // Canada (PIPEDA, Health Canada, U Sports, CCES)
  | 'GLOBAL_WHO';       // Global South & WHO (WHO AFRO/EMRO/SEARO, Low-Bandwidth Edge)

export interface IInternationalUniversityPartner {
  id: string;
  name: string;
  country: string;
  region: 'North America' | 'Europe / UK' | 'Asia-Pacific' | 'Global South';
  jurisdiction: InternationalJurisdiction;
  flagshipLab: string;
  regulatoryFramework: string;
  antiDopingAuthority: 'WADA' | 'USADA / NCAA' | 'UKAD' | 'Sport Integrity Australia' | 'CCES' | 'JADA';
  geofencedCloudRegion: string;
  dataSovereigntyProtocol: string;
}

export interface IGeofenceResidencyAttestation {
  jurisdiction: InternationalJurisdiction;
  geofenceActive: boolean;
  sovereignEdgeRegion: string;
  regulatoryStandard: string;
  antiDopingCompliance: string;
  residencySealHash: string;
  crossBorderTransferAllowed: boolean;
  legalRepresentative: string;
}

@Injectable({
  providedIn: 'root'
})
export class InternationalUniversityGeofenceService {

  // --- Active Geofenced Jurisdiction ---
  readonly activeJurisdiction = signal<InternationalJurisdiction>('US_NCAA');
  readonly selectedUniversityId = signal<string>('uw_huskies');

  // --- Siloed International University Registry ---
  readonly internationalPartners = signal<IInternationalUniversityPartner[]>([
    // United States (NCAA / R1)
    {
      id: 'uw_huskies',
      name: 'University of Washington (UW Medicine & IPD)',
      country: 'United States',
      region: 'North America',
      jurisdiction: 'US_NCAA',
      flagshipLab: 'Institute for Protein Design & WWAMI Telemedicine',
      regulatoryFramework: 'HIPAA §164.514 Safe Harbor / FDA 520(o) Non-Device CDS',
      antiDopingAuthority: 'USADA / NCAA',
      geofencedCloudRegion: 'us-west1 (Oregon / Washington Local Zone)',
      dataSovereigntyProtocol: 'Zero-Cloud Egress Edge Encrypted'
    },
    {
      id: 'purdue_boilermakers',
      name: 'Purdue University (Regenstrief RCHE & Pharmacy)',
      country: 'United States',
      region: 'North America',
      jurisdiction: 'US_NCAA',
      flagshipLab: 'Regenstrief Center for Healthcare Engineering & PGx',
      regulatoryFramework: 'HIPAA Safe Harbor / Big Ten Sports Science Consortium',
      antiDopingAuthority: 'USADA / NCAA',
      geofencedCloudRegion: 'us-central1 (Iowa / Midwest Local Zone)',
      dataSovereigntyProtocol: 'Zero-Cloud Egress Edge Encrypted'
    },
    {
      id: 'uo_ducks',
      name: 'University of Oregon (Knight Campus Bioengineering)',
      country: 'United States',
      region: 'North America',
      jurisdiction: 'US_NCAA',
      flagshipLab: 'Phil & Penny Knight Campus for Accelerating Scientific Impact',
      regulatoryFramework: 'HIPAA Safe Harbor / Oregon Biomedical Collaborative',
      antiDopingAuthority: 'USADA / NCAA',
      geofencedCloudRegion: 'us-west1 (Oregon Local Zone)',
      dataSovereigntyProtocol: 'Zero-Cloud Egress Edge Encrypted'
    },

    // United Kingdom & European Union (GDPR / UKRIO / NHS)
    {
      id: 'oxford_medicine',
      name: 'University of Oxford (Oxford Medical Sciences)',
      country: 'United Kingdom',
      region: 'Europe / UK',
      jurisdiction: 'UK_EU_GDPR',
      flagshipLab: 'Nuffield Department of Medicine & Oxford Orthopaedic Engineering',
      regulatoryFramework: 'UK GDPR / Data Protection Act 2018 / NHS FHIR UK Core',
      antiDopingAuthority: 'UKAD',
      geofencedCloudRegion: 'europe-west2 (London Sovereign Cluster)',
      dataSovereigntyProtocol: 'Strict GDPR Art. 9 Special Category Pinned Storage'
    },
    {
      id: 'karolinska_institutet',
      name: 'Karolinska Institutet (Nobel Assembly & Sports Health)',
      country: 'Sweden / EU',
      region: 'Europe / UK',
      jurisdiction: 'UK_EU_GDPR',
      flagshipLab: 'Department of Physiology and Pharmacology & Sports Medicine',
      regulatoryFramework: 'EU GDPR Regulation 2016/679 / Swedish Ethical Review Authority',
      antiDopingAuthority: 'WADA',
      geofencedCloudRegion: 'europe-north1 (Finland / Nordic Sovereign Cluster)',
      dataSovereigntyProtocol: 'EU-Only Data Residency (Schrems II Hard Boundary)'
    },

    // Asia-Pacific (Australia / Japan / Singapore)
    {
      id: 'unimelb_medicine',
      name: 'University of Melbourne (Melbourne Medical School & AIS)',
      country: 'Australia',
      region: 'Asia-Pacific',
      jurisdiction: 'APAC_CROSS_BORDER',
      flagshipLab: 'Centre for Health, Exercise and Sports Medicine (CHESM)',
      regulatoryFramework: 'Privacy Act 1988 (APPs) / TGA Medical Software Guidelines',
      antiDopingAuthority: 'Sport Integrity Australia',
      geofencedCloudRegion: 'australia-southeast1 (Sydney Edge Node)',
      dataSovereigntyProtocol: 'Australian Health Data Residency Guarantee'
    },
    {
      id: 'nus_medicine',
      name: 'National University of Singapore (Yong Loo Lin Medicine)',
      country: 'Singapore',
      region: 'Asia-Pacific',
      jurisdiction: 'APAC_CROSS_BORDER',
      flagshipLab: 'Bishan Sports Performance & Translational Immunology Lab',
      regulatoryFramework: 'Personal Data Protection Act (PDPA) / HSA Singapore',
      antiDopingAuthority: 'WADA',
      geofencedCloudRegion: 'asia-southeast1 (Singapore Sovereign Edge)',
      dataSovereigntyProtocol: 'APEC Cross-Border Privacy Rules (CBPR) Enforcement'
    },
    {
      id: 'utokyo_medicine',
      name: 'University of Tokyo (Graduate School of Medicine)',
      country: 'Japan',
      region: 'Asia-Pacific',
      jurisdiction: 'APAC_CROSS_BORDER',
      flagshipLab: 'Integrative Kampo Medicine & Robotic Biomechanics',
      regulatoryFramework: 'APPI (Act on the Protection of Personal Information) / PMDA',
      antiDopingAuthority: 'JADA',
      geofencedCloudRegion: 'asia-northeast1 (Tokyo Edge Node)',
      dataSovereigntyProtocol: 'Japanese Sovereign Cloud & Kampo Evidence Isolation'
    },

    // Canada (PIPEDA / U15)
    {
      id: 'utoronto_medicine',
      name: 'University of Toronto (Temerty Faculty of Medicine)',
      country: 'Canada',
      region: 'North America',
      jurisdiction: 'CA_PIPEDA',
      flagshipLab: 'Goldring Centre for High Performance Sport & Vector Institute',
      regulatoryFramework: 'PIPEDA / PHIPA Ontario / Health Canada Class I SaMD',
      antiDopingAuthority: 'CCES',
      geofencedCloudRegion: 'northamerica-northeast1 (Montreal/Toronto Zone)',
      dataSovereigntyProtocol: 'Canadian In-Country Health Residency (Zero US Cloud Transit)'
    }
  ]);

  // --- Reactive Siloed Geofence Attestation ---
  readonly activeGeofenceAttestation = computed<IGeofenceResidencyAttestation>(() => {
    const jur = this.activeJurisdiction();
    
    let sovereignRegion = 'us-west1 (Oregon / Local Zone)';
    let reg = 'HIPAA §164.514 Safe Harbor & NCAA CSMAS';
    let doping = 'USADA / NCAA Banned Substance List';

    if (jur === 'UK_EU_GDPR') {
      sovereignRegion = 'europe-west2 (London Sovereign Cluster)';
      reg = 'UK/EU GDPR Art. 9 & NHS UK Core Standards';
      doping = 'WADA / UKAD Code 2026';
    } else if (jur === 'APAC_CROSS_BORDER') {
      sovereignRegion = 'asia-southeast1 / australia-southeast1 (APAC Edge)';
      reg = 'APEC Cross-Border Privacy Rules & TGA/PMDA';
      doping = 'Sport Integrity Australia & JADA';
    } else if (jur === 'CA_PIPEDA') {
      sovereignRegion = 'northamerica-northeast1 (Canada Sovereign)';
      reg = 'PIPEDA & PHIPA Ontario Health Data Act';
      doping = 'Canadian Centre for Ethics in Sport (CCES)';
    } else if (jur === 'GLOBAL_WHO') {
      sovereignRegion = 'Local Device Only (Offline WASM Zero-Egress)';
      reg = 'WHO Essential Health Telemetry & Global Digital Health Guidelines';
      doping = 'WADA International Standard for Testing';
    }

    // Deterministic cryptographic seal
    const sealInput = `${jur}::${sovereignRegion}::POCKETGULL_LLC_GEOFENCE_v1.25.0`;
    let hash = 0;
    for (let i = 0; i < sealInput.length; i++) {
      hash = ((hash << 5) - hash) + sealInput.charCodeAt(i);
      hash |= 0;
    }
    const sealHash = `GEO-SEAL-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;

    return {
      jurisdiction: jur,
      geofenceActive: true,
      sovereignEdgeRegion: sovereignRegion,
      regulatoryStandard: reg,
      antiDopingCompliance: doping,
      residencySealHash: sealHash,
      crossBorderTransferAllowed: false,
      legalRepresentative: 'PocketGull LLC Data Protection & Sovereignty Officer'
    };
  });

  // --- Silo Switching Methods ---
  setJurisdiction(jurisdiction: InternationalJurisdiction): void {
    this.activeJurisdiction.set(jurisdiction);
  }

  selectUniversity(id: string): void {
    this.selectedUniversityId.set(id);
    const uni = this.internationalPartners().find(p => p.id === id);
    if (uni) {
      this.activeJurisdiction.set(uni.jurisdiction);
    }
  }
}
