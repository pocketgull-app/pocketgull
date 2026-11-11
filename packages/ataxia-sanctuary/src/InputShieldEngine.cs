// SPDX-License-Identifier: Apache-2.0
using System;
using System.Runtime.InteropServices;
using System.Threading;

namespace PocketGull.Sanctuary {
    public sealed class InputShieldEngine : IDisposable {
        private const int WH_KEYBOARD_LL = 13;
        private const int WH_MOUSE_LL    = 14;

        private const int WM_KEYDOWN     = 0x0100;
        private const int WM_SYSKEYDOWN  = 0x0104;
        private const int WM_LBUTTONDOWN = 0x0201;
        private const int WM_LBUTTONUP   = 0x0202;
        private const int WM_RBUTTONDOWN = 0x0204;
        private const int WM_RBUTTONUP   = 0x0205;
        private const int WM_XBUTTONDOWN = 0x020B;
        private const int WM_XBUTTONUP   = 0x020C;

        private const int XBUTTON1 = 0x0001;
        private const int XBUTTON2 = 0x0002;

        private const uint LLMHF_INJECTED = 0x00000001;
        private const uint LLKHF_INJECTED = 0x00000010;

        private const uint INPUT_KEYBOARD  = 1;
        private const uint KEYEVENTF_KEYUP = 0x0002;

        private const ushort VK_ESCAPE   = 0x1B;
        private const ushort VK_H        = 0x48;
        private const ushort VK_LWIN     = 0x5B;
        private const ushort VK_LCONTROL = 0xA2;

        private const ulong PANIC_ESC_WINDOW_MS = 1200UL;

        private delegate IntPtr LowLevelHookProc(int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelHookProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("kernel32.dll")]
        private static extern ulong GetTickCount64();

        [DllImport("user32.dll", SetLastError = true)]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        private readonly LowLevelHookProc _mouseDelegate;
        private readonly LowLevelHookProc _keyDelegate;
        private readonly SynchronizationContext _uiContext;

        private IntPtr _mouseHook = IntPtr.Zero;
        private IntPtr _keyHook   = IntPtr.Zero;

        private volatile int _bounceThresholdMs = 65;
        private volatile bool _sideChordsEnabled = true;

        private ulong _lastLeftUpTick  = 0;
        private ulong _lastRightUpTick = 0;
        private bool _suppressNextLeftUp  = false;
        private bool _suppressNextRightUp = false;

        private ulong _escTick1 = 0;
        private ulong _escTick2 = 0;

        public event EventHandler PanicRevertRequested;

        public InputShieldEngine() {
            _mouseDelegate = MouseHookCallback;
            _keyDelegate   = KeyboardHookCallback;
            _uiContext     = SynchronizationContext.Current;
        }

        public int BounceThresholdMs {
            get { return _bounceThresholdMs; }
            set { _bounceThresholdMs = value >= 0 ? value : 0; }
        }

        public bool SideChordsEnabled {
            get { return _sideChordsEnabled; }
            set { _sideChordsEnabled = value; }
        }

        public static bool SelfTest() {
            int inputSize = Marshal.SizeOf(typeof(INPUT));
            bool structValid = (IntPtr.Size == 8 ? inputSize == 40 : inputSize == 28);
            return structValid && GetTickCount64() > 0;
        }

        public void StartHooks() {
            IntPtr hMod = GetModuleHandle(null);
            if (_mouseHook == IntPtr.Zero) {
                _mouseHook = SetWindowsHookEx(WH_MOUSE_LL, _mouseDelegate, hMod, 0);
            }
            if (_keyHook == IntPtr.Zero) {
                _keyHook = SetWindowsHookEx(WH_KEYBOARD_LL, _keyDelegate, hMod, 0);
            }
        }

        public void StopHooks() {
            if (_mouseHook != IntPtr.Zero) {
                UnhookWindowsHookEx(_mouseHook);
                _mouseHook = IntPtr.Zero;
            }
            if (_keyHook != IntPtr.Zero) {
                UnhookWindowsHookEx(_keyHook);
                _keyHook = IntPtr.Zero;
            }
        }

        public void Dispose() {
            StopHooks();
        }

        private IntPtr MouseHookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
            if (nCode >= 0) {
                MSLLHOOKSTRUCT hs = (MSLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(MSLLHOOKSTRUCT));
                bool injected = (hs.flags & LLMHF_INJECTED) != 0;

                if (!injected) {
                    int msg = wParam.ToInt32();
                    int bounceLimit = _bounceThresholdMs;

                    // 1. Contact Switch Bounce Guard
                    if (bounceLimit > 0) {
                        ulong now = GetTickCount64();
                        ulong threshold = (ulong)bounceLimit;

                        if (msg == WM_LBUTTONDOWN) {
                            if (_lastLeftUpTick > 0 && (now - _lastLeftUpTick) < threshold) {
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
                            if (_lastRightUpTick > 0 && (now - _lastRightUpTick) < threshold) {
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

                    // 2. Optional Side-Button Assistive Chords (Win+H Voice Typing & Double-Ctrl Mouse Sonar)
                    if (_sideChordsEnabled && (msg == WM_XBUTTONDOWN || msg == WM_XBUTTONUP)) {
                        int button = (int)(hs.mouseData >> 16);
                        if (button == XBUTTON1 || button == XBUTTON2) {
                            if (msg == WM_XBUTTONDOWN) {
                                if (button == XBUTTON1) {
                                    ThreadPool.QueueUserWorkItem(delegate { SendWinVoiceTyping(); });
                                } else {
                                    ThreadPool.QueueUserWorkItem(delegate { SendDoubleCtrlSonar(); });
                                }
                            }
                            return (IntPtr)1;
                        }
                    }
                }
            }
            return CallNextHookEx(_mouseHook, nCode, wParam, lParam);
        }

        private IntPtr KeyboardHookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
            if (nCode >= 0) {
                int msg = wParam.ToInt32();
                if (msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN) {
                    KBDLLHOOKSTRUCT ks = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
                    bool injected = (ks.flags & LLKHF_INJECTED) != 0;
                    if (!injected && ks.vkCode == VK_ESCAPE) {
                        ulong now = GetTickCount64();
                        if (_escTick1 > 0 && _escTick2 > 0 && (now - _escTick1) <= PANIC_ESC_WINDOW_MS) {
                            _escTick1 = 0;
                            _escTick2 = 0;
                            RaisePanicRevert();
                        } else {
                            _escTick1 = _escTick2;
                            _escTick2 = now;
                        }
                    }
                }
            }
            // Never swallow Esc so normal application behavior is 100% preserved
            return CallNextHookEx(_keyHook, nCode, wParam, lParam);
        }

        private void RaisePanicRevert() {
            EventHandler handler = PanicRevertRequested;
            if (handler == null) return;
            if (_uiContext != null) {
                _uiContext.Post(delegate { handler(this, EventArgs.Empty); }, null);
            } else {
                ThreadPool.QueueUserWorkItem(delegate { handler(this, EventArgs.Empty); });
            }
        }

        private static INPUT MakeKey(ushort vk, bool keyUp) {
            INPUT inp = new INPUT();
            inp.type = INPUT_KEYBOARD;
            inp.u.ki.wVk = vk;
            inp.u.ki.dwFlags = keyUp ? KEYEVENTF_KEYUP : 0;
            return inp;
        }

        private static void SendWinVoiceTyping() {
            INPUT[] chord = new INPUT[] {
                MakeKey(VK_LWIN, false),
                MakeKey(VK_H, false),
                MakeKey(VK_H, true),
                MakeKey(VK_LWIN, true)
            };
            SendInput((uint)chord.Length, chord, Marshal.SizeOf(typeof(INPUT)));
        }

        private static void SendDoubleCtrlSonar() {
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
        private struct KBDLLHOOKSTRUCT {
            public uint vkCode;
            public uint scanCode;
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
