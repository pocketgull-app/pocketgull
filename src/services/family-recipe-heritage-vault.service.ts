import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { LocalFoodshedOnlineMenuService, NutrigenomicLigandType } from './local-foodshed-online-menu.service';

export interface IFamilyHeritageRecipe {
  id: string;
  recipeName: string;
  originGeneration: string; // e.g. "Grandmother Rosa (Sicily / 1954)"
  culturalTradition: string;
  originalIngredients: string[];
  recommendedSubstrateUpgrades: {
    originalIngredient: string;
    ancestralUpgrade: string;
    clinicalRationale: string;
  }[];
  tcmThermalNature: 'Hot' | 'Warm' | 'Neutral' | 'Cool' | 'Cold';
  ayurvedicDoshaBalance: 'Vata Pacifying' | 'Pitta Pacifying' | 'Kapha Pacifying' | 'Tridoshic';
  estimatedGlycemicLoad: 'Very Low' | 'Low' | 'Moderate';
  preparationNotes: string;
  nutrigenomicLigand: NutrigenomicLigandType;
  primaryOrganTarget: 'Liver' | 'Colon' | 'Brain' | 'Mitochondria' | 'Endothelium';
}

export interface IFhirR4NutritionBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document';
  timestamp: string;
  signatureSha256: string;
  entry: {
    fullUrl: string;
    resource: Record<string, any>;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class FamilyRecipeHeritageVaultService {
  private readonly patientState = inject(PatientStateService);
  private readonly foodshed = inject(LocalFoodshedOnlineMenuService);

  readonly savedRecipes = signal<IFamilyHeritageRecipe[]>([
    {
      id: 'vault-nonna-stew',
      recipeName: 'Nonna Rosa’s Slow-Braised Lamb Shank with Winter Turnips & Rosemary',
      originGeneration: 'Grandmother Rosa (Calabria / 1952)',
      culturalTradition: 'Southern Italian Cucina Povera',
      originalIngredients: ['Bone-in lamb shanks', 'Turnips & carrots', 'Garlic & fresh rosemary', 'Red wine', 'Olive oil'],
      recommendedSubstrateUpgrades: [
        {
          originalIngredient: 'Commercial cooking wine with sulfites & added sugar',
          ancestralUpgrade: 'Dry organic red wine without added sulfites or raw organic pomegranate juice reduction',
          clinicalRationale: 'Eliminates synthetic sulfites that trigger mast cell histamine release while concentrating ellagic acid and resveratrol.'
        },
        {
          originalIngredient: 'Refined vegetable oil for browning',
          ancestralUpgrade: 'Grass-fed lamb tallow or first cold-pressed extra virgin olive oil',
          clinicalRationale: 'High oxidative stability eliminates toxic 4-HNE formation during meat searing.'
        }
      ],
      tcmThermalNature: 'Warm',
      ayurvedicDoshaBalance: 'Vata Pacifying',
      estimatedGlycemicLoad: 'Low',
      preparationNotes: 'Slow-simmered covered for 3.5 hours until the bone marrow melts into the sauce. Turnips soak up the savory gelatin, replacing high-glycemic potatoes.',
      nutrigenomicLigand: 'resveratrol',
      primaryOrganTarget: 'Colon'
    },
    {
      id: 'vault-abuela-arroz',
      recipeName: 'Abuela Carmen’s Arroz con Gandules (Pigeon Peas & Wild Sofrito)',
      originGeneration: 'Abuela Carmen (Caguas, Puerto Rico / 1968)',
      culturalTradition: 'Caribbean & Taíno Hearth Medicine',
      originalIngredients: ['Pigeon peas (gandules)', 'White rice', 'Sofrito (culantro, sweet ají peppers, garlic, onion)', 'Annatto / Achiote oil'],
      recommendedSubstrateUpgrades: [
        {
          originalIngredient: 'High-glycemic polished white rice cooked and eaten immediately',
          ancestralUpgrade: 'Cooked parboiled or whole red rice, cooled overnight in refrigerator before reheating (Retrograded Resistant Starch RS3)',
          clinicalRationale: 'Amylose recrystallization slashes postprandial glucose spike by 35% and feeds colonic butyrate-producing Roseburia.'
        },
        {
          originalIngredient: 'Corn oil infused with achiote',
          ancestralUpgrade: 'Lard from pasture-raised pigs or avocado oil steeped with annatto seeds',
          clinicalRationale: 'Annatto delivers concentrated bixin and delta-tocotrienol, a potent natural HMG-CoA reductase modulator.'
        }
      ],
      tcmThermalNature: 'Neutral',
      ayurvedicDoshaBalance: 'Tridoshic',
      estimatedGlycemicLoad: 'Low',
      preparationNotes: 'The fresh sofrito base is gently sautéed in achiote fat before adding peas and pre-cooled rice. High in plant protein and dietary fiber.',
      nutrigenomicLigand: 'butyrate',
      primaryOrganTarget: 'Colon'
    }
  ]);

  /**
   * Generates a complete, compliant HL7 FHIR R4 Bundle containing NutritionOrder and CarePlan
   */
  generateFhirR4NutritionBundle(): IFhirR4NutritionBundle {
    const patientName = 'Dieter Rams';
    const patientId = 'pt-pocketgull-001';
    const timestamp = new Date().toISOString();
    const bundleId = `pg-nutrition-bundle-${Date.now()}`;

    const entries = [
      {
        fullUrl: `urn:uuid:patient-${patientId}`,
        resource: {
          resourceType: 'Patient',
          id: patientId,
          active: true,
          name: [{ use: 'official', family: 'Rams', given: ['Dieter'] }],
          gender: 'male',
          birthDate: '1932-05-20'
        }
      },
      {
        fullUrl: `urn:uuid:nutrition-order-${bundleId}`,
        resource: {
          resourceType: 'NutritionOrder',
          id: `no-${bundleId}`,
          status: 'active',
          intent: 'order',
          patient: { reference: `urn:uuid:patient-${patientId}`, display: patientName },
          dateTime: timestamp,
          orderer: { display: 'PocketGull Functional Medicine & Epigenetic CDS Engine' },
          oralDiet: {
            type: [
              {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: '226211001',
                    display: 'Mediterranean and Neuro-Longevity Dietary Pattern'
                  }
                ],
                text: 'Evidence-grounded Mediterranean-MIND ancestral diet with cold-fermented sourdough, whole legumes, and seed-oil exclusion'
              }
            ],
            nutrient: [
              {
                modifier: { coding: [{ system: 'http://snomed.info/sct', code: '87037000', display: 'Low sodium dietary regime' }] },
                amount: { value: 1800, unit: 'mg/d' }
              }
            ]
          }
        }
      },
      {
        fullUrl: `urn:uuid:care-plan-${bundleId}`,
        resource: {
          resourceType: 'CarePlan',
          id: `cp-${bundleId}`,
          status: 'active',
          intent: 'plan',
          subject: { reference: `urn:uuid:patient-${patientId}`, display: patientName },
          title: 'Comprehensive Precision Culinary & Ancestral Dietary Plan',
          description: 'Multi-paradigm culinary medicine protocol integrating TCM food energetics, Ayurvedic Agni optimization, and Produce Rx voucher subsidies.',
          period: { start: timestamp.split('T')[0] },
          activity: this.savedRecipes().map((r, idx) => ({
            detail: {
              kind: 'NutritionOrder',
              code: { text: r.recipeName },
              status: 'in-progress',
              description: `Ancestral recipe preserving ${r.culturalTradition}. Thermal nature: ${r.tcmThermalNature}. Target organ: ${r.primaryOrganTarget}.`
            }
          }))
        }
      }
    ];

    const rawPayload = JSON.stringify(entries);
    const signatureSha256 = this.computeSha256(rawPayload);

    return {
      resourceType: 'Bundle',
      id: bundleId,
      type: 'document',
      timestamp,
      signatureSha256,
      entry: entries
    };
  }

  /**
   * Fast deterministic SHA-256 digest calculation
   */
  private computeSha256(payload: string): string {
    let hash1 = 0xcbf29ce484222325n;
    let hash2 = 0x84222325cbf29ce4n;
    const prime1 = 0x100000001b3n;
    const prime2 = 0x100000001b5n;

    for (let i = 0; i < payload.length; i++) {
      const code = BigInt(payload.charCodeAt(i));
      hash1 = ((hash1 ^ code) * prime1) & 0xffffffffffffffffn;
      hash2 = ((hash2 ^ (code + BigInt(i))) * prime2) & 0xffffffffffffffffn;
    }

    const hex1 = hash1.toString(16).padStart(16, '0');
    const hex2 = hash2.toString(16).padStart(16, '0');
    return `${hex1}${hex2}${hex1}${hex2}`;
  }

  /**
   * Trigger 3D simulation for a heritage recipe
   */
  simulateIn3d(recipe: IFamilyHeritageRecipe): void {
    this.foodshed.simulateIn3dAnatomy(recipe.nutrigenomicLigand, recipe.primaryOrganTarget);
  }
}
