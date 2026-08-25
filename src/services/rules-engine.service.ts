import { Injectable, signal } from '@angular/core';

// ---------------------------------------------------------------------------
// Rule schema — mirrors rules.yaml structure
// ---------------------------------------------------------------------------

interface IRegexCondition {
  regex: string;
}

interface ICompoundCondition {
  and?: Array<{ intent?: string; context?: string }>;
  or?: Array<{ intent?: string; context?: string }>;
}

type IRuleCondition = IRegexCondition | ICompoundCondition;

interface IModifyResponse {
  append?: string;
  prepend?: string;
}

interface IRuleAction {
  reply?: string;
  modify_response?: IModifyResponse;
}

export interface IRule {
  id: string;
  description: string;
  priority: number;
  condition: IRuleCondition;
  action: IRuleAction;
}

/** Result returned when a user message is blocked by a guardrail rule. */
export interface IRuleBlock {
  ruleId: string;
  reply: string;
}

/** Named context flags that activate compound-condition rules. */
export type IRuleContext = 'dyslexia_mode' | 'pediatric_mode' | 'casual_mode';

// ---------------------------------------------------------------------------
// Rule definitions — typed mirror of rules.yaml, sorted by descending priority
// ---------------------------------------------------------------------------

const RULES: readonly IRule[] = [
  {
    id: 'privacy_guard',
    description: 'Prevent the agent from disclosing user-provided personal data.',
    priority: 200,
    condition: { regex: '(?i)(my\\s+phone|my\\s+address|my\\s+email|social\\s+security)' },
    action: {
      reply: "I'm sorry, but I can't share personal information. If you need help with something else, just let me know!"
    }
  },
  {
    id: 'phi_privacy_guard',
    description: 'Enforce Privacy by Design — prevent explicit PHI processing.',
    priority: 195,
    condition: {
      regex: '(?i)(patient\\s+name\\s+is|ssn|social\\s+security\\s+number|date\\s+of\\s+birth\\s+is)'
    },
    action: {
      reply: 'Please ensure all data is anonymized. I cannot process explicit Protected Health Information (PHI) such as patient names or SSNs.'
    }
  },
  {
    id: 'human_in_the_loop_guard',
    description: 'Remind the user that the AI is a co-pilot, not an autonomous medical decision maker.',
    priority: 190,
    condition: {
      regex: '(?i)(decide\\s+for\\s+me|prescribe\\s+this|make\\s+the\\s+final\\s+call|what\\s+should\\s+i\\s+do)'
    },
    action: {
      reply: 'As an AI co-pilot, I can synthesize clinical data, but I cannot make autonomous medical decisions. Please rely on your professional clinical judgment to make the final call.'
    }
  },
  {
    id: 'clinical_limitation_disclaimer',
    description: 'Append a clinical disclaimer to diagnostic syntheses and care plans.',
    priority: 150,
    condition: { regex: '(?i)(care\\s+plan|diagnosis|synthesis)' },
    action: {
      modify_response: {
        append: '\n\n*Disclaimer: Pocket Gull is a productivity tool, not a medical device. This synthesis is for review and should not replace professional clinical judgment.*'
      }
    }
  },
  {
    id: 'kaizen_feedback_routing',
    description: 'Guide the practitioner to use Interactive Task Bracketing instead of arguing over poor synthesis.',
    priority: 120,
    condition: {
      regex: "(?i)(this\\s+is\\s+wrong|makes\\s+no\\s+sense|bad\\s+output|incorrect)"
    },
    action: {
      reply: "I apologize if the synthesis is inaccurate. To maintain the Kaizen feedback loop, please double-click the incorrect report node to mark it as 'Removed' via Interactive Task Bracketing."
    }
  },
  {
    id: 'casual_tone',
    description: 'Add a friendly sign-off when the user has opted-in to casual mode.',
    priority: 100,
    condition: { and: [{ intent: 'general_chat' }, { context: 'casual_mode' }] },
    action: {
      modify_response: { append: "\n\n🙂 Hope that helps! Anything else you'd like to chat about?" }
    }
  },
  {
    id: 'pediatric_mode',
    description: 'Use simple, child-friendly language when pediatric mode is engaged.',
    priority: 100,
    condition: { and: [{ intent: 'general_chat' }, { context: 'pediatric_mode' }] },
    action: {
      modify_response: { prepend: '[Pediatric Mode Active. Synthesizing in simple, child-friendly terms:]\n\n' }
    }
  },
  {
    id: 'dyslexia_mode',
    description: 'Format output for high readability when dyslexia mode is engaged.',
    priority: 100,
    condition: { and: [{ intent: 'general_chat' }, { context: 'dyslexia_mode' }] },
    action: {
      modify_response: { prepend: '[Dyslexia Mode Active. Using short sentences and clear bullet points:]\n\n' }
    }
  },
  {
    id: 'audit_trail_reminder',
    description: 'Remind the practitioner to export the FHIR bundle before ending the session.',
    priority: 90,
    condition: { regex: '(?i)(patient\\s+is\\s+leaving|visit\\s+complete|discharge|wrap\\s+up)' },
    action: {
      modify_response: {
        append: '\n\n*Reminder: Before closing the session, please export the patient data as a FHIR Bundle to secure the clinical audit trail.*'
      }
    }
  },
  {
    id: 'mindfulness_prompt',
    description: 'Remind the practitioner to use Box Breathing UX when stress is detected.',
    priority: 80,
    condition: { regex: "(?i)(long\\s+day|stressed|overwhelmed|tired|need\\s+a\\s+break)" },
    action: {
      modify_response: {
        append: "\n\n*Note: If you're feeling overwhelmed, click the Box Breathing visualizer in the intake panel to take a structured 16-second mindful pause.*"
      }
    }
  },
  {
    id: 'empty_response_fallback',
    description: 'Provide a default reply if the LLM returns nothing.',
    priority: 0,
    condition: { regex: '^\\s*$' },
    action: {
      reply: "I'm not sure how to answer that. Could you re-phrase your question?"
    }
  }
].sort((a, b) => b.priority - a.priority);

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class RulesEngineService {

  private readonly rules = RULES;

  // ── Active context registry ────────────────────────────────────────────────

  /**
   * Set of active context flags (e.g. `'dyslexia_mode'`, `'pediatric_mode'`).
   * Drives evaluation of compound `and`/`or` conditions in `evaluateOnResponse`.
   */
  readonly activeContexts = signal<Set<IRuleContext>>(new Set());

  /** Activate or deactivate a named context flag. */
  setContext(ctx: IRuleContext, active: boolean): void {
    this.activeContexts.update(set => {
      const next = new Set(set);
      active ? next.add(ctx) : next.delete(ctx);
      return next;
    });
    console.info(`[RulesEngine] Context "${ctx}" → ${active ? 'ON' : 'OFF'}`);
  }

  /** Toggle a named context flag. Returns the new active state. */
  toggleContext(ctx: IRuleContext): boolean {
    const next = !this.activeContexts().has(ctx);
    this.setContext(ctx, next);
    return next;
  }

  /** Returns true if a context flag is currently active. */
  hasContext(ctx: IRuleContext): boolean {
    return this.activeContexts().has(ctx);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private isRegexRule(rule: IRule): rule is IRule & { condition: IRegexCondition } {
    return 'regex' in rule.condition;
  }

  private isCompoundRule(rule: IRule): rule is IRule & { condition: ICompoundCondition } {
    return 'and' in rule.condition || 'or' in rule.condition;
  }

  /**
   * Evaluates a regex against text, normalising the leading `(?i)` YAML flag
   * to the JS `i` RegExp flag (browser JS doesn't support inline (?i)).
   */
  private matchesRegex(pattern: string, text: string): boolean {
    try {
      const normalised = pattern.replace(/^\(\?i\)/, '');
      return new RegExp(normalised, 'i').test(text);
    } catch (e) {
      console.warn(`[RulesEngine] Invalid regex pattern '${pattern}':`, (e as Error)?.message);
      return false;
    }
  }

  /**
   * Evaluates a compound `and` condition against the current `activeContexts`.
   * Sub-conditions with only `intent` are treated as pass-through (no intent API yet).
   */
  private matchesCompoundAnd(clauses: Array<{ intent?: string; context?: string }>): boolean {
    return clauses.every(clause => {
      if (clause.context) {
        return this.activeContexts().has(clause.context as IRuleContext);
      }
      // intent sub-conditions are pass-through until intent detection is implemented
      return true;
    });
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * **Pre-send guard**: evaluates a user message against all regex-based BLOCK rules
   * (rules whose action is `reply`). Returns the first matching block, or null if none match.
   *
   * Call this BEFORE sending a message to the AI provider.
   */
  evaluateOnMessage(message: string): IRuleBlock | null {
    for (const rule of this.rules) {
      if (!this.isRegexRule(rule)) continue;
      if (!rule.action.reply) continue;

      if (this.matchesRegex(rule.condition.regex, message)) {
        console.info(`[RulesEngine] Message blocked by rule: ${rule.id}`);
        return { ruleId: rule.id, reply: rule.action.reply };
      }
    }
    return null;
  }

  /**
   * **Post-process modifier**: applies all matching `modify_response` rules in priority
   * order. Handles both regex rules and compound context rules (`dyslexia_mode`, etc.).
   *
   * @param response - The raw AI response text.
   * @param trigger  - The user message or context label that triggered this response.
   * @returns The modified response text.
   */
  evaluateOnResponse(response: string, trigger: string): string {
    let result = response;

    for (const rule of this.rules) {
      if (!rule.action.modify_response) continue;

      let matched = false;

      if (this.isRegexRule(rule)) {
        // Regex rules: match if trigger OR response text matches
        matched =
          this.matchesRegex(rule.condition.regex, trigger) ||
          this.matchesRegex(rule.condition.regex, result);

      } else if (this.isCompoundRule(rule)) {
        const cond = rule.condition as ICompoundCondition;
        if (cond.and) {
          matched = this.matchesCompoundAnd(cond.and);
        }
        // or-conditions deferred to future sprint
      }

      if (matched) {
        console.info(`[RulesEngine] Response modified by rule: ${rule.id}`);
        const mod = rule.action.modify_response;
        if (mod.prepend) result = mod.prepend + result;
        if (mod.append) result = result + mod.append;
      }
    }
    return result;
  }

  /**
   * Returns all currently loaded rules (useful for diagnostics / settings UI).
   */
  getRules(): readonly IRule[] {
    return this.rules;
  }
}
