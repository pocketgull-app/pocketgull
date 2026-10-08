# ─── POCKETGULL THEME ENGINE FOR POWERSHELL ─────────────────────────────
# Synchronizes PowerShell 7+ syntax highlighting (PSReadLine) and ANSI styling ($PSStyle)
# with the PocketGull Clinical, Tactile & Sensory IDE Theme Suite.

$script:ThemeDefinitions = @{
    'Obsidian' = @{
        DisplayName = 'PocketGull Obsidian (Flagship Dark)'
        Mode = 'Dark'
        OmpFile = 'pocketgull-ophthalmic.omp.json'
        PSReadLine = @{
            Command          = "`e[38;2;20;184;166m"     # Gear Teal (#14b8a6)
            Parameter        = "`e[38;2;56;189;248m"     # Sky Blue (#38bdf8)
            Operator         = "`e[38;2;244;63;94m"      # Rose Red (#f43f5e)
            Variable         = "`e[38;2;244;244;245m"    # Crisp White (#f4f4f5)
            String           = "`e[38;2;245;158;11m"     # Amber Gold (#f59e0b)
            Number           = "`e[38;2;168;85;247m"     # Purple (#a855f7)
            Type             = "`e[38;2;45;212;191m"     # Bright Teal (#2dd4bf)
            Comment          = "`e[38;2;113;113;122m"    # Zinc Muted (#71717a)
            Error            = "`e[38;2;239;68;68m"      # Crimson (#ef4444)
            Selection        = "`e[48;2;39;39;42m"       # Zinc (#27272a)
            InlinePrediction = "`e[38;2;82;82;91m"       # Dark Zinc (#52525b)
        }
        PSStyle = @{
            TableHeader  = "`e[38;2;20;184;166;1m"
            FormatAccent = "`e[38;2;56;189;248m"
            Error        = "`e[38;2;239;68;68;1m"
            Warning      = "`e[38;2;245;158;11;1m"
            Verbose      = "`e[38;2;45;212;191m"
            Directory    = "`e[38;2;20;184;166;1m"
            Executable   = "`e[38;2;16;185;129;1m"
        }
    }
    'Scotopic' = @{
        DisplayName = 'PocketGull Scotopic 650nm Red (Circadian Night Shift)'
        Mode = 'Scotopic'
        OmpFile = 'pocketgull-scotopic.omp.json'
        PSReadLine = @{
            Command          = "`e[38;2;239;68;68m"      # Scarlet (#ef4444)
            Parameter        = "`e[38;2;220;38;38m"      # Red 600 (#dc2626)
            Operator         = "`e[38;2;185;28;28m"      # Deep Red (#b91c1c)
            Variable         = "`e[38;2;254;226;226m"    # Soft Red Tint (#fee2e2)
            String           = "`e[38;2;248;113;113m"    # Light Red (#f87171)
            Number           = "`e[38;2;234;88;12m"      # Amber-Red 620nm (#ea580c)
            Type             = "`e[38;2;252;165;165m"    # Rose Red (#fca5a5)
            Comment          = "`e[38;2;127;29;29m"      # Deep Wine Maroon (#7f1d1d)
            Error            = "`e[38;2;255;51;34m"      # High-Luminance Red (#ff3322)
            Selection        = "`e[48;2;59;8;8m"         # Scotopic Substrate (#3b0808)
            InlinePrediction = "`e[38;2;100;20;20m"      # Low-Luma Red (#641414)
        }
        PSStyle = @{
            TableHeader  = "`e[38;2;239;68;68;1m"
            FormatAccent = "`e[38;2;248;113;113m"
            Error        = "`e[38;2;255;51;34;1m"
            Warning      = "`e[38;2;234;88;12;1m"
            Verbose      = "`e[38;2;252;165;165m"
            Directory    = "`e[38;2;239;68;68;1m"
            Executable   = "`e[38;2;220;38;38;1m"
        }
    }
    'Washi' = @{
        DisplayName = 'PocketGull Washi Rice Paper (Tactile Light)'
        Mode = 'Light'
        OmpFile = 'pocketgull-washi.omp.json'
        PSReadLine = @{
            Command          = "`e[38;2;15;118;110m"     # Deep Teal (#0f766e)
            Parameter        = "`e[38;2;9;105;218m"      # GitHub Blue (#0969da)
            Operator         = "`e[38;2;207;34;46m"      # Cinnabar Seal (#cf222e)
            Variable         = "`e[38;2;31;35;40m"       # Sumi Ink (#1f2328)
            String           = "`e[38;2;154;103;0m"      # Ochre Gold (#9a6700)
            Number           = "`e[38;2;130;80;223m"     # Purple Indigo (#8250df)
            Type             = "`e[38;2;14;116;144m"     # Cyan Slate (#0e7490)
            Comment          = "`e[38;2;101;109;118m"    # Rice Paper Ash (#656d76)
            Error            = "`e[38;2;207;34;46m"      # Crimson (#cf222e)
            Selection        = "`e[48;2;228;222;201m"    # Warm Parchment (#e4dec9)
            InlinePrediction = "`e[38;2;140;135;125m"    # Soft Charcoal (#8c877d)
        }
        PSStyle = @{
            TableHeader  = "`e[38;2;15;118;110;1m"
            FormatAccent = "`e[38;2;9;105;218m"
            Error        = "`e[38;2;207;34;46;1m"
            Warning      = "`e[38;2;154;103;0;1m"
            Verbose      = "`e[38;2;14;116;144m"
            Directory    = "`e[38;2;9;105;218;1m"
            Executable   = "`e[38;2;26;127;55;1m"
        }
    }
    'Curie' = @{
        DisplayName = 'PocketGull Curie Luminescence (Laboratory Radium)'
        Mode = 'Dark'
        OmpFile = 'pocketgull-curie.omp.json'
        PSReadLine = @{
            Command          = "`e[38;2;16;185;129m"     # Emerald Green (#10b981)
            Parameter        = "`e[38;2;45;212;191m"     # Teal (#2dd4bf)
            Operator         = "`e[38;2;248;113;113m"    # Alpha Particle Rose (#f87171)
            Variable         = "`e[38;2;209;250;229m"    # Radium Mint (#d1fae5)
            String           = "`e[38;2;252;211;77m"     # Yellow Gold (#fcd34d)
            Number           = "`e[38;2;110;231;183m"    # Phosphor Bright (#6ee7b7)
            Type             = "`e[38;2;52;211;153m"     # Radium Spring (#34d399)
            Comment          = "`e[38;2;30;58;43m"       # Deep Lab Pitch (#1e3a2b)
            Error            = "`e[38;2;248;113;113m"    # Soft Crimson (#f87171)
            Selection        = "`e[48;2;19;45;32m"       # Laboratory Slate (#132d20)
            InlinePrediction = "`e[38;2;40;80;60m"       # Muted Radium (#28503c)
        }
        PSStyle = @{
            TableHeader  = "`e[38;2;16;185;129;1m"
            FormatAccent = "`e[38;2;45;212;191m"
            Error        = "`e[38;2;248;113;113;1m"
            Warning      = "`e[38;2;252;211;77;1m"
            Verbose      = "`e[38;2;52;211;153m"
            Directory    = "`e[38;2;16;185;129;1m"
            Executable   = "`e[38;2;52;211;153;1m"
        }
    }
    'Rams' = @{
        DisplayName = 'PocketGull Rams Functionalist (Dieter Rams Putty)'
        Mode = 'Light'
        OmpFile = 'pocketgull-rams.omp.json'
        PSReadLine = @{
            Command          = "`e[38;2;62;92;118m"      # Slate Blue (#3e5c76)
            Parameter        = "`e[38;2;77;124;138m"     # Petroleum Teal (#4d7c8a)
            Operator         = "`e[38;2;200;75;49m"      # Warm Coral Red (#c84b31)
            Variable         = "`e[38;2;28;27;26m"       # Matte Graphite (#1c1b1a)
            String           = "`e[38;2;217;155;0m"      # Braun Functionalist Amber (#d99b00)
            Number           = "`e[38;2;108;91;123m"     # Muted Violet (#6c5b7b)
            Type             = "`e[38;2;47;111;68m"      # Functionalist Green (#2f6f44)
            Comment          = "`e[38;2;107;101;96m"     # Putty Grey (#6b6560)
            Error            = "`e[38;2;200;75;49m"      # Coral Red (#c84b31)
            Selection        = "`e[48;2;213;209;200m"    # Warm Putty (#d5d1c8)
            InlinePrediction = "`e[38;2;140;135;130m"    # Soft Chalk (#8c8782)
        }
        PSStyle = @{
            TableHeader  = "`e[38;2;62;92;118;1m"
            FormatAccent = "`e[38;2;217;155;0m"
            Error        = "`e[38;2;200;75;49;1m"
            Warning      = "`e[38;2;217;155;0;1m"
            Verbose      = "`e[38;2;77;124;138m"
            Directory    = "`e[38;2;62;92;118;1m"
            Executable   = "`e[38;2;47;111;68;1m"
        }
    }
    'Broadside' = @{
        DisplayName = 'PocketGull Midnight Broadside (Nautical Indigo)'
        Mode = 'Dark'
        OmpFile = 'pocketgull-ophthalmic.omp.json'
        PSReadLine = @{
            Command          = "`e[38;2;56;189;248m"     # Nautical Cyan (#38bdf8)
            Parameter        = "`e[38;2;147;197;253m"    # Sea Blue (#93c5fd)
            Operator         = "`e[38;2;251;113;133m"    # Coral Rose (#fb7185)
            Variable         = "`e[38;2;241;245;249m"    # Ivory White (#f1f5f9)
            String           = "`e[38;2;253;224;71m"     # Lantern Yellow (#fde047)
            Number           = "`e[38;2;192;132;252m"    # Lavender (#c084fc)
            Type             = "`e[38;2;94;234;212m"     # Bioluminescent Teal (#5eead4)
            Comment          = "`e[38;2;71;85;105m"      # Deep Maritime Slate (#475569)
            Error            = "`e[38;2;244;63;94m"      # Beacon Red (#f43f5e)
            Selection        = "`e[48;2;30;41;59m"       # Indigo Deep (#1e293b)
            InlinePrediction = "`e[38;2;60;75;95m"       # Deep Trench (#3c4b5f)
        }
        PSStyle = @{
            TableHeader  = "`e[38;2;56;189;248;1m"
            FormatAccent = "`e[38;2;94;234;212m"
            Error        = "`e[38;2;244;63;94;1m"
            Warning      = "`e[38;2;253;224;71;1m"
            Verbose      = "`e[38;2;147;197;253m"
            Directory    = "`e[38;2;56;189;248;1m"
            Executable   = "`e[38;2;94;234;212;1m"
        }
    }
}

function Get-PocketGullTheme {
    [CmdletBinding()]
    param()
    [PSCustomObject]@{
        ActiveTheme = $global:PocketGullActiveTheme
        AvailableThemes = $script:ThemeDefinitions.Keys | Sort-Object
    }
}

function Set-PocketGullTheme {
    [CmdletBinding()]
    param(
        [Parameter(Position = 0, Mandatory = $false)]
        [ValidateSet('Obsidian', 'Scotopic', 'Washi', 'Curie', 'Rams', 'Broadside', 'Auto')]
        [string]$Theme = 'Obsidian',

        [Parameter(Mandatory = $false)]
        [switch]$ConfigurePrompt = $true
    )

    if ($Theme -eq 'Auto') {
        $Theme = Get-PocketGullCircadianTheme
    }

    if (-not $script:ThemeDefinitions.ContainsKey($Theme)) {
        Write-Warning "Theme '$Theme' not recognized. Defaulting to Obsidian."
        $Theme = 'Obsidian'
    }

    $t = $script:ThemeDefinitions[$Theme]
    $global:PocketGullActiveTheme = $Theme

    # 1. Configure PSReadLine Colors
    if (Get-Module PSReadLine) {
        try {
            Set-PSReadLineOption -Colors $t.PSReadLine
        } catch {
            Write-Verbose "Could not apply PSReadLine colors: $_"
        }
    }

    # 2. Configure PowerShell 7+ $PSStyle ANSI Styling
    if ($PSStyle -and $PSStyle.Formatting) {
        try {
            $PSStyle.Formatting.TableHeader  = $t.PSStyle.TableHeader
            $PSStyle.Formatting.FormatAccent = $t.PSStyle.FormatAccent
            $PSStyle.Formatting.Error        = $t.PSStyle.Error
            $PSStyle.Formatting.Warning      = $t.PSStyle.Warning
            $PSStyle.Formatting.Verbose      = $t.PSStyle.Verbose
            $PSStyle.FileInfo.Directory      = $t.PSStyle.Directory
            $PSStyle.FileInfo.Executable     = $t.PSStyle.Executable
        } catch {
            Write-Verbose "Could not apply PSStyle colors: $_"
        }
    }

    # 3. Configure Prompt (Oh-My-Posh or Native Fallback)
    if ($ConfigurePrompt) {
        $promptConfigured = $false
        if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
            $rootLocations = @(
                "$PSScriptRoot\..\shell-prompts\$($t.OmpFile)",
                "$PSScriptRoot\..\..\..\public\brand\terminal\$($t.OmpFile)",
                "C:\Users\philg\Pocketgull\pocketgull\public\brand\terminal\$($t.OmpFile)"
            )
            foreach ($loc in $rootLocations) {
                if (Test-Path $loc) {
                    try {
                        $shellType = if ($PSVersionTable.PSVersion.Major -ge 6) { 'pwsh' } else { 'powershell' }
                        oh-my-posh init $shellType --config $loc | Invoke-Expression
                        $promptConfigured = $true
                        break
                    } catch {}
                }
            }
        }

        # Native Pure-PowerShell Fallback Prompt (Zero external dependencies)
        if (-not $promptConfigured) {
            $script:ActivePromptColors = $t.PSReadLine
            function global:prompt {
                $c = $script:ActivePromptColors
                $path = (Get-Location).Path
                $folder = Split-Path $path -Leaf
                $gitBranch = ""
                try {
                    $gitOut = git branch --show-current 2>$null
                    if ($gitOut) { $gitBranch = " `e[38;2;16;185;129m $gitOut`e[0m" }
                } catch {}

                $badge = "$($c.Type)⚕ POCKETGULL`e[0m"
                $locSegment = "$($c.Variable)📁 $folder`e[0m"
                $arrow = "$($c.Command)❯`e[0m "
                return "`n $badge  $locSegment$gitBranch`n $arrow"
            }
        }
    }

    Write-Host "🌊 PocketGull Terminal Theme: " -NoNewline -ForegroundColor DarkGray
    Write-Host "$($t.DisplayName)" -ForegroundColor Cyan
}

function Get-PocketGullCircadianTheme {
    # Inspect VS Code settings if active in workspace
    $wsSettings = "C:\Users\philg\Pocketgull\pocketgull\.vscode\settings.json"
    if (Test-Path $wsSettings) {
        try {
            $json = Get-Content $wsSettings -Raw | ConvertFrom-Json
            if ($json.'workbench.colorTheme') {
                $vt = $json.'workbench.colorTheme'
                if ($vt -match 'Scotopic') { return 'Scotopic' }
                if ($vt -match 'Washi')    { return 'Washi' }
                if ($vt -match 'Curie')    { return 'Curie' }
                if ($vt -match 'Rams')     { return 'Rams' }
                if ($vt -match 'Broadside'){ return 'Broadside' }
                if ($vt -match 'Obsidian') { return 'Obsidian' }
            }
        } catch {}
    }

    # Circadian fallback by solar schedule (matches Windows Scheduled Tasks: 08:00 Washi, 13:00 Focus, 19:30 Scotopic)
    $now = Get-Date
    $h = $now.Hour
    $m = $now.Minute

    if ($h -ge 8 -and $h -lt 13) {
        return 'Washi'      # 08:00 AM - 01:00 PM: Morning Daylight Reading
    } elseif ($h -ge 13 -and ($h -lt 19 -or ($h -eq 19 -and $m -lt 30))) {
        return 'Obsidian'   # 01:00 PM - 07:30 PM: Afternoon & Evening Focus
    } else {
        return 'Scotopic'   # 07:30 PM - 08:00 AM: Night Scotopic 650nm Deep Red
    }
}

function Sync-PocketGullTheme {
    [CmdletBinding()]
    param()
    $theme = Get-PocketGullCircadianTheme
    Set-PocketGullTheme -Theme $theme
}

function Install-PocketGullBrowserTheme {
    [CmdletBinding()]
    param(
        [string]$Theme = "",
        [ValidateSet('All', 'Chrome', 'Canary', 'Edge', 'Firefox', 'Portal')]
        [string]$Browser = "All",
        [switch]$OpenPortal
    )
    $script = "C:\Users\philg\Pocketgull\pocketgull\packages\pocketgull-theme\scripts\install_browser_theme.ps1"
    if (Test-Path $script) {
        $params = @{}
        if ($Theme) { $params['Theme'] = $Theme }
        if ($Browser) { $params['Browser'] = $Browser }
        if ($OpenPortal) { $params['OpenPortal'] = $true }
        & $script @params
    } else {
        Write-Warning "Browser theme installer script not found at $script"
    }
}

Export-ModuleMember -Function Set-PocketGullTheme, Get-PocketGullTheme, Sync-PocketGullTheme, Get-PocketGullCircadianTheme, Install-PocketGullBrowserTheme
