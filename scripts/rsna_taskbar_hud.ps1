<#
.SYNOPSIS
    Pocket-Gull RSNA Knee 2026 Floating Taskbar HUD.
.DESCRIPTION
    A sleek, compact dark-mode desktop widget and taskbar window.
    Appears directly on the main Windows Taskbar and displays live training and submission telemetry.
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$PythonExe = "C:\Users\philg\anaconda3\python.exe"
$StatusScript = Join-Path $PSScriptRoot "get_rsna_status.py"

# Create Form
$form = New-Object System.Windows.Forms.Form
$form.Text = "RSNA Knee Monitor"
$form.Size = New-Object System.Drawing.Size(380, 150)
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedToolWindow
$form.BackColor = [System.Drawing.Color]::FromArgb(15, 15, 20)
$form.ForeColor = [System.Drawing.Color]::FromArgb(240, 240, 245)
$form.TopMost = $true
$form.ShowInTaskbar = $true

# Position at bottom-right above taskbar
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$form.Location = New-Object System.Drawing.Point(($screen.Right - 400), ($screen.Bottom - 170))

# Header
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "POCKET-GULL RSNA KNEE MONITOR"
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 8.5, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(20, 184, 166) # Teal
$lblTitle.Location = New-Object System.Drawing.Point(16, 12)
$lblTitle.Size = New-Object System.Drawing.Size(340, 20)
$form.Controls.Add($lblTitle)

# Train Status Label
$lblTrain = New-Object System.Windows.Forms.Label
$lblTrain.Text = "Training: Querying..."
$lblTrain.Font = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Regular)
$lblTrain.ForeColor = [System.Drawing.Color]::FromArgb(220, 220, 230)
$lblTrain.Location = New-Object System.Drawing.Point(16, 36)
$lblTrain.Size = New-Object System.Drawing.Size(340, 22)
$form.Controls.Add($lblTrain)

# Submission Status Label
$lblSub = New-Object System.Windows.Forms.Label
$lblSub.Text = "Submission: Querying..."
$lblSub.Font = New-Object System.Drawing.Font("Segoe UI", 9.5, [System.Drawing.FontStyle]::Bold)
$lblSub.ForeColor = [System.Drawing.Color]::FromArgb(250, 204, 21) # Yellow
$lblSub.Location = New-Object System.Drawing.Point(16, 60)
$lblSub.Size = New-Object System.Drawing.Size(340, 22)
$form.Controls.Add($lblSub)

# Timestamp Label
$lblTime = New-Object System.Windows.Forms.Label
$lblTime.Text = "Updated: --"
$lblTime.Font = New-Object System.Drawing.Font("Segoe UI", 7.5, [System.Drawing.FontStyle]::Regular)
$lblTime.ForeColor = [System.Drawing.Color]::FromArgb(130, 130, 150)
$lblTime.Location = New-Object System.Drawing.Point(16, 86)
$lblTime.Size = New-Object System.Drawing.Size(180, 20)
$form.Controls.Add($lblTime)

# Buttons
$btnSub = New-Object System.Windows.Forms.Button
$btnSub.Text = "Submissions"
$btnSub.Font = New-Object System.Drawing.Font("Segoe UI", 8.0, [System.Drawing.FontStyle]::Regular)
$btnSub.BackColor = [System.Drawing.Color]::FromArgb(35, 35, 45)
$btnSub.ForeColor = [System.Drawing.Color]::White
$btnSub.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnSub.FlatAppearance.BorderSize = 0
$btnSub.Location = New-Object System.Drawing.Point(200, 84)
$btnSub.Size = New-Object System.Drawing.Size(85, 24)
$btnSub.Add_Click({
    [System.Diagnostics.Process]::Start("https://www.kaggle.com/competitions/rsna-knee-abnormality-detection/submissions")
})
$form.Controls.Add($btnSub)

$btnRef = New-Object System.Windows.Forms.Button
$btnRef.Text = "Refresh"
$btnRef.Font = New-Object System.Drawing.Font("Segoe UI", 8.0, [System.Drawing.FontStyle]::Regular)
$btnRef.BackColor = [System.Drawing.Color]::FromArgb(20, 184, 166)
$btnRef.ForeColor = [System.Drawing.Color]::Black
$btnRef.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnRef.FlatAppearance.BorderSize = 0
$btnRef.Location = New-Object System.Drawing.Point(290, 84)
$btnRef.Size = New-Object System.Drawing.Size(65, 24)
$btnRef.Add_Click({
    Update-Hud
})
$form.Controls.Add($btnRef)

function Update-Hud {
    try {
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $PythonExe
        $pinfo.Arguments = "`"$StatusScript`""
        $pinfo.RedirectStandardOutput = $true
        $pinfo.UseShellExecute = $false
        $pinfo.CreateNoWindow = $true

        $proc = [System.Diagnostics.Process]::Start($pinfo)
        $rawOutput = $proc.StandardOutput.ReadToEnd()
        $proc.WaitForExit(5000)

        if (-not $rawOutput) { return }
        $data = $rawOutput | ConvertFrom-Json

        $form.Text = "RSNA: $($data.kernel_status) | Sub: $($data.sub_status)"
        $lblTrain.Text = "Training: $($data.kernel_status) ($($data.kernel_elapsed_str))"
        if ($data.kernel_status -eq "COMPLETE") {
            $lblTrain.ForeColor = [System.Drawing.Color]::FromArgb(74, 222, 128) # Green
        } else {
            $lblTrain.ForeColor = [System.Drawing.Color]::FromArgb(220, 220, 230)
        }

        $scoreStr = if ($data.sub_score) { " (Score: $($data.sub_score))" } else { "" }
        $lblSub.Text = "Submission: $($data.sub_status) [$($data.sub_id)]$scoreStr"
        if ($data.sub_status -eq "COMPLETE") {
            $lblSub.ForeColor = [System.Drawing.Color]::FromArgb(74, 222, 128) # Green
        } else {
            $lblSub.ForeColor = [System.Drawing.Color]::FromArgb(250, 204, 21) # Yellow
        }

        $lblTime.Text = "Updated: $($data.time)"
    }
    catch {
        $lblTrain.Text = "Error updating status: $_"
    }
}

# Initial update
Update-Hud

# Timer
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 30000 # 30 seconds
$timer.Add_Tick({
    Update-Hud
})
$timer.Start()

[void]$form.ShowDialog()
