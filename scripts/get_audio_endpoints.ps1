$renderKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render"
$devices = Get-ChildItem -Path $renderKey | ForEach-Object {
    $id = $_.PSChildName
    $propKey = Join-Path $_.PSPath "Properties"
    $props = Get-ItemProperty -Path $propKey -ErrorAction SilentlyContinue
    $devState = (Get-ItemProperty -Path $_.PSPath -ErrorAction SilentlyContinue).DeviceState
    
    # DeviceState: 1 = Active, 2 = Disabled, 4 = NotPresent, 8 = Unplugged
    $stateDesc = switch ($devState) {
        1 { "Active (Enabled)" }
        2 { "Disabled" }
        4 { "Not Present" }
        8 { "Unplugged" }
        default { "Unknown ($devState)" }
    }
    
    $friendlyName = $props.'{a45c254e-df1c-4efd-8020-67d146a850e0},2'
    $deviceDesc = $props.'{b3f8fa53-0004-438e-9003-51a46e139bfc},6'
    
    if ($friendlyName) {
        [PSCustomObject]@{
            Id           = $id
            FriendlyName = $friendlyName
            Description  = $deviceDesc
            State        = $stateDesc
            RawState     = $devState
        }
    }
}

$devices | Sort-Object RawState | Format-Table -AutoSize
