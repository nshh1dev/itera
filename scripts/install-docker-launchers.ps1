param([string]$Distribution = 'Ubuntu-24.04')
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $env:LOCALAPPDATA 'DockerCLI'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
$action = New-ScheduledTaskAction -Execute "$env:WINDIR\System32\wsl.exe" -Argument "-d $Distribution -u root --exec sleep infinity"
$principal = New-ScheduledTaskPrincipal -UserId $identity -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero)
$existing = Get-ScheduledTask -TaskName 'Docker-WSL' -ErrorAction SilentlyContinue
if ($existing -and $existing.State -eq 'Running') { Stop-ScheduledTask -TaskName 'Docker-WSL' }
Register-ScheduledTask -TaskName 'Docker-WSL' -Action $action -Principal $principal -Settings $settings -Description 'Docker WSL manual para Itera. Sin inicio automatico.' -Force | Out-Null
$compose = 'docker compose --env-file .local/docker.env -f compose.yaml -f compose.app.yaml'
$start = @"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$root\scripts\stop-docker-development.ps1"
if errorlevel 1 exit /b %ERRORLEVEL%
powershell.exe -NoProfile -Command "Start-ScheduledTask -TaskName 'Docker-WSL' -ErrorAction Stop"
if errorlevel 1 exit /b %ERRORLEVEL%
wsl.exe -d $Distribution -u root --exec systemctl start docker
if errorlevel 1 exit /b %ERRORLEVEL%
wsl.exe -d $Distribution -u root --cd "$root" --exec $compose up -d --wait
if errorlevel 1 exit /b %ERRORLEVEL%
echo Itera disponible en http://127.0.0.1:3000
"@
$stop = @"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$root\scripts\stop-docker-development.ps1"
if errorlevel 1 exit /b %ERRORLEVEL%
wsl.exe -d $Distribution -u root --cd "$root" --exec $compose stop
if errorlevel 1 exit /b %ERRORLEVEL%
powershell.exe -NoProfile -Command "Stop-ScheduledTask -TaskName 'Docker-WSL' -ErrorAction Stop"
if errorlevel 1 exit /b %ERRORLEVEL%
wsl.exe --terminate $Distribution
"@
$develop = @"
@echo off
where node >nul 2>&1
if errorlevel 1 (echo Este modo necesita Node.js 24 LTS en Windows. & exit /b 1)
powershell.exe -NoProfile -Command "Start-ScheduledTask -TaskName 'Docker-WSL' -ErrorAction Stop"
if errorlevel 1 exit /b %ERRORLEVEL%
wsl.exe -d $Distribution -u root --exec systemctl start docker
if errorlevel 1 exit /b %ERRORLEVEL%
pushd "$root"
node scripts/docker-develop.mjs
set "result=%ERRORLEVEL%"
popd
exit /b %result%
"@
$cli = "@echo off`r`nwsl.exe -d $Distribution -u root --cd `"%CD%`" --exec docker %*`r`nexit /b %ERRORLEVEL%`r`n"
foreach ($item in @(@('docker-iniciar.cmd', $start), @('docker-desarrollar.cmd', $develop), @('docker-apagar.cmd', $stop), @('docker.cmd', $cli))) {
    $path = Join-Path $destination $item[0]
    if ((Test-Path $path) -and !(Test-Path "$path.before-full-docker")) { Copy-Item $path "$path.before-full-docker" }
    Set-Content -Path $path -Value $item[1] -Encoding ASCII
}
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if (($userPath -split ';') -notcontains $destination) { [Environment]::SetEnvironmentVariable('Path', "$destination;$userPath", 'User') }
Write-Host 'Lanzadores instalados sin inicio automatico. Reabre la terminal si es necesario.'
