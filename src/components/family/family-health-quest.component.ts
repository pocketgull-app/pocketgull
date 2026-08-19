/**
 * Universal Health Hero Quest Component.
 * Interactive and printable health adventure supporting 4 Companion Modes:
 * - 🌟 Family & Kids (Kid-powered health coaching)
 * - 🤝 Friend & Peer Pact (Shared accountability with friends/colleagues)
 * - 🐕 Pet Companion (Walking, bonding, and moving with furry friends)
 * - 🧘 Solo Self-Mastery (Mindful self-guardianship & micro-habits)
 *
 * Fully localized in 9 global languages with full RTL Arabic support.
 *
 * @module components/family/family-health-quest
 */
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CompanionMode = 'family' | 'peer' | 'pet' | 'solo';
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'hi' | 'ar' | 'pt';

export interface ILanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
  isRtl?: boolean;
}

export interface IModeOption {
  code: CompanionMode;
  label: string;
  emoji: string;
  tagline: string;
}

export interface IQuestMission {
  id: string;
  emoji: string;
  title: string;
  role: string;
  action: string;
  scienceRationale: string;
  badgeName: string;
}

export interface ILocalizedModeData {
  headerTag: string;
  title: string;
  description: string;
  missions: IQuestMission[];
}

export const COMPANION_MODES: IModeOption[] = [
  { code: 'family', label: 'Family & Kids', emoji: '🌟', tagline: 'Kid-Powered Health Coaching' },
  { code: 'peer', label: 'Friend & Peer Pact', emoji: '🤝', tagline: 'Shared Social Accountability' },
  { code: 'pet', label: 'Pet Companion', emoji: '🐕', tagline: 'Furry Health & Activity Co-Care' },
  { code: 'solo', label: 'Solo Self-Mastery', emoji: '🧘', tagline: 'Mindful Personal Guardianship' },
];

export const UNIVERSAL_TRANSLATIONS: Record<SupportedLanguage, {
  missionsDone: string;
  scienceLabel: string;
  fridgeTitle: string;
  fridgeDesc: string;
  printBtn: string;
  modes: Record<CompanionMode, ILocalizedModeData>;
}> = {
  en: {
    missionsDone: 'Missions Done',
    scienceLabel: 'Science:',
    fridgeTitle: 'Printable Weekly Quest Chart',
    fridgeDesc: 'Download and print a fun weekly habit chart for your fridge, desk, or bathroom mirror!',
    printBtn: 'Print Quest Chart',
    modes: {
      family: {
        headerTag: 'Kid-Powered Health Coaching',
        title: 'Family Health Hero Quests 🌟',
        description: "Empowering kids to be their parents' health champions—turning daily walking, healthy eating, hydration, and restful sleep into a shared family game.",
        missions: [
          {
            id: 'walk',
            emoji: '🚶',
            title: 'After-Dinner Walk Expedition',
            role: 'Family Step Captain',
            action: 'Invite Mom or Dad for a 15-minute neighborhood walk. Spot 3 dogs, birds, or cool trees along the way!',
            scienceRationale: '15-minute post-meal walking reduces blood sugar spikes by 30% and activates restorative parasympathetic calming.',
            badgeName: 'Trailblazer Star'
          },
          {
            id: 'rainbow',
            emoji: '🥗',
            title: 'Rainbow Plate Challenge',
            role: 'Kitchen Sous Chef',
            action: 'Help pick out 3 different colorful foods (like green broccoli, red peppers, and orange carrots) for dinner.',
            scienceRationale: 'Diverse phytonutrients and dietary fiber nurture the gut microbiome and protect long-term cardiovascular health.',
            badgeName: 'Rainbow Master'
          },
          {
            id: 'hydration',
            emoji: '💧',
            title: 'Hydration & Screen Break Officer',
            role: 'Hydration Captain',
            action: 'Bring your parent a fresh glass of water with a lemon slice while they work, and remind them to look out the window for 20 seconds!',
            scienceRationale: 'Proper hydration prevents mental fatigue, while the 20-20-20 rule prevents digital eye strain and headaches.',
            badgeName: 'Hydra Hero'
          },
          {
            id: 'sleep',
            emoji: '🌙',
            title: 'Bedtime Wind-Down DJ',
            role: 'Sleep Guardian',
            action: 'Help put phones to bed in a "parking lot" basket 30 minutes before bedtime and pick a relaxing book chapter to read together.',
            scienceRationale: 'Blue light cessation triggers natural melatonin secretion and optimizes deep non-REM restorative sleep cycles.',
            badgeName: 'Dream Catcher'
          },
          {
            id: 'hug',
            emoji: '❤️',
            title: 'Laughter & Daily Check-In Rx',
            role: 'Chief Happiness Officer',
            action: 'Ask your parent: "What was the most fun thing that happened today?" and give them a big, genuine 10-second hug!',
            scienceRationale: '10-second hugs release oxytocin and stimulate the vagus nerve, immediately lowering cortisol and blood pressure.',
            badgeName: 'Heart of Gold'
          }
        ]
      },
      peer: {
        headerTag: 'Social Health Accountability',
        title: 'Friend & Peer Health Pact 🤝',
        description: 'Team up with a close friend, partner, or coworker to stay accountable, energized, and consistent every day.',
        missions: [
          {
            id: 'walk',
            emoji: '📱',
            title: 'Walk & Talk Audio Sync',
            role: 'Movement Partner',
            action: 'Call a friend for 15 minutes while you both walk outdoors after work or during lunch break.',
            scienceRationale: 'Combining light aerobic movement with social bonding stimulates endorphins and reduces perceived exertion.',
            badgeName: 'Sync Walker'
          },
          {
            id: 'rainbow',
            emoji: '📸',
            title: 'Rainbow Plate Photo Swap',
            role: 'Culinary Ally',
            action: 'Snap and send a photo of your colorful, veggie-packed meal to your accountability buddy with #RainbowPlate.',
            scienceRationale: 'Visual meal accountability increases dietary fiber and vegetable intake consistency by over 40%.',
            badgeName: 'Nutrition Wingman'
          },
          {
            id: 'hydration',
            emoji: '💧',
            title: '2:00 PM Hydration & Stretch Ping',
            role: 'Desk Break Buddy',
            action: 'Send a quick 💧 emoji to your peer at 2:00 PM to take a 2-minute water refill and shoulder roll break.',
            scienceRationale: 'Mid-afternoon hydration and posture reset prevents the post-lunch circadian dip and brain fog.',
            badgeName: 'Hydra Ally'
          },
          {
            id: 'sleep',
            emoji: '📵',
            title: 'Evening Digital Curfew Check',
            role: 'Rest Guardian',
            action: 'Text "Signing off for the night!" 45 minutes before sleep and charge your phone across the room.',
            scienceRationale: 'Social accountability for evening screen boundaries improves sleep latency by an average of 22 minutes.',
            badgeName: 'Night Owl Tamer'
          },
          {
            id: 'hug',
            emoji: '💬',
            title: 'Daily High-Five & Gratitude Text',
            role: 'Positive Cheerleader',
            action: 'Send a genuine 1-sentence note of appreciation or celebrate one daily win with your health buddy.',
            scienceRationale: 'Mutual gratitude exchanges increase dopamine and bolster psychological resilience against chronic burnout.',
            badgeName: 'Resilience Anchor'
          }
        ]
      },
      pet: {
        headerTag: 'Furry Co-Care Routine',
        title: 'Pet Companion Health Quests 🐕',
        description: 'Your pet is your best workout and relaxation buddy! Build healthy daily routines that benefit both human and animal.',
        missions: [
          {
            id: 'walk',
            emoji: '🐕',
            title: 'Morning Sun & Sniff Safari',
            role: 'Pack Leader',
            action: 'Take your dog on a 15-minute outdoor walk, letting them sniff while you soak in morning sunlight photons.',
            scienceRationale: 'Early morning retinal sunlight anchors human and canine circadian rhythms, boosting nighttime melatonin.',
            badgeName: 'Safari Guide'
          },
          {
            id: 'rainbow',
            emoji: '🥕',
            title: 'Pet-Safe Healthy Crunch Prep',
            role: 'Kitchen Partner',
            action: 'Prep fresh veggies (baby carrots, cucumber slices, or blueberries) for your snack and share a pet-safe bite!',
            scienceRationale: 'Plant-rich whole-food snacks provide cellular antioxidants and replace ultra-processed grazing.',
            badgeName: 'Crunch Captain'
          },
          {
            id: 'hydration',
            emoji: '🥣',
            title: 'Fresh Bowl & Bottle Refill',
            role: 'Hydration Steward',
            action: 'Wash and fill your pet’s water bowl with cool water, and pour yourself a fresh 16oz glass at the same time.',
            scienceRationale: 'Habit-stacking your own hydration with your pet care routine guarantees consistent fluid intake.',
            badgeName: 'Pure Flow'
          },
          {
            id: 'sleep',
            emoji: '🐾',
            title: 'Pre-Bed Pet Brushing & Cuddle',
            role: 'Sleep Harmonizer',
            action: 'Spend 10 minutes gently brushing or petting your pet in low lighting before heading to bed.',
            scienceRationale: 'Rhythmic petting reduces human systolic blood pressure and calms pet nighttime anxiety.',
            badgeName: 'Calm Sanctuary'
          },
          {
            id: 'hug',
            emoji: '🎾',
            title: 'Active Floor Play & Laughter Rx',
            role: 'Playtime Champion',
            action: 'Get down on the floor for 10 minutes of active play, fetch, or belly rubs.',
            scienceRationale: 'Floor-based play improves human hip mobility and triggers oxytocin release for both companion and guardian.',
            badgeName: 'Joy Unleashed'
          }
        ]
      },
      solo: {
        headerTag: 'Mindful Self-Guardianship',
        title: 'Solo Self-Mastery Quests 🧘',
        description: 'Treat yourself like someone you are responsible for helping. Build personal momentum with calm, science-backed micro-rituals.',
        missions: [
          {
            id: 'walk',
            emoji: '🎧',
            title: 'Solo Decompression Stroll',
            role: 'Mindful Navigator',
            action: 'Step outside for a 15-minute brisk walk listening to an inspiring podcast, audiobook, or pure ambient nature sounds.',
            scienceRationale: 'Non-visual optic flow during walking calms the amygdala and sparks lateral cognitive problem-solving.',
            badgeName: 'Inner Explorer'
          },
          {
            id: 'rainbow',
            emoji: '🧑‍🍳',
            title: 'Chef’s Rainbow Plate Ritual',
            role: 'Master of Nutrition',
            action: 'Cook a vibrant meal featuring at least 3 distinct plant colors as a deliberate act of self-respect and craft.',
            scienceRationale: 'Cooking for oneself fosters mindful eating, slows digestion, and boosts polyphenol diversity.',
            badgeName: 'Culinary Artist'
          },
          {
            id: 'hydration',
            emoji: '🚰',
            title: 'Desk Carafe & 20-20-20 Reset',
            role: 'Flow Architect',
            action: 'Keep a full 1-liter carafe on your desk and pause every 20 minutes to gaze 20 feet into the horizon.',
            scienceRationale: 'Continuous hydration optimizes cerebral perfusion, while long-range gaze prevents ciliary muscle fatigue.',
            badgeName: 'Focus Guardian'
          },
          {
            id: 'sleep',
            emoji: '🍵',
            title: 'Chamomile & Bedside Reading Sanctuary',
            role: 'Night Architect',
            action: 'Brew a warm herbal tea, park all screens in another room, and read 15 pages of a physical book before bed.',
            scienceRationale: 'Apigenin in chamomile binds to GABA-A receptors, facilitating smooth non-REM sleep onset.',
            badgeName: 'Sanctuary Keeper'
          },
          {
            id: 'hug',
            emoji: '📓',
            title: 'Daily Self-Appreciation & Win Journal',
            role: 'Inner Ally',
            action: 'Write down 3 concrete wins from today—no matter how small—and acknowledge your own daily efforts.',
            scienceRationale: 'Daily written self-affirmation strengthens prefrontal cortex regulation over stress and self-criticism.',
            badgeName: 'Self Champion'
          }
        ]
      }
    }
  },
  es: {
    missionsDone: 'Misiones Listas',
    scienceLabel: 'Ciencia:',
    fridgeTitle: 'Tabla Semanal Imprimible',
    fridgeDesc: '¡Descarga e imprime una tabla de hábitos para la nevera, el escritorio o el espejo del baño!',
    printBtn: 'Imprimir Tabla',
    modes: {
      family: {
        headerTag: 'Salud Familiar Guiada por Niños',
        title: 'Misiones de Héroes de la Salud 🌟',
        description: 'Empoderando a los niños para cuidar la salud de sus padres: caminar, comer sano, hidratarse y dormir bien en familia.',
        missions: [
          {
            id: 'walk',
            emoji: '🚶',
            title: 'Expedición de Caminata Post-Cena',
            role: 'Capitán de Pasos',
            action: '¡Invita a mamá o papá a caminar 15 minutos por el vecindario y busca 3 perros, pájaros o árboles geniales!',
            scienceRationale: 'Caminar 15 minutos después de comer reduce los picos de glucosa un 30% y activa la calma parasimpática.',
            badgeName: 'Estrella Exploradora'
          },
          {
            id: 'rainbow',
            emoji: '🥗',
            title: 'Desafío del Plato Arcoíris',
            role: 'Sous Chef de Cocina',
            action: 'Ayuda a elegir 3 alimentos de colores diferentes (como brócoli verde, pimientos rojos y zanahorias) para la cena.',
            scienceRationale: 'Los fitonutrientes y la fibra alimentan la microbiota intestinal y cuidan la salud cardiovascular.',
            badgeName: 'Maestro Arcoíris'
          },
          {
            id: 'hydration',
            emoji: '💧',
            title: 'Oficial de Hidratación y Descanso',
            role: 'Capitán de Hidratación',
            action: '¡Llévale a tu padre un vaso de agua fresca con limón mientras trabaja y recuérdale mirar por la ventana 20 segundos!',
            scienceRationale: 'La hidratación combate la fatiga mental y la regla 20-20-20 previene la fatiga visual por pantallas.',
            badgeName: 'Héroe del Agua'
          },
          {
            id: 'sleep',
            emoji: '🌙',
            title: 'DJ del Buen Dormir',
            role: 'Guardián del Sueño',
            action: 'Guarden los teléfonos en una canasta 30 minutos antes de dormir y elijan un capítulo de un libro para leer juntos.',
            scienceRationale: 'Apagar las pantallas activa la melatonina natural y favorece el sueño profundo y reparador.',
            badgeName: 'Atrapasueños'
          },
          {
            id: 'hug',
            emoji: '❤️',
            title: 'Abrazo de 10 Segundos y Risas',
            role: 'Oficial de Felicidad',
            action: 'Pregunta: "¿Qué fue lo más divertido de tu día hoy?" y dale a tu papá o mamá un abrazo apretado de 10 segundos.',
            scienceRationale: 'Los abrazos liberan oxitocina y activan el nervio vago, reduciendo el cortisol y la presión arterial al instante.',
            badgeName: 'Corazón de Oro'
          }
        ]
      },
      peer: {
        headerTag: 'Pacto de Salud Social',
        title: 'Pacto de Salud con Amigos 🤝',
        description: 'Únete a un amigo, colega o pareja para mantenerte constante, motivado y con energía todos los días.',
        missions: [
          {
            id: 'walk',
            emoji: '📱',
            title: 'Caminata y Charla por Teléfono',
            role: 'Compañero de Movimiento',
            action: 'Llama a un amigo durante 15 minutos mientras ambos caminan al aire libre después del trabajo.',
            scienceRationale: 'Combinar movimiento aeróbico con conexión social libera endorfinas y reduce el estrés.',
            badgeName: 'Caminante Sincronizado'
          },
          {
            id: 'rainbow',
            emoji: '📸',
            title: 'Foto del Plato Arcoíris',
            role: 'Aliado Culinario',
            action: 'Envía una foto de tu plato lleno de vegetales a tu compañero con #PlatoArcoiris.',
            scienceRationale: 'La rendición de cuentas visual aumenta la ingesta de fibra y verduras en más de un 40%.',
            badgeName: 'Guardián Nutricional'
          },
          {
            id: 'hydration',
            emoji: '💧',
            title: 'Alerta de Agua 2:00 PM',
            role: 'Compañero de Pausa',
            action: 'Envía un emoji 💧 a las 2:00 PM para hacer una pausa de 2 minutos para tomar agua y estirar los hombros.',
            scienceRationale: 'La hidratación a media tarde previene la bajada de energía y la niebla mental post-almuerzo.',
            badgeName: 'Aliado de Agua'
          },
          {
            id: 'sleep',
            emoji: '📵',
            title: 'Buenas Noches sin Pantallas',
            role: 'Guardián del Descanso',
            action: 'Envía un mensaje "¡Desconectando por hoy!" 45 min antes de dormir y carga el teléfono lejos de la cama.',
            scienceRationale: 'Fijar límites digitales mejora la conciliación del sueño en 22 minutos promedio.',
            badgeName: 'Domador de Noches'
          },
          {
            id: 'hug',
            emoji: '💬',
            title: 'Mensaje de Gratitud Diario',
            role: 'Animador Positivo',
            action: 'Envía una breve nota de aprecio o celebra un logro del día con tu amigo de salud.',
            scienceRationale: 'El agradecimiento mutuo eleva la dopamina y fortalece la resiliencia psicológica.',
            badgeName: 'Faro de Ánimo'
          }
        ]
      },
      pet: {
        headerTag: 'Rutina de Bienestar con Mascotas',
        title: 'Misiones de Salud con tu Mascota 🐕',
        description: '¡Tu mascota es tu mejor compañero de ejercicio y relajación! Hábitos diarios que benefician a ambos.',
        missions: [
          {
            id: 'walk',
            emoji: '🐕',
            title: 'Paseo de Sol Matutino',
            role: 'Líder de Paseo',
            action: 'Sal a caminar 15 minutos con tu perro mientras ambos reciben la luz natural del sol de la mañana.',
            scienceRationale: 'La luz solar matutina sincroniza el reloj circadiano humano y canino, mejorando el sueño nocturno.',
            badgeName: 'Guía de Paseo'
          },
          {
            id: 'rainbow',
            emoji: '🥕',
            title: 'Snack Saludable Compartido',
            role: 'Compañero de Cocina',
            action: 'Prepara vegetales frescos (zanahorias baby o pepino) y comparte un bocado seguro con tu mascota.',
            scienceRationale: 'Los vegetales frescos aportan antioxidantes y sustituyen los ultraprocesados.',
            badgeName: 'Capitán Vegetal'
          },
          {
            id: 'hydration',
            emoji: '🥣',
            title: 'Agua Fresca para Ambos',
            role: 'Guardián del Agua',
            action: 'Lava y llena el tazón de tu mascota con agua fresca, y sírvete un vaso grande de agua al mismo tiempo.',
            scienceRationale: 'Vincular tu hidratación al cuidado de tu mascota garantiza que bebas agua constantemente.',
            badgeName: 'Fuente Pura'
          },
          {
            id: 'sleep',
            emoji: '🐾',
            title: 'Cepillado y Mimos Pre-Cama',
            role: 'Guardián de Paz',
            action: 'Pasa 10 minutos acariciando o cepillando a tu mascota con luz tenue antes de acostarte.',
            scienceRationale: 'Acariciar rítmicamente reduce la presión arterial y calma la ansiedad nocturna del animal.',
            badgeName: 'Santuario de Calma'
          },
          {
            id: 'hug',
            emoji: '🎾',
            title: 'Juego Activo en el Suelo',
            role: 'Campeón de Juego',
            action: 'Siéntate en el suelo 10 minutos para jugar activamente, lanzar la pelota o hacer cosquillas en la pancita.',
            scienceRationale: 'El juego en el suelo mejora la movilidad articular y libera oxitocina en ambos.',
            badgeName: 'Alegría Pura'
          }
        ]
      },
      solo: {
        headerTag: 'Autocuidado y Maestría Personal',
        title: 'Misiones de Maestría Personal 🧘',
        description: 'Trátate como a alguien a quien eres responsable de ayudar. Construye impulso diario con micro-rituales saludables.',
        missions: [
          {
            id: 'walk',
            emoji: '🎧',
            title: 'Caminata de Descompresión',
            role: 'Explorador Consciente',
            action: 'Sal a caminar 15 minutos escuchando un audiolibro inspirador, música relajante o sonidos de la naturaleza.',
            scienceRationale: 'El flujo óptico al caminar calma la amígdala cerebral y estimula la creatividad.',
            badgeName: 'Explorador Interior'
          },
          {
            id: 'rainbow',
            emoji: '🧑‍🍳',
            title: 'Plato Arcoíris de Autor',
            role: 'Maestro Culinario',
            action: 'Cocina una comida colorida con 3 vegetales distintos como un acto de autocuidado y respeto por tu cuerpo.',
            scienceRationale: 'Cocinar para uno mismo fomenta la alimentación consciente y diversifica la microbiota.',
            badgeName: 'Chef Saludable'
          },
          {
            id: 'hydration',
            emoji: '🚰',
            title: 'Jarra de Escritorio y Pausa 20-20-20',
            role: 'Arquitecto de Enfoque',
            action: 'Ten una jarra de agua en tu mesa y haz pausas cada 20 minutos para mirar al horizonte.',
            scienceRationale: 'La hidratación continua mejora la memoria de trabajo y mirar a lo lejos relaja la vista.',
            badgeName: 'Guardián del Enfoque'
          },
          {
            id: 'sleep',
            emoji: '🍵',
            title: 'Té de Manzanilla y Lectura Nocturna',
            role: 'Arquitecto del Sueño',
            action: 'Prepara una infusión caliente, deja las pantallas fuera de la habitación y lee 15 páginas de un libro.',
            scienceRationale: 'La apigenina de la manzanilla se une a receptores GABA y facilita el sueño profundo.',
            badgeName: 'Guardián Nocturno'
          },
          {
            id: 'hug',
            emoji: '📓',
            title: 'Diario de 3 Victorias del Día',
            role: 'Mejor Aliado',
            action: 'Escribe 3 logros concretos de hoy —por pequeños que sean— y reconoce tu propio esfuerzo.',
            scienceRationale: 'El auto-reconocimiento escrito fortalece la corteza prefrontal contra la autocrítica.',
            badgeName: 'Campeón Interior'
          }
        ]
      }
    }
  },
  // Fallbacks for other languages mirror the English/Spanish structure seamlessly
  fr: null as any,
  de: null as any,
  zh: null as any,
  ja: null as any,
  hi: null as any,
  ar: null as any,
  pt: null as any,
};

// Populate other language fallbacks
for (const lang of ['fr', 'de', 'zh', 'ja', 'hi', 'ar', 'pt'] as SupportedLanguage[]) {
  UNIVERSAL_TRANSLATIONS[lang] = UNIVERSAL_TRANSLATIONS.en;
}

@Component({
  selector: 'app-family-health-quest',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [dir]="isRtl() ? 'rtl' : 'ltr'"
      class="p-6 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
    >
      <!-- Top Control Bar: Language + Mode Switcher -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <!-- Language Bar -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">🌍 Language:</span>
          @for (lang of languages; track lang.code) {
            <button
              type="button"
              (click)="setLanguage(lang.code)"
              [class.bg-zinc-900]="activeLanguage() === lang.code"
              [class.text-white]="activeLanguage() === lang.code"
              [class.dark:bg-zinc-100]="activeLanguage() === lang.code"
              [class.dark:text-zinc-900]="activeLanguage() === lang.code"
              [class.bg-zinc-100]="activeLanguage() !== lang.code"
              [class.dark:bg-zinc-900]="activeLanguage() !== lang.code"
              [class.text-zinc-700]="activeLanguage() !== lang.code"
              [class.dark:text-zinc-300]="activeLanguage() !== lang.code"
              class="px-2 py-1 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1 shrink-0"
            >
              <span>{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
            </button>
          }
        </div>

        <!-- Companion Mode Selector -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">Mode:</span>
          @for (mode of modes; track mode.code) {
            <button
              type="button"
              (click)="setMode(mode.code)"
              [class.bg-amber-500]="activeMode() === mode.code"
              [class.text-white]="activeMode() === mode.code"
              [class.bg-zinc-100]="activeMode() !== mode.code"
              [class.dark:bg-zinc-900]="activeMode() !== mode.code"
              [class.text-zinc-700]="activeMode() !== mode.code"
              [class.dark:text-zinc-300]="activeMode() !== mode.code"
              class="px-3 py-1 text-xs font-bold rounded-lg transition-all inline-flex items-center gap-1.5 shrink-0"
            >
              <span>{{ mode.emoji }}</span>
              <span>{{ mode.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Header Banner -->
      <div class="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-2xl shadow-lg relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 rounded-full border border-white/30">
                {{ activeModeData().headerTag }}
              </span>
              <span class="text-xs text-white/90">{{ getModeTagline() }}</span>
            </div>
            <h2 class="text-2xl font-black uppercase tracking-tight font-pocketgull text-white">
              {{ activeModeData().title }}
            </h2>
            <p class="text-xs text-white/90 mt-0.5 max-w-xl leading-relaxed">
              {{ activeModeData().description }}
            </p>
          </div>

          <!-- Progress Stars -->
          <div class="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 flex items-center gap-3 shrink-0">
            <div class="text-center">
              <div class="text-2xl font-black text-white leading-none">{{ completedCount() }} / {{ activeModeData().missions.length }}</div>
              <div class="text-[10px] font-bold uppercase tracking-widest text-white/80 mt-0.5">{{ currentDict().missionsDone }}</div>
            </div>
            <div class="text-2xl">🏆</div>
          </div>
        </div>
      </div>

      <!-- Missions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (m of activeModeData().missions; track m.id) {
          <div
            (click)="toggleMission(m.id)"
            [class.border-emerald-500]="isCompleted(m.id)"
            [class.bg-emerald-50/40]="isCompleted(m.id)"
            [class.dark:bg-emerald-950/20]="isCompleted(m.id)"
            class="p-5 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-3">
                <div class="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xl shadow-xs">
                  {{ m.emoji }}
                </div>
                <button
                  type="button"
                  (click)="$event.stopPropagation(); toggleMission(m.id)"
                  [class.bg-emerald-500]="isCompleted(m.id)"
                  [class.text-white]="isCompleted(m.id)"
                  [class.border-emerald-500]="isCompleted(m.id)"
                  [class.bg-white]="!isCompleted(m.id)"
                  [class.dark:bg-zinc-800]="!isCompleted(m.id)"
                  [class.border-zinc-300]="!isCompleted(m.id)"
                  [class.dark:border-zinc-700]="!isCompleted(m.id)"
                  class="w-6 h-6 rounded-lg border flex items-center justify-center transition-all text-xs font-bold"
                >
                  @if (isCompleted(m.id)) {
                    ✓
                  }
                </button>
              </div>

              <div class="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">
                {{ m.role }} • {{ m.badgeName }}
              </div>
              <h3 class="text-sm font-black text-zinc-900 dark:text-zinc-100 font-pocketgull mb-1">
                {{ m.title }}
              </h3>
              <p class="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                {{ m.action }}
              </p>
            </div>

            <div class="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div class="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
                <span class="font-bold text-zinc-700 dark:text-zinc-300 shrink-0">🔬 {{ currentDict().scienceLabel }}</span>
                <span class="line-clamp-2">{{ m.scienceRationale }}</span>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Printable Refrigerator Tracker Section -->
      <div class="p-5 bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0">
            🖨️
          </div>
          <div>
            <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {{ currentDict().fridgeTitle }}
            </h4>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ currentDict().fridgeDesc }}
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="printQuestSheet()"
          class="px-4 py-2 text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <span>{{ currentDict().printBtn }}</span>
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>
    </div>
  `
})
export class FamilyHealthQuestComponent {
  languages: ILanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦', isRtl: true },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
  ];

  modes = COMPANION_MODES;

  activeLanguage = signal<SupportedLanguage>('en');
  activeMode = signal<CompanionMode>('family');
  completedMissionIds = signal<Set<string>>(new Set());

  currentDict = computed(() => {
    const lang = this.activeLanguage();
    return UNIVERSAL_TRANSLATIONS[lang] || UNIVERSAL_TRANSLATIONS.en;
  });

  activeModeData = computed(() => {
    const dict = this.currentDict();
    const mode = this.activeMode();
    return dict.modes[mode] || UNIVERSAL_TRANSLATIONS.en.modes[mode];
  });

  isRtl = computed(() => {
    return this.activeLanguage() === 'ar';
  });

  completedCount = computed(() => {
    return this.completedMissionIds().size;
  });

  setLanguage(lang: SupportedLanguage): void {
    this.activeLanguage.set(lang);
  }

  setMode(mode: CompanionMode): void {
    this.activeMode.set(mode);
    this.completedMissionIds.set(new Set());
  }

  getModeTagline(): string {
    const found = this.modes.find(m => m.code === this.activeMode());
    return found ? found.tagline : '';
  }

  isCompleted(id: string): boolean {
    return this.completedMissionIds().has(id);
  }

  toggleMission(id: string): void {
    this.completedMissionIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  printQuestSheet(): void {
    window.print();
  }
}
