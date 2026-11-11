// SPDX-License-Identifier: Apache-2.0
using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace PocketGull {
    public static class MouseAssist {
        private const int WH_MOUSE_LL = 14;
        private const int WM_LBUTTONDOWN = 0x0201;
        private const int WM_LBUTTONUP = 0x0202;
        private const int WM_RBUTTONDOWN = 0x0204;
        private const int WM_RBUTTONUP = 0x0205;
        private const int WM_XBUTTONDOWN = 0x020B;
        private const int WM_XBUTTONUP = 0x020C;

        private const int XBUTTON1 = 0x0001;
        private const int XBUTTON2 = 0x0002;
        private const uint LLMHF_INJECTED = 0x00000001;

        private const uint INPUT_KEYBOARD = 1;
        private const uint KEYEVENTF_KEYUP = 0x0002;
        private const ushort VK_LWIN = 0x5B;
        private const ushort VK_LSHIFT = 0xA0;
        private const ushort VK_LCONTROL = 0xA2;
        private const ushort VK_D = 0x44;

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelMouseProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        private const int ERROR_ALREADY_EXISTS = 183;

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CreateMutex(IntPtr lpMutexAttributes, bool bInitialOwner, string lpName);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CloseHandle(IntPtr hObject);

        [DllImport("kernel32.dll")]
        private static extern ulong GetTickCount64();

        [DllImport("user32.dll", SetLastError = true)]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        private delegate IntPtr LowLevelMouseProc(int nCode, IntPtr wParam, IntPtr lParam);
        private static readonly LowLevelMouseProc _proc = HookCallback;
        private static IntPtr _hookID = IntPtr.Zero;
        private static IntPtr _singleInstanceMutex = IntPtr.Zero;

        private static ulong _bounceThresholdMs = 65;
        private static ulong _lastLeftUpTick = 0;
        private static ulong _lastRightUpTick = 0;
        private static bool _suppressNextLeftUp = false;
        private static bool _suppressNextRightUp = false;

        [STAThread]
        public static void RunHook(int bounceMs = 65) {
            _singleInstanceMutex = CreateMutex(IntPtr.Zero, true, @"Local\PocketGull_MouseAssist_Mutex");
            if (_singleInstanceMutex == IntPtr.Zero || Marshal.GetLastWin32Error() == ERROR_ALREADY_EXISTS) {
                if (_singleInstanceMutex != IntPtr.Zero) {
                    CloseHandle(_singleInstanceMutex);
                    _singleInstanceMutex = IntPtr.Zero;
                }
                return;
            }

            _bounceThresholdMs = bounceMs >= 0 ? (ulong)bounceMs : 65UL;
            _hookID = SetWindowsHookEx(WH_MOUSE_LL, _proc, GetModuleHandle(null), 0);
            if (_hookID == IntPtr.Zero) {
                CloseHandle(_singleInstanceMutex);
                _singleInstanceMutex = IntPtr.Zero;
                return;
            }

            try {
                Application.Run();
            } finally {
                if (_hookID != IntPtr.Zero) {
                    UnhookWindowsHookEx(_hookID);
                    _hookID = IntPtr.Zero;
                }
                if (_singleInstanceMutex != IntPtr.Zero) {
                    CloseHandle(_singleInstanceMutex);
                    _singleInstanceMutex = IntPtr.Zero;
                }
            }
        }

        public static bool SelfTest() {
            int inputSize = Marshal.SizeOf(typeof(INPUT));
            return (IntPtr.Size == 8 ? inputSize == 40 : inputSize == 28) && GetTickCount64() > 0;
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
            if (nCode >= 0) {
                MSLLHOOKSTRUCT hs = (MSLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(MSLLHOOKSTRUCT));
                bool isInjected = (hs.flags & LLMHF_INJECTED) != 0;

                if (!isInjected) {
                    int msg = wParam.ToInt32();

                    // 1. Ataxia Micro-Bounce Switch Debounce (< 65ms post-release contact bounce)
                    if (_bounceThresholdMs > 0) {
                        ulong now = GetTickCount64();
                        if (msg == WM_LBUTTONDOWN) {
                            if (_lastLeftUpTick > 0 && (now - _lastLeftUpTick) < _bounceThresholdMs) {
                                _suppressNextLeftUp = true;
                                return (IntPtr)1;
                            }
                        } else if (msg == WM_LBUTTONUP) {
                            _lastLeftUpTick = now;
                            if (_suppressNextLeftUp) {
                                _suppressNextLeftUp = false;
                                return (IntPtr)1;
                            }
                        } else if (msg == WM_RBUTTONDOWN) {
                            if (_lastRightUpTick > 0 && (now - _lastRightUpTick) < _bounceThresholdMs) {
                                _suppressNextRightUp = true;
                                return (IntPtr)1;
                            }
                        } else if (msg == WM_RBUTTONUP) {
                            _lastRightUpTick = now;
                            if (_suppressNextRightUp) {
                                _suppressNextRightUp = false;
                                return (IntPtr)1;
                            }
                        }
                    }

                    // 2. Side-Button Assistive Chords (dispatched off-thread so WH_MOUSE_LL never blocks)
                    if (msg == WM_XBUTTONDOWN || msg == WM_XBUTTONUP) {
                        int button = (int)(hs.mouseData >> 16);
                        if (button == XBUTTON1 || button == XBUTTON2) {
                            if (msg == WM_XBUTTONDOWN) {
                                if (button == XBUTTON1) {
                                    ThreadPool.QueueUserWorkItem(_ => SendWinShiftD());
                                } else {
                                    ThreadPool.QueueUserWorkItem(_ => SendDoubleCtrl());
                                }
                            }
                            return (IntPtr)1;
                        }
                    }
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        private static INPUT MakeKey(ushort vk, bool keyUp) {
            INPUT inp = new INPUT();
            inp.type = INPUT_KEYBOARD;
            inp.u.ki.wVk = vk;
            inp.u.ki.dwFlags = keyUp ? KEYEVENTF_KEYUP : 0;
            return inp;
        }

        private static void SendWinShiftD() {
            INPUT[] chord = new INPUT[] {
                MakeKey(VK_LWIN, false),
                MakeKey(VK_LSHIFT, false),
                MakeKey(VK_D, false),
                MakeKey(VK_D, true),
                MakeKey(VK_LSHIFT, true),
                MakeKey(VK_LWIN, true)
            };
            SendInput((uint)chord.Length, chord, Marshal.SizeOf(typeof(INPUT)));
        }

        private static void SendDoubleCtrl() {
            int cb = Marshal.SizeOf(typeof(INPUT));
            INPUT[] tap = new INPUT[] {
                MakeKey(VK_LCONTROL, false),
                MakeKey(VK_LCONTROL, true)
            };
            SendInput((uint)tap.Length, tap, cb);
            Thread.Sleep(45);
            SendInput((uint)tap.Length, tap, cb);
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct POINT {
            public int x;
            public int y;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct MSLLHOOKSTRUCT {
            public POINT pt;
            public uint mouseData;
            public uint flags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT {
            public uint type;
            public InputUnion u;
        }

        [StructLayout(LayoutKind.Explicit)]
        private struct InputUnion {
            [FieldOffset(0)] public MOUSEINPUT mi;
            [FieldOffset(0)] public KEYBDINPUT ki;
            [FieldOffset(0)] public HARDWAREINPUT hi;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct MOUSEINPUT {
            public int dx;
            public int dy;
            public uint mouseData;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct KEYBDINPUT {
            public ushort wVk;
            public ushort wScan;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct HARDWAREINPUT {
            public uint uMsg;
            public ushort wParamL;
            public ushort wParamH;
        }
    }
}
