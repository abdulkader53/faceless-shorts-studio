@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "SKILL=%SCRIPT_DIR%.."

if "%~1"=="" goto usage
if "%~1"=="--list" (
    for /d %%D in ("%SKILL%\styles\*") do echo %%~nxD
    exit /b 0
)

set "STYLE=%~1"
set "NAME=%~2"
if "%NAME%"=="" goto usage

set "PARENT=%~3"
if "%PARENT%"=="" set "PARENT=%USERPROFILE%\faceless-shorts"

set "SRC=%SKILL%\styles\%STYLE%\example"
if not exist "%SRC%" (
    echo no style '%STYLE%'
    exit /b 2
)

set "DST=%PARENT%\%NAME%"
if exist "%DST%" (
    echo %DST% already exists: pick another name
    exit /b 2
)

xcopy /E /I /Q "%SRC%" "%DST%" >nul
if not exist "%DST%\renders" mkdir "%DST%\renders"
if not exist "%DST%\review" mkdir "%DST%\review"
if exist "%DST%\data\narration.wav" del "%DST%\data\narration.wav"
if exist "%DST%\data\mix.wav" del "%DST%\data\mix.wav"

echo %DST%
echo style: %STYLE%. Read %SKILL%\styles\%STYLE%\STYLE.md, then rewrite script.json + src/shots.js
exit /b 0

:usage
echo usage: new_video.cmd ^<style^> ^<short-name^> [parent-dir]
exit /b 2
