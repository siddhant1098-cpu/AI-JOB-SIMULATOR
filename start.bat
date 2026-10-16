@echo off
title AI Job Simulator Launcher
echo ========================================================
echo        AI Job Simulator - Hackathon Project
echo ========================================================
echo.

REM 1. Free up ports 8000 and 5173 if they were left open from previous runs
echo [1/3] Clearing any lingering processes on ports 8000 and 5173...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /t /pid %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /t /pid %%p >nul 2>&1

REM 2. Start FastAPI Backend on port 8000
echo [2/3] Starting FastAPI backend on http://localhost:8000 ...
cd /d "%~dp0backend"
start "AI Job Simulator - Backend" cmd /k "py -m uvicorn main:app --reload --port 8000 || python -m uvicorn main:app --reload --port 8000"

REM Brief pause to let backend initialize
timeout /t 2 /nobreak >nul

REM 3. Start Vite React Frontend on port 5173
echo [3/3] Starting React frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
start "AI Job Simulator - Frontend" cmd /k "npm run dev || node ./node_modules/vite/bin/vite.js"

echo.
echo ========================================================
echo   Both servers are started in separate terminal windows!
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:5173
echo ========================================================
echo.
pause
