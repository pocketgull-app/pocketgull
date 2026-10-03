import { Injectable } from '@angular/core';

export type DietaryRestrictionType = 
  | 'ALL' 
  | 'GLUTEN_FREE' 
  | 'DAIRY_FREE' 
  | 'VEGAN_PLANT_BASED' 
  | 'LOW_FODMAP' 
  | 'NUT_FREE' 
  | 'KOSHER_HALAL' 
  | 'HISTAMINE_CONSCIOUS'
  | 'CARDIOMETABOLIC_LOW_SODIUM';

export interface IFoodInflationAlternative {
  expensiveOrStockedOutItem: string;
  category: 'Produce' | 'Protein & Legume' | 'Healthy Fats' | 'Grain & Fiber' | 'Antioxidant / Berry';
  costPerServingOriginal: number; // USD
  recommendedFrugalAlternative: string;
  costPerServingAlternative: number; // USD
  estimatedSavingsPct: number;
  phytonutrientEquivalence: string;
  culinaryPreparationTip: string;
  shelfLifeAndPantryResilience: string;
  stockoutResilienceStrategy: 'Frozen Whole-Food' | 'Bulk Dry Legume' | 'Canned BPA-Free' | 'Substitutable Root Vegetable' | 'Community Co-op Bulk Bin';
  suitableDiets: DietaryRestrictionType[];
  allergenFreeFrom: ('Gluten' | 'Dairy' | 'Peanuts' | 'Tree Nuts' | 'Soy' | 'Eggs' | 'Fish' | 'Shellfish')[];
  dietaryPrecautionNote?: string;
}

export interface IInflationStockoutResilienceAudit {
  basketTotalOriginalUsd: number;
  basketTotalFrugalUsd: number;
  totalMonthlyProjectedSavingsUsd: number;
  averageSavingsPct: number;
  activeDietaryRestriction: DietaryRestrictionType;
  substitutions: IFoodInflationAlternative[];
  clinicalFrugalityVerdict: string;
}

@Injectable({
  providedIn: 'root'
})
export class FoodInflationStockoutResilienceService {

  private readonly substitutionCatalog: IFoodInflationAlternative[] = [
    {
      expensiveOrStockedOutItem: 'Fresh Organic Berries (Raspberries / Blackberries / Blueberries)',
      category: 'Antioxidant / Berry',
      costPerServingOriginal: 2.25,
      recommendedFrugalAlternative: 'Flash-Frozen Wild Lowbush Blueberries or Frozen Mixed Berries',
      costPerServingAlternative: 0.65,
      estimatedSavingsPct: 71,
      phytonutrientEquivalence: 'Equal or higher anthocyanin and pterostilbene content (flash-frozen at farm peak halts oxidation); identical microvascular and brain-protective benefits.',
      culinaryPreparationTip: 'Thaw in warm oatmeal, blend into smoothies, or stir frozen directly into plain yogurt/kefir.',
      shelfLifeAndPantryResilience: '12 months frozen (zero spoilage waste vs 3-5 days fresh).',
      stockoutResilienceStrategy: 'Frozen Whole-Food',
      suitableDiets: ['ALL', 'GLUTEN_FREE', 'DAIRY_FREE', 'VEGAN_PLANT_BASED', 'LOW_FODMAP', 'NUT_FREE', 'KOSHER_HALAL', 'CARDIOMETABOLIC_LOW_SODIUM'],
      allergenFreeFrom: ['Gluten', 'Dairy', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'],
      dietaryPrecautionNote: 'Naturally low-FODMAP at 1/2 cup servings. Zero gluten cross-contact.'
    },
    {
      expensiveOrStockedOutItem: 'Fresh Wild Salmon Fillet / Halibut',
      category: 'Protein & Legume',
      costPerServingOriginal: 4.80,
      recommendedFrugalAlternative: 'Canned Wild Sardines in Olive Oil, Mackerel, or Sockeye Salmon',
      costPerServingAlternative: 1.40,
      estimatedSavingsPct: 71,
      phytonutrientEquivalence: 'Higher EPA/DHA marine omega-3s, bioavailable calcium from soft edible bones, and lower trophic-level mercury bioaccumulation.',
      culinaryPreparationTip: 'Mash with lemon juice, Dijon mustard, and chopped celery on toasted sourdough or salad greens.',
      shelfLifeAndPantryResilience: '3-5 years shelf-stable pantry reserve; immune to fresh supply chain disruptions.',
      stockoutResilienceStrategy: 'Canned BPA-Free',
      suitableDiets: ['ALL', 'GLUTEN_FREE', 'DAIRY_FREE', 'LOW_FODMAP', 'NUT_FREE', 'KOSHER_HALAL', 'CARDIOMETABOLIC_LOW_SODIUM'],
      allergenFreeFrom: ['Gluten', 'Dairy', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Shellfish'],
      dietaryPrecautionNote: 'Contains finfish. Not suitable for strictly vegan/vegetarian diets; excellent pescatarian & anti-inflammatory option.'
    },
    {
      expensiveOrStockedOutItem: 'Bagged Organic Baby Spinach / Baby Greens',
      category: 'Produce',
      costPerServingOriginal: 1.50,
      recommendedFrugalAlternative: 'Whole Head Cabbage (Green/Purple) & Hearty Lacinato Kale / Collard Bunches',
      costPerServingAlternative: 0.35,
      estimatedSavingsPct: 77,
      phytonutrientEquivalence: 'Superior sulforaphane, indole-3-carbinol, and anthocyanins (purple cabbage); equivalent lutein and vitamin K1.',
      culinaryPreparationTip: 'Shred cabbage raw into crunchy slaw with apple cider vinegar; quick-sauté kale with garlic.',
      shelfLifeAndPantryResilience: 'Cabbage keeps crisp for 4-6 weeks in the crisper drawer with near-zero rot.',
      stockoutResilienceStrategy: 'Substitutable Root Vegetable',
      suitableDiets: ['ALL', 'GLUTEN_FREE', 'DAIRY_FREE', 'VEGAN_PLANT_BASED', 'LOW_FODMAP', 'NUT_FREE', 'KOSHER_HALAL', 'HISTAMINE_CONSCIOUS', 'CARDIOMETABOLIC_LOW_SODIUM'],
      allergenFreeFrom: ['Gluten', 'Dairy', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'],
      dietaryPrecautionNote: 'Low-histamine and low-oxalate relative to raw spinach; safe for kidney stone stone-formers.'
    },
    {
      expensiveOrStockedOutItem: 'Commercial Almond Butter / Specialty Nut Butter',
      category: 'Healthy Fats',
      costPerServingOriginal: 1.60,
      recommendedFrugalAlternative: 'Organic Sunflower Seed Butter (SunButter) or Bulk Whole Seeds Ground at Home',
      costPerServingAlternative: 0.50,
      estimatedSavingsPct: 69,
      phytonutrientEquivalence: 'High alpha-tocopherol (Vitamin E), magnesium, selenium, and phytosterols without allergen exclusions.',
      culinaryPreparationTip: 'Use 1:1 in dressings, sauces (Thai sunflower dipping sauce), or sliced fruit spread.',
      shelfLifeAndPantryResilience: 'Store in cool pantry; ground seeds keep fresh in mason jar in fridge for 6 months.',
      stockoutResilienceStrategy: 'Community Co-op Bulk Bin',
      suitableDiets: ['ALL', 'GLUTEN_FREE', 'DAIRY_FREE', 'VEGAN_PLANT_BASED', 'LOW_FODMAP', 'NUT_FREE', 'KOSHER_HALAL', 'CARDIOMETABOLIC_LOW_SODIUM'],
      allergenFreeFrom: ['Gluten', 'Dairy', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'],
      dietaryPrecautionNote: '100% Tree nut & Peanut-free facility certified; safe for school and pediatric allergen guidelines.'
    },
    {
      expensiveOrStockedOutItem: 'Imported Hass Avocados (Stockout / Off-Peak Price Hike)',
      category: 'Healthy Fats',
      costPerServingOriginal: 1.75,
      recommendedFrugalAlternative: 'Whole Tahini (Sesame Paste) + Extra Virgin Olive Oil Drizzle',
      costPerServingAlternative: 0.55,
      estimatedSavingsPct: 69,
      phytonutrientEquivalence: 'Sesamin and sesamol lignans with high oleic monounsaturated fatty acids; comparable cardioprotective and bile-stimulating lipid matrix.',
      culinaryPreparationTip: 'Whisk tahini with lemon juice, water, and sea salt to create a luscious creamy dressing.',
      shelfLifeAndPantryResilience: 'Tahini jars remain shelf-stable for 12 months at room temperature.',
      stockoutResilienceStrategy: 'Community Co-op Bulk Bin',
      suitableDiets: ['ALL', 'GLUTEN_FREE', 'DAIRY_FREE', 'VEGAN_PLANT_BASED', 'LOW_FODMAP', 'NUT_FREE', 'KOSHER_HALAL', 'CARDIOMETABOLIC_LOW_SODIUM'],
      allergenFreeFrom: ['Gluten', 'Dairy', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'],
      dietaryPrecautionNote: 'Contains sesame seeds (FDA major food allergen). Check for sesame tolerance before prescribing.'
    },
    {
      expensiveOrStockedOutItem: 'Packaged Plant-Based Meat Alternatives (Beyond / Impossible)',
      category: 'Protein & Legume',
      costPerServingOriginal: 2.80,
      recommendedFrugalAlternative: 'Organic Dry Green/Brown Lentils & Heritage Split Peas',
      costPerServingAlternative: 0.28,
      estimatedSavingsPct: 90,
      phytonutrientEquivalence: 'Zero ultra-processed emulsifiers, zero methylcellulose; 18g intact dietary protein and 15g prebiotic gut fiber per cup.',
      culinaryPreparationTip: 'Cook 25 minutes with cumin, turmeric, and mirepoix for a hearty lentil Bolognese or dal.',
      shelfLifeAndPantryResilience: 'Dry legumes last 2+ years in airtight glass containers with zero refrigeration.',
      stockoutResilienceStrategy: 'Bulk Dry Legume',
      suitableDiets: ['ALL', 'GLUTEN_FREE', 'DAIRY_FREE', 'VEGAN_PLANT_BASED', 'NUT_FREE', 'KOSHER_HALAL', 'CARDIOMETABOLIC_LOW_SODIUM'],
      allergenFreeFrom: ['Gluten', 'Dairy', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'],
      dietaryPrecautionNote: 'Naturally gluten-free. For IBS / Low-FODMAP patients, opt for canned rinsed lentils (lower galacto-oligosaccharides).'
    },
    {
      expensiveOrStockedOutItem: 'Specialty Ancient Grain Medleys / Packaged Quinoa Bowls',
      category: 'Grain & Fiber',
      costPerServingOriginal: 1.90,
      recommendedFrugalAlternative: 'Bulk Whole Hulled Buckwheat (Kasha) or Certified GF Steel-Cut Oats',
      costPerServingAlternative: 0.32,
      estimatedSavingsPct: 83,
      phytonutrientEquivalence: 'High rutin and quercetin bioflavonoids for vascular strength; high beta-glucan soluble fiber for LDL clearance.',
      culinaryPreparationTip: 'Simmer 15 minutes as a savory pilaf with roasted onions or cook as warm morning porridge.',
      shelfLifeAndPantryResilience: 'Store dry in bulk pantry buckets or jars for 18-24 months.',
      stockoutResilienceStrategy: 'Community Co-op Bulk Bin',
      suitableDiets: ['ALL', 'GLUTEN_FREE', 'DAIRY_FREE', 'VEGAN_PLANT_BASED', 'LOW_FODMAP', 'NUT_FREE', 'KOSHER_HALAL', 'HISTAMINE_CONSCIOUS', 'CARDIOMETABOLIC_LOW_SODIUM'],
      allergenFreeFrom: ['Gluten', 'Dairy', 'Peanuts', 'Tree Nuts', 'Soy', 'Eggs', 'Fish', 'Shellfish'],
      dietaryPrecautionNote: 'Buckwheat is a gluten-free fruit seed (Polygonaceae family), despite the name. Safe for celiac disease.'
    }
  ];

  /**
   * Evaluates a shopping basket against regional food inflation,
   * returning evidence-grounded whole-food frugal parity swaps filtered by patient dietary restrictions.
   */
  auditBasketForInflation(selectedItems?: string[], dietaryFilter: DietaryRestrictionType = 'ALL'): IInflationStockoutResilienceAudit {
    let substitutions = this.substitutionCatalog;

    if (dietaryFilter && dietaryFilter !== 'ALL') {
      substitutions = substitutions.filter(item => item.suitableDiets.includes(dietaryFilter));
    }

    if (selectedItems && selectedItems.length > 0) {
      substitutions = substitutions.filter(sub => 
        selectedItems.some(i => sub.expensiveOrStockedOutItem.toLowerCase().includes(i.toLowerCase()))
      );
    }

    const basketTotalOriginal = substitutions.reduce((sum, item) => sum + item.costPerServingOriginal * 30, 0);
    const basketTotalFrugal = substitutions.reduce((sum, item) => sum + item.costPerServingAlternative * 30, 0);
    const monthlySavings = basketTotalOriginal - basketTotalFrugal;
    const averageSavingsPct = basketTotalOriginal > 0 ? Math.round((monthlySavings / basketTotalOriginal) * 100) : 0;

    const restrictionLabel = dietaryFilter !== 'ALL' ? ` tailored for ${dietaryFilter.replace(/_/g, ' ')} compliance` : '';
    const verdict = `Swapping ${substitutions.length} inflation-sensitive staples for bioequivalent whole-food pantry alternatives${restrictionLabel} saves approximately $${monthlySavings.toFixed(0)}/month (${averageSavingsPct}% cost reduction) while honoring all patient dietary boundaries and eliminating ultra-processed additives.`;

    return {
      basketTotalOriginalUsd: Math.round(basketTotalOriginal),
      basketTotalFrugalUsd: Math.round(basketTotalFrugal),
      totalMonthlyProjectedSavingsUsd: Math.round(monthlySavings),
      averageSavingsPct,
      activeDietaryRestriction: dietaryFilter,
      substitutions,
      clinicalFrugalityVerdict: verdict
    };
  }

  /**
   * Returns instant stockout contingency plans for a missing target item
   */
  findContingencyForStockout(targetProduceOrStaple: string): IFoodInflationAlternative | null {
    const query = targetProduceOrStaple.toLowerCase();
    const match = this.substitutionCatalog.find(s => 
      s.expensiveOrStockedOutItem.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
    return match || null;
  }
}
