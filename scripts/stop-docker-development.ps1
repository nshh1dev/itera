$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$lock = Join-Path $root '.local\docker-development.lock'
$request = Join-Path $root '.local\docker-development.stop'
if (!(Test-Path $lock)) { return }
$ownerId = 0
if (![int]::TryParse((Get-Content $lock -Raw).Trim(), [ref]$ownerId) -or $ownerId -le 0) {
    throw 'El bloqueo de desarrollo no tiene un PID valido. Revisarlo antes de continuar.'
}
$owner = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerId"
if (!$owner) {
    Remove-Item -LiteralPath $lock
    if (Test-Path $request) { Remove-Item -LiteralPath $request }
    return
}
if ($owner.Name -ne 'node.exe' -or $owner.CommandLine -notmatch 'docker-develop\.mjs') {
    throw 'El PID del bloqueo pertenece a otro proceso. No se detiene ni se elimina el bloqueo automaticamente.'
}
[IO.File]::WriteAllText($request, 'stop')
Write-Host 'Esperando el cierre del seguimiento de desarrollo; si hay una construccion en curso, se deja terminar...'
$deadline = (Get-Date).AddMinutes(5)
while (Test-Path $lock) {
    if ((Get-Date) -gt $deadline) { throw 'El seguimiento no termino. No se cambia de modo ni se apaga WSL.' }
    Start-Sleep -Milliseconds 250
}
if (Test-Path $request) { Remove-Item -LiteralPath $request }
