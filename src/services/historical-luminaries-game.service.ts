import { Injectable, signal, inject } from '@angular/core';
import { PatientStateService } from './patient-state.service';
import { MOCK_PATIENTS } from '../mock-patients';

export interface ILuminaryCaseClue {
  round: number;
  phaseTitle: string;
  sourceDate: string;
  excerpt: string;
  clinicalSign: string;
}

export interface ILuminaryDiagnosticOption {
  id: string;
  diagnosisName: string;
  isHistoricallyAccepted: boolean;
  scientificRationale: string;
  bayesianPlausibility: number; // 0-100%
}

export interface ILuminaryCase {
  id: string;
  patientMockId: string;
  luminaryName: string;
  blindedCaseTitle: string;
  blindedSpecialty: string;
  lifeSpan: string;
  fieldOfPioneering: string;
  civilizationEra?: 'Ancient' | 'Classical' | 'Medieval' | 'Renaissance' | 'Industrial' | 'Modern';
  civilizationEmpire?: string;
  avatarEmoji: string;
  quote: string;
  historicalContext: string;
  healthQuestNarrative: string;
  physicalHardships: string[];
  societalAndPersonalHardships: string[];
  resilienceTriumph: string;
  clues: ILuminaryCaseClue[];
  options: ILuminaryDiagnosticOption[];
  correctOptionHash: string;
  confirmedHistoricalDiagnosis: string;
  clinicalTeachingPearl: string;
  monumentTribute: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoricalLuminariesGameService {
  private patientState?: PatientStateService | null;
  readonly isIncognitoMode = signal<boolean>(true);

  constructor(patientState?: PatientStateService | null) {
    if (patientState !== undefined) {
      this.patientState = patientState;
    } else {
      try {
        this.patientState = inject(PatientStateService, { optional: true });
      } catch {
        this.patientState = null;
      }
    }
  }

  public toggleIncognitoMode(): void {
    this.isIncognitoMode.update(m => !m);
  }

  private readonly cases: ILuminaryCase[] = [
    {
      id: 'alexander',
      patientMockId: 'p001',
      luminaryName: 'Alexander the Great',
      blindedCaseTitle: 'Patient Alpha: 32y Imperial Commander (Babylon, 323 BC)',
      blindedSpecialty: 'Acute Ascending Motor Paralysis & Military Polytrauma',
      lifeSpan: '356 BC – 323 BC',
      civilizationEra: 'Classical',
      civilizationEmpire: 'Macedonian Empire',
      fieldOfPioneering: 'King of Macedonia, Hegemon of the Hellenic League & Conqueror of the Persian Empire',
      avatarEmoji: '⚡',
      quote: 'There is nothing impossible to him who will try.',
      historicalContext: 'Conquered from Greece to the Punjab by age 30. Collapsed in Nebuchadnezzar’s Palace in Babylon in 323 BC following high fever and progressive flaccid paralysis that left him immobile for 6 days prior to death.',
      healthQuestNarrative: 'After suffering multiple battle wounds (a chest puncture piercing his lung in Multan and a fractured fibula), Alexander collapsed in Babylon. He developed an acute ascending symmetrical paralysis—unable to move his arms, legs, or speak—while his mind remained sharp and conscious. Embalmers reported his body did not decompose for 6 days because he was actually in a deep comatose, flaccid state of respiratory insufficiency before true biological death.',
      physicalHardships: [
        'Rapidly ascending, symmetrical flaccid paralysis progressing over 7 to 10 days from legs to diaphragm.',
        'Loss of motor speech and bulbar swallowing while maintaining intact sensory perception.',
        'Accumulated severe military trauma: penetrating chest trauma, arrow extraction, and chronic malaria.'
      ],
      societalAndPersonalHardships: [
        'Unrelenting mutiny threats from exhausted troops along the Hyphasis River in India.',
        'Devastating grief over the death of his closest companion Hephaestion.',
        'Intense court paranoia, assassin fears, and drinking binges under extreme imperial pressure.'
      ],
      resilienceTriumph: 'Led Macedonian phalanxes across 22,000 miles of uncharted territory without suffering a single tactical defeat, establishing over 20 cities and unifying ancient world trade routes.',
      clues: [
        {
          round: 1,
          phaseTitle: 'Royal Ephemerides Journal (Babylon, June 323 BC)',
          sourceDate: 'Palace of Nebuchadnezzar II',
          excerpt: 'Following a banquet, experienced sudden abdominal pain, joint aching, and high fever. On Day 4, lost ability to rise from his couch.',
          clinicalSign: 'Prodromal gastrointestinal infection followed by acute motor weakness'
        },
        {
          round: 2,
          phaseTitle: 'Court Physician Records (Plutarch & Arrian)',
          sourceDate: 'Day 8 of Illness',
          excerpt: 'Could recognize his generals and acknowledge them with his eyes, but his vocal cords and limbs were entirely motionless.',
          clinicalSign: 'Ascending flaccid quadriparesis with preserved ocular motility and mentation'
        },
        {
          round: 3,
          phaseTitle: 'Modern Neuro-Pathology Retrospective (Dr. Katherine Hall, 2018)',
          sourceDate: 'The Ancient History Bulletin',
          excerpt: 'Campylobacter jejuni-induced Guillain-Barré Syndrome (Acute Motor Axonal Neuropathy variant). The 6-day lack of decomposition was due to severe hypoventilation mimicking death.',
          clinicalSign: 'Guillain-Barré Syndrome (AMAN / AIDP) Polyneuropathy'
        }
      ],
      options: [
        {
          id: 'opt_alex_gbs',
          diagnosisName: 'Guillain-Barré Syndrome (AMAN Variant / Post-Campylobacter Polyneuropathy)',
          isHistoricallyAccepted: true,
          scientificRationale: 'Ascending symmetrical flaccid paralysis with preserved sensorium and terminal respiratory arrest perfectly matches acute axonal polyneuropathy.',
          bayesianPlausibility: 95
        },
        {
          id: 'opt_alex_poison',
          diagnosisName: 'Acute Strychnine or White Hellebore Poisoning',
          isHistoricallyAccepted: false,
          scientificRationale: 'Strychnine causes violent tetanic convulsions and risus sardonicus, completely contradicting the flaccid 6-day paralysis documented by Arrian.',
          bayesianPlausibility: 32
        },
        {
          id: 'opt_alex_typhoid',
          diagnosisName: 'Typhoid Fever with Bowel Perforation',
          isHistoricallyAccepted: false,
          scientificRationale: 'Bowel perforation causes acute peritonitis, septic shock, and delirium rather than lucid 6-day flaccid paralysis.',
          bayesianPlausibility: 28
        },
        {
          id: 'opt_alex_malaria',
          diagnosisName: 'Cerebral Malaria (Plasmodium falciparum)',
          isHistoricallyAccepted: false,
          scientificRationale: 'Cerebral malaria results in rapid coma, seizures, and decerebrate posturing, not conscious eye-tracking flaccid quadriparesis.',
          bayesianPlausibility: 15
        }
      ],
      correctOptionHash: '5390e0724533c9ec3da8b79044772625ab4e637601086679a1d334dfcba73fd1',
      confirmedHistoricalDiagnosis: 'Guillain-Barré Syndrome (Acute Motor Axonal Neuropathy - AMAN)',
      clinicalTeachingPearl: 'Neuromuscular emergencies: Guillain-Barré causes rapid ascending paralysis; vital capacity and negative inspiratory force must be monitored continuously to prevent respiratory arrest.',
      monumentTribute: 'Alexander the Great created the largest empire of the ancient world by age 30, spreading Hellenistic science, medicine, and architecture across three continents.'
    },

    {
      id: 'caesar',
      patientMockId: 'p001',
      luminaryName: 'Julius Caesar',
      blindedCaseTitle: 'Patient Beta: 55y Roman General & Statesman (Hispania, 45 BC)',
      blindedSpecialty: 'Late-Onset Episodic Syncope, Focal Seizures & Cerebrovascular Ischemia',
      lifeSpan: '100 BC – 44 BC',
      civilizationEra: 'Classical',
      civilizationEmpire: 'Roman Republic / Empire',
      fieldOfPioneering: 'Dictator Perpetuo of Rome, General, Statesman & Author of the Gallic Wars',
      avatarEmoji: '🏛️',
      quote: 'Veni, vidi, vici. (I came, I saw, I conquered.)',
      historicalContext: 'Transformed the Roman Republic into an Empire. Plagued late in life by sudden drop attacks, limb numbness, severe migraines, and dizziness (*morbus comitialis*) during the African and Spanish civil war campaigns.',
      healthQuestNarrative: 'While campaigning at Thapsus (46 BC) and Cordoba (45 BC), Caesar suffered sudden collapse episodes where he experienced vertigo, limb jerking, and disorientation. Long believed to be classic grand mal epilepsy, modern neurological reviews indicate he likely suffered from microvascular Transient Ischemic Attacks (TIAs) secondary to atherosclerotic cardiovascular disease or temporal lobe focal seizures.',
      physicalHardships: [
        'Sudden, unpredictable drop attacks and syncopal collapses on battlefield command lines.',
        'Crushing occipital migraines, visual auras, and transient sensory numbness in his extremities.',
        'Severe chronic insomnia and extreme physical exhaustion during grueling military marches.'
      ],
      societalAndPersonalHardships: [
        'Constant threat of assassination from Senate political rivals and Pompeian loyalists.',
        'Desperate need to conceal his physical vulnerability and drop attacks to maintain legionary authority.',
        'The immense psychological burden of reforming the entire calendar, legal system, and grain subsidies of Rome.'
      ],
      resilienceTriumph: 'Despite frequent syncopal collapses, he drafted the Julian Calendar, conquered Gaul, unified Roman law, and wrote masterclass military commentaries that survived two millennia.',
      clues: [
        {
          round: 1,
          phaseTitle: 'Suetonius & Plutarch Historical Chronicles (Thapsus, 46 BC)',
          sourceDate: 'North Africa Campaign',
          excerpt: 'Before engaging the Pompeian lines, felt a sudden tremor in his feet, cold numbness ascending his limbs, and was carried from the field dizzy and trembling.',
          clinicalSign: 'Focal neurological aura & transient ischemic drop attack'
        },
        {
          round: 2,
          phaseTitle: 'Battle of Cordoba Clinical Notes (45 BC)',
          sourceDate: 'Hispania Campaign',
          excerpt: 'Recurring episodes characterized by sudden vertigo, temporal headache, and transient memory lapses without severe tongue biting or post-ictal incontinence.',
          clinicalSign: 'Transient Ischemic Attacks (TIAs) / Focal Temporal Lobe Seizures'
        },
        {
          round: 3,
          phaseTitle: 'Modern Vascular Neurology Review (Dr. Galassi & Dr. Ashrafian, 2015)',
          sourceDate: 'Journal of the Neurological Sciences',
          excerpt: 'Caesar’s late-onset symptoms (beginning after age 50) and lack of cognitive decline point to cardiovascular cerebrovascular disease and micro-infarcts rather than congenital epilepsy.',
          clinicalSign: 'Cerebrovascular Microvascular Disease / Transient Ischemic Attacks'
        }
      ],
      options: [
        {
          id: 'opt_caesar_tia',
          diagnosisName: 'Microvascular Transient Ischemic Attacks (TIAs) & Cerebrovascular Disease',
          isHistoricallyAccepted: true,
          scientificRationale: 'Late-onset neurological attacks beginning after age 50, absence of severe post-ictal sleep or mental decay, family history of sudden vascular death.',
          bayesianPlausibility: 93
        },
        {
          id: 'opt_caesar_epilepsy',
          diagnosisName: 'Idiopathic Generalized Epilepsy (Grand Mal)',
          isHistoricallyAccepted: false,
          scientificRationale: 'Classic epilepsy manifests in childhood or adolescence; Caesar’s first documented attacks occurred at age 52 during severe stress.',
          bayesianPlausibility: 40
        },
        {
          id: 'opt_caesar_meningioma',
          diagnosisName: 'Parasagittal Cranial Meningioma',
          isHistoricallyAccepted: false,
          scientificRationale: 'Meningiomas cause progressive, permanent neurological deficits and papilledema; Caesar’s symptoms resolved rapidly between episodes.',
          bayesianPlausibility: 25
        },
        {
          id: 'opt_caesar_hypo',
          diagnosisName: 'Severe Hypoglycemia & Starvation Ketosis',
          isHistoricallyAccepted: false,
          scientificRationale: 'Does not explain unilateral sensory numbness and recurring focal neurological aura.',
          bayesianPlausibility: 15
        }
      ],
      correctOptionHash: 'b33978833d395201bab06e8acf5712bdd5c4885efcc06adbe4e1970e9214113a',
      confirmedHistoricalDiagnosis: 'Microvascular Transient Ischemic Attacks (TIAs) & Late-Onset Focal Seizures',
      clinicalTeachingPearl: 'Cerebrovascular risk in late-onset seizures: Any seizure or drop attack presenting after age 50 must be evaluated for underlying carotid/cerebral vascular atherosclerosis.',
      monumentTribute: 'Julius Caesar laid the architectural and legal foundations of the Roman Empire, and his Julian Calendar remains the structural ancestor of our global 365-day year.'
    },

    {
      id: 'lincoln',
      patientMockId: 'p001',
      luminaryName: 'Abraham Lincoln',
      blindedCaseTitle: 'Patient Gamma: 52y Statesman (Washington D.C., 1861)',
      blindedSpecialty: 'Marfanoid Habitus, Refractory Melancholia & Heavy Metal Toxicity',
      lifeSpan: '1809 – 1865',
      civilizationEra: 'Industrial',
      civilizationEmpire: 'United States of America',
      fieldOfPioneering: '16th President of the United States, Emancipator & Preserver of the Union',
      avatarEmoji: '🎩',
      quote: 'With malice toward none, with charity for all, with firmness in the right, as God gives us to see the right.',
      historicalContext: 'Steered the nation through the bloodiest war in American history. Exhibited a distinctive 6’4” marfanoid habitus, severe melancholia, chronic constipation, and tremors from mercury-laden "Blue Mass" pills.',
      healthQuestNarrative: 'Lincoln possessed disproportionately long limbs, spider-like fingers (arachnodactyly), a sunken chest (pectus excavatum), and chronic musculoskeletal pain. Suffering from profound clinical depression (termed "hypochondriasis"), he took daily Blue Mass mercury pills, which induced iatrogenic mercurial poisoning—causing motor tremors, insomnia, and mood swings—before he bravely discontinued them in 1861.',
      physicalHardships: [
        'Severe chronic joint hypermobility, flat feet, and Marfanoid/MEN2B musculoskeletal skeletal strain.',
        'Intractable constipation and abdominal cramping from 19th-century heavy metal medicines.',
        'Iatrogenic mercury neurotoxicity (tremors, sleep disruption, emotional lability) from Blue Mass.'
      ],
      societalAndPersonalHardships: [
        'Devastating bereavement: Lost his mother at age 9, sister Sarah, first love Ann Rutledge, and sons Eddie and Willie while in the White House.',
        'Navigating the cataclysm of the American Civil War and 600,000 casualties with unrelenting public hostility.',
        'Managing the fragile mental health and grief of his wife Mary Todd Lincoln.'
      ],
      resilienceTriumph: 'Maintained profound moral clarity, issuing the Emancipation Proclamation and delivering the Gettysburg Address while enduring severe chronic depression and physical pain.',
      clues: [
        {
          round: 1,
          phaseTitle: 'Physician Notes & Physical Habitus (Dr. Robert Stone, 1861)',
          sourceDate: 'White House, Washington D.C.',
          excerpt: 'Stands 6 feet 4 inches, high-arched palate, pectus excavatum, arachnodactyly, cold extremities, and severe bilateral joint laxity.',
          clinicalSign: 'Connective tissue mutation / Marfanoid phenotype'
        },
        {
          round: 2,
          phaseTitle: 'Medication Logs & Behavioral Observations (1850s–1861)',
          sourceDate: 'Springfield, Illinois',
          excerpt: 'Consumed 3 Blue Mass pills daily (each containing 65mg elemental mercury) for depression and sluggish bowels, developing fine tremors and agitation until self-stopping.',
          clinicalSign: 'Iatrogenic Mercurialism (Hydrargyria)'
        },
        {
          round: 3,
          phaseTitle: 'Modern Genetic & Physical Retrospective (Dr. John Sotos, 2008)',
          sourceDate: 'The Physical Lincoln / Genetic Medicine',
          excerpt: 'Multiple Endocrine Neoplasia Type 2B (MEN2B) or Marfan Syndrome (FBN1 fibrillin mutation) coupled with severe Major Depressive Disorder and chronic heavy metal exposure.',
          clinicalSign: 'Marfan Syndrome / MEN2B + Major Depressive Disorder'
        }
      ],
      options: [
        {
          id: 'opt_linc_marfan',
          diagnosisName: 'Marfan Syndrome / MEN2B + Major Depressive Disorder & Iatrogenic Mercurialism',
          isHistoricallyAccepted: true,
          scientificRationale: 'Arachnodactyly, pectus excavatum, joint laxity, severe melancholia, and toxic mercury doses in Blue Mass pills.',
          bayesianPlausibility: 96
        },
        {
          id: 'opt_linc_neurosyphilis',
          diagnosisName: 'Tertiary Neurosyphilis (Tabes Dorsalis)',
          isHistoricallyAccepted: false,
          scientificRationale: 'Completely disproven; Lincoln showed zero Argyll Robertson pupils, dementia, or sensory ataxia, retaining masterclass cognitive oratory until death.',
          bayesianPlausibility: 12
        },
        {
          id: 'opt_linc_als',
          diagnosisName: 'Amyotrophic Lateral Sclerosis (ALS)',
          isHistoricallyAccepted: false,
          scientificRationale: 'Lincoln never experienced upper or lower motor neuron fasciculations or progressive muscular atrophy over his 56 years.',
          bayesianPlausibility: 8
        },
        {
          id: 'opt_linc_graves',
          diagnosisName: 'Severe Graves’ Thyrotoxicosis',
          isHistoricallyAccepted: false,
          scientificRationale: 'Thyrotoxicosis does not explain lifelong arachnodactyly, sunken chest, or response to mercury cessation.',
          bayesianPlausibility: 14
        }
      ],
      correctOptionHash: '3573639d8156fbb95b1d75e35ec556b0950d25e817fe96b2b1580e813a0739ee',
      confirmedHistoricalDiagnosis: 'Marfanoid Connective Tissue Disorder (FBN1 / MEN2B) + Major Depressive Disorder & Iatrogenic Mercurialism',
      clinicalTeachingPearl: 'Historical pharmacovigilance: Heavy metal compounds (mercury, arsenic) routinely exacerbated underlying medical conditions; always evaluate historical medication toxicity.',
      monumentTribute: 'Abraham Lincoln preserved the United States and abolished slavery, demonstrating that physical suffering and clinical depression do not preclude immortal greatness.'
    },
    {
      id: 'curie',
      patientMockId: 'p_marie_curie',
      luminaryName: 'Marie Skłodowska Curie',
      blindedCaseTitle: 'Patient Delta: 66y Laboratory Physicist (Paris / Haute-Savoie, 1934)',
      blindedSpecialty: 'Occupational Radioactivity, Pancytopenia & Marrow Aplasia',
      lifeSpan: '1867 – 1934',
      fieldOfPioneering: 'Pioneer of Radioactivity, 2x Nobel Laureate (Physics & Chemistry)',
      avatarEmoji: '⚗️',
      quote: 'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.',
      historicalContext: 'Carried test tubes of radium-226 and polonium in her lab coat pockets and operated mobile X-ray radiography units ("Petites Curies") on World War I front lines.',
      healthQuestNarrative: 'Marie Curie worked for years in a drafty, unheated wooden shed, stirring boiling cauldrons of pitchblende ore with an iron rod as heavy as herself. Unaware of ionizing radiation hazards, she suffered from chronic radiation dermatitis with cracked, bleeding fingertips, severe bilateral cataracts, and profound fatigue, culminating in aplastic bone marrow failure at age 66.',
      physicalHardships: [
        'Raw, hyperkeratotic fissures and burns on hands from carrying radioactive test tubes in pockets.',
        'Early radiation-induced cataracts severely impairing her eyesight in later years.',
        'Profound aplastic anemia, extreme exhaustion, and chronic bone marrow suppression.'
      ],
      societalAndPersonalHardships: [
        'Tragic loss of her husband Pierre Curie in a 1906 carriage accident, leaving her a widowed mother of two at age 38.',
        'Vicious xenophobic press smear campaigns in Paris questioning her Polish heritage.',
        'Denied election to the French Academy of Sciences in 1911 solely because of her gender.'
      ],
      resilienceTriumph: 'Personally outfitted and drove 20 mobile radiological vehicles ("Petites Curies") and installed 200 field X-ray units in WWI front-line triage stations, saving over one million wounded soldiers from needless amputations.',
      clues: [
        {
          round: 1,
          phaseTitle: 'Laboratory Journal (1912)',
          sourceDate: 'Paris, France',
          excerpt: 'Suffering from profound exhaustion, burning sensation on fingertips with cracked hyperkeratotic fissures, and recurring low-grade fevers.',
          clinicalSign: 'Radiation dermatitis & peripheral marrow fatigue'
        },
        {
          round: 2,
          phaseTitle: 'Clinical Exam & Hematology (1934)',
          sourceDate: 'Sancellemoz Sanatorium',
          excerpt: 'Severe pancytopenia, refractory normochromic anemia, profound leukopenia, and petechial purpura without splenomegaly.',
          clinicalSign: 'Profound bone marrow aplasia'
        },
        {
          round: 3,
          phaseTitle: 'Autopsy & Historical Retrospective',
          sourceDate: 'Haute-Savoie, 1934',
          excerpt: 'Bone marrow biopsy reveals absence of hematopoietic precursors, replaced by adipose tissue. No malignant leukemic blast infiltration.',
          clinicalSign: 'Aplastic Anemia secondary to cumulative ionizing gamma radiation'
        }
      ],
      options: [
        {
          id: 'opt_curie_aplastic',
          diagnosisName: 'Aplastic Anemia (Radiation-Induced Bone Marrow Aplasia)',
          isHistoricallyAccepted: true,
          scientificRationale: 'Cumulative ionizing radiation caused double-strand DNA breaks in pluripotent hematopoietic stem cells without leukemic clonal expansion.',
          bayesianPlausibility: 96
        },
        {
          id: 'opt_curie_aml',
          diagnosisName: 'Acute Myeloid Leukemia (AML)',
          isHistoricallyAccepted: false,
          scientificRationale: 'While common in acute radiation exposure, Curie’s autopsy and sanatorium blood films showed hypo-cellular aplasia rather than blast proliferation.',
          bayesianPlausibility: 42
        },
        {
          id: 'opt_curie_tb',
          diagnosisName: 'Miliary Tuberculosis',
          isHistoricallyAccepted: false,
          scientificRationale: 'Sancellemoz was a TB sanatorium, but chest radiography ruled out cavitary or granulomatous pulmonary lesions.',
          bayesianPlausibility: 15
        },
        {
          id: 'opt_curie_pernicious',
          diagnosisName: 'Autoimmune Pernicious Anemia',
          isHistoricallyAccepted: false,
          scientificRationale: 'Does not explain severe radiation dermatitis, leukopenia, and failure to respond to early liver extract therapy.',
          bayesianPlausibility: 10
        }
      ],
      correctOptionHash: '9258d1543a92d31d765c662efb96ef4989c40fed1a164794ea1e7f2cc6c77191',
      confirmedHistoricalDiagnosis: 'Aplastic Anemia (Secondary to Unshielded Ionizing Radiation Exposure)',
      clinicalTeachingPearl: 'Occupational radiation safety: Ionizing radiation damages radiosensitive bone marrow progenitor cells; complete blood count monitoring is mandatory in radiopharmaceutical handling.',
      monumentTribute: 'Marie Curie remains the only person to receive Nobel Prizes in two distinct scientific fields. Her discovery of Radium and Polonium laid the foundation of modern oncology.'
    },

    {
      id: 'darwin',
      patientMockId: 'p_charles_darwin',
      luminaryName: 'Charles Robert Darwin',
      blindedCaseTitle: 'Patient Epsilon: 41y Naturalist & Global Explorer (Kent, 1850)',
      blindedSpecialty: 'Vector-Borne Visceral Dysautonomia & Gastrointestinal Colic',
      lifeSpan: '1809 – 1882',
      fieldOfPioneering: 'Naturalist & Evolutionary Biologist (On the Origin of Species)',
      avatarEmoji: '🐢',
      quote: 'It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.',
      historicalContext: 'Following his 5-year voyage on HMS Beagle (1831–1836), Darwin suffered for over 40 years from debilitating episodic vomiting, palpitations, extreme fatigue, and eczema.',
      healthQuestNarrative: 'After contracting Trypanosoma cruzi from a Vinchuca bug bite in Argentina, Darwin lived in constant physical distress. For 40 years at Down House, his working day was restricted to just two or three 45-minute writing sessions between bouts of violent vomiting, stomach spasms, and dizziness.',
      physicalHardships: [
        'Over 40 years of daily post-prandial vomiting, severe gastrointestinal colic, and acid reflux.',
        'Debilitating palpitations, cold tremulousness, and chronic weeping eczema across his face and hands.',
        'Extremes of vertigo and motion sensitivity that confined him to his quiet home in Kent.'
      ],
      societalAndPersonalHardships: [
        'The crushing grief of losing his beloved 10-year-old daughter Annie in 1851, which broke his heart.',
        'Terror that his revolutionary theory of evolution would scandalize his deeply religious wife Emma and Victorian society.',
        'Withheld publication of On the Origin of Species for two decades out of agonizing anxiety and peer fear.'
      ],
      resilienceTriumph: 'Despite unrelenting nausea and physical collapse, he meticulously conducted thousands of experiments on barnacles, earthworms, and pigeons, authoring the masterwork that redefined biological science.',
      clues: [
        {
          round: 1,
          phaseTitle: 'Voyage Journal (March 1835)',
          sourceDate: 'Mendoza, Argentina',
          excerpt: 'Bitten on the hand by the Great Black Bug of the Pampas (Benchuca / Vinchuca / Triatoma infestans). Experienced heavy local swelling and fever.',
          clinicalSign: 'Vector exposure for Trypanosoma cruzi transmission'
        },
        {
          round: 2,
          phaseTitle: 'Down House Diary (1845–1860)',
          sourceDate: 'Kent, England',
          excerpt: 'Severe post-prandial flatulence, cyclical vomiting 2-3 hours after dairy meals, cardiac palpitations, tremulousness, and cold extremities.',
          clinicalSign: 'Autonomic dysautonomia, gastroparesis & food intolerance'
        },
        {
          round: 3,
          phaseTitle: 'Modern Retrospective Pathology (2000s)',
          sourceDate: 'Cambridge Medical History Review',
          excerpt: 'Chronic Chagas disease megaesophagus/megacolon coupled with adult-onset Lactose Intolerance and functional dyspepsia explained his lifelong symptoms.',
          clinicalSign: 'Chronic Chagas Disease (Trypanosomiasis) + Hypolactasia'
        }
      ],
      options: [
        {
          id: 'opt_darwin_chagas',
          diagnosisName: 'Chronic Chagas Disease (Trypanosoma cruzi) + Lactose Intolerance',
          isHistoricallyAccepted: true,
          scientificRationale: 'Documented Triatomine bug bite in Argentina, followed by progressive lifelong gastrointestinal dysmotility and cardiac palpitations.',
          bayesianPlausibility: 92
        },
        {
          id: 'opt_darwin_crohn',
          diagnosisName: 'Crohn’s Disease with Systemic Vasculitis',
          isHistoricallyAccepted: false,
          scientificRationale: 'Does not account for the absence of bloody diarrhea or bowel obstruction, nor his longevity to age 73 without modern surgical intervention.',
          bayesianPlausibility: 35
        },
        {
          id: 'opt_darwin_arsenic',
          diagnosisName: 'Chronic Arsenic Poisoning (Fowler’s Solution)',
          isHistoricallyAccepted: false,
          scientificRationale: 'Darwin took dilute Fowler’s solution, but his primary symptom complex began years before prescribed arsenic tonics.',
          bayesianPlausibility: 22
        },
        {
          id: 'opt_darwin_psych',
          diagnosisName: 'Pure Psychosomatic Agoraphobia / Panic Disorder',
          isHistoricallyAccepted: false,
          scientificRationale: 'Historical dismissals ignored the undeniable biophysical signs: eczema, severe orthostatic nausea, and vector exposure.',
          bayesianPlausibility: 18
        }
      ],
      correctOptionHash: 'aa5a231cd1d29aa19bad4f2685a8bb4718fc638348a342c87ed12cb4aa360c11',
      confirmedHistoricalDiagnosis: 'Chronic Chagas Disease (American Trypanosomiasis) with Secondary Lactose Intolerance',
      clinicalTeachingPearl: 'Travel & vector history: Travel exposures decades prior can manifest as late chronic visceral and cardiac dysautonomia.',
      monumentTribute: 'Charles Darwin unlocked the tree of life. Despite 40 years of daily physical suffering, he revolutionized human understanding of biodiversity and natural selection.'
    },

    {
      id: 'ramanujan',
      patientMockId: 'p_srinivasa_ramanujan',
      luminaryName: 'Srinivasa Ramanujan',
      blindedCaseTitle: 'Patient Zeta: 30y Theoretical Mathematician (Cambridge, 1918)',
      blindedSpecialty: 'Relapsing Hepatic Abscess, Wartime Malnutrition & Tropical Amoebiasis',
      lifeSpan: '1887 – 1920',
      fieldOfPioneering: 'Mathematical Genius (Number Theory, Infinite Series, Mock Theta Functions)',
      avatarEmoji: '♾️',
      quote: 'An equation for me has no meaning unless it expresses a thought of God.',
      historicalContext: 'Arrived at Trinity College, Cambridge in 1914. Fell gravely ill in 1917 amidst wartime rationing, strict vegetarianism, and harsh British winters.',
      healthQuestNarrative: 'Plunged into freezing Cambridge winters during World War I, Ramanujan cooked his own strictly vegetarian meals on a tiny coal stove due to orthodox religious vows. With wartime food shortages, he suffered extreme malnutrition, and an undiagnosed amoebic liver abscess caused relapsing fever spikes and emaciation, erroneously treated as refractory tuberculosis in English sanatoria.',
      physicalHardships: [
        'Relapsing, excruciating right upper quadrant liver abscess fevers reaching 104°F.',
        'Severe weight loss, emaciation, and gastric pain from wartime British rationing and nutrient deficiencies.',
        'Confinement to freezing sanitarium solariums in Matlock and Putney under mistaken TB quarantine.'
      ],
      societalAndPersonalHardships: [
        'Traveled 6,000 miles alone from Tamil Nadu, breaking Brahmin orthodox travel bans and facing caste ostracization.',
        'Severe cultural alienation, loneliness, and racial condescension in pre-WWI Cambridge academia.',
        'Deprived of fresh vegetables and Indian spices vital to his dietary health.'
      ],
      resilienceTriumph: 'While bedridden in drafty sanatoria with high fevers, he filled dozens of notebook pages with modular functions, mock theta functions, and partition formulas that pioneered 21st-century string theory.',
      clues: [
        {
          round: 1,
          phaseTitle: 'Madras Clinical Background (1906)',
          sourceDate: 'Madras (Chennai), India',
          excerpt: 'Severe bout of dysentery and prolonged fever at age 19 with localized right upper quadrant abdominal swelling.',
          clinicalSign: 'Intestinal amoebiasis with hepatic seeding'
        },
        {
          round: 2,
          phaseTitle: 'Cambridge Sanatorium Records (1918)',
          sourceDate: 'Matlock & Putney Sanatoria',
          excerpt: 'High fever spikes, severe emaciation, profound right hepatic tenderness, without persistent cough, hemoptysis, or sputum acid-fast bacilli.',
          clinicalSign: 'Hepatic amoebic abscess misdiagnosed as tuberculosis'
        },
        {
          round: 3,
          phaseTitle: 'Modern Medical Review by Dr. D.A.B. Young (1994)',
          sourceDate: 'Royal Society of Medicine',
          excerpt: 'Re-examination of medical logs confirmed Hepatic Amoebiasis (Entamoeba histolytica). With emetine available in 1918, he could have been cured if correctly diagnosed.',
          clinicalSign: 'Extraintestinal Amoebic Liver Abscess'
        }
      ],
      options: [
        {
          id: 'opt_ram_amoeba',
          diagnosisName: 'Hepatic Amoebiasis (Amoebic Liver Abscess, Entamoeba histolytica)',
          isHistoricallyAccepted: true,
          scientificRationale: 'Young (1994) re-analyzed case notes: two severe dysenteric episodes in Madras, right hypochondriac pain, absence of positive TB sputum.',
          bayesianPlausibility: 95
        },
        {
          id: 'opt_ram_tb',
          diagnosisName: 'Refractory Pulmonary & Renal Tuberculosis',
          isHistoricallyAccepted: false,
          scientificRationale: 'The contemporary 1918 diagnosis; however, repeatedly negative sputum smears and lack of pulmonary cavitation make it an erroneous attribution.',
          bayesianPlausibility: 38
        },
        {
          id: 'opt_ram_scurvy',
          diagnosisName: 'Advanced Scurvy & Beriberi Deficiency',
          isHistoricallyAccepted: false,
          scientificRationale: 'While malnourished from wartime shortages, nutritional deficiency does not explain recurrent right upper quadrant abscess fever spikes.',
          bayesianPlausibility: 25
        },
        {
          id: 'opt_ram_gastric',
          diagnosisName: 'Perforated Gastric Ulcer',
          isHistoricallyAccepted: false,
          scientificRationale: 'Does not match the multi-year relapsing fever and hepatic tenderness trajectory.',
          bayesianPlausibility: 12
        }
      ],
      correctOptionHash: '4828169b335c4b8f2240c04b3972e372e7a9791ea54412a3c740cf210d4e59c8',
      confirmedHistoricalDiagnosis: 'Hepatic Amoebiasis (Extraintestinal Amoebic Liver Abscess)',
      clinicalTeachingPearl: 'Diagnostic anchors & cognitive bias: In 1918 England, TB was the default assumption, blinding physicians to tropical infectious etiologies like amoebic abscesses.',
      monumentTribute: 'Srinivasa Ramanujan produced nearly 3,900 mathematical identities and modular equations. His notebooks continue to inspire string theory, black hole physics, and cryptography.'
    },

    {
      id: 'kahlo',
      patientMockId: 'p_frida_kahlo',
      luminaryName: 'Frida Kahlo',
      blindedCaseTitle: 'Patient Eta: 33y Mexican Artist & Polytrauma Survivor (Coyoacán, 1940)',
      blindedSpecialty: 'Refractory CRPS Type II Causalgia, Spinal Instability & Post-Polio',
      lifeSpan: '1907 – 1954',
      fieldOfPioneering: 'Surrealist Painter & Icon of Resilience and Human Identity',
      avatarEmoji: '🌺',
      quote: 'Feet, what do I need them for if I have wings to fly?',
      historicalContext: 'Survived childhood polio at age 6 and a catastrophic bus collision at age 18 where an iron handrail pierced her pelvis, fracturing her spine and collarbone in multiple places.',
      healthQuestNarrative: 'After an iron handrail impaled her pelvis at age 18, Frida Kahlo endured over 32 surgeries, bone grafts, and months entombed in rigid plaster and steel body casts. She suffered from chronic Complex Regional Pain Syndrome (CRPS) and burning nerve causalgia, eventually losing her right leg to gangrene, yet transformed her agony into radiant masterpieces of Mexican art.',
      physicalHardships: [
        'Over 32 major orthopedic and spinal surgeries with repeated bone grafts.',
        'Prolonged immobilization in suffocating full-body plaster, leather, and steel corsets.',
        'Refractory CRPS Type II burning nerve causalgia and below-knee amputation of right leg.'
      ],
      societalAndPersonalHardships: [
        'Lifelong physical disability following childhood polio that left her right leg permanently atrophied.',
        'Devastating inability to carry children to term due to severe pelvic fractures.',
        'Volatile, tumultuous marital and emotional tribulations with muralist Diego Rivera.'
      ],
      resilienceTriumph: 'Rigged a mirror to the canopy of her four-poster bed and had a custom easel built so she could paint while lying completely immobilized on her back, creating some of the most celebrated self-portraits in human history.',
      clues: [
        {
          round: 1,
          phaseTitle: 'Trauma Surgery Records (Mexico City, 1925)',
          sourceDate: 'Hospital Juárez',
          excerpt: 'Multiple fractures of the 3rd and 4th lumbar vertebrae, 3 pelvic fractures, 11 fractures in right foot, and dislocation of left shoulder.',
          clinicalSign: 'Severe polytrauma and spinal column instability'
        },
        {
          round: 2,
          phaseTitle: 'Diary & Surgical History (1930–1950)',
          sourceDate: 'Coyoacán & New York',
          excerpt: 'Over 30 surgeries, bone grafts, prolonged steel corsets, progressive allodynia, burning trophic skin changes, and intractable phantom limb pain.',
          clinicalSign: 'Complex Regional Pain Syndrome (CRPS Type II) & Post-Polio'
        },
        {
          round: 3,
          phaseTitle: 'Pain Medicine Retrospective',
          sourceDate: 'Journal of Pain & Symptom Management',
          excerpt: 'A classic triad of Post-Polio Syndrome, neuropathic CRPS from sacral plexus avulsion, and ischemic gangrene of the right toes.',
          clinicalSign: 'Refractory Neuropathic Pain & Post-Polio Syndrome'
        }
      ],
      options: [
        {
          id: 'opt_kahlo_crps',
          diagnosisName: 'Complex Regional Pain Syndrome (CRPS Type II) + Post-Polio Syndrome',
          isHistoricallyAccepted: true,
          scientificRationale: 'Severe nerve injury from pelvic impalement caused lifelong causalgia, temperature sensitivity, and trophic changes in her right lower extremity.',
          bayesianPlausibility: 94
        },
        {
          id: 'opt_kahlo_ra',
          diagnosisName: 'Seronegative Rheumatoid Arthritis',
          isHistoricallyAccepted: false,
          scientificRationale: 'Her joint pains were anatomically localized to trauma zones and right post-polio asymmetry rather than symmetrical synovitis.',
          bayesianPlausibility: 24
        },
        {
          id: 'opt_kahlo_fibro',
          diagnosisName: 'Primary Fibromyalgia Syndrome',
          isHistoricallyAccepted: false,
          scientificRationale: 'Fails to account for documented vertebral osteomyelitis, bone grafts, and structural pelvic asymmetry.',
          bayesianPlausibility: 20
        },
        {
          id: 'opt_kahlo_ms',
          diagnosisName: 'Multiple Sclerosis',
          isHistoricallyAccepted: false,
          scientificRationale: 'No demyelinating cranial nerve or visual deficits; sensory loss corresponded strictly to spinal/pelvic nerve distributions.',
          bayesianPlausibility: 8
        }
      ],
      correctOptionHash: 'b5585e9f142d237948f82821820a24187b9bde97e6691cee4af7a791d08d2624',
      confirmedHistoricalDiagnosis: 'Complex Regional Pain Syndrome (CRPS Type II) from Sacral Plexus Trauma & Post-Polio Syndrome',
      clinicalTeachingPearl: 'Multimodal pain management: Chronic post-traumatic nerve pain requires integrated neuropathic modulation, physical stabilization, and profound creative psychological catharsis.',
      monumentTribute: 'Frida Kahlo transformed extreme physical suffering into immortal masterworks of art, remaining a global symbol of artistic courage and resilience.'
    }
  ];

  readonly currentCaseIndex = signal<number>(0);
  readonly currentClueRound = signal<number>(1);
  readonly selectedOptionId = signal<string | null>(null);
  readonly isCaseResolved = signal<boolean>(false);
  readonly score = signal<number>(0);

  public getCurrentCase(): ILuminaryCase {
    return this.cases[this.currentCaseIndex()] || this.cases[0];
  }

  public getAllCases(): ILuminaryCase[] {
    return this.cases;
  }

  public advanceClue(): void {
    if (this.currentClueRound() < 3) {
      this.currentClueRound.update(r => r + 1);
    }
  }

  public submitDiagnosis(optionId: string): boolean {
    this.selectedOptionId.set(optionId);
    this.isCaseResolved.set(true);

    const currentCase = this.getCurrentCase();
    const chosenOption = currentCase.options.find(o => o.id === optionId);
    const isCorrect = chosenOption?.isHistoricallyAccepted ?? false;

    if (isCorrect) {
      // Award score based on clues used (Round 1 = 100, Round 2 = 75, Round 3 = 50)
      const points = 125 - (this.currentClueRound() * 25);
      this.score.update(s => s + points);
    }

    return isCorrect;
  }

  public nextCase(): void {
    this.currentCaseIndex.update(idx => (idx + 1) % this.cases.length);
    this.currentClueRound.set(1);
    this.selectedOptionId.set(null);
    this.isCaseResolved.set(false);
  }

  public resetGame(): void {
    this.currentCaseIndex.set(0);
    this.currentClueRound.set(1);
    this.selectedOptionId.set(null);
    this.isCaseResolved.set(false);
    this.score.set(0);
  }

  /**
   * Loads the current or specified luminary into the global PatientStateService
   */
  public loadLuminaryAsActivePatient(caseId?: string): boolean {
    const targetCase = caseId ? (this.cases.find(c => c.id === caseId) || this.getCurrentCase()) : this.getCurrentCase();
    const mockId = targetCase.patientMockId;

    if (this.patientState) {
      this.patientState.isDemoMode.set(true);
      const targetPatient = MOCK_PATIENTS.find(p => p.id === mockId) || MOCK_PATIENTS[0];
      if (targetPatient) {
        this.patientState.patientId.set(targetPatient.id);
        this.patientState.patientName.set(targetPatient.name);
        this.patientState.patientAge.set(targetPatient.age);
        this.patientState.patientGender.set(targetPatient.gender || 'Female');
        this.patientState.patientGoals.set(targetPatient.patientGoals || '');
        if (targetPatient.vitals) {
          this.patientState.vitals.set(targetPatient.vitals);
        }
        if (targetPatient.issues) {
          this.patientState.issues.set(targetPatient.issues);
        }
        if (targetPatient.history) {
          this.patientState.patientHistory.set(targetPatient.history as any);
        }
        return true;
      }
    }
    return false;
  }
}

