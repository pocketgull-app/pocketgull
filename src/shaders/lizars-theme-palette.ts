/**
 * William Home Lizars (1788-1859) Universal Theme Palette
 * 
 * Maps anatomical stratigraphy and copperplate intaglio engraving colors
 * across PocketGull system themes (Edinburgh 1822, Obsidian, Washi, Scotopic 650nm, Vesalian 1543).
 */

export interface ILizarsThemeTokens {
  name: string;
  label: string;
  paperColor: number;         // Background substrate color
  platemarkColor: number;     // Copperplate indentation rim
  inkColor: number;           // Intaglio engraved burin lines
  arterialColor: number;      // Luminous arterial tree (e.g. Vermilion)
  venousColor: number;        // Venous network return (e.g. Cobalt/Prussian)
  nerveColor: number;         // Peripheral & cranial nerve cords (e.g. Canary)
  muscleColor: number;        // Muscle fascicles & contractile bellies
  boneColor: number;          // Skeletal framework & joint capsules
  accentColor: number;        // Callout pin highlights & leader lines
  backdropColor: number;      // Studio / folio backdrop ambient
  isDark: boolean;
}

export type LizarsThemeKey =
  | 'edinburgh_1822'
  | 'obsidian'
  | 'washi'
  | 'scotopic_650nm'
  | 'vesalian_1543';

export const LIZARS_THEMES: Record<LizarsThemeKey, ILizarsThemeTokens> = {
  edinburgh_1822: {
    name: 'edinburgh_1822',
    label: 'Edinburgh 1822 (Lizars Classic)',
    paperColor: 0xf5eedb,       // Heavy antique Whatman rag wove paper
    platemarkColor: 0xdfd4bc,   // Indented copper platemark bevel
    inkColor: 0x1c140e,         // Iron gall / lampblack intaglio ink
    arterialColor: 0xd63031,    // Hand-applied radiant vermilion watercolor
    venousColor: 0x0984e3,      // Lapis lazuli & deep Prussian cobalt blue
    nerveColor: 0xfdcb6e,       // Canary yellow fine branching fiber cords
    muscleColor: 0xb3592b,      // Warm raw sienna & terracotta muscle striations
    boneColor: 0xefe5cb,        // Antique ivory bone & cartilage
    accentColor: 0xd63031,      // Vermilion highlight pins
    backdropColor: 0x18120e,    // Royal College of Surgeons dissecting room mahogany
    isDark: false
  },
  obsidian: {
    name: 'obsidian',
    label: 'PocketGull Obsidian (Clinical Teal)',
    paperColor: 0x09090b,       // Deep obsidian dark substrate
    platemarkColor: 0x18181b,   // Subtle plate boundary
    inkColor: 0x27272a,         // Dark graphite micro-hatches
    arterialColor: 0xf43f5e,    // Rose arterial telemetry
    venousColor: 0x06b6d4,      // Cyan venous telemetry
    nerveColor: 0xf59e0b,       // Amber nerve conduction
    muscleColor: 0x3f3f46,      // Charcoal contractile fascicles
    boneColor: 0xe4e4e7,        // High-contrast calcar bone
    accentColor: 0x2dd4bf,      // Clinical gear teal
    backdropColor: 0x09090b,    // Obsidian void
    isDark: true
  },
  washi: {
    name: 'washi',
    label: 'PocketGull Washi (Kozo & Sumi)',
    paperColor: 0xf8f4ec,       // Handcrafted Japanese kozo mulberry paper
    platemarkColor: 0xe8e2d4,   // Soft washi deckle compression
    inkColor: 0x1f1e1d,         // Sumi pine-soot stick ink
    arterialColor: 0xc0392b,    // Traditional Japanese cinnabar red (Shu-iro)
    venousColor: 0x2c3e50,      // Natural fermented indigo (Ai-iro)
    nerveColor: 0xd4ac0d,       // Golden turmeric silk fiber (Ki-hada)
    muscleColor: 0xa0522d,      // Persimmon tannin wood stain (Kaki-shibu)
    boneColor: 0xede6d6,        // Bleached bone ivory
    accentColor: 0xc0392b,      // Cinnabar seal mark
    backdropColor: 0x24201c,    // Kyoto cedar wood alcove
    isDark: false
  },
  scotopic_650nm: {
    name: 'scotopic_650nm',
    label: 'Scotopic 650nm (Surgical Rhodopsin)',
    paperColor: 0x0c0505,       // Deep black-red surgical chamber
    platemarkColor: 0x1a0808,   // Faint 650nm threshold bevel
    inkColor: 0x2d0c0c,         // Dark garnet intaglio lines
    arterialColor: 0xff3333,    // Pure 650nm luminescent red
    venousColor: 0x771111,      // Deep darkened burgundy (zero blue photon emission)
    nerveColor: 0xdd6600,       // Warm 610nm amber red
    muscleColor: 0x4a1212,      // Garnet contractile muscle
    boneColor: 0x8a2020,        // Muted dark red bone structure
    accentColor: 0xff3333,      // 650nm laser pin
    backdropColor: 0x060202,    // Complete scotopic dark
    isDark: true
  },
  vesalian_1543: {
    name: 'vesalian_1543',
    label: 'Vesalian Renaissance 1543 (Teak & Gesso)',
    paperColor: 0x22150e,       // Deep walnut carved hollow
    platemarkColor: 0x3d2417,   // Carved relief border
    inkColor: 0xcd8d58,         // Honey teakwood knife ridge
    arterialColor: 0xd9534f,    // Venetian red chalk
    venousColor: 0x337ab7,      // Lapis ultramarine wash
    nerveColor: 0xf0ad4e,       // Raw umber highlighted cords
    muscleColor: 0xcd8d58,      // Oiled sandalwood muscle belly
    boneColor: 0xdfcca6,        // Antique boxwood bone ivory
    accentColor: 0xd4af37,      // Renaissance brass caliper
    backdropColor: 0x151210,    // Venetian anatomical theater
    isDark: true
  }
};

export function getLizarsTheme(key: string): ILizarsThemeTokens {
  if (key in LIZARS_THEMES) {
    return LIZARS_THEMES[key as LizarsThemeKey];
  }
  return LIZARS_THEMES.edinburgh_1822;
}
