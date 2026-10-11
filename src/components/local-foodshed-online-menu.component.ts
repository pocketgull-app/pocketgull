import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalFoodshedOnlineMenuService, IShelfItem, IFarmToTableCsa, IOnlineGroceryBasket, IRestaurantPreparedDish, IAncestralParadigmRecipe, NutrigenomicLigandType } from '../services/local-foodshed-online-menu.service';
import { PatientStateService } from '../services/patient-state.service';

@Component({
  selector: 'app-local-foodshed-online-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-3xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl p-6 sm:p-8 space-y-6 font-sans relative overflow-hidden">
      
      <!-- Ambient Bioactive Background Aura -->
      <div class="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      <!-- Header & Clinical Foodshed Navigator Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 relative z-10">
        <div>
          <div class="flex items-center gap-2.5 mb-2 flex-wrap">
            <span class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse"></span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10.5px] font-bold uppercase tracking-wider">
              Local Foodshed &amp; Multi-Paradigm Resilience
            </span>
            <span class="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px]">
              Weathering the Storm
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">
            Local Shelves, Farm-to-Table, Online Delivery &amp; Ancestral Kitchens
          </h2>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Empowers patients and family kitchens to navigate inflation, stockouts, and ultra-processed food environments through regional shelves, seasonal CSAs, 1-click delivery baskets, restaurant auditors, and time-tested ancestral paradigms (TCM, Ayurveda, Indigenous, Hippocratic).
          </p>
        </div>

        <!-- Active 3D Telemetry Spotlight Badge -->
        <div class="bg-zinc-900/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1.5 shrink-0 text-right min-w-[220px]">
          <div class="flex items-center justify-end gap-1.5 text-xs font-mono font-bold text-emerald-300">
            <span>🧬</span>
            <span>3D Model Synced</span>
          </div>
          <div class="text-[11px] font-mono text-zinc-300">
            Ligand: <strong class="text-emerald-400 uppercase">{{ activeLigand() }}</strong>
          </div>
          <div class="text-[10px] font-mono text-zinc-400">
            View Mode: <span class="text-amber-300 font-semibold">{{ activeAnatomyMode() }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (5 Clinical Pillars) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800/60 no-scrollbar font-mono text-xs">
        <button (click)="service.activeViewTab.set('shelves')"
                [class.bg-emerald-600]="service.activeViewTab() === 'shelves'"
                [class.text-white]="service.activeViewTab() === 'shelves'"
                [class.border-emerald-500]="service.activeViewTab() === 'shelves'"
                [class.bg-zinc-900]="service.activeViewTab() !== 'shelves'"
                [class.text-zinc-400]="service.activeViewTab() !== 'shelves'"
                [class.border-zinc-800]="service.activeViewTab() !== 'shelves'"
                class="px-4 py-2.5 rounded-xl border font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px] hover:border-emerald-500/50">
          <span>🛒</span>
          <span>1. Local Shelves</span>
        </button>

        <button (click)="service.activeViewTab.set('farm_csa')"
                [class.bg-emerald-600]="service.activeViewTab() === 'farm_csa'"
                [class.text-white]="service.activeViewTab() === 'farm_csa'"
                [class.border-emerald-500]="service.activeViewTab() === 'farm_csa'"
                [class.bg-zinc-900]="service.activeViewTab() !== 'farm_csa'"
                [class.text-zinc-400]="service.activeViewTab() !== 'farm_csa'"
                [class.border-zinc-800]="service.activeViewTab() !== 'farm_csa'"
                class="px-4 py-2.5 rounded-xl border font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px] hover:border-emerald-500/50">
          <span>🌱</span>
          <span>2. Farm-to-Table &amp; CSAs</span>
        </button>

        <button (click)="service.activeViewTab.set('online_delivery')"
                [class.bg-emerald-600]="service.activeViewTab() === 'online_delivery'"
                [class.text-white]="service.activeViewTab() === 'online_delivery'"
                [class.border-emerald-500]="service.activeViewTab() === 'online_delivery'"
                [class.bg-zinc-900]="service.activeViewTab() !== 'online_delivery'"
                [class.text-zinc-400]="service.activeViewTab() !== 'online_delivery'"
                [class.border-zinc-800]="service.activeViewTab() !== 'online_delivery'"
                class="px-4 py-2.5 rounded-xl border font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px] hover:border-emerald-500/50">
          <span>📦</span>
          <span>3. 1-Click Online Delivery</span>
        </button>

        <button (click)="service.activeViewTab.set('restaurant_auditor')"
                [class.bg-emerald-600]="service.activeViewTab() === 'restaurant_auditor'"
                [class.text-white]="service.activeViewTab() === 'restaurant_auditor'"
                [class.border-emerald-500]="service.activeViewTab() === 'restaurant_auditor'"
                [class.bg-zinc-900]="service.activeViewTab() !== 'restaurant_auditor'"
                [class.text-zinc-400]="service.activeViewTab() !== 'restaurant_auditor'"
                [class.border-zinc-800]="service.activeViewTab() !== 'restaurant_auditor'"
                class="px-4 py-2.5 rounded-xl border font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px] hover:border-emerald-500/50">
          <span>🍲</span>
          <span>4. Restaurant Menu Auditor</span>
        </button>

        <button (click)="service.activeViewTab.set('ancestral_kitchen')"
                [class.bg-amber-600]="service.activeViewTab() === 'ancestral_kitchen'"
                [class.text-white]="service.activeViewTab() === 'ancestral_kitchen'"
                [class.border-amber-500]="service.activeViewTab() === 'ancestral_kitchen'"
                [class.bg-zinc-900]="service.activeViewTab() !== 'ancestral_kitchen'"
                [class.text-zinc-400]="service.activeViewTab() !== 'ancestral_kitchen'"
                [class.border-zinc-800]="service.activeViewTab() !== 'ancestral_kitchen'"
                class="px-4 py-2.5 rounded-xl border font-bold uppercase transition flex items-center gap-2 cursor-pointer shrink-0 min-h-[44px] hover:border-amber-500/50">
          <span>🏺</span>
          <span>5. Ancestral Multi-Paradigm</span>
        </button>
      </div>

      <!-- TAB 1: LOCAL SHELVES (Supermarkets & Cultural Grocers) -->
      @if (service.activeViewTab() === 'shelves') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <!-- Store Selector -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase text-zinc-400">Filter By Retailer:</span>
              <select (change)="onStoreChange($event)" [value]="service.selectedStoreFilter()"
                      class="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none cursor-pointer">
                <option value="ALL">All Local Stores</option>
                <option value="Trader Joe’s">Trader Joe’s</option>
                <option value="Aldi">Aldi (Frugal Core)</option>
                <option value="H-Mart (Asian)">H-Mart (East Asian Functional Produce)</option>
                <option value="Patel Brothers (South Asian)">Patel Brothers (South Asian Whole Pulses &amp; Spices)</option>
                <option value="Kroger / Fred Meyer">Kroger / Fred Meyer</option>
                <option value="Safeway">Safeway</option>
                <option value="Local Co-op">Local Community Food Co-op</option>
              </select>
            </div>
            <span class="text-xs font-mono text-zinc-500">
              Showing {{ service.filteredShelfItems().length }} shelf staples
            </span>
          </div>

          <!-- Shelf Items Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (item of service.filteredShelfItems(); track item.id) {
              <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                        {{ item.storeChain }} • {{ item.department }}
                      </span>
                      <h4 class="text-base font-bold text-white mt-0.5">{{ item.name }}</h4>
                    </div>
                    <div class="text-right">
                      <span class="text-sm font-mono font-bold text-emerald-400">\${{ item.costPerServing.toFixed(2) }}</span>
                      <span class="block text-[9.5px] font-mono text-zinc-500">/ serving</span>
                    </div>
                  </div>

                  <div class="text-[11px] font-mono text-amber-300/90 mb-2 flex items-center gap-1.5">
                    <span>📍</span> <span>{{ item.aisleHint }}</span>
                  </div>

                  <p class="text-xs text-zinc-300 leading-relaxed mb-3">
                    {{ item.clinicalMechanism }}
                  </p>

                  <div class="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 mb-3">
                    <span class="font-bold text-amber-400 block mb-0.5">💡 Frugal Shelf Strategy:</span>
                    <span>{{ item.frugalTip }}</span>
                  </div>
                </div>

                <div class="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    @if (item.snapWicEligible) {
                      <span class="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-[9px] font-mono font-bold uppercase">
                        SNAP/WIC ✔
                      </span>
                    }
                    <span class="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9.5px] font-mono">
                      Target: {{ item.primaryOrganTarget }}
                    </span>
                  </div>

                  <button (click)="service.simulateIn3dAnatomy(item.nutrigenomicLigand, item.primaryOrganTarget)"
                          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95">
                    <span>🧬</span>
                    <span>Simulate in 3D</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: FARM-TO-TABLE & CSAS (Seasonal Harvest & Living Soil) -->
      @if (service.activeViewTab() === 'farm_csa') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <!-- Season Selector -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1 font-mono text-xs">
              <span class="px-2 text-zinc-400 uppercase text-[10px] font-bold">Seasonal Window:</span>
              @for (s of ['Spring', 'Summer', 'Autumn', 'Winter']; track s) {
                <button (click)="service.selectedSeasonFilter.set($any(s))"
                        [class.bg-emerald-600]="service.selectedSeasonFilter() === s"
                        [class.text-white]="service.selectedSeasonFilter() === s"
                        [class.text-zinc-400]="service.selectedSeasonFilter() !== s"
                        class="px-3 py-1 rounded-lg font-bold transition cursor-pointer">
                  {{ s }}
                </button>
              }
            </div>
            <span class="text-xs font-mono text-zinc-400">
              Regenerative Soil = Enhanced Polyphenol Density
            </span>
          </div>

          <!-- CSA Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (csa of service.filteredFarmCsa(); track csa.id) {
              <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                        {{ csa.region }}
                      </span>
                      <h4 class="text-base font-bold text-white mt-0.5">{{ csa.farmName }}</h4>
                    </div>
                    <div class="text-right">
                      <span class="text-sm font-mono font-bold text-emerald-400">\${{ csa.csaShareCostPerWeek.toFixed(2) }}</span>
                      <span class="block text-[9.5px] font-mono text-zinc-500">/ week share</span>
                    </div>
                  </div>

                  <!-- Regenerative Soil Polyphenol Multiplier Banner -->
                  <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 text-[11px] font-mono text-emerald-300 flex items-center justify-between mb-3">
                    <span class="flex items-center gap-1.5">
                      <span>🌱</span>
                      <span>Living Mycorrhizal Soil Density:</span>
                    </span>
                    <strong class="text-emerald-400 text-xs">+{{ csa.regenerativeSoilPolyphenolBoostPct }}% Polyphenols</strong>
                  </div>

                  <p class="text-xs text-zinc-300 leading-relaxed mb-3">
                    {{ csa.clinicalBenefit }}
                  </p>

                  <div class="space-y-1 mb-3">
                    <span class="text-[10px] font-mono uppercase text-zinc-400 font-bold">Signature Harvest Crops:</span>
                    <div class="flex flex-wrap gap-1.5">
                      @for (crop of csa.signatureCrops; track crop) {
                        <span class="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10.5px] font-mono text-zinc-300">
                          🥬 {{ crop }}
                        </span>
                      }
                    </div>
                  </div>

                  <div class="text-[11px] font-mono text-zinc-400">
                    🚚 Pickup/Delivery: {{ csa.pickupDeliveryOptions }}
                  </div>
                </div>

                <div class="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <div>
                    @if (csa.snapDoubleUpAccepted) {
                      <span class="px-2.5 py-1 rounded bg-teal-950 border border-teal-700/60 text-teal-300 text-[9.5px] font-mono font-bold uppercase">
                        Double Up Food Bucks (2x Value)
                      </span>
                    }
                  </div>

                  <button (click)="service.simulateIn3dAnatomy(csa.nutrigenomicLigand, 'Liver')"
                          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95">
                    <span>🧬</span>
                    <span>Simulate in 3D</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 3: 1-CLICK ONLINE DELIVERY (Walmart, Instacart, Amazon Fresh) -->
      @if (service.activeViewTab() === 'online_delivery') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <div class="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span>🛡️</span>
                <span>HIPAA Safe Harbor &amp; Produce Rx ($40–$80/mo) Subsidized Grocery Baskets</span>
              </h4>
              <p class="text-xs text-zinc-400 mt-1">
                Zero patient health information is transmitted in egress links. All manifests map to standard grocery items with Produce Rx voucher discounts applied.
              </p>
            </div>
            <div class="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shrink-0">
              Produce Rx Eligible: Up to -$80/mo
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            @for (basket of service.onlineBaskets; track basket.id) {
              <div class="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold uppercase">
                      {{ basket.retailer }}
                    </span>
                    <span class="text-xs font-mono font-bold text-emerald-400">
                      \${{ basket.estimatedSubtotalUsd.toFixed(2) }}
                    </span>
                  </div>

                  <h4 class="text-base font-bold text-white mb-1">{{ basket.title }}</h4>
                  <p class="text-xs text-emerald-400/90 font-mono mb-3">{{ basket.clinicalTheme }}</p>
                  <p class="text-xs text-zinc-300 leading-relaxed mb-4">{{ basket.description }}</p>

                  <!-- Item Checklist -->
                  <div class="space-y-2 mb-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono">
                    <span class="text-[10px] uppercase text-zinc-400 font-bold block mb-1">Basket Manifest:</span>
                    @for (item of basket.items; track item.name) {
                      <div class="flex items-center justify-between gap-2 text-zinc-300 text-[11px]">
                        <span class="truncate">✔ {{ item.name }} ({{ item.quantity }})</span>
                        <span class="text-zinc-500 shrink-0">\${{ item.approxPriceUsd.toFixed(2) }}</span>
                      </div>
                    }
                  </div>

                  <!-- Out of pocket pricing calculation -->
                  <div class="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] font-mono space-y-1">
                    <div class="flex justify-between text-zinc-400">
                      <span>Retail Subtotal:</span>
                      <span>\${{ basket.estimatedSubtotalUsd.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-emerald-400 font-bold">
                      <span>Produce Rx Voucher:</span>
                      <span>-\${{ basket.produceRxVoucherEligibleUsd.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-zinc-100 font-bold border-t border-zinc-800 pt-1">
                      <span>Estimated Out-of-Pocket:</span>
                      <span class="text-amber-400">\${{ (basket.estimatedSubtotalUsd - basket.produceRxVoucherEligibleUsd).toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <div class="pt-4 border-t border-zinc-800 space-y-2">
                  <a [href]="basket.sanitizedOrderQueryUrl" target="_blank" rel="noopener noreferrer"
                     class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold text-center block transition shadow-md active:scale-95">
                    🛒 Order on {{ basket.retailer }}
                  </a>
                  <button (click)="service.simulateIn3dAnatomy(basket.nutrigenomicLigand, 'Brain')"
                          class="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>🧬</span>
                    <span>Simulate in 3D Anatomy</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 4: RESTAURANT & PREPARED MENU AUDITOR (DoorDash/UberEats/Dining Out) -->
      @if (service.activeViewTab() === 'restaurant_auditor') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <!-- Cuisine Filter -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase text-zinc-400">Filter By Cuisine:</span>
              <select (change)="onCuisineChange($event)" [value]="service.selectedCuisineFilter()"
                      class="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none cursor-pointer">
                <option value="ALL">All Cuisines</option>
                <option value="Fast-Casual Bowl">Fast-Casual Grain/Salad Bowls (Sweetgreen/CAVA)</option>
                <option value="Mediterranean">Mediterranean / Greek Grills</option>
                <option value="Thai & Vietnamese">Thai &amp; Vietnamese Pho/Curry</option>
                <option value="Japanese & Sushi">Japanese &amp; Sushi</option>
                <option value="Classic American Diner">Classic American Diners</option>
              </select>
            </div>
            <span class="text-xs font-mono text-amber-400">
              ⚡ Bergman Minimal Model Glycemic Simulation
            </span>
          </div>

          <!-- Restaurant Dishes Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (dish of service.filteredRestaurantDishes(); track dish.id) {
              <div class="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 transition flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                        {{ dish.cuisineCategory }} • {{ dish.restaurantOrSource }}
                      </span>
                      <h4 class="text-base font-bold text-white mt-0.5">{{ dish.dishName }}</h4>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                            [class.bg-emerald-950]="dish.estimatedGlycemicLoad === 'Low'"
                            [class.text-emerald-400]="dish.estimatedGlycemicLoad === 'Low'"
                            [class.border-emerald-700]="dish.estimatedGlycemicLoad === 'Low'"
                            [class.bg-amber-950]="dish.estimatedGlycemicLoad === 'Moderate'"
                            [class.text-amber-400]="dish.estimatedGlycemicLoad === 'Moderate'"
                            [class.border-amber-700]="dish.estimatedGlycemicLoad === 'Moderate'">
                        GL: {{ dish.estimatedGlycemicLoad }}
                      </span>
                    </div>
                  </div>

                  <!-- Postprandial Glucose Surge & Seed Oil Alert Row -->
                  <div class="grid grid-cols-2 gap-2 my-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs">
                    <div>
                      <span class="block text-[9px] uppercase text-zinc-500 font-bold">Predicted 2h Glucose Spike:</span>
                      <span class="text-sm font-bold text-emerald-400">+\{{ dish.predictedGlucoseSpikeMgDl }} mg/dL</span>
                    </div>
                    <div>
                      <span class="block text-[9px] uppercase text-zinc-500 font-bold">Seed Oil Risk:</span>
                      <span class="text-[11px] font-bold"
                            [class.text-emerald-400]="dish.seedOilRisk.startsWith('Zero')"
                            [class.text-amber-400]="dish.seedOilRisk.startsWith('Moderate')"
                            [class.text-rose-400]="dish.seedOilRisk.startsWith('High')">
                        {{ dish.seedOilRisk }}
                      </span>
                    </div>
                  </div>

                  <p class="text-xs text-zinc-300 leading-relaxed mb-3">
                    {{ dish.biophysicalMechanism }}
                  </p>

                  <!-- Clinical Modification Script (What to tell waiter/delivery app) -->
                  <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] font-mono text-amber-200/90 mb-3 space-y-1">
                    <span class="font-bold text-amber-300 block flex items-center gap-1.5">
                      <span>🗣️</span> Script to Request / Delivery App Note:
                    </span>
                    <span class="italic block">{{ dish.clinicalModificationScript }}</span>
                  </div>
                </div>

                <div class="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <span class="text-[10px] font-mono text-zinc-500">
                    Target Organ: <strong class="text-zinc-300">{{ dish.primaryOrganTarget }}</strong>
                  </span>

                  <button (click)="service.simulateIn3dAnatomy(dish.nutrigenomicLigand, dish.primaryOrganTarget)"
                          class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95">
                    <span>🧬</span>
                    <span>Simulate in 3D</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 5: ANCESTRAL MULTI-PARADIGM KITCHEN (TCM, Ayurveda, Indigenous, Hippocratic, Cucina Povera) -->
      @if (service.activeViewTab() === 'ancestral_kitchen') {
        <div class="space-y-5 animate-in fade-in duration-200">
          <!-- Paradigm Filter -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold uppercase text-zinc-400">Filter Paradigm:</span>
              <select (change)="onParadigmChange($event)" [value]="service.selectedParadigmFilter()"
                      class="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none cursor-pointer">
                <option value="ALL">All Ancestral Paradigms</option>
                <option value="TCM (食疗)">TCM Food Energetics (食疗 - Shí Liáo)</option>
                <option value="Ayurveda (Āhāra)">Ayurveda (Āhāra &amp; Agni / Kitchari)</option>
                <option value="Indigenous / Three Sisters">Indigenous Agriculture (The Three Sisters)</option>
                <option value="Unani-Tibb & Hippocratic">Unani-Tibb &amp; Hippocratic (Oxymels &amp; Physis)</option>
                <option value="Cucina Povera & Blue Zones">Cucina Povera &amp; Blue Zones (Ribollita &amp; Longevity)</option>
              </select>
            </div>
            <span class="text-xs font-mono text-amber-400">
              Preserving Heirloom Knowledge Across Generations
            </span>
          </div>

          <!-- Ancestral Recipes Grid -->
          <div class="space-y-6">
            @for (recipe of service.filteredAncestralRecipes(); track recipe.id) {
              <div class="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 transition space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800 pb-4">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10.5px] font-bold uppercase">
                        {{ recipe.paradigm }}
                      </span>
                      <span class="text-xs font-mono text-zinc-500">Origin: {{ recipe.culturalHeritage }}</span>
                    </div>
                    <h3 class="text-lg font-bold text-white">{{ recipe.title }}</h3>
                    <p class="text-xs text-amber-300/80 font-mono mt-0.5">{{ recipe.subtitle }}</p>
                  </div>

                  <button (click)="service.simulateIn3dAnatomy(recipe.nutrigenomicLigand, recipe.primaryOrganTarget)"
                          class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95 shrink-0">
                    <span>🧬</span>
                    <span>Simulate in 3D Anatomy</span>
                  </button>
                </div>

                <!-- How it Weathers the Storm Callout -->
                <div class="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs font-mono text-amber-200">
                  <span class="font-bold text-amber-300 block mb-1">⛈️ How This Heils &amp; Weathers Economic / Supply Chain Storms:</span>
                  <p class="leading-relaxed text-zinc-300">{{ recipe.stormResilienceMechanism }}</p>
                </div>

                <!-- Thermal Quality & Bioactives -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span class="text-zinc-500 font-bold uppercase text-[9.5px] block mb-1">Thermal Quality / Dosha:</span>
                    <span class="text-emerald-400 font-bold">{{ recipe.thermalQualityOrDosha }}</span>
                  </div>
                  <div class="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span class="text-zinc-500 font-bold uppercase text-[9.5px] block mb-1">Key Phytonutrients:</span>
                    <span class="text-zinc-200">{{ recipe.activePhytonutrients.join(', ') }}</span>
                  </div>
                </div>

                <!-- Pantry Pillars & Instructions -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                  <div class="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                    <span class="text-[10px] uppercase text-zinc-400 font-bold block">Pantry Resilience Pillars:</span>
                    <ul class="space-y-1 text-zinc-300 text-[11px]">
                      @for (p of recipe.pantryResiliencePillars; track p) {
                        <li class="flex items-start gap-1.5">
                          <span class="text-amber-400">✔</span>
                          <span>{{ p }}</span>
                        </li>
                      }
                    </ul>
                  </div>

                  <div class="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                    <span class="text-[10px] uppercase text-zinc-400 font-bold block">Culinary Preparation Guide:</span>
                    <p class="text-zinc-300 text-[11px] leading-relaxed">{{ recipe.culinaryInstructions }}</p>
                  </div>
                </div>

                <!-- Clinical Biophysics Summary -->
                <div class="pt-2 text-xs font-sans text-zinc-400 flex items-center justify-between">
                  <span>Biophysics: <strong class="text-zinc-200">{{ recipe.clinicalBiophysics }}</strong></span>
                  <span class="font-mono text-[10px] text-zinc-500 shrink-0">Primary Organ: {{ recipe.primaryOrganTarget }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class LocalFoodshedOnlineMenuComponent {
  readonly service = inject(LocalFoodshedOnlineMenuService);
  private readonly patientState = inject(PatientStateService);

  readonly activeLigand = computed(() => {
    return typeof this.patientState?.selectedNutrigenomicLigand === 'function'
      ? this.patientState.selectedNutrigenomicLigand()
      : 'all';
  });
  readonly activeAnatomyMode = computed(() => {
    return typeof this.patientState?.anatomyViewMode === 'function'
      ? this.patientState.anatomyViewMode()
      : 'skin';
  });

  onStoreChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.service.selectedStoreFilter.set(val);
  }

  onCuisineChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.service.selectedCuisineFilter.set(val);
  }

  onParadigmChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.service.selectedParadigmFilter.set(val);
  }
}
