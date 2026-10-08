$clsids = @(
    "{2a57891a-c5be-4598-8777-4cf01dd51e58}",
    "{294fcb26-ee94-4701-b2ca-3da49bb5f1ac}",
    "{870c3566-265f-4399-b846-e5848c17f9a8}",
    "{f8679f50-850a-412f-9c75-beee8ac91588}"
)

foreach ($c in $clsids) {
    try {
        $t = [Type]::GetTypeFromCLSID([Guid]$c)
        if ($t) {
            $obj = [Activator]::CreateInstance($t)
            Write-Host "Found registered COM Class: $c -> $($obj.GetType().FullName)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Not registered: $c" -ForegroundColor DarkGray
    }
}
