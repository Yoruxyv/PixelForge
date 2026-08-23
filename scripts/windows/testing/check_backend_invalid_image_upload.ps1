param(
    [string]$ApiBase = "http://127.0.0.1:8000/api",
    [ValidateSet("upscale", "rembg", "colorrestore", "objectremove")]
    [string]$Feature = "upscale",
    [double]$PollIntervalSeconds = 2,
    [int]$MaxPollAttempts = 20
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Push-Location (Join-Path $RepoRoot "backend")

try {
    $CliArgs = @(
        "--api-base", $ApiBase,
        "--feature", $Feature,
        "--poll-interval-seconds", $PollIntervalSeconds,
        "--max-poll-attempts", $MaxPollAttempts
    )

    & uv run python scripts/tooling/backend_checks.py invalid-image @CliArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
