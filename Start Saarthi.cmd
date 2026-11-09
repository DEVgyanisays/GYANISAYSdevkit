@echo off
cd /d "%~dp0backend"
if exist "..\runtime\node.exe" (
  "..\runtime\node.exe" --env-file-if-exists=.env scripts/open-workspace.mjs
) else (
  node --env-file-if-exists=.env scripts/open-workspace.mjs
)
if errorlevel 1 pause
