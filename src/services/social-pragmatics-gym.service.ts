import { Injectable, signal, computed } from '@angular/core';

export type SocialPersonaId = 'warm_friend' | 'busy_colleague' | 'defensive_roommate' | 'anxious_adolescent' | 'setting_boundary';

export interface ISocialPersona {
  id: SocialPersonaId;
  name: string;
  avatar: string;
  role: string;
  emotionalState: string;
  scenarioDescription: string;
  targetSkillObjective: string;
  openingLine: string;
  sampleResponses: { prompt: string; reply: string; innerMonologue: string; empathyScore: number }[];
}

export interface IConversationTurn {
  speaker: 'user' | 'persona';
  text: string;
  timestamp: string;
  innerMonologue?: string;
  turnEmpathyScore?: number;
}

export interface ISocialTelemetryReport {
  sessionId: string;
  personaId: SocialPersonaId;
  personaName: string;
  totalTurns: number;
  curiosityRatio: number; // 0 to 100%
  turnBalancePct: number; // 0 to 100% (ideal ~50%)
  nvcComplianceScore: number; // 0 to 100%
  activeConstructiveScore: number; // 0 to 100%
  empathyDepthTier: 'Level 0 (Dismissive)' | 'Level 1 (Premature Advice)' | 'Level 2 (Emotional Reflection)' | 'Level 3 (Resonant Attunement)';
  unspokenImpressionSummary: string;
  strengthsObserved: string[];
  growthOpportunities: string[];
  suggestedNextDrill: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialPragmaticsGymService {
  readonly personas: ISocialPersona[] = [
    {
      id: 'warm_friend',
      name: 'Maya',
      avatar: '☕',
      role: 'Friend Catching Up',
      emotionalState: 'Excited but slightly tired from a long week',
      scenarioDescription: 'Meeting at a quiet café on a Saturday morning to catch up on life changes.',
      targetSkillObjective: 'Active-Constructive Responding & Open-Ended Curiosity',
      openingLine: "Hey! It's so good to see you. I finally got that gallery exhibition spot I was hoping for, but honestly, I'm kind of terrified about preparing 12 pieces in time.",
      sampleResponses: [
        {
          prompt: "That is massive news, Maya! Congratulations! What's the central theme of the pieces you're creating?",
          reply: "Thank you so much! It means a lot that you remembered. It's focused on coastal landscapes under changing light. I think the panic is just setting in.",
          innerMonologue: "I felt truly celebrated and not just brushed aside. When you asked about the theme, it made me feel like you genuinely care about my art.",
          empathyScore: 95
        },
        {
          prompt: "Well, 12 pieces isn't that bad if you just paint one a week. You should make a strict spreadsheet.",
          reply: "Yeah... I guess so. It's just hard to force inspiration on a schedule.",
          innerMonologue: "I felt a bit dismissed. I was hoping for shared excitement or emotional grounding before jumping straight into logistics.",
          empathyScore: 40
        }
      ]
    },
    {
      id: 'busy_colleague',
      name: 'Marcus',
      avatar: '💼',
      role: 'Senior Project Engineer',
      emotionalState: 'Time-pressed, multitasking before a major client demo',
      scenarioDescription: 'Approaching Marcus at his desk to request feedback on an architecture design document.',
      targetSkillObjective: 'Conversational Pacing & Concise Runway Setting',
      openingLine: "Hey—I'm about 15 minutes out from the client staging push. Did you need something quick?",
      sampleResponses: [
        {
          prompt: "I see you're in the zone right now. Can I send a 2-bullet summary over chat and grab 5 minutes after your demo this afternoon?",
          reply: "That would be huge, thank you! Drop the link in my DMs and I'll review it right after 3 PM.",
          innerMonologue: "I really appreciated that you read the room, respected my deadline, and gave me an easy way to help without interrupting my focus.",
          empathyScore: 98
        },
        {
          prompt: "I just need to explain all 14 schema changes we made to the database, it'll only take 10 minutes if you listen closely.",
          reply: "Look, I really don't have headspace for this right now. You'll have to wait.",
          innerMonologue: "I felt overwhelmed and frustrated that my explicit time boundary was ignored.",
          empathyScore: 25
        }
      ]
    },
    {
      id: 'defensive_roommate',
      name: 'Julian',
      avatar: '🏠',
      role: 'Apartment Roommate',
      emotionalState: 'Defensive, feeling judged over shared chores',
      scenarioDescription: 'Addressing dishes left in the sink for three consecutive days using Non-Violent Communication.',
      targetSkillObjective: 'NVC (Observation vs. Judgment, Expressing Needs & Requests)',
      openingLine: "Before you say anything, I was working a 14-hour double shift yesterday, so don't start on the kitchen.",
      sampleResponses: [
        {
          prompt: "I hear you, Julian—14-hour doubles are exhausting. I noticed dishes in the sink from Tuesday, and I feel stressed when the prep space is full because I want to cook dinner. Would you be open to clearing them tonight before bed, or should we do them together?",
          reply: "Thanks for not yelling. Yeah, yesterday wrecked me. If you can give me 20 minutes to decompress and eat, I'll wash all of them before 9 PM.",
          innerMonologue: "Because you acknowledged my exhaustion first and didn't attack my character, my defensive wall dropped. I'm happy to help.",
          empathyScore: 96
        },
        {
          prompt: "You always use your job as an excuse. You're just lazy and don't care about anyone else living here.",
          reply: "Whatever. If you're so perfect, do them yourself.",
          innerMonologue: "I felt attacked and invalidated. Now I have zero desire to cooperate.",
          empathyScore: 10
        }
      ]
    },
    {
      id: 'anxious_adolescent',
      name: 'Leo',
      avatar: '🎒',
      role: '15-Year-Old Sibling / Mentee',
      emotionalState: 'Socially withdrawn, fearful of school presentations',
      scenarioDescription: 'Supporting Leo, who is experiencing severe dread about an upcoming biology oral presentation.',
      targetSkillObjective: 'Emotional Validation & Motivational Interviewing (OARS)',
      openingLine: "I'm just not going to school on Friday. I'm going to tell Mom I have a migraine. I can't stand up in front of 30 people.",
      sampleResponses: [
        {
          prompt: "Standing up in front of the whole class when all eyes are on you can feel totally terrifying. What's the scariest part of what might happen up there?",
          reply: "I'm scared I'll forget what to say, freeze up, and everyone will laugh at me.",
          innerMonologue: "You didn't say 'It's not a big deal' or 'You'll be fine.' You actually understood why my heart is pounding.",
          empathyScore: 94
        },
        {
          prompt: "You can't skip school, Leo. Just practice in the mirror, it's really not that big of a deal once you get up there.",
          reply: "You don't get it. Forget I said anything.",
          innerMonologue: "I feel alone and misunderstood. Now I'll just hide my feelings.",
          empathyScore: 30
        }
      ]
    },
    {
      id: 'setting_boundary',
      name: 'Diane',
      avatar: '📞',
      role: 'Well-Meaning Family Member',
      emotionalState: 'Over-involved, offering unsolicited life and career directives',
      scenarioDescription: 'Setting a calm, firm, loving boundary regarding career unsolicited advice.',
      targetSkillObjective: 'Assertive Warmth & Respectful Boundary Anchor',
      openingLine: "I talked to your cousin's boss, and they have an opening in regional sales. You really need to stop this current path and apply by tomorrow.",
      sampleResponses: [
        {
          prompt: "I love you and I know you're looking out for me, Diane. Right now, I'm committed to the path I'm on, so I won't be applying. I'd love to just hear about your week instead.",
          reply: "Well... alright. As long as you know what you're doing. Tell me how the garden is going then.",
          innerMonologue: "You set a clear limit without getting angry or insulting me. I respect your confidence.",
          empathyScore: 92
        },
        {
          prompt: "Stop micromanaging my life! Why do you always have to butt into everything I do?",
          reply: "I was only trying to help you! You are always so ungrateful!",
          innerMonologue: "This turned into an emotional shouting match where both of us feel hurt.",
          empathyScore: 20
        }
      ]
    }
  ];

  readonly activePersonaId = signal<SocialPersonaId>('warm_friend');
  readonly conversationHistory = signal<IConversationTurn[]>([]);
  readonly revealInnerMonologue = signal<boolean>(false);

  public readonly activePersona = computed(() => {
    return this.personas.find(p => p.id === this.activePersonaId()) || this.personas[0];
  });

  constructor() {
    this.resetSession('warm_friend');
  }

  /**
   * Resets the interactive session with a specific persona.
   */
  public resetSession(personaId: SocialPersonaId = 'warm_friend'): void {
    this.activePersonaId.set(personaId);
    const persona = this.personas.find(p => p.id === personaId) || this.personas[0];
    this.conversationHistory.set([
      {
        speaker: 'persona',
        text: persona.openingLine,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        innerMonologue: `Starting emotional state: ${persona.emotionalState}. Waiting to see how you respond.`
      }
    ]);
  }

  /**
   * Evaluates a user conversational response and appends both turns.
   */
  public processUserResponse(userInput: string): { reply: string; innerMonologue: string; empathyScore: number } {
    const trimmed = userInput.trim();
    if (!trimmed) {
      return { reply: '', innerMonologue: '', empathyScore: 0 };
    }

    const persona = this.activePersona();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Find best matching or compute simulated pragmatic evaluation
    let matchedSample = persona.sampleResponses[0];
    const isEmpathetic = trimmed.length > 20 && (
      trimmed.includes('?') ||
      trimmed.toLowerCase().includes('congrat') ||
      trimmed.toLowerCase().includes('feel') ||
      trimmed.toLowerCase().includes('hear') ||
      trimmed.toLowerCase().includes('understand') ||
      trimmed.toLowerCase().includes('love') ||
      trimmed.toLowerCase().includes('thank')
    );

    if (!isEmpathetic && persona.sampleResponses.length > 1) {
      matchedSample = persona.sampleResponses[1];
    }

    // Append User turn
    const current = this.conversationHistory();
    const updated: IConversationTurn[] = [
      ...current,
      {
        speaker: 'user',
        text: trimmed,
        timestamp: now
      },
      {
        speaker: 'persona',
        text: matchedSample.reply,
        timestamp: now,
        innerMonologue: matchedSample.innerMonologue,
        turnEmpathyScore: matchedSample.empathyScore
      }
    ];

    this.conversationHistory.set(updated);
    return matchedSample;
  }

  /**
   * Generates a comprehensive Social Telemetry & Coaching Dossier.
   */
  public generateTelemetryReport(): ISocialTelemetryReport {
    const history = this.conversationHistory();
    const userTurns = history.filter(t => t.speaker === 'user');
    const persona = this.activePersona();

    const questionsCount = userTurns.filter(t => t.text.includes('?')).length;
    const curiosityRatio = userTurns.length > 0 ? Math.round((questionsCount / userTurns.length) * 100) : 50;

    const userWordCount = userTurns.reduce((acc, t) => acc + t.text.split(/\s+/).length, 0);
    const personaTurns = history.filter(t => t.speaker === 'persona');
    const personaWordCount = personaTurns.reduce((acc, t) => acc + t.text.split(/\s+/).length, 0);
    const totalWords = userWordCount + personaWordCount;
    const turnBalancePct = totalWords > 0 ? Math.round((userWordCount / totalWords) * 100) : 50;

    const avgScore = history
      .filter(t => t.turnEmpathyScore !== undefined)
      .reduce((acc, t) => acc + (t.turnEmpathyScore || 0), 0) / Math.max(1, history.filter(t => t.turnEmpathyScore !== undefined).length);

    let tier: ISocialTelemetryReport['empathyDepthTier'] = 'Level 2 (Emotional Reflection)';
    if (avgScore >= 90) tier = 'Level 3 (Resonant Attunement)';
    else if (avgScore >= 60) tier = 'Level 2 (Emotional Reflection)';
    else if (avgScore >= 35) tier = 'Level 1 (Premature Advice)';
    else tier = 'Level 0 (Dismissive)';

    return {
      sessionId: `SOC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      personaId: persona.id,
      personaName: persona.name,
      totalTurns: history.length,
      curiosityRatio,
      turnBalancePct,
      nvcComplianceScore: Math.min(100, Math.round(avgScore * 1.05)),
      activeConstructiveScore: Math.min(100, Math.round(avgScore * 0.98)),
      empathyDepthTier: tier,
      unspokenImpressionSummary: history[history.length - 1]?.innerMonologue || 'Felt heard and validated.',
      strengthsObserved: [
        'Resisted the urge to jump immediately into defensive arguing.',
        'Acknowledged the emotional state of the partner before transitioning topics.',
        'Maintained calm, clear syntactic structure without passive-aggressive phrasing.'
      ],
      growthOpportunities: [
        curiosityRatio < 40 ? 'Increase the ratio of open-ended questions to create more conversational runway.' : 'Continue balancing active listening with concise personal contributions.',
        turnBalancePct > 65 ? 'Notice conversational volume; pause to check in with the other person.' : 'Maintain your balanced turn pacing.'
      ],
      suggestedNextDrill: 'The Graceful Exit Drill: Ending a conversation with warmth while preserving mutual connection.'
    };
  }
}
