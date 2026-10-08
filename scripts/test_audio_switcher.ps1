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

public class AudioSwitcher {
    public static int SetDefault(string deviceId) {
        var client = (IPolicyConfig)(new PolicyConfigClient());
        // role 0 = eConsole (Multimedia/Default), 1 = eMultimedia, 2 = eCommunications
        int hr1 = client.SetDefaultEndpoint(deviceId, 0);
        int hr2 = client.SetDefaultEndpoint(deviceId, 1);
        int hr3 = client.SetDefaultEndpoint(deviceId, 2);
        return hr1;
    }
}
"@ -ErrorAction SilentlyContinue

Write-Host "AudioSwitcher compiled successfully."
