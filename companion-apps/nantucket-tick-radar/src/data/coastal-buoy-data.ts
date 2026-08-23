export interface INoaaBuoyStation {
  id: string;
  name: string;
  agency: 'NOAA NDBC' | 'NERACOOS' | 'NOAA CO-OPS';
  coordinates: [number, number]; // [lat, lng]
  locationDescription: string;
  distanceFromIsland: string;
  waterTempF: number;
  airTempF: number;
  dewPointF: number;
  relativeHumidityPercent: number;
  windSpeedKnots: number;
  windDirectionDegrees: number;
  windDirectionCardinal: string;
  waveHeightFt: number;
  wavePeriodSec: number;
  pressureHpa: number;
  visibilityMiles: number;
  seaFogStatus: 'Dense Marine Fog' | 'Moderate Sea Mist' | 'Clear Horizon';
  tickEcologyImpact: string;
  ferryCrossingAdvice: string;
  noaaUrl: string;
}

export const COASTAL_BUOY_STATIONS: INoaaBuoyStation[] = [
  {
    id: 'buoy-44020',
    name: 'Station 44020 — Nantucket Sound (NERACOOS Buoy M)',
    agency: 'NERACOOS',
    coordinates: [41.443, -70.283],
    locationDescription: 'Nantucket Sound main marine passage between Great Point, Hyannis & Martha\'s Vineyard.',
    distanceFromIsland: '11.5 NM Northwest of Great Point',
    waterTempF: 66.2,
    airTempF: 68.4,
    dewPointF: 65.8,
    relativeHumidityPercent: 91,
    windSpeedKnots: 8.5,
    windDirectionDegrees: 210,
    windDirectionCardinal: 'SSW',
    waveHeightFt: 2.1,
    wavePeriodSec: 5.2,
    pressureHpa: 1016.4,
    visibilityMiles: 1.8,
    seaFogStatus: 'Dense Marine Fog',
    tickEcologyImpact: '🚨 Extreme Questing Alert: Thick marine moisture layer is blowing onshore into Madaket & Sanford Farm. High humidity allows nymphs to climb tall dune grass without desiccating.',
    ferryCrossingAdvice: 'Smooth passage with 2ft light swell. Heavy coastal fog entering Nantucket Harbor; fog horns sounding at Brant Point.',
    noaaUrl: 'https://www.ndbc.noaa.gov/station_page.php?station=44020'
  },
  {
    id: 'buoy-44008',
    name: 'Station 44008 — Nantucket Shoals (54 NM SE of Island)',
    agency: 'NOAA NDBC',
    coordinates: [40.503, -69.248],
    locationDescription: 'Deep Atlantic open ocean moisture and swell vector south of Siasconset & Surfside.',
    distanceFromIsland: '54 NM Southeast of Siasconset',
    waterTempF: 63.8,
    airTempF: 67.1,
    dewPointF: 64.2,
    relativeHumidityPercent: 90,
    windSpeedKnots: 13.2,
    windDirectionDegrees: 190,
    windDirectionCardinal: 'S',
    waveHeightFt: 4.6,
    wavePeriodSec: 7.8,
    pressureHpa: 1015.8,
    visibilityMiles: 3.5,
    seaFogStatus: 'Dense Marine Fog',
    tickEcologyImpact: 'Deep Atlantic warm moisture front feeding into the South Shore moors. High survival rates for questing ticks in low scrub oak.',
    ferryCrossingAdvice: 'Open Atlantic swell at 4.6ft. Does not affect inner sound ferries (Steamship/Hy-Line), but offshore fishing boats will experience rolling seas.',
    noaaUrl: 'https://www.ndbc.noaa.gov/station_page.php?station=44008'
  },
  {
    id: 'buoy-8449130',
    name: 'Station 8449130 — Brant Point Nantucket Harbor Channel',
    agency: 'NOAA CO-OPS',
    coordinates: [41.290, -70.090],
    locationDescription: 'Nantucket Harbor entrance by historic Brant Point Light & ferry turnaround.',
    distanceFromIsland: 'On Island (Brant Point / Town Harbor)',
    waterTempF: 67.5,
    airTempF: 71.0,
    dewPointF: 66.5,
    relativeHumidityPercent: 86,
    windSpeedKnots: 6.2,
    windDirectionDegrees: 200,
    windDirectionCardinal: 'SSW',
    waveHeightFt: 0.8,
    wavePeriodSec: 3.0,
    pressureHpa: 1016.9,
    visibilityMiles: 2.5,
    seaFogStatus: 'Moderate Sea Mist',
    tickEcologyImpact: 'Town gardens, Creeks, and nearby conservation parcels have elevated ambient moisture. Morning garden work requires immediate sock inspections.',
    ferryCrossingAdvice: 'Calm water inside the harbor basin (0.8ft chop). Ferries docking on schedule at Steamboat Wharf and Straight Wharf.',
    noaaUrl: 'https://tidesandcurrents.noaa.gov/stationhome.html?id=8449130'
  },
  {
    id: 'buoy-44017',
    name: 'Station 44017 — Montauk Point / Block Island Sound',
    agency: 'NOAA NDBC',
    coordinates: [40.693, -72.049],
    locationDescription: 'Western maritime approach to Southern New England islands and Cape Cod.',
    distanceFromIsland: '85 NM West-Southwest of Madaket',
    waterTempF: 69.1,
    airTempF: 73.4,
    dewPointF: 61.0,
    relativeHumidityPercent: 65,
    windSpeedKnots: 11.0,
    windDirectionDegrees: 240,
    windDirectionCardinal: 'WSW',
    waveHeightFt: 3.2,
    wavePeriodSec: 6.0,
    pressureHpa: 1017.2,
    visibilityMiles: 8.0,
    seaFogStatus: 'Clear Horizon',
    tickEcologyImpact: 'Drier westerly airflow heading toward the islands. If this pattern reaches Nantucket, midday Vapor Pressure Deficit will rise, causing lethal tick desiccation.',
    ferryCrossingAdvice: 'Moderate 3.2ft chop across Block Island Sound. Excellent visibility.',
    noaaUrl: 'https://www.ndbc.noaa.gov/station_page.php?station=44017'
  }
];
