// SPDX-License-Identifier: Apache-2.0
using System;
using System.Drawing;
using System.Drawing.Text;
using System.IO;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace PocketGull.Sanctuary {
    public sealed class ControlDeckForm : Form {
        private const string RunRegistryKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
        private const string RunValueName   = "PocketGullAtaxiaSanctuary";

        private readonly SanctuaryState _state;
        private readonly InputShieldEngine _shield;
        private readonly bool _selfTestMode;

        private readonly NotifyIcon _trayIcon;
        private readonly ContextMenuStrip _trayMenu;
        private readonly System.Windows.Forms.Timer _waveTimer;
        private readonly System.Windows.Forms.Timer _pacerTimer;

        private readonly Label _lblHeader;
        private readonly Button _btnSolar;
        private readonly Button _btnReset;
        private readonly Button _btnClose;
        private readonly Panel _waveTrack;
        private readonly Panel _waveFill;

        private readonly Button _btnSlotScene;
        private readonly Button _btnSlotShield;
        private readonly Button _btnSlotPhilo;
        private readonly Button _btnSlotPacer;
        private readonly Label _lblFooter;

        private ToolStripMenuItem _miSideChords;
        private ToolStripMenuItem _miFirefoxSync;
        private ToolStripMenuItem _miRunAtLogon;

        private Font _fontHeader;
        private Font _fontCard;
        private Font _fontSmall;
        private PrivateFontCollection _privateFonts;
        private Color _deckBorderColor = Color.FromArgb(45, 212, 191);

        private int _pacerPhaseMinutes = 0;
        private bool _pacerStandingPhase = false;
        private RegisteredWaitHandle _ipcWaitHandle;

        public ControlDeckForm(bool selfTestMode, EventWaitHandle showDeckEvent) {
            _selfTestMode = selfTestMode;
            _state = SanctuaryState.Load();
            _shield = new InputShieldEngine();
            _shield.PanicRevertRequested += OnPanicRevertRequested;

            FontFamily uiFamily = ResolveUiFontFamily(out _privateFonts);
            _fontHeader = new Font(uiFamily, 11.25f, FontStyle.Bold);
            _fontCard   = new Font(uiFamily, 10.5f, FontStyle.Bold);
            _fontSmall  = new Font(uiFamily, 8.75f, FontStyle.Regular);

            Text = "PocketGull Ataxia Sanctuary";
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.Manual;
            ClientSize = new Size(464, 328);
            TopMost = true;
            ShowInTaskbar = false;
            KeyPreview = true;
            DoubleBuffered = true;

            _lblHeader = new Label();
            _lblHeader.Text = "⚕ PocketGull Sanctuary";
            _lblHeader.Font = _fontHeader;
            _lblHeader.Location = new Point(16, 13);
            _lblHeader.Size = new Size(218, 28);
            Controls.Add(_lblHeader);

            _btnSolar = CreateHeaderButton("🌅 Solar", 238, 9, 84);
            _btnSolar.Click += delegate { ApplyScene(SanctuaryState.ResolveSolarScene(DateTime.Now)); };
            Controls.Add(_btnSolar);

            _btnReset = CreateHeaderButton("↩ Reset", 328, 9, 80);
            _btnReset.Click += delegate { TriggerSafeRestore("Restored original Windows mouse & cursor defaults."); };
            Controls.Add(_btnReset);

            _btnClose = CreateHeaderButton("✕", 414, 9, 34);
            _btnClose.Click += delegate { HideDeck(); };
            Controls.Add(_btnClose);

            _waveTrack = new Panel();
            _waveTrack.Location = new Point(16, 52);
            _waveTrack.Size = new Size(432, 6);
            _waveFill = new Panel();
            _waveFill.Location = new Point(0, 0);
            _waveFill.Size = new Size(0, 6);
            _waveTrack.Controls.Add(_waveFill);
            Controls.Add(_waveTrack);

            // Strict 2x2 Grid (WM_SLOT_MAX = 4, 208x104px dysmetria-safe cards, 16px gutter)
            _btnSlotScene  = CreateSlotCard(16,  68);
            _btnSlotShield = CreateSlotCard(240, 68);
            _btnSlotPhilo  = CreateSlotCard(16,  184);
            _btnSlotPacer  = CreateSlotCard(240, 184);

            _btnSlotScene.Click += delegate {
                ApplyScene(SanctuaryState.NextSceneKey(_state.Scene));
            };
            _btnSlotShield.Click += delegate {
                ApplyMotorProfile(MotorPreset.NextProfileKey(_state.MotorProfile), true);
            };
            _btnSlotPhilo.Click += delegate {
                _state.PhilocardiaEnabled = !_state.PhilocardiaEnabled;
                _state.Save();
                SyncWaveTimer();
                AssetFoundry.PlayEarcon(false);
                RefreshDeckVisuals();
            };
            _btnSlotPacer.Click += delegate {
                _state.SitStandEnabled = !_state.SitStandEnabled;
                _pacerPhaseMinutes = 0;
                _pacerStandingPhase = false;
                _pacerTimer.Enabled = (!_selfTestMode) && _state.SitStandEnabled;
                _state.Save();
                AssetFoundry.PlayEarcon(false);
                RefreshDeckVisuals();
            };

            Controls.AddRange(new Control[] { _btnSlotScene, _btnSlotShield, _btnSlotPhilo, _btnSlotPacer });

            _lblFooter = new Label();
            _lblFooter.Text = "Safety Latch: Triple-tap Esc anytime to restore default Windows mouse";
            _lblFooter.Font = _fontSmall;
            _lblFooter.Location = new Point(16, 298);
            _lblFooter.Size = new Size(432, 22);
            _lblFooter.TextAlign = ContentAlignment.MiddleCenter;
            Controls.Add(_lblFooter);

            _waveTimer = new System.Windows.Forms.Timer();
            _waveTimer.Interval = 50;
            _waveTimer.Tick += OnWaveTimerTick;

            _pacerTimer = new System.Windows.Forms.Timer();
            _pacerTimer.Interval = 60000; // 1 minute tick
            _pacerTimer.Tick += OnPacerMinuteTick;

            _trayMenu = BuildTrayContextMenu();
            _trayIcon = new NotifyIcon();
            _trayIcon.Text = "PocketGull Ataxia Sanctuary (Left-click for 4-Slot Deck)";
            _trayIcon.Icon = AssetFoundry.CreateSceneTrayIcon(_state.Scene);
            _trayIcon.ContextMenuStrip = _trayMenu;
            _trayIcon.Visible = !_selfTestMode;
            _trayIcon.MouseClick += OnTrayMouseClick;

            KeyDown += delegate(object s, KeyEventArgs e) {
                if (e.KeyCode == Keys.Escape) HideDeck();
            };
            Deactivate += delegate { HideDeck(); };

            RefreshDeckVisuals();

            if (!_selfTestMode) {
                AssetFoundry.EnsureCursorsAndEarcons();
                ApplyMotorProfile(_state.MotorProfile, false);
                AssetFoundry.ApplyCursorSchemeForScene(_state.Scene);
                _shield.SideChordsEnabled = _state.SideChordsEnabled;
                _shield.StartHooks();
                _pacerTimer.Enabled = _state.SitStandEnabled;

                if (showDeckEvent != null) {
                    _ipcWaitHandle = ThreadPool.RegisterWaitForSingleObject(
                        showDeckEvent,
                        delegate {
                            if (!IsDisposed && IsHandleCreated) {
                                BeginInvoke((MethodInvoker)delegate { ShowDeckNearTray(); });
                            }
                        },
                        null,
                        -1,
                        false);
                }
            }
        }

        public string UiFontName {
            get { return _fontHeader.Name; }
        }

        protected override void OnShown(EventArgs e) {
            base.OnShown(e);
            if (!_selfTestMode) {
                HideDeck();
            }
        }

        protected override void OnPaint(PaintEventArgs e) {
            base.OnPaint(e);
            using (Pen pen = new Pen(_deckBorderColor, 2.0f)) {
                e.Graphics.DrawRectangle(pen, 1, 1, ClientSize.Width - 2, ClientSize.Height - 2);
            }
        }

        protected override void Dispose(bool disposing) {
            if (disposing) {
                if (_ipcWaitHandle != null) {
                    _ipcWaitHandle.Unregister(null);
                    _ipcWaitHandle = null;
                }
                _waveTimer.Stop();
                _pacerTimer.Stop();
                _shield.Dispose();
                if (_trayIcon != null) {
                    _trayIcon.Visible = false;
                    if (_trayIcon.Icon != null) _trayIcon.Icon.Dispose();
                    _trayIcon.Dispose();
                }
                if (_trayMenu != null) _trayMenu.Dispose();
                if (_fontHeader != null) _fontHeader.Dispose();
                if (_fontCard != null) _fontCard.Dispose();
                if (_fontSmall != null) _fontSmall.Dispose();
                if (_privateFonts != null) _privateFonts.Dispose();
            }
            base.Dispose(disposing);
        }

        public static void SetRunAtSignIn(bool enable, string exePath) {
            try {
                using (RegistryKey rk = Registry.CurrentUser.OpenSubKey(RunRegistryKey, true)) {
                    if (rk != null) {
                        if (enable && !String.IsNullOrEmpty(exePath)) {
                            rk.SetValue(RunValueName, "\"" + exePath + "\"", RegistryValueKind.String);
                        } else {
                            rk.DeleteValue(RunValueName, false);
                        }
                    }
                }
            } catch {
            }
        }

        public static bool IsRunAtSignInEnabled() {
            try {
                using (RegistryKey rk = Registry.CurrentUser.OpenSubKey(RunRegistryKey, false)) {
                    if (rk != null) {
                        object val = rk.GetValue(RunValueName);
                        return val != null && Convert.ToString(val).Length > 0;
                    }
                }
            } catch {
            }
            return false;
        }

        private void ApplyScene(string sceneKey) {
            string norm = (sceneKey ?? "hemp").Trim().ToLowerInvariant();
            _state.Scene = norm;
            _state.Save();

            if (!_selfTestMode) {
                AssetFoundry.ApplyCursorSchemeForScene(norm);
                bool useLight = (norm == "washi" || norm == "hemp");
                BaselineVault.SetWindowsLightTheme(useLight);
                if (_state.BrowserSyncEnabled) {
                    ThreadPool.QueueUserWorkItem(delegate { AssetFoundry.SyncFirefoxCircadianChrome(norm); });
                }
                Icon oldIcon = _trayIcon.Icon;
                _trayIcon.Icon = AssetFoundry.CreateSceneTrayIcon(norm);
                if (oldIcon != null) oldIcon.Dispose();
                AssetFoundry.PlayEarcon(true);
            }

            RefreshDeckVisuals();
        }

        private void ApplyMotorProfile(string profileKey, bool playSound) {
            MotorPreset preset = MotorPreset.FromKey(profileKey);
            _state.MotorProfile = preset.Key;
            _state.Save();

            _shield.BounceThresholdMs = preset.BounceMs;
            if (!_selfTestMode) {
                BaselineVault.ApplyMotorPreset(preset);
                if (playSound) AssetFoundry.PlayEarcon(false);
            }
            RefreshDeckVisuals();
        }

        private void TriggerSafeRestore(string message) {
            _state.MotorProfile = "Paused";
            _state.Save();
            _shield.BounceThresholdMs = 0;

            if (!_selfTestMode) {
                BaselineVault.RestoreFullBaseline();
                AssetFoundry.PlayEarcon(true);
                if (!String.IsNullOrEmpty(message) && _trayIcon.Visible) {
                    _trayIcon.ShowBalloonTip(3500, "PocketGull Safety Latch", message, ToolTipIcon.Info);
                }
            }
            RefreshDeckVisuals();
        }

        private void OnPanicRevertRequested(object sender, EventArgs e) {
            TriggerSafeRestore("Triple-Esc detected: Restored default Windows mouse & cursor settings.");
        }

        private void OnTrayMouseClick(object sender, MouseEventArgs e) {
            if (e.Button == MouseButtons.Left) {
                if (Visible) {
                    HideDeck();
                } else {
                    ShowDeckNearTray();
                }
            }
        }

        private void ShowDeckNearTray() {
            RefreshDeckVisuals();
            Rectangle work = Screen.PrimaryScreen.WorkingArea;
            int x = Math.Max(work.Left + 12, work.Right - Width - 16);
            int y = Math.Max(work.Top + 12, work.Bottom - Height - 16);
            Location = new Point(x, y);
            Show();
            Activate();
            SyncWaveTimer();
        }

        private void HideDeck() {
            _waveTimer.Stop();
            Hide();
        }

        private void SyncWaveTimer() {
            bool allowMotion = !SystemInformation.HighContrast;
            if (Visible && _state.PhilocardiaEnabled && allowMotion && !_selfTestMode) {
                _waveTimer.Start();
            } else {
                _waveTimer.Stop();
                _waveFill.Width = 0;
            }
        }

        private void OnWaveTimerTick(object sender, EventArgs e) {
            // 0.1 Hz Mayer Wave (10,000 ms cycle: 4.0s Inhale -> 6.0s Exhale)
            double phaseMs = (Environment.TickCount & Int32.MaxValue) % 10000;
            double ratio = phaseMs < 4000.0
                ? (phaseMs / 4000.0)
                : (1.0 - ((phaseMs - 4000.0) / 6000.0));
            ratio = Math.Max(0.0, Math.Min(1.0, ratio));
            _waveFill.Width = (int)Math.Round(_waveTrack.Width * ratio);
        }

        private void OnPacerMinuteTick(object sender, EventArgs e) {
            if (!_state.SitStandEnabled) return;
            _pacerPhaseMinutes++;
            int limit = _pacerStandingPhase ? 15 : 45;
            if (_pacerPhaseMinutes >= limit) {
                _pacerPhaseMinutes = 0;
                _pacerStandingPhase = !_pacerStandingPhase;
                AssetFoundry.PlayEarcon(true);
                string cue = _pacerStandingPhase
                    ? "45m seated complete — gentle 15m standing / stretch interval."
                    : "15m standing complete — settle back into a relaxed 45m seated interval.";
                if (_trayIcon.Visible) {
                    _trayIcon.ShowBalloonTip(4000, "PocketGull Posture Pacer", cue, ToolTipIcon.None);
                }
            }
            if (Visible) RefreshDeckVisuals();
        }

        private void RefreshDeckVisuals() {
            string scene = (_state.Scene ?? "hemp").Trim().ToLowerInvariant();
            MotorPreset preset = MotorPreset.FromKey(_state.MotorProfile);
            bool shieldActive = !String.Equals(preset.Key, "Paused", StringComparison.OrdinalIgnoreCase);

            Color bgForm, bgCardOff, bgCardOn, fgPrimary, accent, borderMute;
            if (scene == "scotopic" || scene == "670") {
                bgForm     = Color.FromArgb(20, 6, 7);
                bgCardOff  = Color.FromArgb(32, 10, 12);
                bgCardOn   = Color.FromArgb(56, 14, 16);
                fgPrimary  = Color.FromArgb(252, 165, 165);
                accent     = Color.FromArgb(220, 38, 38);
                borderMute = Color.FromArgb(127, 29, 29);
            } else if (scene == "washi" || scene == "hemp") {
                bgForm     = Color.FromArgb(245, 239, 228);
                bgCardOff  = Color.FromArgb(236, 228, 213);
                bgCardOn   = Color.FromArgb(223, 242, 238);
                fgPrimary  = Color.FromArgb(28, 25, 23);
                accent     = Color.FromArgb(13, 148, 136);
                borderMute = Color.FromArgb(180, 168, 150);
            } else {
                bgForm     = Color.FromArgb(13, 9, 11);
                bgCardOff  = Color.FromArgb(24, 20, 23);
                bgCardOn   = Color.FromArgb(19, 42, 42);
                fgPrimary  = Color.FromArgb(237, 227, 210);
                accent     = Color.FromArgb(45, 212, 191);
                borderMute = Color.FromArgb(63, 63, 70);
            }

            _deckBorderColor = accent;
            BackColor = bgForm;
            _lblHeader.ForeColor = fgPrimary;
            _lblFooter.ForeColor = fgPrimary;

            Button[] hdrButtons = new Button[] { _btnSolar, _btnReset, _btnClose };
            for (int i = 0; i < hdrButtons.Length; i++) {
                hdrButtons[i].BackColor = bgCardOff;
                hdrButtons[i].ForeColor = fgPrimary;
                hdrButtons[i].FlatAppearance.BorderColor = borderMute;
            }

            _waveTrack.BackColor = bgCardOff;
            _waveFill.BackColor = accent;

            string sceneDesc = "🌿 Hemp Sepia\n2700K • 64px Ophthalmic";
            if (scene == "washi") sceneDesc = "☀️ Washi Daylight\n4000K • 64px Ophthalmic";
            else if (scene == "obsidian") sceneDesc = "🌑 Peat Obsidian\nWCAG AAA • 64px Cyan";
            else if (scene == "scotopic" || scene == "670") sceneDesc = "🔴 Scotopic 650nm\nZero Blue • 64px Red";

            StyleCard(_btnSlotScene, "1 • SCENE\n" + sceneDesc, true, bgCardOn, bgCardOff, fgPrimary, accent, borderMute);

            string shieldText = shieldActive
                ? String.Format("2 • MOTOR SHIELD\n⚖️ {0}\n{1}px Drag • {2}ms Bounce",
                    preset.Key.ToUpperInvariant(), preset.DragPx, preset.BounceMs)
                : "2 • MOTOR SHIELD\n⚖️ PAUSED\nWindows 4px Default";
            StyleCard(_btnSlotShield, shieldText, shieldActive, bgCardOn, bgCardOff, fgPrimary, accent, borderMute);

            string philoText = _state.PhilocardiaEnabled
                ? "3 • 0.1 Hz PACER\n🫀 ACTIVE\n4.0s In / 6.0s Out"
                : "3 • 0.1 Hz PACER\n🫀 PAUSED\nTap for Breath Guide";
            StyleCard(_btnSlotPhilo, philoText, _state.PhilocardiaEnabled, bgCardOn, bgCardOff, fgPrimary, accent, borderMute);

            string pacerText = _state.SitStandEnabled
                ? String.Format("4 • SIT-STAND\n⏱️ {0}\nMin {1} of {2}m",
                    _pacerStandingPhase ? "STANDING" : "SEATED", _pacerPhaseMinutes, _pacerStandingPhase ? 15 : 45)
                : "4 • SIT-STAND\n⏱️ OFF\n45m Sit / 15m Stand";
            StyleCard(_btnSlotPacer, pacerText, _state.SitStandEnabled, bgCardOn, bgCardOff, fgPrimary, accent, borderMute);

            if (_miSideChords != null) _miSideChords.Checked = _state.SideChordsEnabled;
            if (_miFirefoxSync != null) _miFirefoxSync.Checked = _state.BrowserSyncEnabled;
            if (_miRunAtLogon != null) _miRunAtLogon.Checked = IsRunAtSignInEnabled();

            Invalidate();
        }

        private ToolStripMenuItem AddActionMenuItem(ContextMenuStrip menu, string text, EventHandler onClick) {
            ToolStripMenuItem item = new ToolStripMenuItem(text);
            item.Click += onClick;
            menu.Items.Add(item);
            return item;
        }

        private ContextMenuStrip BuildTrayContextMenu() {
            ContextMenuStrip menu = new ContextMenuStrip();
            menu.Font = new Font(_fontHeader.FontFamily, 10.25f, FontStyle.Regular);

            AddActionMenuItem(menu, "Open 4-Slot Control Deck", delegate { ShowDeckNearTray(); });
            menu.Items.Add(new ToolStripSeparator());

            AddActionMenuItem(menu, "Motor Profile: Gentle (14px / 55ms)", delegate { ApplyMotorProfile("Gentle", true); });
            AddActionMenuItem(menu, "Motor Profile: Standard Ataxia (18px / 65ms)", delegate { ApplyMotorProfile("Standard", true); });
            AddActionMenuItem(menu, "Motor Profile: High-Tremor (28px / 110ms)", delegate { ApplyMotorProfile("HighTremor", true); });
            AddActionMenuItem(menu, "Pause Motor Shield", delegate { ApplyMotorProfile("Paused", true); });
            menu.Items.Add(new ToolStripSeparator());

            _miSideChords = new ToolStripMenuItem("Mouse Side-Button Chords (Win+H Voice / Sonar)");
            _miSideChords.Checked = _state.SideChordsEnabled;
            _miSideChords.Click += delegate {
                _state.SideChordsEnabled = !_state.SideChordsEnabled;
                _shield.SideChordsEnabled = _state.SideChordsEnabled;
                _state.Save();
                RefreshDeckVisuals();
            };
            menu.Items.Add(_miSideChords);

            _miFirefoxSync = new ToolStripMenuItem("Sync Firefox Circadian Theme (userChrome.css)");
            _miFirefoxSync.Checked = _state.BrowserSyncEnabled;
            _miFirefoxSync.Click += delegate {
                _state.BrowserSyncEnabled = !_state.BrowserSyncEnabled;
                _state.Save();
                if (_state.BrowserSyncEnabled) AssetFoundry.SyncFirefoxCircadianChrome(_state.Scene);
                RefreshDeckVisuals();
            };
            menu.Items.Add(_miFirefoxSync);

            _miRunAtLogon = new ToolStripMenuItem("Start Automatically with Windows");
            _miRunAtLogon.Checked = IsRunAtSignInEnabled();
            _miRunAtLogon.Click += delegate {
                bool next = !IsRunAtSignInEnabled();
                SetRunAtSignIn(next, Application.ExecutablePath);
                RefreshDeckVisuals();
            };
            menu.Items.Add(_miRunAtLogon);

            menu.Items.Add(new ToolStripSeparator());
            AddActionMenuItem(menu, "↩ Restore Original Windows Mouse & Cursors", delegate {
                TriggerSafeRestore("Restored original Windows mouse & cursor defaults.");
            });
            AddActionMenuItem(menu, "Exit Sanctuary", delegate {
                HideDeck();
                Application.Exit();
            });

            return menu;
        }

        private Button CreateHeaderButton(string text, int x, int y, int width) {
            Button btn = new Button();
            btn.Text = text;
            btn.Font = _fontSmall;
            btn.FlatStyle = FlatStyle.Flat;
            btn.FlatAppearance.BorderSize = 1;
            btn.Location = new Point(x, y);
            btn.Size = new Size(width, 34);
            btn.Cursor = Cursors.Hand;
            return btn;
        }

        private Button CreateSlotCard(int x, int y) {
            Button btn = new Button();
            btn.FlatStyle = FlatStyle.Flat;
            btn.FlatAppearance.BorderSize = 2;
            btn.Location = new Point(x, y);
            btn.Size = new Size(208, 104);
            btn.Font = _fontCard;
            btn.TextAlign = ContentAlignment.MiddleLeft;
            btn.Padding = new Padding(12, 6, 10, 6);
            btn.Cursor = Cursors.Hand;
            return btn;
        }

        private static void StyleCard(Button btn, string text, bool active, Color bgOn, Color bgOff, Color fg, Color accent, Color mute) {
            btn.Text = text;
            btn.BackColor = active ? bgOn : bgOff;
            btn.ForeColor = fg;
            btn.FlatAppearance.BorderColor = active ? accent : mute;
        }

        private static FontFamily ResolveUiFontFamily(out PrivateFontCollection privateOut) {
            privateOut = null;
            try {
                using (InstalledFontCollection col = new InstalledFontCollection()) {
                    FontFamily[] fams = col.Families;
                    for (int i = 0; i < fams.Length; i++) {
                        if (String.Equals(fams[i].Name, "Pocket Gull", StringComparison.OrdinalIgnoreCase)) {
                            return new FontFamily(fams[i].Name);
                        }
                    }
                }

                string userFonts = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    @"Microsoft\Windows\Fonts\PocketGull-VF.ttf");
                if (File.Exists(userFonts)) {
                    PrivateFontCollection pfc = new PrivateFontCollection();
                    pfc.AddFontFile(userFonts);
                    if (pfc.Families.Length > 0) {
                        privateOut = pfc;
                        return pfc.Families[0];
                    }
                    pfc.Dispose();
                }
            } catch {
            }
            return new FontFamily("Segoe UI");
        }
    }
}
