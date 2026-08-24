#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

command -v uv >/dev/null 2>&1 || {
  echo "[ERROR] uv is required. Install uv before starting PixelForge." >&2
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "[ERROR] npm is required to start the frontend." >&2
  exit 1
}

if [[ ! -f "$repo_root/frontend/package.json" ]]; then
  echo "[ERROR] frontend/package.json not found." >&2
  exit 1
fi
if [[ ! -f "$repo_root/backend/pyproject.toml" ]]; then
  echo "[ERROR] backend/pyproject.toml not found." >&2
  exit 1
fi

echo "[INFO] Project root: $repo_root"

if ! (
  cd "$repo_root/frontend"
  npm ls --depth=0 >/dev/null 2>&1
); then
  echo "[INFO] Frontend dependencies not found. Installing from package-lock.json..."
  (
    cd "$repo_root/frontend"
    npm ci
  )
else
  echo "[INFO] Frontend dependencies found."
fi

echo "[INFO] Verifying backend environment from uv.lock..."
(
  cd "$repo_root/backend"
  uv sync --locked
)

frontend_pid=""
backend_pid=""

cleanup() {
  if [[ -n "$frontend_pid" ]]; then
    kill "$frontend_pid" 2>/dev/null || true
  fi
  if [[ -n "$backend_pid" ]]; then
    kill "$backend_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

(
  cd "$repo_root/frontend"
  npm run dev
) &
frontend_pid=$!

(
  cd "$repo_root/backend"
  uv run python run.py
) &
backend_pid=$!

wait "$frontend_pid" "$backend_pid"
