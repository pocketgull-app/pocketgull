<#
.SYNOPSIS
    Pocket-Gull Environment & Security Optimization Suite
.DESCRIPTION
    Audits and optimizes the Windows developer environment for Angular 22, Node 24,
    Python FastAPI, MCP servers, and Local Security Policy compliance.
.PARAMETER FixMcp
    Automatically cleans up broken/blocked paths in mcp_config.json
.PARAMETER SetupDevTools
    Creates a dedicated C:\DevTools whitelisted toolchain directory
#>

[CmdletBinding()]
param (
    [switch]$FixMcp,
    [switch]$SetupDevTools
)

function Write-StatusHeader {
    param([string]$Title)
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Cyan
}

function Write-Check {
    param([string]$Name, [bool]$Pass, [string]$Details = "")
    if ($Pass) {
        Write-Host " [PASS] " -ForegroundColor Green -NoNewline
        Write-Host "$Name " -ForegroundColor White -NoNewline
        if ($Details) { Write-Host "($Details)" -ForegroundColor DarkGray } else { Write-Host "" }
    } else {
        Write-Host " [WARN] " -ForegroundColor Yellow -NoNewline
        Write-Host "$Name " -ForegroundColor Yellow -NoNewline
        if ($Details) { Write-Host "-> $Details" -ForegroundColor Magenta } else { Write-Host "" }
    }
}

# ---------------------------------------------------------
# 1. PowerShell & Security Policy Diagnostics
# ---------------------------------------------------------
Write-StatusHeader "1. PowerShell & Policy Configuration"

$langMode = $ExecutionContext.SessionState.LanguageMode
Write-Check -Name "PowerShell Language Mode" -Pass ($langMode -eq "FullLanguage") -Details $langMode

$execPolicy = Get-ExecutionPolicy -Scope CurrentUser
if ($execPolicy -eq "Undefined") { $execPolicy = Get-ExecutionPolicy }
Write-Check -Name "Execution Policy" -Pass ($execPolicy -in @("RemoteSigned", "Unrestricted", "Bypass")) -Details $execPolicy

# Check BitLocker (Physical drive encryption for HIPAA data-at-rest)
try {
    $bitlocker = Get-BitLockerVolume -MountPoint "C:" -ErrorAction SilentlyContinue
    if ($bitlocker) {
        $blStatus = $bitlocker.ProtectionStatus
        Write-Check -Name "Drive C: BitLocker Encryption" -Pass ($blStatus -eq "On") -Details "ProtectionStatus: $blStatus"
    } else {
        Write-Check -Name "Drive C: BitLocker Encryption" -Pass $false -Details "Admin permissions needed to query"
    }
} catch {
    Write-Check -Name "Drive C: BitLocker Status" -Pass $false -Details "Query skipped"
}

# ---------------------------------------------------------
# 2. Language Runtimes & Monorepo Engine
# ---------------------------------------------------------
Write-StatusHeader "2. Language Runtimes & Monorepo Engine"

# Node.js check (Strict Node v24.x per AGENTS.md)
try {
    $nodeVer = & node -v
    $isNode24 = $nodeVer -like "v24*"
    Write-Check -Name "Node.js Version (Required: v24.x)" -Pass $isNode24 -Details $nodeVer
} catch {
    Write-Check -Name "Node.js Version" -Pass $false -Details "node command not found on PATH"
}

# Python check
try {
    $pythonVer = & python --version 2>&1
    Write-Check -Name "Python Runtime (FastAPI Sidecar)" -Pass ($null -ne $pythonVer) -Details $pythonVer
} catch {
    Write-Check -Name "Python Runtime" -Pass $false -Details "python command not found"
}

# Local Node Modules
$nodeModulesExist = Test-Path "c:\Users\philg\Pocketgull\pocketgull\node_modules"
Write-Check -Name "Project node_modules" -Pass $nodeModulesExist -Details $(if ($nodeModulesExist) { "Present" } else { "Run 'npm install'" })

# ---------------------------------------------------------
# 3. Model Context Protocol (MCP) Audit & Fix
# ---------------------------------------------------------
Write-StatusHeader "3. MCP Server Configuration Audit"

$mcpPath = "C:\Users\philg\.gemini\antigravity\mcp_config.json"
if (Test-Path $mcpPath) {
    try {
        $mcpConfig = Get-Content $mcpPath -Raw | ConvertFrom-Json
        $serverCount = ($mcpConfig.mcpServers.PSObject.Properties | Measure-Object).Count
        Write-Check -Name "mcp_config.json Load" -Pass $true -Details "$serverCount configured servers"

        $hasBlockedPaths = $false
        foreach ($prop in $mcpConfig.mcpServers.PSObject.Properties) {
            $cmd = $prop.Value.command
            if ($cmd -like "*\go\bin\*" -or $cmd -like "*\Users\*") {
                Write-Check -Name "Server '$($prop.Name)' Execution Path" -Pass $false -Details "Runs from user profile path ($cmd) - blocked by AppLocker"
                $hasBlockedPaths = $true
            }
        }

        if ($hasBlockedPaths -and $FixMcp) {
            Write-Host "`n  -> Cleaning blocked/broken user profile servers from mcp_config.json..." -ForegroundColor Cyan
            $mcpConfig.mcpServers.PSObject.Properties.Remove('gopls-mcp-server')
            $mcpConfig.mcpServers.PSObject.Properties.Remove('gke-oss')
            $mcpConfig.mcpServers.PSObject.Properties.Remove('adobe-developer-console')
            $mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $mcpPath -Encoding utf8
            Write-Host "  -> mcp_config.json cleaned successfully!" -ForegroundColor Green
        } elseif ($hasBlockedPaths) {
            Write-Host "  -> TIP: Run this script with '-FixMcp' to automatically clean blocked servers." -ForegroundColor DarkYellow
        } else {
            Write-Check -Name "MCP Security Compliance" -Pass $true -Details "Zero blocked user-dir binaries"
        }
    } catch {
        Write-Check -Name "mcp_config.json Parse" -Pass $false -Details $_.Exception.Message
    }
} else {
    Write-Check -Name "mcp_config.json" -Pass $false -Details "File not found at $mcpPath"
}

# ---------------------------------------------------------
# 4. Optional Toolchain Directory Setup
# ---------------------------------------------------------
if ($SetupDevTools) {
    Write-StatusHeader "4. Whitelisted DevTools Directory Setup"
    $devToolsBin = "C:\DevTools\bin"
    if (-not (Test-Path $devToolsBin)) {
        New-Item -ItemType Directory -Path $devToolsBin -Force | Out-Null
        Write-Host "  [CREATED] $devToolsBin" -ForegroundColor Green
    } else {
        Write-Host "  [EXISTS] $devToolsBin" -ForegroundColor DarkGray
    }

    # Copy Go binaries if found in user profile
    $userGoBin = "C:\Users\philg\go\bin"
    if (Test-Path $userGoBin) {
        Get-ChildItem -Path $userGoBin -Filter "*.exe" | ForEach-Object {
            Copy-Item $_.FullName -Destination $devToolsBin -Force
            Write-Host "  [MIGRATED] $($_.Name) -> $devToolsBin" -ForegroundColor Cyan
        }
    }
}

Write-StatusHeader "Optimization Summary"
Write-Host " Status check complete." -ForegroundColor White
