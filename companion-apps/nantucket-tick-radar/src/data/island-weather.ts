export interface IWeatherScenario {
  id: string;
  name: string;
  tempF: number;
  relativeHumidityPercent: number;
  windSpeedKnots: number;
  solarCondition: 'Damp Fog' | 'Partly Sunny' | 'Blazing Sun & Wind' | 'Rainy / Overcast';
  icon: string;
  locationContext: string;
}

export const ISLAND_WEATHER_PRESETS: IWeatherScenario[] = [
  {
    id: 'damp-fog-morning',
    name: 'Nantucket Morning Sea Fog (High Questing)',
    tempF: 68,
    relativeHumidityPercent: 92,
    windSpeedKnots: 4,
    solarCondition: 'Damp Fog',
    icon: '🌫️',
    locationContext: 'Squam Swamp & Polpis Valleys: 8:00 AM thick marine layer.'
  },
  {
    id: 'sunny-breezy-afternoon',
    name: 'Sunny Breezy Moorland (Lethal Desiccation)',
    tempF: 78,
    relativeHumidityPercent: 52,
    windSpeedKnots: 16,
    solarCondition: 'Blazing Sun & Wind',
    icon: '☀️',
    locationContext: 'Sanford Farm & Middle Moors: 2:00 PM high UV & steady southwest breeze.'
  },
  {
    id: 'coastal-dune-breeze',
    name: 'Great Point Coastal Dunes (Zero Risk Zone)',
    tempF: 75,
    relativeHumidityPercent: 58,
    windSpeedKnots: 20,
    solarCondition: 'Blazing Sun & Wind',
    icon: '🏖️',
    locationContext: 'Great Point & Madaket Beach: Salt spray and high wind desiccation.'
  },
  {
    id: 'humid-summer-overcast',
    name: 'Humid Summer Overcast (Peak Nymph Activity)',
    tempF: 74,
    relativeHumidityPercent: 86,
    windSpeedKnots: 6,
    solarCondition: 'Rainy / Overcast',
    icon: '☁️',
    locationContext: 'Low-lying pine barrens and dense scrub oak undergrowth.'
  }
];

export interface IDesiccationAnalysis {
  tempF: number;
  relativeHumidityPercent: number;
  windSpeedKnots: number;
  vaporPressureDeficitKpa: number;
  tickQuestingRiskIndex: number; // 0 (Zero) to 100 (Extreme Questing)
  riskTier: 'Extreme Questing' | 'Moderate Questing' | 'Lethal Desiccation (Safe Trails)';
  microclimateSummary: string;
  trailSafetyAdvice: string;
}

/**
 * Calculates biological Vapor Pressure Deficit (VPD) and Tick Questing Activity Index.
 */
export function computeIslandDesiccationIndex(
  tempF: number,
  relativeHumidityPercent: number,
  windSpeedKnots: number
): IDesiccationAnalysis {
  const tempC = ((tempF - 32) * 5) / 9;
  
  // Saturated Vapor Pressure (Tetens equation in kPa)
  const vpsat = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const vpact = vpsat * (relativeHumidityPercent / 100);
  const vpd = Math.max(0, vpsat - vpact);

  // Biological Questing Risk Index (0 - 100)
  // Higher RH and lower VPD promote tick questing; higher wind and high VPD cause rapid desiccation
  let questingScore = (relativeHumidityPercent * 0.85) - (vpd * 22) - (windSpeedKnots * 1.4);
  questingScore = Math.max(5, Math.min(98, Math.round(questingScore)));

  let riskTier: IDesiccationAnalysis['riskTier'] = 'Moderate Questing';
  let microclimateSummary = '';
  let trailSafetyAdvice = '';

  if (questingScore >= 65) {
    riskTier = 'Extreme Questing';
    microclimateSummary = `High ambient humidity (${relativeHumidityPercent}%) and low drying deficit (${vpd.toFixed(2)} kPa) enable blacklegged nymphs to climb to the tips of trailside grasses and quest actively for human hosts.`;
    trailSafetyAdvice = 'Strict Two-Zone Armor required! Stay strictly centered on mowed paths. Ticks are actively questing at ankle height.';
  } else if (questingScore <= 35) {
    riskTier = 'Lethal Desiccation (Safe Trails)';
    microclimateSummary = `High vapor pressure deficit (${vpd.toFixed(2)} kPa) and steady wind (${windSpeedKnots} kts) cause rapid water loss in questing nymphs. Ticks are forced to retreat deep into the damp leaf litter to avoid death by dehydration.`;
    trailSafetyAdvice = 'Optimal time for open moorland hiking and cycling! Trailside vegetation is significantly safer due to natural solar desiccation.';
  } else {
    riskTier = 'Moderate Questing';
    microclimateSummary = `Moderate humidity (${relativeHumidityPercent}%) and drying pressure (${vpd.toFixed(2)} kPa). Ticks alternate between short questing intervals and retreating to moist ground duff.`;
    trailSafetyAdvice = 'Standard trail vigilance: wear permethrin-treated socks and apply skin repellent to exposed ankles.';
  }

  return {
    tempF,
    relativeHumidityPercent,
    windSpeedKnots,
    vaporPressureDeficitKpa: parseFloat(vpd.toFixed(2)),
    tickQuestingRiskIndex: questingScore,
    riskTier,
    microclimateSummary,
    trailSafetyAdvice
  };
}
