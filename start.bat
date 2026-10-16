@echo off
setlocal enabledelayedexpansion

title AI Job Simulator - Automated Launcher
echo ========================================================
echo        AI Job Simulator - Hackathon Project
echo ========================================================
echo.

REM 1. Check Python installation
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found on your system!
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

REM 2. Check Node.js installation
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM 3. Check / Create backend .env
if not exist "%~dp0backend\.env" (
    echo [Setup] backend\.env not found. Creating from .env.example...
    if exist "%~dp0backend\.env.example" (
        copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    ) else (
        echo GOOGLE_API_KEY=your_key_here> "%~dp0backend\.env"
    )
    echo.
    echo --------------------------------------------------------
    echo [API KEY REQUIRED]
    echo Get your free Gemini key at: https://aistudio.google.com/app/apikey
    echo Paste your key below and press Enter:
    set /p USER_KEY="> "
    if defined USER_KEY (
        echo GOOGLE_API_KEY=!USER_KEY!> "%~dp0backend\.env"
        echo [OK] API key saved to backend\.env
    ) else (
        echo [NOTE] You can edit backend\.env later with your API key.
    )
    echo --------------------------------------------------------
    echo.
)

REM 4. Check and install Python dependencies
echo [1/3] Checking backend dependencies...
python -c "import fastapi, google.generativeai, json_repair" >nul 2>nul
if %errorlevel% neq 0 (
    echo [Setup] Installing backend Python packages (one-time setup)...
    cd /d "%~dp0backend"
    pip install -r requirements.txt
    cd /d "%~dp0"
    echo [OK] Backend packages installed.
) else (
    echo [OK] Backend dependencies ready.
)

REM 5. Check and install Frontend dependencies
echo [2/3] Checking frontend dependencies...
if not exist "%~dp0frontend\node_modules" (
    echo [Setup] Installing frontend npm packages (one-time setup)...
    cd /d "%~dp0frontend"
    call npm install --legacy-peer-deps
    cd /d "%~dp0"
    echo [OK] Frontend packages installed.
) else (
    echo [OK] Frontend dependencies ready.
)

REM 6. Start servers
echo [3/3] Starting servers...
echo.
echo Starting FastAPI backend on http://localhost:8000 ...
start "AI Job Simulator - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting React frontend on http://localhost:5173 ...
start "AI Job Simulator - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Simulation is running!
echo   Open your browser to: http://localhost:5173
echo   (Recommended: Use Chrome or Edge for Speech and Camera)
echo ========================================================
echo.
pause
