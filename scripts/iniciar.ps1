$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$RuntimeDir = Join-Path $Root ".runtime"
$LogDir = Join-Path $RuntimeDir "logs"
New-Item -ItemType Directory -Force -Path $RuntimeDir, $LogDir | Out-Null

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

function Stop-PortIfOurs([int]$Port) {
  $pidOnPort = Get-PortOwnerPid $Port
  if (-not $pidOnPort -or $pidOnPort -eq 0) { return }
  try {
    $proc = Get-Process -Id $pidOnPort -ErrorAction Stop
    Write-Host "Porta $Port em uso por PID $pidOnPort ($($proc.ProcessName)). Encerrando..."
    taskkill /PID $pidOnPort /T /F 2>$null | Out-Null
    Start-Sleep -Milliseconds 800
  } catch {
    Write-Host "Nao foi possivel liberar a porta $Port."
  }
}

if (-not (Test-Command "node") -or -not (Test-Command "npm")) {
  Write-Host "Node.js/npm nao encontrados no PATH."
  exit 1
}

$EnvFile = Join-Path $Root ".env"
if (-not (Test-Path $EnvFile)) {
  Write-Host "Arquivo .env nao encontrado. Copie .env.example para .env e defina ADMIN_EMAIL."
  exit 1
}

$adminEmail = Get-EnvValue $EnvFile "ADMIN_EMAIL"
if (-not $adminEmail) {
  Write-Host "ADMIN_EMAIL e obrigatoria no .env da raiz do projeto"
  exit 1
}

$portText = Get-EnvValue $EnvFile "PORT"
$port = 3000
if ($portText -and ($portText -as [int])) { $port = [int]$portText }

if (-not (Test-Path (Join-Path $Root "node_modules\next"))) {
  Write-Host "Instalando dependencias..."
  npm install
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npx prisma generate
}

$DbPath = Join-Path $Root "prisma\dev.db"
if (-not (Test-Path $DbPath)) {
  Write-Host "Criando banco e seed..."
  npx prisma db push
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npm run seed
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Stop-PortIfOurs $port

$out = Join-Path $LogDir "web.out.log"
$err = Join-Path $LogDir "web.err.log"

Write-Host "Lendo configuracao de: $EnvFile"
Write-Host "Iniciando site (PORT=$port)..."
$proc = Start-Process -FilePath "cmd.exe" `
  -ArgumentList @("/c", "npm run dev > `"$out`" 2> `"$err`"") `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -PassThru

@"
WEB_PID=$($proc.Id)
PORT=$port
STARTED_AT=$(Get-Date -Format o)
ADMIN_EMAIL=$adminEmail
"@ | Set-Content -Path (Join-Path $RuntimeDir "pids.env") -Encoding UTF8

function Test-HttpOk([string]$Url) {
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500)
  } catch { return $false }
}

$deadline = (Get-Date).AddSeconds(60)
$up = $false
$url = "http://127.0.0.1:$port/"
while ((Get-Date) -lt $deadline) {
  if (Test-HttpOk $url) { $up = $true; break }
  Start-Sleep -Milliseconds 800
}

Write-Host ""
Write-Host "PID salvos em .runtime\pids.env (WEB=$($proc.Id))"
Write-Host "Logs em .runtime\logs\"
Write-Host ""
if ($up) {
  Write-Host "Site OK -> $url"
} else {
  Write-Host "Site ainda iniciando / verifique .runtime\logs\web.err.log"
}
Write-Host "Para encerrar: parar.bat"
Write-Host "Usuario inicial: $adminEmail"

try { Start-Process $url } catch {}
exit 0
