param(
    [string]$ApiBase = "http://127.0.0.1:8000/api",
    [ValidateSet("upscale", "rembg", "colorrestore", "objectremove")]
    [string[]]$Features = @("upscale", "rembg", "colorrestore", "objectremove"),
    [string]$ClientIp = "127.0.0.1"
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Push-Location (Join-Path $RepoRoot "backend")

try {
    $CliArgs = @(
        "--api-base", $ApiBase,
        "--features", ($Features -join ","),
        "--client-ip", $ClientIp
    )

    & uv run python scripts/tooling/backend_checks.py usage-limit @CliArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
