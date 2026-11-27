$ErrorActionPreference = "Continue"
$Root = $PSScriptRoot
Set-Location $Root

function Get-EnvPort([string]$File, [int]$Default = 3000) {
  if (-not (Test-Path $File)) { return $Default }
  $m = Select-String -Path $File -Pattern '^\s*PORT\s*=\s*(\d+)\s*$' | Select-Object -First 1
  if ($m -and ($m.Matches.Groups[1].Value -as [int])) {
    return [int]$m.Matches.Groups[1].Value
  }
  return $Default
}

function Get-PortOwnerPid([int]$Port) {
  try {
    $pattern = "[:.]$Port\s+.*LISTENING"
    $lines = netstat -ano -p tcp | Select-String $pattern
    foreach ($line in $lines) {
      $parts = ($line.ToString() -split "\s+") | Where-Object { $_ -ne "" }
      if ($parts.Length -ge 5) {
        $local = $parts[1]
        if ($local -match "[:.]$Port$") {
          return [int]$parts[-1]
        }
      }
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
$EnvFile = Join-Path $Root ".env"
$port = Get-EnvPort $EnvFile 3000
$webPid = $null

if (Test-Path $PidFile) {
  Get-Content $PidFile | ForEach-Object {
    if ($_ -match '^\s*WEB_PID\s*=\s*(\d+)\s*$') { $webPid = [int]$Matches[1] }
    if ($_ -match '^\s*PORT\s*=\s*(\d+)\s*$') { $port = [int]$Matches[1] }
  }
}

Write-Host "Analisando apenas a porta do projeto: $port"

if ($webPid) {
  if (Stop-Tree $webPid "WEB") { $stopped++ }
}

$pidOnPort = Get-PortOwnerPid $port
if ($pidOnPort -and $pidOnPort -gt 0) {
  if (-not $webPid -or $pidOnPort -ne $webPid) {
    if (Stop-Tree $pidOnPort "porta $port") { $stopped++ }
  } else {
    Start-Sleep -Milliseconds 400
    $still = Get-PortOwnerPid $port
    if ($still -and $still -gt 0) {
      if (Stop-Tree $still "porta $port") { $stopped++ }
    }
  }
} else {
  Write-Host "Nada escutando na porta $port."
}

if (Test-Path $PidFile) {
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

Write-Host ""
if ($stopped -gt 0) { Write-Host "Servico encerrado." }
else { Write-Host "Nenhum servico ativo encontrado na porta $port." }
exit 0
