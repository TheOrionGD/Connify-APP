@echo off
echo ====================================================
echo Starting Connify App System with Android Emulator
echo ====================================================

:: 1. Launch Android Emulator
echo [1/3] Launching Android Emulator (Pixel_7_API_35)...
start "Android Emulator" cmd /c "emulator -avd Pixel_7_API_35"

:: 2. Launch Backend API Server
echo [2/3] Launching Backend Server...
start "Connify Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: 3. Launch React Native Metro & Run Android App
echo [3/3] Launching React Native App on Emulator...
start "Connify Mobile App" cmd /k "cd /d %~dp0Connify && npm run android"

echo.
echo ====================================================
echo All services launched in separate windows!
echo Backend:  http://localhost:5000 (or configured PORT)
echo App:      Deploying to Pixel_7_API_35 Emulator
echo ====================================================
