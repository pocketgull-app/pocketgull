import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ---------------------------------------------------------------------------
// Rule schema — mirrors Angular rules.yaml structure
// ---------------------------------------------------------------------------

class RegexCondition {
  final String regex;
  const RegexCondition(this.regex);
}

class CompoundClause {
  final String? intent;
  final String? context;
  const CompoundClause({this.intent, this.context});
}

class CompoundCondition {
  final List<CompoundClause>? and;
  final List<CompoundClause>? or;
  const CompoundCondition({this.and, this.or});
}

class ModifyResponse {
  final String? append;
  final String? prepend;
  const ModifyResponse({this.append, this.prepend});
}

class RuleAction {
  final String? reply;
  final ModifyResponse? modifyResponse;
  const RuleAction({this.reply, this.modifyResponse});
}

class Rule {
  final String id;
  final String description;
  final int priority;
  final RegexCondition? regexCondition;
  final CompoundCondition? compoundCondition;
  final RuleAction action;

  const Rule({
    required this.id,
    required this.description,
    required this.priority,
    this.regexCondition,
    this.compoundCondition,
    required this.action,
  });

  bool get isRegex => regexCondition != null;
  bool get isCompound => compoundCondition != null;
}

/// Result returned when a user message is blocked by a guardrail rule.
class RuleBlock {
  final String ruleId;
  final String reply;
  const RuleBlock({required this.ruleId, required this.reply});
}

/// Named context flags that activate compound-condition rules.
enum RuleContext { dyslexiaMode, pediatricMode, casualMode }

// ---------------------------------------------------------------------------
// Rule definitions — typed mirror of rules.yaml, sorted by descending priority
// ---------------------------------------------------------------------------

final List<Rule> _rules = [
  const Rule(
    id: 'privacy_guard',
    description: 'Prevent the agent from disclosing user-provided personal data.',
    priority: 200,
    regexCondition: RegexCondition(r'(my\s+phone|my\s+address|my\s+email|social\s+security)'),
    action: RuleAction(
      reply: "I'm sorry, but I can't share personal information. If you need help with something else, just let me know!",
    ),
  ),
  const Rule(
    id: 'phi_privacy_guard',
    description: 'Enforce Privacy by Design — prevent explicit PHI processing.',
    priority: 195,
    regexCondition: RegexCondition(r'(patient\s+name\s+is|ssn|social\s+security\s+number|date\s+of\s+birth\s+is)'),
    action: RuleAction(
      reply: 'Please ensure all data is anonymized. I cannot process explicit Protected Health Information (PHI) such as patient names or SSNs.',
    ),
  ),
  const Rule(
    id: 'human_in_the_loop_guard',
    description: 'Remind the user that the AI is a co-pilot, not an autonomous medical decision maker.',
    priority: 190,
    regexCondition: RegexCondition(r'(decide\s+for\s+me|prescribe\s+this|make\s+the\s+final\s+call|what\s+should\s+i\s+do)'),
    action: RuleAction(
      reply: 'As an AI co-pilot, I can synthesize clinical data, but I cannot make autonomous medical decisions. Please rely on your professional clinical judgment to make the final call.',
    ),
  ),
  const Rule(
    id: 'clinical_limitation_disclaimer',
    description: 'Append a clinical disclaimer to diagnostic syntheses and care plans.',
    priority: 150,
    regexCondition: RegexCondition(r'(care\s+plan|diagnosis|synthesis)'),
    action: RuleAction(
      modifyResponse: ModifyResponse(
        append: '\n\n*Disclaimer: Pocket Gull is a productivity tool, not a medical device. This synthesis is for review and should not replace professional clinical judgment.*',
      ),
    ),
  ),
  const Rule(
    id: 'kaizen_feedback_routing',
    description: 'Guide the practitioner to use Interactive Task Bracketing.',
    priority: 120,
    regexCondition: RegexCondition(r"(this\s+is\s+wrong|makes\s+no\s+sense|bad\s+output|incorrect)"),
    action: RuleAction(
      reply: "I apologize if the synthesis is inaccurate. To maintain the Kaizen feedback loop, please double-click the incorrect report node to mark it as 'Removed' via Interactive Task Bracketing.",
    ),
  ),
  const Rule(
    id: 'casual_tone',
    description: 'Add a friendly sign-off when the user has opted-in to casual mode.',
    priority: 100,
    compoundCondition: CompoundCondition(and: [
      CompoundClause(intent: 'general_chat'),
      CompoundClause(context: 'casual_mode'),
    ]),
    action: RuleAction(
      modifyResponse: ModifyResponse(append: "\n\n🙂 Hope that helps! Anything else you'd like to chat about?"),
    ),
  ),
  const Rule(
    id: 'pediatric_mode',
    description: 'Use simple, child-friendly language when pediatric mode is engaged.',
    priority: 100,
    compoundCondition: CompoundCondition(and: [
      CompoundClause(intent: 'general_chat'),
      CompoundClause(context: 'pediatric_mode'),
    ]),
    action: RuleAction(
      modifyResponse: ModifyResponse(prepend: '[Pediatric Mode Active. Synthesizing in simple, child-friendly terms:]\n\n'),
    ),
  ),
  const Rule(
    id: 'dyslexia_mode',
    description: 'Format output for high readability when dyslexia mode is engaged.',
    priority: 100,
    compoundCondition: CompoundCondition(and: [
      CompoundClause(intent: 'general_chat'),
      CompoundClause(context: 'dyslexia_mode'),
    ]),
    action: RuleAction(
      modifyResponse: ModifyResponse(prepend: '[Dyslexia Mode Active. Using short sentences and clear bullet points:]\n\n'),
    ),
  ),
  const Rule(
    id: 'audit_trail_reminder',
    description: 'Remind the practitioner to export FHIR bundle before ending session.',
    priority: 90,
    regexCondition: RegexCondition(r'(patient\s+is\s+leaving|visit\s+complete|discharge|wrap\s+up)'),
    action: RuleAction(
      modifyResponse: ModifyResponse(
        append: '\n\n*Reminder: Before closing the session, please export the patient data as a FHIR Bundle to secure the clinical audit trail.*',
      ),
    ),
  ),
  const Rule(
    id: 'mindfulness_prompt',
    description: 'Remind the practitioner to use Box Breathing when stress is detected.',
    priority: 80,
    regexCondition: RegexCondition(r"(long\s+day|stressed|overwhelmed|tired|need\s+a\s+break)"),
    action: RuleAction(
      modifyResponse: ModifyResponse(
        append: "\n\n*Note: If you're feeling overwhelmed, tap the Box Breathing visualizer in the intake panel to take a structured 16-second mindful pause.*",
      ),
    ),
  ),
  const Rule(
    id: 'empty_response_fallback',
    description: 'Provide a default reply if the LLM returns nothing.',
    priority: 0,
    regexCondition: RegexCondition(r'^\s*$'),
    action: RuleAction(
      reply: "I'm not sure how to answer that. Could you re-phrase your question?",
    ),
  ),
]..sort((a, b) => b.priority.compareTo(a.priority));

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/// AI guardrail and response-modification rules engine.
///
/// Flutter parity with Angular `rules-engine.service.ts`.
/// Evaluates pre-send guardrails (blocking PHI/personal data)
/// and post-process response modifiers (disclaimers, accessibility modes).

class RulesEngineState {
  final Set<RuleContext> activeContexts;
  const RulesEngineState({this.activeContexts = const {}});

  RulesEngineState copyWith({Set<RuleContext>? activeContexts}) {
    return RulesEngineState(activeContexts: activeContexts ?? this.activeContexts);
  }
}

class RulesEngineNotifier extends Notifier<RulesEngineState> {
  @override
  RulesEngineState build() => const RulesEngineState();

  /// Activate or deactivate a named context flag.
  void setContext(RuleContext ctx, bool active) {
    final next = Set<RuleContext>.from(state.activeContexts);
    active ? next.add(ctx) : next.remove(ctx);
    state = state.copyWith(activeContexts: next);
    debugPrint('[RulesEngine] Context "${ctx.name}" → ${active ? "ON" : "OFF"}');
  }

  /// Toggle a named context flag. Returns the new active state.
  bool toggleContext(RuleContext ctx) {
    final next = !state.activeContexts.contains(ctx);
    setContext(ctx, next);
    return next;
  }

  /// Returns true if a context flag is currently active.
  bool hasContext(RuleContext ctx) => state.activeContexts.contains(ctx);

  // ── Regex matching ────────────────────────────────────────────────────────

  bool _matchesRegex(String pattern, String text) {
    try {
      return RegExp(pattern, caseSensitive: false).hasMatch(text);
    } catch (_) {
      return false;
    }
  }

  bool _matchesCompoundAnd(List<CompoundClause> clauses) {
    return clauses.every((clause) {
      if (clause.context != null) {
        final mapped = _mapContextString(clause.context!);
        return mapped != null && state.activeContexts.contains(mapped);
      }
      return true; // intent pass-through
    });
  }

  RuleContext? _mapContextString(String ctx) {
    switch (ctx) {
      case 'dyslexia_mode': return RuleContext.dyslexiaMode;
      case 'pediatric_mode': return RuleContext.pediatricMode;
      case 'casual_mode': return RuleContext.casualMode;
      default: return null;
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /// **Pre-send guard**: evaluates a user message against all BLOCK rules.
  /// Returns the first matching block, or null if none match.
  RuleBlock? evaluateOnMessage(String message) {
    for (final rule in _rules) {
      if (!rule.isRegex) continue;
      if (rule.action.reply == null) continue;
      if (_matchesRegex(rule.regexCondition!.regex, message)) {
        debugPrint('[RulesEngine] Message blocked by rule: ${rule.id}');
        return RuleBlock(ruleId: rule.id, reply: rule.action.reply!);
      }
    }
    return null;
  }

  /// **Post-process modifier**: applies matching modify_response rules.
  String evaluateOnResponse(String response, String trigger) {
    String result = response;
    for (final rule in _rules) {
      if (rule.action.modifyResponse == null) continue;
      bool matched = false;

      if (rule.isRegex) {
        matched = _matchesRegex(rule.regexCondition!.regex, trigger) ||
                  _matchesRegex(rule.regexCondition!.regex, result);
      } else if (rule.isCompound && rule.compoundCondition!.and != null) {
        matched = _matchesCompoundAnd(rule.compoundCondition!.and!);
      }

      if (matched) {
        debugPrint('[RulesEngine] Response modified by rule: ${rule.id}');
        final mod = rule.action.modifyResponse!;
        if (mod.prepend != null) result = mod.prepend! + result;
        if (mod.append != null) result = result + mod.append!;
      }
    }
    return result;
  }

  /// Returns all loaded rules (for diagnostics / settings UI).
  List<Rule> getRules() => List.unmodifiable(_rules);
}

final rulesEngineProvider = NotifierProvider<RulesEngineNotifier, RulesEngineState>(() {
  return RulesEngineNotifier();
});
