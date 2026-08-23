$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
Push-Location (Join-Path $RepoRoot "backend")

try {
    & uv run python (Join-Path $RepoRoot "scripts\tooling\line_count.py") @args
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
