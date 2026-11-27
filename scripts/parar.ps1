$ErrorActionPreference = "Continue"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$RuntimeDir = Join-Path $Root ".runtime"
$PidFile = Join-Path $RuntimeDir "pids.env"

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
    $proc = Get-Process -Id $ProcessId -ErrorAction Stop
    Write-Host "Encerrando $Label (PID $ProcessId - $($proc.ProcessName))..."
    & taskkill /PID $ProcessId /T /F 2>$null | Out-Null
    return $true
  } catch {
    Write-Host "$Label PID $ProcessId ja nao estava em execucao."
    return $false
  }
}

$stopped = 0

if (Test-Path $PidFile) {
  $map = @{}
  Get-Content $PidFile | ForEach-Object {
    if ($_ -match '^\s*([A-Z_]+)\s*=\s*(.+)\s*$') {
      $map[$matches[1]] = $matches[2].Trim()
    }
  }
  if ($map.ContainsKey("WEB_PID")) {
    if (Stop-Tree ([int]$map["WEB_PID"]) "WEB") { $stopped++ }
  }
  if ($map.ContainsKey("API_PID")) {
    if (Stop-Tree ([int]$map["API_PID"]) "API") { $stopped++ }
  }
} else {
  Write-Host "Arquivo .runtime\pids.env nao encontrado. Tentando pelas portas..."
}

$ports = New-Object System.Collections.Generic.HashSet[int]
[void]$ports.Add(3000)
[void]$ports.Add(3001)
[void]$ports.Add(5173)
if (Test-Path $PidFile) {
  $portLine = Get-Content $PidFile | Where-Object { $_ -match '^\s*PORT\s*=\s*(\d+)' } | Select-Object -First 1
  if ($portLine -match '(\d+)') { [void]$ports.Add([int]$Matches[1]) }
}
$envPort = $null
$envFile = Join-Path $Root ".env"
if (Test-Path $envFile) {
  $m = Select-String -Path $envFile -Pattern '^\s*PORT\s*=\s*(\d+)' | Select-Object -First 1
  if ($m) { [void]$ports.Add([int]$m.Matches.Groups[1].Value) }
}

foreach ($port in $ports) {
  $pidOnPort = Get-PortOwnerPid $port
  if ($pidOnPort -and $pidOnPort -gt 0) {
    if (Stop-Tree $pidOnPort "porta $port") { $stopped++ }
  } else {
    Write-Host "Nada escutando na porta $port."
  }
}

Start-Sleep -Milliseconds 500
Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
  Where-Object {
    $_.CommandLine -and (
      ($_.CommandLine -like "*next*" -and $_.CommandLine -like "*site-campanha-doacao*") -or
      $_.CommandLine -like "*@anita-briza/*"
    )
  } |
  ForEach-Object {
    Write-Host "Encerrando processo residual PID $($_.ProcessId)..."
    & taskkill /PID $_.ProcessId /T /F 2>$null | Out-Null
    $stopped++
  }

if (Test-Path $PidFile) { Remove-Item $PidFile -Force -ErrorAction SilentlyContinue }

Write-Host ""
if ($stopped -gt 0) { Write-Host "Servicos encerrados." }
else { Write-Host "Nenhum servico ativo encontrado." }
exit 0
