# Downloads NASA SVS 5313 and extracts the owner's 7 frames (0, 3, 6, 9, 12, 15, 18 s) to data/frames/f0..f6.png.
# Run from the repo root:  powershell -ExecutionPolicy Bypass -File tools/extract-frames.ps1
$ErrorActionPreference = 'Stop'
$video = '.cache/svs5313/nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4'
New-Item -ItemType Directory -Force -Path .cache/svs5313, data/frames | Out-Null
if (-not (Test-Path $video)) {
  Invoke-WebRequest 'https://svs.gsfc.nasa.gov/vis/a000000/a005300/a005313/nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4' -OutFile $video
}
$ffmpeg = (uv run --quiet --no-project --with imageio-ffmpeg python -I -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())").Trim()
Write-Output "FFMPEG=$ffmpeg"
$times = 0, 3, 6, 9, 12, 15, 18
for ($i = 0; $i -lt $times.Count; $i++) {
  & $ffmpeg -hide_banner -loglevel error -y -ss $times[$i] -i $video -frames:v 1 "data/frames/f$i.png"
}
