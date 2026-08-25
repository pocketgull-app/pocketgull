# Pocket-Gull CLI (gull) PowerShell Alias Installer
# Adds global 'gull' alias/function to user's PowerShell profile

$gullScriptPath = Join-Path $PSScriptRoot "gull.js"

if (-not (Test-Path $gullScriptPath)) {
    Write-Host "Could not locate gull.js at $gullScriptPath" -ForegroundColor Red
    exit 1
}

$aliasFunction = @"

# Pocket-Gull Diagnostic CLI Global Alias
function gull {
    node "$gullScriptPath" `$args
}
"@

if (-not (Test-Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force | Out-Null
}

$profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
if ($profileContent -notmatch "function gull") {
    Add-Content -Path $PROFILE -Value $aliasFunction
    Write-Host "Successfully added 'gull' alias to PowerShell profile: $PROFILE" -ForegroundColor Green
    Write-Host "Run '. `$PROFILE' or restart PowerShell to start using 'gull'" -ForegroundColor Cyan
} else {
    Write-Host "gull alias is already present in PowerShell profile ($PROFILE)." -ForegroundColor Yellow
}
