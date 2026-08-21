/**
 * Corporate Identity & Compliance Metadata for PocketGull LLC.
 * Certified against Oregon Secretary of State Articles of Organization (Registry: 258869891)
 * and IRS Notice CP575G (EIN: 42-3162850).
 */

export interface ICorporateEntity {
  legalName: string;
  dba: string;
  entityType: 'Domestic Limited Liability Company';
  stateOfFormation: 'Oregon';
  sosRegistryNumber: string;
  dateFormed: string;
  ein: string;
  soleMember: string;
  principalOffice: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  clinicalInformaticsCredentials: {
    cmsNpi: string;
    orcid: string;
    taxonomyCode: string;
    taxonomyDescription: string;
  };
  contact: {
    officialEmail: string;
    privacyDpoEmail: string;
    phone: string;
    website: string;
  };
  openScience: {
    zenodoDoi: string;
    license: string;
  };
}

export const POCKETGULL_CORPORATE_IDENTITY: ICorporateEntity = {
  legalName: 'PocketGull LLC',
  dba: 'PocketGull',
  entityType: 'Domestic Limited Liability Company',
  stateOfFormation: 'Oregon',
  sosRegistryNumber: '258869891',
  dateFormed: '2026-06-15',
  ein: '42-3162850',
  soleMember: 'Phillip Gear',
  principalOffice: {
    street: '101 SW Madison St #1664',
    city: 'Portland',
    state: 'OR',
    zip: '97207',
    country: 'USA',
  },
  clinicalInformaticsCredentials: {
    cmsNpi: '1487569752',
    orcid: '0009-0008-1372-5381',
    taxonomyCode: '174400000X',
    taxonomyDescription: 'Health Informatics & Clinical Decision Support Specialist',
  },
  contact: {
    officialEmail: 'leads@pocketgull.app',
    privacyDpoEmail: 'dpo@pocketgull.app',
    phone: '(419) 203-7557',
    website: 'https://pocketgull.com',
  },
  openScience: {
    zenodoDoi: '10.5281/zenodo.20647514',
    license: 'Apache-2.0 / CC-BY-4.0',
  },
};
