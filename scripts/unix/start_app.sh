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
  uv sync --locked
  uv run python run.py
) &
backend_pid=$!

wait "$frontend_pid" "$backend_pid"
