@echo off
title Lattice-Guard Server (ADMIN)
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
cd /d "C:\Users\hebba\AppData\Local\Temp\opencode\Lattice-Guard"
powershell -NoProfile -ExecutionPolicy Bypass -File "start_server_admin.ps1"
echo.
echo Lattice-Guard server started as ADMINISTRATOR.
echo Open  http://localhost:8000  in your browser.
pause