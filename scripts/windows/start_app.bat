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

pushd "%FRONTEND%"
call npm ls --depth=0 >nul 2>nul
if errorlevel 1 (
  echo [INFO] Frontend dependencies not found. Installing from package-lock.json...
  call npm ci
  if errorlevel 1 (
    popd
    echo [ERROR] Frontend dependency installation failed.
    exit /b 1
  )
) else (
  echo [INFO] Frontend dependencies found.
)
popd

echo [INFO] Verifying backend environment from uv.lock...
pushd "%BACKEND%"
uv sync --locked
if errorlevel 1 (
  popd
  echo [ERROR] Backend dependency installation failed.
  exit /b 1
)
popd

start "PixelForge React Frontend" cmd /k "cd /d ""%FRONTEND%"" && npm run dev"
start "PixelForge FastAPI Backend" cmd /k "cd /d ""%BACKEND%"" && uv run python run.py"

endlocal
exit /b 0
