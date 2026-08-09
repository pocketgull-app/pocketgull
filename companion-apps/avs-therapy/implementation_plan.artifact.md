# AvsTherapy Component Refactoring Plan

The `AvsTherapyComponent` is currently a monolithic component (~1240 lines) handling UI orchestration, clinical logic, Web Audio synthesis, Web Speech API, and Canvas animations. This plan refactors it into a container-presenter architecture using smaller, focused sub-components.

## User Review Required

> [!IMPORTANT]
> This refactor will split the `avs-therapy.component.ts` into several new files. Ensure your IDE is synced. No functional changes are intended, only structural improvements.

## Proposed Changes

### [Component] Constants & Types
Move common definitions to a shared location.
- [NEW] [avs.constants.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs.constants.ts)

### [Component] AvsTherapy (Container)
Refactor the main component to act as an orchestrator.
- [MODIFY] [avs-therapy.component.ts](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.ts)
- [NEW] [avs-therapy.component.html](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.html)
- [NEW] [avs-therapy.component.css](file:///C:/Users/philg/Pocketgull/pocketgull/companion-apps/avs-therapy/src/app/components/avs-therapy.component.css)

### [Component] Presentation Sub-components
New standalone components to handle specific UI sections.
- [NEW] `AvsHeaderComponent`
- [NEW] `AvsVisualizerComponent`
- [NEW] `ClinicianConsoleComponent`
- [NEW] `CircadianDashboardComponent`
- [NEW] `CoRegulationPanelComponent`
- [NEW] `LifestyleAdjunctPanelComponent`
- [NEW] `PatientWaitingComponent`
- [NEW] `SessionControlsComponent`

## Verification Plan

### Automated Tests
- Run `ng test` to ensure existing tests still pass.
- I will create a basic test for one of the new components.

### Manual Verification
- Verify the UI looks and behaves exactly as before in both Clinician and Patient views.
- Ensure the AVS session (Audio/Canvas) still functions correctly.
