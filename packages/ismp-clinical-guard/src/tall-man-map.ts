// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear

/**
 * FDA / ISMP Official Tall Man Lettering Map for Look-Alike / Sound-Alike (LASA) medications.
 * Key: Lowercase normalized drug name
 * Value: Official ISMP Tall Man formatted name
 */
export const TALL_MAN_MAP: ReadonlyMap<string, string> = new Map([
  // Oncology & Chemotherapy (Highest Mortality Confusion Pairs)
  ['vinblastine', 'vinBLAStine'],
  ['vincristine', 'vinCRIStine'],
  ['vinorelbine', 'vinorELBINE'],
  ['cisplatin', 'CISplatin'],
  ['carboplatin', 'carboPLATIN'],
  ['doxorubicin', 'DOXOrubicin'],
  ['daunorubicin', 'DAUNOrubicin'],
  ['epirubicin', 'epiRUBICIN'],
  ['idarubicin', 'iDARUBICIN'],
  ['paclitaxel', 'PACLitaxel'],
  ['docetaxel', 'DOCEtaxel'],
  ['mitomycin', 'mitoMYCIN'],
  ['mitoxantrone', 'mitoXANTRONE'],
  ['azacitidine', 'azaCITIDine'],
  ['azathioprine', 'azaTHIOprine'],

  // Cardiovascular & Vasodilators
  ['hydralazine', 'hydrALAZINE'],
  ['hydroxyzine', 'hydrOXYzine'],
  ['amiodarone', 'amioDARONE'],
  ['amlodipine', 'amLODIPine'],
  ['nicardipine', 'niCARdipine'],
  ['nifedipine', 'NIFEdipine'],
  ['nimodipine', 'NIMOdipine'],
  ['diltiazem', 'diltiaZEM'],
  ['diazepam', 'diaZEPAM'],
  ['propranolol', 'propraNOLOL'],
  ['atenolol', 'atenOLOL'],
  ['lisinopril', 'lisinOPRIL'],
  ['enalapril', 'enalAPRIL'],
  ['losartan', 'loSARtan'],
  ['valsartan', 'valSARtan'],
  ['dobutamine', 'DOBUTamine'],
  ['dopamine', 'DOPamine'],
  ['ephedrine', 'ePHEDrine'],
  ['epinephrine', 'EPINEPHrine'],

  // Antidiabetic & Metabolic
  ['glipizide', 'glipiZIDE'],
  ['glyburide', 'glyBURIDE'],
  ['acetohexamide', 'acetoHEXAMIDE'],
  ['acetazolamide', 'acetaZOLAMIDE'],
  ['tolbutamide', 'TOLBUTamide'],
  ['tolazamide', 'TOLAZamide'],
  ['metformin', 'metFORMIN'],
  ['metronidazole', 'metroNIDAZOLE'],

  // Psychiatric & Neurological
  ['alprazolam', 'ALPRAZolam'],
  ['lorazepam', 'LORazepam'],
  ['clonazepam', 'clonazePAM'],
  ['clonidine', 'cloNIDine'],
  ['clozapine', 'cloZAPine'],
  ['olanzapine', 'OLANZapine'],
  ['quetiapine', 'queTIAPine'],
  ['risperidone', 'risperiDONE'],
  ['ropinirole', 'ropiniROLE'],
  ['bupropion', 'buPROPrion'],
  ['buspirone', 'busPIRone'],
  ['fluoxetine', 'FLUoxetine'],
  ['duloxetine', 'DULoxetine'],
  ['carbamazepine', 'carBAMazepine'],
  ['oxcarbazepine', 'OXcarbazepine'],
  ['lamotrigine', 'LAMOtrigine'],
  ['lamivudine', 'LAMIvudine'],
  ['chlorpromazine', 'chlorproMAZINE'],
  ['chlordiazepoxide', 'chlorDIAZepOXIDE'],
  ['pentobarbital', 'PENTobarbital'],
  ['phenobarbital', 'PHENobarbital'],
  ['rabeprazole', 'RABEprazole'],
  ['aripiprazole', 'aripiPRAZOLE'],

  // Analgesics & Opioids
  ['morphine', 'morPHINE'],
  ['hydromorphone', 'HYDROmorphone'],
  ['oxycodone', 'OXYcodone'],
  ['oxymorphone', 'OXYmorphone'],
  ['tramadol', 'traMADol'],
  ['trazodone', 'traZODone'],
  ['fentanyl', 'fentaNYL'],
  ['sufentanil', 'SUFentanil'],

  // Anti-Infective & Immunological
  ['celecoxib', 'celeCOXIB'],
  ['cephalexin', 'cefaLEXin'],
  ['cefazolin', 'cefAZOLin'],
  ['cefotaxime', 'cefOTAXime'],
  ['cefoxitin', 'cefOXitin'],
  ['ceftriaxone', 'cefTRIAXone'],
  ['ceftazidime', 'cefTAZidime'],
  ['cyclosporine', 'cycloSPORINE'],
  ['cycloserine', 'cycloSERINE'],
  ['infliximab', 'inFLIXimab'],
  ['rituximab', 'riTUXimab'],
  ['valacyclovir', 'valACYclovir'],
  ['valganciclovir', 'valGANCIClovir'],

  // Hematology & Thrombolysis
  ['alteplase', 'alTEPLASE'],
  ['tenecteplase', 'tenectePLASE'],
  ['heparin', 'HEPArin'],
  ['hespan', 'HESpan'],
  ['quinidine', 'quinIDine'],
  ['quinine', 'quinINE'],

  // Steroids & Hormones
  ['prednisone', 'predniSONE'],
  ['prednisolone', 'prednisoLONE'],
  ['medroxyprogesterone', 'medroxyPROGESTERone'],
  ['methylprednisolone', 'methylPREDNISolone'],
  ['methyltestosterone', 'methylTESTOSTERone'],
  ['dimenhydrinate', 'dimenhyDRINATE'],
  ['diphenhydramine', 'diphenhydrAMINE']
]);
