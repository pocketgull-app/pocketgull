Add-Type @"
using System;
using System.Runtime.InteropServices;

[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDevice {
    int Activate(ref Guid id, int clsCtx, IntPtr activationParams, [MarshalAs(UnmanagedType.IUnknown)] out object interfacePointer);
    int OpenPropertyStore(int stgmAccess, out IntPtr properties);
    int GetId([MarshalAs(UnmanagedType.LPWStr)] out string id);
    int GetState(out int state);
}

[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IMMDeviceEnumerator {
    int EnumAudioEndpoints(int dataFlow, int stateMask, out IntPtr devices);
    int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice endpoint);
}

[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
public class MMDeviceEnumeratorComObject { }

public class AudioHelper {
    public static string GetDefaultAudioEndpointId(int dataFlow, int role) {
        var enumerator = (IMMDeviceEnumerator)(new MMDeviceEnumeratorComObject());
        IMMDevice dev;
        enumerator.GetDefaultAudioEndpoint(dataFlow, role, out dev);
        string id;
        dev.GetId(out id);
        return id;
    }
}
"@ -ErrorAction SilentlyContinue

$defaultId = [AudioHelper]::GetDefaultAudioEndpointId(0, 0) # eRender, eConsole
$defaultCommId = [AudioHelper]::GetDefaultAudioEndpointId(0, 2) # eRender, eCommunications

Write-Host "Default Multimedia Endpoint:   $defaultId"
Write-Host "Default Communications Endpoint: $defaultCommId"

# Get friendly name
$propsKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render\$defaultId\Properties"
if (Test-Path $propsKey) {
    $props = Get-ItemProperty $propsKey
    $name = $props.'{a45c254e-df1c-4efd-8020-67d146a850e0},2'
    $desc = $props.'{b3f8fa53-0004-438e-9003-51a46e139bfc},6'
    Write-Host "Current Default Device Name:     $name ($desc)" -ForegroundColor Green
}
