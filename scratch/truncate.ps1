$filePath = Join-Path $PSScriptRoot "..\pocketgull_flutter\lib\models\patient_types.dart"
$lines = Get-Content $filePath -TotalCount 1110
$lines | Set-Content $filePath -Encoding UTF8
Write-Host "Truncated to 1110 lines"
