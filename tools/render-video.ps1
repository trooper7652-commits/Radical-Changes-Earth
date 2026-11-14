# Makes the site's muted visuals: the first 20.25 s of NASA SVS 5313, cropped to the analysis window,
# slowed to 0.75x so it lasts the song's 27 s.
# Run from the repo root:  powershell -ExecutionPolicy Bypass -File tools/render-video.ps1
$ErrorActionPreference = 'Stop'
$video = '.cache/svs5313/nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4'
$visuals = 'site/media/nasa-5313-slowed.mp4'
if (-not (Test-Path $video)) {
  powershell -ExecutionPolicy Bypass -File tools/extract-frames.ps1   # downloads the video
}
New-Item -ItemType Directory -Force -Path site/media | Out-Null
$ffmpeg = (uv run --quiet --no-project --with imageio-ffmpeg python -I -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())").Trim()

& $ffmpeg -hide_banner -loglevel error -y -t 20.25 -i $video `
  -vf 'crop=3840:2160:1920:0,setpts=PTS/0.75,scale=1920:1080' `
  -c:v libx264 -pix_fmt yuv420p -crf 23 -preset medium -an $visuals
if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed making $visuals" }

# ffmpeg prints the file's duration on stderr; cmd merges it so PowerShell 5.1 does not treat it as an error.
$info = cmd /c "`"$ffmpeg`" -hide_banner -i `"$visuals`" 2>&1" | Out-String
if ($info -notmatch 'Duration: (\d+):(\d+):(\d+\.\d+)') { throw "Could not read the duration of $visuals" }
$seconds = [int]$Matches[1] * 3600 + [int]$Matches[2] * 60 + [double]$Matches[3]
if ([math]::Abs($seconds - 27.0) -gt 0.05) { throw "$visuals lasts $seconds s, expected 27.0 +/- 0.05" }
Write-Output "OK $visuals $seconds s"
