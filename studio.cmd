@echo off
setlocal
set "ROOT=%~dp0"
set "VENV_PY=%ROOT%.faceless-shorts\venv\Scripts\python.exe"
set "PATH=%ROOT%bin;%PATH%"
set "FACELESS_HOME=%ROOT%.faceless-shorts"

if "%~1"=="" goto help
if "%~1"=="app" goto open_app
if "%~1"=="status" goto status
if "%~1"=="mine" goto mine
if "%~1"=="scripts" goto scripts
if "%~1"=="create" goto create_project
if "%~1"=="sfx" goto sfx
if "%~1"=="ctr" goto ctr
if "%~1"=="voices" goto voices
goto help

:open_app
echo ======================================================================
echo Starting YouTube Content Studio Platform Bridge on http://127.0.0.1:3000
echo ======================================================================
start "YouTube Studio Bridge" "%VENV_PY%" "%ROOT%server.py"
timeout /t 2 /nobreak >nul
start http://127.0.0.1:3000/
echo [OK] Platform launched in your default browser!
echo Bridge server is running in the background. Press any key to stop it.
pause >nul
taskkill /fi "WINDOWTITLE eq YouTube Studio Bridge*" /f >nul 2>&1
exit /b 0

:status
echo [1/3] Checking FFmpeg...
"%ROOT%bin\ffmpeg.exe" -version 2>nul | findstr /C:"ffmpeg version"
echo [2/3] Checking Python Virtual Environment...
"%VENV_PY%" --version
echo [3/3] Checking Kokoro AI Voice Model...
if exist "%ROOT%.faceless-shorts\kokoro\kokoro-v1.0.onnx" (
    echo Kokoro TTS model: OK (Ready)
) else (
    echo Kokoro TTS model: MISSING
)
exit /b 0

:mine
"%VENV_PY%" "%ROOT%tools\trend_miner.py" --niche all --save
exit /b 0

:scripts
"%VENV_PY%" "%ROOT%tools\script_architect.py" --list
exit /b 0

:create_project
if "%~2"=="" (
    echo Usage: studio.cmd create ^<script_key^>
    echo Example: studio.cmd create caligula_ocean
    echo Example: studio.cmd create shrimp_punch
    echo Run 'studio.cmd scripts' to see all ready script keys.
    exit /b 1
)
"%VENV_PY%" "%ROOT%tools\script_architect.py" --create %~2
exit /b 0

:sfx
"%VENV_PY%" "%ROOT%tools\sfx_vault.py"
exit /b 0

:ctr
if "%~2"=="" (
    echo Usage: studio.cmd ctr ^<project_path^>
    echo Example: studio.cmd ctr channel-history\shorts\caligula_ocean
    exit /b 1
)
"%VENV_PY%" "%ROOT%tools\ctr_booster.py" %~2
exit /b 0

:voices
"%VENV_PY%" "%ROOT%faceless-shorts\scripts\voice.py" --list
exit /b 0

:help
echo ======================================================================
echo          AI FACELESS SHORTS STUDIO - COMMAND CENTER
echo ======================================================================
echo WORKFLOW COMMANDS:
echo   studio.cmd app                Launch Interactive Content Planning Dashboard
echo   studio.cmd status             Verify system health (FFmpeg, Python, AI)
echo   studio.cmd mine               Mine viral hooks for History and Wildlife
echo   studio.cmd scripts            List production-ready retention scripts
echo   studio.cmd create ^<key^>       Build project for a script (e.g. caligula_ocean)
echo   studio.cmd ctr ^<project^>      Generate viral titles, tags, and covers
echo   studio.cmd sfx                Regenerate broadcast sound effects vault
echo   studio.cmd voices             List 10 studio narrator voices
echo.
echo CHANNELS:
echo   channel-history\shorts\       (Paper Atlas, Tall Tale, Night File)
echo   channel-wildlife\shorts\      (Deep Dive, Inside Out, Stick Story)
echo ======================================================================
exit /b 0
