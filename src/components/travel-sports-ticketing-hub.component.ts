import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelSportsTicketingService } from '../services/travel-sports-ticketing.service';

@Component({
  selector: 'app-travel-sports-ticketing-hub',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-4xl mx-auto p-6 bg-zinc-950 text-gray-100 rounded-3xl border border-sky-500/30 shadow-2xl space-y-6">
      <!-- Header Banner -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-sky-950/80 via-zinc-900 to-emerald-950/80 border border-sky-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🛫</span>
          <div>
            <h2 class="text-xl font-bold text-gray-100">Fly-Well & Arena Bio-Pass Ticketing Engine</h2>
            <p class="text-xs text-gray-400 mt-1">
              Circadian-calibrated flight booking & fast-track sports stadium ticket passes with built-in affiliate revenue generation.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 border border-emerald-500/30">
          <div class="text-right">
            <div class="text-[10px] uppercase font-bold text-emerald-400">Affiliate Revenue Logged</div>
            <div class="text-base font-extrabold text-white font-mono">\${{ ticketingService.totalAffiliateRevenueGeneratedUsd() }}</div>
          </div>
          <span class="text-xl">🎟️</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ══ Airline Tickets Section ═══════════════════════════════════════ -->
        <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">✈️</span>
              <h3 class="text-sm font-bold text-gray-200">Circadian Fly-Well Airline Tickets</h3>
            </div>
            <span class="text-xs font-mono text-sky-400">3% - 5% Revenue Share</span>
          </div>

          <div class="space-y-3">
            @for (flt of ticketingService.featuredFlightOffers(); track flt.offerId) {
              <div class="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/60 flex flex-col justify-between gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-sky-300">{{ flt.airlineName }}</span>
                  <span class="text-xs font-mono font-bold text-emerald-400">\${{ flt.ticketPriceUsd }}</span>
                </div>
                <div class="text-xs font-mono text-gray-300">
                  {{ flt.originIata }} ➔ {{ flt.destinationIata }} &bull; Departs {{ flt.departureTime }}
                </div>
                <div class="flex items-center justify-between pt-1">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {{ flt.circadianRating }}
                  </span>
                  <button 
                    (click)="ticketingService.bookFlightTicket(flt.offerId)"
                    class="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                  >
                    Book Flight 🎫
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- ══ Sports & Arena Tickets Section ════════════════════════════════ -->
        <div class="p-5 bg-zinc-900/70 rounded-2xl border border-zinc-800 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🏟️</span>
              <h3 class="text-sm font-bold text-gray-200">Arena Bio-Pass Sports Tickets</h3>
            </div>
            <span class="text-xs font-mono text-emerald-400">4% - 7% Revenue Share</span>
          </div>

          <div class="space-y-3">
            @for (evt of ticketingService.featuredSportsOffers(); track evt.eventId) {
              <div class="p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/60 flex flex-col justify-between gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-emerald-300">{{ evt.homeTeam }} vs {{ evt.awayTeam }}</span>
                  <span class="text-xs font-mono font-bold text-emerald-400">\${{ evt.ticketPriceUsd }}</span>
                </div>
                <div class="text-xs text-gray-300 font-mono">
                  {{ evt.venueName }} &bull; {{ evt.eventDate }}
                </div>
                <div class="flex items-center justify-between pt-1">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Fast-Track Bio-Pass Gate
                  </span>
                  <button 
                    (click)="ticketingService.bookSportsTicket(evt.eventId)"
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                  >
                    Book Match 🏈
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class TravelSportsTicketingHubComponent {
  readonly ticketingService = inject(TravelSportsTicketingService);
}
