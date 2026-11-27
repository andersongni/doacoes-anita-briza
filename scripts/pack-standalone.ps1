# Monta pasta/zip standalone para rodar no Windows (apos npm run build).
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$StandaloneSrc = Join-Path $Root ".next\standalone"
$StaticSrc = Join-Path $Root ".next\static"
$PublicSrc = Join-Path $Root "public"
$OutDir = Join-Path $Root "dist-standalone\anita-briza-windows"
$ZipPath = Join-Path $Root "dist-standalone\anita-briza-windows-standalone.zip"

if (-not (Test-Path $StandaloneSrc)) {
  Write-Host "Pasta .next\standalone nao encontrada. Rode: `$env:BUILD_STANDALONE=1; npm run build"
  exit 1
}
if (-not (Test-Path $StaticSrc)) {
  Write-Host "Pasta .next\static nao encontrada. Rode: npm run build"
  exit 1
}

if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Write-Host "Copiando standalone..."
Copy-Item -Recurse -Force (Join-Path $StandaloneSrc "*") $OutDir

$StaticDest = Join-Path $OutDir ".next\static"
New-Item -ItemType Directory -Force -Path $StaticDest | Out-Null
Copy-Item -Recurse -Force (Join-Path $StaticSrc "*") $StaticDest

$PublicDest = Join-Path $OutDir "public"
if (Test-Path $PublicDest) { Remove-Item -Recurse -Force $PublicDest }
Copy-Item -Recurse -Force $PublicSrc $PublicDest

# Prisma schema + seed para setup inicial do banco
$PrismaDest = Join-Path $OutDir "prisma"
New-Item -ItemType Directory -Force -Path $PrismaDest | Out-Null
Copy-Item -Force (Join-Path $Root "prisma\schema.prisma") $PrismaDest
if (Test-Path (Join-Path $Root "prisma\seed.ts")) {
  Copy-Item -Force (Join-Path $Root "prisma\seed.ts") $PrismaDest
}

# Scripts de operacao no pacote
Copy-Item -Force (Join-Path $Root "scripts\standalone\iniciar.bat") $OutDir
Copy-Item -Force (Join-Path $Root "scripts\standalone\parar.bat") $OutDir
Copy-Item -Force (Join-Path $Root "scripts\standalone\iniciar.ps1") $OutDir
Copy-Item -Force (Join-Path $Root "scripts\standalone\parar.ps1") $OutDir
Copy-Item -Force (Join-Path $Root "scripts\standalone\README-WINDOWS.txt") $OutDir
Copy-Item -Force (Join-Path $Root "scripts\standalone\seed-minimal.cjs") $OutDir
Copy-Item -Force (Join-Path $Root ".env.example") (Join-Path $OutDir ".env.example")
Copy-Item -Force (Join-Path $Root "LICENSE") (Join-Path $OutDir "LICENSE")

# Garante pasta de uploads
$Uploads = Join-Path $PublicDest "uploads"
New-Item -ItemType Directory -Force -Path $Uploads | Out-Null
if (-not (Test-Path (Join-Path $Uploads ".gitkeep"))) {
  New-Item -ItemType File -Force -Path (Join-Path $Uploads ".gitkeep") | Out-Null
}

New-Item -ItemType Directory -Force -Path (Split-Path $ZipPath) | Out-Null
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }

Write-Host "Gerando zip..."
Compress-Archive -Path (Join-Path $OutDir "*") -DestinationPath $ZipPath -Force

Write-Host ""
Write-Host "Pacote pronto:"
Write-Host "  Pasta: $OutDir"
Write-Host "  Zip:   $ZipPath"
exit 0
