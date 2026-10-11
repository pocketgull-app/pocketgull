# PocketGull Acoustic Completion Hook Handler
# Strictly implements Antigravity Hook Contract (reads JSON stdin, writes JSON stdout)

try {
    # Drain stdin
    if ([Console]::IsInputRedirected) {
        $null = [Console]::In.ReadToEnd()
    }
} catch { }

# Soft Ceramic Kiln Chime / 528Hz Solfeggio
$soundPath = "C:\Users\philg\AppData\Local\PocketGull\Sounds\pocketgull_ceramic_chime.wav"

if (Test-Path $soundPath) {
    try {
        # Play asynchronously without blocking shell
        $player = New-Object System.Media.SoundPlayer $soundPath
        $player.Play()
    } catch { }
}

# Output empty JSON object as required by Antigravity Hook specification
[Console]::Out.Write("{}")
