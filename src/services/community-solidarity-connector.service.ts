import { Injectable, signal, computed } from '@angular/core';

export interface IFaithSolidarityHub {
  id: string;
  name: string;
  traditionCategory: 'SIKH_GURDWARA_LANGAR' | 'JEWISH_BIKUR_CHOLIM' | 'ISLAMIC_ZAKAT_FOOD' | 'ADVENTIST_VEG_PANTRY' | 'CATHOLIC_ST_VINCENT' | 'BUDDHIST_COMPASSION_MEALS' | 'LDS_BISHOPS_STOREHOUSE' | 'COMMUNITY_MUTUAL_AID';
  address: string;
  distanceMiles: number;
  phone: string;
  operatingHours: string;
  offerings: string[];
  dietaryCertification: string;
  costPolicy: string; // e.g. "100% Free / Open to All Humanity"
  culturalEtiquetteTips: string[];
  volunteerDeliverySupport: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CommunitySolidarityConnectorService {
  private readonly solidarityHubsDatabase: IFaithSolidarityHub[] = [
    {
      id: 'hub_langar_01',
      name: 'Gurdwara Sahib Free Langar Kitchen',
      traditionCategory: 'SIKH_GURDWARA_LANGAR',
      address: '1930 S Gurdwara Way, Regional District',
      distanceMiles: 2.4,
      phone: '(555) 745-4421',
      operatingHours: 'Open 24/7 (Hot Meals Served Daily 7:00 AM – 9:00 PM)',
      offerings: [
        'Egalitarian hot lacto-vegetarian meals (Rotis, Black Lentils/Dal, Spinach Sabzi, Kheer)',
        'Unconditional emergency food distribution with zero means-testing or background questions',
        'Bulk grain emergency care packages (Atta flour, rice, pulses)'
      ],
      dietaryCertification: '100% Lacto-Vegetarian, Halal-slaughter free (No Kutha), No Alcohol, No Peanuts on premises',
      costPolicy: '100% Free to All Humanity (Seva / Sacred Giving)',
      culturalEtiquetteTips: [
        'Cover head with a bandana/scarf (provided at entrance if needed)',
        'Remove shoes before entering prayer and dining hall',
        'Sit on the floor mats (Pangat) to symbolize universal human equality'
      ],
      volunteerDeliverySupport: true
    },
    {
      id: 'hub_bikur_02',
      name: 'Bikur Cholim Jewish Community Health & Kosher Pantry',
      traditionCategory: 'JEWISH_BIKUR_CHOLIM',
      address: '422 Shalom Heritage Plaza, Suite 102',
      distanceMiles: 3.1,
      phone: '(555) 364-2824',
      operatingHours: 'Sun–Thu 9:00 AM – 5:00 PM; Fri 9:00 AM – 2:00 PM (Closed Shabbat)',
      offerings: [
        'Certified Glatt Kosher pantry staples (tuna, legumes, olive oil, spelt matzo)',
        'Home-bound patient volunteer visitation and cooked Shabbat meal delivery',
        'Medical equipment loan closet (wheelchairs, hospital beds, nebulizers at no cost)'
      ],
      dietaryCertification: 'Strict Orthodox Kashrut Rabbinical Supervision (OU / Chaf-K)',
      costPolicy: '100% Free / Sliding Scale Mutual Aid',
      culturalEtiquetteTips: [
        'Respect Shabbat operating hours (closes 2 hours before Friday sunset)',
        'Modest dress welcomed in reception office'
      ],
      volunteerDeliverySupport: true
    },
    {
      id: 'hub_zakat_03',
      name: 'Baitul Maal & Zakat Halal Tayyib Food Bank',
      traditionCategory: 'ISLAMIC_ZAKAT_FOOD',
      address: '780 Crescent Parkway, Community Wing',
      distanceMiles: 1.8,
      phone: '(555) 925-2831',
      operatingHours: 'Mon–Sat 10:00 AM – 6:00 PM',
      offerings: [
        'Certified Zabiha Halal proteins (organic lamb, hormone-free chicken, wild fish)',
        'Medjool dates, cold-pressed black seed oil, pure honey, whole grains',
        'Ramadan Suhoor & Iftar emergency household boxes'
      ],
      dietaryCertification: 'Certified Halal & Tayyib (100% Alcohol-Free, Porcine-Free)',
      costPolicy: 'Funded by community Zakat (Charity); Free for all families facing hardship',
      culturalEtiquetteTips: [
        'Staff greet with "As-salamu alaykum" (Peace be upon you)',
        'Gender-respectful receiving counter available'
      ],
      volunteerDeliverySupport: true
    },
    {
      id: 'hub_adventist_04',
      name: 'Adventist Community Services (ACS) & NEWSTART Pantry',
      traditionCategory: 'ADVENTIST_VEG_PANTRY',
      address: '310 Pine Hill Road, Health Education Center',
      distanceMiles: 4.2,
      phone: '(555) 639-7827',
      operatingHours: 'Sun–Thu 8:30 AM – 4:30 PM (Closed Saturday Sabbath)',
      offerings: [
        'Bulk organic whole oats, brown rice, raw walnuts, almonds, flaxseeds',
        'Fresh community garden organic produce distributions',
        'Free plant-based culinary nutrition & diabetic reversal cooking workshops'
      ],
      dietaryCertification: '100% Whole-Food Plant-Based & Vegetarian; Zero Caffeine / Alcohol',
      costPolicy: 'Free Community Health Initiative',
      culturalEtiquetteTips: [
        'Closed from Friday sunset to Saturday sunset for Sabbath observance'
      ],
      volunteerDeliverySupport: true
    },
    {
      id: 'hub_buddhist_05',
      name: 'Tzu Chi Compassionate Relief Food Kitchen',
      traditionCategory: 'BUDDHIST_COMPASSION_MEALS',
      address: '110 Bodhi Avenue, Dharma Hall',
      distanceMiles: 3.8,
      phone: '(555) 898-2444',
      operatingHours: 'Tue–Sat 11:00 AM – 2:00 PM',
      offerings: [
        'Nutrient-dense warm vegan lunch boxes (steamed brown rice, braised tofu, greens)',
        'Emergency disaster relief grocery kits',
        'Mindful eating and stress reduction community circles'
      ],
      dietaryCertification: '100% Vegan (Strict Ahimsa non-violence; zero animal products)',
      costPolicy: 'Free / Donations Accepted (Bodhisattva Dana)',
      culturalEtiquetteTips: [
        'Bowing with hands joined (Gassho) in gratitude when receiving food'
      ],
      volunteerDeliverySupport: false
    }
  ];

  readonly solidarityHubs = signal<IFaithSolidarityHub[]>(this.solidarityHubsDatabase);

  getHubsByTradition(category?: string): IFaithSolidarityHub[] {
    if (!category || category === 'ALL') {
      return this.solidarityHubsDatabase;
    }
    return this.solidarityHubsDatabase.filter(h => h.traditionCategory === category);
  }

  findNearestHub(milesThreshold = 5.0): IFaithSolidarityHub[] {
    return this.solidarityHubsDatabase
      .filter(h => h.distanceMiles <= milesThreshold)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);
  }
}
