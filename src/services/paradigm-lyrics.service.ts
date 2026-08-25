import { Injectable, signal } from '@angular/core';

export interface IParadigmLyric {
  id: string;
  paradigm: 'western' | 'eastern' | 'ayurvedic' | 'longevity';
  quote: string;
  source: string;
  context: string;
  clinicalImpact: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParadigmLyricsService {
  readonly lyrics = signal<IParadigmLyric[]>([
    {
      id: 'lyric-w1',
      paradigm: 'western',
      quote: 'Look up at the stars and not down at your feet. Try to make sense of what you see.',
      source: 'Stephen Hawking / Coldplay (A Head Full of Dreams)',
      context: 'Neuroplasticity & Hope Alignment',
      clinicalImpact: 'Fosters cognitive restructuring, shifts attention away from somatic anxiety, and activates prefrontal executive optimism.',
      color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
    },
    {
      id: 'lyric-w2',
      paradigm: 'western',
      quote: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
      source: 'Aristotle / Will Durant (Habit Architecture)',
      context: 'Behavioral Micro-Habit Adherence',
      clinicalImpact: 'Reinforces daily consistency in 6.0 bpm vagal resonant breathing, glucose monitoring, and sleep architecture hygiene.',
      color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'lyric-e1',
      paradigm: 'eastern',
      quote: 'Be like water making its way through cracks. Do not be assertive, but adjust to the object, and you shall find a way around or through it.',
      source: 'Lao Tzu (Dao De Jing) / Bruce Lee',
      context: 'Dispersing Liver Qi Stagnation',
      clinicalImpact: 'Encourages fluid adaptation to life stress, smoothing Liver Qi flow and reducing sympathetic muscle tension.',
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'lyric-e2',
      paradigm: 'eastern',
      quote: 'Let it be, let it be... there will be an answer, let it be.',
      source: 'The Beatles (Calming Shen & Emotional Surrender)',
      context: 'Zang-Fu Shen Tranquilization',
      clinicalImpact: 'Promotes parasympathetic vagal tone, calms an agitated Shen (mind), and facilitates restorative sleep.',
      color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30'
    },
    {
      id: 'lyric-a1',
      paradigm: 'ayurvedic',
      quote: 'Here comes the sun, and I say, it\'s all right.',
      source: 'George Harrison / The Beatles (Circadian Agni Awakening)',
      context: 'Kindling Agni & Solar Rhythms',
      clinicalImpact: 'Aligns morning circadian cortisol rise with 15-min outdoor sunlight exposure to reset melatonin & digestion.',
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
    },
    {
      id: 'lyric-a2',
      paradigm: 'ayurvedic',
      quote: 'When diet is correct, medicine is of no need. When diet is wrong, medicine is of no use.',
      source: 'Ayurvedic Proverb (Ahara Food Medicine)',
      context: 'Ayurvedic Nutritional Wisdom',
      clinicalImpact: 'Empowers patient ownership over warm, freshly prepared doshic foods to clear Ama (toxins) and ignite metabolic fire.',
      color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30'
    },
    {
      id: 'lyric-l1',
      paradigm: 'longevity',
      quote: 'Your genes are not your destiny. They are the blueprint; your daily choices write the living story.',
      source: 'Dr. Elizabeth Blackburn (Nobel Laureate, Telomere Discovery)',
      context: 'Epigenetic Telomere Preservation',
      clinicalImpact: 'Demonstrates that lifestyle, sleep, and vagal tone directly extend telomere length and projected QALY healthspan.',
      color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30'
    }
  ]);

  getLyricsForParadigm(paradigm: 'western' | 'eastern' | 'ayurvedic' | 'longevity' | string): IParadigmLyric[] {
    const p = (paradigm || 'western').toLowerCase();
    if (p.includes('eastern')) return this.lyrics().filter(l => l.paradigm === 'eastern');
    if (p.includes('ayurved')) return this.lyrics().filter(l => l.paradigm === 'ayurvedic');
    if (p.includes('longevity')) return this.lyrics().filter(l => l.paradigm === 'longevity');
    return this.lyrics().filter(l => l.paradigm === 'western');
  }
}
