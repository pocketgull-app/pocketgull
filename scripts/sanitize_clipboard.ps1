<#
.SYNOPSIS
  PocketGull Clipboard Security Sanitizer
  Protects against Trojan Source (CVE-2021-42574), Pastejacking, and Watermarking.

.DESCRIPTION
  1. Strips zero-width invisible characters (\u200B-\u200D, \uFEFF)
  2. Strips bidirectional (BiDi) override controls (\u202A-\u202E, \u2066-\u2069)
  3. Normalizes smart curly quotes/apostrophes to pure 7-bit ASCII (' and ")
  4. Warns on backtick subshell injection tokens (`)
#>

param(
    [switch]$StripBackticks
)

$raw = Get-Clipboard -Raw
if (-not $raw) {
    Write-Host "📋 Clipboard is empty." -ForegroundColor Yellow
    return
}

# 1. Strip zero-width spaces, invisible unicode, and BiDi override controls
$sanitized = $raw -replace '[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]', ''

# 2. Normalize typographic curly quotes to 7-bit executable ASCII
$sanitized = $sanitized -replace '[\u2018\u2019\u201B]', "'"
$sanitized = $sanitized -replace '[\u201C\u201D\u201F]', '"'

# 3. Optional backtick stripping or alert
if ($sanitized.Contains('`')) {
    if ($StripBackticks) {
        $sanitized = $sanitized -replace '`', ''
        Write-Host "🛡️ Subshell backticks stripped from clipboard." -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Notice: Clipboard contains backticks (`` ` ``). Review carefully before pasting." -ForegroundColor Yellow
    }
}

Set-Clipboard -Value $sanitized
Write-Host "✔ Clipboard sanitized successfully (Pure ASCII delimiters & Zero invisible bytes)." -ForegroundColor Green
