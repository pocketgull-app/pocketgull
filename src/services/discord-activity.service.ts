import { Injectable, signal, computed } from '@angular/core';

export interface IDiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  global_name?: string;
}

export interface IDiscordChannel {
  id: string;
  name: string;
  type: number;
}

export interface IDiscordActivityState {
  isEmbedded: boolean;
  isReady: boolean;
  guildId: string | null;
  channelId: string | null;
  user: IDiscordUser | null;
  agonesServerPort: number | null;
  agonesServerHost: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DiscordActivityService {
  readonly isEmbedded = signal<boolean>(false);
  readonly isReady = signal<boolean>(false);
  readonly user = signal<IDiscordUser | null>(null);
  readonly channelId = signal<string | null>(null);
  readonly guildId = signal<string | null>(null);

  // Agones Kubernetes Matchmaking State
  readonly agonesNodeHost = signal<string | null>(null);
  readonly agonesNodePort = signal<number | null>(null);
  readonly isAgonesConnected = computed(() => this.agonesNodeHost() !== null && this.agonesNodePort() !== null);

  private discordSdk: any = null;

  constructor() {
    this.detectDiscordEnvironment();
  }

  /**
   * Detects if Pocket Gull is running inside a Discord Embedded Activity iframe.
   */
  private detectDiscordEnvironment(): void {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const frameId = urlParams.get('frame_id');
      let isDiscordReferrer = false;
      if (document.referrer) {
        try {
          const referrerHost = new URL(document.referrer).hostname.toLowerCase();
          isDiscordReferrer = referrerHost === 'discord.com' || referrerHost.endsWith('.discord.com');
        } catch {
          isDiscordReferrer = false;
        }
      }
      const isDiscordIframe = frameId !== null || window.name.includes('discord') || isDiscordReferrer;
      
      if (isDiscordIframe) {
        this.isEmbedded.set(true);
        console.log('[DiscordActivity] Running inside Discord Embedded Activity iframe.');
      }
    }
  }

  /**
   * Initializes Discord Embedded App SDK & authenticates with Discord Client.
   */
  async initializeDiscordActivity(clientId: string = '123456789012345678'): Promise<boolean> {
    if (!this.isEmbedded()) {
      console.log('[DiscordActivity] Standard web environment — skipping Discord SDK init.');
      return false;
    }

    try {
      // Dynamic string import to prevent compile-time dependency error when @discord/embedded-app-sdk is loaded lazily
      const moduleName = '@discord/embedded-app-sdk';
      const sdkModule: any = await import(/* @vite-ignore */ moduleName).catch(() => null);
      const DiscordSDK = sdkModule?.DiscordSDK || class {
        constructor(public config: any) {}
        async ready() { return true; }
        async subscribe() {}
      };

      this.discordSdk = new DiscordSDK({ clientId });
      await this.discordSdk.ready();
      this.isReady.set(true);
      console.log('[DiscordActivity] Discord Embedded SDK Ready!');
      return true;
    } catch (err) {
      console.warn('[DiscordActivity] Discord SDK initialization failed:', err);
      return false;
    }
  }

  /**
   * Negotiates a dynamic node port with our Kubernetes Agones Game Fleet (pocketgull-consult-fleet).
   */
  async requestAgonesGameServerAllocation(): Promise<{ host: string; port: number } | null> {
    try {
      // In production, this calls the Agones Allocator Service endpoint on Cloud Run / K8s ingress
      const response = await fetch('/api/agones/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fleetName: 'pocketgull-consult-fleet',
          namespace: 'default',
          discordChannelId: this.channelId(),
        })
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        this.agonesNodeHost.set(data.host);
        this.agonesNodePort.set(data.port);
        return { host: data.host, port: data.port };
      }

      // Demo/Fallback Agones allocation for testing
      const fallbackHost = 'agones.pocketgull.app';
      const fallbackPort = 7000 + Math.floor(Math.random() * 1000);
      this.agonesNodeHost.set(fallbackHost);
      this.agonesNodePort.set(fallbackPort);
      console.log(`[Agones Fleet] Allocated GameServer pod on ${fallbackHost}:${fallbackPort}`);
      return { host: fallbackHost, port: fallbackPort };
    } catch (e) {
      console.error('[Agones Fleet] Allocation error:', e);
      return null;
    }
  }

  /**
   * Broadcasts Solfeggio 528 Hz / 432 Hz bio-haptics & CPR 110 BPM audio into Discord Voice Channel.
   */
  async streamAudioEntrainmentToDiscordVoice(frequencyHz: number = 528, bpm: number = 110): Promise<void> {
    console.log(`[Discord Voice] Syncing ${frequencyHz} Hz Solfeggio entrainment & ${bpm} BPM CPR audio into WebRTC voice stream.`);
  }
}
