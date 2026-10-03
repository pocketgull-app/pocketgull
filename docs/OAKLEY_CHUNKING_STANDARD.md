# Cognitive Triad Standard: DSRP, Oakley & Seligman
## Structural Systems Thinking, Cognitive Neuroarchitecture & Positive Clinical Agency

> **Authoritative Standard**: Grounded in the synthesis of:
> 1. **DSRP Systems Thinking** (Derek & Laura Cabrera): Structural clarity and universal systemic de-biasing ($D, S, R, P$).
> 2. **Cognitive Neuroarchitecture** (Dr. Barbara Oakley & Terrence Sejnowski): 4-slot working memory limits, chunking, and physical metaphors.
> 3. **Positive Psychology & Learned Agency** (Dr. Martin Seligman & Barbara Fredrickson): Explanatory style transformation (dismantling the 3 Ps), strengths-based care, and PERMA empowerment.
>
> **Scope**: All peer-reviewed research manuscripts, clinical whitepapers, patient care plan representations, diagnostic HUD components, AI voice/consult prompts, and Angular 22 domain models within PocketGull.

---

## 1. The Epistemic Triad Architecture

Every feature, AI consult interaction, and clinical research manuscript in PocketGull must align across three distinct dimensions of human cognition:

```
                      [ THE TRIAD OF POCKETGULL'S VOICE ]
                                
                                     DSRP
                               (The Head / Map)
                             Structural Clarity:
                            "What is actually true?"
                                    ▲      ▲
                                   /        \
                                  /          \
                                 /            \
                                ▼              ▼
                    BARBARA OAKLEY            MARTIN SELIGMAN
                  (The Senses / Delivery)   (The Heart / Agency)
                     Cognitive Bandwidth:       Motivational Voice:
                 "Can the wetware absorb it?"   "Can the human act on it?"
```

* **DSRP (Cabrera)** ensures **Truth & Structural Completeness**: Identifies boundaries, components, feedbacks, and multi-stakeholder perspectives.
* **Oakley** ensures **Humane Biological Delivery**: Compresses complex systems into $\le 4$ working-memory slots, vivid physical metaphors, and habit bundles.
* **Seligman** ensures **Agency & Hopefulness**: Dismantles learned helplessness and fatalism, transforming clinical insights into achievable micro-accomplishments.

---

## 2. DSRP Systems Thinking Invariants

1. **Distinction Rule ($D$) — Identity / Other**:
   - Every clinical entity, diagnosis, or symptom MUST clearly define what it *is* ($A$) and explicitly demarcate what it is *not* ($\neg A$).
   - Distinguish acute, transient physiological responses from progressive structural disease.
2. **System Rule ($S$) — Part / Whole**:
   - Deconstruct complex multisystem conditions into modular subsystems (e.g., autonomic, mitochondrial, glymphatic) without losing sight of the whole person.
   - Guard against reductionist isolation: no physiological part exists without whole-body resonance.
3. **Relationship Rule ($R$) — Action / Reaction & Interconnection**:
   - Map explicit biophysical feedbacks and causal chains ($A \to B \to C$). Never present correlated symptoms without articulating the underlying physiological relationship.
4. **Perspective Rule ($P$) — Point / View**:
   - Every care plan and algorithm MUST be interrogated through three distinct lenses:
     - *Patient Perspective*: Lived daily burden, symptom distress, economic cost.
     - *Clinician Perspective*: Diagnostic acuity, medicolegal risk, workflow efficiency.
     - *Falsification Perspective*: The contrarian/non-responder hypothesis (combating the *Einstellung effect*).

---

## 3. Oakley Neuroarchitecture & Chunking Invariants

1. **The 4-Slot Working Memory Ceiling (`WM_SLOT_MAX = 4`)**:
   - Human working memory holds only 3 to 4 active, uncompressed chunks simultaneously.
   - No clinical dashboard, HUD readout, patient care plan, or manuscript section may present more than 4 concurrent uncompressed variables.
2. **The 3-Step Micro-Chunk Paragraph Recipe**:
   - *Lead Anchor (Focus)*: Single unambiguous declarative sentence defining the core claim.
   - *Mechanism / Metaphor (Understanding)*: Concrete causal chain ($A \to B \to C$) paired with an intuitive physical model.
   - *Boundary Condition (Context)*: Explicit failure mode, contraindication, or limit.
3. **Physical Analogy Grounding**:
   - Every abstract mathematical model or physiological cascade MUST be anchored in a familiar, tangible physical metaphor (e.g., vascular tone as a garden hose, sleep as cerebral street-sweeping).
4. **Active Retrieval Practice ("Look-Away" Litmus)**:
   - Patient care plans and educational frames must incorporate interactive self-testing prompts rather than passive text walls.

---

## 4. Seligman Positive Psychology & Clinical Voice Invariants

1. **Dismantling the 3 Ps of Learned Helplessness**:
   All patient communications, consult dialogues, and care summaries MUST actively reverse Seligman’s 3 toxic explanatory styles:
   - **Permanence $\to$ Transience**: Reframe chronic flares from permanent doom into manageable, cyclical, or temporary biophysical states with an active trajectory.
   - **Pervasiveness $\to$ Specificity**: Isolate the affected subsystem (e.g., orthostatic baroreflex) from the patient’s overall vitality and identity.
   - **Personalization $\to$ External Biophysical Feedback**: Reframe symptoms not as personal failings or "defective bodies," but as natural, predictable physiological feedback loops responding to environmental or metabolic load.
2. **Strengths-First Architecture (VIA Character Strengths)**:
   - Identify and anchor therapeutic interventions to existing patient strengths, routines, and values rather than obsessing solely over deficits.
3. **Actionable Micro-Accomplishment (PERMA)**:
   - Every patient-facing summary or alert MUST conclude with a clear, immediate, low-friction micro-action (an "Accomplishment") to rebuild self-efficacy.
4. **The Quiet Workshop Voice**:
   - Tone must remain deeply warm, reassuring, craft-oriented, and grounded. Prohibit alarmist red-alert text or panic-inducing medical terminology.

---

## 5. Research & Clinical Manuscript Guidelines

When authoring research papers, whitepapers, or algorithmic specifications:

| Section | DSRP Function | Oakley Function | Seligman Function |
| :--- | :--- | :--- | :--- |
| **Abstract & Intro** | Demarcates boundaries ($D$) and identifies systemic clinical bottlenecks ($S$). | Compresses the thesis into a 4-slot narrative spine with a central physical metaphor. | Rejects therapeutic nihilism; frames problems as solvable systemic challenges. |
| **Methods & Model** | Traces exact causal relationships ($R$) and modular subsystem interactions. | Chunks technical pipelines into $\le 4$ digestible phases with zero jargon overcrowding. | Highlights workforce-amplifying tools that empower frontline clinicians. |
| **Results & Proof** | Evaluates data across diverse strata and counterfactual perspectives ($P$). | Uses clear graphic abstract summaries passing the 10-second recall test. | Grounds outcomes in tangible clinical improvements and patient vitality. |
| **Discussion & Conclusion** | Confronts alternative perspectives and non-responder edge cases. | Outlines clear operational takeaways without cognitive overload. | Provides an empowering, forward-looking translational trajectory. |

---

## 6. Software Architecture & State Management Rules

1. **"Tell, Don't Ask" Domain Chunks**:
   - Encapsulate reactive states and calculations within services. Expose cohesive domain value objects (e.g., `perfusionProfile`) rather than leaking 6–10 raw primitive signals into UI components.
2. **Pre-attentive Visual Grouping**:
   - Use color, spatial continuity, and tabular alignment to visually bind related metrics so the brain processes composite telemetry cards as a single chunk.
3. **Diffuse-Mode Engineering Protocol**:
   - If an engineering roadblock persists across 3 consecutive failed iterations, halt interactive typing, commit a structured state snapshot, and switch to an interleaved task to allow diffuse-mode incubation.

---

## 7. The Unified Pre-Submission & Pre-Ship Checklist

Before publishing any research article or deploying any clinical UI workflow, verify:

```markdown
- [ ] 1. DSRP Structural Completeness:
       • Are boundaries ($D$) clear? What is this syndrome/algorithm NOT?
       • Are parts and wholes ($S$) properly encapsulated?
       • Is the causal relationship ($R$) explicitly articulated?
       • Have we evaluated alternate and falsification perspectives ($P$)?

- [ ] 2. Oakley Cognitive Bandwidth:
       • Is the 4-slot working memory ceiling strictly honored ($\le 4$ active items)?
       • Is every abstract formula or mechanism paired with a physical analogy?
       • Can a reviewer explain the core thesis after a 10-second look at the main figure?
       • Are patient habits bundled into branded single-chunk routines?

- [ ] 3. Seligman Agency & Voice:
       • Have we actively neutralized the 3 Ps (Permanence, Pervasiveness, Personalization)?
       • Does the communication leave the reader/patient with an immediate actionable micro-win?
       • Is the tone grounded in the warm, reassuring "Quiet Workshop Voice"?
```
