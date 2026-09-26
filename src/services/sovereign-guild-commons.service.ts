/**
 * @file sovereign-guild-commons.service.ts
 * @description Evidence-grounded Sovereign Guild & Commons Governance Service.
 * Disproves Hardin's "Tragedy of the Commons" using Elinor Ostrom's Nobel Prize-winning
 * 8 Core Design Principles for Managing Common Pool Resources (CPRs).
 *
 * Implements:
 * 1. Ostrom CPR Diagnostic Scorecard (Clear Boundaries, Reciprocity, Collective Choice,
 *    Monitoring, Graduated Sanctions, Conflict Resolution, Self-Determination, Nested Enterprises).
 * 2. School Closure Rapid Defense Protocol (Community Land Trusts [CLT], Homeschool Cooperative Pods,
 *    De-Financialized Educational Charters).
 * 3. Autonomous Guild Apprenticeships (Useful Arts, Agro-ecology, Electronics Repair, Emergency Health Triage).
 * 4. Anti-Enclosure & Anti-Short-Selling Legal Playbook (FOIA school board audit, 501(d)/501(c)(3) legal shells).
 */

import { Injectable, signal, computed } from '@angular/core';

export interface IOstromPrincipleAudit {
  principleNumber: number;
  name: string;
  hardinMythDebunked: string;
  operationalMechanism: string;
  status: 'OPTIMAL' | 'VULNERABLE' | 'CRITICAL_RISK';
  concreteRemediation: string;
}

export interface ICommunityPodCharter {
  podId: string;
  podName: string;
  category: 'Community Micro-School / POD' | 'Agro-Ecological Food Forest' | 'Community Tool Guild & Repair Cafe' | 'Neighborhood EMT First-Responder Network';
  stewardsCount: number;
  boundaryDefinition: string;
  reciprocityRules: string;
  conflictResolutionProtocol: string;
  legalEntityFormat: 'Community Land Trust (CLT)' | '501(d) Common Treasury Trust' | 'Agricultural Co-op' | 'Independent Micro-School Association';
}

export interface IGuildCurriculumModule {
  id: string;
  title: string;
  domain: 'Useful Arts & Mechanics' | 'Regenerative Ecology & Soil' | 'Autonomous Health & Herbal Triage' | 'Civic Sovereignty & Legal Defense';
  description: string;
  coreCompetencies: string[];
  offlineResourceKit: string;
  apprenticeProject: string;
}

export interface IAntiEnclosurePlaybookStep {
  stepNumber: number;
  threatVector: string;
  financialMechanism: string;
  communityDefenseAction: string;
  legalFilingReference: string;
}

@Injectable({
  providedIn: 'root'
})
export class SovereignGuildCommonsService {
  // Active pod evaluation state
  readonly activePodName = signal<string>('Cascadia Neighborhood Learning & Maker Guild');
  readonly currentStewardsCount = signal<number>(14);
  
  // Ostrom 8 Principles Compliance Scores (1-5 scale)
  readonly clearBoundariesScore = signal<number>(4);
  readonly reciprocityBalanceScore = signal<number>(3);
  readonly collectiveChoiceScore = signal<number>(5);
  readonly accountableMonitoringScore = signal<number>(4);
  readonly graduatedSanctionsScore = signal<number>(3);
  readonly conflictResolutionScore = signal<number>(4);
  readonly recognizedAutonomyScore = signal<number>(4);
  readonly nestedFederationScore = signal<number>(4);

  // Ostrom 8 Principles Matrix
  readonly ostromPrinciples = computed<IOstromPrincipleAudit[]>(() => [
    {
      principleNumber: 1,
      name: 'Clearly Defined Boundaries',
      hardinMythDebunked: 'Hardin assumed open-access pasture where strangers exploit without limits. Real commons know exactly who belongs and what is shared.',
      operationalMechanism: 'Explicit membership compact with unambiguous physical or digital resource boundaries (e.g., who has workshop keycard access).',
      status: this.clearBoundariesScore() >= 4 ? 'OPTIMAL' : this.clearBoundariesScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'Draft explicit Membership & Stewardship Charter clarifying rights to use vs obligations to maintain.'
    },
    {
      principleNumber: 2,
      name: 'Congruence Between Rules & Local Needs (Reciprocity)',
      hardinMythDebunked: 'Hardin claimed individuals will always overgraze. In stable commons, those who take more must contribute more labor or materials.',
      operationalMechanism: 'Sweat-equity reciprocity ledger tracking volunteer hours, teaching time, or maintenance contributions without financial extraction.',
      status: this.reciprocityBalanceScore() >= 4 ? 'OPTIMAL' : this.reciprocityBalanceScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'Institute a 4-hour/month cooperative stewardship pledge for all active pod families to eliminate single-volunteer burnout.'
    },
    {
      principleNumber: 3,
      name: 'Collective-Choice Arrangements',
      hardinMythDebunked: 'Top-down central state or private corporate dictatorship is NOT the only path to order. Those affected by the rules must help make them.',
      operationalMechanism: 'Quarterly consensus-based town hall circles where teachers, parents, and adolescent apprentices ratify operational policy.',
      status: this.collectiveChoiceScore() >= 4 ? 'OPTIMAL' : this.collectiveChoiceScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'Ensure 100% of participants have voting or consensus veto power on scheduling, budget, and safety changes.'
    },
    {
      principleNumber: 4,
      name: 'Accountable Monitoring by Peers',
      hardinMythDebunked: 'Hardin believed commons lack accountability. In real commons, the users themselves monitor each other because they own the outcome.',
      operationalMechanism: 'Transparent open logbooks for tool borrowing, supply depletion, and financial ledger receipts.',
      status: this.accountableMonitoringScore() >= 4 ? 'OPTIMAL' : this.accountableMonitoringScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'Deploy a decentralized, offline QR-code inventory system for tools, seeds, and first-aid kits.'
    },
    {
      principleNumber: 5,
      name: 'Graduated Sanctions',
      hardinMythDebunked: 'Hardin assumed zero enforcement or draconian police state. Healthy commons apply gentle, tiered restorative corrections first.',
      operationalMechanism: 'Tier 1: Private restorative conversation; Tier 2: Temporary pause of borrow privileges; Tier 3: Circle mediation.',
      status: this.graduatedSanctionsScore() >= 4 ? 'OPTIMAL' : this.graduatedSanctionsScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'Codify a 3-tier restorative covenant so rule infractions are resolved as educational moments rather than bitter feuds.'
    },
    {
      principleNumber: 6,
      name: 'Fast, Low-Cost Conflict Resolution',
      hardinMythDebunked: 'Disputes do not need expensive \$500/hour lawyers. Localized peer mediation circles resolve tensions in days, not years.',
      operationalMechanism: 'Designated 3-person peer mediation circle trained in Non-Violent Communication (NVC) and Restorative Justice.',
      status: this.conflictResolutionScore() >= 4 ? 'OPTIMAL' : this.conflictResolutionScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'Appoint rotational elder/peer ombudspersons to mediate disputes before they poison group cohesion.'
    },
    {
      principleNumber: 7,
      name: 'Recognized Right to Self-Determine',
      hardinMythDebunked: 'External governments often destroy commons by invalidating local rules. Commons survive when authorities respect their autonomy.',
      operationalMechanism: 'Legal structure (501(c)(3) homeschool cooperative, Religious/Ethical Society, or Agricultural Co-op) recognized by state statute.',
      status: this.recognizedAutonomyScore() >= 4 ? 'OPTIMAL' : this.recognizedAutonomyScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'File state micro-school / co-op articles of association to protect the commons against municipal harassment.'
    },
    {
      principleNumber: 8,
      name: 'Nested Polycentric Enterprises',
      hardinMythDebunked: 'A single small commons can be bullied or bought out. Networked federations of autonomous pods share defense and curriculum.',
      operationalMechanism: 'Federated guild pact where 10-20 neighborhood pods share bulk tool purchasing, legal defense funds, and master teachers.',
      status: this.nestedFederationScore() >= 4 ? 'OPTIMAL' : this.nestedFederationScore() >= 3 ? 'VULNERABLE' : 'CRITICAL_RISK',
      concreteRemediation: 'Link the local pod to regional maker-spaces, community land trusts, and mutual-aid networks for collective resilience.'
    }
  ]);

  // Overall Commons Resilience Index (0-100%)
  readonly commonsResilienceIndex = computed<number>(() => {
    const scores = [
      this.clearBoundariesScore(),
      this.reciprocityBalanceScore(),
      this.collectiveChoiceScore(),
      this.accountableMonitoringScore(),
      this.graduatedSanctionsScore(),
      this.conflictResolutionScore(),
      this.recognizedAutonomyScore(),
      this.nestedFederationScore()
    ];
    const total = scores.reduce((a, b) => a + b, 0);
    return Math.round((total / 40) * 100);
  });

  // Anti-Enclosure & School Closure Defense Playbook
  readonly antiEnclosurePlaybook: IAntiEnclosurePlaybookStep[] = [
    {
      stepNumber: 1,
      threatVector: 'Predatory Bond Default & Municipal Austerity',
      financialMechanism: 'Private equity firms short municipal bonds or purchase school district debt at deep discounts, forcing campus closure and real estate liquidation.',
      communityDefenseAction: 'Public Records / FOIA Debt Audit: Demand copies of all municipal financial advisory contracts, swap agreements, and charter co-location deals.',
      legalFilingReference: 'State Freedom of Information Act (FOIA) & Municipal Securities Rulemaking Board (MSRB) Form G-37'
    },
    {
      stepNumber: 2,
      threatVector: 'Hostile Real Estate Conversion',
      financialMechanism: 'School grounds rezoned for luxury commercial/residential high-rises after manufactured "declining enrollment" narratives.',
      communityDefenseAction: 'Form a Community Land Trust (CLT): Enact a municipal Right of First Refusal to transfer the campus to community ownership in perpetuity.',
      legalFilingReference: 'Uniform Community Land Trust Act & 501(c)(3) Community Development Corporation (CDC)'
    },
    {
      stepNumber: 3,
      threatVector: 'SaaS Vendor Lock-In & Digital Extortion',
      financialMechanism: 'District spends millions on proprietary digital testing/LMS systems, then cuts teachers and arts programs when budget shortfalls hit.',
      communityDefenseAction: 'Deploy Zero-Egress Offline Tech Stacks: Run Raspberry Pi 5 local educational servers with offline Wikipedia, Khan Academy, and OpenStax.',
      legalFilingReference: 'Open-Source Educational Licenses (GPL-3.0 / CC-BY-SA 4.0)'
    },
    {
      stepNumber: 4,
      threatVector: 'Loss of Physical Space & Eviction',
      financialMechanism: 'District locks the doors and cancels student bus routes overnight.',
      communityDefenseAction: 'Decentralize into the "Invisible College": Activate neighborhood libraries, faith spaces (Gurdwaras/churches), public parks, and maker garages.',
      legalFilingReference: 'State Homeschool Co-op / Micro-School Association Exemption Statutes'
    }
  ];

  // Sovereign Guild Apprenticeship Modules
  readonly guildModules: IGuildCurriculumModule[] = [
    {
      id: 'mod-repair-arts',
      title: 'Right to Repair: Electronics, Appliances & Power Tools',
      domain: 'Useful Arts & Mechanics',
      description: 'Hands-on hardware sovereignty. Teaches component-level soldering, multimeter diagnostics, schematic reading, and lithium battery restoration.',
      coreCompetencies: ['SMD and through-hole soldering', 'Capacitor/diode fault isolation', '18650/21700 battery pack rebuilds with BMS balancing'],
      offlineResourceKit: 'iFixit Repair Manuals, Schematics Archive, FreeCAD Open Hardware Specs',
      apprenticeProject: 'Restore 5 non-functional broken microwaves or laptops collected from neighborhood recycling.'
    },
    {
      id: 'mod-agro-ecology',
      title: 'Food Forest & Soil Ecology: Zero-Cost Nutrient Cycling',
      domain: 'Regenerative Ecology & Soil',
      description: 'Biological independence. Compost thermodynamics, fungal/bacterial soil microscopy, heirloom seed preservation, and greywater micro-swales.',
      coreCompetencies: ['Hot thermal compost sequencing (135-160°F weed/pathogen kill)', 'Soil chromatography', 'Grafting heritage apple/pear scions'],
      offlineResourceKit: 'Rodale Institute Open Agronomy, USDA Soil Biology Guide, Heirloom Seed Savers Manual',
      apprenticeProject: 'Transform a 500 sq ft suburban lawn or community easement into a perennial polyculture edible guild.'
    },
    {
      id: 'mod-emergency-triage',
      title: 'Wilderness & Street Medic: Low-Resource First Response',
      domain: 'Autonomous Health & Herbal Triage',
      description: 'Frontline health resilience. Hemorrhage control, splinting, vitals trend analysis, herbal hemostatics, and bio-decontamination.',
      coreCompetencies: ['CAT Gen 7 Tourniquet application under 30 seconds', 'Auscultation of rales/rhonchi', 'Mass Casualty Triage (START protocol)'],
      offlineResourceKit: 'Where There Is No Doctor (Hesperian), Tactical Combat Casualty Care (TCCC) Handbook',
      apprenticeProject: 'Assemble and maintain a 72-hour community triage kit and run a neighborhood mock casualty drill.'
    },
    {
      id: 'mod-civic-trusts',
      title: 'Commons Law & Mutual Aid Financial Architecture',
      domain: 'Civic Sovereignty & Legal Defense',
      description: 'De-financialized institution building. How to draft bylaws, manage sweat-equity accounting, incorporate cooperatives, and navigate zoning.',
      coreCompetencies: ['Drafting Ostrom-compliant bylaws', 'Double-entry communal bookkeeping', 'Submitting municipal zoning variances for communal agriculture'],
      offlineResourceKit: 'Sustainable Economies Law Center (SELC) Legal Toolkit, Ostrom Governing the Commons Codex',
      apprenticeProject: 'Draft complete articles of association and reciprocity rules for a neighborhood tool-sharing library.'
    }
  ];

  // Setters for Ostrom diagnostic
  setScore(principle: number, val: number): void {
    const clamped = Math.max(1, Math.min(5, val));
    switch (principle) {
      case 1: this.clearBoundariesScore.set(clamped); break;
      case 2: this.reciprocityBalanceScore.set(clamped); break;
      case 3: this.collectiveChoiceScore.set(clamped); break;
      case 4: this.accountableMonitoringScore.set(clamped); break;
      case 5: this.graduatedSanctionsScore.set(clamped); break;
      case 6: this.conflictResolutionScore.set(clamped); break;
      case 7: this.recognizedAutonomyScore.set(clamped); break;
      case 8: this.nestedFederationScore.set(clamped); break;
    }
  }

  /**
   * Generates a complete Elinor Ostrom Commons Charter document ready for printing or legal ratification
   */
  generateCommonsCharterMarkdown(): string {
    const pod = this.activePodName();
    const index = this.commonsResilienceIndex();
    const timestamp = new Date().toISOString().split('T')[0];

    return `# COVENANT & GOVERNANCE CHARTER
## ${pod.toUpperCase()}
**Ratification Date:** ${timestamp}  
**Governing Standard:** Elinor Ostrom Nobel Laureate Framework for Common Pool Resources (CPRs)  
**Commons Health Index:** ${index}%

---

### Article I: Clear Boundaries & Resource Demarcation (Ostrom Principle 1)
1. **The Shared Commons:** All tools, physical premises, heirloom seed banks, and educational hardware managed under this charter belong irrevocably to the collective membership and cannot be alienated, sold, or liquidated for private shareholder dividend.
2. **Membership Compact:** Membership is granted to individuals who formally ratify this covenant and commit to active stewardship.

### Article II: Reciprocal Sweat-Equity & Provision (Ostrom Principle 2)
1. **Reciprocity Invariant:** Every steward pledges a minimum of 4 hours per month toward collective operations (maintenance, teaching, sanitation, or administrative facilitation).
2. **Zero Commercial Extraction:** No corporate entity may extract fees, data, or intellectual property from learning artifacts produced within this commons.

### Article III: Collective Choice & Direct Consensus (Ostrom Principle 3)
1. **Rule Changes:** Any modification to operational hours, safety rules, or mutual aid expenditures requires a minimum 80% consensus of present members at the Quarterly Commons Circle.
2. **Universal Voice:** Every participant, regardless of background or financial standing, holds exactly one vote.

### Article IV: Accountable Peer Monitoring & Radical Transparency (Ostrom Principle 4)
1. **Open Ledgers:** All tools, consumable materials, and monetary donations are logged in an auditable, public logbook accessible to all members at all times.
2. **Peer Review:** Equipment condition is inspected collectively at each checkout and return.

### Article V: Graduated Restorative Sanctions (Ostrom Principle 5)
1. **Tier 1 (First Warning):** Confidential restorative dialogue between the member and an appointed peer ombudsperson.
2. **Tier 2 (Reparation):** Temporary suspension of tool checkout privileges until damaged equipment is repaired or replaced with equivalent sweat-equity labor.
3. **Tier 3 (Separation):** Circle review for recurrent bad-faith harm, with formal suspension from the physical premises.

### Article VI: Rapid, Low-Cost Conflict Mediation (Ostrom Principle 6)
1. **Direct Mediation:** All grievances must be brought before the 3-person Peer Mediation Circle within 7 days.
2. **Zero-Litigation Pact:** Members commit to good-faith mediation prior to any outside legal filing.

### Article VII: Autonomy & Self-Determination (Ostrom Principle 7)
1. **Legal Shell:** This guild operates as an autonomous, self-governing unincorporated nonprofit association / Community Land Trust affiliate protected under statutory rights to assemble and educate.

### Article VIII: Nested Polycentric Federation (Ostrom Principle 8)
1. **Mutual Defense:** This guild federates horizontally with sister pods in the bioregion to pool insurance, share specialized machinery, and defend against hostile municipal enclosures.

---
*Signed in mutual solidarity by the Stewards of ${pod}.*
`;
  }
}
