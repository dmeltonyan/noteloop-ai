@echo off
echo ========================================
echo   NoteLoop AI Backend Server Starter
echo ========================================
echo.

cd /d %~dp0

echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing/updating dependencies...
pip install -r requirements.txt --quiet

echo.
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python run.py

pause


