// SPDX-License-Identifier: Apache-2.0
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;
using System.Windows.Forms;

namespace PocketGull.Sanctuary {
    internal static class Program {
        private const string MutexName     = @"Local\PocketGull_AtaxiaSanctuary_Mutex";
        private const string ShowEventName = @"Local\PocketGull_AtaxiaSanctuary_ShowEvent";

        [STAThread]
        private static int Main(string[] args) {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            if (HasArg(args, "--selftest")) {
                return RunSelfTest();
            }

            if (HasArg(args, "--restore")) {
                BaselineVault.RestoreFullBaseline();
                Console.WriteLine("SANCTUARY_RESTORE=OK");
                return 0;
            }

            if (HasArg(args, "--uninstall")) {
                return RunUninstall();
            }

            if (HasArg(args, "--install")) {
                return RunInstall();
            }

            EventWaitHandle showEvent = new EventWaitHandle(false, EventResetMode.AutoReset, ShowEventName);
            bool createdNew = false;
            using (Mutex singleMutex = new Mutex(true, MutexName, out createdNew)) {
                if (!createdNew) {
                    showEvent.Set();
                    return 0;
                }

                using (ControlDeckForm form = new ControlDeckForm(false, showEvent)) {
                    Application.Run(form);
                }
            }
            return 0;
        }

        private static bool HasArg(string[] args, string flag) {
            if (args == null) return false;
            for (int i = 0; i < args.Length; i++) {
                if (String.Equals(args[i], flag, StringComparison.OrdinalIgnoreCase)) {
                    return true;
                }
            }
            return false;
        }

        private static int RunSelfTest() {
            bool hookOk = InputShieldEngine.SelfTest();
            int cursorsBuilt = AssetFoundry.EnsureCursorsAndEarcons();
            BaselineSnapshot snap = BaselineVault.CaptureCurrentSnapshot();

            string uiFont = "";
            using (ControlDeckForm form = new ControlDeckForm(true, null)) {
                uiFont = form.UiFontName;
            }

            bool pass = hookOk && cursorsBuilt == 13 && snap != null && snap.MouseSpeed >= 1;
            Console.WriteLine(String.Format(
                "SANCTUARY_SELFTEST={0} CURSORS={1} HOOK_ABI={2} FONT={3}",
                pass ? "PASS" : "FAIL",
                cursorsBuilt,
                hookOk,
                uiFont));
            return pass ? 0 : 1;
        }

        private static int RunInstall() {
            string installDir = Path.Combine(SanctuaryState.GetDataRoot(), "Sanctuary");
            if (!Directory.Exists(installDir)) Directory.CreateDirectory(installDir);

            string currentExe = Application.ExecutablePath;
            string targetExe = Path.Combine(installDir, "PocketGullSanctuary.exe");

            if (!String.Equals(Path.GetFullPath(currentExe), Path.GetFullPath(targetExe), StringComparison.OrdinalIgnoreCase)) {
                StopOtherInstances();
                File.Copy(currentExe, targetExe, true);
            }

            BaselineVault.EnsureBaselineCaptured();
            AssetFoundry.EnsureCursorsAndEarcons();
            ControlDeckForm.SetRunAtSignIn(true, targetExe);

            ProcessStartInfo psi = new ProcessStartInfo(targetExe);
            psi.WorkingDirectory = installDir;
            psi.UseShellExecute = false;
            Process.Start(psi);

            Console.WriteLine("SANCTUARY_INSTALL=OK PATH=" + targetExe);
            return 0;
        }

        private static int RunUninstall() {
            StopOtherInstances();
            ControlDeckForm.SetRunAtSignIn(false, null);
            BaselineVault.RestoreFullBaseline();
            Console.WriteLine("SANCTUARY_UNINSTALL=OK");
            return 0;
        }

        private static void StopOtherInstances() {
            int selfPid = Process.GetCurrentProcess().Id;
            Process[] procs = Process.GetProcessesByName("PocketGullSanctuary");
            for (int i = 0; i < procs.Length; i++) {
                try {
                    if (procs[i].Id != selfPid) {
                        procs[i].Kill();
                        procs[i].WaitForExit(1500);
                    }
                } catch {
                } finally {
                    procs[i].Dispose();
                }
            }
        }
    }
}
