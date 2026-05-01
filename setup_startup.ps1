$TaskName = "LocalActivityMonitor"
$Description = "Starts the local system monitoring system at login."
$ActionPath = "wscript.exe"
$ScriptDir = Get-Location
$VbsPath = Join-Path $ScriptDir "run_hidden.vbs"
$Arguments = "`"$VbsPath`""

# Define Action
$Action = New-ScheduledTaskAction -Execute $ActionPath -Argument $Arguments

# Define Trigger (At Logon)
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# Define Settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Days 100)

# Unregister if already exists
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# Register the Task
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description $Description

Write-Host "Success! The Local Activity Monitor is now scheduled to start automatically at login." -ForegroundColor Green
Write-Host "Task Name: $TaskName"
Write-Host "Script: $VbsPath"
