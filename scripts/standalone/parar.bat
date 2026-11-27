@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Anita Briza - Parar (standalone) ===
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0parar.ps1"
set ERR=%ERRORLEVEL%

echo.
if %ERR% neq 0 (
  echo Encerramento com avisos. Codigo: %ERR%
  pause
  exit /b %ERR%
)

pause
endlocal
