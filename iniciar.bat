@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Anita Briza - Iniciar (desenvolvimento) ===
echo.
echo 1^) Le o arquivo .env na raiz (PORT, ADMIN_EMAIL, reCAPTCHA...)
echo 2^) Instala deps / cria banco+seed se necessario
echo 3^) Sobe o site com npm run dev
echo 4^) Para encerrar depois: parar.bat
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\iniciar.ps1"
set ERR=%ERRORLEVEL%

echo.
if %ERR% neq 0 (
  echo Falha ao iniciar. Codigo: %ERR%
  echo Veja .runtime\logs\web.err.log se existir.
  pause
  exit /b %ERR%
)

pause
endlocal
