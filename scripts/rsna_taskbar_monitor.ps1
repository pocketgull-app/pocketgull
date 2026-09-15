<#
.SYNOPSIS
    Pocket-Gull RSNA Knee 2026 Windows Taskbar System Tray Monitor.
.DESCRIPTION
    Lives in the Windows Taskbar Notification Area (System Tray).
    Displays real-time training elapsed time, kernel status, and competition submission scoring.
    Provides desktop notifications and right-click quick navigation to Kaggle.
#>

param(
    [int]$IntervalSeconds = 60
)

# Ensure Windows Forms and Drawing assemblies are loaded
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Win32 GDI Cleanup P/Invoke
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class NativeMethods {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern bool DestroyIcon(IntPtr handle);
}
"@

$PythonExe = "C:\Users\philg\anaconda3\python.exe"
$StatusScript = Join-Path $PSScriptRoot "get_rsna_status.py"
$global:CurrentHIcon = [IntPtr]::Zero
$global:LastJsonRaw = ""

# Create the NotifyIcon
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Text = "RSNA Knee Monitor"
$notifyIcon.Visible = $true

# Context Menu
$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

$headerItem = New-Object System.Windows.Forms.ToolStripMenuItem("Pocket-Gull RSNA Monitor")
$headerItem.Enabled = $false
$headerItem.Font = New-Object System.Drawing.Font($headerItem.Font, [System.Drawing.FontStyle]::Bold)
[void]$contextMenu.Items.Add($headerItem)

[void]$contextMenu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator))

$trainItem = New-Object System.Windows.Forms.ToolStripMenuItem("Train: Initializing...")
$trainItem.Add_Click({
    [System.Diagnostics.Process]::Start("https://www.kaggle.com/code/philgear/rsna-knee-2026-training-v8")
})
[void]$contextMenu.Items.Add($trainItem)

$subItem = New-Object System.Windows.Forms.ToolStripMenuItem("Sub: Initializing...")
$subItem.Add_Click({
    [System.Diagnostics.Process]::Start("https://www.kaggle.com/competitions/rsna-knee-abnormality-detection/submissions")
})
[void]$contextMenu.Items.Add($subItem)

[void]$contextMenu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator))

$refreshItem = New-Object System.Windows.Forms.ToolStripMenuItem("[Refresh Status Now]")
$refreshItem.Add_Click({
    Update-TrayStatus
})
[void]$contextMenu.Items.Add($refreshItem)

$copyItem = New-Object System.Windows.Forms.ToolStripMenuItem("[Copy Telemetry JSON]")
$copyItem.Add_Click({
    if ($global:LastJsonRaw) {
        [System.Windows.Forms.Clipboard]::SetText($global:LastJsonRaw)
        $notifyIcon.ShowBalloonTip(2000, "Pocket-Gull", "Telemetry copied to clipboard.", [System.Windows.Forms.ToolTipIcon]::Info)
    }
})
[void]$contextMenu.Items.Add($copyItem)

[void]$contextMenu.Items.Add((New-Object System.Windows.Forms.ToolStripSeparator))

$exitItem = New-Object System.Windows.Forms.ToolStripMenuItem("[Exit Monitor]")
$exitItem.Add_Click({
    $notifyIcon.Visible = $false
    $notifyIcon.Dispose()
    if ($global:CurrentHIcon -ne [IntPtr]::Zero) {
        [NativeMethods]::DestroyIcon($global:CurrentHIcon)
    }
    [System.Windows.Forms.Application]::Exit()
})
[void]$contextMenu.Items.Add($exitItem)

$notifyIcon.ContextMenuStrip = $contextMenu

# Double click on tray icon opens Kaggle submissions
$notifyIcon.Add_DoubleClick({
    [System.Diagnostics.Process]::Start("https://www.kaggle.com/competitions/rsna-knee-abnormality-detection/submissions")
})

# Function to draw dynamic high-contrast 16x16 icon
function New-TrayIcon([string]$text, [string]$type) {
    $bmp = New-Object System.Drawing.Bitmap(16, 16)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::SingleBitPerPixelGridFit

    # Dark Obsidian background
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(9, 9, 11))
    $g.FillEllipse($bgBrush, 0, 0, 15, 15)

    if ($type -eq "running") {
        # Cyan / Gear Teal ring
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(20, 184, 166), 1.5)
        $g.DrawEllipse($pen, 1, 1, 13, 13)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(240, 253, 250))
        $font = New-Object System.Drawing.Font("Segoe UI", 7.0, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $renderText = $text -replace "m", ""
        if ($renderText.Length -gt 2) { $renderText = $renderText.Substring(0, 2) }
        $g.DrawString($renderText, $font, $textBrush, (New-Object System.Drawing.RectangleF(0, 0, 16, 16)), $sf)
        $pen.Dispose()
        $font.Dispose()
        $textBrush.Dispose()
    }
    elseif ($type -eq "complete") {
        # Emerald Green
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(34, 197, 94), 2.0)
        $g.DrawEllipse($pen, 1, 1, 13, 13)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(34, 197, 94))
        $font = New-Object System.Drawing.Font("Segoe UI", 6.5, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString("OK", $font, $textBrush, (New-Object System.Drawing.RectangleF(0, 0, 16, 16)), $sf)
        $pen.Dispose()
        $font.Dispose()
        $textBrush.Dispose()
    }
    elseif ($type -eq "error") {
        # Red / Amber
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(239, 68, 68), 2.0)
        $g.DrawEllipse($pen, 1, 1, 13, 13)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(239, 68, 68))
        $font = New-Object System.Drawing.Font("Segoe UI", 8.0, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString("!", $font, $textBrush, (New-Object System.Drawing.RectangleF(0, 0, 16, 16)), $sf)
        $pen.Dispose()
        $font.Dispose()
        $textBrush.Dispose()
    }
    else {
        # Default Teal PG
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(20, 184, 166), 1.0)
        $g.DrawEllipse($pen, 1, 1, 13, 13)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 184, 166))
        $font = New-Object System.Drawing.Font("Segoe UI", 6.0, [System.Drawing.FontStyle]::Bold)
        $sf = New-Object System.Drawing.StringFormat
        $sf.Alignment = [System.Drawing.StringAlignment]::Center
        $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
        $g.DrawString("PG", $font, $textBrush, (New-Object System.Drawing.RectangleF(0, 0, 16, 16)), $sf)
        $pen.Dispose()
        $font.Dispose()
        $textBrush.Dispose()
    }

    $bgBrush.Dispose()
    $g.Dispose()

    $hIcon = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    $bmp.Dispose()
    return @{ Icon = $icon; HIcon = $hIcon }
}

# Core update routine
function Update-TrayStatus {
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
        $global:LastJsonRaw = $rawOutput
        $data = $rawOutput | ConvertFrom-Json

        # Update Tooltip (limit 63/127 chars for Windows NotifyIcon compatibility)
        if ($data.tooltip) {
            $tt = $data.tooltip
            if ($tt.Length -gt 63) { $tt = $tt.Substring(0, 63) }
            $notifyIcon.Text = $tt
        }

        # Update Context Menu Items
        $trainItem.Text = "Train: $($data.kernel_status) ($($data.kernel_elapsed_str))"
        $scoreStr = if ($data.sub_score) { " ($($data.sub_score))" } else { "" }
        $subItem.Text = "Sub: $($data.sub_status) [$($data.sub_id)]$scoreStr"

        # Update Icon
        $iconResult = New-TrayIcon -text $data.short_text -type $data.icon_type
        if ($global:CurrentHIcon -ne [IntPtr]::Zero) {
            [NativeMethods]::DestroyIcon($global:CurrentHIcon)
        }
        $global:CurrentHIcon = $iconResult.HIcon
        $notifyIcon.Icon = $iconResult.Icon

        # Trigger Desktop Notifications if any
        if ($data.notifications -and $data.notifications.Count -gt 0) {
            foreach ($msg in $data.notifications) {
                $notifyIcon.ShowBalloonTip(4000, "RSNA Knee Update", $msg, [System.Windows.Forms.ToolTipIcon]::Info)
            }
        }
    }
    catch {
        Write-Warning "Failed to update tray status: $_"
    }
}

# Initial update
Update-TrayStatus

# Timer for recurring updates
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = $IntervalSeconds * 1000
$timer.Add_Tick({
    Update-TrayStatus
})
$timer.Start()

Write-Host "[OK] Pocket-Gull RSNA Taskbar Tray Monitor started (Interval: ${IntervalSeconds}s)"

# Run Windows message loop
[System.Windows.Forms.Application]::Run()
