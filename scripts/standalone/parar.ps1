$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
Set-Location $Root

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

function Stop-Tree([int]$ProcessId, [string]$Label) {
  if (-not $ProcessId -or $ProcessId -le 0) { return $false }
  try {
    Get-Process -Id $ProcessId -ErrorAction Stop | Out-Null
    Write-Host "Encerrando $Label (PID $ProcessId)..."
    taskkill /PID $ProcessId /T /F 2>$null | Out-Null
    return $true
  } catch {
    Write-Host "$Label PID $ProcessId ja nao estava em execucao."
    return $false
  }
}

$stopped = 0
$PidFile = Join-Path $Root ".runtime\pids.env"
$port = 3000

if (Test-Path $PidFile) {
  Get-Content $PidFile | ForEach-Object {
    if ($_ -match '^\s*WEB_PID\s*=\s*(\d+)') {
      if (Stop-Tree ([int]$Matches[1]) "WEB") { $stopped++ }
    }
    if ($_ -match '^\s*PORT\s*=\s*(\d+)') { $port = [int]$Matches[1] }
  }
}

$envFile = Join-Path $Root ".env"
if (Test-Path $envFile) {
  $m = Select-String -Path $envFile -Pattern '^\s*PORT\s*=\s*(\d+)' | Select-Object -First 1
  if ($m) { $port = [int]$m.Matches.Groups[1].Value }
}

$pidOnPort = Get-PortOwnerPid $port
if ($pidOnPort) {
  if (Stop-Tree $pidOnPort "porta $port") { $stopped++ }
}

if (Test-Path $PidFile) { Remove-Item $PidFile -Force -ErrorAction SilentlyContinue }

Write-Host ""
if ($stopped -gt 0) { Write-Host "Servico encerrado." }
else { Write-Host "Nenhum servico ativo encontrado." }
exit 0
