import './styles/app.css';
import { EISENHOWER_ACTIONS } from './data/eisenhower-actions.js';
import { NANTUCKET_TRAILS } from './data/nantucket-trails.js';
import { EDUCATIONAL_MODULES } from './data/educational-modules.js';
import { SEVEN_GEN_TIMELINE, ISLAND_ADVENTURE_QUESTS } from './data/seven-generations.js';
import { REPELLENT_DATABASE, REPELLENT_MYTHS_FACTS } from './data/repellent-guide.js';
import { ARTICLES_LIBRARY, IArticleItem } from './data/articles-library.js';
import { assessDwellTimeAndProphylaxis } from './engine/dwell-time-calculator.js';
import { computeCoInfectionRadar, ISymptomInput } from './engine/co-infection-radar.js';
import { CitizenScienceStore } from './engine/citizen-science-store.js';
import { generateFhirR4Bundle, generatePrintableClinicalSummary } from './engine/fhir-exporter.js';
import { NantucketMapEngine, BasemapMode } from './engine/nantucket-map-engine.js';
import { BODY_INSPECTION_ZONES, IBodyInspectionZone } from './data/body-inspection-zones.js';
import { computeIslandDesiccationIndex, ISLAND_WEATHER_PRESETS, IDesiccationAnalysis } from './data/island-weather.js';
import { getEngorgementStageForHours, ENGORGEMENT_STAGES } from './engine/engorgement-visualizer.js';
import { FerryKitStore } from './engine/ferry-kit-planner.js';
import { SoundOfMoorsAudio } from './engine/sound-of-moors.js';
import { CommunityPortalStore } from './engine/community-portal-store.js';
import { SOURCES_BIBLIOGRAPHY, ISourceCitation } from './data/sources-bibliography.js';
import { COASTAL_BUOY_STATIONS, INoaaBuoyStation } from './data/coastal-buoy-data.js';
import { NANTUCKET_PUBLIC_MEETING_NOTES, IPublicMeetingNote } from './data/public-meeting-notes.js';
import { UPCOMING_ISLAND_CIVIC_EVENTS, IIslandCivicEvent } from './data/island-civic-events.js';
import { renderMarkdownToHtml } from './engine/markdown-renderer.js';
import { renderFaganNomogramSvg, render100NymphsPopulationGrid } from './engine/fagan-nomogram.js';
import { evaluateBayesianTriage } from './engine/bayesian-triage.js';
import { KAY_HAGAN_TICK_ACT_PILLARS, POWASSAN_VIRUS_PROFILE } from './engine/kay-hagan-act.js';
import { TourismKioskEngine, KIOSK_STORY_CHAPTERS, IKioskStoryChapter } from './engine/tourism-kiosk.js';
import { NaturePlayTapeEngine, NATURE_PLAY_TAPE_TRACKS, INaturePlayTapeTrack } from './engine/nature-play-tape.js';
import { CoppaPrivacyShieldEngine } from './engine/coppa-privacy-shield.js';
import { TickSpecies, EisenhowerPhase, AttachmentDwellTier } from './types.js';

// Application State
class AppState {
  public currentTab = 'map';
  public selectedPhase: EisenhowerPhase | 'all' = 'all';
  public selectedSpecies: TickSpecies = 'ixodes_nymph';
  
  // Tourism Kiosk & Nature Play Tape State
  public kioskEngine = new TourismKioskEngine();
  public playTapeEngine = new NaturePlayTapeEngine();
  public coppaEngine = new CoppaPrivacyShieldEngine();
  public showKioskQrModal = false;
  public showCoppaModal = false;
  public kioskArmorSocks = true;
  public kioskArmorPicaridin = true;
  public kioskArmorTucked = true;
  public kioskClockHours = 12;

  // Sources & Science state
  public selectedSourceCategory: string = 'all';
  public sourceSearchQuery: string = '';

  // Public Meeting Notes & Events state
  public selectedMeetingCategory: string = 'all';
  public selectedCivicEventCategory: string = 'all';

  // 6th Grade Reading Mode & Card Swap System
  public globalReadingMode: 'clinical' | 'grade6' = 'clinical';
  public flippedCardIds = new Set<string>();

  public isCardFlipped(id: string): boolean {
    return this.flippedCardIds.has(id);
  }

  public toggleCardFlip(id: string) {
    if (this.flippedCardIds.has(id)) {
      this.flippedCardIds.delete(id);
    } else {
      this.flippedCardIds.add(id);
    }
  }

  public toggleGlobalReadingMode() {
    this.globalReadingMode = this.globalReadingMode === 'clinical' ? 'grade6' : 'clinical';
    if (this.globalReadingMode === 'grade6') {
      SOURCES_BIBLIOGRAPHY.forEach(s => this.flippedCardIds.add(s.id));
      ARTICLES_LIBRARY.forEach(a => this.flippedCardIds.add(a.id));
      NANTUCKET_PUBLIC_MEETING_NOTES.forEach(m => this.flippedCardIds.add(m.id));
      EISENHOWER_ACTIONS.forEach(e => this.flippedCardIds.add(e.id));
      ISLAND_ADVENTURE_QUESTS.forEach(q => this.flippedCardIds.add(q.id));
    } else {
      this.flippedCardIds.clear();
    }
  }
  
  // Default to 0 hours (No active bite / Prevention & Education mode)
  public attachmentHours = 0;
  public hoursSinceRemoval = 0;
  public selectedTrailId = 'sanford-farm';
  public selectedRepellentId = 'picaridin-skin';
  public selectedArticleCategory: string = 'all';
  public articleSearchQuery: string = '';
  public activeArticleId: string | null = null;
  
  // Body Scan State
  public bodyView: 'front' | 'back' = 'front';
  public selectedBodyZoneId: string = 'zone-ankles';

  // Weather & Desiccation Radar State
  public weatherTempF: number = 74;
  public weatherHumidity: number = 86;
  public weatherWindKnots: number = 6;

  // Ferry Kit Planner Store
  public ferryKitStore = new FerryKitStore();

  // Community & Ranger Portal Store
  public communityStore = new CommunityPortalStore();
  public selectedQrTrailId: string = 'sanford-farm';
  public smsInputText: string = 'Found 2 blacklegged nymphs on dog at Sanford Farm main loop';

  // Procedural Ambient Audio
  public soundOfMoors = new SoundOfMoorsAudio();

  // 60-Second Guided Decontamination Timer
  public guidedTimerSeconds: number = 0;
  public guidedTimerRunning: boolean = false;
  public guidedTimerInterval: any = null;

  public symptoms: ISymptomInput = {
    hasErythemaMigrans: false,
    hasFeverChills: false,
    hasDrenchingSweats: false,
    hasDarkUrineJaundice: false,
    hasJointPainSwelling: false,
    hasHeadachePhotophobia: false,
    hasFacialDroop: false,
    hasRedMeatAllergy: false
  };

  public citizenStore = new CitizenScienceStore();
  public mapEngine = new NantucketMapEngine();
  public pledgeName = '';
  public pledgeSigned = false;
  public foundTicksCount = 0;

  public resetTriage() {
    this.selectedSpecies = 'ixodes_nymph';
    this.attachmentHours = 0;
    this.hoursSinceRemoval = 0;
    this.symptoms = {
      hasErythemaMigrans: false,
      hasFeverChills: false,
      hasDrenchingSweats: false,
      hasDarkUrineJaundice: false,
      hasJointPainSwelling: false,
      hasHeadachePhotophobia: false,
      hasFacialDroop: false,
      hasRedMeatAllergy: false
    };
  }

  public applyPreset(preset: 'flat_nymph' | 'swollen_48h' | 'dog_tick_beach') {
    if (preset === 'flat_nymph') {
      this.selectedSpecies = 'ixodes_nymph';
      this.attachmentHours = 0;
      this.hoursSinceRemoval = 0;
      this.symptoms = {
        hasErythemaMigrans: false,
        hasFeverChills: false,
        hasDrenchingSweats: false,
        hasDarkUrineJaundice: false,
        hasJointPainSwelling: false,
        hasHeadachePhotophobia: false,
        hasFacialDroop: false,
        hasRedMeatAllergy: false
      };
    } else if (preset === 'swollen_48h') {
      this.selectedSpecies = 'ixodes_nymph';
      this.attachmentHours = 48;
      this.hoursSinceRemoval = 4;
      this.symptoms = {
        hasErythemaMigrans: false,
        hasFeverChills: false,
        hasDrenchingSweats: false,
        hasDarkUrineJaundice: false,
        hasJointPainSwelling: false,
        hasHeadachePhotophobia: false,
        hasFacialDroop: false,
        hasRedMeatAllergy: false
      };
    } else if (preset === 'dog_tick_beach') {
      this.selectedSpecies = 'dermacentor_dog';
      this.attachmentHours = 6;
      this.hoursSinceRemoval = 1;
      this.symptoms = {
        hasErythemaMigrans: false,
        hasFeverChills: false,
        hasDrenchingSweats: false,
        hasDarkUrineJaundice: false,
        hasJointPainSwelling: false,
        hasHeadachePhotophobia: false,
        hasFacialDroop: false,
        hasRedMeatAllergy: false
      };
    }
  }

  public getSelectedBodyZone(): IBodyInspectionZone {
    return BODY_INSPECTION_ZONES.find(z => z.id === this.selectedBodyZoneId) || BODY_INSPECTION_ZONES[0];
  }

  public startGuidedTimer() {
    if (this.guidedTimerRunning) return;
    this.guidedTimerRunning = true;
    this.guidedTimerSeconds = 0;
    this.guidedTimerInterval = setInterval(() => {
      this.guidedTimerSeconds++;
      if (this.guidedTimerSeconds >= 60) {
        clearInterval(this.guidedTimerInterval);
        this.guidedTimerRunning = false;
      }
      renderApp();
    }, 1000);
  }

  public resetGuidedTimer() {
    if (this.guidedTimerInterval) {
      clearInterval(this.guidedTimerInterval);
    }
    this.guidedTimerRunning = false;
    this.guidedTimerSeconds = 0;
  }
}

const state = new AppState();

// Initialize callback for map pin selection
state.mapEngine.setOnLocationSelected((loc) => {
  renderApp();
});

// DOM Rendering Functions
function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const isAudioPlaying = state.soundOfMoors.getIsPlaying();

  appContainer.innerHTML = `
    <!-- Top Navigation Header -->
    <header class="glass-panel" style="padding: 16px 24px; margin-bottom: 16px;">
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #f97316 0%, #a3e635 100%); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);">
            🦋
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h1 class="font-pocketgull-brand" style="font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em;">NANTUCKET TICK RADAR</h1>
              <span class="badge badge-ocean font-mono">ACK / HYPER-ENDEMIC</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">
              Satellite Spatial Radar • Community Trail Watch • 360° Body Inspection • Desiccation Index • Citizen Science
            </p>
          </div>
        </div>

        <!-- Ambient Moors Soundscape & Reading Mode Global Toggle -->
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <button id="toggleReadingModeBtn" class="reading-level-global-toggle ${state.globalReadingMode === 'grade6' ? 'active-grade6' : ''}" title="Double-click or tap to toggle between Clinical and 6th-Grade Plain English">
            <span>${state.globalReadingMode === 'grade6' ? '🎒 6th-Grade Plain English (Active)' : '🔬 Clinical Mode (Dbl-Click Cards to Flip)'}</span>
          </button>

          <button id="toggleMoorsAudioBtn" class="ambient-sound-btn ${isAudioPlaying ? 'playing' : ''}" title="Procedural coastal sea breeze & gentle waves">
            <span>${isAudioPlaying ? '🌊 Sound of Moors: Playing' : '🔈 Sound of Moors'}</span>
          </button>
          
          <button id="openCoppaModalBtn" class="badge badge-emerald font-mono" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid #10b981; cursor: pointer; padding: 6px 10px;" title="FTC COPPA & Student Privacy Shield Certification">
            🔒 COPPA Safe Harbor
          </button>
          
          <a href="https://nantuckethospital.org/" target="_blank" rel="noopener noreferrer" class="badge badge-red font-mono" style="text-decoration: none; padding: 6px 10px;" title="Nantucket Cottage Hospital Walk-in">
            🏥 NCH Walk-in ↗
          </a>
        </div>

        <!-- Navigation Tabs with NN/g Keyboard Shortcut Accelerators -->
        <nav style="display: flex; flex-wrap: wrap; gap: 6px;" role="tablist" aria-label="Nantucket Tick Radar Navigation">
          <button role="tab" aria-selected="${state.currentTab === 'map' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'map' ? 'active' : ''}" data-tab="map" title="Press 1 or M">
            <span>🛰️ Satellite Map</span><span class="kbd-shortcut">1</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'bodyscan' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'bodyscan' ? 'active' : ''}" data-tab="bodyscan" title="Press 2">
            <span>🧍 360° Body Scan</span><span class="kbd-shortcut">2</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'weather' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'weather' ? 'active' : ''}" data-tab="weather" title="Press 3">
            <span>☀️ Desiccation Radar</span><span class="kbd-shortcut">3</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'radar' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'radar' ? 'active' : ''}" data-tab="radar" title="Press 4">
            <span>🔬 72h Triage</span><span class="kbd-shortcut">4</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'community' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'community' ? 'active' : ''}" data-tab="community" title="Press 5">
            <span>🌲 Community Trail Watch</span><span class="kbd-shortcut">5</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'repellents' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'repellents' ? 'active' : ''}" data-tab="repellents" title="Press 6">
            <span>🛡️ Repellent Lab</span><span class="kbd-shortcut">6</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'articles' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'articles' ? 'active' : ''}" data-tab="articles" title="Press 7">
            <span>📰 Field Guides</span><span class="kbd-shortcut">7</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'ferrykit' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'ferrykit' ? 'active' : ''}" data-tab="ferrykit" title="Press 8">
            <span>🧳 Ferry Packing Kit</span><span class="kbd-shortcut">8</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'eisenhower' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'eisenhower' ? 'active' : ''}" data-tab="eisenhower" title="Press 9">
            <span>⏱️ What to Do</span><span class="kbd-shortcut">9</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'sevengen' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'sevengen' ? 'active' : ''}" data-tab="sevengen" title="Press 0">
            <span>🌟 7-Gen Quests</span><span class="kbd-shortcut">0</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'sources' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'sources' ? 'active' : ''}" data-tab="sources" title="Press S">
            <span>📚 Sources & Science</span><span class="kbd-shortcut">S</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'hospital' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'hospital' ? 'active' : ''}" data-tab="hospital" title="Press H">
            <span>🏥 NCH Intake</span><span class="kbd-shortcut">H</span>
          </button>
          <button role="tab" aria-selected="${state.currentTab === 'kiosk' ? 'true' : 'false'}" class="nav-tab ${state.currentTab === 'kiosk' ? 'active' : ''}" data-tab="kiosk" title="Press K" style="border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            <span>🖥️ Ferry Kiosk</span><span class="kbd-shortcut">K</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Tab View Content -->
    <main>
      ${renderActiveTab()}
    </main>

    <!-- Purpose & Disclaimer Footer -->
    <footer style="margin-top: 40px; padding: 24px 16px; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; font-size: 0.8rem;">
      <div style="color: #34d399; font-weight: 600;">
        🌿 Community Land Stewardship &bull; 📖 Island Libraries &amp; Public Science &bull; 🏡 Family &amp; Grandparent Safety
      </div>
      <div style="max-width: 860px; background: rgba(245, 158, 11, 0.08); border: 1px dashed rgba(245, 158, 11, 0.35); border-radius: 12px; padding: 12px 18px; color: #fbbf24; font-size: 0.75rem; line-height: 1.5;">
        <strong style="color: #fde68a;">⚠️ Community Disclaimer &amp; Working Draft Notice:</strong>
        <em>"Island Tick Detectives"</em> and related educational concepts were discovered and transcribed from informal public meeting notes and community brainstorming discussions; they are <strong>not an official municipal plan or enacted town program just yet</strong>. This site is an independent, community-driven citizen science resource. It may contain errors at the bottom, is an active work-in-progress that needs an editor, and is not an official resource or formal school board directive. For acute clinical emergencies or definitive medical diagnosis, visit <a href="https://nantuckethospital.org/" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline;">Nantucket Cottage Hospital</a>.
      </div>
    </footer>

    <!-- Tourism Kiosk Attract Mode Screensaver Overlay -->
    ${state.kioskEngine.getIsScreensaver() ? renderKioskScreensaverOverlay() : ''}

    <!-- COPPA Parent & Child Privacy Shield Modal -->
    ${state.showCoppaModal ? state.coppaEngine.renderPrivacyShieldModalHtml() : ''}
  `;

  // If active tab is Map, mount the Leaflet Satellite map
  if (state.currentTab === 'map') {
    state.mapEngine.mountMap('nantucketLeafletMap');
  }
}

function renderActiveTab(): string {
  switch (state.currentTab) {
    case 'map':
      return renderMapTab();
    case 'bodyscan':
      return renderBodyScanTab();
    case 'weather':
      return renderWeatherDesiccationTab();
    case 'radar':
      return renderRadarTab();
    case 'community':
      return renderCommunityPortalTab();
    case 'repellents':
      return renderRepellentsTab();
    case 'articles':
      return renderArticlesTab();
    case 'ferrykit':
      return renderFerryKitTab();
    case 'eisenhower':
      return renderEisenhowerTab();
    case 'sevengen':
      return renderSevenGenerationsTab();
    case 'sources':
      return renderSourcesTab();
    case 'hospital':
      return renderHospitalTab();
    case 'kiosk':
      return renderKioskTab();
    default:
      return renderMapTab();
  }
}

// ─── TAB 1: SATELLITE SPATIAL RADAR & ROUTE PLANNER ──────────────────
function renderMapTab(): string {
  const layers = state.mapEngine.getLayers();
  const activeLoc = state.mapEngine.getActiveLocation();
  const activeRoute = state.mapEngine.getActiveRoute();
  const hospitalTransit = state.mapEngine.getHospitalTransit();
  const allRoutes = state.mapEngine.getAllRoutes();

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Top Banner & Layer Controls -->
      <div class="glass-panel" style="padding: 20px; border-left: 4px solid var(--accent-ocean); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
            <span class="badge badge-ocean font-mono">HIGH-RES SATELLITE ENGINE</span>
            <span class="badge badge-emerald font-mono">INTERACTIVE PAN & ZOOM</span>
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 800;">
            🛰️ Nantucket Island Satellite Spatial Radar & Eco-Routes
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Photorealistic satellite view with scroll zoom, vector risk heatmaps, zero-brush paved corridors, and instant hospital transit.
          </p>
        </div>

        <!-- Basemap Selector & Layer Toggles -->
        <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
          <div style="display: flex; background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 2px;">
            <button class="map-layer-btn ${layers.basemap === 'satellite' ? 'active' : ''}" data-basemap="satellite" style="border: none; padding: 6px 10px; font-size: 0.75rem;">
              🛰️ Satellite
            </button>
            <button class="map-layer-btn ${layers.basemap === 'dark' ? 'active' : ''}" data-basemap="dark" style="border: none; padding: 6px 10px; font-size: 0.75rem;">
              🗺️ Dark Vector
            </button>
            <button class="map-layer-btn ${layers.basemap === 'topo' ? 'active' : ''}" data-basemap="topo" style="border: none; padding: 6px 10px; font-size: 0.75rem;">
              🌲 Topo
            </button>
          </div>

          <button class="map-layer-btn ${layers.showRiskHeatmap ? 'active' : ''}" data-layer="showRiskHeatmap">
            🔥 Risk Heatmap
          </button>
          <button class="map-layer-btn ${layers.showSafeCorridors ? 'active' : ''}" data-layer="showSafeCorridors">
            🚴 Paved Corridors
          </button>
          <button class="map-layer-btn ${layers.showHospitalAndPharmacies ? 'active' : ''}" data-layer="showHospitalAndPharmacies">
            🏥 Hospital & Rx
          </button>
          <button class="map-layer-btn ${layers.showSolarDesiccation ? 'active' : ''}" data-layer="showSolarDesiccation">
            ☀️ Solar Dunes
          </button>
          <button class="map-layer-btn ${layers.showMarineBuoys ? 'active' : ''}" data-layer="showMarineBuoys">
            🌊 Marine Buoys
          </button>
        </div>
      </div>

      <!-- Quick Zoom Location Shortcuts Bar -->
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
          🔍 Quick Zoom:
        </span>
        <button class="map-quick-zoom-btn" data-zoom-preset="overview">
          🌊 Full Island Overview
        </button>
        <button class="map-quick-zoom-btn" data-zoom-preset="sanford">
          🌾 Sanford Farm (7.8 Risk)
        </button>
        <button class="map-quick-zoom-btn" data-zoom-preset="squam">
          🚨 Squam Swamp (9.5 Extreme)
        </button>
        <button class="map-quick-zoom-btn" data-zoom-preset="town">
          🏥 Town & Cottage Hospital
        </button>
        <button class="map-quick-zoom-btn" data-zoom-preset="greatpoint">
          ☀️ Great Point Dunes (0 Risk)
        </button>
      </div>

      <!-- Interactive Leaflet Satellite Map & STAT Hospital Navigation Grid -->
      <div class="map-layout-grid">
        <div class="map-canvas-container" style="border: 2px solid rgba(56, 189, 248, 0.3);">
          <div id="nantucketLeafletMap" style="width: 100%; height: 100%;"></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Selected Location Card -->
          <div class="glass-card" style="padding: 20px; border-left: 4px solid ${activeLoc.riskRating === 'Extreme' || activeLoc.riskRating === 'High' ? 'var(--accent-red)' : 'var(--accent-ocean)'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span class="badge ${activeLoc.riskRating === 'Zero' ? 'badge-emerald' : (activeLoc.riskRating === 'Extreme' ? 'badge-red' : 'badge-amber')} font-mono">
                ${activeLoc.riskRating.toUpperCase()} RISK • ${activeLoc.surfaceType}
              </span>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLoc.name + ' Nantucket MA')}" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: #38bdf8; text-decoration: none;">
                Open in Maps ↗
              </a>
            </div>
            
            <h3 style="font-size: 1.05rem; font-weight: 700; margin-top: 4px; color: var(--text-primary);">
              ${activeLoc.name}
            </h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; margin-top: 4px;">
              ${activeLoc.description}
            </p>
            <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 10px; font-size: 0.75rem; color: #38bdf8; margin-bottom: 12px;">
              <strong>Trail Safety Tip:</strong> ${activeLoc.safetyTip}
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px;">
                <span>Tick Exposure Score:</span>
                <strong style="color: ${activeLoc.tickExposureIndex >= 7 ? '#f87171' : '#34d399'};">${activeLoc.tickExposureIndex} / 10</strong>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${activeLoc.tickExposureIndex * 10}%; background: ${activeLoc.tickExposureIndex >= 7 ? 'linear-gradient(90deg, #fbbf24, #ef4444)' : 'linear-gradient(90deg, #10b981, #0ea5e9)'};"></div>
              </div>
            </div>
          </div>

          <!-- STAT Emergency Hospital Navigator -->
          <div class="glass-card quadrant-q1" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span class="badge badge-red font-mono">STAT 72h EMERGENCY TRANSIT</span>
              <span style="font-size: 1.2rem;">🏥</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: #f87171; margin-bottom: 4px;">
              Fastest Route to Nantucket Hospital
            </h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px;">
              Calculated from <strong>${activeLoc.name.split(' (')[0]}</strong> for emergency Doxycycline prophylaxis:
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.75rem; margin-bottom: 14px;">
              <div style="padding: 8px; background: rgba(7, 9, 14, 0.6); border-radius: 6px; text-align: center;">
                <div class="font-mono" style="font-size: 1.2rem; font-weight: 800; color: #38bdf8;">${hospitalTransit.distanceMiles} mi</div>
                <div style="color: var(--text-muted);">Direct Distance</div>
              </div>
              <div style="padding: 8px; background: rgba(7, 9, 14, 0.6); border-radius: 6px; text-align: center;">
                <div class="font-mono" style="font-size: 1.2rem; font-weight: 800; color: #f87171;">~${hospitalTransit.drivingMinutes} min</div>
                <div style="color: var(--text-muted);">Drive Time (ETA)</div>
              </div>
            </div>
            <a href="${hospitalTransit.googleMapsDirectionsUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="justify-content: center; width: 100%; font-size: 0.8rem; text-decoration: none;">
              🗺️ Open Driving Route in Google Maps ↗
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom: "Tick-Safe Corridor" Route Planner Selector -->
      <div class="glass-card" style="padding: 20px;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
          <span>🚴 "Tick-Safe Corridor" Island Route Planner</span>
          <span class="badge badge-emerald font-mono">ECO-ROUTING</span>
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
          ${allRoutes.map(r => `
            <div class="route-select-card" data-route-id="${r.id}" style="background: ${activeRoute?.id === r.id ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${activeRoute?.id === r.id ? 'var(--accent-ocean)' : 'var(--border-subtle)'}; border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.2s ease;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <h4 style="font-size: 0.85rem; font-weight: 700; color: ${activeRoute?.id === r.id ? '#38bdf8' : 'var(--text-primary)'};">${r.name}</h4>
                <span class="badge ${r.isPavedCorridor ? 'badge-emerald' : 'badge-red'} font-mono" style="font-size: 0.65rem;">
                  ${r.isPavedCorridor ? 'PAVED (SAFE)' : 'HIGH BRUSH'}
                </span>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 8px;">${r.routeSummary}</p>
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
                <span>🚴 ${r.estimatedBikeMinutes}m • 🚶 ${r.estimatedWalkMinutes}m</span>
                <span style="color: ${r.tickExposureScore <= 1.5 ? '#34d399' : '#f87171'}; font-weight: 700;">Score: ${r.tickExposureScore}/10</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ─── TAB 2: 360° BODY INSPECTION HOTSPOT SCAN ─────────────────────────
function renderBodyScanTab(): string {
  const activeZone = state.getSelectedBodyZone();
  const filteredZones = BODY_INSPECTION_ZONES.filter(z => z.view === state.bodyView || z.view === 'both');

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Top Banner -->
      <div class="glass-panel" style="padding: 20px; border-left: 4px solid var(--accent-ocean); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
            <span class="badge badge-ocean font-mono">CLINICAL BODY RADAR</span>
            <span class="badge badge-emerald font-mono">7 CRITICAL ATTACHMENT ZONES</span>
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 800;">
            🧍 360° Interactive Body Inspection Hotspot Map
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Ticks seek warm, hidden crevices. Click any pulsing beacon to inspect targeted search techniques, extraction angles, and freckle differentiation.
          </p>
        </div>

        <!-- View Switcher (Front vs Back) -->
        <div style="display: flex; background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 2px;">
          <button class="map-layer-btn ${state.bodyView === 'front' ? 'active' : ''}" data-body-view="front" style="border: none; padding: 8px 14px; font-size: 0.8rem;">
            Front View
          </button>
          <button class="map-layer-btn ${state.bodyView === 'back' ? 'active' : ''}" data-body-view="back" style="border: none; padding: 8px 14px; font-size: 0.8rem;">
            Back View
          </button>
        </div>
      </div>

      <!-- Mannequin & Hotspot Inspection Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">
        
        <!-- Left: Interactive SVG Mannequin -->
        <div class="body-mannequin-wrapper">
          <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 10px; font-weight: 600; text-transform: uppercase;">
            ${state.bodyView === 'front' ? 'ANTERIOR (FRONT) BODY PROFILE' : 'POSTERIOR (BACK) BODY PROFILE'} • CLICK ANY HOTSPOT
          </div>

          <svg viewBox="0 0 400 560" style="width: 100%; height: auto; display: block; overflow: visible;">
            <g fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" stroke-width="1.8" stroke-linejoin="round">
              <ellipse cx="200" cy="65" rx="36" ry="46" />
              <path d="M188,110 L188,130 L212,130 L212,110 Z" />
              <path d="M140,140 C160,132 240,132 260,140 L280,240 C280,270 260,300 245,310 L245,320 L155,320 L155,310 C140,300 120,270 120,240 Z" />
              <path d="M140,140 L105,250 C100,270 95,300 90,340 C85,350 95,360 100,350 L118,280 L125,210" />
              <path d="M260,140 L295,250 C300,270 305,300 310,340 C315,350 305,360 300,350 L282,280 L275,210" />
              <path d="M155,320 L145,430 L142,500 L130,530 C128,536 142,540 148,535 L165,500 L178,430 L195,320 Z" />
              <path d="M245,320 L255,430 L258,500 L270,530 C272,536 258,540 252,535 L235,500 L222,430 L205,320 Z" />
            </g>

            <!-- Hotspot Beacons -->
            ${filteredZones.map(zone => {
              const isSelected = zone.id === state.selectedBodyZoneId;
              const color = zone.riskTier === 'Critical' ? '#ef4444' : '#f59e0b';
              return `
                <g class="hotspot-beacon" data-zone-id="${zone.id}" transform="translate(${zone.svgCoordinates.x}, ${zone.svgCoordinates.y})">
                  <circle class="pulse" cx="0" cy="0" r="10" fill="none" stroke="${color}" stroke-width="2" />
                  <circle cx="0" cy="0" r="${isSelected ? '10' : '7'}" fill="${color}" stroke="#ffffff" stroke-width="2" />
                  <text x="14" y="4" fill="#f8fafc" font-size="11" font-weight="700" font-family="Inter" filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.9))">
                    ${zone.name.split(' (')[0]}
                  </text>
                </g>
              `;
            }).join('')}
          </svg>
        </div>

        <!-- Right: Active Zone Clinical Card & Extraction Guidance -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          
          <div class="glass-card" style="padding: 24px; border-left: 4px solid ${activeZone.riskTier === 'Critical' ? 'var(--accent-red)' : 'var(--accent-amber)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 2rem;">${activeZone.icon}</span>
                <div>
                  <span class="badge ${activeZone.riskTier === 'Critical' ? 'badge-red' : 'badge-amber'} font-mono">${activeZone.riskTier.toUpperCase()} ATTACHMENT RISK</span>
                  <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${activeZone.name}</h3>
                </div>
              </div>
            </div>

            <!-- Why Ticks Love It -->
            <div style="margin-bottom: 14px;">
              <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--accent-ocean); text-transform: uppercase; margin-bottom: 4px;">
                🌿 Why Ticks Target This Zone:
              </h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">${activeZone.whyTicksLoveIt}</p>
            </div>

            <!-- Inspection Technique -->
            <div style="margin-bottom: 14px; background: rgba(7, 9, 14, 0.5); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
              <h4 style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">
                🔍 Inspection & Hair Parting Technique:
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary);">${activeZone.inspectionTechnique}</p>
            </div>

            <!-- Differentiation Guide -->
            <div style="margin-bottom: 14px; background: rgba(245, 158, 11, 0.08); padding: 12px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3);">
              <h4 style="font-size: 0.8rem; font-weight: 700; color: #fbbf24; text-transform: uppercase; margin-bottom: 4px;">
                💡 Freckle, Scab & Mole Differentiation:
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-primary);">${activeZone.differentiationGuide}</p>
            </div>

            <!-- Safe Extraction Angle -->
            <div style="background: rgba(16, 185, 129, 0.08); padding: 12px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);">
              <h4 style="font-size: 0.8rem; font-weight: 700; color: #34d399; text-transform: uppercase; margin-bottom: 4px;">
                📐 Safe Extraction Geometry:
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-primary);">${activeZone.safeExtractionAngle}</p>
            </div>
          </div>

          <!-- All Zones Quick Selector -->
          <div class="glass-card" style="padding: 16px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">
              Select Hotspot directly:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${BODY_INSPECTION_ZONES.map(z => `
                <button class="preset-pill-btn ${z.id === state.selectedBodyZoneId ? 'active' : ''}" data-zone-select="${z.id}">
                  ${z.icon} ${z.name.split(' (')[0]}
                </button>
              `).join('')}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

// ─── TAB 3: ISLAND WEATHER & DESICCATION RADAR ────────────────────────
function renderWeatherDesiccationTab(): string {
  const analysis = computeIslandDesiccationIndex(
    state.weatherTempF,
    state.weatherHumidity,
    state.weatherWindKnots
  );

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Top Banner -->
      <div class="glass-panel" style="padding: 20px; border-left: 4px solid var(--accent-ocean); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
            <span class="badge badge-ocean font-mono">MICROCLIMATE BIOLOGY</span>
            <span class="badge badge-amber font-mono">VAPOR PRESSURE DEFICIT (VPD)</span>
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 800;">
            ☀️ Nantucket Island Microclimate & Desiccation Radar
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Ticks require >80% relative humidity. Adjust current island weather conditions to forecast questing activity and safe hiking windows.
          </p>
        </div>

        <div style="font-size: 2.2rem;">🌤️</div>
      </div>

      <!-- Presets & Interactive Sliders Grid -->
      <div class="grid-container" style="align-items: start;">
        
        <!-- Left: Interactive Sliders & Presets -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Weather Presets -->
          <div class="glass-card" style="padding: 20px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">
              ⚡ Quick-Select Island Weather Presets:
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${ISLAND_WEATHER_PRESETS.map(p => `
                <button class="weather-preset-btn btn-secondary" data-weather-preset="${p.id}" style="text-align: left; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${p.icon} ${p.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${p.locationContext}</div>
                  </div>
                  <div class="font-mono" style="font-size: 0.75rem; color: #38bdf8;">
                    ${p.tempF}°F • ${p.relativeHumidityPercent}% RH • ${p.windSpeedKnots} kts
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Interactive Environment Sliders -->
          <div class="glass-card" style="padding: 20px;">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 16px;">
              Simulate Island Weather Sliders
            </h3>

            <!-- Temperature Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span>Ambient Air Temperature:</span>
                <strong class="font-mono" style="color: #38bdf8;">${state.weatherTempF}°F (${Math.round(((state.weatherTempF - 32) * 5) / 9)}°C)</strong>
              </div>
              <input type="range" id="tempSlider" min="50" max="95" value="${state.weatherTempF}" class="weather-slider">
            </div>

            <!-- Relative Humidity Slider -->
            <div style="margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span>Relative Humidity (RH):</span>
                <strong class="font-mono" style="color: ${state.weatherHumidity >= 80 ? '#f87171' : '#34d399'};">${state.weatherHumidity}%</strong>
              </div>
              <input type="range" id="humiditySlider" min="30" max="100" value="${state.weatherHumidity}" class="weather-slider">
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                <span>30% (Bone Dry)</span>
                <span>80% (Critical Tick Threshold)</span>
                <span>100% (Dense Fog)</span>
              </div>
            </div>

            <!-- Wind Speed Slider -->
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span>Coastal Wind Speed:</span>
                <strong class="font-mono" style="color: #38bdf8;">${state.weatherWindKnots} KNOTS</strong>
              </div>
              <input type="range" id="windSlider" min="0" max="35" value="${state.weatherWindKnots}" class="weather-slider">
              <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
                <span>0 kts (Stagnant Air)</span>
                <span>15 kts (Moorland Breeze)</span>
                <span>35 kts (Gale Desiccation)</span>
              </div>
            </div>

          </div>

        </div>

        <!-- Right: Telemetry Gauge & Biological Risk Breakdown -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Live Questing Index Card -->
          <div class="glass-card" style="padding: 24px; border-left: 4px solid ${analysis.tickQuestingRiskIndex >= 65 ? 'var(--accent-red)' : (analysis.tickQuestingRiskIndex <= 35 ? 'var(--accent-emerald)' : 'var(--accent-amber)')};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div>
                <span class="badge ${analysis.tickQuestingRiskIndex >= 65 ? 'badge-red' : (analysis.tickQuestingRiskIndex <= 35 ? 'badge-emerald' : 'badge-amber')} font-mono">
                  ${analysis.riskTier.toUpperCase()}
                </span>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
                  Tick Questing Risk Index
                </h3>
              </div>
              <div class="font-mono" style="text-align: right;">
                <div style="font-size: 2rem; font-weight: 800; color: ${analysis.tickQuestingRiskIndex >= 65 ? '#f87171' : (analysis.tickQuestingRiskIndex <= 35 ? '#34d399' : '#fbbf24')};">
                  ${analysis.tickQuestingRiskIndex}/100
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">Questing Score</div>
              </div>
            </div>

            <!-- Progress Meter -->
            <div class="progress-bar-bg" style="height: 12px; margin-bottom: 16px;">
              <div class="progress-bar-fill" style="width: ${analysis.tickQuestingRiskIndex}%; background: ${analysis.tickQuestingRiskIndex >= 65 ? 'linear-gradient(90deg, #fbbf24, #ef4444)' : (analysis.tickQuestingRiskIndex <= 35 ? 'linear-gradient(90deg, #10b981, #0ea5e9)' : 'linear-gradient(90deg, #38bdf8, #fbbf24)')};"></div>
            </div>

            <!-- Vapor Pressure Deficit Metric -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
              <div style="background: rgba(7, 9, 14, 0.6); padding: 12px; border-radius: 8px; text-align: center;">
                <div class="font-mono" style="font-size: 1.2rem; font-weight: 800; color: #38bdf8;">${analysis.vaporPressureDeficitKpa} kPa</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">Vapor Pressure Deficit (VPD)</div>
              </div>
              <div style="background: rgba(7, 9, 14, 0.6); padding: 12px; border-radius: 8px; text-align: center;">
                <div class="font-mono" style="font-size: 1.2rem; font-weight: 800; color: ${state.weatherHumidity >= 80 ? '#f87171' : '#34d399'};">${state.weatherHumidity}%</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">Relative Humidity</div>
              </div>
            </div>

            <!-- Microclimate Summary -->
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5;">
              ${analysis.microclimateSummary}
            </p>

            <!-- Action Directive -->
            <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 12px; font-size: 0.8rem; color: #38bdf8;">
              <strong>Trail Strategy:</strong> ${analysis.trailSafetyAdvice}
            </div>
          </div>

        </div>

      </div>

      <!-- NOAA & Coastal Buoy Marine Layer Radar Panel -->
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid #0ea5e9;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span class="badge badge-ocean font-mono">NOAA NDBC & NERACOOS LIVE TELEMETRY</span>
              <span class="badge badge-emerald font-mono">4 OFFSHORE STATIONS</span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">
              🌊 NOAA & Coastal Buoy Marine Layer Radar
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 800px; margin-top: 4px;">
              Cold Atlantic waters meet humid air to create the heavy <strong>Nantucket Sea Fog</strong> (RH &gt;90%). When the marine layer rolls in, blacklegged tick nymphs quest freely without drying out.
            </p>
          </div>
          <a href="https://www.ndbc.noaa.gov/maps/Northeast.shtml" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="font-size: 0.75rem; text-decoration: none;">
            🌐 View NOAA Northeast Buoys ↗
          </a>
        </div>

        <!-- 4 Buoy Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
          ${COASTAL_BUOY_STATIONS.map(buoy => {
            const isFoggy = buoy.seaFogStatus === 'Dense Marine Fog';
            return `
              <div class="glass-card" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid ${isFoggy ? 'var(--accent-red)' : '#0ea5e9'};">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                      <span class="badge badge-ocean font-mono" style="font-size: 0.7rem;">${buoy.agency}</span>
                      <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
                        ${buoy.name}
                      </h4>
                    </div>
                    <span class="badge ${isFoggy ? 'badge-red' : 'badge-emerald'} font-mono" style="font-size: 0.7rem;">
                      ${buoy.seaFogStatus}
                    </span>
                  </div>

                  <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">
                    📍 ${buoy.locationDescription} &bull; <strong style="color: var(--text-secondary);">${buoy.distanceFromIsland}</strong>
                  </p>

                  <!-- Telemetry Grid -->
                  <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px; margin-bottom: 12px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.75rem;">
                      <div><span style="color: var(--text-muted);">🌊 Ocean Temp:</span> <strong class="font-mono" style="color: #38bdf8;">${buoy.waterTempF}°F</strong></div>
                      <div><span style="color: var(--text-muted);">🌡️ Air Temp:</span> <strong class="font-mono" style="color: #fbfdfa;">${buoy.airTempF}°F</strong></div>
                      <div><span style="color: var(--text-muted);">💧 Rel Humidity:</span> <strong class="font-mono" style="color: ${buoy.relativeHumidityPercent >= 85 ? '#f87171' : '#34d399'};">${buoy.relativeHumidityPercent}%</strong></div>
                      <div><span style="color: var(--text-muted);">💨 Wind:</span> <strong class="font-mono" style="color: #fbfdfa;">${buoy.windSpeedKnots} kts ${buoy.windDirectionCardinal}</strong></div>
                      <div><span style="color: var(--text-muted);">🌊 Swell:</span> <strong class="font-mono" style="color: #fbbf24;">${buoy.waveHeightFt} ft (${buoy.wavePeriodSec}s)</strong></div>
                      <div><span style="color: var(--text-muted);">👁️ Visibility:</span> <strong class="font-mono" style="color: var(--text-secondary);">${buoy.visibilityMiles} NM</strong></div>
                    </div>
                  </div>

                  <!-- Tick Ecology Impact -->
                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.4;">
                    <strong style="color: #fb923c;">Tick Ecology Impact:</strong> ${buoy.tickEcologyImpact}
                  </div>

                  <!-- Ferry Transit Note -->
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 14px;">
                    <strong>🚢 Ferry / Water Transit:</strong> ${buoy.ferryCrossingAdvice}
                  </div>
                </div>

                <!-- Card Actions -->
                <div style="display: flex; gap: 8px; align-items: center;">
                  <button class="btn-primary" data-apply-buoy="${buoy.id}" style="flex: 1; font-size: 0.75rem; padding: 8px 12px; justify-content: center;" title="Apply ${buoy.airTempF}°F, ${buoy.relativeHumidityPercent}% RH, ${buoy.windSpeedKnots} kts to Desiccation Index">
                    🔄 Apply Buoy Conditions
                  </button>
                  <a href="${buoy.noaaUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="font-size: 0.75rem; padding: 8px 12px; text-decoration: none;" title="Open official station page">
                    NOAA ↗
                  </a>
                </div>

              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}

// ─── TAB 4: 72H TRIAGE & OPTICAL ENGORGEMENT ───────────────────────────
function renderRadarTab(): string {
  const dwellAssessment = assessDwellTimeAndProphylaxis(
    state.attachmentHours,
    state.hoursSinceRemoval,
    state.selectedSpecies
  );

  const radarScores = computeCoInfectionRadar(
    state.selectedSpecies,
    { ...state.symptoms, attachmentHours: state.attachmentHours }
  );

  const bayesianResults = evaluateBayesianTriage(
    state.selectedSpecies,
    { ...state.symptoms, attachmentHours: state.attachmentHours }
  );
  const lymeBayes = bayesianResults.find(b => b.pathogenId === 'lyme_borrelia') || bayesianResults[0];

  const engorgementStage = getEngorgementStageForHours(state.attachmentHours);
  const hasTimingInconsistency = state.attachmentHours < 6 && (state.symptoms.hasErythemaMigrans || state.symptoms.hasFacialDroop);

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Triage Mode Banner (Displayed inside Triage Tab) -->
      <div class="glass-panel" style="padding: 18px 24px; border-left: 4px solid ${dwellAssessment.doxycyclineProphylaxisEligible ? 'var(--accent-red)' : 'var(--accent-ocean)'}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <span class="badge ${dwellAssessment.doxycyclineProphylaxisEligible ? 'badge-red' : 'badge-ocean'} font-mono" style="font-size: 0.8rem;">
            ${state.attachmentHours === 0 ? '🟢 NO BITE / 0h ATTACHMENT' : `${state.selectedSpecies.replace('_', ' ').toUpperCase()} • ${state.attachmentHours}h ATTACHED`}
          </span>

          <div style="font-size: 0.85rem; color: var(--text-primary);">
            Prophylaxis Status: <strong style="color: ${dwellAssessment.doxycyclineProphylaxisEligible ? '#f87171' : '#34d399'};">
              ${state.attachmentHours === 0 ? 'No Antibiotic Prophylaxis Needed' : (dwellAssessment.doxycyclineProphylaxisEligible ? `🚨 DOXY ELIGIBLE (${dwellAssessment.hoursRemainingIn72hWindow}h left in window)` : '🟢 Watchful Waiting')}
            </strong>
          </div>
        </div>

        <button id="quickResetBtn" class="preset-pill-btn" style="color: #f87171; border-color: rgba(239, 68, 68, 0.4);">
          🔄 Reset Triage Inputs
        </button>
      </div>

      <!-- Optical Engorgement Reference Scale & Bacterial Switch -->
      <div class="engorgement-visualizer-card" style="border-left: 4px solid ${engorgementStage.visualColor};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <span class="badge font-mono" style="background: rgba(255,255,255,0.1); color: ${engorgementStage.visualColor};">
              OPTICAL SILHOUETTE COMPARISON • ${state.attachmentHours} HOURS
            </span>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 4px;">
              🔍 Optical Engorgement & Bacterial Migration Switch
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              Current physical profile resembles a <strong>${engorgementStage.everydayObjectComparison}</strong> (~${engorgementStage.sizeMm} mm width).
            </p>
          </div>

          <div class="font-mono" style="text-align: right;">
            <div style="font-size: 1.6rem; font-weight: 800; color: ${engorgementStage.visualColor};">
              ${engorgementStage.transmissionRiskPercent}%
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Lyme Transmission Probability</div>
          </div>
        </div>

        <!-- 5-Stage Physical Reference Scale Pills -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px;">
          ${ENGORGEMENT_STAGES.map(stage => {
            const isCurrent = (state.attachmentHours <= 12 && stage.hours === 0) ||
              (state.attachmentHours > 12 && state.attachmentHours <= 30 && stage.hours === 24) ||
              (state.attachmentHours > 30 && state.attachmentHours <= 42 && stage.hours === 36) ||
              (state.attachmentHours > 42 && state.attachmentHours <= 60 && stage.hours === 48) ||
              (state.attachmentHours > 60 && stage.hours === 72);
            return `
              <div style="background: ${isCurrent ? 'rgba(56, 189, 248, 0.2)' : 'rgba(7, 9, 14, 0.5)'}; border: 1px solid ${isCurrent ? 'var(--accent-ocean)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 10px; text-align: center;">
                <div style="font-size: 1.2rem; margin-bottom: 2px;">
                  ${stage.hours === 0 ? '🌱' : (stage.hours === 24 ? '🌾' : (stage.hours === 36 ? '🟡' : (stage.hours === 48 ? '🟠' : '🔴')))}
                </div>
                <div style="font-size: 0.75rem; font-weight: 700; color: ${isCurrent ? '#38bdf8' : 'var(--text-primary)'};">${stage.everydayObjectComparison}</div>
                <div class="font-mono" style="font-size: 0.65rem; color: var(--text-muted);">${stage.hours}h (${stage.sizeMm}mm)</div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Biological Switch Status -->
        <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: center;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span class="badge badge-purple font-mono" style="font-size: 0.7rem;">MOLECULAR SWITCH: ${engorgementStage.ospSwitchState.toUpperCase()}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              ${engorgementStage.bacterialState}
            </p>
          </div>
          <div style="text-align: center; border-left: 1px solid var(--border-subtle); padding-left: 12px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px;">Prophylaxis Indication:</div>
            <strong style="color: ${engorgementStage.doxycyclineIndicated ? '#f87171' : '#34d399'}; font-size: 0.85rem;">
              ${engorgementStage.doxycyclineIndicated ? '✅ Single-Dose Doxy 200mg' : 'ℹ️ Watchful Waiting (30d)'}
            </strong>
          </div>
        </div>
      </div>

      <!-- 📐 Interactive Bayesian Fagan Nomogram Lens -->
      ${renderFaganNomogramSvg(lymeBayes)}

      <!-- 🪲 100 Nymphs of Nantucket Population Grid -->
      ${render100NymphsPopulationGrid()}

      <!-- 🏛️ Kay Hagan Tick Act (PL 116-94) Federal Arbovirus Defense Card -->
      <div style="background: rgba(9, 9, 11, 0.7); border-left: 4px solid #c084fc; border-radius: 10px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="max-width: 750px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="badge badge-purple font-mono" style="font-size: 0.75rem;">PUBLIC LAW 116-94</span>
            <strong style="color: #c084fc; font-size: 0.95rem;">Kay Hagan Tick Act • Powassan Arbovirus Transmission Warning (<15 Min)</strong>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
            Unlike Lyme spirochetes which require >=36h to activate salivary migration, <strong>Powassan virus (Flaviviridae)</strong> resides directly in tick salivary glands and can transmit in under 15 minutes. If sudden confusion, high fever (103°F+), or ataxia occur following a bite, seek immediate NCH Emergency Department evaluation.
          </p>
        </div>
        <button class="nav-tab" data-tab="articles" data-art-slug="kay-hagan-tick-act-and-powassan-defense" style="padding: 8px 16px; font-size: 0.8rem; background: rgba(192, 132, 252, 0.15); border: 1px solid rgba(192, 132, 252, 0.4); border-radius: 8px; color: #c084fc; cursor: pointer; white-space: nowrap;">
          📖 Read Full Tick Act Guide →
        </button>
      </div>

      <!-- Quick-Select Presets & Interactive Inputs Grid -->
      <div class="grid-container" style="align-items: start;">
        
        <!-- Left Column: Sliders & Species -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <div class="glass-card" style="padding: 16px;">
            <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
              ⚡ Quick-Select Scenario Presets:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button class="preset-pill-btn" data-preset="flat_nymph">
                🟢 Just Found Flat Nymph (0h, Safe)
              </button>
              <button class="preset-pill-btn" data-preset="swollen_48h">
                🚨 Swollen Overnight Bite (48h, Doxy Indicated)
              </button>
              <button class="preset-pill-btn" data-preset="dog_tick_beach">
                🐕 Beach Dog Tick (6h, Low Risk)
              </button>
            </div>
          </div>

          <!-- Attachment Dwell Time Slider -->
          <div class="glass-card" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="font-size: 1rem; font-weight: 700;">Attachment Dwell Time</h3>
              <span class="badge badge-emerald font-mono" style="font-size: 0.9rem;">${state.attachmentHours} HOURS</span>
            </div>

            <input type="range" id="attachmentSlider" min="0" max="96" value="${state.attachmentHours}" style="margin-bottom: 12px;">

            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 16px;">
              <span>0h (Unattached)</span>
              <span>24h (Low Risk)</span>
              <span>36h (IDSA Threshold)</span>
              <span>72h+ (High Risk)</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <label style="font-size: 0.85rem; color: var(--text-secondary);">Hours Elapsed Since Tick Removal:</label>
              <span class="badge badge-amber font-mono">${state.hoursSinceRemoval} HOURS</span>
            </div>
            <input type="range" id="removalSlider" min="0" max="96" value="${state.hoursSinceRemoval}">
          </div>

          <!-- Species Selection -->
          <div class="glass-card" style="padding: 20px;">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">Identified Tick Species</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <label style="background: ${state.selectedSpecies === 'ixodes_nymph' ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${state.selectedSpecies === 'ixodes_nymph' ? 'var(--accent-ocean)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;">
                <input type="radio" name="species" value="ixodes_nymph" ${state.selectedSpecies === 'ixodes_nymph' ? 'checked' : ''} style="display: none;">
                <div style="height: 70px; border-radius: 6px; overflow: hidden;">
                  <img src="/images/deer_tick.jpg" alt="Deer Tick Nymph" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="font-weight: 600; font-size: 0.8rem; color: #38bdf8;">Blacklegged Nymph (Deer Tick)</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">Poppy-seed size (1–2mm) • 85%+ of Lyme cases</div>
              </label>

              <label style="background: ${state.selectedSpecies === 'ixodes_adult' ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${state.selectedSpecies === 'ixodes_adult' ? 'var(--accent-ocean)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;">
                <input type="radio" name="species" value="ixodes_adult" ${state.selectedSpecies === 'ixodes_adult' ? 'checked' : ''} style="display: none;">
                <div style="height: 70px; border-radius: 6px; overflow: hidden;">
                  <img src="/images/deer_tick.jpg" alt="Deer Tick Adult" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="font-weight: 600; font-size: 0.8rem; color: #38bdf8;">Blacklegged Adult Female</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">Sesame-seed size with reddish abdomen</div>
              </label>

              <label style="background: ${state.selectedSpecies === 'dermacentor_dog' ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${state.selectedSpecies === 'dermacentor_dog' ? 'var(--accent-ocean)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;">
                <input type="radio" name="species" value="dermacentor_dog" ${state.selectedSpecies === 'dermacentor_dog' ? 'checked' : ''} style="display: none;">
                <div style="height: 70px; border-radius: 6px; overflow: hidden;">
                  <img src="/images/dog_tick.jpg" alt="Dog Tick" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="font-weight: 600; font-size: 0.8rem; color: #fbbf24;">American Dog Tick</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">Larger (5mm) with silver-white markings</div>
              </label>

              <label style="background: ${state.selectedSpecies === 'amblyomma_lonestar' ? 'rgba(14, 165, 233, 0.2)' : 'var(--bg-surface-elevated)'}; border: 1px solid ${state.selectedSpecies === 'amblyomma_lonestar' ? 'var(--accent-ocean)' : 'var(--border-subtle)'}; border-radius: 8px; padding: 10px; cursor: pointer; display: flex; flex-direction: column; gap: 6px;">
                <input type="radio" name="species" value="amblyomma_lonestar" ${state.selectedSpecies === 'amblyomma_lonestar' ? 'checked' : ''} style="display: none;">
                <div style="height: 70px; border-radius: 6px; overflow: hidden;">
                  <img src="/images/lonestar_tick.jpg" alt="Lone Star Tick" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="font-weight: 600; font-size: 0.8rem; color: #c084fc;">Lone Star Tick</div>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">White dorsal dot • Alpha-Gal allergy vector</div>
              </label>
            </div>
          </div>

        </div>

        <!-- Right Column: Symptoms & Co-Infection Radar -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Symptom Checklist -->
          <div class="glass-card" style="padding: 20px;">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">Active or Emerging Symptoms</h3>

            ${hasTimingInconsistency ? `
              <div class="clinical-guardrail-notice" style="margin-bottom: 14px;">
                <span>⚠️</span>
                <div>
                  <strong>Clinical Timing Note:</strong> Erythema migrans rashes require 3 to 30 days. If present with an attached tick of only ${state.attachmentHours}h dwell, this stems from an earlier unrecognized bite.
                </div>
              </div>
            ` : ''}

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.8rem;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox" data-symptom="hasErythemaMigrans" ${state.symptoms.hasErythemaMigrans ? 'checked' : ''}>
                <span>🎯 Expanding Rash (>5cm)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox" data-symptom="hasFeverChills" ${state.symptoms.hasFeverChills ? 'checked' : ''}>
                <span>🌡️ Spiking Fevers / Chills</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox" data-symptom="hasDrenchingSweats" ${state.symptoms.hasDrenchingSweats ? 'checked' : ''}>
                <span>💦 Drenching Sweats (Babesia)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox" data-symptom="hasDarkUrineJaundice" ${state.symptoms.hasDarkUrineJaundice ? 'checked' : ''}>
                <span>🧪 Dark Tea Urine (Hemolysis)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox" data-symptom="hasJointPainSwelling" ${state.symptoms.hasJointPainSwelling ? 'checked' : ''}>
                <span>🦴 Joint Swelling (Knee)</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" class="custom-checkbox" data-symptom="hasFacialDroop" ${state.symptoms.hasFacialDroop ? 'checked' : ''}>
                <span>🤕 Facial Droop (Bell's Palsy)</span>
              </label>
            </div>
          </div>

          <!-- Co-Infection Radar Distribution -->
          <div class="glass-card" style="padding: 20px;">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 14px;">Multi-Vector Pathogen Differential</h3>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${radarScores.map(score => `
                <div style="background: rgba(7, 9, 14, 0.5); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <div>
                      <strong style="font-size: 0.85rem; color: var(--text-primary);">${score.pathogenName}</strong>
                      <span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic;"> (${score.organism})</span>
                    </div>
                    <span class="badge ${score.probabilityPercent >= 70 ? 'badge-red' : (score.probabilityPercent >= 40 ? 'badge-amber' : 'badge-ocean')} font-mono" style="font-size: 0.65rem;">
                      ${score.probabilityPercent}% • ${score.riskLevel}
                    </span>
                  </div>
                  <div class="progress-bar-bg" style="margin-bottom: 6px;">
                    <div class="progress-bar-fill" style="width: ${score.probabilityPercent}%; background: ${score.probabilityPercent >= 70 ? 'linear-gradient(90deg, #f87171, #ef4444)' : 'linear-gradient(90deg, #38bdf8, #0ea5e9)'};"></div>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--accent-ocean);">
                    <strong>Action:</strong> ${score.recommendedAction}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}

// ─── TAB 5: ISLAND RANGER & COMMUNITY UPDATE HUB ───────────────────────
function renderCommunityPortalTab(): string {
  const logs = state.communityStore.getMaintenanceLogs();
  const barberryHotspots = state.communityStore.getBarberryHotspots();
  const pharmacy = state.communityStore.getPharmacyData();
  const smsReports = state.communityStore.getSmsReports();
  const selectedQrTrail = NANTUCKET_TRAILS.find(t => t.id === state.selectedQrTrailId) || NANTUCKET_TRAILS[0];
  const qrSvg = state.communityStore.generateTrailheadSvgQr(selectedQrTrail.id);

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Top Banner -->
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-emerald); background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-surface) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span class="badge badge-emerald font-mono">ISLAND COMMUNITY CO-OP</span>
              <span class="badge badge-ocean font-mono">ZERO-FRICTION UPDATES</span>
            </div>
            <h2 style="font-size: 1.25rem; font-weight: 800;">
              🌲 Island Community & Trail Stewardship Hub
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 820px;">
              Empowering island residents, trail walkers, landscapers, and pharmacists to check mowing status, flag invasive barberry clusters, and log field sightings in seconds.
            </p>
          </div>

          <!-- 1-Click Town Select Board CSV Export -->
          <div>
            <button id="downloadCsvExportBtn" class="btn-primary" style="font-size: 0.8rem;">
              📥 Export Town Board CSV Data
            </button>
          </div>
        </div>
      </div>

      <!-- Real-Time Local Pharmacy & Clinic Ticker -->
      <div class="glass-card" style="padding: 20px; border-left: 4px solid var(--accent-ocean);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <span class="badge badge-ocean font-mono">HIPAA-SAFE COMMUNITY TELEMETRY</span>
            <h3 style="font-size: 1.05rem; font-weight: 700; margin-top: 4px;">
              💊 Nantucket Pharmacy & Clinic Acute Prophylaxis Ticker
            </h3>
          </div>
          <span class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">
            Updated: ${pharmacy.lastUpdatedDate} • Anonymous aggregate counts
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
          <!-- Dan's Pharmacy -->
          <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
                <a href="https://danspharmacynantucket.com/" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: none;">Dan's Pharmacy (Pleasant St) ↗</a>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Single-Dose Doxy Dispensed</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="font-mono" style="font-size: 1.5rem; font-weight: 800; color: #38bdf8;">${pharmacy.dansPharmacyDoxyDispensedThisWeek}</span>
              <button class="pharmacy-increment-btn preset-pill-btn" data-pharmacy="dans" title="+1 Log Dispensed Doxy">+</button>
            </div>
          </div>

          <!-- Nantucket Pharmacy -->
          <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
                <a href="https://nantucketpharmacy.com/" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: none;">Nantucket Pharmacy (Main St) ↗</a>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Single-Dose Doxy Dispensed</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="font-mono" style="font-size: 1.5rem; font-weight: 800; color: #38bdf8;">${pharmacy.nantucketPharmacyDoxyDispensedThisWeek}</span>
              <button class="pharmacy-increment-btn preset-pill-btn" data-pharmacy="nantucket" title="+1 Log Dispensed Doxy">+</button>
            </div>
          </div>

          <!-- NCH Walk-In -->
          <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #f87171;">
                <a href="https://nantuckethospital.org/" target="_blank" rel="noopener noreferrer" style="color: #f87171; text-decoration: none;">NCH Walk-In Clinic ↗</a>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">Acute Tick Encounters</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="font-mono" style="font-size: 1.5rem; font-weight: 800; color: #f87171;">${pharmacy.nchWalkInTriageCasesThisWeek}</span>
              <button class="pharmacy-increment-btn preset-pill-btn" data-pharmacy="nch" title="+1 Log Walk-In Visit">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid 1: Trailhead QR Kiosk Generator & (508) ACK-TICK SMS Simulator -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
        
        <!-- Trailhead Weatherproof QR Sign Generator -->
        <div class="glass-card" style="padding: 20px;">
          <span class="badge badge-emerald font-mono">PHYSICAL TRAILHEAD INTEGRATION</span>
          <h3 style="font-size: 1.05rem; font-weight: 700; margin-top: 4px; margin-bottom: 8px;">
            📲 10-Second Trailhead QR Kiosk Sign
          </h3>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px;">
            Select any island conservation parcel to preview the printable weatherproof trailhead QR sign:
          </p>

          <div style="margin-bottom: 14px;">
            <select id="qrTrailSelect" style="width: 100%; padding: 10px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-primary); font-size: 0.85rem;">
              ${NANTUCKET_TRAILS.map(t => `
                <option value="${t.id}" ${t.id === state.selectedQrTrailId ? 'selected' : ''}>${t.name} (${t.conservationGroup})</option>
              `).join('')}
            </select>
          </div>

          <!-- Printable Trail Sign Preview Box -->
          <div style="background: #0f172a; border: 2px dashed rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px;">
            <div style="flex-shrink: 0;">
              ${qrSvg}
            </div>
            <div>
              <div style="font-size: 0.65rem; color: var(--accent-ocean); font-weight: 800; text-transform: uppercase;">NANTUCKET CONSERVATION TRAILHEAD</div>
              <div style="font-weight: 800; font-size: 0.95rem; color: #ffffff; margin-top: 2px;">${selectedQrTrail.name}</div>
              <div style="font-size: 0.75rem; color: #94a3b8; margin: 4px 0;">Scan with Phone Camera &bull; 10-Second Quick Report</div>
              <button id="simulateQrScanBtn" class="btn-primary" style="font-size: 0.75rem; padding: 4px 10px;">
                🚀 Simulate 10-Second Scan
              </button>
            </div>
          </div>
        </div>

        <!-- Island SMS Text-to-Log Simulator -->
        <div class="glass-card" style="padding: 20px;">
          <span class="badge badge-purple font-mono">SMS NATURAL LANGUAGE BOT</span>
          <h3 style="font-size: 1.05rem; font-weight: 700; margin-top: 4px; margin-bottom: 8px;">
            💬 Text-to-Log Line: (508) ACK-TICK
          </h3>
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px;">
            For islanders, fishermen, and landscapers texting sightings on the move:
          </p>

          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <input type="text" id="smsInput" placeholder="e.g. Found 2 nymphs on dog at Sanford Farm" value="${state.smsInputText}" style="flex: 1; padding: 10px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-primary); font-size: 0.85rem;">
            <button id="sendSmsBtn" class="btn-primary" style="font-size: 0.8rem; padding: 0 14px;">
              Send SMS
            </button>
          </div>

          <!-- Live Parsed SMS Stream -->
          <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px; max-height: 150px; overflow-y: auto;">
            ${smsReports.length === 0 ? `
              <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 10px;">
                Try sending a text above to see instant AI entity extraction!
              </div>
            ` : smsReports.map(rep => `
              <div style="border-bottom: 1px solid var(--border-subtle); padding: 6px 0; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between; color: var(--text-primary);">
                  <strong>"${rep.rawText}"</strong>
                  <span class="font-mono" style="color: var(--text-muted);">${rep.dateParsed}</span>
                </div>
                <div style="color: #38bdf8; margin-top: 2px;">
                  &rarr; Matched: <strong>${rep.matchedTrailName.split(' (')[0]}</strong> &bull; Species: <strong>${rep.matchedSpecies}</strong> &bull; Host: <strong>${rep.matchedHost}</strong> &bull; Count: <strong>${rep.tickCount}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Grid 2: Ranger Maintenance Logger & Barberry Eradication Map -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
        
        <!-- Community Trail Maintenance & Mowing Logger -->
        <div class="glass-card" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">
              🚜 Community Trail Mowing & Maintenance Logs
            </h3>
            <span class="badge badge-emerald font-mono">${logs.length} VERIFIED LOGS</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;">
            ${logs.map(log => `
              <div style="background: rgba(7, 9, 14, 0.5); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <strong style="font-size: 0.85rem; color: #38bdf8;">${log.trailName}</strong>
                  <span class="badge badge-ocean font-mono" style="font-size: 0.65rem;">${log.date}</span>
                </div>
                <div style="font-size: 0.75rem; color: var(--text-primary); font-weight: 600;">${log.actionType}</div>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 4px 0;">${log.trailNotes || log.rangerNotes || ''}</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-muted);">
                  <span>Steward: ${log.stewardGroup.split(' (')[0]}</span>
                  <span>${log.reportedBy || log.verifiedByRanger || ''}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Japanese Barberry Hotspot Tracker -->
        <div class="glass-card" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">
              🌿 Japanese Barberry Invasive Cluster Map
            </h3>
            <span class="badge badge-amber font-mono">12X NYMPH MULTIPLIER</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto;">
            ${barberryHotspots.map(b => `
              <div style="background: rgba(7, 9, 14, 0.5); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="font-size: 0.85rem; color: var(--text-primary);">${b.locationName}</strong>
                  <span class="badge ${b.status === 'Cleared & Restored' ? 'badge-emerald' : (b.status === 'Volunteer Crew Assigned' ? 'badge-ocean' : 'badge-red')} font-mono" style="font-size: 0.65rem;">
                    ${b.status}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px;">
                  <span>Cluster Size: <strong>${b.clusterSizeSqFt} sq ft</strong></span>
                  <span class="font-mono" style="color: var(--text-muted);">${b.lat.toFixed(3)}, ${b.lng.toFixed(3)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: var(--text-muted);">
                  <span>Flagged by ${b.flaggedBy} on ${b.dateFlagged}</span>
                  ${b.status !== 'Cleared & Restored' ? `
                    <button class="mark-barberry-cleared-btn preset-pill-btn" data-barb-id="${b.id}" style="color: #34d399; font-size: 0.65rem; padding: 2px 6px;">
                      Mark Cleared &check;
                    </button>
                  ` : '<span style="color: #34d399; font-weight: 700;">Restored to native ferns &check;</span>'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- ================================================================= -->
      <!-- SECTION 3: UPCOMING ISLAND CIVIC & COMMUNITY EVENTS CALENDAR      -->
      <!-- ================================================================= -->
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-ocean);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span class="badge badge-ocean font-mono">ISLAND CIVIC CALENDAR</span>
              <span class="badge badge-emerald font-mono">100% FREE PUBLIC ADMISSION</span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">
              📅 Upcoming Island Civic & Community Events
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 800px; margin-top: 4px;">
              Public workshops, town health hearings, family ecology walks, and grandparent wellness mornings hosted by the <strong>Nantucket Atheneum</strong>, <strong>Board of Health</strong>, <strong>Saltmarsh Senior Center</strong>, and <strong>Maria Mitchell Association</strong>.
            </p>
          </div>

          <!-- Event Category Filter Pills -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${[
              { id: 'all', label: 'All Events' },
              { id: 'Library Workshop', label: '📚 Library Workshops' },
              { id: 'Public Hearing', label: '🏛️ Public Hearings' },
              { id: 'Family Nature Walk', label: '🌲 Family Walks' },
              { id: 'Senior Wellness', label: '👵 Senior Wellness' },
              { id: 'Citizen Science', label: '🔬 Citizen Science' }
            ].map(cat => `
              <button class="preset-pill-btn ${state.selectedCivicEventCategory === cat.id ? 'active' : ''}" data-event-cat="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Events Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
          ${UPCOMING_ISLAND_CIVIC_EVENTS
            .filter(ev => state.selectedCivicEventCategory === 'all' || ev.category === state.selectedCivicEventCategory)
            .map(ev => `
              <div class="glass-card" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between; border-left: 3px solid var(--accent-ocean);">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <span class="badge badge-ocean font-mono" style="font-size: 0.68rem;">${ev.category}</span>
                    <span class="badge badge-emerald font-mono" style="font-size: 0.68rem;">FREE EVENT</span>
                  </div>

                  <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">
                    ${ev.title}
                  </h4>

                  <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 700; margin-bottom: 2px;">
                    🗓️ ${ev.date} &bull; ⏰ ${ev.time}
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 10px;">
                    📍 ${ev.location} &bull; 🏛️ <em>${ev.organizer}</em>
                  </div>

                  <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.45;">
                    ${ev.description}
                  </p>

                  <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 10px; font-size: 0.75rem; margin-bottom: 10px;">
                    <strong style="color: #fb923c;">🏡 Grandparent & Family Note:</strong> ${ev.familyAndGrandparentBenefit}
                  </div>

                  <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px; font-size: 0.75rem; margin-bottom: 12px;">
                    <strong style="color: #34d399;">📖 Librarian Tip:</strong> ${ev.librarianTip}
                  </div>
                </div>

                <div style="font-size: 0.7rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
                  <strong>Contact & Info:</strong> ${ev.rsvpOrContact}
                </div>
              </div>
            `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- SECTION 4: NANTUCKET TOWN HALL & PUBLIC MEETING NOTES ARCHIVE     -->
      <!-- ================================================================= -->
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid #f97316;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span class="badge badge-ocean font-mono">OFFICIAL MUNICIPAL ARCHIVE</span>
              <span class="badge badge-emerald font-mono">PUBLIC HEARING RECORDS</span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">
              🏛️ Nantucket Town Hall & Public Meeting Notes Archive
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 800px; margin-top: 4px;">
              Verified public minutes, votes, resident comments, and policy decisions from the <strong>Board of Health</strong>, <strong>Select Board</strong>, <strong>Atheneum Science Forums</strong>, and <strong>Senior Center</strong>. Double-click any card to view the 6th-Grade family summary!
            </p>
          </div>

          <!-- Meeting Filter Pills -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${[
              { id: 'all', label: 'All Minutes' },
              { id: 'Nantucket Board of Health', label: '🏥 Board of Health' },
              { id: 'Nantucket Select Board', label: '🏛️ Select Board' },
              { id: 'Nantucket Atheneum Science Forum', label: '📚 Atheneum Science' },
              { id: 'Saltmarsh Senior Center Advisory', label: '👵 Senior Center' },
              { id: 'Nantucket Public Schools Committee', label: '🏫 School Committee' }
            ].map(cat => `
              <button class="preset-pill-btn ${state.selectedMeetingCategory === cat.id ? 'active' : ''}" data-meeting-cat="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Meeting Notes Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px;">
          ${NANTUCKET_PUBLIC_MEETING_NOTES
            .filter(m => state.selectedMeetingCategory === 'all' || m.governingBody === state.selectedMeetingCategory)
            .map(m => {
              const isFlipped = state.flippedCardIds.has(m.id);
              return `
                <div class="flip-card-container ${isFlipped ? 'flipped' : ''}" data-card-id="${m.id}">
                  <div class="flip-card-inner">
                    
                    <!-- FRONT: Full Official Meeting Minutes & Votes -->
                    <div class="flip-card-front glass-card" style="padding: 20px; border-left: 4px solid var(--accent-ocean);">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                          <span class="badge badge-ocean font-mono" style="font-size: 0.7rem;">${m.governingBody}</span>
                          <span class="font-mono" style="font-size: 0.72rem; color: var(--text-muted);">${m.date}</span>
                        </div>

                        <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                          ${m.title}
                        </h4>

                        <div style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 12px;">
                          📍 ${m.location} &bull; 🗣️ <em>Chair: ${m.chairpersonOrSpeaker}</em>
                        </div>

                        <!-- Topics Covered -->
                        <div style="margin-bottom: 10px;">
                          <strong style="font-size: 0.75rem; color: var(--accent-ocean); text-transform: uppercase;">📋 Agenda Topics:</strong>
                          <ul style="padding-left: 16px; font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                            ${m.topicsCovered.map(t => `<li>${t}</li>`).join('')}
                          </ul>
                        </div>

                        <!-- Key Votes & Decisions -->
                        <div style="margin-bottom: 10px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px;">
                          <strong style="font-size: 0.75rem; color: #34d399; text-transform: uppercase;">🗳️ Key Decisions & Votes:</strong>
                          <ul style="padding-left: 16px; font-size: 0.75rem; color: var(--text-primary); margin-top: 4px; line-height: 1.4;">
                            ${m.keyDecisionsAndVotes.map(d => `<li>${d}</li>`).join('')}
                          </ul>
                        </div>

                        <!-- Public Comments -->
                        <div style="margin-bottom: 12px; background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                          <strong style="font-size: 0.75rem; color: #fbbf24; text-transform: uppercase;">🗣️ Public Resident Comments:</strong>
                          <ul style="padding-left: 16px; font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                            ${m.publicCommentsSummary.map(c => `<li>${c}</li>`).join('')}
                          </ul>
                        </div>
                      </div>

                      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px; margin-top: 10px;">
                        <span style="font-size: 0.68rem; color: var(--text-muted);">${m.officialReferenceDoc}</span>
                        <button class="toggle-flip-btn" data-flip-target="${m.id}" title="Flip to 6th-Grade Plain English Summary">
                          🔄 View 6th-Grade Summary ↗
                        </button>
                      </div>
                    </div>

                    <!-- BACK: 6th-Grade Plain English & Librarian Discussion Guide -->
                    <div class="flip-card-back">
                      <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                          <span class="badge badge-emerald font-mono" style="font-size: 0.7rem;">🎒 6TH-GRADE PLAIN ENGLISH</span>
                          <span class="badge badge-ocean font-mono" style="font-size: 0.7rem;">${m.governingBody}</span>
                        </div>

                        <h4 style="font-size: 1rem; font-weight: 800; color: #ffffff; margin-bottom: 12px;">
                          ${m.title}
                        </h4>

                        <!-- Plain English Grandparent & Family Takeaway -->
                        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 8px; padding: 14px; margin-bottom: 14px;">
                          <h5 style="font-size: 0.8rem; font-weight: 800; color: #34d399; margin-bottom: 6px; text-transform: uppercase;">
                            🏡 Grandparent & Family Takeaway:
                          </h5>
                          <p style="font-size: 0.85rem; color: #fbfdfa; line-height: 1.5;">
                            ${m.grandparentAndFamilyTakeaway}
                          </p>
                        </div>

                        <!-- Action Items for Home -->
                        <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px; margin-bottom: 14px;">
                          <h5 style="font-size: 0.8rem; font-weight: 800; color: #38bdf8; margin-bottom: 6px; text-transform: uppercase;">
                            ✅ What You Should Do at Home:
                          </h5>
                          <ul style="padding-left: 18px; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45;">
                            ${m.actionItemsForResidents.map(a => `<li>${a}</li>`).join('')}
                          </ul>
                        </div>

                        <!-- Librarian Guide -->
                        <div style="background: rgba(249, 115, 22, 0.12); border: 1px solid rgba(249, 115, 22, 0.4); border-radius: 8px; padding: 12px;">
                          <h5 style="font-size: 0.8rem; font-weight: 800; color: #fb923c; margin-bottom: 4px; text-transform: uppercase;">
                            📖 Librarian Discussion Guide:
                          </h5>
                          <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
                            ${m.librarianDiscussionGuide}
                          </p>
                        </div>
                      </div>

                      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(16, 185, 129, 0.3); padding-top: 12px; margin-top: 12px;">
                        <span style="font-size: 0.7rem; color: var(--text-muted);">Official: ${m.officialReferenceDoc}</span>
                        <button class="toggle-flip-btn" data-flip-target="${m.id}">
                          🔄 Flip Back to Minutes ↗
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              `;
            }).join('')}
        </div>
      </div>

    </div>
  `;
}

// ─── TAB 6: REPELLENT ARMOR LAB ───────────────────────────────────────
function renderRepellentsTab(): string {
  const selectedRepellent = REPELLENT_DATABASE.find(r => r.id === state.selectedRepellentId) || REPELLENT_DATABASE[1];

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-teal); background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, var(--bg-surface) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <span class="badge badge-emerald font-mono">THE GOLDEN RULE OF REPELLENCY</span>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 6px; margin-bottom: 6px;">
              🛡️ The "Two-Zone Armor" Repellent Defense
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 820px;">
              <strong>Zone 1 (Fabric)</strong> requires contact neuro-knockdown (Permethrin 0.5%). 
              <strong>Zone 2 (Bare Skin)</strong> requires olfactory sensilla blinding (Picaridin 20%, PMD/OLE, or DEET).
            </p>
          </div>

          <a href="https://www.epa.gov/insect-repellents/find-repellent-right-you" target="_blank" rel="noopener noreferrer" class="btn-primary" style="font-size: 0.8rem; text-decoration: none;">
            🔍 EPA Repellent Finder Tool ↗
          </a>
        </div>
      </div>

      <div class="grid-container" style="align-items: start;">
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-card" style="padding: 20px;">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">1. Select an Active Ingredient</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${REPELLENT_DATABASE.map(rep => `
                <button class="repellent-select-btn" data-rep-id="${rep.id}" style="text-align: left; padding: 12px; border-radius: 8px; border: 1px solid ${state.selectedRepellentId === rep.id ? 'var(--accent-teal)' : 'var(--border-subtle)'}; background: ${state.selectedRepellentId === rep.id ? 'rgba(20, 184, 166, 0.15)' : 'var(--bg-surface-elevated)'}; cursor: pointer; transition: all 0.2s ease;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <strong style="font-size: 0.9rem; color: ${state.selectedRepellentId === rep.id ? '#2dd4bf' : 'var(--text-primary)'};">${rep.name}</strong>
                    <span class="badge ${rep.targetZone.includes('Zone 1') ? 'badge-amber' : 'badge-ocean'} font-mono" style="font-size: 0.65rem;">
                      ${rep.targetZone.split(':')[0]}
                    </span>
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${rep.optimalConcentration} • ${rep.protectionDurationHours}</div>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="glass-card" style="padding: 20px; border-left: 4px solid var(--accent-teal);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <div>
                <span class="badge badge-emerald font-mono">EPA REGISTERED ACTIVE</span>
                <h3 style="font-size: 1.1rem; font-weight: 800; margin-top: 4px; color: var(--text-primary);">${selectedRepellent.name}</h3>
              </div>
              <span class="badge font-mono" style="background: rgba(14, 165, 233, 0.15); color: #38bdf8;">${selectedRepellent.targetZone}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;"><strong>Mechanism:</strong> ${selectedRepellent.mechanism}</div>
            <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 8px; font-size: 0.75rem; margin-bottom: 14px;">
              <div style="padding: 8px; background: rgba(7, 9, 14, 0.4); border-radius: 6px;">Gear Safety: <strong>${selectedRepellent.gearSafety}</strong></div>
              <div style="padding: 8px; background: rgba(7, 9, 14, 0.4); border-radius: 6px;">Duration: <strong style="color: #38bdf8;">${selectedRepellent.protectionDurationHours}</strong></div>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div class="glass-card" style="padding: 20px;">
            <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">🧪 Repellent Myth vs. Science</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${REPELLENT_MYTHS_FACTS.map(m => `
                <div style="background: rgba(7, 9, 14, 0.5); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px;">
                  <span class="badge ${m.verdict.includes('Truth') ? 'badge-emerald' : 'badge-red'} font-mono" style="font-size: 0.65rem;">${m.verdict}</span>
                  <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin: 4px 0;">"${m.myth}"</div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${m.scientificReality}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── TAB 7: ARTICLES & FIELD GUIDES ───────────────────────────────────
function renderArticlesTab(): string {
  const filteredArticles = ARTICLES_LIBRARY.filter(art => {
    const matchCategory = state.selectedArticleCategory === 'all' || art.category === state.selectedArticleCategory;
    const query = state.articleSearchQuery.toLowerCase().trim();
    const matchQuery = !query || 
      art.title.toLowerCase().includes(query) || 
      art.subtitle.toLowerCase().includes(query) || 
      art.summary.toLowerCase().includes(query) ||
      art.contentMarkdown.toLowerCase().includes(query);
    return matchCategory && matchQuery;
  });

  const activeArticle = state.activeArticleId ? ARTICLES_LIBRARY.find(a => a.id === state.activeArticleId) : null;

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-ocean);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <span class="badge badge-ocean font-mono">NANTUCKET FIELD GUIDES</span>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 4px;">
              📰 Island Knowledge Base & Wikipedia Field Guides
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              Deep-dive scientific literature, botanical guides, and authentic macro-photographs from Wikimedia Commons.
            </p>
          </div>
          <div style="min-width: 260px;">
            <input type="text" id="articleSearchInput" placeholder="🔍 Search articles (Press [/] to focus)..." value="${state.articleSearchQuery}" style="width: 100%; padding: 10px 14px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-primary); font-size: 0.85rem;">
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          <button class="nav-tab ${state.selectedArticleCategory === 'all' ? 'active' : ''}" data-art-cat="all">All Articles (${ARTICLES_LIBRARY.length})</button>
          <button class="nav-tab ${state.selectedArticleCategory === 'Botanical & Garden' ? 'active' : ''}" data-art-cat="Botanical & Garden">🌿 Botanical & Garden</button>
          <button class="nav-tab ${state.selectedArticleCategory === 'Repellent Science' ? 'active' : ''}" data-art-cat="Repellent Science">🛡️ Repellent Science</button>
          <button class="nav-tab ${state.selectedArticleCategory === 'Island Ecology' ? 'active' : ''}" data-art-cat="Island Ecology">🔬 Island Ecology</button>
          <button class="nav-tab ${state.selectedArticleCategory === 'Clinical Triage' ? 'active' : ''}" data-art-cat="Clinical Triage">⏱️ Clinical Triage</button>
          <button class="nav-tab ${state.selectedArticleCategory === 'Seven Generations' ? 'active' : ''}" data-art-cat="Seven Generations">🌟 Seven Generations</button>
        </div>
      </div>

      ${activeArticle ? `
        <div class="glass-card" style="padding: 28px; border-left: 4px solid var(--accent-emerald); background: var(--bg-surface);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <div>
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                <span class="badge badge-emerald font-mono">${activeArticle.category}</span>
                ${activeArticle.wikipediaUrl ? `
                  <a href="${activeArticle.wikipediaUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-ocean font-mono" style="text-decoration: none;">
                    📖 Wikipedia Article ↗
                  </a>
                ` : ''}
                ${activeArticle.referenceUrl ? `
                  <a href="${activeArticle.referenceUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-purple font-mono" style="text-decoration: none;">
                    🔬 ${activeArticle.referenceLabel || 'Official Citation'} ↗
                  </a>
                ` : ''}
              </div>
              <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-top: 6px;">${activeArticle.title}</h2>
              <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">${activeArticle.subtitle}</p>
            </div>
            <button id="closeArticleBtn" class="btn-secondary" style="font-size: 0.8rem; padding: 6px 14px;">✕ Close Reader (Esc)</button>
          </div>

          ${activeArticle.imageUrl ? `
            <div style="margin-bottom: 24px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-subtle); background: #000;">
              <img src="${activeArticle.imageUrl}" alt="${activeArticle.title}" style="width: 100%; max-height: 380px; object-fit: cover; display: block;">
              <div style="padding: 10px 14px; background: rgba(7, 9, 14, 0.9); font-size: 0.75rem; color: var(--text-secondary); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                <span>📷 ${activeArticle.imageCaption || activeArticle.title}</span>
                <span class="font-mono" style="color: var(--text-muted);">Source: ${activeArticle.imageCredit || 'Wikimedia Commons'}</span>
              </div>
            </div>
          ` : ''}

          <div style="background: rgba(14, 165, 233, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 16px; margin-bottom: 24px;">
            <h4 style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; margin-bottom: 8px;">📌 Key Clinical & Ecological Takeaways</h4>
            <ul style="font-size: 0.8rem; color: var(--text-primary); padding-left: 18px; display: flex; flex-direction: column; gap: 6px;">
              ${activeArticle.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>

          <div class="article-markdown-body" style="margin-top: 16px;">
            ${renderMarkdownToHtml(activeArticle.contentMarkdown)}
          </div>
        </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px;">
        ${filteredArticles.map(art => {
          const isFlipped = state.isCardFlipped(art.id);
          return `
          <div class="flip-card-container ${isFlipped ? 'flipped' : ''}" data-card-id="${art.id}" title="Double-click card (or tap flip button) to toggle 6th-Grade Mode">
            <div class="flip-card-inner">
              <!-- FRONT: In-Depth Field Guide & Wikipedia Summary -->
              <div class="flip-card-front glass-card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--accent-ocean);">
                <div>
                  ${art.imageUrl ? `
                    <div style="position: relative; height: 150px; overflow: hidden;">
                      <img src="${art.imageUrl}" alt="${art.title}" style="width: 100%; height: 100%; object-fit: cover;">
                      <span class="badge badge-ocean font-mono" style="position: absolute; top: 10px; right: 10px;">${art.category}</span>
                    </div>
                  ` : ''}
                  <div style="padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
                      <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); line-height: 1.3;">${art.title}</h3>
                      <button class="flip-hint-badge toggle-flip-btn" data-flip-target="${art.id}" title="Double-click anywhere to flip">
                        🔄 6th Grade
                      </button>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 10px;">${art.subtitle}</p>
                    <div style="font-size: 0.75rem; color: var(--text-muted); background: rgba(7, 9, 14, 0.4); padding: 10px; border-radius: 8px; margin-bottom: 10px;">${art.summary}</div>
                    
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      ${art.wikipediaUrl ? `<a href="${art.wikipediaUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.7rem; color: #38bdf8; text-decoration: none;">Wikipedia ↗</a>` : ''}
                      ${art.referenceUrl ? `<a href="${art.referenceUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 0.7rem; color: #34d399; text-decoration: none;">Citation ↗</a>` : ''}
                    </div>
                  </div>
                </div>
                <div style="padding: 0 16px 16px 16px;">
                  <button class="read-article-btn btn-primary" data-art-id="${art.id}" style="justify-content: center; width: 100%; font-size: 0.85rem;">📖 Read Full Field Guide</button>
                </div>
              </div>

              <!-- BACK: 6th-Grade Detective Story & Takeaway -->
              <div class="flip-card-back">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="badge badge-emerald font-mono">🎒 6TH GRADE DETECTIVE GUIDE</span>
                    <button class="flip-hint-badge toggle-flip-btn" data-flip-target="${art.id}" style="background: rgba(16, 185, 129, 0.2); border-color: var(--accent-emerald); color: #34d399;">
                      🔬 Flip to Scientific
                    </button>
                  </div>

                  <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
                    ${art.icon} ${art.title}
                  </h3>

                  <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                    <strong style="font-size: 0.8rem; color: #34d399; display: block; margin-bottom: 4px;">💡 What this teaches us:</strong>
                    <p style="font-size: 0.8rem; color: #e2e8f0; line-height: 1.5; margin: 0;">
                      ${art.grade6Summary || art.summary}
                    </p>
                  </div>

                  <div style="font-size: 0.78rem; color: #fbbf24; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <strong>🎯 Big Takeaway:</strong> ${art.grade6Takeaway || art.keyTakeaways[0]}
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button class="read-article-btn btn-primary" data-art-id="${art.id}" style="justify-content: center; width: 100%; font-size: 0.85rem; background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
                    📖 Read Full Field Guide
                  </button>
                  <div style="text-align: center; font-size: 0.7rem; color: var(--text-muted);">
                    Double-click anytime to flip back
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

// ─── TAB 8: FERRY PACKING KIT PLANNER ─────────────────────────────────
function renderFerryKitTab(): string {
  const items = state.ferryKitStore.getAll();
  const stats = state.ferryKitStore.getCompletionStats();

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Top Banner -->
      <div class="glass-panel" style="padding: 20px; border-left: 4px solid var(--accent-emerald); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
            <span class="badge badge-emerald font-mono">ISLAND PREPAREDNESS</span>
            <span class="badge badge-ocean font-mono">SAVED TO DEVICE</span>
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 800;">
            🧳 Nantucket Ferry & Trailhead Packing Planner
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Check off essentials before boarding Steamship Authority or Hy-Line ferries to ensure your family is 100% tick-ready.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <a href="https://www.steamshipauthority.com/" target="_blank" rel="noopener noreferrer" class="badge badge-amber font-mono" style="text-decoration: none; padding: 6px 10px;">
            🚢 Steamship Authority ↗
          </a>
          <a href="https://hylinecruises.com/" target="_blank" rel="noopener noreferrer" class="badge badge-amber font-mono" style="text-decoration: none; padding: 6px 10px;">
            🛥️ Hy-Line Cruises ↗
          </a>
          <div class="font-mono" style="text-align: right;">
            <div style="font-size: 1.5rem; font-weight: 800; color: ${stats.isFerryReady ? '#34d399' : '#38bdf8'};">
              ${stats.percent}% PACKED
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${stats.packed} of ${stats.total} items</div>
          </div>
        </div>
      </div>

      <!-- Checklist Items Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 14px;">
        ${items.map(item => `
          <div class="ferry-kit-item ${item.checked ? 'packed' : ''}" data-kit-id="${item.id}">
            <input type="checkbox" class="custom-checkbox" ${item.checked ? 'checked' : ''} style="margin-top: 2px; pointer-events: none;">
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span class="item-title" style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">
                  ${item.icon} ${item.title}
                </span>
                ${item.isEssential ? '<span class="badge badge-red font-mono" style="font-size: 0.6rem;">ESSENTIAL</span>' : ''}
              </div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
                ${item.description}
              </p>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <button id="resetFerryKitBtn" class="btn-secondary" style="font-size: 0.8rem;">
          🔄 Reset Checklist to Defaults
        </button>
        <span class="font-mono" style="font-size: 0.75rem; color: var(--text-muted);">
          Items automatically persist in your browser for your next island trip.
        </span>
      </div>

    </div>
  `;
}

// ─── TAB 9: EISENHOWER MATRIX ─────────────────────────────────────────
function renderEisenhowerTab(): string {
  const filteredActions = state.selectedPhase === 'all'
    ? EISENHOWER_ACTIONS
    : EISENHOWER_ACTIONS.filter(a => a.phase === state.selectedPhase);

  const q1 = filteredActions.filter(a => a.quadrant === 'q1_urgent_important');
  const q2 = filteredActions.filter(a => a.quadrant === 'q2_plan_decide');
  const q3 = filteredActions.filter(a => a.quadrant === 'q3_delegate_deescalate');
  const q4 = filteredActions.filter(a => a.quadrant === 'q4_eliminate_waste');

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-panel" style="padding: 20px; border-left: 4px solid var(--accent-ocean); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">
            ⏱️ The Eisenhower Matrix on Tick Defense
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Separate high-stakes time-critical actions (0–72h single-dose prophylaxis) from long-term monitoring.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        <div class="glass-card quadrant-q1" style="padding: 20px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #f87171; margin-bottom: 12px;">🚨 Q1: DO FIRST (Urgent & Critical)</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">${q1.map(renderActionCard).join('')}</div>
        </div>
        <div class="glass-card quadrant-q2" style="padding: 20px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #38bdf8; margin-bottom: 12px;">📈 Q2: STRATEGIZE (Long-Term Impact)</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">${q2.map(renderActionCard).join('')}</div>
        </div>
        <div class="glass-card quadrant-q3" style="padding: 20px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #fbbf24; margin-bottom: 12px;">⏱️ Q3: DE-ESCALATE (Urgent Distractions)</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">${q3.map(renderActionCard).join('')}</div>
        </div>
        <div class="glass-card quadrant-q4" style="padding: 20px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #94a3b8; margin-bottom: 12px;">❌ Q4: ELIMINATE (Harmful Folklore)</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">${q4.map(renderActionCard).join('')}</div>
        </div>
      </div>
    </div>
  `;
}

function renderActionCard(action: typeof EISENHOWER_ACTIONS[0]): string {
  const isFlipped = state.isCardFlipped(action.id);
  return `
    <div class="flip-card-container ${isFlipped ? 'flipped' : ''}" data-card-id="${action.id}" title="Double-click card (or tap flip button) to toggle 6th-Grade Mode">
      <div class="flip-card-inner">
        <!-- FRONT: Clinical & Scientific Action -->
        <div class="flip-card-front" style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
              <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">${action.title}</h4>
              <button class="flip-hint-badge toggle-flip-btn" data-flip-target="${action.id}" title="Double-click anywhere to flip">
                🔄 6th Grade
              </button>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px;">${action.summary}</p>
            <div style="font-size: 0.75rem; color: var(--accent-ocean); background: rgba(14, 165, 233, 0.08); padding: 8px; border-radius: 6px; margin-bottom: 10px;">
              <strong>Rationale:</strong> ${action.clinicalRationale}
            </div>
            ${action.actionSteps ? `
              <ul style="padding-left: 16px; font-size: 0.75rem; color: var(--text-muted); margin: 0; line-height: 1.4;">
                ${action.actionSteps.map(s => `<li>${s}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        </div>

        <!-- BACK: 6th-Grade Detective / Family Translation -->
        <div class="flip-card-back" style="padding: 14px; border-radius: 10px;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span class="badge badge-emerald font-mono">🎒 6TH GRADE GUIDE</span>
              <button class="flip-hint-badge toggle-flip-btn" data-flip-target="${action.id}" style="background: rgba(16, 185, 129, 0.2); border-color: var(--accent-emerald); color: #34d399;">
                🔬 Scientific
              </button>
            </div>
            <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">
              ${action.title}
            </h4>
            <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 6px; padding: 10px; font-size: 0.78rem; color: #e2e8f0; line-height: 1.45; margin-bottom: 8px;">
              <strong style="color: #34d399; display: block; margin-bottom: 2px;">💡 Simple Summary:</strong>
              ${action.summary}
            </div>
            <div style="font-size: 0.75rem; color: #fbbf24; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 6px; padding: 8px;">
              <strong>🎯 Rule to Remember:</strong> ${action.clinicalRationale.split('.')[0]}.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── TAB 10: SEVEN GENERATIONS & GUIDED DECONTAMINATION ───────────────
function renderSevenGenerationsTab(): string {
  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <!-- Top Banner -->
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-emerald); background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-surface) 100%);">
        <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 6px;">
          🌟 Fearless Island Joy & Seven Generations Stewardship
        </h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 800px;">
          "In our every deliberation, we must consider the impact of our decisions on the next seven generations."
        </p>
      </div>

      <!-- 60-Second Guided Post-Hike Decontamination Flow -->
      <div class="glass-card" style="padding: 24px; border-left: 4px solid var(--accent-ocean);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
          <div>
            <span class="badge badge-ocean font-mono">CALMING GUIDED PROTOCOL</span>
            <h3 style="font-size: 1.1rem; font-weight: 800; margin-top: 4px;">
              ⏱️ 60-Second Guided Post-Hike Air-Lock Flow
            </h3>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="startTimerBtn" class="btn-primary" style="font-size: 0.8rem;">
              ${state.guidedTimerRunning ? '⏸️ Running (60s)...' : '▶️ Start 60s Flow'}
            </button>
            <button id="resetTimerBtn" class="btn-secondary" style="font-size: 0.8rem;">
              🔄 Reset
            </button>
          </div>
        </div>

        <div style="background: rgba(7, 9, 14, 0.6); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 16px;">
          <div class="font-mono" style="font-size: 2.5rem; font-weight: 800; color: #38bdf8; margin-bottom: 6px;">
            ${state.guidedTimerSeconds}s / 60s
          </div>
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">
            ${state.guidedTimerSeconds < 15 ? 'Step 1: Strip outer trail clothes at entrance & drop in dryer' : (state.guidedTimerSeconds < 35 ? 'Step 2: Start 10-Minute High Dry Heat cycle (desiccates nymphs)' : 'Step 3: Step into warm shower & perform 360° mirror scan')}
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- SEVEN GENERATIONS ECOLOGICAL CONTINUUM TIMELINE                   -->
      <!-- ================================================================= -->
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-emerald);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <span class="badge badge-emerald font-mono">200-YEAR ECOLOGICAL ARC</span>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
              🌲 The Seven Generations Ecological Continuum
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 800px; margin-top: 4px;">
              Tracing Nantucket's landscape transitions from open sheep commons to dense brush succession, and forward to sustainable community bio-stewardship.
            </p>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${SEVEN_GEN_TIMELINE.map((era, idx) => `
            <div class="glass-card" style="padding: 18px; border-left: 4px solid ${idx === 2 ? '#34d399' : (idx > 2 ? '#38bdf8' : '#94a3b8')}; background: ${idx === 2 ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)'};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <strong style="font-size: 0.95rem; color: ${idx === 2 ? '#34d399' : 'var(--text-primary)'};">${era.eraLabel}</strong>
                  ${idx === 2 ? '<span class="badge badge-emerald font-mono" style="font-size: 0.65rem;">WE ARE HERE</span>' : ''}
                </div>
                <span class="badge font-mono" style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); font-size: 0.72rem;">${era.timeframe}</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; font-size: 0.8rem; margin-top: 8px;">
                <div style="background: rgba(7, 9, 14, 0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                  <strong style="color: #38bdf8; display: block; margin-bottom: 2px;">🌿 Landscape & Ecology:</strong>
                  <span style="color: var(--text-secondary); line-height: 1.45;">${era.ecologicalState}</span>
                </div>
                <div style="background: rgba(7, 9, 14, 0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                  <strong style="color: #fb923c; display: block; margin-bottom: 2px;">🏡 Community Relationship:</strong>
                  <span style="color: var(--text-secondary); line-height: 1.45;">${era.humanRelationship}</span>
                </div>
                <div style="background: rgba(7, 9, 14, 0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px;">
                  <strong style="color: #34d399; display: block; margin-bottom: 2px;">🌟 Generational Legacy:</strong>
                  <span style="color: var(--text-secondary); line-height: 1.45;">${era.legacyImpact}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- 5 TICK-SAFE ISLAND QUESTS                                         -->
      <!-- ================================================================= -->
      <div>
        <div style="margin-bottom: 12px;">
          <span class="badge badge-ocean font-mono">FEARLESS ISLAND JOY</span>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
            🏖️ Low-Risk & Zero-Risk Island Adventure Quests
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 800px;">
            Safe, joyful outdoor adventures designed for grandmothers, grandchildren, and visitors to experience the natural beauty of Nantucket with near-zero tick exposure.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 20px;">
          ${ISLAND_ADVENTURE_QUESTS.map(q => `
            <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                  <span style="font-size: 2rem;">${q.icon}</span>
                  <span class="badge badge-emerald font-mono">${q.tickRisk}</span>
                </div>
                <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${q.title}</h4>
                <div style="font-size: 0.75rem; color: var(--accent-ocean); margin-bottom: 8px;">📍 ${q.location}</div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.45;">${q.whyItIsAwesome}</p>

                <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px; font-size: 0.75rem; margin-bottom: 10px;">
                  <strong style="color: #34d399;">🌟 Seven Generations Wisdom:</strong> ${q.sevenGenWisdom}
                </div>

                <div style="background: rgba(7, 9, 14, 0.4); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px; font-size: 0.75rem;">
                  <strong style="color: #38bdf8; display: block; margin-bottom: 4px;">🎒 Adventure Tips:</strong>
                  <ul style="padding-left: 16px; margin: 0; color: var(--text-secondary); line-height: 1.4;">
                    ${q.adventureTips.map(t => `<li>${t}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ─── TAB 11: PEER-REVIEWED SCIENTIFIC SOURCES & EVIDENCE-BASED CITATIONS ────
function renderSourcesTab(): string {
  const filteredSources = SOURCES_BIBLIOGRAPHY.filter(src => {
    const matchCategory = state.selectedSourceCategory === 'all' || src.category === state.selectedSourceCategory;
    const query = state.sourceSearchQuery.toLowerCase().trim();
    const matchQuery = !query ||
      src.title.toLowerCase().includes(query) ||
      src.authors.toLowerCase().includes(query) ||
      src.journalOrPublisher.toLowerCase().includes(query) ||
      src.keyFindingSummary.toLowerCase().includes(query) ||
      src.appFeatureGrounded.toLowerCase().includes(query);
    return matchCategory && matchQuery;
  });

  const categories = ['all', 'Clinical Guidelines', 'Molecular Biology', 'Landscape Ecology', 'Microclimate & Physics', 'Repellents', 'Saliva Pharmacology'];

  return `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="glass-panel" style="padding: 24px; border-left: 4px solid var(--accent-purple);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <span class="badge badge-purple font-mono">PEER-REVIEWED CITATIONS & EVIDENCE</span>
            <h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 4px;">
              📚 Scientific Sources & Grounding Bibliography
            </h2>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              Every algorithm, clinical threshold, molecular switch, and ecological intervention in Nantucket Tick Radar is directly grounded in peer-reviewed medical and ecological literature.
            </p>
          </div>
          <div style="min-width: 260px;">
            <input type="text" id="sourceSearchInput" placeholder="🔍 Search citations, authors, findings..." value="${state.sourceSearchQuery}" style="width: 100%; padding: 10px 14px; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-primary); font-size: 0.85rem;">
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${categories.map(cat => `
            <button class="nav-tab ${state.selectedSourceCategory === cat ? 'active' : ''}" data-src-cat="${cat}">
              ${cat === 'all' ? `All Sources (${SOURCES_BIBLIOGRAPHY.length})` : cat}
            </button>
          `).join('')}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        ${filteredSources.map(src => {
          const isFlipped = state.isCardFlipped(src.id);
          return `
          <div class="flip-card-container ${isFlipped ? 'flipped' : ''}" data-card-id="${src.id}" title="Double-click card (or tap flip button) to toggle 6th-Grade Mode">
            <div class="flip-card-inner">
              <!-- FRONT: Clinical & Peer-Reviewed Science -->
              <div class="flip-card-front glass-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid ${
                src.category === 'Clinical Guidelines' ? '#ef4444' :
                src.category === 'Molecular Biology' ? '#38bdf8' :
                src.category === 'Landscape Ecology' ? '#34d399' :
                src.category === 'Microclimate & Physics' ? '#fbbf24' :
                src.category === 'Repellents' ? '#2dd4bf' : '#c084fc'
              };">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px;">
                    <span class="badge font-mono" style="background: rgba(255, 255, 255, 0.08); color: var(--text-secondary); font-size: 0.7rem;">
                      ${src.category}
                    </span>
                    <button class="flip-hint-badge toggle-flip-btn" data-flip-target="${src.id}" title="Double-click anywhere to flip">
                      🔄 Dbl-Click: 6th Grade
                    </button>
                  </div>

                  <h3 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px; line-height: 1.4;">
                    ${src.title}
                  </h3>

                  <div style="font-size: 0.75rem; color: var(--accent-ocean); margin-bottom: 4px;">
                    ✍️ ${src.authors} (${src.year})
                  </div>

                  <div style="font-size: 0.75rem; font-style: italic; color: var(--text-muted); margin-bottom: 10px;">
                    📖 ${src.journalOrPublisher}
                  </div>

                  <div style="background: rgba(7, 9, 14, 0.5); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <strong style="font-size: 0.75rem; color: #34d399; display: block; margin-bottom: 4px;">🔬 Key Scientific Finding:</strong>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                      ${src.keyFindingSummary}
                    </p>
                  </div>

                  <div style="font-size: 0.75rem; color: #fbbf24; margin-bottom: 10px;">
                    <strong>⚡ App Feature Grounded:</strong> ${src.appFeatureGrounded}
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-subtle); font-size: 0.75rem;">
                  <a href="${src.doiOrUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-ocean font-mono" style="text-decoration: none; padding: 4px 8px;">
                    View Primary Source ↗
                  </a>
                  ${src.pmid ? `<span class="font-mono text-muted" style="font-size: 0.7rem;">PMID: ${src.pmid}</span>` : ''}
                </div>
              </div>

              <!-- BACK: 6th-Grade Plain English Explanation -->
              <div class="flip-card-back">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span class="badge badge-emerald font-mono">🎒 6TH GRADE PLAIN ENGLISH</span>
                    <button class="flip-hint-badge toggle-flip-btn" data-flip-target="${src.id}" style="background: rgba(16, 185, 129, 0.2); border-color: var(--accent-emerald); color: #34d399;">
                      🔬 Flip to Clinical
                    </button>
                  </div>

                  <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; line-height: 1.3;">
                    ${src.title}
                  </h3>

                  <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                    <strong style="font-size: 0.8rem; color: #34d399; display: block; margin-bottom: 4px;">💡 What this means in plain English:</strong>
                    <p style="font-size: 0.8rem; color: #e2e8f0; line-height: 1.5; margin: 0;">
                      ${src.grade6PlainEnglish}
                    </p>
                  </div>

                  <div style="font-size: 0.78rem; color: #fbbf24; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                    <strong>🎯 Easy Metaphor:</strong> ${src.grade6Metaphor}
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.75rem;">
                  <span style="color: var(--text-muted); font-size: 0.7rem;">Island Tick Detectives Lab</span>
                  <a href="${src.doiOrUrl}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: none; font-size: 0.75rem;">
                    Full Research Paper ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;
}

// ─── TAB 12: NANTUCKET COTTAGE HOSPITAL CLINICAL HAND-OFF (FHIR R4) ────
function renderHospitalTab(): string {
  const dwellAssessment = assessDwellTimeAndProphylaxis(
    state.attachmentHours,
    state.hoursSinceRemoval,
    state.selectedSpecies
  );

  const radarScores = computeCoInfectionRadar(
    state.selectedSpecies,
    { ...state.symptoms, attachmentHours: state.attachmentHours }
  );

  const fhirPayload = {
    encounterDate: new Date().toISOString(),
    patientDeIdentifiedId: 'ACK-PT-7702',
    geographicLocus: NANTUCKET_TRAILS.find(t => t.id === state.selectedTrailId)?.name || 'Nantucket Conservation Zone',
    tickSpecies: state.selectedSpecies,
    dwellAssessment,
    coInfectionScores: radarScores,
    reportedSymptoms: [],
    clinicalDirectives: [
      dwellAssessment.doxycyclineProphylaxisEligible ? 'Administer single-dose Doxycycline 200mg' : 'Initiate 30-day symptom vigilance'
    ]
  };

  const fhirJson = JSON.stringify(generateFhirR4Bundle(fhirPayload), null, 2);
  const printableSummary = generatePrintableClinicalSummary(fhirPayload);

  return `
    <div class="grid-container" style="align-items: start;">
      <div class="glass-card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="font-size: 1rem; font-weight: 700;">NCH Clinical Summary</h3>
          <a href="https://nantuckethospital.org/" target="_blank" rel="noopener noreferrer" style="font-size: 0.75rem; color: #38bdf8; text-decoration: none;">
            Hospital Website ↗
          </a>
        </div>
        <pre class="font-mono" style="background: rgba(7, 9, 14, 0.8); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; font-size: 0.75rem; color: #38bdf8; max-height: 480px; overflow-y: auto; white-space: pre-wrap;">${printableSummary}</pre>
      </div>

      <div class="glass-card" style="padding: 20px;">
        <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 10px;">FHIR R4 Bundle JSON</h3>
        <pre class="font-mono" style="background: rgba(7, 9, 14, 0.8); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 14px; font-size: 0.75rem; color: #a855f7; max-height: 480px; overflow-y: auto;">${fhirJson}</pre>
      </div>
    </div>
  `;
}

// ─── TAB 13: TOURISM & VISITOR CENTER KIOSK (STORYTELLING & ANIMATIONS) ───
function renderKioskTab(): string {
  const chapter = state.kioskEngine.getActiveChapter();
  const allChapters = state.kioskEngine.getAllChapters();
  const chapterIdx = state.kioskEngine.getChapterIndex();

  return `
    <div style="display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
      
      <!-- Kiosk Header / Attract Banner -->
      <div class="glass-card" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; border-left: 6px solid ${chapter.themeColor}; background: radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%);">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="badge font-mono" style="background: rgba(56, 189, 248, 0.15); color: ${chapter.themeColor}; border: 1px solid ${chapter.themeColor};">
              FERRY TERMINAL &amp; VISITOR CENTER KIOSK
            </span>
            <span class="badge badge-emerald font-mono">TOUCHSCREEN STORYTELLING</span>
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin: 4px 0;">
            Nantucket Trail Safety &amp; Moorland Storytelling
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
            Explore the 6 interactive chapters below or send this guide directly to your phone.
          </p>
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button id="kioskScreensaverBtn" class="btn-secondary" style="min-height: 48px; border-color: rgba(56, 189, 248, 0.4); color: #38bdf8;">
            🖥️ Start Attract Screensaver
          </button>
          <button id="kioskQrBtn" class="btn-primary" style="min-height: 48px; background: linear-gradient(135deg, #0ea5e9, #0284c7);">
            📱 Send to My Phone
          </button>
        </div>
      </div>

      <!-- 6-Chapter Interactive Stepper Bar -->
      <div class="kiosk-chapter-stepper" role="tablist" aria-label="Kiosk Story Chapters">
        ${allChapters.map((c, i) => `
          <button class="kiosk-chapter-pill ${i === chapterIdx ? 'active' : ''}" data-kiosk-chapter="${i}" style="${i === chapterIdx ? `border-color: ${c.themeColor}; color: ${c.themeColor};` : ''}">
            <span style="font-size: 1.3rem;">${c.icon}</span>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Chapter ${c.chapterNumber}</span>
              <span style="font-weight: 700; white-space: nowrap;">${c.title}</span>
            </div>
          </button>
        `).join('')}
      </div>

      <!-- Active Chapter Storytelling Hero Card -->
      <div class="kiosk-hero-card" style="border-top: 4px solid ${chapter.themeColor};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <span class="badge font-mono" style="background: rgba(14, 165, 233, 0.15); color: ${chapter.themeColor}; border: 1px solid ${chapter.themeColor};">
              ${chapter.badge}
            </span>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-primary); margin-top: 8px; margin-bottom: 4px;">
              ${chapter.icon} ${chapter.headline}
            </h3>
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-muted);">
              ${chapter.subtitle}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="kioskPrevBtn" class="btn-secondary" style="min-height: 48px; padding: 8px 18px;" title="Previous Chapter">
              ⬅️ Previous
            </button>
            <button id="kioskNextBtn" class="btn-primary" style="min-height: 48px; padding: 8px 22px; background: linear-gradient(135deg, ${chapter.themeColor}, #0284c7);" title="Next Chapter">
              Next Chapter ➔
            </button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary); margin-bottom: 20px;">
          ${chapter.storyParagraphs.map(p => `<p style="margin: 0;">${p.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary);">$1</strong>')}</p>`).join('')}
        </div>

        <!-- Spoken Natural Language Chapter Voice Guide -->
        <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 18px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">🎙️</span>
              <div>
                <div style="font-size: 0.9rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                  <span>Spoken Story Narration &amp; Audio Guide</span>
                  ${state.kioskEngine.getIsNarrating() ? `
                    <span class="voice-wave-pulse" title="Voice Speaking">
                      <span class="voice-wave-bar"></span>
                      <span class="voice-wave-bar"></span>
                      <span class="voice-wave-bar"></span>
                      <span class="voice-wave-bar"></span>
                    </span>
                  ` : ''}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                  Edge Natural Voice &bull; Conversational Prosody &bull; COPPA Safe
                </div>
              </div>
            </div>

            <!-- Voice Persona Selector -->
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <button class="kiosk-persona-btn ${state.kioskEngine.getActivePersona() === 'ranger_maya' ? 'active' : ''}" data-kiosk-persona="ranger_maya" title="Trail Guide Maya: Warm, trail-wise naturalist">
                🌲 Trail Guide Maya
              </button>
              <button class="kiosk-persona-btn ${state.kioskEngine.getActivePersona() === 'barnaby_owl' ? 'active' : ''}" data-kiosk-persona="barnaby_owl" title="Barnaby Owl: Fun, animated 6th-grade analogies">
                🦉 Barnaby Owl
              </button>
              <button class="kiosk-persona-btn ${state.kioskEngine.getActivePersona() === 'clinical_doc' ? 'active' : ''}" data-kiosk-persona="clinical_doc" title="Dr. Coffin: Calm, reassuring clinical guidance">
                🩺 Dr. Coffin
              </button>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 14px; background: rgba(7, 10, 18, 0.6); padding: 12px 16px; border-radius: 12px; border-left: 3px solid #38bdf8; flex-wrap: wrap;">
            <button id="toggleKioskVoiceBtn" class="btn-primary" style="min-height: 44px; padding: 8px 20px; background: ${state.kioskEngine.getIsNarrating() ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)'}; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>${state.kioskEngine.getIsNarrating() ? '⏸️ Pause Narration' : '▶️ Play Spoken Story'}</span>
            </button>
            <div style="flex: 1; font-size: 0.82rem; color: #cbd5e1; font-style: italic; line-height: 1.5; min-width: 240px;">
              "${chapter.spokenNarration}"
            </div>
          </div>
        </div>

        <!-- Interactive Animated Chapter Widget -->
        ${renderKioskInteractiveWidget(chapter)}

        <!-- Family Action Step Takeaway -->
        <div style="margin-top: 24px; background: rgba(16, 185, 129, 0.12); border: 2px solid #10b981; border-radius: 16px; padding: 18px 24px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <span style="font-size: 2rem;">💡</span>
          <div style="flex: 1;">
            <div style="font-size: 0.75rem; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em;">
              Family &amp; Visitor Action Step
            </div>
            <div style="font-size: 0.95rem; font-weight: 700; color: #f0fdf4; margin-top: 2px;">
              ${chapter.familyActionStep}
            </div>
          </div>
          <button id="kioskQrTakeawayBtn" class="btn-secondary" style="min-height: 44px; font-size: 0.8rem; border-color: #34d399; color: #34d399;">
            📱 Save to Phone
          </button>
        </div>
      </div>

      <!-- Quick Island Visitor Stats Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
        <div class="glass-card" style="padding: 16px; text-align: center; border-left: 3px solid #38bdf8;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Nantucket Hospital Location</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #38bdf8; margin-top: 4px;">57 Prospect Street</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Open 7 Days • Walk-In Clinic</div>
        </div>
        <div class="glass-card" style="padding: 16px; text-align: center; border-left: 3px solid #34d399;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Island Safe Prophylaxis Window</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #34d399; margin-top: 4px;">36h – 72h Window</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Single-Dose Doxycycline 200mg</div>
        </div>
        <div class="glass-card" style="padding: 16px; text-align: center; border-left: 3px solid #fbbf24;">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Nightly Bedtime Routine</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #fbbf24; margin-top: 4px;">3-Minute Body Check</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Behind knees, hairline &amp; waist</div>
        </div>
      </div>

      <!-- 📼 Nantucket Junior Ranger "Nature Play Tape" Cassette Deck -->
      ${renderNaturePlayTapeDeck()}

      <!-- QR Code Mobile Handoff Modal -->
      ${state.showKioskQrModal ? renderKioskQrModal(chapter) : ''}
    </div>
  `;
}

function renderKioskInteractiveWidget(chapter: IKioskStoryChapter): string {
  switch (chapter.interactiveWidgetType) {
    case 'armor_physics': {
      let protectionPct = 0;
      if (state.kioskArmorSocks) protectionPct += 73.6;
      if (state.kioskArmorPicaridin) protectionPct += 21.2;
      if (state.kioskArmorTucked) protectionPct += 4.6;
      protectionPct = Math.min(99.4, protectionPct);

      return `
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;">
              🛡️ Interactive Trail Armor Simulator
            </span>
            <span class="badge ${protectionPct >= 90 ? 'badge-emerald' : 'badge-amber'} font-mono">
              TOTAL PROTECTION: ${protectionPct.toFixed(1)}%
            </span>
          </div>

          <div class="kiosk-armor-hiker">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 3.5rem;">🥾</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: ${state.kioskArmorSocks ? '#34d399' : '#f87171'};">
                ${state.kioskArmorSocks ? '✅ Permethrin Shield' : '❌ Unprotected'}
              </span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
              <div class="kiosk-animated-tick" style="${!state.kioskArmorSocks ? 'animation: none; transform: translateX(0);' : ''}">
                🪲
              </div>
              <span style="font-size: 0.75rem; font-weight: 700; color: #fbbf24; margin-top: 4px;">
                ${state.kioskArmorSocks ? '⚡ "Hot-Foot" Repelled!' : '⚠️ Questing Tick Steps On'}
              </span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 3.5rem;">🧴</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: ${state.kioskArmorPicaridin ? '#34d399' : '#f87171'};">
                ${state.kioskArmorPicaridin ? '✅ 20% Picaridin' : '❌ No Repellent'}
              </span>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;">
            <button id="toggleKioskSocksBtn" class="kiosk-big-btn" style="flex: 1; background: ${state.kioskArmorSocks ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; border: 1px solid ${state.kioskArmorSocks ? '#10b981' : '#ef4444'}; color: ${state.kioskArmorSocks ? '#34d399' : '#f87171'};">
              🧦 Permethrin Socks: ${state.kioskArmorSocks ? 'ON (+73.6%)' : 'OFF'}
            </button>
            <button id="toggleKioskPicaridinBtn" class="kiosk-big-btn" style="flex: 1; background: ${state.kioskArmorPicaridin ? 'rgba(14, 165, 233, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; border: 1px solid ${state.kioskArmorPicaridin ? '#0ea5e9' : '#ef4444'}; color: ${state.kioskArmorPicaridin ? '#38bdf8' : '#f87171'};">
              🧴 Picaridin 20%: ${state.kioskArmorPicaridin ? 'ON (+21.2%)' : 'OFF'}
            </button>
            <button id="toggleKioskPantsBtn" class="kiosk-big-btn" style="flex: 1; background: ${state.kioskArmorTucked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; border: 1px solid ${state.kioskArmorTucked ? '#f59e0b' : '#ef4444'}; color: ${state.kioskArmorTucked ? '#fbbf24' : '#f87171'};">
              👖 Pants Tucked: ${state.kioskArmorTucked ? 'ON (+4.6%)' : 'OFF'}
            </button>
          </div>
        </div>
      `;
    }

    case 'clock_kinetics': {
      const hours = state.kioskClockHours;
      let statusText = '✅ 0h–24h: Spirochetes Dormant in Gut • Zero Transmission Risk';
      let statusColor = '#34d399';
      let objectSize = 'Poppy seed (Flat)';
      if (hours >= 36 && hours < 48) {
        statusText = '⚡ 36h+: OspC Switch Active • Eligible for Single-Dose Doxycycline';
        statusColor = '#fbbf24';
        objectSize = 'Watermelon seed (Swelling)';
      } else if (hours >= 48) {
        statusText = '🚨 48h+: High Transmission Risk • Visit NCH Walk-In Clinic';
        statusColor = '#f87171';
        objectSize = 'Apple seed / Eraser (Engorged)';
      }

      return `
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 16px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.95rem; font-weight: 700; color: #fbbf24;">
              ⏱️ 72-Hour Biological Kinetics Slider
            </span>
            <span class="badge font-mono" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid #fbbf24;">
              ATTACHMENT: ${hours} HOURS
            </span>
          </div>

          <input type="range" id="kioskClockSlider" min="0" max="72" step="6" value="${hours}" style="width: 100%; height: 10px; accent-color: #fbbf24; cursor: pointer; margin: 12px 0;">

          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">
            <span>0h (Flat)</span>
            <span>24h</span>
            <span style="color: #fbbf24; font-weight: 700;">36h (Doxy Window)</span>
            <span>48h</span>
            <span style="color: #f87171; font-weight: 700;">72h (Hospital)</span>
          </div>

          <div class="kiosk-superhero-clock" style="margin-top: 16px;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Biological Phase &amp; Action</div>
              <div style="font-size: 1rem; font-weight: 800; color: ${statusColor}; margin-top: 2px;">
                ${statusText}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Visual Size Reference</div>
              <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                ${objectSize}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    case 'trail_finder': {
      return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div class="glass-card" style="padding: 16px; border-left: 4px solid #34d399;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="badge badge-emerald font-mono">0.5/10 LOW RISK</span>
              <span>🌊</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 6px 0;">Sconset Bluff Walk</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">Open ocean cliffside with continuous 15-knot sea breeze. Ideal for all hours.</p>
          </div>

          <div class="glass-card" style="padding: 16px; border-left: 4px solid #38bdf8;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="badge badge-ocean font-mono">1.2/10 LOW RISK</span>
              <span>🌾</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 6px 0;">Tupancy Links</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">Wide open mowed grasslands overlooking North Shore. Afternoon safe window: 1–5 PM.</p>
          </div>

          <div class="glass-card" style="padding: 16px; border-left: 4px solid #fbbf24;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="badge badge-amber font-mono">7.8/10 MODERATE</span>
              <span>🚜</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 6px 0;">Sanford Farm &amp; Ram Pasture</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">Stay in the center of the 10-foot wide gravel road. Avoid brushing trailside shrubs.</p>
          </div>

          <div class="glass-card" style="padding: 16px; border-left: 4px solid #f87171;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="badge badge-red font-mono">9.5/10 EXTREME</span>
              <span>🚨</span>
            </div>
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 6px 0;">Squam Swamp</h4>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">Dense hardwood canopy and humid leaf litter. Permethrin socks &amp; pants tucking mandatory.</p>
          </div>
        </div>
      `;
    }

    case 'waffle_grid': {
      return `
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 16px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <span style="font-size: 0.95rem; font-weight: 700; color: #c084fc;">
              🪲 Nantucket 100 Nymphs Population Array
            </span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">
              Based on UMass Amherst TickReport PCR Testing
            </span>
          </div>
          ${render100NymphsPopulationGrid()}
        </div>
      `;
    }

    case 'hospital_card': {
      return `
        <div style="background: rgba(239, 68, 68, 0.08); border: 2px solid rgba(239, 68, 68, 0.3); border-radius: 16px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="badge badge-red font-mono">NANTUCKET COTTAGE HOSPITAL</span>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: #f87171; margin-top: 6px; margin-bottom: 2px;">
                57 Prospect Street, Nantucket, MA 02554
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0;">
                Direct Telephone: <a href="tel:5088251000" style="color: #38bdf8; text-decoration: none; font-weight: 700;">(508) 825-1000</a> &bull; Open 7 Days / Week
              </p>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Nantucket+Cottage+Hospital" target="_blank" rel="noopener noreferrer" class="btn-primary" style="background: #ef4444; min-height: 44px; text-decoration: none; font-size: 0.85rem;">
              🗺️ Open in Google Maps ↗
            </a>
          </div>
        </div>
      `;
    }

    default: {
      return `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 16px; padding: 20px; text-align: center;">
          <span style="font-size: 2rem;">🌿</span>
          <h4 style="font-size: 1rem; font-weight: 700; color: #34d399; margin: 6px 0;">The Seven Generations Stewardship Pledge</h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto;">
            We explore with curiosity, walk with reverence on ancestral Wampanoag lands, and protect the fragile sandplain heathlands for generations to come.
          </p>
        </div>
      `;
    }
  }
}

function renderNaturePlayTapeDeck(): string {
  const isPlaying = state.playTapeEngine.getIsPlaying();
  const activeTrack = state.playTapeEngine.getActiveTrack();
  const activeSide = state.playTapeEngine.getActiveSide();
  const sideTracks = state.playTapeEngine.getTracksForSide(activeSide);
  const positionSec = state.playTapeEngine.getTapePosition();

  const min = Math.floor(positionSec / 60);
  const sec = positionSec % 60;
  const timeFormatted = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

  return `
    <div class="cassette-deck-card" style="margin-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.6rem;">📼</span>
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin: 0;">
              Island Nature Detective Play Tape
            </h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">
              Child-Friendly Audio Stories &bull; Zero Data Collection &bull; COPPA Safe Harbor
            </span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="playTapeFlipSideBtn" class="badge font-mono" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid #fbbf24; cursor: pointer; padding: 6px 12px;">
            🔄 FLIP TO SIDE ${activeSide === 'A' ? 'B' : 'A'}
          </button>
          <span class="badge ${isPlaying ? 'badge-emerald' : 'badge-amber'} font-mono">
            ${isPlaying ? '▶ TAPE ROLLING' : '⏹ TAPE STOPPED'}
          </span>
        </div>
      </div>

      <!-- Retro Cassette Body -->
      <div class="cassette-shell">
        <div class="cassette-label">
          <span>📼 NANTUCKET NATURE TAPE</span>
          <span style="background: #78350f; color: #fef3c7; padding: 2px 8px; border-radius: 4px;">SIDE ${activeSide}</span>
          <span>STEREO 60</span>
        </div>

        <div class="cassette-window">
          <div class="cassette-tape-strip"></div>
          <div class="cassette-spool ${isPlaying ? 'spinning' : ''}">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #0f172a;"></div>
          </div>

          <div style="z-index: 2; text-align: center; background: rgba(15, 23, 42, 0.85); padding: 4px 12px; border-radius: 6px; border: 1px solid #475569;">
            <div style="font-size: 0.65rem; color: var(--text-muted); font-family: monospace;">TAPE COUNTER</div>
            <div style="font-size: 1rem; font-weight: 800; color: #34d399; font-family: monospace;">
              ${timeFormatted} / ${activeTrack.durationFormatted}
            </div>
          </div>

          <div class="cassette-spool ${isPlaying ? 'spinning' : ''}">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #0f172a;"></div>
          </div>
        </div>

        <!-- Mechanical Controls -->
        <div class="cassette-btn-row">
          <button id="playTapeRewindBtn" class="cassette-btn" title="Rewind 15s">
            ⏪ REW
          </button>
          ${isPlaying ? `
            <button id="playTapePauseBtn" class="cassette-btn" style="background: linear-gradient(180deg, #d97706 0%, #b45309 100%); border-color: #fbbf24; color: white;" title="Pause Playback">
              ⏸ PAUSE
            </button>
          ` : `
            <button id="playTapePlayBtn" class="cassette-btn active-play" title="Play Story Narration">
              ▶ PLAY
            </button>
          `}
          <button id="playTapeStopBtn" class="cassette-btn" title="Stop">
            ⏹ STOP
          </button>
          <button id="playTapeFwdBtn" class="cassette-btn" title="Fast Forward 15s">
            ⏩ FWD
          </button>
        </div>
      </div>

      <!-- Active Track Story Info & Spoken Reader -->
      <div style="margin-top: 18px; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border-subtle); border-radius: 16px; padding: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-size: 0.75rem; color: #38bdf8; font-weight: 800; text-transform: uppercase;">
              Track ${activeTrack.trackNumber} &bull; ${activeTrack.tagline}
            </span>
            <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 4px 0;">
              ${activeTrack.icon} ${activeTrack.title}
            </h4>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              Narrated by: <strong>${activeTrack.narrator}</strong>
            </span>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; margin: 12px 0 0 0; background: rgba(7, 10, 18, 0.6); padding: 14px; border-radius: 10px; border-left: 3px solid #38bdf8;">
          "${activeTrack.spokenStory}"
        </p>
      </div>

      <!-- Side Track Selection List -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 14px;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">
          Tracks on Side ${activeSide}:
        </span>
        ${sideTracks.map(t => `
          <button class="play-tape-track-pill ${t.id === activeTrack.id ? 'active' : ''}" data-play-tape-track="${t.id}">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.2rem;">${t.icon}</span>
              <div>
                <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${t.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${t.narrator}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.75rem; color: #38bdf8; font-family: monospace;">${t.durationFormatted}</span>
              <span style="font-size: 0.9rem;">${t.id === activeTrack.id && isPlaying ? '🔊' : '▶'}</span>
            </div>
          </button>
        `).join('')}
      </div>

      <!-- COPPA / Child Safety & Zooniverse Notice -->
      <div style="margin-top: 16px; padding: 12px 16px; background: rgba(56, 189, 248, 0.08); border: 1px dashed rgba(56, 189, 248, 0.3); border-radius: 12px; display: flex; align-items: center; gap: 12px; font-size: 0.75rem; color: #94a3b8;">
        <span style="font-size: 1.4rem;">🔒</span>
        <div>
          <strong style="color: #38bdf8;">Child Safety &amp; COPPA Safe Harbor:</strong> Zero logins, zero names, zero emails. Children can explore real nature science on <a href="https://www.zooniverse.org/" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline;">Zooniverse.org</a> safely and anonymously.
        </div>
      </div>
    </div>
  `;
}

function renderKioskQrModal(chapter: IKioskStoryChapter): string {
  const url = state.kioskEngine.generateMobileHandoffUrl(chapter.id);
  const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&color=38bdf8&bgcolor=0a0f1d`;

  return `
    <div style="position: fixed; inset: 0; z-index: 10000; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.25s ease;">
      <div class="glass-card" style="max-width: 440px; width: 100%; padding: 28px; text-align: center; border: 2px solid #38bdf8; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);">
        <span style="font-size: 2.5rem;">📱</span>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary); margin: 8px 0;">
          Take This Guide On Your Island Adventure
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 20px;">
          Scan with your phone's camera. Works offline in the moors with zero cellular data!
        </p>

        <div style="background: #0a0f1d; padding: 16px; border-radius: 16px; display: inline-block; border: 1px solid var(--border-subtle); margin-bottom: 16px;">
          <img src="${qrApi}" alt="Kiosk Mobile Sync QR Code" width="220" height="220" style="display: block; border-radius: 8px;">
        </div>

        <div style="font-size: 0.75rem; color: #38bdf8; font-family: monospace; word-break: break-all; margin-bottom: 20px;">
          ${url}
        </div>

        <button id="closeKioskQrBtn" class="btn-primary" style="width: 100%; min-height: 48px; font-size: 0.95rem;">
          Done / Return to Kiosk
        </button>
      </div>
    </div>
  `;
}

function renderKioskScreensaverOverlay(): string {
  return `
    <div class="kiosk-screensaver-overlay" id="wakeKioskOverlay">
      <div class="kiosk-screensaver-card">
        <div style="font-size: 4rem; margin-bottom: 12px; filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.6));">
          🦋
        </div>
        <div class="badge font-mono" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; font-size: 0.85rem; padding: 6px 14px; margin-bottom: 16px;">
          NANTUCKET VISITOR CENTER &amp; FERRY KIOSK
        </div>
        <h1 style="font-size: 2.4rem; font-weight: 900; color: var(--text-primary); line-height: 1.2; margin: 12px 0;">
          Welcome to Nantucket
        </h1>
        <p style="font-size: 1.1rem; color: #94a3b8; max-width: 580px; margin: 0 auto 32px auto; line-height: 1.6;">
          Explore the rare beauty of the sandplain moors, discover interactive trail armor science, and master simple family safety.
        </p>

        <div style="display: inline-flex; align-items: center; gap: 12px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; font-weight: 800; font-size: 1.15rem; padding: 18px 36px; border-radius: 18px; box-shadow: 0 10px 30px rgba(14, 165, 233, 0.5);">
          <span>Touch Anywhere to Begin Story ➔</span>
        </div>
      </div>
    </div>
  `;
}

// ─── DELEGATED EVENT SYSTEM ──────────────────────────────────────────────
// Single document-level listeners that survive innerHTML re-renders.
// Bound once at DOMContentLoaded; they use closest() to match ephemeral DOM nodes.

let _delegatedEventsWired = false;
let _flipLastClickTime = 0;
let _flipLastCardClicked = '';

function wireDelegatedEvents(): void {
  if (_delegatedEventsWired) return;
  _delegatedEventsWired = true;

  // ── CLICK delegation ─────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    // Kiosk Screensaver Wake
    if (target.closest('#wakeKioskOverlay')) {
      state.kioskEngine.wakeKiosk();
      renderApp();
      return;
    }

    // Kiosk Screensaver Trigger
    if (target.closest('#kioskScreensaverBtn')) {
      state.kioskEngine.triggerScreensaver();
      renderApp();
      return;
    }

    // Kiosk Chapter Stepper
    const kioskPill = target.closest('[data-kiosk-chapter]') as HTMLElement | null;
    if (kioskPill) {
      const ch = parseInt(kioskPill.dataset.kioskChapter || '0', 10);
      state.kioskEngine.setChapterIndex(ch);
      renderApp();
      return;
    }

    // Kiosk Next / Prev
    if (target.closest('#kioskPrevBtn')) {
      state.kioskEngine.prevChapter();
      renderApp();
      return;
    }
    if (target.closest('#kioskNextBtn')) {
      state.kioskEngine.nextChapter();
      renderApp();
      return;
    }

    // Kiosk Spoken Narration Voice Controls
    if (target.closest('#toggleKioskVoiceBtn')) {
      state.kioskEngine.toggleNarration();
      renderApp();
      return;
    }

    const personaBtn = target.closest('[data-kiosk-persona]') as HTMLElement | null;
    if (personaBtn) {
      const persona = personaBtn.dataset.kioskPersona as any;
      if (persona) {
        state.kioskEngine.setPersona(persona);
        renderApp();
      }
      return;
    }

    // Kiosk QR Modal
    if (target.closest('#kioskQrBtn') || target.closest('#kioskQrTakeawayBtn')) {
      state.showKioskQrModal = true;
      renderApp();
      return;
    }
    if (target.closest('#closeKioskQrBtn')) {
      state.showKioskQrModal = false;
      renderApp();
      return;
    }

    // COPPA Privacy Shield Modal
    if (target.closest('#openCoppaModalBtn')) {
      state.showCoppaModal = true;
      renderApp();
      return;
    }
    if (target.closest('#closeCoppaModalBtn') || target.closest('#closeCoppaModalBtn2')) {
      state.showCoppaModal = false;
      renderApp();
      return;
    }
    if (target.id === 'coppaModalOverlay') {
      state.showCoppaModal = false;
      renderApp();
      return;
    }

    // Kiosk Armor Lab Toggles
    if (target.closest('#toggleKioskSocksBtn')) {
      state.kioskArmorSocks = !state.kioskArmorSocks;
      renderApp();
      return;
    }
    if (target.closest('#toggleKioskPicaridinBtn')) {
      state.kioskArmorPicaridin = !state.kioskArmorPicaridin;
      renderApp();
      return;
    }
    if (target.closest('#toggleKioskPantsBtn')) {
      state.kioskArmorTucked = !state.kioskArmorTucked;
      renderApp();
      return;
    }

    // 📼 Nature Play Tape Controls
    if (target.closest('#playTapePlayBtn')) {
      state.playTapeEngine.play();
      renderApp();
      return;
    }
    if (target.closest('#playTapePauseBtn')) {
      state.playTapeEngine.pause();
      renderApp();
      return;
    }
    if (target.closest('#playTapeStopBtn')) {
      state.playTapeEngine.stop();
      renderApp();
      return;
    }
    if (target.closest('#playTapeRewindBtn')) {
      state.playTapeEngine.rewind();
      renderApp();
      return;
    }
    if (target.closest('#playTapeFwdBtn')) {
      state.playTapeEngine.fastForward();
      renderApp();
      return;
    }
    if (target.closest('#playTapeFlipSideBtn')) {
      const nextSide = state.playTapeEngine.getActiveSide() === 'A' ? 'B' : 'A';
      state.playTapeEngine.setSide(nextSide);
      renderApp();
      return;
    }
    const playTrackBtn = target.closest('[data-play-tape-track]') as HTMLElement | null;
    if (playTrackBtn) {
      const trackId = playTrackBtn.dataset.playTapeTrack;
      if (trackId) {
        state.playTapeEngine.selectTrack(trackId);
        state.playTapeEngine.play();
        renderApp();
        return;
      }
    }

    // Navigation Tabs
    const navTab = target.closest('.nav-tab[data-tab]') as HTMLElement | null;
    if (navTab) {
      const tab = navTab.dataset.tab;
      if (tab) { state.currentTab = tab; renderApp(); }
      return;
    }

    // Sound of Moors Toggle
    if (target.closest('#toggleMoorsAudioBtn')) {
      state.soundOfMoors.toggleAmbientSound();
      renderApp();
      return;
    }

    // 60-Second Guided Timer
    if (target.closest('#startTimerBtn')) {
      state.startGuidedTimer();
      return;
    }
    if (target.closest('#resetTimerBtn')) {
      state.resetGuidedTimer();
      renderApp();
      return;
    }

    // Simulate QR Scan
    if (target.closest('#simulateQrScanBtn')) {
      state.selectedTrailId = state.selectedQrTrailId;
      state.currentTab = 'radar';
      renderApp();
      return;
    }

    // SMS Send
    if (target.closest('#sendSmsBtn')) {
      if (state.smsInputText.trim()) {
        state.communityStore.parseSmsText(state.smsInputText.trim());
        state.smsInputText = '';
        renderApp();
      }
      return;
    }

    // Pharmacy Increment
    const pharmacyBtn = target.closest('.pharmacy-increment-btn[data-pharmacy]') as HTMLElement | null;
    if (pharmacyBtn) {
      const facility = pharmacyBtn.dataset.pharmacy as 'dans' | 'nantucket' | 'nch';
      if (facility) { state.communityStore.incrementPharmacyDoxy(facility); renderApp(); }
      return;
    }

    // Barberry Cleared
    const barbBtn = target.closest('.mark-barberry-cleared-btn[data-barb-id]') as HTMLElement | null;
    if (barbBtn) {
      const id = barbBtn.dataset.barbId;
      if (id) { state.communityStore.updateBarberryStatus(id, 'Cleared & Restored'); renderApp(); }
      return;
    }

    // Download CSV Export
    if (target.closest('#downloadCsvExportBtn')) {
      const csvContent = state.communityStore.generateTownCouncilCsvExport();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nantucket_tick_community_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Civic Event Category Filters
    const eventCatBtn = target.closest('button[data-event-cat]') as HTMLElement | null;
    if (eventCatBtn) {
      const cat = eventCatBtn.dataset.eventCat;
      if (cat) { state.selectedCivicEventCategory = cat; renderApp(); }
      return;
    }

    // Meeting Notes Category Filters
    const meetingCatBtn = target.closest('button[data-meeting-cat]') as HTMLElement | null;
    if (meetingCatBtn) {
      const cat = meetingCatBtn.dataset.meetingCat;
      if (cat) { state.selectedMeetingCategory = cat; renderApp(); }
      return;
    }

    // Body View Toggle
    const bodyViewBtn = target.closest('button[data-body-view]') as HTMLElement | null;
    if (bodyViewBtn) {
      const view = bodyViewBtn.dataset.bodyView as 'front' | 'back';
      if (view) { state.bodyView = view; renderApp(); }
      return;
    }

    // Body Hotspot Beacons
    const hotspot = target.closest('.hotspot-beacon[data-zone-id]') as HTMLElement | null;
    if (hotspot) {
      const zoneId = hotspot.dataset.zoneId;
      if (zoneId) { state.selectedBodyZoneId = zoneId; renderApp(); }
      return;
    }

    // Body Zone Select Pills
    const zoneSelect = target.closest('button[data-zone-select]') as HTMLElement | null;
    if (zoneSelect) {
      const zoneId = zoneSelect.dataset.zoneSelect;
      if (zoneId) { state.selectedBodyZoneId = zoneId; renderApp(); }
      return;
    }

    // Weather Preset Buttons
    const weatherBtn = target.closest('button[data-weather-preset]') as HTMLElement | null;
    if (weatherBtn) {
      const presetId = weatherBtn.dataset.weatherPreset;
      const preset = ISLAND_WEATHER_PRESETS.find(p => p.id === presetId);
      if (preset) {
        state.weatherTempF = preset.tempF;
        state.weatherHumidity = preset.relativeHumidityPercent;
        state.weatherWindKnots = preset.windSpeedKnots;
        renderApp();
      }
      return;
    }

    // Coastal Buoy Sync Buttons
    const buoyBtn = target.closest('button[data-apply-buoy]') as HTMLElement | null;
    if (buoyBtn) {
      const buoyId = buoyBtn.dataset.applyBuoy;
      const buoy = COASTAL_BUOY_STATIONS.find(b => b.id === buoyId);
      if (buoy) {
        state.weatherTempF = Math.round(buoy.airTempF);
        state.weatherHumidity = buoy.relativeHumidityPercent;
        state.weatherWindKnots = Math.round(buoy.windSpeedKnots);
        renderApp();
      }
      return;
    }

    // Ferry Kit Item Toggles
    const kitItem = target.closest('.ferry-kit-item[data-kit-id]') as HTMLElement | null;
    if (kitItem) {
      const kitId = kitItem.dataset.kitId;
      if (kitId) { state.ferryKitStore.toggleItem(kitId); renderApp(); }
      return;
    }

    // Reset Ferry Kit
    if (target.closest('#resetFerryKitBtn')) {
      state.ferryKitStore.resetToDefaults();
      renderApp();
      return;
    }

    // Basemap Switcher
    const basemapBtn = target.closest('button[data-basemap]') as HTMLElement | null;
    if (basemapBtn) {
      const mode = basemapBtn.dataset.basemap as BasemapMode;
      if (mode) { state.mapEngine.setBasemap(mode); renderApp(); }
      return;
    }

    // Quick Zoom Presets
    const zoomBtn = target.closest('button[data-zoom-preset]') as HTMLElement | null;
    if (zoomBtn) {
      const preset = zoomBtn.dataset.zoomPreset as any;
      if (preset) { state.mapEngine.flyToPreset(preset); renderApp(); }
      return;
    }

    // Map Layer Toggles
    const layerBtn = target.closest('.map-layer-btn[data-layer]') as HTMLElement | null;
    if (layerBtn) {
      const layer = layerBtn.dataset.layer as any;
      if (layer) {
        const currentVal = (state.mapEngine.getLayers() as any)[layer];
        state.mapEngine.setLayer(layer, !currentVal);
        renderApp();
      }
      return;
    }

    // Route Selection
    const routeCard = target.closest('.route-select-card') as HTMLElement | null;
    if (routeCard) {
      const routeId = routeCard.dataset.routeId;
      if (routeId) {
        state.mapEngine.setActiveRoute(routeId);
        const route = state.mapEngine.getActiveRoute();
        if (route && route.fromLocationId) {
          state.mapEngine.setActiveLocation(route.fromLocationId);
        }
        renderApp();
      }
      return;
    }

    // Reset Triage
    if (target.closest('#quickResetBtn')) {
      state.resetTriage();
      renderApp();
      return;
    }

    // Presets
    const presetBtn = target.closest('button[data-preset]') as HTMLElement | null;
    if (presetBtn) {
      const preset = presetBtn.dataset.preset as any;
      if (preset) { state.applyPreset(preset); renderApp(); }
      return;
    }

    // Repellent Selector
    const repBtn = target.closest('.repellent-select-btn') as HTMLElement | null;
    if (repBtn) {
      const repId = repBtn.dataset.repId;
      if (repId) { state.selectedRepellentId = repId; renderApp(); }
      return;
    }

    // Article Category Filters
    const artCatBtn = target.closest('button[data-art-cat]') as HTMLElement | null;
    if (artCatBtn) {
      const cat = artCatBtn.dataset.artCat;
      if (cat) { state.selectedArticleCategory = cat; renderApp(); }
      return;
    }

    // Read Article Button
    const readBtn = target.closest('.read-article-btn') as HTMLElement | null;
    if (readBtn) {
      const artId = readBtn.dataset.artId;
      if (artId) {
        state.activeArticleId = artId;
        renderApp();
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
      return;
    }

    // Close Article Reader
    if (target.closest('#closeArticleBtn')) {
      state.activeArticleId = null;
      renderApp();
      return;
    }

    // Source Category Filters
    const srcCatBtn = target.closest('button[data-src-cat]') as HTMLElement | null;
    if (srcCatBtn) {
      const cat = srcCatBtn.dataset.srcCat;
      if (cat) { state.selectedSourceCategory = cat; renderApp(); }
      return;
    }

    // Global Reading Mode Toggle
    if (target.closest('#toggleReadingModeBtn')) {
      state.toggleGlobalReadingMode();
      renderApp();
      return;
    }

    // ── FLIP CARD HANDLERS (Click-based) ─────────────────────────────
    // 1. Direct flip button click (highest priority)
    const flipBtn = target.closest('.toggle-flip-btn, .flip-hint-badge') as HTMLElement | null;
    if (flipBtn) {
      e.preventDefault();
      e.stopPropagation();
      const cardId = flipBtn.dataset.flipTarget
        || (flipBtn.closest('.flip-card-container') as HTMLElement | null)?.dataset.cardId;
      if (cardId) {
        state.toggleCardFlip(cardId);
        renderApp();
      }
      return;
    }

    // 2. Click anywhere on a flip-card-container (rapid double-click tolerance)
    const flipCard = target.closest('.flip-card-container') as HTMLElement | null;
    if (flipCard) {
      // Skip interactive child elements
      if (target.closest('a, input, select, textarea, .read-article-btn')) return;

      const cardId = flipCard.dataset.cardId;
      if (!cardId) return;

      // Flip header bar click
      if (target.closest('.flip-header-bar')) {
        e.preventDefault();
        e.stopPropagation();
        state.toggleCardFlip(cardId);
        renderApp();
        return;
      }

      // Trackpad / Mouse rapid double-click tolerance (within 450ms)
      const now = Date.now();
      if (_flipLastCardClicked === cardId && (now - _flipLastClickTime) < 450) {
        state.toggleCardFlip(cardId);
        renderApp();
        _flipLastClickTime = 0;
        _flipLastCardClicked = '';
      } else {
        _flipLastClickTime = now;
        _flipLastCardClicked = cardId;
      }
      return;
    }
  });

  // ── DBLCLICK delegation (native browser double-click) ────────────
  document.addEventListener('dblclick', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, input, select, textarea, .read-article-btn')) return;

    const flipCard = target.closest('.flip-card-container') as HTMLElement | null;
    if (flipCard) {
      const cardId = flipCard.dataset.cardId;
      if (cardId) {
        state.toggleCardFlip(cardId);
        renderApp();
      }
    }
  });

  // ── INPUT delegation (sliders, search boxes, SMS) ────────────────
  document.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (!target) return;

    const id = target.id;

    // Weather sliders
    if (id === 'tempSlider') {
      state.weatherTempF = parseInt(target.value, 10);
      renderApp();
      return;
    }
    if (id === 'humiditySlider') {
      state.weatherHumidity = parseInt(target.value, 10);
      renderApp();
      return;
    }
    if (id === 'windSlider') {
      state.weatherWindKnots = parseInt(target.value, 10);
      renderApp();
      return;
    }

    // Attachment & Removal sliders
    if (id === 'attachmentSlider') {
      state.attachmentHours = parseInt(target.value, 10);
      renderApp();
      return;
    }
    if (id === 'removalSlider') {
      state.hoursSinceRemoval = parseInt(target.value, 10);
      renderApp();
      return;
    }
    if (id === 'kioskClockSlider') {
      state.kioskClockHours = parseInt(target.value, 10);
      renderApp();
      return;
    }

    // Article Search Input
    if (id === 'articleSearchInput') {
      state.articleSearchQuery = target.value;
      renderApp();
      const updatedInput = document.getElementById('articleSearchInput') as HTMLInputElement;
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
      }
      return;
    }

    // Source Search Input
    if (id === 'sourceSearchInput') {
      state.sourceSearchQuery = target.value;
      renderApp();
      const updatedInput = document.getElementById('sourceSearchInput') as HTMLInputElement;
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.setSelectionRange(updatedInput.value.length, updatedInput.value.length);
      }
      return;
    }

    // SMS Input (no re-render, just update state)
    if (id === 'smsInput') {
      state.smsInputText = target.value;
      return;
    }
  });

  // ── CHANGE delegation (select dropdowns, radio buttons, checkboxes) ──
  document.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (!target) return;

    // QR Trail Select
    if (target.id === 'qrTrailSelect') {
      state.selectedQrTrailId = target.value;
      renderApp();
      return;
    }

    // Species Radio
    if (target.name === 'species') {
      state.selectedSpecies = target.value as TickSpecies;
      renderApp();
      return;
    }

    // Symptom Checkboxes
    if (target.dataset.symptom) {
      const key = target.dataset.symptom as keyof ISymptomInput;
      if (key) {
        (state.symptoms as any)[key] = target.checked;
        renderApp();
      }
      return;
    }
  });
}

// Global Keyboard Accelerators
document.addEventListener('keydown', (e) => {
  const target = e.target as HTMLElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
    if (e.key === 'Escape') target.blur();
    return;
  }

  const tabKeys: Record<string, string> = {
    '1': 'map',
    'm': 'map',
    'M': 'map',
    '2': 'bodyscan',
    '3': 'weather',
    '4': 'radar',
    '5': 'community',
    '6': 'repellents',
    '7': 'articles',
    '8': 'ferrykit',
    '9': 'eisenhower',
    '0': 'sevengen',
    's': 'sources',
    'S': 'sources',
    'h': 'hospital',
    'H': 'hospital',
    'k': 'kiosk',
    'K': 'kiosk'
  };

  if (tabKeys[e.key]) {
    state.currentTab = tabKeys[e.key];
    renderApp();
  } else if (e.key === '/') {
    e.preventDefault();
    state.currentTab = 'articles';
    renderApp();
    setTimeout(() => {
      const input = document.getElementById('articleSearchInput') as HTMLInputElement;
      if (input) input.focus();
    }, 50);
  } else if (e.key === 'Escape') {
    if (state.activeArticleId) {
      state.activeArticleId = null;
      renderApp();
    }
  }
});

// Initial Mount
document.addEventListener('DOMContentLoaded', () => {
  wireDelegatedEvents();
  state.kioskEngine.onNarrationStateChange = () => renderApp();
  renderApp();
});
