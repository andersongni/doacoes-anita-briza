@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Anita Briza - Parar ===
echo.
echo Encerra o site iniciado por iniciar.bat
echo (usa .runtime\pids.env e/ou a porta do .env^)
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\parar.ps1"
set ERR=%ERRORLEVEL%

echo.
if %ERR% neq 0 (
  echo Encerramento com avisos. Codigo: %ERR%
  pause
  exit /b %ERR%
)

pause
endlocal
