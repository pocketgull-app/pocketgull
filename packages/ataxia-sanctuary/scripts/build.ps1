# SPDX-License-Identifier: Apache-2.0
<#
.SYNOPSIS
    Compiles, self-tests, and packages PocketGull Ataxia Sanctuary into a zero-dependency
    single-file Windows x64 executable and deterministic release ZIP + SHA-256 manifest.
#>

[CmdletBinding()]
param(
    [switch]$SelfTestOnly,
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pkgRoot   = Split-Path -Parent $scriptDir
$srcDir    = Join-Path $pkgRoot "src"
$distDir   = Join-Path $pkgRoot "dist"

if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

$outExe = Join-Path $distDir "PocketGullSanctuary.exe"
$cscExe = Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $cscExe)) {
    throw "64-bit Windows C# compiler not found at $cscExe"
}

$repoIcon = Join-Path (Split-Path -Parent (Split-Path -Parent $pkgRoot)) "public\icons\pocketgull.ico"
$csFiles = Get-ChildItem -Path $srcDir -Filter "*.cs" | Sort-Object Name | ForEach-Object { $_.FullName }

$cscArgs = @(
    "/nologo",
    "/optimize+",
    "/platform:x64",
    "/target:winexe",
    "/out:$outExe",
    "/reference:System.dll",
    "/reference:System.Core.dll",
    "/reference:System.Drawing.dll",
    "/reference:System.Windows.Forms.dll",
    "/reference:System.Web.Extensions.dll"
)
if (Test-Path $repoIcon) {
    $cscArgs += "/win32icon:$repoIcon"
}
$cscArgs += $csFiles

Write-Host "[1/3] Compiling PocketGullSanctuary.exe (x64, zero external dependencies)..." -ForegroundColor Cyan
& $cscExe @cscArgs
if ($LASTEXITCODE -ne 0 -or (-not (Test-Path $outExe))) {
    throw "Compilation failed with exit code $LASTEXITCODE"
}

$exeBytes = (Get-Item $outExe).Length
Write-Host "  [OK] Built $outExe ($([Math]::Round($exeBytes / 1KB, 1)) KB)" -ForegroundColor Green

Write-Host "[2/3] Running headless ABI, cursor foundry, and Control Deck self-test..." -ForegroundColor Cyan
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $outExe
$psi.Arguments = "--selftest"
$psi.WorkingDirectory = $distDir
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $true

$proc = [System.Diagnostics.Process]::Start($psi)
$stdout = $proc.StandardOutput.ReadToEnd().Trim()
$stderr = $proc.StandardError.ReadToEnd().Trim()
$proc.WaitForExit()

if ($proc.ExitCode -ne 0 -or $stdout -notmatch "SANCTUARY_SELFTEST=PASS") {
    throw "Self-test failed (exit $($proc.ExitCode)): $stdout $stderr"
}
Write-Host "  [OK] $stdout" -ForegroundColor Green

if ($SelfTestOnly) {
    exit 0
}

Write-Host "[3/3] Packaging portable release bundle + SHA-256 digest..." -ForegroundColor Cyan
$stageDir = Join-Path $distDir "stage"
if (Test-Path $stageDir) { Remove-Item $stageDir -Recurse -Force }
New-Item -ItemType Directory -Path $stageDir -Force | Out-Null

Copy-Item -Path $outExe -Destination (Join-Path $stageDir "PocketGullSanctuary.exe") -Force
Copy-Item -Path (Join-Path $pkgRoot "README.md") -Destination (Join-Path $stageDir "README.md") -Force

$quickInstallCmd = @"
@echo off
REM PocketGull Ataxia Sanctuary - One-Click User-Space Installer (No Admin Needed)
"%~dp0PocketGullSanctuary.exe" --install
"@
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $stageDir "Install-Sanctuary.cmd"), $quickInstallCmd, $utf8NoBom)

$quickResetCmd = @"
@echo off
REM Restores original Windows mouse, drag threshold, and cursor settings immediately
"%~dp0PocketGullSanctuary.exe" --uninstall
"@
[System.IO.File]::WriteAllText((Join-Path $stageDir "Uninstall-And-Restore-Mouse.cmd"), $quickResetCmd, $utf8NoBom)

$zipName = "PocketGull-Ataxia-Sanctuary-v$Version-win-x64.zip"
$zipPath = Join-Path $distDir $zipName
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $stageDir "*") -DestinationPath $zipPath -Force
Remove-Item $stageDir -Recurse -Force

$exeHash = (Get-FileHash -Path $outExe -Algorithm SHA256).Hash.ToLowerInvariant()
$zipHash = (Get-FileHash -Path $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
$sumsPath = Join-Path $distDir "SHA256SUMS.txt"
$sumsBody = "$exeHash  PocketGullSanctuary.exe`r`n$zipHash  $zipName`r`n"
[System.IO.File]::WriteAllText($sumsPath, $sumsBody, $utf8NoBom)

Write-Host "  [OK] Release ZIP: $zipPath" -ForegroundColor Green
Write-Host "  [OK] SHA-256 Manifest: $sumsPath" -ForegroundColor Green
