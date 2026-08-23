export interface IKitItem {
  id: string;
  category: 'Extraction & First Aid' | 'Two-Zone Repellents' | 'Trail & Clothing' | 'Pet Defense';
  title: string;
  description: string;
  isEssential: boolean;
  checked: boolean;
  icon: string;
}

export const DEFAULT_FERRY_KIT_ITEMS: IKitItem[] = [
  {
    id: 'kit-tweezers',
    category: 'Extraction & First Aid',
    title: 'Precision Fine-Tipped Tweezers',
    description: 'Slanted cosmetic tweezers crush the tick abdomen; use needle-nose tweezers to grasp mouthparts flush against skin.',
    isEssential: true,
    checked: true,
    icon: '🔬'
  },
  {
    id: 'kit-alcohol-wipes',
    category: 'Extraction & First Aid',
    title: '70% Isopropyl Alcohol Wipes',
    description: 'To sterilize the bite site immediately after extraction and disinfect tweezer tips.',
    isEssential: true,
    checked: true,
    icon: '🧪'
  },
  {
    id: 'kit-specimen-bag',
    category: 'Extraction & First Aid',
    title: 'Ziplock Specimen Bag & Sharpie',
    description: 'Store extracted tick with date and trail location for laboratory PCR species verification if symptoms emerge.',
    isEssential: true,
    checked: false,
    icon: '🏷️'
  },
  {
    id: 'kit-permethrin-socks',
    category: 'Two-Zone Repellents',
    title: '0.5% Permethrin-Treated Socks & Shoes',
    description: 'Zone 1 Armor: provides instant neuro-knockdown when questing nymphs climb onto footwear.',
    isEssential: true,
    checked: true,
    icon: '🧦'
  },
  {
    id: 'kit-picaridin-spray',
    category: 'Two-Zone Repellents',
    title: 'Picaridin 20% or PMD/OLE Skin Spray',
    description: 'Zone 2 Armor: 8-hour odorless sensory blinding on exposed skin without melting synthetic clothing.',
    isEssential: true,
    checked: true,
    icon: '🛡️'
  },
  {
    id: 'kit-lint-roller',
    category: 'Two-Zone Repellents',
    title: 'Sticky Adhesive Lint Roller',
    description: 'Roll over pant legs and socks immediately after exiting trail brush to pick up unattached crawling nymphs.',
    isEssential: false,
    checked: false,
    icon: '🧻'
  },
  {
    id: 'kit-light-socks',
    category: 'Trail & Clothing',
    title: 'White / Light-Colored Hiking Socks',
    description: 'Dark black socks camouflage 1mm poppy-seed nymphs; light fabrics make them immediately visible.',
    isEssential: true,
    checked: false,
    icon: '👟'
  },
  {
    id: 'kit-sunscreen',
    category: 'Trail & Clothing',
    title: 'Broad-Spectrum SPF 30+ Sunscreen',
    description: 'Apply 15 minutes before skin repellent so both sunscreen and repellent bind effectively.',
    isEssential: true,
    checked: false,
    icon: '☀️'
  },
  {
    id: 'kit-pet-isoxazoline',
    category: 'Pet Defense',
    title: 'Veterinary Oral Isoxazoline (NexGard / Bravecto)',
    description: 'Ensures ticks that bite pets die rapidly before transmitting pathogens to animals or wandering onto beds.',
    isEssential: true,
    checked: false,
    icon: '🐕'
  }
];

export class FerryKitStore {
  private storageKey = 'nantucket_ferry_kit_v1';
  private items: IKitItem[] = [];

  constructor() {
    this.load();
  }

  public getAll(): IKitItem[] {
    return [...this.items];
  }

  public toggleItem(id: string) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      this.save();
    }
  }

  public resetToDefaults() {
    this.items = JSON.parse(JSON.stringify(DEFAULT_FERRY_KIT_ITEMS));
    this.save();
  }

  public getCompletionStats() {
    const total = this.items.length;
    const packed = this.items.filter(i => i.checked).length;
    const essentialTotal = this.items.filter(i => i.isEssential).length;
    const essentialPacked = this.items.filter(i => i.isEssential && i.checked).length;

    return {
      total,
      packed,
      percent: Math.round((packed / total) * 100),
      essentialTotal,
      essentialPacked,
      isFerryReady: essentialPacked === essentialTotal
    };
  }

  private load() {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        try {
          this.items = JSON.parse(data);
          return;
        } catch {
          // fallback to defaults
        }
      }
    }
    this.items = JSON.parse(JSON.stringify(DEFAULT_FERRY_KIT_ITEMS));
  }

  private save() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }
  }
}
