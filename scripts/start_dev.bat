@echo off
echo =========================================
echo Starting Connify Development Environment
echo =========================================

echo [1/2] Starting Backend...
start "Connify Backend" cmd /k "cd /d %~dp0..\backend && npm run dev"

echo [2/2] Starting Frontend (Web)...
start "Connify Frontend" cmd /k "cd /d %~dp0..\Connify && npm run web"
:: Note: If you prefer to start the Metro bundler for mobile devices instead, 
:: change "npm run web" to "npm start" above.

echo.
echo Development servers are starting in separate windows.
echo You can close this window now.
