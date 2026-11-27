@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Anita Briza - Iniciar (standalone) ===
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar.ps1"
set ERR=%ERRORLEVEL%

echo.
if %ERR% neq 0 (
  echo Falha ao iniciar. Codigo: %ERR%
  pause
  exit /b %ERR%
)

pause
endlocal
