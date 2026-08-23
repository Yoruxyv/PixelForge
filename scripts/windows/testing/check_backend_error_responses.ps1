param(
    [string]$ApiBase = "http://127.0.0.1:8000/api"
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Push-Location (Join-Path $RepoRoot "backend")

try {
    $CliArgs = @("--api-base", $ApiBase)

    & uv run python scripts/tooling/backend_checks.py error-responses @CliArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
