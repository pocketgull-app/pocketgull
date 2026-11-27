// SPDX-License-Identifier: Apache-2.0
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Web.Script.Serialization;
using Microsoft.Win32;

namespace PocketGull.Sanctuary {
    public static class BaselineVault {
        private const uint SPI_SETDRAGWIDTH        = 0x004C;
        private const uint SPI_SETDRAGHEIGHT       = 0x004D;
        private const uint SPI_SETCURSORS          = 0x0057;
        private const uint SPI_GETMOUSEHOVERWIDTH  = 0x0062;
        private const uint SPI_SETMOUSEHOVERWIDTH  = 0x0063;
        private const uint SPI_GETMOUSEHOVERHEIGHT = 0x0064;
        private const uint SPI_SETMOUSEHOVERHEIGHT = 0x0065;
        private const uint SPI_GETMOUSESPEED       = 0x0070;
        private const uint SPI_SETMOUSESPEED       = 0x0071;
        private const uint SPI_GETMOUSESONAR       = 0x101C;
        private const uint SPI_SETMOUSESONAR       = 0x101D;

        private const int SM_CXDRAG = 68;
        private const int SM_CYDRAG = 69;

        private const uint SPIF_UPDATEINIFILE = 0x01;
        private const uint SPIF_SENDCHANGE    = 0x02;
        private const uint SPI_FLAGS          = SPIF_UPDATEINIFILE | SPIF_SENDCHANGE;

        private static readonly string[] CursorRoleNames = new string[] {
            "Arrow", "Help", "AppStarting", "Wait", "Crosshair", "IBeam",
            "NWPen", "No", "SizeNS", "SizeWE", "SizeNWSE", "SizeNESW",
            "SizeAll", "UpArrow", "Hand"
        };

        [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
        private static extern bool SpiGetInt(uint uiAction, uint uiParam, ref int pvParam, uint fWinIni);

        [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
        private static extern bool SpiGetBool(uint uiAction, uint uiParam, ref bool pvParam, uint fWinIni);

        [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
        private static extern bool SpiSetBool(uint uiAction, uint uiParam, bool pvParam, uint fWinIni);

        [DllImport("user32.dll", EntryPoint = "SystemParametersInfo", SetLastError = true)]
        private static extern bool SpiSetPtr(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern uint GetDoubleClickTime();

        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool SetDoubleClickTime(uint uInterval);

        [DllImport("user32.dll")]
        public static extern int GetSystemMetrics(int nIndex);

        public static string GetBackupPath() {
            return Path.Combine(SanctuaryState.GetDataRoot(), "baseline-backup.json");
        }

        public static BaselineSnapshot CaptureCurrentSnapshot() {
            BaselineSnapshot snap = new BaselineSnapshot();
            snap.CapturedAtUtc = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture);

            int speed = 10;
            SpiGetInt(SPI_GETMOUSESPEED, 0, ref speed, 0);
            snap.MouseSpeed = (speed >= 1 && speed <= 20) ? speed : 10;

            uint dc = GetDoubleClickTime();
            snap.DoubleClickMs = (dc >= 100 && dc <= 5000) ? (int)dc : 500;

            int dragW = GetSystemMetrics(SM_CXDRAG);
            int dragH = GetSystemMetrics(SM_CYDRAG);
            snap.DragWidth = dragW > 0 ? dragW : 4;
            snap.DragHeight = dragH > 0 ? dragH : 4;

            int hoverW = 4;
            int hoverH = 4;
            SpiGetInt(SPI_GETMOUSEHOVERWIDTH, 0, ref hoverW, 0);
            SpiGetInt(SPI_GETMOUSEHOVERHEIGHT, 0, ref hoverH, 0);
            snap.HoverWidth = hoverW > 0 ? hoverW : 4;
            snap.HoverHeight = hoverH > 0 ? hoverH : 4;

            bool sonar = false;
            SpiGetBool(SPI_GETMOUSESONAR, 0, ref sonar, 0);
            snap.MouseSonar = sonar;

            try {
                using (RegistryKey pk = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize", false)) {
                    if (pk != null) {
                        object appsVal = pk.GetValue("AppsUseLightTheme");
                        object sysVal = pk.GetValue("SystemUsesLightTheme");
                        if (appsVal is int) snap.AppsUseLightTheme = (int)appsVal;
                        if (sysVal is int) snap.SystemUsesLightTheme = (int)sysVal;
                    }
                }
            } catch {
            }

            try {
                using (RegistryKey ck = Registry.CurrentUser.OpenSubKey(@"Control Panel\Cursors", false)) {
                    if (ck != null) {
                        snap.CursorSchemeName = Convert.ToString(ck.GetValue(null) ?? "", CultureInfo.InvariantCulture);
                        foreach (string role in CursorRoleNames) {
                            string val = Convert.ToString(ck.GetValue(role) ?? "", CultureInfo.InvariantCulture);
                            snap.CursorPaths[role] = val;
                        }
                    }
                }
            } catch {
            }

            return snap;
        }

        public static BaselineSnapshot EnsureBaselineCaptured() {
            string path = GetBackupPath();
            if (File.Exists(path)) {
                try {
                    string raw = File.ReadAllText(path, Encoding.UTF8);
                    JavaScriptSerializer ser = new JavaScriptSerializer();
                    BaselineSnapshot existing = ser.Deserialize<BaselineSnapshot>(raw);
                    if (existing != null) {
                        return existing;
                    }
                } catch {
                }
            }

            BaselineSnapshot fresh = CaptureCurrentSnapshot();
            try {
                // Avoid freezing a PocketGull cursor scheme as the user's "original" cursor if already active
                if (fresh.CursorSchemeName != null && fresh.CursorSchemeName.IndexOf("PocketGull", StringComparison.OrdinalIgnoreCase) >= 0) {
                    fresh.CursorSchemeName = "Windows Default";
                    fresh.CursorPaths.Clear();
                    foreach (string role in CursorRoleNames) {
                        fresh.CursorPaths[role] = "";
                    }
                    fresh.DragWidth = 4;
                    fresh.DragHeight = 4;
                    fresh.HoverWidth = 4;
                    fresh.HoverHeight = 4;
                    fresh.DoubleClickMs = 500;
                    fresh.MouseSpeed = 10;
                }

                JavaScriptSerializer ser = new JavaScriptSerializer();
                File.WriteAllText(path, ser.Serialize(fresh), new UTF8Encoding(false));
            } catch {
            }
            return fresh;
        }

        public static void ApplyMotorPreset(MotorPreset preset) {
            if (preset == null) return;
            EnsureBaselineCaptured();

            if (String.Equals(preset.Key, "Paused", StringComparison.OrdinalIgnoreCase)) {
                RestoreMotorOnly();
                return;
            }

            SpiSetPtr(SPI_SETMOUSESPEED, 0, (IntPtr)preset.PointerSpeed, SPI_FLAGS);
            SetDoubleClickTime((uint)preset.DoubleClickMs);
            SpiSetPtr(SPI_SETDRAGWIDTH, (uint)preset.DragPx, IntPtr.Zero, SPI_FLAGS);
            SpiSetPtr(SPI_SETDRAGHEIGHT, (uint)preset.DragPx, IntPtr.Zero, SPI_FLAGS);
            SpiSetPtr(SPI_SETMOUSEHOVERWIDTH, (uint)preset.HoverPx, IntPtr.Zero, SPI_FLAGS);
            SpiSetPtr(SPI_SETMOUSEHOVERHEIGHT, (uint)preset.HoverPx, IntPtr.Zero, SPI_FLAGS);
            SpiSetBool(SPI_SETMOUSESONAR, 0, true, SPI_FLAGS);

            WriteMouseRegistryMetrics(preset.DoubleClickMs, preset.DragPx, preset.DragPx, preset.HoverPx, preset.HoverPx);
        }

        public static void RestoreMotorOnly() {
            BaselineSnapshot snap = EnsureBaselineCaptured();
            SpiSetPtr(SPI_SETMOUSESPEED, 0, (IntPtr)snap.MouseSpeed, SPI_FLAGS);
            SetDoubleClickTime((uint)snap.DoubleClickMs);
            SpiSetPtr(SPI_SETDRAGWIDTH, (uint)snap.DragWidth, IntPtr.Zero, SPI_FLAGS);
            SpiSetPtr(SPI_SETDRAGHEIGHT, (uint)snap.DragHeight, IntPtr.Zero, SPI_FLAGS);
            SpiSetPtr(SPI_SETMOUSEHOVERWIDTH, (uint)snap.HoverWidth, IntPtr.Zero, SPI_FLAGS);
            SpiSetPtr(SPI_SETMOUSEHOVERHEIGHT, (uint)snap.HoverHeight, IntPtr.Zero, SPI_FLAGS);
            SpiSetBool(SPI_SETMOUSESONAR, 0, snap.MouseSonar, SPI_FLAGS);

            WriteMouseRegistryMetrics(snap.DoubleClickMs, snap.DragWidth, snap.DragHeight, snap.HoverWidth, snap.HoverHeight);
        }

        public static void RestoreFullBaseline() {
            BaselineSnapshot snap = EnsureBaselineCaptured();
            RestoreMotorOnly();

            try {
                using (RegistryKey ck = Registry.CurrentUser.OpenSubKey(@"Control Panel\Cursors", true)) {
                    if (ck != null) {
                        ck.SetValue(null, snap.CursorSchemeName ?? "", RegistryValueKind.String);
                        foreach (string role in CursorRoleNames) {
                            string val = "";
                            if (snap.CursorPaths != null && snap.CursorPaths.ContainsKey(role)) {
                                val = snap.CursorPaths[role] ?? "";
                            }
                            ck.SetValue(role, val, RegistryValueKind.ExpandString);
                        }
                    }
                }
            } catch {
            }

            RefreshSystemCursors();
            SetWindowsLightTheme(snap.AppsUseLightTheme != 0);
        }

        public static void RefreshSystemCursors() {
            SpiSetPtr(SPI_SETCURSORS, 0, IntPtr.Zero, SPI_FLAGS);
        }

        public static void SetWindowsLightTheme(bool useLight) {
            try {
                using (RegistryKey pk = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize")) {
                    if (pk != null) {
                        int flag = useLight ? 1 : 0;
                        pk.SetValue("AppsUseLightTheme", flag, RegistryValueKind.DWord);
                        pk.SetValue("SystemUsesLightTheme", flag, RegistryValueKind.DWord);
                    }
                }
            } catch {
            }
        }

        private static void WriteMouseRegistryMetrics(int doubleClickMs, int dragW, int dragH, int hoverW, int hoverH) {
            try {
                using (RegistryKey mk = Registry.CurrentUser.OpenSubKey(@"Control Panel\Mouse", true)) {
                    if (mk != null) {
                        mk.SetValue("DoubleClickSpeed", doubleClickMs.ToString(CultureInfo.InvariantCulture), RegistryValueKind.String);
                        mk.SetValue("DragWidth", dragW.ToString(CultureInfo.InvariantCulture), RegistryValueKind.String);
                        mk.SetValue("DragHeight", dragH.ToString(CultureInfo.InvariantCulture), RegistryValueKind.String);
                        mk.SetValue("MouseHoverWidth", hoverW.ToString(CultureInfo.InvariantCulture), RegistryValueKind.String);
                        mk.SetValue("MouseHoverHeight", hoverH.ToString(CultureInfo.InvariantCulture), RegistryValueKind.String);
                    }
                }
            } catch {
            }
        }
    }
}
