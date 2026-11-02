@echo off
setlocal
cd /d "%~dp0"
node -e "if(Number(process.versions.node.split('.')[0])<24)process.exit(1)" >nul 2>&1
if errorlevel 1 (
  echo Install Node.js 24 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist "backend\node_modules\express\package.json" (
  echo Installing backend dependencies. Internet is required on first run.
  call npm --prefix backend ci
  if errorlevel 1 (
    echo Installation failed. Check the error above and try again.
    pause
    exit /b 1
  )
)
set PREVIEW_OPEN_BROWSER=1
echo Starting local preview. Keep this window open.
echo Website lead email needs production configuration. See SETUP_STEPS.md.
call npm run preview
if errorlevel 1 echo Could not start. If port 3080 is busy, close the previous preview window first.
pause
