# PowerShell Script to Launch Connify System on Android Emulator

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Starting Connify App System with Android Emulator" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Start Android Emulator
Write-Host "[1/3] Starting Android Emulator (Pixel_7_API_35)..." -ForegroundColor Yellow
Start-Process -FilePath "emulator" -ArgumentList "-avd Pixel_7_API_35"

# 2. Start Backend Server
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# 3. Start React Native Android App
Write-Host "[3/3] Launching React Native App on Emulator..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Connify'; npm run android"

Write-Host "`nAll processes initiated successfully!" -ForegroundColor Green
