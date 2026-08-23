@echo off
setlocal EnableExtensions

for %%I in ("%~dp0..\..") do set "ROOT=%%~fI"
set "BACKEND=%ROOT%\backend"

where uv >nul 2>nul
if errorlevel 1 (
  echo [ERROR] uv is required. Install uv before running reset_usage.
  exit /b 1
)

if not exist "%BACKEND%\scripts\reset_usage.py" (
  echo [ERROR] backend\scripts\reset_usage.py not found.
  exit /b 1
)

cd /d "%BACKEND%"
uv run python scripts\reset_usage.py
set "EXIT_CODE=%ERRORLEVEL%"

endlocal & exit /b %EXIT_CODE%
