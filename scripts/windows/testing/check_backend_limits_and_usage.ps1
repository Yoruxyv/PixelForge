param(
    [string]$ApiBase = "http://127.0.0.1:8000/api",
    [ValidateSet("upscale", "rembg", "colorrestore", "objectremove")]
    [string]$Feature = "upscale"
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Push-Location (Join-Path $RepoRoot "backend")

try {
    $CliArgs = @("--api-base", $ApiBase, "--feature", $Feature)

    & uv run python scripts/tooling/backend_checks.py public-runtime @CliArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
