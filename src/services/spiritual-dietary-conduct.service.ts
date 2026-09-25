import { Injectable, signal, computed } from '@angular/core';

export type FaithTraditionKey = 
  | 'UNIVERSAL_SECULAR'
  | 'JUDAISM_ORTHODOX_KOSHER'
  | 'ISLAM_HALAL_TAYYIB'
  | 'HINDUISM_SATTVIC_AHIMSA'
  | 'JAINISM_STRICT_AHIMSA'
  | 'SEVENTH_DAY_ADVENTIST'
  | 'EASTERN_ORTHODOX_FASTING'
  | 'JEHOVAHS_WITNESS'
  | 'LATTER_DAY_SAINTS_WORD_OF_WISDOM'
  | 'BUDDHISM_MINDFUL_FIVE_PRECEPTS'
  | 'SIKHISM_REHAT_MARYADA';

export interface IDietaryConductRule {
  traditionKey: FaithTraditionKey;
  traditionName: string;
  corePrinciples: string[];
  strictProhibitions: string[];
  permittedStaples: string[];
  medicationExcipientWarnings: string[];
  fastingPractices: {
    name: string;
    description: string;
    clinicalAdjustmentNotes: string;
  }[];
  somaticConduct: {
    sacredRestDays: string;
    prayerMeditationRhythm: string;
    modestyPhysicalTouch: string;
    endOfLifeBloodPreferences: string;
  };
  communitySolidarityBenefit: string;
}

export interface IExcipientAuditResult {
  excipient: string;
  riskLevel: 'SAFE' | 'PRECAUTION' | 'STRICT_PROHIBITION';
  message: string;
  alternativeSuggestion: string;
}

export interface IFhirSpiritualConductBundle {
  resourceType: 'Bundle';
  type: 'collection';
  id: string;
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: {
      resourceType: string;
      id: string;
      status: string;
      category?: Array<{
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
      }>;
      code?: {
        coding: Array<{
          system: string;
          code: string;
          display: string;
        }>;
        text?: string;
      };
      patient?: {
        reference: string;
        display: string;
      };
      provision?: Record<string, unknown>;
      note?: Array<{ text: string }>;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SpiritualDietaryConductService {
  private readonly selectedTraditionState = signal<FaithTraditionKey>('UNIVERSAL_SECULAR');

  readonly selectedTradition = this.selectedTraditionState.asReadonly();

  private readonly traditionsDatabase: Record<FaithTraditionKey, IDietaryConductRule> = {
    UNIVERSAL_SECULAR: {
      traditionKey: 'UNIVERSAL_SECULAR',
      traditionName: 'Universal / Humanist / Secular Whole Health',
      corePrinciples: [
        'Evidence-based nutritional optimization',
        'Ethical environmental stewardship & animal welfare',
        'Personal somatic autonomy and bodily self-determination'
      ],
      strictProhibitions: ['None by dogma; guided by personal medical tolerance and values'],
      permittedStaples: ['Whole plant foods, unrefined grains, legumes, vegetables, fruits, seeds, nuts'],
      medicationExcipientWarnings: ['Standard pharmaceutical quality control and allergen labeling'],
      fastingPractices: [
        {
          name: 'Circadian Time-Restricted Eating (TRE)',
          description: '12-to-16 hour overnight fasting window aligned with endogenous melatonin cycles.',
          clinicalAdjustmentNotes: 'Safe for general populations; monitor hypoglycemia in patients on sulfonylureas or insulin.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Weekly restorative boundary (1-2 days of work cessation, nature immersion, digital hygiene)',
        prayerMeditationRhythm: 'Daily mindfulness, breathwork, or contemplative journaling (15-20 min)',
        modestyPhysicalTouch: 'Standard informed clinical consent before physical contact or examination',
        endOfLifeBloodPreferences: 'Autonomous advance directive, palliative comfort focus, organ donation encouraged'
      },
      communitySolidarityBenefit: 'Civic engagement, book clubs, community garden cooperatives, and intentional friendships.'
    },

    JUDAISM_ORTHODOX_KOSHER: {
      traditionKey: 'JUDAISM_ORTHODOX_KOSHER',
      traditionName: 'Judaism (Orthodox & Conservative Kashrut)',
      corePrinciples: [
        'Kashrut dietary holiness (sanctification of physical consumption)',
        'Separation of dairy (milchig) and meat (fleishig)',
        'Pikuach Nefesh (sanctity of preserving human life supersedes ritual dietary laws in medical emergencies)'
      ],
      strictProhibitions: [
        'Pork and all swine byproducts',
        'Shellfish, crustaceans, and fish without fins and scales',
        'Non-kosher animal gelatin',
        'Simultaneous consumption of meat and milk',
        'Chametz (leavened grain) during Passover'
      ],
      permittedStaples: [
        'Heirloom legumes, lentils, chickpeas, spelt, kosher-certified extra virgin olive oil, wild salmon, cod, fresh produce'
      ],
      medicationExcipientWarnings: [
        'Porcine gelatin capsules: Permitted under Pikuach Nefesh if no kosher vegetarian capsule exists, but kosher cellulose/pullulan capsules preferred.',
        'Passover: Avoid medications containing grain alcohol, starch binders, or chametz excipients where alternative kosher formulations exist.'
      ],
      fastingPractices: [
        {
          name: 'Yom Kippur & Tisha B’Av (25-hour total water/food fast)',
          description: 'Solemn atonement and communal fasting from sunset to nightfall the following day.',
          clinicalAdjustmentNotes: 'Pikuach Nefesh exempts frail elderly, pregnant individuals, and unstable diabetics. Hydration drops or small hourly doses (Shiurim) can be rabbinically cleared.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Shabbat (Friday sunset to Saturday nightfall): Total digital and work cessation; communal family meals',
        prayerMeditationRhythm: 'Shacharit, Mincha, and Maariv (thrice daily standing and bowing prayers with Tefillin)',
        modestyPhysicalTouch: 'Tzniut (modesty): Request for gender-concordant clinician for intimate exams when possible; head covering (Kippah) retained during non-emergent exams',
        endOfLifeBloodPreferences: 'Kevod HaMet (honor for the deceased): Autopsy generally discouraged unless legally mandated; rapid burial within 24 hours; organ donation accepted under halachic guidelines'
      },
      communitySolidarityBenefit: 'Minyan prayer cohorts, Shabbat hospitality (Hachnasat Orchim), Bikur Cholim (visiting the sick) volunteer networks.'
    },

    ISLAM_HALAL_TAYYIB: {
      traditionKey: 'ISLAM_HALAL_TAYYIB',
      traditionName: 'Islam (Halal & Tayyib Wholesome Living)',
      corePrinciples: [
        'Halal (lawfully permissible) and Tayyib (pure, ethical, wholesome, unadulterated nutrition)',
        'Total prohibition of harm (Dharar) to the physical body and mental clarity',
        'Conservation of spiritual lucidity and bodily cleanliness (Taharah)'
      ],
      strictProhibitions: [
        'Pork, swine meat, and porcine lard/gelatin',
        'Ethanol, wine, beer, and intoxicating alcoholic beverages',
        'Carrion, improperly slaughtered animals, and predatory carnivores',
        'Blood and blood byproducts in foods'
      ],
      permittedStaples: [
        'Medjool dates, raw unpasteurized honey, black seed (Nigella sativa), pomegranates, figs, olive oil, halal-harvested lamb/poultry, wild finned fish'
      ],
      medicationExcipientWarnings: [
        'Porcine gelatin: Clinicians must prescribe vegetarian/HPMC capsules or synthetic softgels.',
        'Liquid elixirs: Prohibit ethanol-based cough syrups; specify alcohol-free suspensions.',
        'Emergency exemption: Islamic jurisprudence (Darurah) permits forbidden ingredients if no viable alternative exists to preserve life.'
      ],
      fastingPractices: [
        {
          name: 'Ramadan Holy Month (Dawn-to-Dusk dry fast for 29-30 days)',
          description: 'No food, water, or oral medications between Suhoor (pre-dawn meal) and Iftar (sunset meal).',
          clinicalAdjustmentNotes: 'Shift once-daily medications to Iftar or Suhoor. For BID medications, titrate carefully. Chronically ill, pregnant, and nursing patients are Quranically exempted (Surah Al-Baqarah 2:185).'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Jumu’ah (Friday congregational midday assembly and sermon)',
        prayerMeditationRhythm: 'Salah: Five daily ritual prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) with spinal prostrations and grounding',
        modestyPhysicalTouch: 'Haya (modesty): Clinicians must preserve privacy; provide gender-concordant providers or chaperone; allow Hijab/Kufi to remain during care',
        endOfLifeBloodPreferences: 'All blood transfusions fully permitted to preserve life. Post-mortem rapid ritual washing (Ghusl) and shroud burial within 24 hours.'
      },
      communitySolidarityBenefit: 'Communal Iftar meals, Zakat charitable healthcare funds, hospital visitation (Iyadah al-Marid).'
    },

    HINDUISM_SATTVIC_AHIMSA: {
      traditionKey: 'HINDUISM_SATTVIC_AHIMSA',
      traditionName: 'Hinduism (Ahimsa & Sattvic Ayurvedic Rhythms)',
      corePrinciples: [
        'Ahimsa (non-injury and non-violence toward all sentient living beings)',
        'Sattvic Guna (food that promotes serenity, mental clarity, and longevity)',
        'Ayurvedic harmony: Balancing Vata, Pitta, and Kapha doshas through spiced whole foods'
      ],
      strictProhibitions: [
        'Beef and all bovine-derived ingredients (cows are revered as sacred maternal symbols)',
        'Most observant practitioners avoid all animal meats and poultry',
        'Excessive Tamasic foods (rotted, highly fermented, stale, or chemicalized foods)'
      ],
      permittedStaples: [
        'A2 grass-fed Ghee, mung dal, basmati rice, turmeric, fresh ginger, holy basil (Tulsi), seasonal squash, fresh dairy (for lacto-vegetarians)'
      ],
      medicationExcipientWarnings: [
        'Bovine gelatin capsules and stearic acid derived from beef tallow strictly forbidden. Prescribe plant cellulose (HPMC).',
        'Heparin: Porcine heparin is acceptable if medically indispensable, but synthetic fondaparinux can be considered if accessible.'
      ],
      fastingPractices: [
        {
          name: 'Ekadashi (11th lunar day twice per month) & Navaratri',
          description: 'Avoidance of grains and beans, consuming only fresh fruits, milk, and root tubers (Phalahar).',
          clinicalAdjustmentNotes: 'Carbohydrate intake patterns shift on Phalahar days; monitor blood glucose in diabetic patients.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Vrata days and festival dawn celebrations',
        prayerMeditationRhythm: 'Daily morning Puja, Japa chanting, Pranayama breath control, and Surya Namaskar (Sun Salutations)',
        modestyPhysicalTouch: 'Modesty respected; right-hand preference for receiving medicine or food; sacred threads (Janeu) should not be cut without patient/family permission',
        endOfLifeBloodPreferences: 'Full acceptance of blood transfusions and medications. Sacred Ganges water drops (Ganga Jal) and Tulsi leaf placed on lips at death; rapid cremation.'
      },
      communitySolidarityBenefit: 'Temple Prasad communal feeding, satsang chanting circles, intergenerational family caretaking.'
    },

    JAINISM_STRICT_AHIMSA: {
      traditionKey: 'JAINISM_STRICT_AHIMSA',
      traditionName: 'Jainism (Absolute Ahimsa & Parasparopagraho Jivanam)',
      corePrinciples: [
        'Absolute Ahimsa (complete non-violence toward micro-organisms and invisible life forms)',
        'Anekantavada (multi-faceted truth and non-absolutism)',
        'Aparigraha (non-possessiveness and ecological minimalism)'
      ],
      strictProhibitions: [
        'All animal flesh, fish, poultry, eggs, and animal gelatin',
        'Underground root vegetables (potatoes, onions, garlic, carrots, ginger, beets) because harvesting uproots the plant and kills microscopic soil organisms (Nigodas)',
        'Fermented foods containing active yeast microbes, honey (harm to bees), and food eaten after nightfall'
      ],
      permittedStaples: [
        'Above-ground legumes, lentils, chickpeas, rice, wheat, millet, green vegetables (excluding during Paryushana), cumin, coriander, turmeric'
      ],
      medicationExcipientWarnings: [
        'No animal gelatin or bone-char-processed sugar excipients.',
        'Liquid tinctures with alcohol or live probiotics requiring animal media must be vetted.'
      ],
      fastingPractices: [
        {
          name: 'Paryushana & Samvatsari (Upvas / Chauvihar Fasting)',
          description: 'Rigorous fasts where even boiled water is consumed only between sunrise and sunset; some do complete multi-day water fasts.',
          clinicalAdjustmentNotes: 'High risk of acute dehydration and ketone accumulation. Clinicians must educate on medical exemptions for acute illness.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Paryushana (8-10 days of intense spiritual reflection and forgiveness)',
        prayerMeditationRhythm: 'Navkar Mantra recitation, Samayika (48 minutes of equanimity meditation)',
        modestyPhysicalTouch: 'Quiet, gentle clinical demeanor; respect for ascetic simplicity',
        endOfLifeBloodPreferences: 'Sallekhana (Sanctified spiritual fasting at the natural end of life, performed voluntarily with community peace); organ donation often supported as compassionate gift'
      },
      communitySolidarityBenefit: 'Universal forgiveness practice (Micchami Dukkadam), animal sanctuaries (Panjrapoles), mutual aid funds.'
    },

    SEVENTH_DAY_ADVENTIST: {
      traditionKey: 'SEVENTH_DAY_ADVENTIST',
      traditionName: 'Seventh-day Adventist (Temple Health Message)',
      corePrinciples: [
        'The physical body is the sacred Temple of the Holy Spirit (1 Corinthians 6:19)',
        'Loma Linda Blue Zone lifestyle: Pure water, fresh air, exercise, temperance, sunshine, plant-based diet, and trust in God (NEWSTART)',
        'Wholistic preventive care and longevity'
      ],
      strictProhibitions: [
        'Pork, shellfish, and biblically unclean meats (Leviticus 11)',
        'Alcohol, tobacco, recreational drugs, and habit-forming caffeine (coffee, tea, stimulants)',
        'Refined and artificially preserved convenience foods discouraged'
      ],
      permittedStaples: [
        'Whole grains, oats, brown rice, walnuts, almonds, flaxseeds, legumes, garden greens, fresh fruit, soy/tofu, pure mountain water'
      ],
      medicationExcipientWarnings: [
        'Avoid porcine gelatin and caffeinated pain formulations (e.g., Excedrin) when caffeine-free alternatives are available.'
      ],
      fastingPractices: [
        {
          name: 'Spiritual Fasts for Healing',
          description: 'Periodic 24-hour juice or water fasts during personal prayer or church revival.',
          clinicalAdjustmentNotes: 'Coordinate with hydration and diabetes therapy.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Saturday Sabbath (Friday sunset to Saturday sunset): Strict cessation of secular labor, digital detox, nature walks, fellowship',
        prayerMeditationRhythm: 'Morning and evening family worship, Scripture study, hymn singing',
        modestyPhysicalTouch: 'Modest dress; compassionate Christian bedside prayer welcomed prior to procedures',
        endOfLifeBloodPreferences: 'Transfusions and all modern medical surgeries warmly accepted; preventive lifestyle combined with high-tech medicine'
      },
      communitySolidarityBenefit: 'Community cooking schools, Adventist Health clinics, Sabbath potlucks, global disaster relief (ADRA).'
    },

    EASTERN_ORTHODOX_FASTING: {
      traditionKey: 'EASTERN_ORTHODOX_FASTING',
      traditionName: 'Eastern & Oriental Orthodox Christian Fasting',
      corePrinciples: [
        'Ascetic mastery of bodily passions (Nepsis) and spiritual purification',
        'Fasting as an ecclesiastical discipline spanning 180 to 250 days per calendar year',
        'Hesychasm (inner stillness and prayer of the heart)'
      ],
      strictProhibitions: [
        'Meat, poultry, dairy, and eggs during fasting periods (Great Lent, Nativity Fast, Apostles Fast, Dormition Fast, and every Wednesday/Friday)',
        'Olive oil and wine prohibited on strict fasting days (though invertebrates/seafood like squid, octopus, and shrimp are historically permitted)'
      ],
      permittedStaples: [
        'Lentil soups, giant white beans (Gigantes plaki), tahini, sourdough bread, olives, wild greens (Horta), walnuts, pomegranates, calamari'
      ],
      medicationExcipientWarnings: [
        'Fasting rules govern voluntary food, NOT prescribed medical treatments. Priests and bishops universalize medical exemptions for medication.'
      ],
      fastingPractices: [
        {
          name: 'Great Lent (40+ days of plant-based fasting prior to Pascha/Easter)',
          description: 'Monastic-inspired vegan diet with high legume and polyphenol intake.',
          clinicalAdjustmentNotes: 'Marked drops in LDL cholesterol and blood pressure observed; monitor protein adequacy in elderly patients.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Sunday Divine Liturgy celebration; feast days (Pascha, Theophany)',
        prayerMeditationRhythm: 'Jesus Prayer with prayer rope (Komboskini), metanias (prostrations), icon veneration',
        modestyPhysicalTouch: 'Modest presentation; priest requested for holy unction (anointing with blessed oil for healing)',
        endOfLifeBloodPreferences: 'Transfusions permitted. Prayers for the departure of the soul; open-casket traditional burial; cremation traditionally avoided'
      },
      communitySolidarityBenefit: 'Trapeza (communal post-liturgy meal), parish philanthropy, monastic retreat hospitality.'
    },

    JEHOVAHS_WITNESS: {
      traditionKey: 'JEHOVAHS_WITNESS',
      traditionName: 'Jehovah’s Witnesses (Bloodless Medicine Directive)',
      corePrinciples: [
        'Sacredness of life symbolized by blood (Genesis 9:4, Leviticus 17:10, Acts 15:28-29)',
        'Biblical command to "abstain from blood"',
        'Pioneers of bloodless surgery, autologous cell-salvage, and patient blood management'
      ],
      strictProhibitions: [
        'Allogeneic whole blood transfusions and 4 primary components: Red Blood Cells (RBCs), White Blood Cells (WBCs), Platelets, and Plasma',
        'Consuming blood sausage or un-bled meats'
      ],
      permittedStaples: [
        'All standard whole foods, well-bled organic meats, whole grains, produce, nuts, seeds, legumes'
      ],
      medicationExcipientWarnings: [
        'Blood fractions (albumin, immunoglobulins, clotting factors VIII/IX, interferons) are a matter of personal conscience.',
        'Mandatory advance medical directive (No Blood Durable Power of Attorney card) must be scanned into medical record.'
      ],
      fastingPractices: [
        {
          name: 'No mandatory religious calendar fasts',
          description: 'Spiritual focus on biblical preaching and personal study.',
          clinicalAdjustmentNotes: 'Standard clinical nutritional guidelines apply.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Midweek and weekend Kingdom Hall assemblies',
        prayerMeditationRhythm: 'Daily personal Bible reading and family study',
        modestyPhysicalTouch: 'Modest attire; respect for family elders and Hospital Liaison Committees (HLC)',
        endOfLifeBloodPreferences: 'Strict non-negotiable refusal of primary allogeneic blood; utilization of acute normovolemic hemodilution, intraoperative cell salvage (in a continuous closed circuit), and IV iron/erythropoietin'
      },
      communitySolidarityBenefit: 'Hospital Liaison Committees (HLC) available 24/7 to support medical staff with bloodless surgical equipment.'
    },

    LATTER_DAY_SAINTS_WORD_OF_WISDOM: {
      traditionKey: 'LATTER_DAY_SAINTS_WORD_OF_WISDOM',
      traditionName: 'The Church of Jesus Christ of Latter-day Saints (Word of Wisdom)',
      corePrinciples: [
        'Word of Wisdom (Doctrine & Covenants Section 89): Physical body as a divinely gifted instrument',
        'Temperance, self-control, and physical stamina',
        'Emphasis on family solidarity and disaster preparedness (1-year food storage)'
      ],
      strictProhibitions: [
        'Alcohol, wine, and strong drinks',
        'Tobacco and smoking/vaping',
        '"Hot drinks" interpreted canonically as coffee and tea (Camellia sinensis)',
        'Harmful illicit drugs and misuse of prescription analgesics'
      ],
      permittedStaples: [
        'Wholesome herbs, seasonal vegetables, fruits, whole grains (especially wheat as "the staff of life"), meat used sparingly in times of winter or cold'
      ],
      medicationExcipientWarnings: [
        'Herbal teas (chamomile, peppermint) are acceptable; caffeinated sodas are a matter of personal choice; prescription pain medication should be closely monitored to avoid dependence.'
      ],
      fastingPractices: [
        {
          name: 'Fast Sunday (First Sunday of each month, 2 consecutive meals)',
          description: 'Fasting for approximately 24 hours accompanied by prayer and donating the money saved to the Fast Offering fund for the poor.',
          clinicalAdjustmentNotes: 'Exempts young children, ill individuals, and pregnant/nursing mothers.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Sunday Sabbath: Dedicated to church meetings, family gathering, restful reflection',
        prayerMeditationRhythm: 'Morning and evening kneeling family prayer; temple attendance for endowed members',
        modestyPhysicalTouch: 'Modesty respected; temple garments worn by adult members should be treated with deep reverence during hospital gowns and surgeries',
        endOfLifeBloodPreferences: 'Blood transfusions, organ donations, and life support completely permissible; priesthood blessing with consecrated olive oil frequently requested before operations'
      },
      communitySolidarityBenefit: 'Bishops’ Storehouses, Relief Society compassionate service circles, community cannery networks.'
    },

    BUDDHISM_MINDFUL_FIVE_PRECEPTS: {
      traditionKey: 'BUDDHISM_MINDFUL_FIVE_PRECEPTS',
      traditionName: 'Buddhism (Five Precepts & Mindful Compassion)',
      corePrinciples: [
        'First Precept: Non-killing and compassion for all living beings (Karuna & Metta)',
        'Fifth Precept: Abstaining from intoxicants that cloud mindfulness and lead to heedlessness',
        'Mindful eating: Savoring food with deep gratitude for the cosmos and farmers'
      ],
      strictProhibitions: [
        'Alcohol, recreational intoxicants, and narcotics',
        'Meat killed specifically for the recipient; Mahayana tradition strictly observes vegetarianism/veganism'
      ],
      permittedStaples: [
        'Tofu, tempeh, brown rice, seaweed, bok choy, miso soup, sesame seeds, seasonal green tea, legumes'
      ],
      medicationExcipientWarnings: [
        'Sedatives and psychoactive medications: Explain clinical necessity clearly, as preserving clear cognitive awareness is spiritually paramount.'
      ],
      fastingPractices: [
        {
          name: 'Uposatha Days (New moon, full moon, quarter moons)',
          description: 'Observance of the Eight Precepts, including no solid food after midday solar noon.',
          clinicalAdjustmentNotes: 'Consumes liquids and broths in the evening; adjust evening insulin accordingly.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Uposatha full moon festivals and meditation retreats',
        prayerMeditationRhythm: 'Zazen, Vipassana insight meditation, Metta loving-kindness chanting, mindful walking',
        modestyPhysicalTouch: 'Gentle, calm speaking environment; serene atmosphere reduces autonomic stress',
        endOfLifeBloodPreferences: 'Transfusions and organ donations viewed as sublime acts of Bodhisattva generosity; calm, quiet dying space requested so the mind remains unconfused at the moment of death'
      },
      communitySolidarityBenefit: 'Sangha communal retreats, Dana charitable giving, mindfulness circles.'
    },

    SIKHISM_REHAT_MARYADA: {
      traditionKey: 'SIKHISM_REHAT_MARYADA',
      traditionName: 'Sikhism (Sikhi Rehat Maryada & Langar Solidarity)',
      corePrinciples: [
        'Kirat Karo (honest labor), Naam Japna (remembrance of the Divine), Vand Chhako (selflessly sharing with others)',
        'Langar: Free community kitchen serving egalitarian lacto-vegetarian meals to all humanity regardless of caste, race, or creed',
        'Body as sacred creation of Akal Purakh; respect for uncut hair (Kesh)'
      ],
      strictProhibitions: [
        'Kutha meat (meat slaughtered via slow halal/kosher ritual exsanguination; only Jhatka or vegetarian food permitted)',
        'All tobacco, smoking, vaping, intoxicants, and recreational drugs',
        'Cutting or shaving any bodily hair (Kesh)'
      ],
      permittedStaples: [
        'Whole wheat rotis, dal (black lentils/urad), subzi (cauliflower, spinach, peas), kheer (sweet rice pudding), curd/yogurt, almonds'
      ],
      medicationExcipientWarnings: [
        'Tobacco-derived extracts or intoxicants forbidden. Respect the 5 Kakars (articles of faith) during clinical interventions.'
      ],
      fastingPractices: [
        {
          name: 'No mandatory calendar fasting',
          description: 'Guru Granth Sahib teaches that ritual starvation does not bring spiritual enlightenment; nourishment and moderation are valued.',
          clinicalAdjustmentNotes: 'Standard clinical nutrition plans.'
        }
      ],
      somaticConduct: {
        sacredRestDays: 'Gurdwara congregational worship, Sunday Langar fellowship',
        prayerMeditationRhythm: 'Nitnem (daily prayers recited at Amrit Vela / dawn, dusk, and bedtime)',
        modestyPhysicalTouch: 'Kesh (uncut hair) wrapped in a Turban/Dastar; medical staff must not cut hair without life-or-death emergency consent. The Kara (steel bangle) and Kachera (cotton shorts) should be preserved where possible',
        endOfLifeBloodPreferences: 'Blood transfusions and organ donations warmly encouraged (Seva/selfless service). Shabad Kirtan hymns chanted at bedside; traditional cremation'
      },
      communitySolidarityBenefit: '24/7 Free Langar community feeding kitchens in every Gurdwara globally; disaster Seva relief teams.'
    }
  };

  readonly activeTraditionRule = computed(() => {
    return this.traditionsDatabase[this.selectedTraditionState()];
  });

  setTradition(key: FaithTraditionKey): void {
    this.selectedTraditionState.set(key);
  }

  getAllTraditions(): IDietaryConductRule[] {
    return Object.values(this.traditionsDatabase);
  }

  auditMedicationExcipients(excipientNames: string[]): IExcipientAuditResult[] {
    const tradition = this.activeTraditionRule();
    const results: IExcipientAuditResult[] = [];

    for (const raw of excipientNames) {
      const lower = raw.toLowerCase().trim();

      if (lower.includes('porcine') || (lower.includes('gelatin') && !lower.includes('vegetable') && !lower.includes('hpmc'))) {
        if (tradition.traditionKey === 'ISLAM_HALAL_TAYYIB' || tradition.traditionKey === 'JUDAISM_ORTHODOX_KOSHER' || tradition.traditionKey === 'SEVENTH_DAY_ADVENTIST') {
          results.push({
            excipient: raw,
            riskLevel: 'STRICT_PROHIBITION',
            message: `Animal/Porcine gelatin conflicts with ${tradition.traditionName} dietary law.`,
            alternativeSuggestion: 'Request vegetable cellulose (HPMC) or pullulan capsule formulation.'
          });
          continue;
        }
        if (tradition.traditionKey === 'HINDUISM_SATTVIC_AHIMSA' || tradition.traditionKey === 'JAINISM_STRICT_AHIMSA' || tradition.traditionKey === 'BUDDHISM_MINDFUL_FIVE_PRECEPTS') {
          results.push({
            excipient: raw,
            riskLevel: 'STRICT_PROHIBITION',
            message: `Animal-derived gelatin violates Ahimsa (non-violence) principles.`,
            alternativeSuggestion: 'Substitute with plant-based HPMC or liquid suspension without animal binders.'
          });
          continue;
        }
      }

      if (lower.includes('bovine') || lower.includes('beef') || lower.includes('tallow')) {
        if (tradition.traditionKey === 'HINDUISM_SATTVIC_AHIMSA' || tradition.traditionKey === 'JAINISM_STRICT_AHIMSA') {
          results.push({
            excipient: raw,
            riskLevel: 'STRICT_PROHIBITION',
            message: `Bovine/cattle extracts strictly prohibited in sacred Hindu/Jain conduct.`,
            alternativeSuggestion: 'Use certified bovine-free vegan pharmaceutical alternatives.'
          });
          continue;
        }
      }

      if (lower.includes('alcohol') || lower.includes('ethanol')) {
        if (tradition.traditionKey === 'ISLAM_HALAL_TAYYIB' || tradition.traditionKey === 'SEVENTH_DAY_ADVENTIST' || tradition.traditionKey === 'LATTER_DAY_SAINTS_WORD_OF_WISDOM' || tradition.traditionKey === 'SIKHISM_REHAT_MARYADA' || tradition.traditionKey === 'BUDDHISM_MINDFUL_FIVE_PRECEPTS') {
          results.push({
            excipient: raw,
            riskLevel: 'STRICT_PROHIBITION',
            message: `Alcohol/Ethanol vehicle conflicts with absolute sobriety and religious mandates.`,
            alternativeSuggestion: 'Prescribe alcohol-free oral liquid or solid tablet formulation.'
          });
          continue;
        }
      }

      if (lower.includes('blood') || lower.includes('plasma') || lower.includes('albumin')) {
        if (tradition.traditionKey === 'JEHOVAHS_WITNESS') {
          const isPrimary = lower.includes('blood') || lower.includes('plasma');
          results.push({
            excipient: raw,
            riskLevel: isPrimary ? 'STRICT_PROHIBITION' : 'PRECAUTION',
            message: isPrimary 
              ? 'Primary blood component strictly prohibited per Jehovah’s Witness medical directive.' 
              : 'Blood fraction (albumin/fraction); requires individual conscience review with patient/DPOA.',
            alternativeSuggestion: 'Consider synthetic colloids, recombinant alternatives, or crystalloid volume support.'
          });
          continue;
        }
      }

      results.push({
        excipient: raw,
        riskLevel: 'SAFE',
        message: `No active dogmatic or dietary conflict identified for ${tradition.traditionName}.`,
        alternativeSuggestion: 'Standard clinical administration.'
      });
    }

    return results;
  }

  generateFhirSpiritualConductBundle(patientId = 'pat-current-001'): IFhirSpiritualConductBundle {
    const tradition = this.activeTraditionRule();
    const timestamp = new Date().toISOString();

    return {
      resourceType: 'Bundle',
      type: 'collection',
      id: `bundle-spiritual-conduct-${Date.now()}`,
      timestamp,
      entry: [
        {
          fullUrl: `urn:uuid:consent-religious-preference-${tradition.traditionKey.toLowerCase()}`,
          resource: {
            resourceType: 'Consent',
            id: `consent-${tradition.traditionKey.toLowerCase()}`,
            status: 'active',
            category: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/consentcategorycodes',
                    code: 'acd',
                    display: 'Advance Care Directive'
                  }
                ]
              }
            ],
            patient: {
              reference: `Patient/${patientId}`,
              display: 'Current Patient'
            },
            provision: {
              type: 'permit',
              purpose: [
                {
                  code: 'CLINICAL_DECISION_SUPPORT',
                  display: `Spiritual & Faith Conduct: ${tradition.traditionName}`
                }
              ]
            },
            note: [
              { text: `Tradition: ${tradition.traditionName}` },
              { text: `Sacred Rest: ${tradition.somaticConduct.sacredRestDays}` },
              { text: `Modesty Directive: ${tradition.somaticConduct.modestyPhysicalTouch}` },
              { text: `Blood & End-of-Life: ${tradition.somaticConduct.endOfLifeBloodPreferences}` }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:observation-dietary-conduct-${tradition.traditionKey.toLowerCase()}`,
          resource: {
            resourceType: 'Observation',
            id: `obs-dietary-conduct-${tradition.traditionKey.toLowerCase()}`,
            status: 'final',
            code: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '8684-3',
                  display: 'History of Religion and Faith Practices'
                }
              ],
              text: `Religious Dietary & Conduct Mandates (${tradition.traditionName})`
            },
            patient: {
              reference: `Patient/${patientId}`,
              display: 'Current Patient'
            },
            note: [
              { text: `Prohibitions: ${tradition.strictProhibitions.join('; ')}` },
              { text: `Permitted Staples: ${tradition.permittedStaples.join('; ')}` },
              { text: `Community Support: ${tradition.communitySolidarityBenefit}` }
            ]
          }
        }
      ]
    };
  }
}
