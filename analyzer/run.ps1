# Compile, self-check, generate site/song-data.json, validate it. Run from the repo root.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

javac -d analyzer/out (Get-ChildItem analyzer/src/radical/*.java, analyzer/test/radical/*.java).FullName
if ($LASTEXITCODE -ne 0) { throw 'compile failed' }

java -ea -cp analyzer/out radical.SelfCheck
if ($LASTEXITCODE -ne 0) { throw 'self-check failed' }

java -cp analyzer/out radical.Main data/frames site/song-data.json
if ($LASTEXITCODE -ne 0) { throw 'Main failed' }

python -I -c "import json;json.load(open('site/song-data.json',encoding='utf-8'))"
if ($LASTEXITCODE -ne 0) { throw 'song-data.json is not valid JSON' }
Write-Host 'OK: site/song-data.json written and valid'
