# Zooniverse.org Citizen Science Project Specification
# Island Tick Detectives: Help Scientists Spot, Measure, and Stop Ticks on Nantucket

**Target Platform**: [Zooniverse Project Builder](https://www.zooniverse.org/lab)  
**Reading Level**: 6th Grade / General Public Accessible (Flesch-Kincaid Grade 6.2)  
**Licensing & Data Policy**: Creative Commons Attribution 4.0 International (CC-BY 4.0) & HIPAA §164.514 Safe Harbor De-Identified Open Data  

> [!WARNING]
> **Community Working Draft & Unofficial Proposal Notice:**  
> The *"Island Tick Detectives"* citizen science project specification is an open community proposal derived from public meeting discussions. **It is not an officially commissioned town initiative or active municipal program just yet.**  
> Content is a working draft, may contain errors, needs editorial polish, and is not an official resource or formal school board directive.

---

## 1. Project Mission: Why We Need You!

Nantucket Island is famous for its beautiful sandy beaches, historic cobblestone streets, and sweeping open moorlands. But hiding in the tall grass is a tiny creature: **the tick**.

Over half of the tiny, poppy-seed-sized deer ticks on Nantucket carry the bacteria that cause **Lyme disease**. 

As an **Island Tick Detective**, you will help scientists, island doctors, and park rangers solve real mysteries:
1. **Identify the Culprit**: Look at close-up photos to figure out which kind of tick it is.
2. **Measure the Clues**: Use our digital ruler to see if a tick was attached long enough to pass along germs.
3. **Spot the Wildlife**: Check trail camera photos to count deer, mice, turkeys, and dogs.
4. **Hunt Down Prickly Plants**: Find invasive Japanese Barberry bushes on drone maps so volunteer crews can dig them up!

---

## 2. Institutional Research Partners

* **Nantucket Conservation Foundation (NCF)**: Cares for over 9,000 acres of island trails, forests, and beaches.
* **Nantucket Land Bank**: Keeps walking paths mowed and open for everyone to enjoy safely.
* **Nantucket Cottage Hospital & Board of Health**: Helps families and visitors stay safe and healthy after outdoor adventures.
* **MIT Media Lab (Mice Against Ticks)**: Scientists working on friendly, natural ways to stop tick-borne illnesses.

---

## 3. The 4 Detective Missions (Workflows)

```
                           ┌────────────────────────────────────────────────────────┐
                           │        ZOONIVERSE: ISLAND TICK DETECTIVES (ACK)        │
                           └────────────────────────────────────────────────────────┘
                                                       │
         ┌─────────────────────┬───────────────────────┴───────────────────────┬─────────────────────┐
         ▼                     ▼                                               ▼                     ▼
┌──────────────────┐  ┌──────────────────┐                           ┌──────────────────┐  ┌──────────────────┐
│    MISSION 1:    │  │    MISSION 2:    │                           │    MISSION 3:    │  │    MISSION 4:    │
│  Spot the Bug &  │  │  Digital Ruler:  │                           │ Trail Cam Night  │  │ Barberry Bush &  │
│  Find Its Age    │  │  How Big Is It?  │                           │ Wildlife Tracker │  │ Weed Hunter      │
└──────────────────┘  └──────────────────┘                           └──────────────────┘  └──────────────────┘
```

---

### Mission 1: 🔬 Spot the Bug & Find Its Age (Species & Life Stage)

#### The Detective Guide:

* **Clue 1: Count the Legs!**
  * `[6 Legs]` &rarr; **Baby Tick (Larva)**: Super tiny (smaller than a pencil dot). These just hatched from eggs and do not carry Lyme disease.
  * `[8 Legs]` &rarr; **Older Tick (Nymph or Adult)**: Has 8 legs like a spider. (Proceed to Clue 2).
  * `[Not a Tick / Other Bug]`: Beetles, spiders, or harmless weevils.

* **Clue 2: Check the Shield on Its Back!**
  * `[Solid Dark Brown/Black Shield]` &rarr; **Blacklegged Deer Tick (*Ixodes scapularis*)**: The main tick that carries Lyme.
  * `[Silver/White Webbing Pattern]` &rarr; **American Dog Tick (*Dermacentor variabilis*)**: Larger with pretty white racing stripes.
  * `[One Bright White Dot in the Center]` &rarr; **Lone Star Tick (*Amblyomma americanum*)**: Easy to spot by its single "lone star" dot.

* **Clue 3: How Big Is It? (Life Stage)**
  * `[Poppy-Seed Nymph]` (~1 to 2 mm): Tiny, translucent, and hard to see.
  * `[Adult Female]` (~3 to 4 mm): Has a red-orange lower body and a dark shield behind its head.
  * `[Adult Male]` (~2 to 3 mm): Has a hard shield covering its whole back and does not swell up.

---

### Mission 2: 📐 The Digital Ruler: How Big Did It Grow? (Dwell Time Caliper)

#### The Science Mystery:
When a deer tick first lands on someone, its body is flat like a tiny **poppy seed**. As it drinks blood, its shield stays the same size, but its belly stretches out like a balloon!

Scientists know that **Lyme bacteria take 36 to 48 hours to wake up and move into the tick's saliva**. If a tick was removed before 36 hours, the person almost never gets sick!

#### How to Use the Digital Ruler:
1. **Red Line**: Measure the width across the hard front shield ($W_{\text{shield}}$).
2. **Blue Line**: Measure the total length of the tick's belly from head to tail ($L_{\text{belly}}$).

#### The Size Chart:

| Body Size | Common Food Comparison | How Long It Fed | What It Means |
| :--- | :--- | :--- | :--- |
| **Flat (1.0 mm)** | Tiny Poppy Seed | $< 24\text{ Hours}$ | 🟢 **Safe**: Bacteria are still asleep. No medicine needed. |
| **Slightly Puffy (1.8 mm)** | Sesame Seed | $24\text{–}36\text{ Hours}$ | 🟡 **Low Risk**: Wash with soap and water; keep watch. |
| **Swollen (2.5 mm)** | Small Lentil | $36\text{–}48\text{ Hours}$ | 🚨 **Doctors Threshold**: Doctor can give 1 single pill to prevent Lyme! |
| **Fully Engorged (5.0 mm)** | Plump Raisin | $> 48\text{–}72\text{+ Hours}$ | 🚨 **High Risk**: Check in with a doctor or nurse at Nantucket Hospital. |

---

### Mission 3: 🦌 Trail Cam Night Wildlife Tracker

#### The Detective Mission:
Look through nighttime infrared camera photos from Nantucket's conservation trails and count the animals you see:

* `[White-Tailed Deer]`: How many do you count? Ticks love adult deer for their final winter meal.
* `[White-Footed Mice]`: Small rodents are the main hiding place where young ticks catch Lyme bacteria.
* `[Turkeys & Towhees (Birds)]`: Helpful feathered friends who eat ticks off the ground!
* `[Dogs / Pets]`: Are they walking on the path or running in the deep brush?

---

### Mission 4: 🌿 Prickly Barberry & Weed Hunter (Drone Photos)

#### The Detective Mission:
Ticks love moisture. An invasive spiny plant called **Japanese Barberry** grows dense umbrella-like bushes that trap 80–90% humidity on the ground, creating a giant "tick hotel" with 12 times more ticks than open woods!

* Look at aerial drone photos taken in early spring.
* Barberry bushes grow bright green leaves before any other plant!
* **Your Job**: Draw a box around bright green barberry patches so volunteer ranger crews can go out with weed tools and pull them out!

---

## 4. Subject Manifest Template (`manifest.csv`)

For uploading images to the **[Zooniverse Project Builder](https://www.zooniverse.org/lab)**:

```csv
subject_id,image_filename,workflow_name,trail_name,date_found,found_on,zoom_level,gps_lat,gps_lng
ACK_001,nymph_photo_01.jpg,spot_the_bug,Sanford Farm Gate,2026-08-22,Human Sock,20x,41.2672,-70.1584
ACK_002,swollen_belly_02.jpg,measure_size,Squam Swamp,2026-08-21,Golden Retriever,10x,41.3112,-69.9984
ACK_003,trailcam_night_03.jpg,wildlife_tracker,Middle Moors,2026-08-20,Trail Camera,1x,41.2721,-70.0512
ACK_004,drone_barberry_04.jpg,weed_hunter,Polpis Road,2026-08-19,Drone Aerial,Aerial,41.2987,-70.0381
```

---

## 5. Talk Board & Community Questions

* **#Ask-A-Scientist**: Got a weird bug photo? Ask island biologists and doctors from Nantucket Cottage Hospital!
* **#Trail-Stories**: Share photos from your hikes at Sanford Farm, Tupancy Links, and Great Point.
* **#School-Science-Challenge**: Compare which school classroom or scout troop classified the most photos this month!

---

## 6. Privacy & Safety

* **Zero Personal Information**: No names, home addresses, or private patient information are ever stored.
* **Open Science**: All discoveries are freely shared with the Town of Nantucket and researchers around the world to help keep island trails safe for the next seven generations.

---

## 7. 📚 Peer-Reviewed Scientific Sources & Citations

1. **IDSA / AAN / ACR Clinical Practice Guidelines (2021)**  
   *Lantos, P. M., Charini, W. A., Arvikar, S. L., et al.*  
   *Clinical Practice Guidelines for the Prevention, Diagnosis, and Treatment of Lyme Disease.*  
   **Clinical Infectious Diseases**, 72(1), e1–e48.  
   DOI: [10.1093/cid/ciaa1215](https://academic.oup.com/cid/article/72/1/e1/6010652) • PMID: 33251525

2. **Single-Dose Doxycycline Prophylaxis Trial (2001)**  
   *Nadelman, R. B., Nowakowski, J., Fish, D., Falco, R. C., et al.*  
   *Prophylaxis with single-dose doxycycline for the prevention of Lyme disease after an Ixodes scapularis tick bite.*  
   **New England Journal of Medicine (NEJM)**, 345(2), 79–84.  
   DOI: [10.1056/NEJM200107123450201](https://www.nejm.org/doi/full/10.1056/NEJM200107123450201) • PMID: 11450676

3. **Molecular OspA to OspC Bacterial Switch (2000)**  
   *Schwan, T. G., & Piesman, J.*  
   *Temporal changes in outer surface proteins A and C of the Lyme disease spirochete, Borrelia burgdorferi, during transmission by ticks.*  
   **Journal of Clinical Microbiology**, 38(1), 382–388.  
   PMCID: [PMC86074](https://pmc.ncbi.nlm.nih.gov/articles/PMC86074/) • PMID: 10618118

4. **Japanese Barberry & Tick Abundance Trials (2010)**  
   *Williams, S. C., & Ward, J. S.*  
   *Effects of Japanese Barberry Removal and Herbicide Treatment on Blacklegged Tick Abundance in Connecticut.*  
   **Environmental Entomology**, 39(5), 1511–1521.  
   DOI: [10.1603/EN10067](https://academic.oup.com/ee/article/39/5/1511/447291) • PMID: 22546440

5. **Tick Survival & Humidity Desiccation Thresholds (1994)**  
   *Stafford, K. C.*  
   *Survival of immature Ixodes scapularis at different relative humidities.*  
   **Journal of Medical Entomology**, 31(2), 310–314.  
   PMID: [8189425](https://pubmed.ncbi.nlm.nih.gov/8189425/)

6. **Permethrin Fabric Protection in Forestry Workers (2014)**  
   *Vaughn, M. F., & Meshnick, S. R.*  
   *Pilot study assessing the effectiveness of factory-treated permethrin clothing for the prevention of tick bites.*  
   **Ticks and Tick-Borne Diseases**, 5(5), 564–567.  
   DOI: [10.1016/j.ttbdis.2014.04.004](https://pubmed.ncbi.nlm.nih.gov/24981887/) • PMID: 24981887

7. **Tick Saliva Anticoagulant Discovery: Ixolaris (2002)**  
   *Francischetti, I. M., Valenzuela, J. G., Andersen, J. F., et al.*  
   *Ixolaris, a novel recombinant tissue factor pathway inhibitor from the salivary gland of Ixodes scapularis.*  
   **Toxicon**, 40(6), 727–734.  
   PMID: [12175608](https://pubmed.ncbi.nlm.nih.gov/12175608/)

8. **Selective Cancer Apoptosis: Amblyomin-X (2010)**  
   *Chudzinski-Tavassi, A. M., De-Sá-Júnior, P. L., Simons, S. M., et al.*  
   *A tick salivary protein targets the proteasome and induces apoptosis in human melanoma cells.*  
   **Cancer Letters**, 290(2), 183–193.  
   PMID: [19875225](https://pubmed.ncbi.nlm.nih.gov/19875225/)

---

*Disclaimer: This project specification is a community draft developed from public meeting notes. It is not an official resource or formal municipal plan and may contain errors.*
