import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { LocalFoodshedOnlineMenuService, NutrigenomicLigandType } from './local-foodshed-online-menu.service';

export interface IKitchenTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isComplete: boolean;
}

export interface IAlchemistRecipe {
  title: string;
  culturalHeritage: string;
  culinaryTradition: 'TCM (食疗)' | 'Ayurveda (Āhāra)' | 'Indigenous / Three Sisters' | 'Mediterranean Cucina Povera';
  ingredientsUsed: string[];
  missingPantryPillarsRecommended: string[];
  biochemicalSynergies: { name: string; description: string }[];
  sixTastesOrThermalProfile: string;
  stepByStepCookingGuide: string[];
  predictedGlucoseSpikeMgDl: number;
  nutrigenomicLigand: NutrigenomicLigandType;
  primaryOrganTarget: 'Liver' | 'Colon' | 'Brain' | 'Mitochondria' | 'Endothelium';
}

@Injectable({
  providedIn: 'root'
})
export class KitchenVoiceAlchemistService {
  private readonly patientState = inject(PatientStateService);
  private readonly foodshed = inject(LocalFoodshedOnlineMenuService);

  readonly isListening = signal<boolean>(false);
  readonly speechSupported = signal<boolean>(typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window));
  readonly isSpeaking = signal<boolean>(false);
  readonly lastSpokenTranscript = signal<string>('Welcome to your Hands-Free Kitchen Companion. Ask me anything while your hands are busy cooking.');
  readonly recognizedQuery = signal<string>('');

  // 0.1 Hz Mayer Wave Parasympathetic Breathing / Pacing Mode
  readonly isParasympatheticPacingActive = signal<boolean>(true);

  // Active Kitchen Timers
  readonly activeTimers = signal<IKitchenTimer[]>([
    {
      id: 'timer-cong-bai',
      label: 'Scallion & Ginger (Cong Bai Tang) Simmer',
      totalSeconds: 900,
      remainingSeconds: 900,
      isRunning: false,
      isComplete: false
    },
    {
      id: 'timer-kitchari',
      label: 'Moong Dal & Basmati Porridge Braise',
      totalSeconds: 2100,
      remainingSeconds: 2100,
      isRunning: false,
      isComplete: false
    }
  ]);

  // Cupboard Pantry Input Ingredients
  readonly pantryInput = signal<string>('Pasture Eggs, Black Beans, Onion, Garlic, Fresh Spinach, Olive Oil, Cumin');

  // Active Alchemist Formulated Recipe
  readonly formulatedRecipe = signal<IAlchemistRecipe>({
    title: 'Warm Mediterranean Shakshuka-Style Skillet with Black Beans & Wilted Spinach',
    culturalHeritage: 'Levantine & Andalusian Peasant Hearth Tradition',
    culinaryTradition: 'Mediterranean Cucina Povera',
    ingredientsUsed: ['Pasture Eggs', 'Black Beans', 'Onion', 'Garlic', 'Fresh Spinach', 'Olive Oil', 'Cumin'],
    missingPantryPillarsRecommended: ['Raw Apple Cider Vinegar', 'A pinch of Crushed Red Pepper'],
    biochemicalSynergies: [
      {
        name: 'Fat-Soluble Carotenoid Extraction',
        description: 'Cooking lutein-rich spinach in monounsaturated extra virgin olive oil boosts intestinal carotenoid micellization and bioavailability by 400%.'
      },
      {
        name: 'Choline & Sulfur Neuroprotection',
        description: 'Pastured egg yolk phosphatidylcholine pairs with allium diallyl disulfide to support hepatic acetylcholine and glutathione synthesis.'
      },
      {
        name: 'Slow Amylose Glycemic Buffer',
        description: 'Black bean oligosaccharides and resistant starch create an intraluminal gel, flattening the postprandial glycemic surge to < 18 mg/dL.'
      }
    ],
    sixTastesOrThermalProfile: 'Warm thermal nature; balances Vata and Kapha; incorporates Sweet (beans), Pungent (garlic/onion), and Bitter (spinach).',
    stepByStepCookingGuide: [
      'Warm 1.5 tbsp extra virgin olive oil in a heavy cast iron skillet over medium heat.',
      'Sauté diced onion and minced garlic with cumin for 4 minutes until fragrant and translucent.',
      'Rinse black beans, add to skillet with 3 tbsp water, and gently mash half the beans with a wooden spoon to create a rich gravy.',
      'Fold in fresh spinach until just wilted (about 90 seconds to preserve heat-sensitive folates).',
      'Create 2 small wells in the skillet and crack in the pasture eggs. Cover with a lid and cook on low for 4-5 minutes until egg whites are set and yolks remain runny.',
      'Finish with a drizzle of raw unheated olive oil and fresh black pepper before serving.'
    ],
    predictedGlucoseSpikeMgDl: 16,
    nutrigenomicLigand: 'methyl_5mthf',
    primaryOrganTarget: 'Liver'
  });

  /**
   * Generates a custom recipe from current pantry input
   */
  generateAlchemistRecipe(ingredientsText: string): void {
    this.pantryInput.set(ingredientsText);
    const lower = ingredientsText.toLowerCase();

    if (lower.includes('lentil') || lower.includes('dal') || lower.includes('rice')) {
      this.formulatedRecipe.set({
        title: 'Revitalizing Golden Spiced Lentil & Vegetable Kitchari',
        culturalHeritage: 'Classical Ayurvedic Formularies (Charaka Samhita)',
        culinaryTradition: 'Ayurveda (Āhāra)',
        ingredientsUsed: ingredientsText.split(',').map(s => s.trim()),
        missingPantryPillarsRecommended: ['A2 Ghee or Sesame Oil', 'Fresh Ginger', 'Turmeric + Black Pepper'],
        biochemicalSynergies: [
          {
            name: 'Piperine + Curcumin Synergy',
            description: 'Black pepper piperine inhibits hepatic glucuronidation, raising curcumin bioabsorption by 2000%.'
          },
          {
            name: 'Moong Dal Gas-Free Assimilation',
            description: 'Split hulled lentils require minimal pancreatic enzymes, reducing metabolic endotoxemia and resting gut mucosa.'
          }
        ],
        sixTastesOrThermalProfile: 'Tridoshic (Balances Vata, Pitta, Kapha); incorporates all 6 Ayurvedic tastes for total satiety.',
        stepByStepCookingGuide: [
          'Rinse lentils and grains in cold water until water runs completely clear.',
          'Warm ghee or sesame oil in a pot; bloom cumin, turmeric, and grated ginger until fragrant (45 seconds).',
          'Add soaked lentils and 4 cups of filtered water or mineral bone broth.',
          'Simmer covered on low heat for 30 minutes until velvety and comforting. Garnish with fresh herbs.'
        ],
        predictedGlucoseSpikeMgDl: 12,
        nutrigenomicLigand: 'butyrate',
        primaryOrganTarget: 'Colon'
      });
    } else {
      this.formulatedRecipe.set({
        title: 'Ancestral Hearth Sauté with Prebiotic Alliums & Functional Greens',
        culturalHeritage: 'Traditional Foodshed Whole-Plant Resilience',
        culinaryTradition: 'TCM (食疗)',
        ingredientsUsed: ingredientsText.split(',').map(s => s.trim()),
        missingPantryPillarsRecommended: ['Fresh Ginger Root', 'Raw Fermented Vinegar'],
        biochemicalSynergies: [
          {
            name: 'Keap1-Nrf2 Phase II Detoxification',
            description: 'Allium sulfur compounds and brassicas oxidize Keap1 cysteine residues, releasing Nrf2 to transcribe antioxidant response elements.'
          }
        ],
        sixTastesOrThermalProfile: 'Neutral to Warm thermal quality; gently tonifies Spleen Qi and dispels dampness.',
        stepByStepCookingGuide: [
          'Slice alliums and let sit for 10 minutes to allow alliinase enzyme to maximize allicin synthesis.',
          'Quickly flash-sauté in healthy unrefined fat with sea salt.',
          'Add remaining pantry ingredients, splash with 2 tbsp broth, cover and steam for 3 minutes.'
        ],
        predictedGlucoseSpikeMgDl: 15,
        nutrigenomicLigand: 'sulforaphane',
        primaryOrganTarget: 'Liver'
      });
    }
  }

  /**
   * Hands-free voice speech trigger
   */
  speakText(text: string): void {
    this.lastSpokenTranscript.set(text);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.isParasympatheticPacingActive() ? 0.9 : 1.0; // 0.1 Hz soothing pacing
      utterance.pitch = 1.0;
      utterance.onstart = () => this.isSpeaking.set(true);
      utterance.onend = () => this.isSpeaking.set(false);
      utterance.onerror = () => this.isSpeaking.set(false);
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Answers a kitchen culinary question hands-free
   */
  answerKitchenQuestion(query: string): string {
    const q = query.toLowerCase();
    let answer = '';

    if (q.includes('ginger') || q.includes('cong bai') || q.includes('scallion')) {
      answer = 'For Cong Bai Tang, leave the scallion roots intact after scrubbing them thoroughly with water. The roots contain concentrated allicin and volatile oils that expel Wind-Cold pathogens. Simmer covered for 12 to 15 minutes.';
    } else if (q.includes('turmeric') || q.includes('black pepper') || q.includes('curcumin')) {
      answer = 'Always pair turmeric with a fat like ghee or olive oil, and freshly ground black pepper. The piperine in black pepper inhibits liver enzymes, increasing curcumin bioavailability by 2000 percent.';
    } else if (q.includes('resistant starch') || q.includes('rice') || q.includes('potato') || q.includes('cooling')) {
      answer = 'To maximize resistant starch type 3, cook your whole grains or potatoes and cool them completely in the refrigerator for at least 12 hours. This retrogrades the amylose molecules, cutting your postprandial glucose spike by up to 40 percent and feeding colonic butyrate bacteria.';
    } else if (q.includes('substitute') || q.includes('seed oil') || q.includes('oil')) {
      answer = 'Instead of commercial vegetable or soybean oil, use extra virgin olive oil for low-to-medium heat or raw dressing, and grass-fed ghee, tallow, or coconut oil for higher-heat searing. This eliminates oxidized linoleic acid and cytotoxic aldehydes.';
    } else {
      answer = `To maximize nutrient absorption in your cooking, always cook root vegetables and brassicas gently, pair fat-soluble vitamins with healthy unrefined fats, and enjoy your meal in a calm parasympathetic state.`;
    }

    this.speakText(answer);
    return answer;
  }

  /**
   * Simulates the recipe in 3D Anatomy
   */
  simulateIn3d(): void {
    const recipe = this.formulatedRecipe();
    this.foodshed.simulateIn3dAnatomy(recipe.nutrigenomicLigand, recipe.primaryOrganTarget);
  }
}
