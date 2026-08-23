@echo off
setlocal EnableExtensions

for %%I in ("%~dp0..\..") do set "ROOT=%%~fI"
set "FRONTEND=%ROOT%\frontend"
set "BACKEND=%ROOT%\backend"

where uv >nul 2>nul
if errorlevel 1 (
  echo [ERROR] uv is required. Install uv before starting PixelForge.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is required to start the frontend.
  exit /b 1
)

if not exist "%FRONTEND%\package.json" (
  echo [ERROR] frontend\package.json not found.
  exit /b 1
)

if not exist "%BACKEND%\pyproject.toml" (
  echo [ERROR] backend\pyproject.toml not found.
  exit /b 1
)

echo [INFO] Project root: %ROOT%

start "PixelForge React Frontend" cmd /k "cd /d ""%FRONTEND%"" && npm run dev"
start "PixelForge FastAPI Backend" cmd /k "cd /d ""%BACKEND%"" && uv sync --locked && uv run python run.py"

endlocal
exit /b 0
