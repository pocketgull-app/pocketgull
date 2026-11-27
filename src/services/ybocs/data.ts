import { SymptomItem, SymptomCategory, SeverityQuestion, IYbocsOutcomeValidation } from "./types";

/**
 * Symptom item IDs involving unwanted harm, violent, or taboo intrusive thoughts.
 * In OCD these are characteristically ego-dystonic: distress signals a clash with the
 * person's values, NOT character or intent.
 */
export const EGO_DYSTONIC_INTRUSIVE_IDS: ReadonlySet<number> = new Set([1, 2, 3, 6, 18, 19, 20, 21]);
export const HARM_CONCERN_IDS: ReadonlySet<number> = new Set([1, 2, 6]);

export const symptomCategories: SymptomCategory[] = [
  { id: "aggressive", name: "Aggressive Obsessions", isObsession: true },
  { id: "contamination", name: "Contamination Obsessions", isObsession: true },
  { id: "sexual", name: "Sexual Obsessions", isObsession: true },
  { id: "hoarding_obs", name: "Hoarding/Saving Obsessions", isObsession: true },
  { id: "religious", name: "Religious Obsessions", isObsession: true },
  { id: "symmetry", name: "Obsession with Need for Symmetry or Exactness", isObsession: true },
  { id: "misc_obs", name: "Miscellaneous Obsessions", isObsession: true },
  { id: "somatic", name: "Somatic Obsessions", isObsession: true },
  { id: "cleaning", name: "Cleaning/Washing Compulsions", isObsession: false },
  { id: "checking", name: "Checking Compulsions", isObsession: false },
  { id: "repeating", name: "Repeating Rituals", isObsession: false },
  { id: "counting", name: "Counting Compulsions", isObsession: false },
  { id: "ordering", name: "Ordering/Arranging Compulsions", isObsession: false },
  { id: "hoarding_comp", name: "Hoarding/Collecting Compulsions", isObsession: false },
  { id: "misc_comp", name: "Miscellaneous Compulsions", isObsession: false },
];

export const symptomItems: SymptomItem[] = [
  // Aggressive Obsessions
  {
    id: 1,
    category: "aggressive",
    isObsession: true,
    text: "I fear I might harm myself",
    examples: "Fear of eating with a knife or fork, fear of handling sharp objects, fear of walking near glass windows."
  },
  {
    id: 2,
    category: "aggressive",
    isObsession: true,
    text: "I fear I might harm other people",
    examples: "Fear of poisoning other people's food, fear of harming babies, fear of pushing someone in front of a train, fear of hurting someone's feelings, fear of being responsible by not providing assistance for some imagined catastrophe, fear of causing harm by giving bad advice."
  },
  {
    id: 3,
    category: "aggressive",
    isObsession: true,
    text: "I have violent or horrific images in my mind",
    examples: "Images of murder, dismembered bodies, or other disgusting scenes."
  },
  {
    id: 4,
    category: "aggressive",
    isObsession: true,
    text: "I fear I will blurt out obscenities",
    examples: "Fear of shouting obscenities in public situations like church or class, fear of writing obscenities."
  },
  {
    id: 5,
    category: "aggressive",
    isObsession: true,
    text: "I fear doing something embarrassing",
    examples: "Fear of appearing foolish in social situations."
  },
  {
    id: 6,
    category: "aggressive",
    isObsession: true,
    text: "I fear I will act on an unwanted impulse",
    examples: "Fear of driving a car into a tree, fear of running someone over, fear of stabbing a friend."
  },
  {
    id: 7,
    category: "aggressive",
    isObsession: true,
    text: "I fear I will steal things",
    examples: "Fear of 'cheating' a cashier, fear of shoplifting inexpensive items."
  },
  {
    id: 8,
    category: "aggressive",
    isObsession: true,
    text: "I fear that I'll harm others because I'm not careful enough",
    examples: "Fear of causing an accident without being aware of it (such as a hit-and-run accident)."
  },
  {
    id: 9,
    category: "aggressive",
    isObsession: true,
    text: "I fear I'll be responsible for something else terrible happening",
    examples: "Fear of causing a fire or burglary because of not being careful enough in checking the house before leaving."
  },

  // Contamination Obsessions
  {
    id: 10,
    category: "contamination",
    isObsession: true,
    text: "I am concerned or disgusted with bodily waste or secretions",
    examples: "Fear of contracting AIDS, cancer, or other diseases from public rest rooms; fear of your own saliva, urine, feces, semen, or vaginal secretions."
  },
  {
    id: 11,
    category: "contamination",
    isObsession: true,
    text: "I am concerned with dirt or germs",
    examples: "Fear of picking up germs from sitting in certain chairs, shaking hands, or touching door handles."
  },
  {
    id: 12,
    category: "contamination",
    isObsession: true,
    text: "I am excessively concerned with environmental contaminants",
    examples: "Fear of being contaminated by asbestos or radon, fear of radioactive substances, fear of things associated with towns containing toxic waste sites."
  },
  {
    id: 13,
    category: "contamination",
    isObsession: true,
    text: "I am excessively concerned with certain household cleansers",
    examples: "Fear of poisonous kitchen or bathroom cleansers, solvents, insect spray or turpentine."
  },
  {
    id: 14,
    category: "contamination",
    isObsession: true,
    text: "I am excessively concerned with animals",
    examples: "Fear of being contaminated by touching an insect, dog, cat, or other animal."
  },
  {
    id: 15,
    category: "contamination",
    isObsession: true,
    text: "I am bothered by sticky substances or residues",
    examples: "Fear of adhesive tape or other sticky substances that may trap contaminants."
  },
  {
    id: 16,
    category: "contamination",
    isObsession: true,
    text: "I am concerned that I will get ill because of contamination",
    examples: "Fear of getting ill as a direct result of being contaminated (beliefs vary about how long the disease will take to appear)."
  },
  {
    id: 17,
    category: "contamination",
    isObsession: true,
    text: "I am concerned that I will contaminate others",
    examples: "Fear of touching other people or preparing their food after you touch poisonous substances (like gasoline) or after you touch your own body."
  },

  // Sexual Obsessions
  {
    id: 18,
    category: "sexual",
    isObsession: true,
    text: "I have forbidden or perverse sexual thoughts, images, or impulses",
    examples: "Unwanted sexual thoughts about strangers, family, or friends."
  },
  {
    id: 19,
    category: "sexual",
    isObsession: true,
    text: "I have sexual obsessions that involve children or incest",
    examples: "Unwanted thoughts about sexually molesting either your own children or other children."
  },
  {
    id: 20,
    category: "sexual",
    isObsession: true,
    text: "I have obsessions about homosexuality",
    examples: "Worries like 'Am I a homosexual?' or 'What if I suddenly become gay?' when there is no basis for these thoughts."
  },
  {
    id: 21,
    category: "sexual",
    isObsession: true,
    text: "I have obsessions about aggressive sexual behavior toward other people",
    examples: "Unwanted images of violent sexual behavior toward adult strangers, friends, or family members."
  },

  // Hoarding/Saving Obsessions
  {
    id: 22,
    category: "hoarding_obs",
    isObsession: true,
    text: "I have obsessions about hoarding or saving things",
    examples: "Worries about throwing away seemingly unimportant things that you might need in the future, urges to pick up and collect useless things."
  },

  // Religious Obsessions
  {
    id: 23,
    category: "religious",
    isObsession: true,
    text: "I am concerned with sacrilege and blasphemy",
    examples: "Worries about having blasphemous thoughts, saying blasphemous things, or being punished for such things."
  },
  {
    id: 24,
    category: "religious",
    isObsession: true,
    text: "I am excessively concerned with morality",
    examples: "Worries about always doing 'the right thing,' having told a lie, or having cheated someone."
  },

  // Symmetry
  {
    id: 25,
    category: "symmetry",
    isObsession: true,
    text: "I have obsessions about symmetry or exactness",
    examples: "Worries about papers and books being properly aligned, worries about calculations or handwriting being perfect."
  },

  // Miscellaneous Obsessions
  {
    id: 26,
    category: "misc_obs",
    isObsession: true,
    text: "I feel that I need to know or remember certain things",
    examples: "Belief that you need to remember insignificant things like license plate numbers, the names of actors on television shows, old telephone numbers, bumper stickers or t-shirt slogans."
  },
  {
    id: 27,
    category: "misc_obs",
    isObsession: true,
    text: "I fear saying certain things",
    examples: "Fear of saying certain words (such as 'thirteen') because of superstitions, fear of saying something that might be disrespectful to a dead person, fear of using words with an apostrophe (because this denotes possession)."
  },
  {
    id: 28,
    category: "misc_obs",
    isObsession: true,
    text: "I fear not saying just the right thing",
    examples: "Fear of having said the wrong thing, fear of not using the 'perfect' word."
  },
  {
    id: 29,
    category: "misc_obs",
    isObsession: true,
    text: "I fear losing things",
    examples: "Worries about losing a wallet or other unimportant objects, like a scrap of note paper."
  },
  {
    id: 30,
    category: "misc_obs",
    isObsession: true,
    text: "I am bothered by intrusive (neutral) mental images",
    examples: "Random, unwanted images in your mind."
  },
  {
    id: 31,
    category: "misc_obs",
    isObsession: true,
    text: "I am bothered by intrusive mental nonsense sounds, words or music",
    examples: "Words, songs, or music in your mind that you can't stop."
  },
  {
    id: 32,
    category: "misc_obs",
    isObsession: true,
    text: "I am bothered by certain sounds or noises",
    examples: "Worries about the sounds of clocks ticking loudly or voices in another room that may interfere with sleeping."
  },
  {
    id: 33,
    category: "misc_obs",
    isObsession: true,
    text: "I have lucky and unlucky numbers",
    examples: "Worries about common numbers (like thirteen) that may cause you to perform activities a certain number of times or to postpone an action until a certain lucky hour of the day."
  },
  {
    id: 34,
    category: "misc_obs",
    isObsession: true,
    text: "Certain colors have special significance to me",
    examples: "Fear of using objects of certain colors (e.g. black may be associated with death, red with blood or injury)."
  },
  {
    id: 35,
    category: "misc_obs",
    isObsession: true,
    text: "I have superstitious fears",
    examples: "Fear of passing a cemetery, hearse, or black cat; fear of omens associated with death."
  },

  // Somatic Obsessions
  {
    id: 36,
    category: "somatic",
    isObsession: true,
    text: "I am concerned with illness or disease",
    examples: "Worries that you have an illness like cancer, heart disease or AIDS, despite reassurance from doctors that you do not."
  },
  {
    id: 37,
    category: "somatic",
    isObsession: true,
    text: "I am excessively concerned with a part of my body or an aspect of my appearance (dysmorphophobia)",
    examples: "Worries that your face, ears, nose, eyes, or another part of your body is hideous, ugly, despite reassurances to the contrary."
  },

  // Cleaning/Washing Compulsions
  {
    id: 38,
    category: "cleaning",
    isObsession: false,
    text: "I wash my hands excessively or in a ritualized way",
    examples: "Washing your hands many times a day or for long periods of time after touching, or thinking that you have touched, a contaminated object. This may include washing the entire length of your arms."
  },
  {
    id: 39,
    category: "cleaning",
    isObsession: false,
    text: "I have excessive or ritualized showering, bathing, tooth brushing, grooming, or toilet routines",
    examples: "Taking showers or baths or performing other bathroom routines that may last for several hours. If the sequence is interrupted, the entire process may have to be restarted."
  },
  {
    id: 40,
    category: "cleaning",
    isObsession: false,
    text: "I have compulsions that involve cleaning household items or other inanimate objects",
    examples: "Excessive cleaning of faucets, toilets, floors, kitchen counters, or kitchen utensils."
  },
  {
    id: 41,
    category: "cleaning",
    isObsession: false,
    text: "I do other things to prevent or remove contact with contaminants",
    examples: "Asking family members to handle or remove insecticides, garbage, gasoline cans, raw meat, paints, varnish, drugs in the medicine cabinet, or kitty litter. If you can't avoid these things, you may wear gloves to handle them, such as when using a self-service gas pump."
  },

  // Checking Compulsions
  {
    id: 42,
    category: "checking",
    isObsession: false,
    text: "I check that I did not harm others",
    examples: "Checking that you haven't hurt someone without knowing it. You may ask others for reassurance or call or text someone to make sure everything is all right."
  },
  {
    id: 43,
    category: "checking",
    isObsession: false,
    text: "I check that I did not harm myself",
    examples: "Looking for injuries or bleeding after handling sharp or breakable objects. You may frequently go to doctors to ask for reassurance that you haven't hurt yourself."
  },
  {
    id: 44,
    category: "checking",
    isObsession: false,
    text: "I check that nothing terrible happened",
    examples: "Searching the newspaper or listening to the radio or television for news about some catastrophe that you believe you caused. You may also ask people for reassurance that you didn't cause an accident."
  },
  {
    id: 45,
    category: "checking",
    isObsession: false,
    text: "I check that I did not make a mistake",
    examples: "Repeated checking of door locks, stoves, electrical outlets, before leaving home; repeated checking while reading, writing, or doing simple calculations to make sure that you didn't make a mistake (you can't be certain that you didn't)."
  },
  {
    id: 46,
    category: "checking",
    isObsession: false,
    text: "I check some aspect of my physical condition tied to my obsessions about my body",
    examples: "Seeking reassurance from friends or doctors that you aren't having a heart attack or getting cancer; repeatedly taking pulse, blood pressure, or temperature; checking your appearance in a mirror, looking for ugly features."
  },

  // Repeating Rituals
  {
    id: 47,
    category: "repeating",
    isObsession: false,
    text: "I reread or rewrite things",
    examples: "Taking hours to read a few pages in a book or to write a short letter because you get caught in a cycle of reading and rereading; worrying that you didn't understand something you just read; searching for a 'perfect' word or phrase; having obsessive thoughts about the shape of certain printed letters in a book."
  },
  {
    id: 48,
    category: "repeating",
    isObsession: false,
    text: "I need to repeat routine activities",
    examples: "Repeating activities like turning appliances on and off, combing your hair, going in and out of a doorway, or looking in a particular direction; not feeling comfortable unless you do these things the 'right' way or the 'right' number of times."
  },

  // Counting Compulsions
  {
    id: 49,
    category: "counting",
    isObsession: false,
    text: "I have counting compulsions",
    examples: "Counting objects like ceiling or floor tiles, books in a bookcase, nails in a wall, or even grains of sand on a beach; counting when you repeat certain activities, like washing."
  },

  // Ordering/Arranging Compulsions
  {
    id: 50,
    category: "ordering",
    isObsession: false,
    text: "I have ordering or arranging compulsions",
    examples: "Straightening paper and pens on a desktop or books in a bookcase, wasting hours arranging things in your house in 'order' and then becoming very upset if this order is disturbed."
  },

  // Hoarding/Collecting Compulsions
  {
    id: 51,
    category: "hoarding_comp",
    isObsession: false,
    text: "I have compulsions to hoard or collect things",
    examples: "Saving old newspapers, notes, cans, paper towels, wrappers and empty bottles for fear that if you throw them away you may need them; picking up useless objects from the street or from garbage cans."
  },

  // Miscellaneous Compulsions
  {
    id: 52,
    category: "misc_comp",
    isObsession: false,
    text: "I have mental rituals (other than checking/counting)",
    examples: "Performing rituals in your head, like saying prayers or thinking a 'good' thought to undo a 'bad' thought. These are different from obsessions, because you perform these rituals intentionally to reduce anxiety or feel better."
  },
  {
    id: 53,
    category: "misc_comp",
    isObsession: false,
    text: "I need to tell, ask, or confess",
    examples: "Asking other people to reassure you, confessing to wrong behaviors you never even did, believing that you have to tell other people certain words to feel better."
  },
  {
    id: 54,
    category: "misc_comp",
    isObsession: false,
    text: "I need to touch, tap, or rub things",
    examples: "Giving in to the urge to touch rough surfaces, like wood, or hot surfaces, like a stove top; giving in to the urge to lightly touch other people; believing you need to touch an object like a telephone to prevent an illness in your family."
  },
  {
    id: 55,
    category: "misc_comp",
    isObsession: false,
    text: "I take measures (other than checking) to prevent harm or terrible consequences to myself or family",
    examples: "Staying away from sharp or breakable objects, such as knives, scissors, and fragile glass."
  },
  {
    id: 56,
    category: "misc_comp",
    isObsession: false,
    text: "I have ritualized eating behaviors",
    examples: "Arranging your food, knife, and fork in a particular order before being able to eat, eating according to a strict ritual, not being able to eat until the hands of a clock point exactly at a certain time."
  },
  {
    id: 57,
    category: "misc_comp",
    isObsession: false,
    text: "I have superstitious behaviors",
    examples: "Not taking a bus or train if its number contains an 'unlucky' number (like thirteen), staying in your house on the thirteenth of the month, throwing away clothes you wore while passing a funeral home or cemetery."
  },
  {
    id: 58,
    category: "misc_comp",
    isObsession: false,
    text: "I pull my hair out (trichotillomania)",
    examples: "Pulling hair from your scalp, eyelids, eyelashes, or pubic areas, using your fingers or tweezers. You may produce bald spots that require you to wear a wig, or you may pluck your eyebrows or eyelids smooth."
  }
];

export const severityQuestions: SeverityQuestion[] = [
  // Obsessive Thoughts (Questions 1-5)
  {
    id: 1,
    title: "1. Time Occupied by Obsessive Thoughts",
    subtitle: "How much of your time was occupied by obsessive thoughts? How frequently did these thoughts occur?",
    isObsessionRelated: true,
    options: [
      { score: 0, label: "None", desc: "No obsessive thoughts." },
      { score: 1, label: "Mild (<1 hr/day)", desc: "Less than 1 hour per day, or occasional intrusions (occur no more than 8 times a day)." },
      { score: 2, label: "Moderate (1-3 hrs/day)", desc: "1-3 hours per day, or frequent intrusions (most hours of the day are free of obsessions)." },
      { score: 3, label: "Severe (3-8 hrs/day)", desc: "More than 3 hours and up to 8 hours per day, or very frequent intrusions." },
      { score: 4, label: "Extreme (>8 hrs/day)", desc: "More than 8 hours per day, or near-constant intrusions." }
    ]
  },
  {
    id: 2,
    title: "2. Interference Due to Obsessive Thoughts",
    subtitle: "How much did these thoughts interfere with your social or work functioning? Is there anything that you didn't do because of them?",
    isObsessionRelated: true,
    options: [
      { score: 0, label: "None", desc: "No interference." },
      { score: 1, label: "Mild", desc: "Mild, slight interference with social or occupational performance, but still performance not impaired." },
      { score: 2, label: "Moderate", desc: "Moderate, definitive interference with social or occupational performance, but still manageable." },
      { score: 3, label: "Severe", desc: "Severe interference, causes substantial impairment in social or occupational performance." },
      { score: 4, label: "Extreme", desc: "Extreme, incapacitating interference." }
    ]
  },
  {
    id: 3,
    title: "3. Distress Associated with Obsessive Thoughts",
    subtitle: "How much distress did your obsessive thoughts cause you?",
    isObsessionRelated: true,
    options: [
      { score: 0, label: "None", desc: "No distress." },
      { score: 1, label: "Mild", desc: "Mild, infrequent, and not too disturbing distress." },
      { score: 2, label: "Moderate", desc: "Moderate, frequent, and disturbing distress, but still manageable." },
      { score: 3, label: "Severe", desc: "Severe, very frequent, and very disturbing distress." },
      { score: 4, label: "Extreme", desc: "Extreme, near-constant, and disabling distress." }
    ]
  },
  {
    id: 4,
    title: "4. Resistance Against Obsessions",
    subtitle: "How much effort did you make to resist the obsessive thoughts? How often did you try to disregard or turn your attention away from those thoughts as they entered your mind?",
    isObsessionRelated: true,
    options: [
      { score: 0, label: "Always Resist", desc: "I made an effort to always resist (or the obsessions are so minimal that there is no need to actively resist them)." },
      { score: 1, label: "Most of the Time", desc: "I tried to resist most of the time (e.g. more than half the time I tried to resist)." },
      { score: 2, label: "Some Effort", desc: "I made some effort to resist." },
      { score: 3, label: "Rarely Resist", desc: "I allowed all obsessions to fill my mind without attempting to control them, but I did so with some reluctance." },
      { score: 4, label: "Completely Yielded", desc: "I completely and willingly gave in to all obsessions." }
    ]
  },
  {
    id: 5,
    title: "5. Degrees of Control Over Obsessive Thoughts",
    subtitle: "How much control did you have over your obsessive thoughts? How successful were you in stopping or diverting your obsessive thinking?",
    isObsessionRelated: true,
    options: [
      { score: 0, label: "Complete Control", desc: "Complete control." },
      { score: 1, label: "Much Control", desc: "Much control; usually I could stop or divert obsessions with some effort and concentration." },
      { score: 2, label: "Moderate Control", desc: "Moderate control; sometimes I could stop or divert obsessions." },
      { score: 3, label: "Little Control", desc: "Little control; I was rarely successful in stopping obsessions and could only divert attention with great difficulty." },
      { score: 4, label: "No Control", desc: "No control; I was rarely able to even momentarily ignore the obsessions." }
    ]
  },

  // Compulsive Behaviors (Questions 6-10)
  {
    id: 6,
    title: "6. Time Spent Performing Compulsive Behaviors",
    subtitle: "How much time did you spend performing compulsive behaviors? How frequently did you perform compulsions?",
    isObsessionRelated: false,
    options: [
      { score: 0, label: "None", desc: "No compulsive behaviors." },
      { score: 1, label: "Mild (<1 hr/day)", desc: "Less than 1 hour per day was spent performing compulsions, or occasional performance (no more than 8 times a day)." },
      { score: 2, label: "Moderate (1-3 hrs/day)", desc: "1-3 hours per day was spent performing compulsions, or frequent performance (most hours were free of compulsions)." },
      { score: 3, label: "Severe (3-8 hrs/day)", desc: "More than 3 hours and up to 8 hours per day were spent performing compulsions, or very frequent performance." },
      { score: 4, label: "Extreme (>8 hrs/day)", desc: "More than 8 hours were spent performing compulsions, or near-constant performance (hour rarely passes without several compulsions)." }
    ]
  },
  {
    id: 7,
    title: "7. Interference Due to Compulsive Behaviors",
    subtitle: "How much did your compulsive behaviors interfere with your social or work functioning?",
    isObsessionRelated: false,
    options: [
      { score: 0, label: "None", desc: "No interference." },
      { score: 1, label: "Mild", desc: "Mild, slight interference with social or occupational activities, but overall performance not impaired." },
      { score: 2, label: "Moderate", desc: "Moderate, definite interference with social or occupational performance, but still manageable." },
      { score: 3, label: "Severe", desc: "Severe interference, substantial impairment in social or occupational performance." },
      { score: 4, label: "Extreme", desc: "Extreme, incapacitating interference." }
    ]
  },
  {
    id: 8,
    title: "8. Distress Associated with Compulsive Behaviors",
    subtitle: "How would you have felt if prevented from performing your compulsions? How anxious would you have become?",
    isObsessionRelated: false,
    options: [
      { score: 0, label: "None", desc: "Not at all anxious." },
      { score: 1, label: "Mild Anxiety", desc: "Only slightly anxious if compulsions prevented." },
      { score: 2, label: "Moderate Anxiety", desc: "Anxiety would mount but remain manageable if compulsions prevented." },
      { score: 3, label: "Severe Distress", desc: "Prominent and very disturbing increase in anxiety if compulsions interrupted." },
      { score: 4, label: "Extreme Distress", desc: "Extreme, incapacitating anxiety from any intervention aimed at reducing the compulsions." }
    ]
  },
  {
    id: 9,
    title: "9. Resistance Against Compulsions",
    subtitle: "How much effort did you make to resist the compulsions? Or how often did you try to stop the compulsions?",
    isObsessionRelated: false,
    options: [
      { score: 0, label: "Always Resist", desc: "I made an effort to always resist (or the symptoms were so minimal that there was no need to actively resist them)." },
      { score: 1, label: "Most of the Time", desc: "I tried to resist most of the time (e.g. more than half the time)." },
      { score: 2, label: "Some Effort", desc: "I made some effort to resist." },
      { score: 3, label: "Rarely Resist", desc: "I yielded to almost all compulsions without attempting to control them, but I did so with some reluctance." },
      { score: 4, label: "Completely Yielded", desc: "I completely and willingly yielded to all compulsions." }
    ]
  },
  {
    id: 10,
    title: "10. Degrees of Control Over Compulsive Behaviors",
    subtitle: "How much control did you have over the compulsive behaviors? How successful were you in stopping the ritual(s)?",
    isObsessionRelated: false,
    options: [
      { score: 0, label: "Complete Control", desc: "I had complete control." },
      { score: 1, label: "Much Control", desc: "Usually I could stop compulsions or rituals with some effort and willpower." },
      { score: 2, label: "Moderate Control", desc: "Sometimes I could stop compulsive behaviors, but only with difficulty." },
      { score: 3, label: "Little Control", desc: "I could only delay the compulsive behaviors, but eventually they had to be carried out to completion." },
      { score: 4, label: "No Control", desc: "I was rarely able to even momentarily delay performing the compulsive behaviors." }
    ]
  },

  // General Insight (Question 11)
  {
    id: 11,
    title: "11. Insight",
    subtitle: "Do you think your obsessions or compulsions are reasonable or rational? Would there be anything besides anxiety to worry about if you resisted them? Do you think something would really happen?",
    isObsessionRelated: false,
    options: [
      { score: 0, label: "Excellent Insight", desc: "I think my obsessions or compulsions are unreasonable or excessive." },
      { score: 1, label: "Good/Fair Insight", desc: "I think my obsessions or compulsions are unreasonable or excessive, but I'm not completely convinced that they aren't necessary." },
      { score: 2, label: "Moderate Insight", desc: "I think my obsessions or compulsions may be unreasonable or excessive." },
      { score: 3, label: "Poor Insight", desc: "I mostly feel my obsessions or compulsions are reasonable or necessary." },
      { score: 4, label: "Absent Insight / Fixed Conviction", desc: "I feel completely convinced my obsessions or compulsions are reasonable, regardless of outside evidence." }
    ]
  }
];

export function getSeverityCategory(totalScore: number): { name: string; color: string; description: string } {
  if (totalScore <= 7) {
    return {
      name: "Subclinical",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800",
      description: "Symptoms are quiet or minimal right now and sit below the threshold for daily impairment."
    };
  } else if (totalScore <= 15) {
    return {
      name: "Mild OCD",
      color: "text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300 dark:bg-sky-950/40 dark:border-sky-800",
      description: "Symptoms are noticeable and may take under an hour to a couple of hours a day, with mild distress that remains manageable."
    };
  } else if (totalScore <= 23) {
    return {
      name: "Moderate OCD",
      color: "text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800",
      description: "Symptoms clearly interrupt daily, social, or work routines and demand steady mental energy to carry."
    };
  } else if (totalScore <= 31) {
    return {
      name: "Severe OCD",
      color: "text-orange-800 bg-orange-50 border-orange-300 dark:text-orange-300 dark:bg-orange-950/40 dark:border-orange-800",
      description: "Intrusive loops and rituals are occupying a heavy share of the day and creating substantial fatigue and disruption."
    };
  } else {
    return {
      name: "Extreme OCD",
      color: "text-rose-800 bg-rose-50 border-rose-300 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800",
      description: "Symptoms feel near-constant and exhausting, making everyday tasks very hard to carry alone."
    };
  }
}

export function getInsightExplanation(insightScore: number | null | undefined): string | null {
  if (insightScore === null || insightScore === undefined) return null;
  switch (insightScore) {
    case 0:
      return "Question 11 (Insight: Excellent) — You recognize these loops as excessive even when they feel loud. Knowing a thought is OCD noise is a strong anchor for Exposure & Response Prevention (ERP).";
    case 1:
      return "Question 11 (Insight: Good/Fair) — Part of you knows the loop is excessive while another part feels pulled by doubt. That tug-of-war is completely normal in OCD.";
    case 2:
      return "Question 11 (Insight: Moderate) — When anxiety spikes, OCD can make fears feel remarkably convincing. Naming the doubt with a clinician helps separate real risk from false alarm.";
    case 3:
      return "Question 11 (Insight: Poor) — Right now these worries feel very real and urgent. You deserve a patient, skilled clinician who listens without arguing or dismissing how intense this feels.";
    case 4:
      return "Question 11 (Insight: Fixed Conviction) — These thoughts feel completely undeniable right now. Sharing this honestly takes courage—a specialist trained in OCD care can help gently explore relief at your pace.";
    default:
      return null;
  }
}

export function getOutcomeValidation(params: {
  totalScore: number;
  obsessionSubtotal: number;
  compulsiveSubtotal: number;
  insightScore?: number | null;
  hasEgoDystonicChecked?: boolean;
  hasHarmConcernCurrent?: boolean;
  answeredCoreCount?: number;
}): IYbocsOutcomeValidation {
  const {
    totalScore,
    obsessionSubtotal,
    compulsiveSubtotal,
    insightScore = null,
    hasEgoDystonicChecked = false,
    hasHarmConcernCurrent = false,
    answeredCoreCount = 0
  } = params;

  const base = getSeverityCategory(totalScore);
  const insightNote = getInsightExplanation(insightScore);

  const egoDystonicReassurance = hasEgoDystonicChecked
    ? "You checked one or more unwanted intrusive-thought items (harm, violent, or taboo themes). In OCD, these thoughts are ego-dystonic—the horror, guilt, or disgust you feel is proof they go against your values, not proof of your character or intent."
    : null;

  let patternNote: string | null = null;
  if (answeredCoreCount >= 4 && totalScore >= 8) {
    if (obsessionSubtotal - compulsiveSubtotal >= 5) {
      patternNote = "Your ratings point mostly toward intrusive thoughts or mental loops (sometimes called 'Pure-O' or covert mental checking). Mental rituals are real effort too—you are not 'making it up.'";
    } else if (compulsiveSubtotal - obsessionSubtotal >= 5) {
      patternNote = "Your ratings show heavy time spent on physical or repetitive relief rituals. Compulsions bring brief relief while quietly keeping the alarm wired—gentle, paced ERP helps break that cycle.";
    }
  }

  if (totalScore <= 7) {
    return {
      tier: 'subclinical',
      severityName: base.name,
      badgeColor: base.color,
      cardBorder: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20',
      headline: answeredCoreCount === 0
        ? "Take this at your own pace — every answer stays private on your device"
        : "Your alarm system is relatively quiet right now",
      validationMessage: answeredCoreCount === 0
        ? "Checking in on intrusive thoughts or habits can feel vulnerable. You can rate as many or as few items as feel helpful today; this scale is an exploratory reflection tool, never a verdict."
        : "A low score today reflects real steadiness—and it doesn't erase how exhausting past spikes may have felt. Recording a calm baseline makes it much easier to notice early shifts later.",
      meaningInDailyLife: base.description,
      patternNote,
      insightNote,
      egoDystonicReassurance,
      showWarmSupportCard: hasHarmConcernCurrent,
      nextSteps: [
        { label: "Record Baseline", detail: "Save this calm snapshot so you can compare future check-ins over time.", intent: 'save' },
        { label: "Brief Somatic Reset", detail: "Try 60 seconds of 0.1 Hz paced breathing to reinforce nervous-system ease.", intent: 'grounding' },
        { label: "Copy Visit Prep Note", detail: "Keep a clean summary handy if you want to review past patterns with a clinician.", intent: 'visit_brief' }
      ]
    };
  }

  if (totalScore <= 15) {
    return {
      tier: 'mild',
      severityName: base.name,
      badgeColor: base.color,
      cardBorder: 'border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20',
      headline: "Noticing these loops early is a genuine strength",
      validationMessage: "Even 'mild' obsessive-compulsive loops quietly drain energy and focus. What you're experiencing is a specific, changeable threat-detection habit in the brain—not a personal flaw—and mild symptoms respond especially well to steady, early support.",
      meaningInDailyLife: base.description,
      patternNote,
      insightNote,
      egoDystonicReassurance,
      showWarmSupportCard: hasHarmConcernCurrent,
      nextSteps: [
        { label: "Calm the Alarm First", detail: "Use the 0.1 Hz Somatic Grounding Loop before trying to resist an urge.", intent: 'grounding' },
        { label: "Copy Visit Prep Brief", detail: "Bring a clear 30-second summary to a therapist or primary care clinician.", intent: 'visit_brief' },
        { label: "Record to Timeline", detail: "Save today's rating to track whether small daily shifts ease the load.", intent: 'save' }
      ]
    };
  }

  if (totalScore <= 23) {
    return {
      tier: 'moderate',
      severityName: base.name,
      badgeColor: base.color,
      cardBorder: 'border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20',
      headline: "Carrying this much mental noise every day is genuinely exhausting",
      validationMessage: "Spending hours each day wrestling with unwanted thoughts or rituals takes immense stamina. This is a well-understood neurological loop—not a lack of willpower—and evidence-based care like Exposure & Response Prevention (ERP) with an OCD-trained clinician has strong, measurable outcomes.",
      meaningInDailyLife: base.description,
      patternNote,
      insightNote,
      egoDystonicReassurance,
      showWarmSupportCard: hasHarmConcernCurrent,
      nextSteps: [
        { label: "Prepare Clinician Brief", detail: "Copy a structured summary of your scores and focus themes for an ERP/OCD consult.", intent: 'visit_brief' },
        { label: "Guided Somatic Grounding", detail: "Downshift acute anxiety spikes with paced 4s-in / 6s-out breathing.", intent: 'grounding' },
        { label: "Save Outcome Snapshot", detail: "Store this score in your FHIR timeline to measure treatment progress.", intent: 'save' }
      ]
    };
  }

  if (totalScore <= 31) {
    return {
      tier: 'severe',
      severityName: base.name,
      badgeColor: base.color,
      cardBorder: 'border-orange-300 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/25',
      headline: "You have been carrying a very heavy load — you don't have to white-knuckle this alone",
      validationMessage: "When intrusive loops consume this much of your waking hours, pure willpower isn't supposed to be enough. Reaching this score is not a failure; it is clear evidence that your nervous system deserves dedicated, specialized support (ERP and/or psychiatric evaluation).",
      meaningInDailyLife: base.description,
      patternNote,
      insightNote,
      egoDystonicReassurance,
      showWarmSupportCard: true,
      nextSteps: [
        { label: "Pause & Ground Right Now", detail: "Take two slow minutes in Somatic Grounding—no effort required beyond breathing.", intent: 'grounding' },
        { label: "Copy Specialist Visit Brief", detail: "Let this 1-page summary speak for you so you don't have to re-explain everything from scratch.", intent: 'visit_brief' },
        { label: "Save to FHIR Timeline", detail: "Preserve today's record cleanly for your care team.", intent: 'save' }
      ]
    };
  }

  return {
    tier: 'extreme',
    severityName: base.name,
    badgeColor: base.color,
    cardBorder: 'border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/25',
    headline: "It took real courage to complete this while hurting this much",
    validationMessage: "Living with near-constant intrusive distress is one of the heaviest invisible burdens a person can carry. You are not broken and you are not alone—intensive, specialized OCD treatment exists and helps people recover real breathing room even from extreme scores.",
    meaningInDailyLife: base.description,
    patternNote,
    insightNote,
    egoDystonicReassurance,
    showWarmSupportCard: true,
    nextSteps: [
      { label: "Immediate Somatic Grounding", detail: "Step out of the numbers and steady your breath for 60 seconds right now.", intent: 'grounding' },
      { label: "Copy Urgent Specialist Brief", detail: "Hand this structured summary directly to a clinician, urgent care, or trusted support person.", intent: 'visit_brief' },
      { label: "Save to FHIR Timeline", detail: "Keep an accurate, timestamped record ready for your care team.", intent: 'save' }
    ]
  };
}
