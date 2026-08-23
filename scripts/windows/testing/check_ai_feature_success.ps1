param(
    [string]$ApiBase = "http://127.0.0.1:8000/api",
    [ValidateSet("upscale", "rembg", "colorrestore", "objectremove")]
    [string]$Feature = "upscale",
    [string]$FilePath = "",
    [ValidateRange(1, 4)]
    [int]$Scale = 2,
    [string]$MaskPath = "",
    [double]$PollIntervalSeconds = 3,
    [int]$MaxPollAttempts = 80
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Push-Location (Join-Path $RepoRoot "backend")

try {
    $CliArgs = @(
        "--api-base", $ApiBase,
        "--feature", $Feature,
        "--scale", $Scale,
        "--poll-interval-seconds", $PollIntervalSeconds,
        "--max-poll-attempts", $MaxPollAttempts
    )

    if (-not [string]::IsNullOrWhiteSpace($FilePath)) {
        $CliArgs += @("--file-path", $FilePath)
    }

    if (-not [string]::IsNullOrWhiteSpace($MaskPath)) {
        $CliArgs += @("--mask-path", $MaskPath)
    }

    & uv run python scripts/tooling/backend_checks.py ai-success @CliArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
