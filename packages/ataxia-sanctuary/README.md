# PocketGull Ataxia Sanctuary (`@pocketgull/ataxia-sanctuary`)

**Zero-dependency Windows motor-ergonomics shield, `64px` high-visibility & `650nm` scotopic cursor foundry, and 4-slot circadian control deck** engineered for people living with cerebellar ataxia, dysmetria, essential tremor, multiple sclerosis, and Parkinson's.

Licensed under **Apache-2.0** — free, local-only, zero telemetry, zero network calls, and zero administrator privileges required.

---

## Key Capabilities

| Feature | What It Solves | How It Works |
| :--- | :--- | :--- |
| **Motor Drag-Slip & Bounce Shield** | Micro-tremors during clicks turn single clicks into accidental file drags or double-clicks | Raises Windows drag threshold (`4px` -> `14px` / `18px` / `28px`), relaxes double-click window (`650ms`–`900ms`), and filters post-release switch bounce (`55ms`–`110ms`) |
| **13-Cut `64px` Cursor Foundry** | Losing track of tiny `32px` pointers across wide displays or night screens | Synthesizes 13 `64x64` ARGB cursors (`Ophthalmic High-Contrast` & zero-blue `650nm Scotopic Red`) directly into `%LOCALAPPDATA%\PocketGull\Cursors` |
| **4-Slot Dysmetria Control Deck** | Tiny nested menus and sliders cause target overshoot and fatigue | Left-clicking the tray icon opens a `2x2` grid of `208x104 px` cards (`16px` gutter) with `432 Hz` / `528 Hz` gentle acoustic confirmation |
| **Baseline Vault & Triple-`Esc` Safety Latch** | Fear of getting stuck with unfamiliar pointer settings | Captures your original Windows mouse & cursor settings into `%LOCALAPPDATA%\PocketGull\baseline-backup.json` before first change; **pressing `Esc` 3 times rapidly** restores everything immediately without needing the mouse |

---

## Quick Start (For Users)

1. Extract `PocketGull-Ataxia-Sanctuary-v1.0.0-win-x64.zip`.
2. Double-click **`Install-Sanctuary.cmd`** (or run `PocketGullSanctuary.exe` directly for portable mode).
3. Left-click the circular **PocketGull** icon in the Windows system tray to open the **4-Slot Control Deck**.
4. To stop and restore your exact original Windows mouse & cursors at any time:
   - Press **`Esc` three times** rapidly, **or**
   - Click **`↩ Reset`** at the top of the Control Deck, **or**
   - Double-click **`Uninstall-And-Restore-Mouse.cmd`**.

---

## Command-Line Flags

| Flag | Behavior |
| :--- | :--- |
| *(none)* | Starts the single-instance system tray daemon (or pops open the 4-Slot Deck if already running) |
| `--install` | Installs to `%LOCALAPPDATA%\PocketGull\Sanctuary`, captures baseline backup, registers sign-in auto-start, and launches |
| `--restore` | Immediately restores `baseline-backup.json` pointer & cursor settings and exits |
| `--uninstall` | Stops any running instance, removes sign-in auto-start, and restores `baseline-backup.json` |
| `--selftest` | Runs deterministic headless verification (`sizeof(INPUT)`, 13-cut `.cur` generation, UI initialization) |

---

## Building From Source (Zero External Toolchains Required)

Compiles directly using the 64-bit C# compiler built into every Windows 10/11 installation (`%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe`) or `dotnet build`:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File packages/ataxia-sanctuary/scripts/build.ps1
```

Outputs `dist/PocketGullSanctuary.exe`, `dist/PocketGull-Ataxia-Sanctuary-v1.0.0-win-x64.zip`, and `dist/SHA256SUMS.txt`.
