@echo off
setlocal
cd /d "%~dp0"

if not exist "node_modules" (
  echo [tankPK] Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo [tankPK] npm install failed.
    pause
    exit /b 1
  )
)

echo [tankPK] Starting local server...
call npm start

if errorlevel 1 (
  echo.
  echo [tankPK] Failed to start the project.
  pause
  exit /b 1
)
