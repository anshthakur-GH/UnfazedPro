$VbsPath = Join-Path (Get-Location) "run_hidden.vbs"
$StartupFolder = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
$ShortcutPath = Join-Path $StartupFolder "LocalActivityMonitor.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$VbsPath`""
$Shortcut.WorkingDirectory = (Get-Location).Path
$Shortcut.Save()

Write-Host "Success! The Local Activity Monitor is now added to your Startup folder." -ForegroundColor Green
Write-Host "Shortcut created at: $ShortcutPath"
