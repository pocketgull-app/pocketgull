import { ActuarialLongevityService } from '../src/services/actuarial-longevity.service';

describe('ActuarialLongevityService', () => {
  const service = new ActuarialLongevityService();

  it('should calculate biological age delta and projected QALY gains', () => {
    const vitals = { hr: '60', spO2: '99', bp: '118/76' };
    const profile = service.calculateActuarialProfile(vitals, 85, 50);

    expect(profile.biologicalAge).toBeDefined();
    expect(profile.projectedQalyGain).toBeGreaterThan(1.0);
    expect(profile.projectedLifespan).toBeGreaterThan(70.0);
  });

  it('should accurately return CDC 4-driver hazard reductions', () => {
    const profile = service.calculateActuarialProfile({}, 75, 40);
    expect(profile.hazardReductions.cardiovascular).toBe(0.62);
    expect(profile.hazardReductions.metabolic).toBe(0.55);
    expect(profile.hazardReductions.neurodegenerative).toBe(0.68);
    expect(profile.hazardReductions.oncological).toBe(0.74);
  });

  it('should resolve BLS SOC codes and output OSHA, SNOMED CT, TCM, Ayurvedic, and Arborist directives', () => {
    const truckProfile = service.getOccupationalProfile('53-3032');
    expect(truckProfile.professionTitle).toContain('Trucking');
    expect(truckProfile.snomedCode).toBe('713399009');
    expect(truckProfile.snomedDisplay).toContain('Whole body vibration');
    expect(truckProfile.oshaRiskLevel).toBe('High');
    expect(truckProfile.circadianDisruptionScore).toBeGreaterThan(8.0);
    expect(truckProfile.oshaMitigationDirectives.length).toBeGreaterThan(2);
    expect(truckProfile.therapeuticHobbies.some(h => h.includes('Gardening'))).toBe(true);
    expect(truckProfile.precisionOccupationalNutrition.some(n => n.includes('Cherry'))).toBe(true);
    expect(truckProfile.tcmOccupationalDirectives.some(t => t.includes('Four Gates'))).toBe(true);
    expect(truckProfile.ayurvedicOccupationalDirectives.some(a => a.includes('Agni'))).toBe(true);
    expect(truckProfile.arboristEcologicalDirectives.some(r => r.includes('Root'))).toBe(true);

    const nurseProfile = service.getOccupationalProfile('Registered Nurse');
    expect(nurseProfile.socCode).toBe('29-1141');
    expect(nurseProfile.snomedCode).toBe('423409001');
    expect(nurseProfile.allostaticBurnoutScore).toBe(9.0);
    expect(nurseProfile.tcmOccupationalDirectives.some(t => t.includes('Heart-Kidney'))).toBe(true);
    expect(nurseProfile.ayurvedicOccupationalDirectives.some(a => a.includes('Brahmi'))).toBe(true);
    expect(nurseProfile.vocalResonanceProtocol).toContain('Choral Glee Vagal Entrainment');

    const graphicDesigner = service.getOccupationalProfile('Graphic Designer');
    expect(graphicDesigner.socCode).toBe('27-1024');
    expect(graphicDesigner.therapeuticHobbies.some(h => h.includes('Pottery'))).toBe(true);

    const chefProfile = service.getOccupationalProfile('Executive Chef');
    expect(chefProfile.socCode).toBe('35-1011');
    expect(chefProfile.oshaMitigationDirectives.some(d => d.includes('Ventilation'))).toBe(true);

    const eventPlanner = service.getOccupationalProfile('Event Planner');
    expect(eventPlanner.socCode).toBe('13-1121');
    expect(eventPlanner.allostaticBurnoutScore).toBe(9.2);

    const librarian = service.getOccupationalProfile('Librarian');
    expect(librarian.socCode).toBe('25-4022');
    expect(librarian.precisionOccupationalNutrition.some(n => n.includes('Quercetin'))).toBe(true);

    const photographer = service.getOccupationalProfile('Photographer');
    expect(photographer.socCode).toBe('27-4021');
    expect(photographer.oshaMitigationDirectives.some(d => d.includes('Harness'))).toBe(true);

    const dataScientist = service.getOccupationalProfile('Data Scientist');
    expect(dataScientist.socCode).toBe('15-2051');
    expect(dataScientist.precisionOccupationalNutrition.some(n => n.includes('Alpha-GPC'))).toBe(true);

    const banker = service.getOccupationalProfile('Investment Banker');
    expect(banker.socCode).toBe('13-1031');
    expect(banker.allostaticBurnoutScore).toBe(9.0);

    const student = service.getOccupationalProfile('PhD Student');
    expect(student.socCode).toBe('25-0000-S');
    expect(student.therapeuticHobbies.some(h => h.includes('Basketball'))).toBe(true);

    const professor = service.getOccupationalProfile('University Professor');
    expect(professor.socCode).toBe('25-1099');
    expect(professor.oshaMitigationDirectives.some(d => d.includes('Acoustic'))).toBe(true);

    const travelNurse = service.getOccupationalProfile('Travel Nurse');
    expect(travelNurse.socCode).toBe('29-1141-T');
    expect(travelNurse.allostaticBurnoutScore).toBe(9.5);
    expect(travelNurse.precisionOccupationalNutrition.some(n => n.includes('Cherry'))).toBe(true);

    const doctorProfile = service.getOccupationalProfile('Orthopedic Surgeon');
    expect(doctorProfile.socCode).toBe('29-1215');
    expect(doctorProfile.therapeuticHobbies.some(h => h.includes('Sailing'))).toBe(true);

    const pilotProfile = service.getOccupationalProfile('Airline Pilot');
    expect(pilotProfile.socCode).toBe('53-2011');
    expect(pilotProfile.circadianDisruptionScore).toBe(9.8);
    expect(pilotProfile.precisionOccupationalNutrition.some(n => n.includes('Astaxanthin'))).toBe(true);

    const astronautProfile = service.getOccupationalProfile('NASA Astronaut');
    expect(astronautProfile.socCode).toBe('55-1011-ASTRO');
    expect(astronautProfile.snomedCode).toBe('410526002');
    expect(astronautProfile.oshaMitigationDirectives.some(d => d.includes('ARED'))).toBe(true);
    expect(astronautProfile.therapeuticHobbies.some(h => h.includes('Botany'))).toBe(true);

    const publicSafety = service.getOccupationalProfile('Police Officer');
    expect(publicSafety.socCode).toBe('33-3051');
    expect(publicSafety.vocalResonanceProtocol).toContain('Firehouse Choral Glee');

    const politician = service.getOccupationalProfile('Senator');
    expect(politician.socCode).toBe('11-1031');
    expect(politician.allostaticBurnoutScore).toBe(9.5);

    const musician = service.getOccupationalProfile('Concert Pianist');
    expect(musician.socCode).toBe('27-2042');
    expect(musician.vocalResonanceProtocol).toContain('Harmonic Choir Glee');

    const painter = service.getOccupationalProfile('Oil Painter');
    expect(painter.socCode).toBe('27-1013');
    expect(painter.oshaMitigationDirectives.some(d => d.toLowerCase().includes('solvent'))).toBe(true);

    const actor = service.getOccupationalProfile('Stage Actor');
    expect(actor.socCode).toBe('27-2011');
    expect(actor.vocalResonanceProtocol).toContain('Theatre Glee');

    const newsAnchor = service.getOccupationalProfile('News Media Anchor');
    expect(newsAnchor.socCode).toBe('27-3023');
    expect(newsAnchor.vocalResonanceProtocol).toContain('Newsroom Ensemble Glee');

    const innovator = service.getOccupationalProfile('R&D Founder');
    expect(innovator.socCode).toBe('11-1021-INN');
    expect(innovator.allostaticBurnoutScore).toBe(9.7);
    expect(innovator.vocalResonanceProtocol).toContain('Innovation Lab Choral');

    const retiree = service.getOccupationalProfile('Active Retired Senior');
    expect(retiree.socCode).toBe('99-9999-RET');
    expect(retiree.actuarialQalyImpact).toBe(4.5);
    expect(retiree.vocalResonanceProtocol).toContain('Intergenerational Glee');

    const careerPivot = service.getOccupationalProfile('Software Bootcamp Career Transition');
    expect(careerPivot.socCode).toBe('99-9999-PIV');
    expect(careerPivot.actuarialQalyImpact).toBe(2.2);
    expect(careerPivot.vocalResonanceProtocol).toContain('Transition Cohort Glee');

    const lawyer = service.getOccupationalProfile('Trial Attorney');
    expect(lawyer.socCode).toBe('23-1011');
    expect(lawyer.allostaticBurnoutScore).toBe(9.6);
    expect(lawyer.vocalResonanceProtocol).toContain('Bar Association Choral');

    const monarch = service.getOccupationalProfile('Queen Regent');
    expect(monarch.socCode).toBe('11-1011-ROYAL');
    expect(monarch.allostaticBurnoutScore).toBe(9.8);
    expect(monarch.vocalResonanceProtocol).toContain('Royal Chapel Choral');

    const princeProfile = service.getOccupationalProfile('Prince Royal Heir');
    expect(princeProfile.socCode).toBe('11-1011-ROYAL');

    const princessProfile = service.getOccupationalProfile('Princess Royal');
    expect(princessProfile.socCode).toBe('11-1011-ROYAL');

    const chiefProfile = service.getOccupationalProfile('Sovereign Tribal Chief');
    expect(chiefProfile.socCode).toBe('11-1011-CHIEF');
    expect(chiefProfile.vocalResonanceProtocol).toContain('Tribal Ensemble Glee');

    const babysitter = service.getOccupationalProfile('Weekend Babysitter');
    expect(babysitter.socCode).toBe('39-9011');
    expect(babysitter.vocalResonanceProtocol).toContain('Nursery Rhyme');

    const fastFood = service.getOccupationalProfile('Fast Food Worker');
    expect(fastFood.socCode).toBe('35-3023');
    expect(fastFood.precisionOccupationalNutrition.some(n => n.includes('Sulforaphane'))).toBe(true);

    const stocker = service.getOccupationalProfile('Grocery Store Stocker');
    expect(stocker.socCode).toBe('53-7065');
    expect(stocker.oshaMitigationDirectives.some(d => d.includes('Freezer'))).toBe(true);

    const pastor = service.getOccupationalProfile('Senior Pastor');
    expect(pastor.socCode).toBe('21-2011');
    expect(pastor.vocalResonanceProtocol).toContain('Monastic Gregorian Chant');

    const nun = service.getOccupationalProfile('Catholic Nun');
    expect(nun.socCode).toBe('21-2011');
    expect(nun.actuarialQalyImpact).toBe(1.5);

    const swimmer = service.getOccupationalProfile('Marathon Swimmer');
    expect(swimmer.socCode).toBe('27-2021-SWIM');
    expect(swimmer.category).toBe('Athletics & Professional Sports');
    expect(swimmer.vocalResonanceProtocol).toContain('Diaphragmatic Breath Glee');

    const cyclist = service.getOccupationalProfile('Road Cyclist');
    expect(cyclist.socCode).toBe('27-2021-BIKE');
    expect(cyclist.category).toBe('Athletics & Professional Sports');
    expect(cyclist.vocalResonanceProtocol).toContain('Peloton Cohort Glee');

    const runner = service.getOccupationalProfile('Ultramarathon Runner');
    expect(runner.socCode).toBe('27-2021-RUN');
    expect(runner.category).toBe('Athletics & Professional Sports');
    expect(runner.vocalResonanceProtocol).toContain('Finish-Line Choir Glee');

    const dancer = service.getOccupationalProfile('Prima Ballerina');
    expect(dancer.socCode).toBe('27-2031');
    expect(dancer.category).toBe('Arts, Media & Entertainment');
    expect(dancer.vocalResonanceProtocol).toContain('Dance Ensemble Breath');

    const architect = service.getOccupationalProfile('Building Architect');
    expect(architect.socCode).toBe('17-1011');
    expect(architect.category).toBe('Architecture & Engineering');
    expect(architect.vocalResonanceProtocol).toContain('Architectural Studio Choral');

    const engineer = service.getOccupationalProfile('Civil Structural Engineer');
    expect(engineer.socCode).toBe('17-2051');
    expect(engineer.category).toBe('Architecture & Engineering');
    expect(engineer.vocalResonanceProtocol).toContain('Field Engineering Crew');

    const polymath = service.getOccupationalProfile('Renaissance Scholar');
    expect(polymath.socCode).toBe('11-1021-POLY');
    expect(polymath.category).toBe('Life Stage & Career Transition');
    expect(polymath.vocalResonanceProtocol).toContain('Polyphonic Renaissance Choral');

    const gardener = service.getOccupationalProfile('Master Gardener');
    expect(gardener.socCode).toBe('37-3011');
    expect(gardener.category).toBe('Agriculture & Natural Resources');
    expect(gardener.vocalResonanceProtocol).toContain('Landscaper Outdoor Folk');

    const caretaker = service.getOccupationalProfile('Estate Caretaker');
    expect(caretaker.socCode).toBe('37-2011');
    expect(caretaker.category).toBe('Hospitality, Childcare & Service');

    const astro = service.getOccupationalProfile('Orbital Spaceflight Astronaut');
    expect(astro.socCode).toBe('55-1011-ASTRO');
    expect(astro.snomedCode).toBe('410526002');
    expect(astro.vocalResonanceProtocol).toContain('Zero-G Orbital Resonant');

    const aqua = service.getOccupationalProfile('Deep-Sea Saturation Aquanaut');
    expect(aqua.socCode).toBe('55-1011-AQUA');
    expect(aqua.snomedCode).toBe('412089004');
    expect(aqua.vocalResonanceProtocol).toContain('Heliox Acoustic Pitch Correction');

    const alpine = service.getOccupationalProfile('High-Altitude Alpine Sherpa');
    expect(alpine.socCode).toBe('27-2021-ALPINE');
    expect(alpine.snomedCode).toBe('417893002');
    expect(alpine.vocalResonanceProtocol).toContain('Hypobaric Diaphragmatic Breath Chant');

    const nuclear = service.getOccupationalProfile('Nuclear Reactor Operator');
    expect(nuclear.socCode).toBe('51-8011');
    expect(nuclear.snomedCode).toBe('412089004');
    expect(nuclear.vocalResonanceProtocol).toContain('Control Room Auditory De-escalation');
  });

  it('should dynamically adapt nutrition dosages based on patient vitals, hypoxia, and anticoagulant safety', () => {
    // 1. High HR & BP -> Upregulates Magnesium L-Threonate & L-Theanine
    const highHrProfile = service.getPersonalizedOccupationalProfile('Renaissance Scholar', { hr: '92', bp: '138/88' });
    expect(highHrProfile.precisionOccupationalNutrition.some(n => n.includes('Magnesium L-Threonate (144mg–200mg'))).toBe(true);
    expect(highHrProfile.precisionOccupationalNutrition.some(n => n.includes('L-Theanine'))).toBe(true);

    // 2. Low SpO2 -> Adds Beetroot Nitrate & Rhodiola Rosea
    const hypoxiaProfile = service.getPersonalizedOccupationalProfile('Alpine Mountaineer', { spO2: '92' });
    expect(hypoxiaProfile.precisionOccupationalNutrition.some(n => n.includes('Beetroot Extract'))).toBe(true);
    expect(hypoxiaProfile.precisionOccupationalNutrition.some(n => n.includes('Rhodiola Rosea'))).toBe(true);

    // 3. Anticoagulants -> Enforces Omega-3 safety cap
    const anticoagProfile = service.getPersonalizedOccupationalProfile('Renaissance Scholar', {}, ['Eliquis', 'Aspirin']);
    expect(anticoagProfile.precisionOccupationalNutrition.some(n => n.includes('Safety Guardrail: High-DHA Omega-3 capped'))).toBe(true);
  });

  it('should calculate Gompertz-Makeham survival probabilities and generate 5-year survival metrics', () => {
    const profile = service.calculateActuarialProfile({ hr: '62', spO2: '99' }, 85, 45, '27-2021-ALPINE');

    expect(profile.survivalProbability5Year).toBeDefined();
    expect(profile.survivalProbability5Year).toBeGreaterThan(0.9);
    expect(profile.survivalProbability5Year).toBeLessThanOrEqual(1.0);
    expect(profile.gompertzParams).toBeDefined();
    expect(profile.gompertzParams?.alpha).toBeGreaterThan(0);
  });

  it('should generate a multi-point longevity risk curve up to max age', () => {
    const curvePoints = service.generateLongevityRiskCurve(45, 85);
    expect(curvePoints.length).toBeGreaterThan(5);

    const firstPoint = curvePoints[0];
    expect(firstPoint.age).toBe(45);
    expect(firstPoint.personalizedSurvival).toBe(1.0);

    const lastPoint = curvePoints[curvePoints.length - 1];
    expect(lastPoint.age).toBe(85);
    expect(lastPoint.personalizedSurvival).toBeLessThan(firstPoint.personalizedSurvival);
    expect(lastPoint.hazardRate).toBeGreaterThan(0);
  });
});

