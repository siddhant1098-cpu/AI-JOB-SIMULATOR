@echo off
title AI Job Simulator Launcher
echo ========================================================
echo        AI Job Simulator - Assessment Platform
echo ========================================================
echo.

REM 1. Free up ports 8000 and 5173 if they were left open from previous runs
echo [1/4] Clearing any lingering processes on ports 8000 and 5173...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /t /pid %%p >nul 2>&1
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /t /pid %%p >nul 2>&1

REM 2. Check and prepare backend
echo.
echo [2/4] Checking Python backend dependencies...
cd /d "%~dp0backend"

REM Auto-create .env from .env.example if missing
if not exist .env if exist .env.example copy .env.example .env >nul

if exist "venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0backend\venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=py -3.12"
)

%PYTHON_EXE% -c "import uvicorn, fastapi, pdfplumber, crewai" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python dependencies not found. Installing requirements...
    if exist "venv\Scripts\pip.exe" (
        venv\Scripts\pip.exe install -r requirements.txt
    ) else (
        py -3.12 -m pip install -r requirements.txt || pip install -r requirements.txt
    )
) else (
    echo Python dependencies are already installed.
)

REM 3. Check and prepare frontend
echo.
echo [3/4] Checking frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Frontend packages not installed. Running npm install...
    call npm install
) else (
    echo Frontend dependencies are already installed.
)

REM 4. Start Servers in separate windows
echo.
echo [4/4] Launching Backend and Frontend servers...
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    start "AI Job Simulator - Backend" cmd /k "venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"
) else (
    start "AI Job Simulator - Backend" cmd /k "py -3.12 -m uvicorn main:app --reload --port 8000 || py -m uvicorn main:app --reload --port 8000"
)

REM 2-second pause to let backend initialize
ping 127.0.0.1 -n 3 >nul

cd /d "%~dp0frontend"
start "AI Job Simulator - Frontend" cmd /k "call npm run dev || node ./node_modules/vite/bin/vite.js"

echo.
echo ========================================================
echo   Both servers have been launched!
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:5173
echo ========================================================
echo.
pause
