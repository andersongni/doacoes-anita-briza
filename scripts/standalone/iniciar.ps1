$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
Set-Location $Root

function Test-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-EnvValue([string]$File, [string]$Key) {
  if (-not (Test-Path $File)) { return $null }
  $match = Select-String -Path $File -Pattern ("^\s*" + [regex]::Escape($Key) + "\s*=\s*(.+)$") |
    Select-Object -First 1
  if (-not $match) { return $null }
  return $match.Matches.Groups[1].Value.Trim().Trim('"')
}

function Get-PortOwnerPid([int]$Port) {
  try {
    $lines = netstat -ano -p tcp | Select-String ":$Port\s+.*LISTENING"
    foreach ($line in $lines) {
      $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
      if ($parts.Length -ge 5) { return [int]$parts[-1] }
    }
  } catch {}
  return $null
}

if (-not (Test-Command "node")) {
  Write-Host "Node.js nao encontrado no PATH. Instale Node 20+ em https://nodejs.org"
  exit 1
}

$EnvFile = Join-Path $Root ".env"
if (-not (Test-Path $EnvFile)) {
  Write-Host "Arquivo .env nao encontrado."
  Write-Host "Copie .env.example para .env e preencha as chaves obrigatorias."
  exit 1
}

# Carrega .env no processo atual
Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $i = $_.IndexOf('=')
  $key = $_.Substring(0, $i).Trim()
  $val = $_.Substring($i + 1).Trim().Trim('"')
  if ($key) { Set-Item -Path "Env:$key" -Value $val }
}

$adminEmail = Get-EnvValue $EnvFile "ADMIN_EMAIL"
if (-not $adminEmail) {
  Write-Host "ADMIN_EMAIL e obrigatoria no .env"
  exit 1
}

$portText = Get-EnvValue $EnvFile "PORT"
$port = 3000
if ($portText -and ($portText -as [int])) { $port = [int]$portText }
$hostName = Get-EnvValue $EnvFile "HOST"
if (-not $hostName) { $hostName = "127.0.0.1" }

$serverJs = Join-Path $Root "server.js"
if (-not (Test-Path $serverJs)) {
  Write-Host "server.js nao encontrado. Este pacote parece incompleto."
  exit 1
}

# Banco SQLite (caminho relativo ao schema em prisma/)
if (-not $env:DATABASE_URL) { $env:DATABASE_URL = "file:./dev.db" }
$DbPath = Join-Path $Root "prisma\dev.db"
$SeedMarker = Join-Path $Root "prisma\.seeded"
if (-not (Test-Path $DbPath)) {
  Write-Host "Criando banco SQLite..."
  New-Item -ItemType Directory -Force -Path (Join-Path $Root "prisma") | Out-Null
  if (Test-Command "npx") {
    Push-Location (Join-Path $Root "prisma")
    try {
      npx --yes prisma@6 db push --schema=".\schema.prisma"
      if ($LASTEXITCODE -ne 0) { throw "prisma db push falhou" }
    } finally {
      Pop-Location
    }
  } else {
    Write-Host "npx nao disponivel; crie o banco manualmente com prisma db push."
    exit 1
  }
}

if (-not (Test-Path $SeedMarker)) {
  Write-Host "Executando seed minimo..."
  $seedJs = Join-Path $Root "seed-minimal.cjs"
  if (Test-Path $seedJs) {
    node $seedJs
    if ($LASTEXITCODE -eq 0) {
      Set-Content -Path $SeedMarker -Value (Get-Date -Format o) -Encoding UTF8
    } else {
      Write-Host "Aviso: seed minimo falhou. Voce ainda pode cadastrar o ADMIN_EMAIL pelo site."
    }
  }
}

$pidOnPort = Get-PortOwnerPid $port
if ($pidOnPort) {
  Write-Host "Porta $port em uso (PID $pidOnPort). Encerrando..."
  taskkill /PID $pidOnPort /T /F 2>$null | Out-Null
  Start-Sleep -Milliseconds 800
}

$RuntimeDir = Join-Path $Root ".runtime"
New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null
$out = Join-Path $RuntimeDir "web.out.log"
$err = Join-Path $RuntimeDir "web.err.log"

$env:PORT = "$port"
$env:HOSTNAME = $hostName
$env:NODE_ENV = "production"

Write-Host "Iniciando server.js em http://${hostName}:$port ..."
$proc = Start-Process -FilePath "node" `
  -ArgumentList @("server.js") `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $out `
  -RedirectStandardError $err `
  -PassThru

@"
WEB_PID=$($proc.Id)
PORT=$port
STARTED_AT=$(Get-Date -Format o)
"@ | Set-Content -Path (Join-Path $RuntimeDir "pids.env") -Encoding UTF8

$deadline = (Get-Date).AddSeconds(45)
$url = "http://${hostName}:$port/"
$up = $false
while ((Get-Date) -lt $deadline) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { $up = $true; break }
  } catch {}
  Start-Sleep -Milliseconds 700
}

Write-Host ""
if ($up) { Write-Host "Site OK -> $url" }
else { Write-Host "Ainda iniciando / veja .runtime\web.err.log" }
Write-Host "Para encerrar: parar.bat"
try { Start-Process $url } catch {}
exit 0
