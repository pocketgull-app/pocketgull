Add-Type @"
using System;
using System.Runtime.InteropServices;

[ComImport, Guid("870C3566-265F-4399-B846-E5848C17F9A8"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IPolicyConfig {
    int GetMixFormat(string pszDeviceName, IntPtr ppFormat);
    int GetDeviceFormat(string pszDeviceName, bool bDefault, IntPtr ppFormat);
    int ResetDeviceFormat(string pszDeviceName);
    int SetDeviceFormat(string pszDeviceName, IntPtr pEndpointFormat, IntPtr pMixFormat);
    int GetProcessingPeriod(string pszDeviceName, bool bDefault, IntPtr pmftDefaultPeriod, IntPtr pmftMinimumPeriod);
    int SetProcessingPeriod(string pszDeviceName, IntPtr pmftPeriod);
    int GetShareMode(string pszDeviceName, IntPtr pMode);
    int SetShareMode(string pszDeviceName, IntPtr mode);
    int GetPropertyValue(string pszDeviceName, bool bFxStore, IntPtr key, IntPtr pv);
    int SetPropertyValue(string pszDeviceName, bool bFxStore, IntPtr key, IntPtr pv);
    int SetDefaultEndpoint(string pszDeviceName, int role);
    int SetEndpointVisibility(string pszDeviceName, bool bVisible);
}

[ComImport, Guid("870C3566-265F-4399-B846-E5848C17F9A8")]
public class PolicyConfigClient { }

public class AudioVisibility {
    public static int HideEndpoint(string deviceId) {
        var client = (IPolicyConfig)(new PolicyConfigClient());
        return client.SetEndpointVisibility(deviceId, false);
    }
}
"@ -ErrorAction SilentlyContinue

$benqId = "{0.0.0.00000000}.{60393238-38d0-4422-a624-1fb4452a5137}"
try {
    $hr = [AudioVisibility]::HideEndpoint($benqId)
    Write-Host "SetEndpointVisibility result for BenQ: 0x$($hr.ToString('X'))"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
