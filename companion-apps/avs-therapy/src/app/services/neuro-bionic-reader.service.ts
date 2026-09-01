import { Injectable, signal, computed, inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IRSVPToken {
  raw: string;
  prefix: string;       // Bionic bolded letters before the ORP
  orpChar: string;      // The exact Optimal Recognition Point character (central foveal anchor)
  suffix: string;       // The remaining letters of the word
  hasCommaOrPause: boolean;
  hasSentenceEnd: boolean;
  hasParagraphBreak: boolean;
  wordIndex: number;
}

export interface IGutenbergBook {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  coverEmoji: string;
  wordCount: number;
  text: string;
}

export type ReaderAvsMode = 'gamma40' | 'beta18' | 'smr14' | 'theta5' | 'silent';

@Injectable({
  providedIn: 'root'
})
export class NeuroBionicReaderService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Speed & Playback State
  readonly wpm = signal<number>(450);
  readonly isPlaying = signal<boolean>(false);
  readonly currentWordIndex = signal<number>(0);
  readonly avsMode = signal<ReaderAvsMode>('gamma40');
  readonly isVoiceTtsEnabled = signal<boolean>(false);
  readonly isBionicBoldEnabled = signal<boolean>(true);

  // Active Reading Material
  readonly selectedBookId = signal<string>('frankenstein');
  readonly customText = signal<string>('');

  // Audio Entrainment Context
  private audioCtx: AudioContext | null = null;
  private timerId: any = null;

  // Curated Project Gutenberg Library
  readonly books: IGutenbergBook[] = [
    {
      id: 'frankenstein',
      title: 'Frankenstein; or, The Modern Prometheus',
      author: 'Mary Wollstonecraft Shelley',
      year: 1818,
      genre: 'Gothic Sci-Fi & Neuro-Bioethics',
      coverEmoji: '⚡',
      wordCount: 850,
      text: `You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday, and my first task is to assure my dear sister of my welfare and increasing confidence in the success of my undertaking.

I am already far north of London, and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves and fills me with delight. Do you understand this feeling? This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes. Inspirited by this wind of promise, my daydreams become more fervent and vivid. I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight.

There, Margaret, the sun is for ever visible, its broad disk just skirting the horizon and diffusing a perpetual splendour. There—for with your leave, my sister, I will put some trust in preceding navigators—there snow and frost are banished; and, sailing over a calm sea, we may be wafted to a land surpassing in wonders and in beauty every region hitherto discovered on the habitable globe. Its productions and features may be without example, as the phenomena of the heavenly bodies undoubtedly are in those undiscovered solitudes.

What may not be expected in a country of eternal light? I may there discover the wondrous power which attracts the needle and may regulate a thousand celestial observations that require only this voyage to render their eccentricities consistent for ever. I shall satiate my ardent curiosity with the sight of a part of the world that has never before been visited, and may tread a land never before imprinted by the foot of man.

These are my enticements, and they are sufficient to conquer all fear of danger or death and to induce me to commence this laborious voyage with the joy a child feels when he embarks in a little boat, with his holiday mates, on an expedition of discovery up his native river.`
    },
    {
      id: 'time_machine',
      title: 'The Time Machine: An Invention',
      author: 'H. G. Wells',
      year: 1895,
      genre: 'Dimensional Physics & Chrono-Philosophy',
      coverEmoji: '⏳',
      wordCount: 720,
      text: `The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.

"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception."

"Is not that rather a large thing to expect us to begin upon?" said Filby, an argumentative person with red hair.

"I do not mean to ask you to accept anything without reasonable ground for it. You will soon admit as much as I need from you. You know of course that a mathematical line, a line of thickness nil, has no real existence. They taught you that? Nor has a mathematical plane. These things are mere abstractions."

"That is all right," said the Psychologist.

"Nor, having only length, breadth, and thickness, can a cube have a real existence."

"There I object," said Filby. "Of course a solid body may exist. All real things—"

"So most people think. But wait a moment. Can an instantaneous cube exist?"

"Don't follow you," said Filby.

"Can a cube that does not exist for any time at all, have a real existence?"

Filby became pensive. "Clearly," the Time Traveller proceeded, "any real body must have extension in four directions: it must have Length, Breadth, Thickness, and—Duration. But through a natural infirmity of the flesh, which I will explain to you in a moment, we incline to overlook this fact. There are really four dimensions, three which we call the three planes of Space, and a fourth, Time."`
    },
    {
      id: 'alice',
      title: "Alice's Adventures in Wonderland",
      author: 'Lewis Carroll',
      year: 1865,
      genre: 'Linguistic Logic & Cognitive Reverie',
      coverEmoji: '🐇',
      wordCount: 650,
      text: `Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, "and what is the use of a book," thought Alice "without pictures or conversations?"

So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.

There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, "Oh dear! Oh dear! I shall be late!" (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.

In another moment down went Alice after it, never once considering in the world how she was to get out again.`
    },
    {
      id: 'art_of_war',
      title: 'The Art of War (Sun Tzu)',
      author: 'Sun Tzu (Translated by Lionel Giles)',
      year: -500,
      genre: 'Cognitive Strategy & Cybernetics',
      coverEmoji: '⚔️',
      wordCount: 520,
      text: `The art of war is of vital importance to the State. It is a matter of life and death, a road either to safety or to ruin. Hence it is a subject of inquiry which can on no account be neglected.

The art of war, then, is governed by five constant factors, to be taken into account in one's deliberations, when seeking to determine the conditions obtaining in the field. These are: The Moral Law; Heaven; Earth; The Commander; Method and discipline.

The Moral Law causes the people to be in complete accord with their ruler, so that they will follow him regardless of their lives, undismayed by any danger.

Heaven signifies night and day, cold and heat, times and seasons. Earth comprises distances, great and small; danger and security; open ground and narrow passes; the chances of life and death.

The Commander stands for the virtues of wisdom, sincerely, benevolence, courage and strictness.

All warfare is based on deception. Hence, when able to attack, we must seem unable; when using our forces, we must seem inactive; when we are near, we must make the enemy believe we are far away; when far away, we must make him believe we are near.`
    },
    {
      id: 'meditations',
      title: 'Meditations (Marcus Aurelius)',
      author: 'Marcus Aurelius Antoninus',
      year: 180,
      genre: 'Stoic Neuro-Regulation & Mind Discipline',
      coverEmoji: '🏛️',
      wordCount: 580,
      text: `When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own—not of the same blood or birth, but the same mind, and possessing a share of the divine. And so none of them can hurt me.

No one can implicate me in ugliness. Nor can I feel angry at my relative, or hate him. We were made to work together like feet, like hands, like the rows of the upper and lower teeth. To obstruct each other is unnatural. To feel anger at someone, to turn your back on him: these are obstructions.

Whatever this is that I am, it is a little flesh and breath, and the ruling part. Despise the flesh: blood and bones and a network, a jumble of nerves, veins, and arteries. Consider the breath: wind, constantly changing, expelled and sucked back in. The third part is the ruling master. Put your books aside. Distract yourself no longer. You do not have time. As if you were dying now: you are an old man; do not let this part of you be enslaved anymore.`
    }
  ];

  // Tokenized stream of the current book/prose
  readonly tokens = computed<IRSVPToken[]>(() => {
    let rawText = '';
    const bookId = this.selectedBookId();
    if (bookId === 'custom') {
      rawText = this.customText() || 'Paste or type any text here to read with Neuro-Bionic RSVP speed acceleration.';
    } else {
      const b = this.books.find(x => x.id === bookId);
      rawText = b ? b.text : this.books[0].text;
    }
    return this.tokenizeText(rawText);
  });

  // Current active token at foveal fixation reticle
  readonly currentToken = computed<IRSVPToken>(() => {
    const list = this.tokens();
    if (list.length === 0) {
      return {
        raw: 'PocketGull',
        prefix: 'Pock',
        orpChar: 'e',
        suffix: 'tGull',
        hasCommaOrPause: false,
        hasSentenceEnd: false,
        hasParagraphBreak: false,
        wordIndex: 0
      };
    }
    const idx = Math.min(this.currentWordIndex(), list.length - 1);
    return list[idx];
  });

  // Reading Telemetry
  readonly progressPercentage = computed<number>(() => {
    const list = this.tokens();
    if (list.length === 0) return 0;
    return Math.min(100, Math.round((this.currentWordIndex() / list.length) * 100));
  });

  readonly estimatedMinutesRemaining = computed<number>(() => {
    const list = this.tokens();
    const remainingWords = Math.max(0, list.length - this.currentWordIndex());
    const currentWpm = Math.max(150, this.wpm());
    return Math.round((remainingWords / currentWpm) * 10) / 10;
  });

  // Optimal Recognition Point (ORP) formula:
  // 1-letter: index 0
  // 2-5 letters: index 1
  // 6-9 letters: index 2
  // 10-13 letters: index 3
  // 14+ letters: index 4
  private computeOrpIndex(word: string): number {
    const len = word.length;
    if (len <= 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
  }

  tokenizeText(text: string): IRSVPToken[] {
    if (!text) return [];

    const rawWords = text.trim().split(/\s+/);
    const tokens: IRSVPToken[] = [];

    for (let i = 0; i < rawWords.length; i++) {
      const raw = rawWords[i];
      if (!raw) continue;

      const hasCommaOrPause = /[,;:\-—]/.test(raw);
      const hasSentenceEnd = /[.!?]/.test(raw);
      const hasParagraphBreak = raw.includes('\n');

      // Strip non-alphanumeric for ORP calculation, but preserve display
      const cleanLetters = raw.replace(/[^a-zA-Z0-9]/g, '');
      const orpIdx = this.computeOrpIndex(cleanLetters);

      // Find the character corresponding to the ORP in the original raw string
      let letterCount = 0;
      let splitAt = 0;
      for (let c = 0; c < raw.length; c++) {
        if (/[a-zA-Z0-9]/.test(raw[c])) {
          if (letterCount === orpIdx) {
            splitAt = c;
            break;
          }
          letterCount++;
        }
      }

      const prefix = raw.slice(0, splitAt);
      const orpChar = raw.charAt(splitAt) || '';
      const suffix = raw.slice(splitAt + 1);

      tokens.push({
        raw,
        prefix,
        orpChar,
        suffix,
        hasCommaOrPause,
        hasSentenceEnd,
        hasParagraphBreak,
        wordIndex: i
      });
    }

    return tokens;
  }

  togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  play(): void {
    if (!this.isBrowser) return;
    this.isPlaying.set(true);
    this.initWebAudio();
    this.scheduleNextToken();
  }

  pause(): void {
    this.isPlaying.set(false);
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  rewind(wordCount = 15): void {
    this.currentWordIndex.update(idx => Math.max(0, idx - wordCount));
  }

  stepForward(wordCount = 15): void {
    const max = this.tokens().length - 1;
    this.currentWordIndex.update(idx => Math.min(max, idx + wordCount));
  }

  seekToIndex(index: number): void {
    const max = this.tokens().length - 1;
    this.currentWordIndex.set(Math.max(0, Math.min(max, index)));
  }

  selectBook(bookId: string): void {
    this.pause();
    this.selectedBookId.set(bookId);
    this.currentWordIndex.set(0);
  }

  loadCustomText(text: string): void {
    this.pause();
    this.customText.set(text);
    this.selectedBookId.set('custom');
    this.currentWordIndex.set(0);
  }

  setWpm(targetWpm: number): void {
    this.wpm.set(Math.max(100, Math.min(1500, targetWpm)));
  }

  setAvsMode(mode: ReaderAvsMode): void {
    this.avsMode.set(mode);
  }

  private scheduleNextToken(): void {
    if (!this.isPlaying()) return;

    const list = this.tokens();
    const curIdx = this.currentWordIndex();

    if (curIdx >= list.length - 1) {
      this.pause();
      return;
    }

    const token = list[curIdx];
    const baseIntervalMs = (60 / this.wpm()) * 1000;

    // Apply cognitive hold weighting
    let dynamicDelay = baseIntervalMs;
    if (token.hasParagraphBreak) {
      dynamicDelay *= 2.4;
    } else if (token.hasSentenceEnd) {
      dynamicDelay *= 1.8;
    } else if (token.hasCommaOrPause) {
      dynamicDelay *= 1.35;
    } else if (token.raw.length >= 10) {
      dynamicDelay *= 1.15;
    }

    // Trigger AVS audio micro-pulse
    this.playAvsAudioClick();

    this.timerId = setTimeout(() => {
      this.zone.run(() => {
        this.currentWordIndex.update(i => i + 1);
        this.scheduleNextToken();
      });
    }, dynamicDelay);
  }

  private initWebAudio(): void {
    if (!this.isBrowser) return;
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.debug('AudioContext not available', e);
    }
  }

  private playAvsAudioClick(): void {
    if (!this.audioCtx || this.avsMode() === 'silent') return;

    try {
      const mode = this.avsMode();
      let freqHz = 432;
      let clickFreq = 40; // 40 Hz Gamma

      if (mode === 'gamma40') {
        freqHz = 528;
        clickFreq = 40;
      } else if (mode === 'beta18') {
        freqHz = 432;
        clickFreq = 18;
      } else if (mode === 'smr14') {
        freqHz = 396;
        clickFreq = 14;
      } else if (mode === 'theta5') {
        freqHz = 285;
        clickFreq = 5.5;
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqHz, now);

      // Micro-envelope for tactile auditory click without harshness
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) {
      // ignore
    }
  }
}
