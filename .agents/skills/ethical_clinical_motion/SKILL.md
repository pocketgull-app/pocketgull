---
name: ethical-clinical-motion
description: Directives and standards for Rachel Nabors-inspired ethical animation, parasympathetic bio-rhythmic pacing (0.1 Hz), origami spatial continuity, and anti-dark-pattern UX in clinical applications.
---

# Ethical Clinical Motion & Bio-Rhythmic Pacing Standard

## Core Philosophy
In healthcare and wellness applications, animation is an orientation tool, a soothing bio-rhythmic guide, and an agent of reassurance. It must NEVER be used for dark patterns, manufactured urgency, or addictive slot-machine feedback loops.

---

## 1. The 5 Principles of Ethical Clinical Animation

### A. Parasympathetic Bio-Rhythmic Pacing ($0.1\text{ Hz}$)
- Ambient glow, background subtle gradient oscillations, and pacer indicators MUST operate on a natural **$10\text{-second}$ respiratory cycle** ($0.1\text{ Hz}$: 4s expansion / 6s contraction).
- Subconsciously promotes diaphragmatic breathing and vagal tone recovery to counteract "screen apnea" when patients or clinicians review health data.

### B. Spatial Continuity & Origami Unfurling (FLIP)
- Modals, drawers, and inspection cards MUST visually originate from the clicked target using subtle $Z$-axis scaling and smooth spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Never snap abruptly or flash harshly into the viewport.

### C. 1-Shot Attestation Shimmer (Closure over Looping)
- Cryptographic stamps (SHA-256 seals, FHIR claims, passkey attestations) play a single **$800\text{ ms}$ luster sweep** upon verification, then settle into a resting state.
- PROHIBITION: Never use infinite flashing, bouncing, or attention-demanding pulsing on static cards.

### D. Zero Cumulative Layout Shift (CLS = 0)
- Transitions between personas (e.g. `👨‍⚕️ Clinician Note` $\leftrightarrow$ `🌱 Patient Horizon`) must smoothly cross-fade text and morph container height with zero layout jumping.

### E. Strict `prefers-reduced-motion: reduce` Demarcation
- Every motion token MUST respect the user's OS accessibility preferences:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 2. Anti-Dark Pattern Prohibitions
1. **NO Fake Countdown Timers**: Never introduce artificial urgency for appointments, plans, or purchases.
2. **NO Coercive Confirmshaming**: Modals must always have clear, neutral dismiss buttons (`✕` or `Close`).
3. **NO Modal Traps**: Every overlay MUST allow instant dismissal via the `Escape` key or clicking the backdrop.
4. **NO Disorienting Screen Takes**: Never violently hijack user scroll or screen focus without affirmative interaction.
