# PocketGull Acoustic Completion Hook Handler
# Strictly implements Antigravity Hook Contract (writes JSON stdout)

# Soft Ceramic Kiln Chime / 528Hz Solfeggio
$soundPath = "C:\Users\philg\AppData\Local\PocketGull\Sounds\pocketgull_ceramic_chime.wav"

if (Test-Path $soundPath) {
    try {
        # Play synchronously to ensure full acoustic resonance before shell exit
        $player = New-Object System.Media.SoundPlayer $soundPath
        $player.PlaySync()
    } catch { }
}

# Output empty JSON object as required by Antigravity Hook specification
[Console]::Out.Write("{}")
