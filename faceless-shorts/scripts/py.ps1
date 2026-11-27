$VenvPy = "$env:USERPROFILE\.faceless-shorts\venv\Scripts\python.exe"
if (Test-Path $VenvPy) {
    & $VenvPy $args
} else {
    & python $args
}
