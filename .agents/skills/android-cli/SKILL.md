---
name: android-cli
description: Standardizes agent workflows for Android CLI, SDK management, UI layout inspection, Compose preview rendering, and Android Studio IDE connection.
---

# Android CLI & Agent DevTools Skill

## Purpose
Enables AI coding assistants and automation scripts to interact with Android projects, SDK tools, emulators, UI hierarchies, and active Android Studio instances using the official **Android CLI (`android`)**.

---

## 1. Quick Reference & Core Commands

| Category | Command | Description |
| :--- | :--- | :--- |
| **Environment Setup** | `android init` | Installs the `android-cli` skill into `~/.gemini/antigravity/skills`. |
| **Update CLI** | `android update` | Updates Android CLI to the latest release channel. |
| **SDK Management** | `android sdk install <pkg[@ver]>` | Installs SDK platform/build-tools (e.g., `platforms/android-35 build-tools/35.0.0`). |
| **SDK Listing** | `android sdk list [--all]` | Lists installed and available SDK packages. |
| **UI Hierarchy** | `android layout --pretty --output=ui.json` | Dumps the active device/emulator UI view hierarchy in JSON. |
| **Visual Capture** | `android screen capture --annotate --output=ui.png` | Captures a screenshot with numbered bounding boxes. |
| **Coordinate Resolve**| `android screen resolve --screenshot=ui.png --string="input tap #5"` | Resolves bounding box `#<id>` to physical `(x, y)` screen tap coordinates. |
| **App Execution** | `android run --apks=<path/to/app.apk>` | Deploys and launches an APK on a connected device/emulator. |
| **Project Scaffolding**| `android create --name=<app> <template>` | Scaffolds a project from templates (e.g., `empty-activity-agp-9`). |
| **Knowledge Base** | `android docs search '<query>'` / `fetch <kb-url>` | Searches and fetches official Android documentation (`kb://...`). |

---

## 2. Android Studio IDE Live Bridge (`android studio`)

When Android Studio (Quail 2 Canary 1+) is running with Gemini enabled, agents can query the IDE's semantic engine:

```bash
# 1. Check connected Android Studio instances and open projects
android studio check

# 2. Run IDE-grade lint and static analysis on a specific Kotlin/Java file
android studio analyze-file --project=patient_app app/src/main/kotlin/com/pocketgull/patient/MainActivity.kt

# 3. Find exact declaration site of any symbol or Android resource
android studio find-declaration --short PatientCarePlanCard

# 4. Find all usages across the codebase
android studio find-usages --short PatientCarePlanCard

# 5. Render Jetpack Compose preview to PNG with accessibility semantics tree
android studio render-compose-preview \
  --output-image-file=preview_hud.png \
  --print-semantics \
  app/src/main/kotlin/com/pocketgull/patient/ui/HudScreen.kt \
  HudScreenPreview

# 6. Lookup latest dependency versions from Google Maven / Gradle Plugin Portal
android studio version-lookup androidx.compose.ui:ui com.android.application agp kotlin
```

---

## 3. Configuration & Windows Environment (`.androidrc`)

On Windows, create `%USERPROFILE%\.androidrc` (or `~/.androidrc` on Linux/macOS) to define default SDK paths and flags:

```ini
# %USERPROFILE%\.androidrc
--sdk=C:\Users\philg\AppData\Local\Android\Sdk
```

### Windows-Specific Notes:
- **Emulator Command**: `android emulator` on Windows is temporarily disabled in early preview; use standard `emulator -avd <name>` or launch from Android Studio.
- **PowerShell Invocation**: Wrap multi-argument flags in quotes when executing from PowerShell.

---

## 4. Skills Management (`android skills`)

```bash
# Install all Android recommended skills for Gemini/Antigravity
android skills add --all

# Search for skills by topic
android skills find 'performance'

# List installed and available skills
android skills list --long
```
