$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$directory = Join-Path $root '.local'
$path = Join-Path $directory 'docker.env'
New-Item -ItemType Directory -Path $directory -Force | Out-Null
if (Test-Path $path) {
    Write-Host 'La configuracion Docker ya existe; se conservan sus secretos.'
    exit 0
}
$random = [Security.Cryptography.RandomNumberGenerator]::Create()
function New-HexSecret([int]$Length) {
    $bytes = New-Object byte[] $Length
    $random.GetBytes($bytes)
    return [BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()
}
try {
    $content = "DOCKER_DB_PASSWORD=$(New-HexSecret 24)`nDOCKER_AUTH_SECRET=$(New-HexSecret 48)`n"
    $stream = [IO.File]::Open($path, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    try {
        $bytes = [Text.Encoding]::UTF8.GetBytes($content)
        $stream.Write($bytes, 0, $bytes.Length)
    } finally { $stream.Dispose() }
} finally { $random.Dispose() }
Write-Host 'Secretos Docker creados en .local/docker.env; no se modifico .env.'
