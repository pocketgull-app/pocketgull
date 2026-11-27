// SPDX-License-Identifier: Apache-2.0
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;

namespace PocketGull.Sanctuary {
    public sealed class MotorPreset {
        public string Key { get; set; }
        public string Label { get; set; }
        public int DragPx { get; set; }
        public int HoverPx { get; set; }
        public int BounceMs { get; set; }
        public int DoubleClickMs { get; set; }
        public int PointerSpeed { get; set; }

        public static MotorPreset FromKey(string key) {
            string norm = (key ?? "Standard").Trim();
            if (String.Equals(norm, "Gentle", StringComparison.OrdinalIgnoreCase)) {
                return new MotorPreset {
                    Key = "Gentle",
                    Label = "Gentle (14px / 55ms)",
                    DragPx = 14,
                    HoverPx = 12,
                    BounceMs = 55,
                    DoubleClickMs = 650,
                    PointerSpeed = 10
                };
            }
            if (String.Equals(norm, "HighTremor", StringComparison.OrdinalIgnoreCase)) {
                return new MotorPreset {
                    Key = "HighTremor",
                    Label = "High-Tremor (28px / 110ms)",
                    DragPx = 28,
                    HoverPx = 24,
                    BounceMs = 110,
                    DoubleClickMs = 900,
                    PointerSpeed = 8
                };
            }
            if (String.Equals(norm, "Paused", StringComparison.OrdinalIgnoreCase)) {
                return new MotorPreset {
                    Key = "Paused",
                    Label = "Paused (Windows Default)",
                    DragPx = 4,
                    HoverPx = 4,
                    BounceMs = 0,
                    DoubleClickMs = 500,
                    PointerSpeed = 10
                };
            }
            return new MotorPreset {
                Key = "Standard",
                Label = "Standard Ataxia (18px / 65ms)",
                DragPx = 18,
                HoverPx = 16,
                BounceMs = 65,
                DoubleClickMs = 750,
                PointerSpeed = 9
            };
        }

        public static string NextProfileKey(string current) {
            string norm = (current ?? "Standard").Trim();
            if (String.Equals(norm, "Standard", StringComparison.OrdinalIgnoreCase)) return "HighTremor";
            if (String.Equals(norm, "HighTremor", StringComparison.OrdinalIgnoreCase)) return "Gentle";
            if (String.Equals(norm, "Gentle", StringComparison.OrdinalIgnoreCase)) return "Paused";
            return "Standard";
        }
    }

    public sealed class SanctuaryState {
        public string Scene { get; set; }
        public string MotorProfile { get; set; }
        public bool SideChordsEnabled { get; set; }
        public bool PhilocardiaEnabled { get; set; }
        public bool SitStandEnabled { get; set; }
        public bool BrowserSyncEnabled { get; set; }

        public SanctuaryState() {
            Scene = "hemp";
            MotorProfile = "Standard";
            SideChordsEnabled = true;
            PhilocardiaEnabled = false;
            SitStandEnabled = false;
            BrowserSyncEnabled = true;
        }

        public static string GetDataRoot() {
            string local = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string dir = Path.Combine(local, "PocketGull");
            if (!Directory.Exists(dir)) {
                Directory.CreateDirectory(dir);
            }
            return dir;
        }

        public static string GetStatePath() {
            return Path.Combine(GetDataRoot(), "sanctuary-state.json");
        }

        public static SanctuaryState Load() {
            string path = GetStatePath();
            if (File.Exists(path)) {
                try {
                    string raw = File.ReadAllText(path, Encoding.UTF8);
                    JavaScriptSerializer ser = new JavaScriptSerializer();
                    SanctuaryState loaded = ser.Deserialize<SanctuaryState>(raw);
                    if (loaded != null) {
                        if (String.IsNullOrEmpty(loaded.Scene)) loaded.Scene = "hemp";
                        if (String.IsNullOrEmpty(loaded.MotorProfile)) loaded.MotorProfile = "Standard";
                        return loaded;
                    }
                } catch {
                }
            }
            return new SanctuaryState();
        }

        public void Save() {
            try {
                JavaScriptSerializer ser = new JavaScriptSerializer();
                string json = ser.Serialize(this);
                File.WriteAllText(GetStatePath(), json, new UTF8Encoding(false));
            } catch {
            }
        }

        public static string ResolveSolarScene(DateTime now) {
            int minutes = now.Hour * 60 + now.Minute;
            if (minutes >= 480 && minutes < 780) {
                return "washi";     // 08:00 - 12:59 Clean Daylight
            }
            if (minutes >= 780 && minutes < 1170) {
                return "hemp";      // 13:00 - 19:29 Warm Sepia
            }
            return "scotopic";      // 19:30 - 07:59 650nm Scotopic Red
        }

        public static string NextSceneKey(string current) {
            string norm = (current ?? "hemp").Trim().ToLowerInvariant();
            if (norm == "washi") return "hemp";
            if (norm == "hemp") return "obsidian";
            if (norm == "obsidian") return "scotopic";
            return "washi";
        }
    }

    public sealed class BaselineSnapshot {
        public string CapturedAtUtc { get; set; }
        public int MouseSpeed { get; set; }
        public int DoubleClickMs { get; set; }
        public int DragWidth { get; set; }
        public int DragHeight { get; set; }
        public int HoverWidth { get; set; }
        public int HoverHeight { get; set; }
        public bool MouseSonar { get; set; }
        public int AppsUseLightTheme { get; set; }
        public int SystemUsesLightTheme { get; set; }
        public string CursorSchemeName { get; set; }
        public Dictionary<string, string> CursorPaths { get; set; }

        public BaselineSnapshot() {
            MouseSpeed = 10;
            DoubleClickMs = 500;
            DragWidth = 4;
            DragHeight = 4;
            HoverWidth = 4;
            HoverHeight = 4;
            MouseSonar = false;
            AppsUseLightTheme = 1;
            SystemUsesLightTheme = 1;
            CursorSchemeName = "";
            CursorPaths = new Dictionary<string, string>();
        }
    }
}
