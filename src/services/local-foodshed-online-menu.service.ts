import { Injectable, signal, computed, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';

export type NutrigenomicLigandType = 'all' | 'sulforaphane' | 'butyrate' | 'resveratrol' | 'omega3_dha' | 'methyl_5mthf';

export interface IShelfItem {
  id: string;
  name: string;
  storeChain: 'Safeway' | 'Kroger / Fred Meyer' | 'Walmart' | 'Trader Joe’s' | 'Aldi' | 'H-Mart (Asian)' | 'Patel Brothers (South Asian)' | 'Local Co-op';
  department: 'Produce' | 'Bulk Legumes & Grains' | 'Refrigerated Ferments' | 'Canned Wild Seafood' | 'Spices & Herbs';
  aisleHint: string;
  costPerServing: number;
  bioactiveTarget: string;
  nutrigenomicLigand: NutrigenomicLigandType;
  primaryOrganTarget: 'Liver' | 'Colon' | 'Brain' | 'Mitochondria' | 'Endothelium';
  snapWicEligible: boolean;
  clinicalMechanism: string;
  frugalTip: string;
}

export interface IFarmToTableCsa {
  id: string;
  farmName: string;
  region: string;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
  signatureCrops: string[];
  regenerativeSoilPolyphenolBoostPct: number; // e.g. 45% more polyphenols in living mycorrhizal soil
  pickupDeliveryOptions: string;
  csaShareCostPerWeek: number;
  snapDoubleUpAccepted: boolean;
  clinicalBenefit: string;
  nutrigenomicLigand: NutrigenomicLigandType;
}

export interface IOnlineGroceryBasketItem {
  name: string;
  quantity: string;
  approxPriceUsd: number;
  bioactive: string;
}

export interface IOnlineGroceryBasket {
  id: string;
  title: string;
  clinicalTheme: string;
  retailer: 'Walmart Grocery' | 'Instacart' | 'Amazon Fresh' | 'Thrive Market';
  items: IOnlineGroceryBasketItem[];
  estimatedSubtotalUsd: number;
  produceRxVoucherEligibleUsd: number; // $40 - $80 monthly PRx voucher credit
  nutrigenomicLigand: NutrigenomicLigandType;
  sanitizedOrderQueryUrl: string; // Zero PHI in query string
  description: string;
}

export interface IRestaurantPreparedDish {
  id: string;
  cuisineCategory: 'Fast-Casual Bowl' | 'Mediterranean' | 'Thai & Vietnamese' | 'Japanese & Sushi' | 'Mexican & Latin' | 'Classic American Diner';
  restaurantOrSource: string;
  dishName: string;
  mealType: 'Lunch' | 'Dinner' | 'Breakfast';
  estimatedGlycemicLoad: 'Low' | 'Moderate' | 'High';
  predictedGlucoseSpikeMgDl: number; // Postprandial 2h rise in mg/dL based on Bergman Minimal Model
  seedOilRisk: 'Zero (Pure EVOO/Ghee/Broth)' | 'Moderate (Canola Blend)' | 'High (Soybean/Corn Fryer Vat)';
  inflammatoryScore: number; // 0 (anti-inflammatory) to 100 (highly inflammatory)
  clinicalModificationScript: string; // Exact words to say to waiter or write in delivery notes
  biophysicalMechanism: string;
  nutrigenomicLigand: NutrigenomicLigandType;
  primaryOrganTarget: 'Liver' | 'Colon' | 'Brain' | 'Mitochondria' | 'Endothelium';
}

export interface IAncestralParadigmRecipe {
  id: string;
  paradigm: 'TCM (食疗)' | 'Ayurveda (Āhāra)' | 'Indigenous / Three Sisters' | 'Unani-Tibb & Hippocratic' | 'Cucina Povera & Blue Zones';
  title: string;
  subtitle: string;
  culturalHeritage: string;
  stormResilienceMechanism: string; // How this recipe weathers economic, health, and supply chain storms
  thermalQualityOrDosha: string;
  activePhytonutrients: string[];
  pantryResiliencePillars: string[];
  culinaryInstructions: string;
  clinicalBiophysics: string;
  nutrigenomicLigand: NutrigenomicLigandType;
  primaryOrganTarget: 'Liver' | 'Colon' | 'Brain' | 'Mitochondria' | 'Endothelium';
}

@Injectable({
  providedIn: 'root'
})
export class LocalFoodshedOnlineMenuService {
  private readonly patientState = inject(PatientStateService);

  readonly activeViewTab = signal<'shelves' | 'farm_csa' | 'online_delivery' | 'restaurant_auditor' | 'ancestral_kitchen'>('shelves');
  readonly selectedStoreFilter = signal<string>('ALL');
  readonly selectedSeasonFilter = signal<'Spring' | 'Summer' | 'Autumn' | 'Winter'>('Autumn');
  readonly selectedCuisineFilter = signal<string>('ALL');
  readonly selectedParadigmFilter = signal<string>('ALL');

  /**
   * Local Grocery Shelf Inventory (Aisle-by-Aisle)
   */
  readonly shelfInventory: IShelfItem[] = [
    {
      id: 'shelf-cabbage-purple',
      name: 'Whole Purple Cabbage',
      storeChain: 'Trader Joe’s',
      department: 'Produce',
      aisleHint: 'Main Produce Island (Bottom Crates)',
      costPerServing: 0.28,
      bioactiveTarget: 'Glucoraphanin & Anthocyanins',
      nutrigenomicLigand: 'sulforaphane',
      primaryOrganTarget: 'Liver',
      snapWicEligible: true,
      clinicalMechanism: 'Sulforaphane precursor induces phase II GST enzymes via Keap1 cysteine modification; anthocyanins quench microvascular ROS.',
      frugalTip: 'Keeps crisp in the crisper drawer for 6+ weeks. Shred raw into crunchy slaw with apple cider vinegar.'
    },
    {
      id: 'shelf-sardines-olive-oil',
      name: 'Wild Portuguese Sardines in Extra Virgin Olive Oil',
      storeChain: 'Trader Joe’s',
      department: 'Canned Wild Seafood',
      aisleHint: 'Aisle 3 (Tinned Seafood & Conserves)',
      costPerServing: 1.49,
      bioactiveTarget: 'EPA/DHA Marine Omega-3s & Bioavailable Calcium',
      nutrigenomicLigand: 'omega3_dha',
      primaryOrganTarget: 'Brain',
      snapWicEligible: true,
      clinicalMechanism: 'Enriches neuronal plasma membranes with DHA; biosynthesizes Resolvin E1/D1 to resolve systemic neuroinflammation.',
      frugalTip: '3-5 year shelf life; edible bones deliver 350mg elemental calcium without requiring dairy or refrigeration.'
    },
    {
      id: 'shelf-steel-cut-oats',
      name: 'Organic Whole Grain Steel-Cut Groats',
      storeChain: 'Aldi',
      department: 'Bulk Legumes & Grains',
      aisleHint: 'Aisle 2 (Baking & Breakfast Grains)',
      costPerServing: 0.22,
      bioactiveTarget: 'Beta-Glucan & Resistant Starch Type 3',
      nutrigenomicLigand: 'butyrate',
      primaryOrganTarget: 'Colon',
      snapWicEligible: true,
      clinicalMechanism: 'Bacterial fermentation yields butyrate, inhibiting colonocyte HDAC enzymes and enforcing tight-junction claudin-1 assembly.',
      frugalTip: 'Cook in batch and refrigerate overnight: cooling retrogrades amylose into resistant starch, slashing postprandial glucose spike by 40%.'
    },
    {
      id: 'shelf-daikon-radish',
      name: 'Organic Daikon Radish & Bitter Melon',
      storeChain: 'H-Mart (Asian)',
      department: 'Produce',
      aisleHint: 'East Aisle Produce (Root & Bitter Vegetable Bins)',
      costPerServing: 0.45,
      bioactiveTarget: 'Myrosinase, Sinigrin & Charantin',
      nutrigenomicLigand: 'sulforaphane',
      primaryOrganTarget: 'Liver',
      snapWicEligible: true,
      clinicalMechanism: 'Natural plant myrosinase unlocks maximum sulforaphane conversion from cooked brassicas; charantin mimics insulin receptor phosphorylation.',
      frugalTip: 'Grate raw into dipping sauces or quick-pickle in rice vinegar and ginger for instant probiotic digestion.'
    },
    {
      id: 'shelf-whole-lentils-dal',
      name: 'Whole Brown Sabut Masoor Dal & Chana Dal',
      storeChain: 'Patel Brothers (South Asian)',
      department: 'Bulk Legumes & Grains',
      aisleHint: 'Lentils & Pulses Main Aisle',
      costPerServing: 0.18,
      bioactiveTarget: 'Polyphenol Prebiotics, Folate & Resistant Starch',
      nutrigenomicLigand: 'methyl_5mthf',
      primaryOrganTarget: 'Colon',
      snapWicEligible: true,
      clinicalMechanism: 'High natural L-5-methyltetrahydrofolate supplies 1-carbon homocysteine remethylation; slow-digesting oligosaccharides fuel Akkermansia muciniphila.',
      frugalTip: 'Soak with a pinch of cumin and ginger overnight to eliminate gas-producing alpha-galactosides before cooking.'
    },
    {
      id: 'shelf-frozen-wild-blueberries',
      name: 'Flash-Frozen Wild Lowbush Blueberries',
      storeChain: 'Kroger / Fred Meyer',
      department: 'Produce',
      aisleHint: 'Freezer Case 4 (Frozen Organic Fruit)',
      costPerServing: 0.65,
      bioactiveTarget: 'Pterostilbene, Malvidin & Quercetin',
      nutrigenomicLigand: 'resveratrol',
      primaryOrganTarget: 'Mitochondria',
      snapWicEligible: true,
      clinicalMechanism: 'Pterostilbene crosses the blood-brain barrier with 4x higher bioavailability than resveratrol, activating SIRT1 and hippocampal BDNF.',
      frugalTip: '70% cheaper than fresh out-of-season berries with zero mold spoilage waste and higher intact polyphenol counts.'
    },
    {
      id: 'shelf-bulk-chia-seeds',
      name: 'Raw Black Chia & Flaxseed Bulk Tub',
      storeChain: 'Local Co-op',
      department: 'Bulk Legumes & Grains',
      aisleHint: 'Gravity Bin 14 (Seeds & Superfoods)',
      costPerServing: 0.32,
      bioactiveTarget: 'Soluble Mucilage Fiber & Alpha-Linolenic Acid (ALA)',
      nutrigenomicLigand: 'omega3_dha',
      primaryOrganTarget: 'Endothelium',
      snapWicEligible: true,
      clinicalMechanism: 'Forms an intra-luminal viscous hydrogel that slows carbohydrate enzymatic cleavage, blunting postprandial glucose excursions.',
      frugalTip: 'Stir 2 tbsp into warm water with lemon for an ancestral gel that replaces eggs in baking and creates instant satiety.'
    },
    {
      id: 'shelf-wild-salmon-canned',
      name: 'Wild Alaskan Sockeye Salmon (Skin & Bones)',
      storeChain: 'Safeway',
      department: 'Canned Wild Seafood',
      aisleHint: 'Aisle 6 (Canned Fish & Meat)',
      costPerServing: 1.85,
      bioactiveTarget: 'Astaxanthin & EPA/DHA Marine Lipids',
      nutrigenomicLigand: 'omega3_dha',
      primaryOrganTarget: 'Brain',
      snapWicEligible: true,
      clinicalMechanism: 'Astaxanthin crosses mitochondrial membranes, extinguishing lipid peroxidation during high metabolic demand.',
      frugalTip: 'Mash with Dijon mustard, capers, and celery for high-protein lunch salads at 1/3 the price of fresh fillets.'
    }
  ];

  /**
   * Regional Farm-to-Table & Community Supported Agriculture (CSA) Directory
   */
  readonly farmCsaDirectory: IFarmToTableCsa[] = [
    {
      id: 'csa-puget-sound',
      farmName: 'Sound Bio-Dynamic Organics & Heirloom Orchard',
      region: 'Pacific Northwest (Puget Sound & Skagit Valley)',
      season: 'Autumn',
      signatureCrops: ['Lacinato Dino Kale', 'Romanesco Cauliflower', 'Heirloom Honeycrisp Apples', 'Delicata Squash'],
      regenerativeSoilPolyphenolBoostPct: 54,
      pickupDeliveryOptions: 'Weekly doorstep insulated tote or Community Hub pickup',
      csaShareCostPerWeek: 28.00,
      snapDoubleUpAccepted: true,
      clinicalBenefit: 'Living mycorrhizal soil ecology stimulates secondary plant defense metabolites, yielding +54% higher glucosinolates and quercetin.',
      nutrigenomicLigand: 'sulforaphane'
    },
    {
      id: 'csa-ojai-regenerative',
      farmName: 'Valley Sun Agroecological Farm & Olive Mill',
      region: 'Central Coast & Ojai Valley, CA',
      season: 'Autumn',
      signatureCrops: ['First-Press High-Polyphenol EVOO', 'Mission Figs', 'Pixie Tangerines', 'Fuyu Persimmons'],
      regenerativeSoilPolyphenolBoostPct: 62,
      pickupDeliveryOptions: 'Bi-weekly cold-pack direct shipping across West Coast',
      csaShareCostPerWeek: 35.00,
      snapDoubleUpAccepted: false,
      clinicalBenefit: 'Unfiltered, early-harvest olive oil boasts >650 mg/kg oleocanthal, functioning as a non-steroidal natural COX-1/2 inhibitory anti-inflammatory.',
      nutrigenomicLigand: 'resveratrol'
    },
    {
      id: 'csa-hudson-valley',
      farmName: 'Hudson Living Soil Collective & Mushroom Woods',
      region: 'Northeast & Hudson Valley, NY',
      season: 'Autumn',
      signatureCrops: ['Shiitake & Maitake Clusters', 'Rutabagas', 'Rainbow Swiss Chard', 'Black Radish'],
      regenerativeSoilPolyphenolBoostPct: 48,
      pickupDeliveryOptions: 'Metro Farm Share Drop-off or Farmers Market Stall',
      csaShareCostPerWeek: 30.00,
      snapDoubleUpAccepted: true,
      clinicalBenefit: 'Log-grown medicinal fungi provide concentrated beta-1,3/1,6-glucans that modulate gut mucosal dectin-1 immune signaling.',
      nutrigenomicLigand: 'butyrate'
    },
    {
      id: 'csa-driftless-midwest',
      farmName: 'Driftless Heritage Roots & Ancient Grains',
      region: 'Midwest Driftless Region (WI/MN/IA)',
      season: 'Winter',
      signatureCrops: ['Stone-Ground Heritage Rye', 'Storage Beets', 'Purple Daikon', 'Cipollini Onions'],
      regenerativeSoilPolyphenolBoostPct: 39,
      pickupDeliveryOptions: 'Winter Cellar Box with bi-weekly farm delivery',
      csaShareCostPerWeek: 24.50,
      snapDoubleUpAccepted: true,
      clinicalBenefit: 'Cellared root crops concentrate non-protein sulfhydryl compounds and inorganic nitrates that convert to vasodilatory nitric oxide in saliva.',
      nutrigenomicLigand: 'methyl_5mthf'
    }
  ];

  /**
   * 1-Click Online Delivery Grocery Baskets (HIPAA Safe Harbor Sanitized)
   */
  readonly onlineBaskets: IOnlineGroceryBasket[] = [
    {
      id: 'basket-mind-neuro',
      title: 'MIND Neuro-Longevity & Cognitive Shield Basket',
      clinicalTheme: 'Cognitive Decline Mitigation, BBB Tight Junctions & Glymphatic Clearance',
      retailer: 'Walmart Grocery',
      estimatedSubtotalUsd: 34.80,
      produceRxVoucherEligibleUsd: 20.00,
      nutrigenomicLigand: 'omega3_dha',
      sanitizedOrderQueryUrl: 'https://www.walmart.com/search?q=wild+blueberries+walnuts+spinach+extra+virgin+olive+oil+sardines',
      description: 'Contains flash-frozen wild blueberries, raw English walnut halves, organic baby spinach, Spanish EVOO, and canned wild sockeye salmon. Zero clinical identifiers in egress links.',
      items: [
        { name: 'Frozen Wild Blueberries (32 oz)', quantity: '1 bag', approxPriceUsd: 7.98, bioactive: 'Anthocyanins & Pterostilbene' },
        { name: 'Raw Walnut Halves (16 oz)', quantity: '1 bag', approxPriceUsd: 5.48, bioactive: 'Alpha-Linolenic Acid (ALA) & Polyphenols' },
        { name: 'Organic Fresh Spinach (16 oz clam)', quantity: '1 tub', approxPriceUsd: 4.96, bioactive: 'Lutein & Folate' },
        { name: 'Cold-Pressed Extra Virgin Olive Oil (16.9 oz)', quantity: '1 bottle', approxPriceUsd: 8.98, bioactive: 'Oleocanthal & Oleic Acid' },
        { name: 'Wild Alaskan Sockeye Salmon (14.75 oz)', quantity: '1 can', approxPriceUsd: 7.40, bioactive: 'Marine EPA/DHA & Astaxanthin' }
      ]
    },
    {
      id: 'basket-microbiome-scfa',
      title: 'Microbiome SCFA & Butyrate Fermentation Basket',
      clinicalTheme: 'Histone Deacetylase (HDAC) Inhibition & Colonic Mucosal Repair',
      retailer: 'Instacart',
      estimatedSubtotalUsd: 28.50,
      produceRxVoucherEligibleUsd: 15.00,
      nutrigenomicLigand: 'butyrate',
      sanitizedOrderQueryUrl: 'https://www.instacart.com/store/search?search_term=leeks+artichoke+steel+cut+oats+sauerkraut+chia',
      description: 'Features high-FOS prebiotic alliums, Jerusalem artichokes/sunchokes, steel-cut oats, raw unpasteurized sauerkraut, and chia seeds to maximize butyrate synthesis.',
      items: [
        { name: 'Organic Leeks & Scallions', quantity: '2 bunches', approxPriceUsd: 4.50, bioactive: 'Inulin & Fructooligosaccharides (FOS)' },
        { name: 'Jerusalem Artichokes (Sunchokes 1 lb)', quantity: '1 lb', approxPriceUsd: 5.20, bioactive: 'High-Density Inulin Prebiotic' },
        { name: 'Steel Cut Whole Grain Oats (24 oz)', quantity: '1 tub', approxPriceUsd: 4.80, bioactive: 'Beta-Glucan Soluble Fiber' },
        { name: 'Wild Fermented Raw Sauerkraut (16 oz)', quantity: '1 jar', approxPriceUsd: 7.50, bioactive: 'Live Lactobacillus & L-Glutamine' },
        { name: 'Organic Chia Seeds (16 oz)', quantity: '1 bag', approxPriceUsd: 6.50, bioactive: 'Mucilaginous Gel Fiber' }
      ]
    },
    {
      id: 'basket-cardiometabolic-no',
      title: 'Cardiometabolic Endothelial Nitric Oxide Basket',
      clinicalTheme: 'eNOS Activation, Blood Pressure Autoregulation & Arterial Compliance',
      retailer: 'Amazon Fresh',
      estimatedSubtotalUsd: 31.20,
      produceRxVoucherEligibleUsd: 18.00,
      nutrigenomicLigand: 'sulforaphane',
      sanitizedOrderQueryUrl: 'https://www.amazon.com/s?k=organic+arugula+fresh+beets+garlic+avocado+hibiscus+tea',
      description: 'Concentrates dietary inorganic nitrates, raw allicin, potassium-rich Hass avocados, and anthocyanin hibiscus tea for vascular tone.',
      items: [
        { name: 'Organic Wild Baby Arugula (5 oz)', quantity: '2 clams', approxPriceUsd: 6.00, bioactive: 'Dietary Nitrate (NO3-) & Quercetin' },
        { name: 'Fresh Organic Red Beets with Greens', quantity: '1 bunch', approxPriceUsd: 3.99, bioactive: 'Betalains & Nitrate Matrix' },
        { name: 'Organic Garlic Bulbs (3-pack)', quantity: '1 pack', approxPriceUsd: 2.50, bioactive: 'Allicin & S-Allylcysteine' },
        { name: 'Hass Avocados (4 count)', quantity: '1 bag', approxPriceUsd: 4.99, bioactive: 'Potassium & Monounsaturated Oleic Acid' },
        { name: 'Pure Hibiscus Flowers Tea (Loose 16 oz)', quantity: '1 bag', approxPriceUsd: 13.72, bioactive: 'ACE-Inhibitory Delphinidin' }
      ]
    }
  ];

  /**
   * Online Restaurant & Prepared Menu Auditor (Delivery Apps & Dining Out)
   */
  readonly restaurantDishes: IRestaurantPreparedDish[] = [
    {
      id: 'dish-sweetgreen-harvest',
      cuisineCategory: 'Fast-Casual Bowl',
      restaurantOrSource: 'Sweetgreen / Fast-Casual Grain Bowls',
      dishName: 'Warm Harvest Bowl (Roasted Sweet Potato, Kale, Roasted Chicken, Apples)',
      mealType: 'Lunch',
      estimatedGlycemicLoad: 'Moderate',
      predictedGlucoseSpikeMgDl: 28,
      seedOilRisk: 'Moderate (Canola Blend)',
      inflammatoryScore: 35,
      clinicalModificationScript: 'Request balsamic vinaigrette dressing on the side made with olive oil, or ask for freshly squeezed lemon juice + plain extra virgin olive oil.',
      biophysicalMechanism: 'Slow-digesting amylose in sweet potato and prebiotic polyphenols in unpeeled apples stabilize gastric emptying.',
      nutrigenomicLigand: 'butyrate',
      primaryOrganTarget: 'Colon'
    },
    {
      id: 'dish-mediterranean-souvlaki',
      cuisineCategory: 'Mediterranean',
      restaurantOrSource: 'Local Mediterranean / Greek Grill',
      dishName: 'Wild Salmon Souvlaki Plate with Greek Village Salad (Horiatiki) & Wild Greens',
      mealType: 'Dinner',
      estimatedGlycemicLoad: 'Low',
      predictedGlucoseSpikeMgDl: 12,
      seedOilRisk: 'Zero (Pure EVOO/Ghee/Broth)',
      inflammatoryScore: 5,
      clinicalModificationScript: 'Ask for grilled salmon with extra fresh lemon and EVOO; swap white pita bread for double wild boiled greens (chorta) or roasted cabbage.',
      biophysicalMechanism: 'Marine EPA/DHA combined with Greek olive oil polyphenols inhibits NF-kB nuclear translocation in endothelial cells.',
      nutrigenomicLigand: 'omega3_dha',
      primaryOrganTarget: 'Brain'
    },
    {
      id: 'dish-thai-tom-yum',
      cuisineCategory: 'Thai & Vietnamese',
      restaurantOrSource: 'Local Thai Kitchen / Street Food',
      dishName: 'Clear Broth Tom Yum Goong with Galangal, Lemongrass, Kaffir Lime & King Oyster Mushrooms',
      mealType: 'Dinner',
      estimatedGlycemicLoad: 'Low',
      predictedGlucoseSpikeMgDl: 8,
      seedOilRisk: 'Zero (Pure EVOO/Ghee/Broth)',
      inflammatoryScore: 8,
      clinicalModificationScript: 'Order "clear broth" (Nam Sai) without added evaporated milk or sweet chili paste (Nam Prik Pao); request no added cane sugar.',
      biophysicalMechanism: 'Galangal (1’-acetoxychavicol acetate) and lemongrass citral downregulate inducible nitric oxide synthase (iNOS) and COX-2.',
      nutrigenomicLigand: 'resveratrol',
      primaryOrganTarget: 'Liver'
    },
    {
      id: 'dish-vietnamese-pho-ga',
      cuisineCategory: 'Thai & Vietnamese',
      restaurantOrSource: 'Vietnamese Pho House',
      dishName: 'Traditional Pho Ga (Free-Range Chicken Bone Broth, Star Anise, Cinnamon, Fresh Herbs)',
      mealType: 'Dinner',
      estimatedGlycemicLoad: 'Moderate',
      predictedGlucoseSpikeMgDl: 24,
      seedOilRisk: 'Zero (Pure EVOO/Ghee/Broth)',
      inflammatoryScore: 12,
      clinicalModificationScript: 'Request extra bean sprouts and Thai basil to substitute for half the rice noodles; skip the hoisin sauce (pure sugar/starch) and use fresh bird’s eye chili with lime.',
      biophysicalMechanism: 'Slow-simmered bone broth provides gelatin and glycine, buffering methionine intake and restoring small intestinal mucosal integrity.',
      nutrigenomicLigand: 'methyl_5mthf',
      primaryOrganTarget: 'Colon'
    },
    {
      id: 'dish-japanese-chirashi',
      cuisineCategory: 'Japanese & Sushi',
      restaurantOrSource: 'Japanese Sushi Kitchen',
      dishName: 'Chirashi Don / Sashimi Platter with Real Wasabi, Wakame Seaweed & Miso Soup',
      mealType: 'Dinner',
      estimatedGlycemicLoad: 'Low',
      predictedGlucoseSpikeMgDl: 15,
      seedOilRisk: 'Zero (Pure EVOO/Ghee/Broth)',
      inflammatoryScore: 6,
      clinicalModificationScript: 'Ask for brown rice or a salad base; ensure wasabi is real grated horseradish/wasabia japonica rather than food-colored mustard paste.',
      biophysicalMechanism: 'Brown seaweed wakame provides fucoxanthin, stimulating UCP1 uncoupling in brown adipose tissue for metabolic thermogenesis.',
      nutrigenomicLigand: 'omega3_dha',
      primaryOrganTarget: 'Mitochondria'
    },
    {
      id: 'dish-classic-diner-breakfast',
      cuisineCategory: 'Classic American Diner',
      restaurantOrSource: 'Neighborhood Corner Diner',
      dishName: 'Two Over-Easy Pasture Eggs with Sautéed Spinach, Avocado & Sourdough Toast',
      mealType: 'Breakfast',
      estimatedGlycemicLoad: 'Low',
      predictedGlucoseSpikeMgDl: 14,
      seedOilRisk: 'High (Soybean/Corn Fryer Vat)',
      inflammatoryScore: 42,
      clinicalModificationScript: 'CRITICAL: Explicitly ask the cook: "Please cook eggs in real butter or olive oil, not on the soybean grill oil or fryer grease." Swap deep-fried hash browns for sliced fresh tomato or avocado.',
      biophysicalMechanism: 'Pastured egg yolks deliver bioavailable lutein, zeaxanthin, and phosphatidylcholine for acetylcholine neurotransmitter synthesis.',
      nutrigenomicLigand: 'methyl_5mthf',
      primaryOrganTarget: 'Brain'
    }
  ];

  /**
   * Ancestral Paradigm Recipe Sanctuary:
   * How Family Recipes & Ancient Culinary Paradigms Weather the Storm
   */
  readonly ancestralRecipes: IAncestralParadigmRecipe[] = [
    {
      id: 'anc-tcm-cong-bai-tang',
      paradigm: 'TCM (食疗)',
      title: 'Scallion White & Fresh Ginger Emergency Broth (葱白生姜汤 - Cōng Bái Tāng)',
      subtitle: 'The 3-Ingredient Exterior Wind-Cold & Spleen Yang Weather-the-Storm Rescue',
      culturalHeritage: 'Han Dynasty Treatise on Febrile Diseases (Shanghan Lun by Zhang Zhongjing, 220 CE)',
      stormResilienceMechanism: 'Costs < $1.00/pot; relies entirely on durable alliums and ginger that store without spoiling; rapidly warms Spleen Yang and induces diaphoresis to expel acute respiratory and metabolic chills.',
      thermalQualityOrDosha: 'Hot & Acrid (辛温) — Enters Lung and Stomach Meridians',
      activePhytonutrients: ['Gingerols & Shogaols', 'Allicin', 'Quercetin Glycosides', 'Sinigrin'],
      pantryResiliencePillars: ['5-6 whole scallion whites (roots intact)', '2 inches sliced fresh unpeeled ginger', 'Fermented black beans or pinch of unrefined brown sugar'],
      culinaryInstructions: 'Simmer scallion whites (with roots scrubbed clean) and smashed ginger in 3 cups filtered water for 12-15 minutes covered. Drink steaming hot under a warm blanket to induce mild sweat (diaphoresis).',
      clinicalBiophysics: 'Gingerols activate TRPV1 receptors on sensory nerves, promoting peripheral vasodilation and downregulating NF-kB; allium sulfur compounds inhibit viral replication.',
      nutrigenomicLigand: 'sulforaphane',
      primaryOrganTarget: 'Liver'
    },
    {
      id: 'anc-ayurveda-kitchari',
      paradigm: 'Ayurveda (Āhāra)',
      title: 'Tridoshic Golden Moong Dal Kitchari (खिचड़ी)',
      subtitle: 'Rekindling Agni (Digestive Fire) & Dissolving Cellular Ama (Toxic Byproducts)',
      culturalHeritage: 'Charaka Samhita & Sushruta Samhita Classical Ayurvedic Ayurvedic Formularies (1000 BCE)',
      stormResilienceMechanism: 'Uses shelf-stable split yellow moong dal and rice ($0.40/serving); requires no refrigeration; provides complete protein without generating intestinal gas or metabolic endotoxemia.',
      thermalQualityOrDosha: 'Tridoshic (Balances Vata, Pitta, and Kapha) — Rekindles Jatharagni',
      activePhytonutrients: ['Curcumin (with Piperine)', 'Thymol & Cuminum Cyminum', 'Coriandrol', 'Resistant Starch'],
      pantryResiliencePillars: ['Split yellow moong dal (easy to assimilate)', 'Aged basmati or whole grain red rice', 'A2 Ghee or cold-pressed sesame oil', 'Trikatu / Cumin-Coriander-Fennel (CCF) spice blend'],
      culinaryInstructions: 'Rinse dal and rice until water runs clear. In a heavy pot, warm 1 tbsp ghee, sizzle cumin seeds, grated ginger, mustard seeds, and turmeric. Add soaked dal, rice, and 4x water. Simmer 35 minutes until creamy porridge consistency. Garnish with fresh cilantro and lime.',
      clinicalBiophysics: 'Ghee delivers short-chain butyric acid directly to enterocytes; black pepper piperine increases curcumin bioavailability by 2000%; gentle moong proteins require minimal pancreatic elastase.',
      nutrigenomicLigand: 'butyrate',
      primaryOrganTarget: 'Colon'
    },
    {
      id: 'anc-indigenous-three-sisters',
      paradigm: 'Indigenous / Three Sisters',
      title: 'Haudenosaunee Three Sisters Succotash & Roasted Squash Stew',
      subtitle: 'Regenerative Companion Ecology, Complete Amino Acids & Flat Postprandial Glucose',
      culturalHeritage: 'Iroquois / Haudenosaunee and Wampanoag Agricultural Ecology (Pre-Columbian)',
      stormResilienceMechanism: 'Polyculture cropping produces 3x calories per acre with zero synthetic nitrogen fertilizer; dried flint corn, climbing beans, and winter squash store safely for years in family root cellars.',
      thermalQualityOrDosha: 'Harmonizing & Grounding Earth Element — Sustained Glycemic Baseline',
      activePhytonutrients: ['Beta-Carotene (Squash)', 'Anthocyanins (Flint Corn)', 'Phaseolin & Fiber (Beans)', 'Lutein'],
      pantryResiliencePillars: ['Heirloom flint corn (nixtamalized in wood ash)', 'Dry climbing beans (cranberry/black beans)', 'Winter squash (Hubbard/Kabocha/Delicata)', 'Wild dried sage & sunflower seeds'],
      culinaryInstructions: 'Soak dried beans overnight. Sauté diced squash and onion in sunflower oil. Add cooked beans, nixtamalized corn, vegetable broth, and crushed dried sage. Simmer 40 minutes until velvety and fragrant.',
      clinicalBiophysics: 'Corn provides methionine and cysteine; beans provide lysine and tryptophan (100% complete protein). High viscous fiber and resistant starch flatten insulin response to near-zero.',
      nutrigenomicLigand: 'methyl_5mthf',
      primaryOrganTarget: 'Endothelium'
    },
    {
      id: 'anc-hippocratic-oxymel',
      paradigm: 'Unani-Tibb & Hippocratic',
      title: 'Hippocratic Wild Garden Oxymel (ὀξύμελι)',
      subtitle: 'The 2,400-Year-Old Acid-Honey Elixir for Phlegm Clearance & Vascular Elasticity',
      culturalHeritage: 'Hippocratic Corpus (De Morbis Acutis, 400 BCE) & Avicenna’s Canon of Medicine (1025 CE)',
      stormResilienceMechanism: 'Infinitely shelf-stable at room temperature without preservatives; acts as natural medicine chest; transforms invasive backyard herbs (thyme, rosemary, garlic) into potent clinical tonics.',
      thermalQualityOrDosha: 'Balanced Hot/Dry & Cold/Moist — Resolves Viscous Phlegm (Balgham)',
      activePhytonutrients: ['Rosmarinic Acid', 'Thymol & Carvacrol', 'Acetic Acid', 'Defensin-1 (Raw Honey)'],
      pantryResiliencePillars: ['1 part raw unfiltered apple cider vinegar (with "mother")', '2 parts raw local wildflower honey', 'Handful bruised fresh garden thyme, rosemary, sage, or crushed garlic'],
      culinaryInstructions: 'Combine raw apple cider vinegar and raw honey in a clean mason jar. Pack with bruised herbs and garlic. Seal with parchment paper under lid. Steep in dark pantry for 2 to 4 weeks, shaking daily. Strain. Take 1 tbsp in warm water as daily tonic.',
      clinicalBiophysics: 'Acetic acid activates AMP-activated protein kinase (AMPK), reducing hepatic gluconeogenesis and clearing vascular calcium deposits; rosmarinic acid scavenges peroxynitrite.',
      nutrigenomicLigand: 'resveratrol',
      primaryOrganTarget: 'Mitochondria'
    },
    {
      id: 'anc-cucina-povera-ribollita',
      paradigm: 'Cucina Povera & Blue Zones',
      title: 'Tuscan "Cucina Povera" Cavolo Nero Ribollita with Cannellini Beans',
      subtitle: 'The Peasant Kitchen Alchemy of Stale Sourdough, Wild Greens & Sirtuin Activation',
      culturalHeritage: 'Tuscan & Sardinian Blue Zone Ancestral Kitchen Traditions',
      stormResilienceMechanism: 'Born from extreme economic depression; rescues rock-hard stale sourdough and inexpensive cannellini beans; transforms zero-cost garden scraps into the diet of centenarians.',
      thermalQualityOrDosha: 'Nourishing & Harmonizing — Spleen and Kidney Essence Restorer',
      activePhytonutrients: ['Oleocanthal (EVOO)', 'Lutein & Sulforaphane (Cavolo Nero)', 'Apigenin', 'Prebiotic Galactans'],
      pantryResiliencePillars: ['Dry cannellini beans', 'Bunch of Tuscan black kale (Cavolo Nero) & green cabbage', 'Stale crusty whole-grain sourdough bread', 'Generous finishing pour of peppery raw EVOO'],
      culinaryInstructions: 'Cook cannellini beans with garlic and sage. Sauté onions, carrots, and celery in olive oil. Add chopped kale, cabbage, peeled tomatoes, and bean broth. Simmer 1 hour. Layer stale sourdough chunks into pot, reheat the next day ("ri-bollita" = re-boiled). Drown with raw green olive oil before serving.',
      clinicalBiophysics: 'Slow sourdough re-boiling releases prebiotic arabinoxylans; cold-pressed finishing olive oil delivers intact oleocanthal, directly inhibiting microglial neuroinflammation.',
      nutrigenomicLigand: 'sulforaphane',
      primaryOrganTarget: 'Liver'
    }
  ];

  /**
   * Filtered lists
   */
  readonly filteredShelfItems = computed(() => {
    const store = this.selectedStoreFilter();
    if (store === 'ALL') return this.shelfInventory;
    return this.shelfInventory.filter(item => item.storeChain === store);
  });

  readonly filteredFarmCsa = computed(() => {
    const season = this.selectedSeasonFilter();
    return this.farmCsaDirectory.filter(csa => csa.season === season);
  });

  readonly filteredRestaurantDishes = computed(() => {
    const cuisine = this.selectedCuisineFilter();
    if (cuisine === 'ALL') return this.restaurantDishes;
    return this.restaurantDishes.filter(d => d.cuisineCategory === cuisine);
  });

  readonly filteredAncestralRecipes = computed(() => {
    const paradigm = this.selectedParadigmFilter();
    if (paradigm === 'ALL') return this.ancestralRecipes;
    return this.ancestralRecipes.filter(r => r.paradigm === paradigm);
  });

  /**
   * Triggers the 3D Whole-Body & Nutrigenomic Chromatin Simulator
   */
  simulateIn3dAnatomy(ligand: NutrigenomicLigandType, organTarget: 'Liver' | 'Colon' | 'Brain' | 'Mitochondria' | 'Endothelium' = 'Liver'): void {
    // 1. Update patient state nutrigenomic ligand
    if (typeof this.patientState?.selectedNutrigenomicLigand?.set === 'function') {
      this.patientState.selectedNutrigenomicLigand.set(ligand);
    }

    // 2. Switch anatomy view mode to nutrigenomics
    if (typeof this.patientState?.anatomyViewMode?.set === 'function') {
      this.patientState.anatomyViewMode.set('nutrigenomics');
    }

    // 3. Log clinical feedback banner
    const ligandNames: Record<NutrigenomicLigandType, string> = {
      all: 'All Multimodal Pathways',
      sulforaphane: 'Sulforaphane (Keap1-Nrf2-ARE Phase II Detox)',
      butyrate: 'Microbial Butyrate (Histone Deacetylase HDAC Inhibition)',
      resveratrol: 'Resveratrol / Polyphenols (SIRT1 / PGC-1α Biogenesis)',
      omega3_dha: 'Marine Omega-3 EPA/DHA (Resolvin Biosynthesis)',
      methyl_5mthf: 'L-5-MTHF (1-Carbon Homocysteine Remethylation)'
    };

    console.info(`[PocketGull 3D Simulation] Activated nutrigenomic ligand: ${ligandNames[ligand]} targeting ${organTarget}.`);
  }
}
