Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

[Windows.Devices.Bluetooth.BluetoothDevice, Windows.Devices.Bluetooth, ContentType = WindowsRuntime] | Out-Null
[Windows.Devices.Enumeration.DeviceInformation, Windows.Devices.Enumeration, ContentType = WindowsRuntime] | Out-Null

$selector = [Windows.Devices.Bluetooth.BluetoothDevice]::GetDeviceSelector()
$op = [Windows.Devices.Enumeration.DeviceInformation]::FindAllAsync($selector)
$devices = Await $op ([Windows.Devices.Enumeration.DeviceInformationCollection])

foreach ($d in $devices) {
    if ($d.Name -match 'LG|SLM6Y|Soundbar') {
        Write-Host "Found Bluetooth Device: $($d.Name)" -ForegroundColor Cyan
        $btOp = [Windows.Devices.Bluetooth.BluetoothDevice]::FromIdAsync($d.Id)
        $btDev = Await $btOp ([Windows.Devices.Bluetooth.BluetoothDevice])
        Write-Host "  ConnectionStatus: $($btDev.ConnectionStatus)" -ForegroundColor Yellow
        Write-Host "  BluetoothAddress: $($btDev.BluetoothAddress.ToString('X'))"
    }
}
