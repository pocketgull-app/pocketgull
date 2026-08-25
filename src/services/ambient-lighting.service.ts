import { Injectable, effect, inject, signal } from '@angular/core';
import { CircadianSleepinessService } from './circadian-sleepiness.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface IHueConfig {
  bridgeIp: string;
  username: string;
  lightId: string;
  enabled: boolean;
  useRelay: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AmbientLightingService {
  private circadianService = inject(CircadianSleepinessService);
  private http = inject(HttpClient);

  // Configuration for the Hue Bridge integration
  readonly hueConfig = signal<IHueConfig>({
    bridgeIp: '',
    username: '',
    lightId: '1', // Default to light #1
    enabled: false,
    useRelay: typeof window !== 'undefined' && window.location.protocol === 'https:'
  });

  readonly isConnected = signal(false);
  readonly lastError = signal<string | null>(null);

  readonly emergencyOverride = signal<{active: boolean; hue: number; sat: number; bri: number}>({ active: false, hue: 0, sat: 0, bri: 0 });

  public setEmergencyOverride(active: boolean, hue = 10000, sat = 200, bri = 50) {
    this.emergencyOverride.set({ active, hue, sat, bri });
  }

  constructor() {
    // Automatically sync circadian theme to physical room lights
    effect(() => {
      const config = this.hueConfig();
      if (!config.enabled || !config.bridgeIp || !config.username) return;

      const emergency = this.emergencyOverride();
      if (emergency.active) {
        this.syncHueLight(config, emergency.hue, emergency.sat, emergency.bri);
        return;
      }

      const currentTheme = this.circadianService.circadian();
      
      // Hue color math: 
      // Hue: 0-65535 (HSL hue 0-360 mapped to 0-65535)
      // Saturation: 0-254 (HSL sat 0-100 mapped to 0-254)
      // Brightness: 0-254 (HSL lightness 0-100 mapped to 0-254)
      
      const hueValue = Math.round((currentTheme.colorHslData.h / 360) * 65535);
      const satValue = Math.round((currentTheme.colorHslData.s / 100) * 254);
      // Adjust lightness for physical brightness, capping to ensure it's not too dark
      const briValue = Math.max(10, Math.round((currentTheme.colorHslData.l / 100) * 254));

      this.syncHueLight(config, hueValue, satValue, briValue);
    });
  }

  public updateConfig(config: Partial<IHueConfig>) {
    this.hueConfig.update(c => ({ ...c, ...config }));
  }

  private syncHueLight(config: IHueConfig, hue: number, sat: number, bri: number) {
    const baseUrl = config.useRelay 
      ? `http://localhost:8080/api/hue/${config.bridgeIp}` 
      : `http://${config.bridgeIp}`;
      
    const url = `${baseUrl}/api/${config.username}/lights/${config.lightId}/state`;
    
    const payload = {
      on: true,
      hue: hue,
      sat: sat,
      bri: bri,
      transitiontime: 40 // 4 seconds for smooth fading to match UI breathing
    };

    this.http.put(url, payload).pipe(
      catchError(err => {
        this.lastError.set(err.message || 'Failed to connect to Hue Bridge');
        this.isConnected.set(false);
        return of(null);
      })
    ).subscribe(res => {
      if (res) {
        this.isConnected.set(true);
        this.lastError.set(null);
      }
    });
  }
}
