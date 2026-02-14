@echo off
setlocal

REM Always run from the folder where this BAT lives
cd /d "%~dp0"

echo ==========================================
echo Starting IncidentTracker (Windows)
echo Root: %CD%
echo ==========================================

REM Basic folder checks
if not exist backend (
  echo ERROR: backend folder not found.
  pause
  exit /b 1
)

if not exist frontend (
  echo ERROR: frontend folder not found.
  pause
  exit /b 1
)

REM Check node/npm are available
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found in PATH.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found in PATH.
  pause
  exit /b 1
)

echo.
echo Opening Backend window...
start "Backend" cmd /k "cd /d %CD%\backend && npm install && npm start"

echo.
echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul

echo.
echo Opening Frontend window...
start "Frontend" cmd /k "cd /d %CD%\frontend && npm install && npm run dev"

echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause
