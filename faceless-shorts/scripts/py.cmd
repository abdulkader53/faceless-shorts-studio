@echo off
set "VENV_PY=%~dp0..\..\.faceless-shorts\venv\Scripts\python.exe"
if not exist "%VENV_PY%" (
    set "VENV_PY=%USERPROFILE%\.faceless-shorts\venv\Scripts\python.exe"
)
if exist "%VENV_PY%" (
    "%VENV_PY%" %*
) else (
    python %*
)
