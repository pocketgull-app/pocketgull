// SPDX-License-Identifier: Apache-2.0
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Media;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Win32;

namespace PocketGull.Sanctuary {
    public static class AssetFoundry {
        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool DestroyIcon(IntPtr hIcon);

        public static string GetCursorDir() {
            string dir = Path.Combine(SanctuaryState.GetDataRoot(), "Cursors");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return dir;
        }

        public static string GetSoundDir() {
            string dir = Path.Combine(SanctuaryState.GetDataRoot(), "Sounds");
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return dir;
        }

        public static int EnsureCursorsAndEarcons() {
            string cursorDir = GetCursorDir();
            int count = 0;

            Color colObsidian  = Color.FromArgb(255, 9, 9, 11);
            Color colCyan      = Color.FromArgb(255, 45, 212, 191);
            Color colAmber     = Color.FromArgb(255, 245, 158, 11);
            Color colCrimson   = Color.FromArgb(255, 220, 38, 38);
            Color colDeepRed   = Color.FromArgb(255, 127, 29, 29);
            Color colBrightRed = Color.FromArgb(255, 248, 113, 113);

            string pArrowOph   = Path.Combine(cursorDir, "pocketgull_ophthalmic_arrow.cur");
            string pIbeamOph   = Path.Combine(cursorDir, "pocketgull_ophthalmic_ibeam.cur");
            string pHandOph    = Path.Combine(cursorDir, "pocketgull_ophthalmic_hand.cur");
            string pSizeNsOph  = Path.Combine(cursorDir, "pocketgull_ophthalmic_sizens.cur");
            string pSizeWeOph  = Path.Combine(cursorDir, "pocketgull_ophthalmic_sizewe.cur");
            string pCrossOph   = Path.Combine(cursorDir, "pocketgull_precision_cross.cur");
            string pWait       = Path.Combine(cursorDir, "pocketgull_philocardia_wait.cur");

            string pArrowScot  = Path.Combine(cursorDir, "pocketgull_scotopic_arrow.cur");
            string pIbeamScot  = Path.Combine(cursorDir, "pocketgull_scotopic_ibeam.cur");
            string pHandScot   = Path.Combine(cursorDir, "pocketgull_scotopic_hand.cur");
            string pSizeNsScot = Path.Combine(cursorDir, "pocketgull_scotopic_sizens.cur");
            string pSizeWeScot = Path.Combine(cursorDir, "pocketgull_scotopic_sizewe.cur");
            string pCrossScot  = Path.Combine(cursorDir, "pocketgull_scotopic_cross.cur");

            WriteArrowCursor(colObsidian, colCyan, pArrowOph); count++;
            WriteIBeamCursor(colObsidian, colCyan, colAmber, pIbeamOph); count++;
            WriteHandCursor(colObsidian, colCyan, colAmber, pHandOph); count++;
            WriteResizeCursor(true, colObsidian, colCyan, pSizeNsOph); count++;
            WriteResizeCursor(false, colObsidian, colCyan, pSizeWeOph); count++;
            WriteCrossCursor(colObsidian, colCyan, colAmber, pCrossOph); count++;
            WriteWaitCursor(pWait); count++;

            WriteArrowCursor(colCrimson, colDeepRed, pArrowScot); count++;
            WriteIBeamCursor(colDeepRed, colCrimson, colBrightRed, pIbeamScot); count++;
            WriteHandCursor(colDeepRed, colCrimson, colBrightRed, pHandScot); count++;
            WriteResizeCursor(true, colDeepRed, colCrimson, pSizeNsScot); count++;
            WriteResizeCursor(false, colDeepRed, colCrimson, pSizeWeScot); count++;
            WriteCrossCursor(colDeepRed, colCrimson, colCrimson, pCrossScot); count++;

            try {
                using (RegistryKey sk = Registry.CurrentUser.CreateSubKey(@"Control Panel\Cursors\Schemes")) {
                    if (sk != null) {
                        string ophScheme = String.Format("{0},,{1},{1},{2},{3},,,{4},{5},,,,,{6},,",
                            pArrowOph, pWait, pCrossOph, pIbeamOph, pSizeNsOph, pSizeWeOph, pHandOph);
                        string scotScheme = String.Format("{0},,{1},{1},{2},{3},,,{4},{5},,,,,{6},,",
                            pArrowScot, pWait, pCrossScot, pIbeamScot, pSizeNsScot, pSizeWeScot, pHandScot);
                        sk.SetValue("PocketGull Ophthalmic High-Contrast", ophScheme, RegistryValueKind.String);
                        sk.SetValue("PocketGull Scotopic 650nm Red", scotScheme, RegistryValueKind.String);
                    }
                }
            } catch {
            }

            string soundDir = GetSoundDir();
            string toggleWav = Path.Combine(soundDir, "sanctuary_432hz_toggle.wav");
            string sceneWav  = Path.Combine(soundDir, "sanctuary_528hz_scene.wav");
            if (!File.Exists(toggleWav)) WriteHarmonicWav(toggleWav, 432.0, 0.14);
            if (!File.Exists(sceneWav))  WriteHarmonicWav(sceneWav, 528.0, 0.20);

            return count;
        }

        public static void ApplyCursorSchemeForScene(string scene) {
            BaselineVault.EnsureBaselineCaptured();
            string cursorDir = GetCursorDir();
            bool scotopic = String.Equals(scene, "scotopic", StringComparison.OrdinalIgnoreCase) ||
                            String.Equals(scene, "670", StringComparison.OrdinalIgnoreCase);

            try {
                using (RegistryKey ck = Registry.CurrentUser.OpenSubKey(@"Control Panel\Cursors", true)) {
                    if (ck != null) {
                        string waitPath = Path.Combine(cursorDir, "pocketgull_philocardia_wait.cur");
                        if (scotopic) {
                            ck.SetValue(null, "PocketGull Scotopic 650nm Red", RegistryValueKind.String);
                            ck.SetValue("Arrow", Path.Combine(cursorDir, "pocketgull_scotopic_arrow.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("Hand", Path.Combine(cursorDir, "pocketgull_scotopic_hand.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("IBeam", Path.Combine(cursorDir, "pocketgull_scotopic_ibeam.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("Crosshair", Path.Combine(cursorDir, "pocketgull_scotopic_cross.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("Wait", waitPath, RegistryValueKind.ExpandString);
                            ck.SetValue("AppStarting", waitPath, RegistryValueKind.ExpandString);
                            ck.SetValue("SizeNS", Path.Combine(cursorDir, "pocketgull_scotopic_sizens.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("SizeWE", Path.Combine(cursorDir, "pocketgull_scotopic_sizewe.cur"), RegistryValueKind.ExpandString);
                        } else {
                            ck.SetValue(null, "PocketGull Ophthalmic High-Contrast", RegistryValueKind.String);
                            ck.SetValue("Arrow", Path.Combine(cursorDir, "pocketgull_ophthalmic_arrow.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("Hand", Path.Combine(cursorDir, "pocketgull_ophthalmic_hand.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("IBeam", Path.Combine(cursorDir, "pocketgull_ophthalmic_ibeam.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("Crosshair", Path.Combine(cursorDir, "pocketgull_precision_cross.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("Wait", waitPath, RegistryValueKind.ExpandString);
                            ck.SetValue("AppStarting", waitPath, RegistryValueKind.ExpandString);
                            ck.SetValue("SizeNS", Path.Combine(cursorDir, "pocketgull_ophthalmic_sizens.cur"), RegistryValueKind.ExpandString);
                            ck.SetValue("SizeWE", Path.Combine(cursorDir, "pocketgull_ophthalmic_sizewe.cur"), RegistryValueKind.ExpandString);
                        }
                    }
                }
            } catch {
            }

            BaselineVault.RefreshSystemCursors();
        }

        public static void PlayEarcon(bool isScene) {
            try {
                string file = isScene ? "sanctuary_528hz_scene.wav" : "sanctuary_432hz_toggle.wav";
                string path = Path.Combine(GetSoundDir(), file);
                if (File.Exists(path)) {
                    using (SoundPlayer sp = new SoundPlayer(path)) {
                        sp.Play();
                    }
                }
            } catch {
            }
        }

        public static Icon CreateSceneTrayIcon(string scene) {
            string norm = (scene ?? "hemp").Trim().ToLowerInvariant();
            Color bg = Color.FromArgb(255, 13, 9, 11);
            Color ring = Color.FromArgb(255, 45, 212, 191);
            if (norm == "scotopic" || norm == "670") {
                bg = Color.FromArgb(255, 20, 4, 4);
                ring = Color.FromArgb(255, 220, 38, 38);
            } else if (norm == "washi" || norm == "hemp") {
                bg = Color.FromArgb(255, 242, 236, 224);
                ring = Color.FromArgb(255, 13, 148, 136);
            }

            using (Bitmap bmp = new Bitmap(32, 32)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    using (SolidBrush bBg = new SolidBrush(bg)) {
                        g.FillEllipse(bBg, 2, 2, 28, 28);
                    }
                    using (Pen pRing = new Pen(ring, 3.0f)) {
                        g.DrawEllipse(pRing, 3, 3, 26, 26);
                    }
                    using (SolidBrush bCore = new SolidBrush(ring)) {
                        g.FillEllipse(bCore, 11, 11, 10, 10);
                    }
                }
                IntPtr hIcon = bmp.GetHicon();
                try {
                    using (Icon temp = Icon.FromHandle(hIcon)) {
                        return (Icon)temp.Clone();
                    }
                } finally {
                    DestroyIcon(hIcon);
                }
            }
        }

        public static void SyncFirefoxCircadianChrome(string scene) {
            string norm = (scene ?? "hemp").Trim().ToLowerInvariant();
            string frame = "#e2dccf";
            string toolbar = "#f2efe6";
            string text = "#2c3529";
            string accent = "#15803d";
            string border = "#d8d3c3";

            if (norm == "washi") {
                frame = "#f0ebe1"; toolbar = "#faf8f0"; text = "#18181b"; accent = "#0f766e"; border = "#e5dfd3";
            } else if (norm == "obsidian") {
                frame = "#09090b"; toolbar = "#121215"; text = "#e4e4e7"; accent = "#14b8a6"; border = "#27272a";
            } else if (norm == "scotopic" || norm == "670") {
                frame = "#050000"; toolbar = "#0e0202"; text = "#ff6655"; accent = "#ff2211"; border = "#3d0a0a";
            }

            string userChrome = String.Format(
                "/* PocketGull Ataxia Sanctuary ({0}) */\r\n" +
                ":root, #main-window {{\r\n" +
                "  --lwt-accent-color: {1} !important;\r\n" +
                "  --toolbar-bgcolor: {2} !important;\r\n" +
                "  --toolbar-color: {3} !important;\r\n" +
                "  --toolbar-field-background-color: {1} !important;\r\n" +
                "  --toolbar-field-color: {3} !important;\r\n" +
                "  --tab-selected-bgcolor: {2} !important;\r\n" +
                "  --tab-selected-textcolor: {3} !important;\r\n" +
                "  --tab-line-color: {4} !important;\r\n" +
                "  --toolbarbutton-icon-fill: {4} !important;\r\n" +
                "}}\r\n" +
                "#navigator-toolbox {{ background-color: {1} !important; border-bottom-color: {5} !important; }}\r\n" +
                "#nav-bar, #PersonalToolbar {{ background-color: {2} !important; color: {3} !important; }}",
                norm, frame, toolbar, text, accent, border);

            string userContent = String.Format(
                "/* PocketGull Ataxia Sanctuary ({0}) */\r\n" +
                "@-moz-document url(\"about:home\"), url(\"about:newtab\"), url(\"about:blank\") {{\r\n" +
                "  :root, body {{\r\n" +
                "    --newtab-background-color: {1} !important;\r\n" +
                "    --newtab-text-primary-color: {2} !important;\r\n" +
                "    background-color: {1} !important;\r\n" +
                "    color: {2} !important;\r\n" +
                "  }}\r\n" +
                "}}",
                norm, frame, text);

            foreach (string profileDir in DiscoverFirefoxProfiles()) {
                try {
                    UpsertManagedCssBlock(Path.Combine(profileDir, @"chrome\userChrome.css"), userChrome);
                    UpsertManagedCssBlock(Path.Combine(profileDir, @"chrome\userContent.css"), userContent);
                    EnsureFirefoxUserJsPref(profileDir);
                } catch {
                }
            }
        }

        private static List<string> DiscoverFirefoxProfiles() {
            List<string> results = new List<string>();
            try {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string stdProfiles = Path.Combine(appData, @"Mozilla\Firefox\Profiles");
                if (Directory.Exists(stdProfiles)) {
                    foreach (string dir in Directory.GetDirectories(stdProfiles, "*.default*")) {
                        results.Add(dir);
                    }
                }

                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string pkgsRoot = Path.Combine(localAppData, "Packages");
                if (Directory.Exists(pkgsRoot)) {
                    foreach (string pkg in Directory.GetDirectories(pkgsRoot, "Mozilla.Firefox_*")) {
                        string storeProfiles = Path.Combine(pkg, @"LocalCache\Roaming\Mozilla\Firefox\Profiles");
                        if (Directory.Exists(storeProfiles)) {
                            foreach (string dir in Directory.GetDirectories(storeProfiles, "*.default*")) {
                                results.Add(dir);
                            }
                        }
                    }
                }
            } catch {
            }
            return results;
        }

        private static void UpsertManagedCssBlock(string filePath, string body) {
            const string startTag = "/* BEGIN POCKETGULL CIRCADIAN THEME */";
            const string endTag   = "/* END POCKETGULL CIRCADIAN THEME */";
            string wrapped = startTag + "\r\n" + body.Trim() + "\r\n" + endTag + "\r\n";

            string dir = Path.GetDirectoryName(filePath);
            if (!String.IsNullOrEmpty(dir) && !Directory.Exists(dir)) {
                Directory.CreateDirectory(dir);
            }

            UTF8Encoding utf8NoBom = new UTF8Encoding(false);
            if (File.Exists(filePath)) {
                string existing = File.ReadAllText(filePath, utf8NoBom);
                string pattern = "(?s)" + Regex.Escape(startTag) + ".*?" + Regex.Escape(endTag) + @"\r?\n?";
                string updated;
                if (Regex.IsMatch(existing, pattern)) {
                    updated = Regex.Replace(existing, pattern, wrapped);
                } else {
                    string trimmed = existing.TrimEnd();
                    updated = trimmed.Length == 0 ? wrapped : trimmed + "\r\n\r\n" + wrapped;
                }
                File.WriteAllText(filePath, updated, utf8NoBom);
            } else {
                File.WriteAllText(filePath, wrapped, utf8NoBom);
            }
        }

        private static void EnsureFirefoxUserJsPref(string profileDir) {
            string userJs = Path.Combine(profileDir, "user.js");
            const string prefName = "toolkit.legacyUserProfileCustomizations.stylesheets";
            const string prefLine = "user_pref(\"toolkit.legacyUserProfileCustomizations.stylesheets\", true);";
            UTF8Encoding utf8NoBom = new UTF8Encoding(false);

            if (File.Exists(userJs)) {
                string existing = File.ReadAllText(userJs, utf8NoBom);
                string pattern = @"(?m)^\s*user_pref\(\s*[""']" + Regex.Escape(prefName) + @"[""']\s*,.*?\);\s*$";
                string updated;
                if (Regex.IsMatch(existing, pattern)) {
                    updated = Regex.Replace(existing, pattern, prefLine);
                } else {
                    string trimmed = existing.TrimEnd();
                    updated = trimmed.Length == 0 ? prefLine + "\r\n" : trimmed + "\r\n" + prefLine + "\r\n";
                }
                File.WriteAllText(userJs, updated, utf8NoBom);
            } else {
                File.WriteAllText(userJs, "// PocketGull Ataxia Sanctuary\r\n" + prefLine + "\r\n", utf8NoBom);
            }
        }

        private static void WriteArrowCursor(Color fill, Color stroke, string path) {
            Point[] pts = new Point[] {
                new Point(6, 6), new Point(6, 48), new Point(18, 38),
                new Point(28, 58), new Point(36, 54), new Point(26, 34), new Point(40, 34)
            };
            using (Bitmap bmp = new Bitmap(64, 64)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    using (SolidBrush b = new SolidBrush(fill)) g.FillPolygon(b, pts);
                    using (Pen p = new Pen(stroke, 3.0f)) {
                        p.LineJoin = LineJoin.Round;
                        g.DrawPolygon(p, pts);
                    }
                }
                SaveCurDib(bmp, 6, 6, path);
            }
        }

        private static void WriteIBeamCursor(Color outline, Color core, Color pip, string path) {
            using (Bitmap bmp = new Bitmap(64, 64)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    using (Pen pOut = new Pen(outline, 5.0f))
                    using (Pen pIn = new Pen(core, 2.5f)) {
                        g.DrawLine(pOut, 20, 10, 44, 10); g.DrawLine(pIn, 20, 10, 44, 10);
                        g.DrawLine(pOut, 20, 54, 44, 54); g.DrawLine(pIn, 20, 54, 44, 54);
                        g.DrawLine(pOut, 32, 10, 32, 54); g.DrawLine(pIn, 32, 10, 32, 54);
                    }
                    using (SolidBrush bPip = new SolidBrush(pip)) g.FillEllipse(bPip, 29, 29, 6, 6);
                }
                SaveCurDib(bmp, 32, 32, path);
            }
        }

        private static void WriteHandCursor(Color fill, Color stroke, Color pip, string path) {
            Point[] pts = new Point[] {
                new Point(18, 12), new Point(22, 8), new Point(26, 12), new Point(26, 26),
                new Point(44, 28), new Point(48, 33), new Point(46, 52), new Point(38, 58),
                new Point(20, 58), new Point(14, 48), new Point(8, 36), new Point(12, 32), new Point(18, 37)
            };
            using (Bitmap bmp = new Bitmap(64, 64)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    using (SolidBrush b = new SolidBrush(fill)) g.FillPolygon(b, pts);
                    using (Pen p = new Pen(stroke, 3.0f)) {
                        p.LineJoin = LineJoin.Round;
                        g.DrawPolygon(p, pts);
                    }
                    using (SolidBrush bPip = new SolidBrush(pip)) g.FillEllipse(bPip, 19, 9, 6, 6);
                }
                SaveCurDib(bmp, 22, 10, path);
            }
        }

        private static void WriteResizeCursor(bool vertical, Color fill, Color stroke, string path) {
            Point[] pts = vertical
                ? new Point[] {
                    new Point(32, 6), new Point(44, 20), new Point(36, 20), new Point(36, 44), new Point(44, 44),
                    new Point(32, 58), new Point(20, 44), new Point(28, 44), new Point(28, 20), new Point(20, 20)
                }
                : new Point[] {
                    new Point(6, 32), new Point(20, 20), new Point(20, 28), new Point(44, 28), new Point(44, 20),
                    new Point(58, 32), new Point(44, 44), new Point(44, 36), new Point(20, 36), new Point(20, 44)
                };
            using (Bitmap bmp = new Bitmap(64, 64)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    using (SolidBrush b = new SolidBrush(fill)) g.FillPolygon(b, pts);
                    using (Pen p = new Pen(stroke, 2.5f)) {
                        p.LineJoin = LineJoin.Round;
                        g.DrawPolygon(p, pts);
                    }
                }
                SaveCurDib(bmp, 32, 32, path);
            }
        }

        private static void WriteCrossCursor(Color border, Color core, Color ring, string path) {
            using (Bitmap bmp = new Bitmap(64, 64)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    using (Pen pBorder = new Pen(border, 4.0f))
                    using (Pen pCore = new Pen(core, 1.5f))
                    using (Pen pRing = new Pen(ring, 1.5f)) {
                        g.DrawEllipse(pBorder, 20, 20, 24, 24);
                        g.DrawEllipse(pRing, 20, 20, 24, 24);
                        g.DrawLine(pBorder, 32, 6, 32, 22);  g.DrawLine(pCore, 32, 6, 32, 22);
                        g.DrawLine(pBorder, 32, 42, 32, 58); g.DrawLine(pCore, 32, 42, 32, 58);
                        g.DrawLine(pBorder, 6, 32, 22, 32);  g.DrawLine(pCore, 6, 32, 22, 32);
                        g.DrawLine(pBorder, 42, 32, 58, 32); g.DrawLine(pCore, 42, 32, 58, 32);
                    }
                }
                SaveCurDib(bmp, 32, 32, path);
            }
        }

        private static void WriteWaitCursor(string path) {
            using (Bitmap bmp = new Bitmap(64, 64)) {
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.SmoothingMode = SmoothingMode.AntiAlias;
                    using (SolidBrush bFill = new SolidBrush(Color.FromArgb(200, 9, 9, 11)))
                    using (Pen pOuter = new Pen(Color.FromArgb(255, 194, 65, 12), 2.0f))
                    using (Pen pInner = new Pen(Color.FromArgb(255, 244, 63, 94), 3.0f)) {
                        g.FillEllipse(bFill, 16, 16, 32, 32);
                        g.DrawEllipse(pOuter, 16, 16, 32, 32);
                        g.DrawEllipse(pInner, 22, 22, 20, 20);
                    }
                }
                SaveCurDib(bmp, 32, 32, path);
            }
        }

        private static void SaveCurDib(Bitmap bmp, int hotspotX, int hotspotY, string outputPath) {
            int w = bmp.Width;
            int h = bmp.Height;
            int xorSize = w * h * 4;
            int andStride = ((w + 31) / 32) * 4;
            int andSize = andStride * h;
            int imgSize = 40 + xorSize + andSize;

            using (MemoryStream ms = new MemoryStream(22 + imgSize))
            using (BinaryWriter bw = new BinaryWriter(ms)) {
                bw.Write((ushort)0);
                bw.Write((ushort)2);
                bw.Write((ushort)1);

                bw.Write((byte)(w & 0xFF));
                bw.Write((byte)(h & 0xFF));
                bw.Write((byte)0);
                bw.Write((byte)0);
                bw.Write((ushort)hotspotX);
                bw.Write((ushort)hotspotY);
                bw.Write((uint)imgSize);
                bw.Write((uint)22);

                bw.Write((uint)40);
                bw.Write((int)w);
                bw.Write((int)(h * 2));
                bw.Write((ushort)1);
                bw.Write((ushort)32);
                bw.Write((uint)0);
                bw.Write((uint)(xorSize + andSize));
                bw.Write((int)0);
                bw.Write((int)0);
                bw.Write((uint)0);
                bw.Write((uint)0);

                for (int y = h - 1; y >= 0; y--) {
                    for (int x = 0; x < w; x++) {
                        Color c = bmp.GetPixel(x, y);
                        bw.Write(c.B);
                        bw.Write(c.G);
                        bw.Write(c.R);
                        bw.Write(c.A);
                    }
                }
                for (int i = 0; i < andSize; i++) {
                    bw.Write((byte)0);
                }
                bw.Flush();
                File.WriteAllBytes(outputPath, ms.ToArray());
            }
        }

        private static void WriteHarmonicWav(string outputPath, double freqHz, double durationSec) {
            const int sampleRate = 44100;
            int totalSamples = (int)(sampleRate * durationSec);
            int dataBytes = totalSamples * 2;

            using (MemoryStream ms = new MemoryStream(44 + dataBytes))
            using (BinaryWriter bw = new BinaryWriter(ms)) {
                bw.Write(Encoding.ASCII.GetBytes("RIFF"));
                bw.Write((uint)(36 + dataBytes));
                bw.Write(Encoding.ASCII.GetBytes("WAVE"));
                bw.Write(Encoding.ASCII.GetBytes("fmt "));
                bw.Write((uint)16);
                bw.Write((ushort)1);
                bw.Write((ushort)1);
                bw.Write((uint)sampleRate);
                bw.Write((uint)(sampleRate * 2));
                bw.Write((ushort)2);
                bw.Write((ushort)16);
                bw.Write(Encoding.ASCII.GetBytes("data"));
                bw.Write((uint)dataBytes);

                int fadeInSamples = Math.Max(1, sampleRate / 100); // 10ms soft attack
                for (int i = 0; i < totalSamples; i++) {
                    double t = (double)i / sampleRate;
                    double attack = i < fadeInSamples ? (double)i / fadeInSamples : 1.0;
                    double decay = Math.Exp(-9.0 * t / durationSec);
                    double sample = Math.Sin(2.0 * Math.PI * freqHz * t) * 0.14 * attack * decay;
                    short pcm = (short)Math.Max(-32767.0, Math.Min(32767.0, sample * 32767.0));
                    bw.Write(pcm);
                }
                bw.Flush();
                File.WriteAllBytes(outputPath, ms.ToArray());
            }
        }
    }
}
