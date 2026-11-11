# SPDX-License-Identifier: Apache-2.0
# Start-MouseAssist.ps1
# Compiles and hosts MouseAssist.cs in-memory inside the Microsoft-signed PowerShell process
# (compatible with both PowerShell 7+ .NET Core and Windows PowerShell 5.1) so Windows Smart
# App Control never blocks an unsigned standalone .exe on disk.

param(
    [int]$BounceMs = $(if ($env:POCKETGULL_BOUNCE_MS) { [int]$env:POCKETGULL_BOUNCE_MS } else { 65 }),
    [switch]$SelfTest
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$localCs   = Join-Path $scriptDir "MouseAssist.cs"
$appDataCs = Join-Path $env:LOCALAPPDATA "PocketGull\bin\MouseAssist.cs"
$csPath    = if (Test-Path $localCs) { $localCs } else { $appDataCs }

if (-not (Test-Path $csPath)) {
    Write-Error "MouseAssist.cs not found at $csPath"
    exit 1
}

if (-not ([System.Management.Automation.PSTypeName]'PocketGull.MouseAssist').Type) {
    Add-Type -AssemblyName System.Windows.Forms
    $source = Get-Content -Path $csPath -Raw
    if ($PSVersionTable.PSEdition -eq 'Core') {
        Add-Type -TypeDefinition $source -ReferencedAssemblies @(
            'System.Windows.Forms',
            'System.ComponentModel.Primitives',
            'System.Threading.Thread',
            'System.Threading.ThreadPool'
        )
    } else {
        Add-Type -TypeDefinition $source -ReferencedAssemblies 'System.Windows.Forms'
    }
}

if ($SelfTest) {
    $ok = [PocketGull.MouseAssist]::SelfTest()
    Write-Output "MOUSEASSIST_SELFTEST=$ok"
    exit $(if ($ok) { 0 } else { 1 })
}

[PocketGull.MouseAssist]::RunHook($BounceMs)
