# setup_new_pc.ps1 - one-shot, idempotent setup of the Faceless Shorts studio on a new Windows PC.
# Run from anywhere:   powershell -ExecutionPolicy Bypass -File .\setup_new_pc.ps1
#   -CheckOnly    report only: installs nothing, downloads nothing, deletes nothing
#   -SkipModels   do not download the Kokoro / Whisper models
#   -SkipTests    skip the headless-browser, frame and dashboard smoke tests
# Safe to re-run. Writes setup_report.txt next to this script. ASCII only (Windows PowerShell 5.1 safe).
param([switch]$CheckOnly, [switch]$SkipModels, [switch]$SkipTests)

$ErrorActionPreference = 'Continue'
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ROOT
$FH      = Join-Path $ROOT '.faceless-shorts'
$VENV    = Join-Path $FH 'venv'
$VPY     = Join-Path $VENV 'Scripts\python.exe'
$KOKORO  = Join-Path $FH 'kokoro'
$BIN     = Join-Path $ROOT 'bin'
$EXAMPLE = Join-Path $ROOT 'faceless-shorts\styles\deep-dive\example'
$env:FACELESS_HOME = $FH
$results = New-Object System.Collections.ArrayList

function Add-Result($name, $status, $detail) {
  [void]$results.Add([pscustomobject]@{ Check = $name; Status = $status; Detail = $detail })
  $color = 'Gray'; if ($status -eq 'PASS') { $color = 'Green' } elseif ($status -eq 'FAIL') { $color = 'Red' } elseif ($status -eq 'WARN') { $color = 'Yellow' }
  Write-Host ("[{0}] {1}: {2}" -f $status, $name, $detail) -ForegroundColor $color
}
function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [Environment]::GetEnvironmentVariable('Path', 'User')
}
function Have($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Winget-Install($id) {
  if ($CheckOnly) { return $false }
  if (-not (Have 'winget')) { Write-Host "winget not available; install $id by hand." -ForegroundColor Yellow; return $false }
  Write-Host "winget install $id ..." -ForegroundColor Cyan
  winget install --id $id --exact --silent --accept-package-agreements --accept-source-agreements
  Refresh-Path
  return $true
}

Write-Host "== Faceless Shorts studio setup ==  ROOT=$ROOT  CheckOnly=$CheckOnly" -ForegroundColor Cyan

# ---------- 0. machine facts ----------
$os   = (Get-CimInstance Win32_OperatingSystem)
$cpu  = (Get-CimInstance Win32_Processor | Select-Object -First 1)
$gpus = @(Get-CimInstance Win32_VideoController | ForEach-Object { $_.Name })
$ramFreeGB  = [math]::Round($os.FreePhysicalMemory / 1MB, 1)
$ramTotalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
$drive = (Get-Item $ROOT).PSDrive
$freeDiskGB = [math]::Round($drive.Free / 1GB, 1)
$cores = $cpu.NumberOfLogicalProcessors
Add-Result 'machine' 'INFO' ("{0} | {1} | {2} logical cores | RAM {3}/{4} GB free | disk {5} GB free | GPU: {6}" -f $os.Caption, $cpu.Name.Trim(), $cores, $ramFreeGB, $ramTotalGB, $freeDiskGB, ($gpus -join ', '))
if ($freeDiskGB -lt 6) { Add-Result 'disk' 'WARN' "only $freeDiskGB GB free; need about 6 GB" } else { Add-Result 'disk' 'PASS' "$freeDiskGB GB free" }
if ($ROOT -match 'OneDrive') { Add-Result 'path' 'WARN' 'project is inside OneDrive; sync can corrupt renders. Move it, e.g. to C:\Studio' }
elseif ($ROOT -match '\s') { Add-Result 'path' 'WARN' 'project path contains spaces; works, but a path without spaces is safer' }
else { Add-Result 'path' 'PASS' $ROOT }
$hasNvidia = [bool]($gpus | Where-Object { $_ -match 'NVIDIA' })
$hasAmd    = [bool]($gpus | Where-Object { $_ -match 'AMD|Radeon' })
$hasDiscrete = $hasNvidia -or $hasAmd

# ---------- 1. Node.js 22+ ----------
if (-not (Have 'node')) { [void](Winget-Install 'OpenJS.NodeJS.LTS') }
if (Have 'node') {
  $nv = (node -v).TrimStart('v'); $nmaj = [int]($nv.Split('.')[0])
  if ($nmaj -ge 22) { Add-Result 'node' 'PASS' "v$nv" } else { Add-Result 'node' 'FAIL' "v$nv is too old; need 22+ (winget install OpenJS.NodeJS.LTS)" }
} else { Add-Result 'node' 'FAIL' 'missing (winget install OpenJS.NodeJS.LTS, then reopen the shell)' }

# ---------- 2. uv ----------
if (-not (Have 'uv')) { [void](Winget-Install 'astral-sh.uv') }
if (Have 'uv') { Add-Result 'uv' 'PASS' ((uv --version) -join ' ') } else { Add-Result 'uv' 'FAIL' 'missing (winget install astral-sh.uv, then reopen the shell)' }

# ---------- 3. Chrome / Edge ----------
$browsers = @(
  $env:CHROME,
  'C:\Program Files\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
  'C:\Program Files\Microsoft\Edge\Application\msedge.exe')
$browser = $browsers | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $browser) { [void](Winget-Install 'Google.Chrome'); $browser = $browsers | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1 }
if ($browser) { Add-Result 'browser' 'PASS' $browser } else { Add-Result 'browser' 'FAIL' 'no Chrome/Edge found (install Chrome or set CHROME=<path>)' }

# ---------- 4. ffmpeg into bin\ ----------
$ffOk = (Test-Path (Join-Path $BIN 'ffmpeg.exe')) -and (Test-Path (Join-Path $BIN 'ffprobe.exe'))
if (-not $ffOk -and -not $CheckOnly) {
  New-Item -ItemType Directory -Force $BIN | Out-Null
  $src = $null
  if (Have 'ffmpeg') { $src = Split-Path (Get-Command ffmpeg).Source -Parent }
  if (-not $src -or -not (Test-Path (Join-Path $src 'ffprobe.exe'))) {
    [void](Winget-Install 'Gyan.FFmpeg')
    $found = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match 'Gyan' } | Select-Object -First 1
    if ($found) { $src = $found.DirectoryName }
  }
  if ($src) { foreach ($f in 'ffmpeg.exe','ffprobe.exe') { Copy-Item (Join-Path $src $f) $BIN -Force -ErrorAction SilentlyContinue } }
  $ffOk = (Test-Path (Join-Path $BIN 'ffmpeg.exe')) -and (Test-Path (Join-Path $BIN 'ffprobe.exe'))
}
if ($ffOk) {
  $fv = (& (Join-Path $BIN 'ffmpeg.exe') -version | Select-Object -First 1)
  $enc = (& (Join-Path $BIN 'ffmpeg.exe') -hide_banner -encoders) -join "`n"
  $hasX264 = $enc -match 'libx264'; $hasAac = $enc -match '\baac\b'
  if ($hasX264 -and $hasAac) { Add-Result 'ffmpeg' 'PASS' "$fv (libx264 + aac)" } else { Add-Result 'ffmpeg' 'FAIL' 'bin\ffmpeg.exe lacks libx264 or aac; use the Gyan full build' }
  $nvenc = $enc -match 'h264_nvenc'
  if ($hasNvidia -and $nvenc) { Add-Result 'gpu-encode' 'INFO' 'NVIDIA + h264_nvenc available (project pipeline still uses libx264 for quality)' }
} else { Add-Result 'ffmpeg' 'FAIL' 'bin\ffmpeg.exe / ffprobe.exe missing (winget install Gyan.FFmpeg, copy both exe into bin\)' }

# ---------- 5. Python venv (never portable: always verify, rebuild if broken) ----------
$venvOk = $false
if (Test-Path $VPY) { & $VPY -c "import sys" 2>$null; if ($LASTEXITCODE -eq 0) { $venvOk = $true } }
if (-not $venvOk -and -not $CheckOnly -and (Have 'uv')) {
  if (Test-Path $VENV) { Write-Host 'Venv missing or broken (copied from another PC?). Rebuilding.' -ForegroundColor Yellow; Remove-Item $VENV -Recurse -Force }
  New-Item -ItemType Directory -Force $FH | Out-Null
  uv venv --python 3.13 $VENV
  if ($LASTEXITCODE -ne 0) { uv venv --python 3.11 $VENV }
  if (Test-Path $VPY) { & $VPY -c "import sys" 2>$null; if ($LASTEXITCODE -eq 0) { $venvOk = $true } }
}
$importsOk = $false
if ($venvOk) {
  & $VPY -c "import numpy, scipy, kokoro_onnx, faster_whisper" 2>$null
  if ($LASTEXITCODE -eq 0) { $importsOk = $true }
  elseif (-not $CheckOnly -and (Have 'uv')) {
    uv pip install --python $VPY numpy scipy kokoro-onnx faster-whisper
    & $VPY -c "import numpy, scipy, kokoro_onnx, faster_whisper" 2>$null
    if ($LASTEXITCODE -eq 0) { $importsOk = $true }
  }
}
if ($venvOk) { Add-Result 'venv python' 'PASS' ((& $VPY --version) -join ' ') } else { Add-Result 'venv python' 'FAIL' 'venv missing/broken' }
if ($importsOk) { Add-Result 'python packages' 'PASS' 'numpy scipy kokoro_onnx faster_whisper import OK' } else { Add-Result 'python packages' 'FAIL' 'imports failed (uv pip install --python <venv python> numpy scipy kokoro-onnx faster-whisper)' }

# ---------- 6. Models ----------
$kOnnx = Join-Path $KOKORO 'kokoro-v1.0.onnx'; $kVoices = Join-Path $KOKORO 'voices-v1.0.bin'
if (-not ((Test-Path $kOnnx) -and (Test-Path $kVoices)) -and $importsOk -and -not $CheckOnly -and -not $SkipModels) {
  & $VPY (Join-Path $ROOT 'faceless-shorts\scripts\voice.py') --download
}
if ((Test-Path $kOnnx) -and (Test-Path $kVoices)) { Add-Result 'kokoro model' 'PASS' $KOKORO } else { Add-Result 'kokoro model' 'FAIL' 'missing (voice.py --download with FACELESS_HOME set)' }

$whisperOk = $false
if ($importsOk -and -not $SkipModels) {
  $hf = Join-Path $env:USERPROFILE '.cache\huggingface\hub\models--Systran--faster-whisper-small.en'
  if (Test-Path $hf) { $whisperOk = $true }
  elseif (-not $CheckOnly) {
    & $VPY -c "from faster_whisper import WhisperModel; WhisperModel('small.en', device='cpu', compute_type='int8')"
    if ($LASTEXITCODE -eq 0) { $whisperOk = $true }
  }
  if ($whisperOk) { Add-Result 'whisper model' 'PASS' 'small.en cached' } else { Add-Result 'whisper model' 'FAIL' 'small.en not cached (needs internet once)' }
}

# ---------- 7. studio.cmd status ----------
$st = (cmd /c "`"$ROOT\studio.cmd`" status") -join ' | '
if ($st -match 'Kokoro TTS model: OK') { Add-Result 'studio.cmd status' 'PASS' $st } else { Add-Result 'studio.cmd status' 'FAIL' $st }

# ---------- 8. smoke tests ----------
if (-not $SkipTests -and $browser -and (Have 'node') -and (Test-Path $EXAMPLE)) {
  Push-Location $EXAMPLE
  $env:PATH = "$BIN;$env:PATH"
  $chk = (node tools/capture.mjs check 2>&1) -join "`n"
  if ($chk -match 'CHECK OK') { Add-Result 'capture check' 'PASS' 'CHECK OK (headless browser boots, shots load)' } else { Add-Result 'capture check' 'FAIL' (($chk -split "`n" | Select-Object -Last 4) -join ' | ') }
  $out = 'review/_setuptest'
  node tools/capture.mjs frames $out "1.0" 2>&1 | Out-Null
  $jpg = Get-ChildItem (Join-Path $EXAMPLE 'review\_setuptest') -Filter *.jpg -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($jpg -and $jpg.Length -gt 5000) { Add-Result 'frame capture' 'PASS' ("{0} ({1} KB)" -f $jpg.Name, [math]::Round($jpg.Length/1KB)) } else { Add-Result 'frame capture' 'FAIL' 'no frame written' }
  Remove-Item (Join-Path $EXAMPLE 'review\_setuptest') -Recurse -Force -ErrorAction SilentlyContinue
  Pop-Location
}
if (-not $SkipTests -and $venvOk) {
  $busy = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
  if ($busy) { Add-Result 'dashboard' 'WARN' 'port 3000 already in use; skipped server test' }
  else {
    $p = Start-Process -FilePath $VPY -ArgumentList ('"' + (Join-Path $ROOT 'server.py') + '"') -WorkingDirectory $ROOT -WindowStyle Hidden -PassThru
    Start-Sleep -Seconds 3
    try { $r = Invoke-WebRequest 'http://127.0.0.1:3000/api/schedule' -UseBasicParsing -TimeoutSec 8; Add-Result 'dashboard' 'PASS' "GET /api/schedule -> $($r.StatusCode)" }
    catch { Add-Result 'dashboard' 'FAIL' $_.Exception.Message }
    if ($p -and -not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
  }
}

# ---------- 9. render plan for this hardware ----------
$workers = 1
if ($ramFreeGB -ge 6 -and $cores -ge 4) { $workers = 2 }
$plan = "workers=$workers (each worker needs ~2+ GB RAM; >2 gains little)"
if ($hasDiscrete) { $plan += '; discrete GPU present: 3D styles render at full quality, expect well under 0.5 s/frame' }
else { $plan += '; no discrete GPU: for 3D styles set SOFTWARE_GL=1, QS=&res=0.6&aa=0&shadow=1024, FPS=24 (~2 s/frame); canvas styles ~0.5 s/frame' }
Add-Result 'render plan' 'INFO' $plan

# ---------- report ----------
$rep = Join-Path $ROOT 'setup_report.txt'
$results | Format-Table -AutoSize -Wrap | Out-String -Width 250 | Set-Content -Path $rep -Encoding ASCII
$fails = @($results | Where-Object { $_.Status -eq 'FAIL' }).Count
Write-Host ""
if ($fails -eq 0) { Write-Host "ALL CHECKS PASSED. Report: $rep" -ForegroundColor Green; exit 0 }
else { Write-Host "$fails check(s) FAILED. See above and $rep" -ForegroundColor Red; exit 1 }
