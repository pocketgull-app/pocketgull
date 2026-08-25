export interface IBodyInspectionZone {
  id: string;
  name: string;
  category: 'head_neck' | 'torso' | 'groin_legs' | 'feet';
  view: 'front' | 'back' | 'both';
  svgCoordinates: { x: number; y: number };
  icon: string;
  riskTier: 'Critical' | 'High' | 'Moderate';
  whyTicksLoveIt: string;
  inspectionTechnique: string;
  differentiationGuide: string;
  safeExtractionAngle: string;
}

export const BODY_INSPECTION_ZONES: IBodyInspectionZone[] = [
  {
    id: 'zone-hairline',
    name: 'Hairline & Nape of Neck',
    category: 'head_neck',
    view: 'back',
    svgCoordinates: { x: 200, y: 55 },
    icon: '🧠',
    riskTier: 'Critical',
    whyTicksLoveIt: 'Hair traps humidity and warmth; ticks crawl upward until halted by dense follicles or hair ties.',
    inspectionTechnique: 'Use a handheld mirror or ask a companion. Use a hair dryer on the COOL setting to part dense hair sections quickly.',
    differentiationGuide: 'Distinguish from small scalp moles or scabs: a nymph has 8 legs visible under a 10x smartphone camera zoom.',
    safeExtractionAngle: 'Part hair flat with wet comb; slide fine-tipped tweezers perpendicular (90°) right against the scalp surface. Pull straight up slowly.'
  },
  {
    id: 'zone-ears',
    name: 'Behind & Inside Ear Folds',
    category: 'head_neck',
    view: 'both',
    svgCoordinates: { x: 180, y: 70 },
    icon: '👂',
    riskTier: 'High',
    whyTicksLoveIt: 'Thin vascularized skin with deep postauricular folds that protect the tick from accidental scratching.',
    inspectionTechnique: 'Feel along the cartilage rim and behind the earlobe with fingertips; use a smartphone selfie camera with flashlight.',
    differentiationGuide: 'Often mistaken for blackheads or ear freckles. Unlike a freckle, a nymph has palpable 3D elevation.',
    safeExtractionAngle: 'Grasp with ultra-fine tweezers parallel to the ear cartilage surface; pull steadily without twisting.'
  },
  {
    id: 'zone-underarms',
    name: 'Axillary Folds (Underarms)',
    category: 'torso',
    view: 'front',
    svgCoordinates: { x: 145, y: 140 },
    icon: '腋',
    riskTier: 'Critical',
    whyTicksLoveIt: 'Maximum body heat and moisture accumulation (>85% local RH), making it an ideal microclimate for nymph feeding.',
    inspectionTechnique: 'Raise arms in front of a full-length mirror under bright bathroom lighting. Check the anterior and posterior axillary borders.',
    differentiationGuide: 'Can be confused with small skin tags. Skin tags are flesh-colored and smooth; ticks are dark brown/black with visible legs.',
    safeExtractionAngle: 'Hold skin taut with one hand; grasp tick mouthparts flush with the skin with fine tweezers and apply gentle, continuous upward traction.'
  },
  {
    id: 'zone-navel',
    name: 'Umbilicus (Inside Navel)',
    category: 'torso',
    view: 'front',
    svgCoordinates: { x: 200, y: 225 },
    icon: '🔘',
    riskTier: 'High',
    whyTicksLoveIt: 'Deep cavity that traps sweat and creates zero friction from clothing, allowing nymphs to feed undisturbed for days.',
    inspectionTechnique: 'Gently evert the navel fold in good light. Use a cotton swab to inspect the deep central crevice.',
    differentiationGuide: 'Look for tiny dark specks that do not rinse away with water.',
    safeExtractionAngle: 'Use fine-point precision tweezers to reach the base of the navel pit. Avoid squeezing the engorged tick abdomen.'
  },
  {
    id: 'zone-beltline',
    name: 'Beltline & Inguinal Creases (Groin)',
    category: 'groin_legs',
    view: 'both',
    svgCoordinates: { x: 200, y: 275 },
    icon: '👖',
    riskTier: 'Critical',
    whyTicksLoveIt: 'Elastic waistbands and underwear seams create a tight barrier where upward-crawling ticks are stopped and burrow in.',
    inspectionTechnique: 'Inspect in a warm shower immediately after hiking. Check along the entire waistband pressure ring and inner thigh creases.',
    differentiationGuide: 'Frequently misidentified as heat rash or clogged hair follicles. Check for a single focal dark center.',
    safeExtractionAngle: 'Ensure good lighting and skin tension. Pull straight up at 90° without jerking.'
  },
  {
    id: 'zone-behind-knees',
    name: 'Popliteal Fossa (Behind the Knees)',
    category: 'groin_legs',
    view: 'back',
    svgCoordinates: { x: 180, y: 395 },
    icon: '🦵',
    riskTier: 'High',
    whyTicksLoveIt: 'Thin skin over rich superficial capillary beds with frequent flexion that hides the tick from visual inspection.',
    inspectionTechnique: 'Bend knee slightly while looking in a full-length mirror, or run fingers thoroughly across the transverse popliteal crease.',
    differentiationGuide: 'Distinct from venous spider veins by its focal palpable bump.',
    safeExtractionAngle: 'Straight upward traction perpendicular to the crease.'
  },
  {
    id: 'zone-ankles',
    name: 'Malleolar Ring & Sock Line',
    category: 'feet',
    view: 'front',
    svgCoordinates: { x: 175, y: 475 },
    icon: '🧦',
    riskTier: 'Critical',
    whyTicksLoveIt: 'The primary entry point! Nymphs questing on low vegetation (4–8 inches) transfer onto shoes and crawl under sock cuffs.',
    inspectionTechnique: 'Check immediately after removing hiking socks. Inspect between toes and around the Achilles tendon.',
    differentiationGuide: 'Poppy-seed sized black dot (1–2mm) that does not brush off like dirt or beach sand.',
    safeExtractionAngle: 'Rest foot flat; apply fine tweezers directly to skin level and pull steadily upward.'
  }
];
