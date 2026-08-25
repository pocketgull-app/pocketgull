import type * as LeafletType from 'leaflet';
import {
  IIslandLocation,
  ISafeCorridorRoute,
  NANTUCKET_LOCATIONS,
  SAFE_CORRIDOR_ROUTES,
  computeHospitalTransitStats
} from '../data/nantucket-geo.js';
import { COASTAL_BUOY_STATIONS, INoaaBuoyStation } from '../data/coastal-buoy-data.js';

export type BasemapMode = 'satellite' | 'dark' | 'topo';

export interface IMapLayerState {
  basemap: BasemapMode;
  showRiskHeatmap: boolean;
  showSafeCorridors: boolean;
  showHospitalAndPharmacies: boolean;
  showSolarDesiccation: boolean;
  showMarineBuoys: boolean;
}

export class NantucketMapEngine {
  private map: any = null;
  private L: typeof LeafletType | null = null;
  private activeLocationId: string = 'sanford-farm';
  private activeRouteId: string | null = 'town-to-sconset-paved';
  private baseLayers: Record<BasemapMode, any> | null = null;
  private overlayLayers: {
    heatmaps: any;
    corridors: any;
    markers: any;
    solarDunes: any;
    marineBuoys: any;
  } | null = null;

  private layers: IMapLayerState = {
    basemap: 'satellite',
    showRiskHeatmap: true,
    showSafeCorridors: true,
    showHospitalAndPharmacies: true,
    showSolarDesiccation: true,
    showMarineBuoys: true
  };

  private onLocationSelectedCallback: ((loc: IIslandLocation) => void) | null = null;

  public getLayers(): IMapLayerState {
    return { ...this.layers };
  }

  public setBasemap(mode: BasemapMode) {
    this.layers.basemap = mode;
    if (this.map && this.baseLayers) {
      Object.values(this.baseLayers).forEach(layer => this.map?.removeLayer(layer));
      this.baseLayers[mode].addTo(this.map);
    }
  }

  public setLayer(layerKey: keyof Omit<IMapLayerState, 'basemap'>, value: boolean) {
    this.layers[layerKey] = value;
    this.syncOverlayVisibility();
  }

  public getActiveLocation(): IIslandLocation {
    return NANTUCKET_LOCATIONS.find(l => l.id === this.activeLocationId) || NANTUCKET_LOCATIONS[0];
  }

  public setActiveLocation(locationId: string) {
    this.activeLocationId = locationId;
    const loc = this.getActiveLocation();
    if (this.map) {
      this.map.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 });
    }
  }

  public getActiveRoute(): ISafeCorridorRoute | null {
    if (!this.activeRouteId) return null;
    return SAFE_CORRIDOR_ROUTES.find(r => r.id === this.activeRouteId) || null;
  }

  public setActiveRoute(routeId: string | null) {
    this.activeRouteId = routeId;
  }

  public getHospitalTransit() {
    const loc = this.getActiveLocation();
    return computeHospitalTransitStats(loc.lat, loc.lng);
  }

  public getAllLocations(): IIslandLocation[] {
    return NANTUCKET_LOCATIONS;
  }

  public getAllRoutes(): ISafeCorridorRoute[] {
    return SAFE_CORRIDOR_ROUTES;
  }

  public setOnLocationSelected(cb: (loc: IIslandLocation) => void) {
    this.onLocationSelectedCallback = cb;
  }

  public flyToPreset(preset: 'overview' | 'sanford' | 'squam' | 'town' | 'greatpoint') {
    if (!this.map) return;
    if (preset === 'overview') {
      this.map.flyTo([41.2835, -70.0995], 12, { duration: 1.0 });
    } else if (preset === 'sanford') {
      this.setActiveLocation('sanford-farm');
      this.map.flyTo([41.2662, -70.1585], 14, { duration: 1.0 });
    } else if (preset === 'squam') {
      this.setActiveLocation('squam-swamp');
      this.map.flyTo([41.3128, -69.9982], 15, { duration: 1.0 });
    } else if (preset === 'town') {
      this.setActiveLocation('nch-hospital');
      this.map.flyTo([41.2750, -70.0995], 14, { duration: 1.0 });
    } else if (preset === 'greatpoint') {
      this.setActiveLocation('great-point-light');
      this.map.flyTo([41.3700, -70.0400], 13, { duration: 1.0 });
    }
  }

  /**
   * Transforms GPS coordinates to SVG coordinate bounds.
   */
  public projectToSvg(lat: number, lng: number): { x: number; y: number } {
    const minLat = 41.23;
    const maxLat = 41.41;
    const minLng = -70.22;
    const maxLng = -69.94;

    const width = 900;
    const height = 500;

    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = ((maxLat - lat) / (maxLat - minLat)) * height;

    return { x: Math.round(x), y: Math.round(y) };
  }

  /**
   * Initializes the interactive Leaflet satellite map in the given container.
   */
  public async mountMap(containerId: string) {
    if (typeof window === 'undefined') return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const leafletModule = await import('leaflet');
    const L = leafletModule.default || leafletModule;
    this.L = L;

    // Clean previous instance if exists
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Initialize Map instance
    this.map = L.map(containerId, {
      center: [41.2835, -70.0995],
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false
    });

    // Basemaps: Esri Satellite, CartoDB Dark, OpenStreetMap Topo
    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );

    const darkTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, subdomains: 'abcd' }
    );

    const topoTile = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      { maxZoom: 17 }
    );

    this.baseLayers = {
      satellite: satelliteTile,
      dark: darkTile,
      topo: topoTile
    };

    // Mount active basemap
    this.baseLayers[this.layers.basemap].addTo(this.map);

    // Create Layer Groups
    this.overlayLayers = {
      heatmaps: L.layerGroup().addTo(this.map),
      corridors: L.layerGroup().addTo(this.map),
      markers: L.layerGroup().addTo(this.map),
      solarDunes: L.layerGroup().addTo(this.map),
      marineBuoys: L.layerGroup().addTo(this.map)
    };

    this.renderHeatmaps(L);
    this.renderCorridors(L);
    this.renderMarkers(L);
    this.renderSolarDunes(L);
    this.renderMarineBuoys(L);
    this.syncOverlayVisibility();

    // Multi-stage Invalidate size to ensure clean tile rendering on mobile and desktop
    [50, 150, 400].forEach(delay => {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, delay);
    });

    // Auto-invalidate on window resize
    window.addEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, { passive: true });
  }

  private renderHeatmaps(L: any) {
    if (!this.overlayLayers) return;
    this.overlayLayers.heatmaps.clearLayers();

    // Squam Swamp Extreme Heat
    L.circle([41.3128, -69.9982], {
      radius: 950,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.35,
      weight: 2
    }).bindTooltip('🚨 Squam Swamp: Extreme Tick Density (9.5/10)', { permanent: false }).addTo(this.overlayLayers.heatmaps);

    // Middle Moors High Heat
    L.circle([41.2754, -70.0381], {
      radius: 1200,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.3,
      weight: 2
    }).bindTooltip('⚠️ Middle Moors & Altar Rock: High Tick Density (8.2/10)', { permanent: false }).addTo(this.overlayLayers.heatmaps);

    // Sanford Farm High Heat
    L.circle([41.2662, -70.1585], {
      radius: 1000,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.3,
      weight: 2
    }).bindTooltip('⚠️ Sanford Farm: High Tick Density (7.8/10)', { permanent: false }).addTo(this.overlayLayers.heatmaps);
  }

  private renderCorridors(L: any) {
    if (!this.overlayLayers) return;
    this.overlayLayers.corridors.clearLayers();

    SAFE_CORRIDOR_ROUTES.forEach(route => {
      const color = route.isPavedCorridor ? '#10b981' : '#ef4444';
      const weight = route.isPavedCorridor ? 5 : 3;
      const dashArray = route.isPavedCorridor ? '8, 6' : undefined;

      const polyline = L.polyline(route.waypointCoordinates, {
        color,
        weight,
        opacity: 0.9,
        dashArray
      }).addTo(this.overlayLayers!.corridors);

      polyline.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-size: 0.9rem; font-weight: 700;">${route.name}</h4>
          <div style="font-size: 0.75rem; color: #475569; margin-bottom: 6px;">${route.routeSummary}</div>
          <div style="font-size: 0.75rem;">
            <strong>🚴 ${route.estimatedBikeMinutes}m • 🚶 ${route.estimatedWalkMinutes}m</strong><br/>
            <span style="color: ${route.tickExposureScore <= 1.5 ? '#059669' : '#dc2626'}; font-weight: 700;">
              Tick Exposure Score: ${route.tickExposureScore}/10
            </span>
          </div>
        </div>
      `);
    });
  }

  private renderMarkers(L: any) {
    if (!this.overlayLayers) return;
    this.overlayLayers.markers.clearLayers();

    NANTUCKET_LOCATIONS.forEach(loc => {
      let iconColor = '#38bdf8';
      let iconEmoji = '📍';

      if (loc.category === 'hospital') {
        iconColor = '#ef4444';
        iconEmoji = '🏥';
      } else if (loc.category === 'pharmacy') {
        iconColor = '#a855f7';
        iconEmoji = '💊';
      } else if (loc.category === 'town_hall') {
        iconColor = '#f97316';
        iconEmoji = '🏛️';
      } else if (loc.category === 'library') {
        iconColor = '#0284c7';
        iconEmoji = '📚';
      } else if (loc.category === 'senior_center') {
        iconColor = '#84cc16';
        iconEmoji = '👵';
      } else if (loc.category === 'civic_center') {
        iconColor = '#10b981';
        iconEmoji = '🏛️';
      } else if (loc.riskRating === 'Extreme') {
        iconColor = '#ef4444';
        iconEmoji = '🚨';
      } else if (loc.riskRating === 'High') {
        iconColor = '#f59e0b';
        iconEmoji = '⚠️';
      } else if (loc.riskRating === 'Zero') {
        iconColor = '#10b981';
        iconEmoji = '🟢';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${iconColor}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 12px ${iconColor}; cursor: pointer; transform: translate(-50%, -50%);">
            ${iconEmoji}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(this.overlayLayers!.markers);

      marker.on('click', () => {
        this.activeLocationId = loc.id;
        if (this.onLocationSelectedCallback) {
          this.onLocationSelectedCallback(loc);
        }
      });

      marker.bindTooltip(`
        <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.8rem; padding: 2px;">
          ${loc.name.split(' (')[0]} (${loc.riskRating} Risk)
        </div>
      `, { direction: 'top', offset: [0, -14] });
    });
  }

  private renderSolarDunes(L: any) {
    if (!this.overlayLayers) return;
    this.overlayLayers.solarDunes.clearLayers();

    // Great Point Outer Spit
    L.circle([41.3800, -70.0450], {
      radius: 1100,
      color: '#f59e0b',
      fillColor: '#fbbf24',
      fillOpacity: 0.25,
      weight: 1.5
    }).bindTooltip('☀️ Great Point Dunes: High UV & Wind Desiccation (Zero Ticks)', { permanent: false }).addTo(this.overlayLayers.solarDunes);

    // Madaket Beach Coastline
    L.circle([41.2715, -70.2015], {
      radius: 900,
      color: '#f59e0b',
      fillColor: '#fbbf24',
      fillOpacity: 0.25,
      weight: 1.5
    }).bindTooltip('☀️ Madaket Beach: Salt Spray & Sand Dune Desiccation', { permanent: false }).addTo(this.overlayLayers.solarDunes);
  }

  private renderMarineBuoys(L: any) {
    if (!this.overlayLayers) return;
    this.overlayLayers.marineBuoys.clearLayers();

    COASTAL_BUOY_STATIONS.forEach(buoy => {
      const buoyIcon = L.divIcon({
        className: 'custom-buoy-marker',
        html: `
          <div style="width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 0 16px rgba(14, 165, 233, 0.8); cursor: pointer; transform: translate(-50%, -50%);">
            ⚓
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker(buoy.coordinates, { icon: buoyIcon }).addTo(this.overlayLayers!.marineBuoys);

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; color: #0f172a; padding: 6px; max-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 0.7rem; font-weight: 700; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px;">${buoy.agency}</span>
            <span style="font-size: 0.7rem; color: #64748b;">${buoy.distanceFromIsland}</span>
          </div>
          <h4 style="margin: 0 0 6px 0; font-size: 0.9rem; font-weight: 800; color: #0f172a;">${buoy.name}</h4>
          
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; font-size: 0.75rem; margin-bottom: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div><strong>🌊 Water:</strong> ${buoy.waterTempF}°F</div>
              <div><strong>🌡️ Air:</strong> ${buoy.airTempF}°F</div>
              <div><strong>💧 Humidity:</strong> ${buoy.relativeHumidityPercent}%</div>
              <div><strong>💨 Wind:</strong> ${buoy.windSpeedKnots} kts ${buoy.windDirectionCardinal}</div>
              <div><strong>🌊 Swell:</strong> ${buoy.waveHeightFt} ft (${buoy.wavePeriodSec}s)</div>
              <div><strong>🌫️ Sea Fog:</strong> ${buoy.seaFogStatus}</div>
            </div>
          </div>

          <div style="font-size: 0.72rem; color: #334155; line-height: 1.4; margin-bottom: 8px;">
            <strong>Tick Ecology Impact:</strong><br/>
            ${buoy.tickEcologyImpact}
          </div>

          <div style="display: flex; gap: 6px;">
            <a href="${buoy.noaaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 4px 8px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
              Live NOAA Page ↗
            </a>
          </div>
        </div>
      `);

      marker.bindTooltip(`
        <div style="font-family: 'Inter', sans-serif; font-weight: 600; font-size: 0.8rem; padding: 2px;">
          ⚓ ${buoy.name.split(' — ')[0]} (${buoy.waterTempF}°F SST • ${buoy.waveHeightFt}ft Swell)
        </div>
      `, { direction: 'top', offset: [0, -16] });
    });
  }

  private syncOverlayVisibility() {
    if (!this.map || !this.overlayLayers) return;

    if (this.layers.showRiskHeatmap) {
      if (!this.map.hasLayer(this.overlayLayers.heatmaps)) this.map.addLayer(this.overlayLayers.heatmaps);
    } else {
      if (this.map.hasLayer(this.overlayLayers.heatmaps)) this.map.removeLayer(this.overlayLayers.heatmaps);
    }

    if (this.layers.showSafeCorridors) {
      if (!this.map.hasLayer(this.overlayLayers.corridors)) this.map.addLayer(this.overlayLayers.corridors);
    } else {
      if (this.map.hasLayer(this.overlayLayers.corridors)) this.map.removeLayer(this.overlayLayers.corridors);
    }

    if (this.layers.showHospitalAndPharmacies) {
      if (!this.map.hasLayer(this.overlayLayers.markers)) this.map.addLayer(this.overlayLayers.markers);
    } else {
      if (this.map.hasLayer(this.overlayLayers.markers)) this.map.removeLayer(this.overlayLayers.markers);
    }

    if (this.layers.showSolarDesiccation) {
      if (!this.map.hasLayer(this.overlayLayers.solarDunes)) this.map.addLayer(this.overlayLayers.solarDunes);
    } else {
      if (this.map.hasLayer(this.overlayLayers.solarDunes)) this.map.removeLayer(this.overlayLayers.solarDunes);
    }

    if (this.layers.showMarineBuoys) {
      if (!this.map.hasLayer(this.overlayLayers.marineBuoys)) this.map.addLayer(this.overlayLayers.marineBuoys);
    } else {
      if (this.map.hasLayer(this.overlayLayers.marineBuoys)) this.map.removeLayer(this.overlayLayers.marineBuoys);
    }
  }
}
