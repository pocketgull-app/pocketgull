import { Injectable, signal, computed } from '@angular/core';

export type ImpactChannelPlatform = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'X' | 'FACEBOOK' | 'WEBSITE';

export interface IImpactPartnerChannel {
  id: string;
  platform: ImpactChannelPlatform;
  channelName: string;
  handleOrUrl: string;
  followerOrVisitorCount: number;
  isVerified: boolean;
  status: 'CONNECTED_PRIMARY' | 'CONNECTED' | 'PENDING_VERIFICATION';
  impactChecklistId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImpactPartnerChannelsService {
  readonly impactProfileDescription = signal<string>(
    `Pocketgull (pocketgull.app) is an emerging, real-time multimodal Clinical Strategy & Bio-Resonance AI platform currently launching to early adopters, healthcare innovators, and digital estate planners. ` +
    `We provide interactive digital tools spanning 10 clinical paradigms—including sovereign posthumous data vaults, legal estate trust integration, circadian travel wellness, and high-performance athletic bio-tracking. ` +
    `As an early-stage platform, we offer partner brands high-intent, targeted visibility among privacy-conscious health enthusiasts, clinical practitioners, and digital estate builders. ` +
    `Partnerships with Pocketgull deliver dedicated brand positioning, client-side conversion flows, and trusted alignment backed by HIPAA Safe Harbor §164.514 privacy compliance.`
  );

  readonly connectedChannels = signal<IImpactPartnerChannel[]>([
    {
      id: 'chan_website_pocketgull_app',
      platform: 'WEBSITE',
      channelName: 'Pocketgull Live Platform (Primary Web Domain)',
      handleOrUrl: 'pocketgull.app',
      followerOrVisitorCount: 0, // Authentic launch state
      isVerified: true,
      status: 'CONNECTED_PRIMARY',
      impactChecklistId: '___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL'
    },
    {
      id: 'chan_youtube_02',
      platform: 'YOUTUBE',
      channelName: 'Pocketgull Clinical Intelligence Channel',
      handleOrUrl: 'https://youtube.com/@pocketgullhealth',
      followerOrVisitorCount: 0, // Authentic launch state
      isVerified: true,
      status: 'CONNECTED',
      impactChecklistId: '___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL'
    },
    {
      id: 'chan_x_03',
      platform: 'X',
      channelName: 'Pocketgull AI Health',
      handleOrUrl: 'https://x.com/pocketgull',
      followerOrVisitorCount: 0, // Authentic launch state
      isVerified: true,
      status: 'CONNECTED',
      impactChecklistId: '___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL'
    }
  ]);

  readonly totalVerifiedChannelsCount = computed(() => 
    this.connectedChannels().filter(c => c.isVerified).length
  );

  addChannel(platform: ImpactChannelPlatform, channelName: string, handleOrUrl: string, count: number): void {
    const newChan: IImpactPartnerChannel = {
      id: `chan_${platform.toLowerCase()}_${Date.now()}`,
      platform,
      channelName,
      handleOrUrl,
      followerOrVisitorCount: count,
      isVerified: true,
      status: 'CONNECTED',
      impactChecklistId: '___9XpvYq1Sf08WbyalSQAkGFPfzljVcYOL'
    };
    this.connectedChannels.update(list => [...list, newChan]);
  }
}
