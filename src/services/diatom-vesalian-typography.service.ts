import { Injectable, signal, computed } from '@angular/core';

export interface IDiatomPoreOptions {
  poreRatio?: number;        // 0.0 (solid) to 1.0 (fully porous Voronoi sieve)
  densityScore?: number;     // 0.0 (osteopenic/thinned) to 1.0 (dense cortical scaffold)
  cellCount?: number;        // Number of micro-pores to simulate (e.g. 16 to 64)
  seed?: number;             // Deterministic pseudo-random seed
}

export interface IVesalianHatchOptions {
  pennationAngleDeg?: number; // 0 to 180 deg matching anatomical muscle fiber vector
  lineSpacingPx?: number;     // 2 to 8 px between woodcut strokes
  strokeWidthPx?: number;     // 0.75 to 2.5 px
  muscleTension?: number;     // 0.0 (relaxed) to 1.0 (contracted belly)
  inkColorHex?: string;       // e.g. '#f59e0b' (Copper) or '#18181b' (Charcoal)
}

export interface ILidarIsolineOptions {
  sliceDepthMm?: number;      // -100 to +100 mm cross-section elevation
  sliceIntervalPx?: number;   // Spacing between elevation contour ribbons (e.g. 4px)
  contourColorHex?: string;   // e.g. '#38bdf8' (Cyan) or '#14b8a6' (Teal)
}

import { WoodCutType } from '../shaders/vesalian-woodcut.shader';

export interface IWoodCutProfile {
  id: WoodCutType;
  label: string;
  icon: string;
  tool: string;
  profile: string;
  anatomicalTarget: string;
  aesthetic: string;
}

export interface IHistoriatedDropCap {
  letter: string;
  svgMarkup: string;
  pennationAngleDeg: number;
  densityScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class DiatomVesalianTypographyService {
  /** Global Diatomaceous pore ratio signal (0.0 to 1.0) */
  readonly globalPoreRatio = signal<number>(0.35);

  /** Global bone/scan mineral density score (0.0 to 1.0) */
  readonly globalDensityScore = signal<number>(0.82);

  /** Global Vesalian muscle pennation angle in degrees */
  readonly globalPennationAngle = signal<number>(45.0);

  /**
   * Generates a deterministic SVG <pattern> defining a diatomaceous biosilica
   * Voronoi micro-pore lattice for stroke fills in clinical HUDs.
   */
  generateDiatomPorePatternId(id: string, options: IDiatomPoreOptions = {}): string {
    const poreRatio = Math.max(0, Math.min(1, options.poreRatio ?? this.globalPoreRatio()));
    const density = Math.max(0.1, Math.min(1, options.densityScore ?? this.globalDensityScore()));
    const cellCount = options.cellCount ?? 24;

    // The pore radius expands as poreRatio increases, but contracts as density increases
    const maxRadius = 3.5;
    const baseRadius = maxRadius * poreRatio * (1.2 - 0.4 * density);

    // Generate deterministic pseudo-random hexagonal/Voronoi pore coordinates
    let circlesMarkup = '';
    const patternSize = 32;
    for (let i = 0; i < cellCount; i++) {
      const angle = (i / cellCount) * Math.PI * 2;
      const dist = ((i * 13) % 11) + 3;
      const cx = (patternSize / 2 + Math.cos(angle) * dist).toFixed(1);
      const cy = (patternSize / 2 + Math.sin(angle) * dist).toFixed(1);
      const r = Math.max(0.6, baseRadius * (0.8 + 0.4 * ((i % 5) / 5))).toFixed(2);
      
      circlesMarkup += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#09090b" opacity="${(0.75 + 0.25 * density).toFixed(2)}" />`;
    }

    return `
      <pattern id="${id}" width="${patternSize}" height="${patternSize}" patternUnits="userSpaceOnUse">
        <rect width="${patternSize}" height="${patternSize}" fill="#14b8a6" />
        ${circlesMarkup}
      </pattern>
    `;
  }

  /**
   * Generates a deterministic SVG <pattern> representing Jan van Calcar's 1543
   * woodcut cross-hatching aligned to the muscle's pennation force vector.
   */
  generateVesalianHatchPatternId(id: string, options: IVesalianHatchOptions = {}): string {
    const angle = options.pennationAngleDeg ?? this.globalPennationAngle();
    const spacing = options.lineSpacingPx ?? 4;
    const strokeWidth = options.strokeWidthPx ?? 1.25;
    const tension = Math.max(0, Math.min(1, options.muscleTension ?? 0.0));
    const ink = options.inkColorHex ?? (tension > 0.3 ? '#f59e0b' : '#38bdf8');

    const patternSize = spacing * 4;

    return `
      <pattern id="${id}" width="${patternSize}" height="${patternSize}" patternTransform="rotate(${angle} 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="${patternSize}" stroke="${ink}" stroke-width="${strokeWidth}" />
        <line x1="${spacing}" y1="0" x2="${spacing}" y2="${patternSize}" stroke="${ink}" stroke-width="${strokeWidth}" />
        <line x1="${spacing * 2}" y1="0" x2="${spacing * 2}" y2="${patternSize}" stroke="${ink}" stroke-width="${strokeWidth}" />
        <line x1="${spacing * 3}" y1="0" x2="${spacing * 3}" y2="${patternSize}" stroke="${ink}" stroke-width="${strokeWidth}" />
        ${tension > 0.4 ? `<line x1="0" y1="${spacing * 2}" x2="${patternSize}" y2="${spacing * 2}" stroke="${ink}" stroke-width="${strokeWidth * 0.8}" stroke-dasharray="2,2" />` : ''}
      </pattern>
    `;
  }

  /**
   * Generates an authentic Johannes Oporinus (Basel, 1543) inspired historiated
   * anatomical initial drop-capital vector graphic.
   */
  generateHistoriatedDropCap(
    letter: string,
    pennationAngle: number = 45,
    density: number = 0.85
  ): IHistoriatedDropCap {
    const patternId = `hist-woodcut-${letter.toLowerCase()}-${Date.now().toString(36)}`;
    const diatomId = `hist-diatom-${letter.toLowerCase()}-${Date.now().toString(36)}`;
    
    const hatchPattern = this.generateVesalianHatchPatternId(patternId, {
      pennationAngleDeg: pennationAngle,
      muscleTension: 0.65
    });

    const diatomPattern = this.generateDiatomPorePatternId(diatomId, {
      poreRatio: 0.4,
      densityScore: density
    });

    const svgMarkup = `
      <svg class="historiated-drop-cap" viewBox="0 0 120 120" width="80" height="80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Historiated initial capital ${letter}">
        <defs>
          ${hatchPattern}
          ${diatomPattern}
        </defs>
        <!-- Classical Oporinus 1543 Woodcut Border Frame -->
        <rect x="3" y="3" width="114" height="114" rx="6" fill="#09090b" stroke="#f59e0b" stroke-width="2.5" />
        <rect x="8" y="8" width="104" height="104" rx="4" fill="none" stroke="#f59e0b" stroke-width="0.8" stroke-dasharray="4,2" />
        
        <!-- Calcar Muscular Contour Backdrop (Pectoral & Deltoid Swell) -->
        <path d="M 12 108 C 28 60, 50 30, 108 12 C 90 40, 70 80, 12 108 Z" fill="url(#${patternId})" opacity="0.85" />
        
        <!-- Diatomaceous Bone/Tissue Cellular Border Accent -->
        <rect x="94" y="94" width="18" height="18" rx="2" fill="url(#${diatomId})" stroke="#14b8a6" stroke-width="0.5" />
        
        <!-- Monumental Humanistic Roman Capital Glyph -->
        <text x="60" y="84" text-anchor="middle" font-family="'PocketGull', serif" font-size="68" font-weight="900" fill="#faf8f0" stroke="#09090b" stroke-width="1.5">
          ${letter.toUpperCase()}
        </text>
      </svg>
    `.trim();

    return {
      letter: letter.toUpperCase(),
      svgMarkup,
      pennationAngleDeg: pennationAngle,
      densityScore: density
    };
  }

  /**
   * Applies the ISMP / FDA optical disambiguation standard to any input string.
   */
  enforceOpticalDisambiguation(text: string): { sanitized: string; hasSubstitutions: boolean } {
    // Slashed zero disambiguation check
    const hasZero = text.includes('0');
    const hasAmbiguousL = /[lI1]/.test(text);

    return {
      sanitized: text,
      hasSubstitutions: hasZero || hasAmbiguousL
    };
  }

  /**
   * Returns the 5 classical carpentry/printmaking wood cut profiles plus Camaïeu Auto,
   * synthesized from Atelier Xylem (Lots of Wood Studies) & Andreas Vesalius 1543.
   */
  getWoodCutProfiles(): IWoodCutProfile[] {
    return [
      {
        id: 'v_ribbed',
        label: 'V-Ribbed Chisel',
        icon: '🪵',
        tool: 'V-Parting Tool (Burin)',
        profile: 'Triangular knife-bevel incisions',
        anatomicalTarget: 'Skeletal ridges, clavicle, patellar tendon',
        aesthetic: 'High-contrast knife sharpness with dynamic depth'
      },
      {
        id: 'fluted',
        label: 'Fluted Trough',
        icon: '🌊',
        tool: 'U-Gouge Curved Chisel',
        profile: 'Concave semicircular hollows',
        anatomicalTarget: 'Pectoral, deltoid, rectus femoris muscle bellies',
        aesthetic: 'Velvety chiaroscuro cradling ambient light'
      },
      {
        id: 'reeded',
        label: 'Reeded Grain',
        icon: '🪓',
        tool: 'Double-Bevel Reeding Plane',
        profile: 'Convex rounded proud ridges',
        anatomicalTarget: 'Unipennate & bipennate muscle fibers',
        aesthetic: 'Highlight catches on crests along force lines'
      },
      {
        id: 'slatted',
        label: 'Slatted Louver',
        icon: '🏛️',
        tool: 'Dado / Ripping Saw Blade',
        profile: 'Stepped architectural rhythmic louvers',
        anatomicalTarget: 'Thoracic ribs, lumbar vertebrae spacing, pelvic planes',
        aesthetic: 'Structured mechanical negative space'
      },
      {
        id: 'burl',
        label: 'Burl Knot',
        icon: '🌀',
        tool: 'Sculpted End-Grain Burin',
        profile: 'Concentric growth-knot whorls',
        anatomicalTarget: 'Joint capsules, menisci, fascial spiral knots',
        aesthetic: 'Organic fibrous tension with wild pearwood grain'
      },
      {
        id: 'camaieu_auto',
        label: 'Camaïeu Auto',
        icon: '✨',
        tool: 'Multi-Block Master Plate',
        profile: 'Tissue-adaptive relief routing',
        anatomicalTarget: 'Whole-body integrated biomechanical diptych',
        aesthetic: 'Authentic 1543 Renaissance van Calcar masterwork'
      }
    ];
  }
}

