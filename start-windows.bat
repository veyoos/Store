@echo off
rem Double-click this file on Windows to run the site.
cd /d "%~dp0"
python serve.py
if errorlevel 1 py serve.py
pause
