# PixelForge Testing

This guide lists local verification commands for the backend API, AI pipeline,
usage limits, frontend build, and repository quality checks.

The PowerShell and Bash wrappers under `scripts/windows/testing/` and `scripts/unix/testing/` call the same shared
Python implementation in `backend/scripts/tooling/backend_checks.py`. This keeps
arguments, validation, output, and failure semantics aligned across Windows,
Linux, and macOS.

## Prerequisites

- `uv` for the backend environment and Python tooling.
- `npm` for frontend checks.
- A running local backend for API smoke checks.
- PostgreSQL plus `DATABASE_URL` (environment or `backend/.env`) for the
  usage-limit check.
- Azure Blob Storage, Replicate, and a valid local backend configuration for
  full AI success checks.
- Local Turnstile bypass enabled where a test explicitly uses it:

```env
ENVIRONMENT=development
ALLOW_TURNSTILE_TEST_BYPASS=true
```

Never enable the manual bypass in production.

---

## Start the Application

Windows:

```powershell
.\scripts\windows\start_app.bat
```

Linux/macOS:

```bash
./scripts/unix/start_app.sh
```

Or start each side manually in separate terminals.

Backend:

```bash
cd backend
uv sync --locked
uv run python run.py
```

Frontend:

```bash
cd frontend
npm run dev
```

---

## Backend API Checks

### Public runtime limits and usage

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_limits_and_usage.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_limits_and_usage.sh
```

Optional Bash arguments include `--api-base` and `--feature`. PowerShell exposes
the equivalent `-ApiBase` and `-Feature` parameters.

### Structured error responses

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_error_responses.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_error_responses.sh
```

### Invalid-image background failure

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_invalid_image_upload.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_invalid_image_upload.sh
```

This check requires a running backend and configured Azure storage. It uploads
invalid bytes through the normal SAS upload path, starts a background job, and
asserts the structured `INVALID_IMAGE` result.

---

## Usage-Limit Checks

Windows PowerShell:

```powershell
.\scripts\windows\testing\check_backend_usage_limit.ps1
```

Linux/macOS:

```bash
./scripts/unix/testing/check_backend_usage_limit.sh
```

The check temporarily seeds the local PostgreSQL usage table to each selected
feature limit, validates the structured HTTP 429 `RATE_LIMITED` response, and
restores the previous current-hour state in a `finally` path.

Covered features:

- `upscale`
- `rembg`
- `colorrestore`
- `objectremove`

PowerShell accepts `-Features upscale,rembg`. Bash accepts
`--features upscale,rembg`.

Because quota identity is IP-based, these checks validate backend behavior but
do not remove the known shared-NAT/shared-proxy limitation.

---

## AI Success Checks

The success wrappers exercise initialization, Azure upload, feature start,
polling, and the final downloadable result URL.

Upscale, Windows PowerShell:

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 -Feature upscale -Scale 2
```

Upscale, Linux/macOS:

```bash
./scripts/unix/testing/check_ai_feature_success.sh --feature upscale --scale 2
```

Remove Background:

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature rembg `
  -FilePath ".\frontend\public\demo\rem_bg_before.jpg"
```

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature rembg \
  --file-path "./frontend/public/demo/rem_bg_before.jpg"
```

Restore Color:

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature colorrestore `
  -FilePath ".\frontend\public\demo\res_color_before.jpg"
```

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature colorrestore \
  --file-path "./frontend/public/demo/res_color_before.jpg"
```

Object Remove requires a source image and a same-size mask. Black mask pixels
keep the area and white pixels remove the area.

```powershell
.\scripts\windows\testing\check_ai_feature_success.ps1 `
  -Feature objectremove `
  -FilePath ".\frontend\public\demo\object_remove_before.png" `
  -MaskPath ".\frontend\public\demo\object_remove_test_mask.png"
```

```bash
./scripts/unix/testing/check_ai_feature_success.sh \
  --feature objectremove \
  --file-path "./frontend/public/demo/object_remove_before.png" \
  --mask-path "./frontend/public/demo/object_remove_test_mask.png"
```

Create the mask with Pillow or another image tool before running the object
removal check.

---

## Turnstile Flow Check

For every AI job:

1. Confirm the frontend receives a Turnstile token.
2. Confirm `POST /api/{feature}/init` verifies it.
3. Complete or fail the job.
4. Start another job and confirm a fresh token is requested.

Also submit feedback once and confirm it performs its own verification. In a
non-development environment, temporarily removing the secret must cause
verification to fail closed rather than bypassing protection.

---

## Frontend Checks

These commands are the same on Windows, Linux, and macOS:

```bash
cd frontend
npm ci
npm run lint
npm run test -- --run
npm run build
```

---

## Backend Quality Checks

These commands are also cross-platform:

```bash
cd backend
uv lock --check
uv sync --locked
uv run ruff check .
uv run ruff format --check .
uv run pytest
uv run mypy
```

Ruff formatting, linting, pytest, and the current mypy configuration are
blocking quality checks. Expanding to a stricter mypy policy is a separate task.

---

## Manual UI Check

1. Upload an image above the public pixel limit to an AI tool.
2. Confirm it is resized before upload and the resize alert appears.
3. Confirm the preview remains correct.
4. Confirm the AI job reaches a ready result.
5. Run a second job and confirm Turnstile obtains a fresh token.
6. Test from two networks when checking proxy/IP behavior; do not assume a
   managed platform's direct peer is the visitor IP.

---

## Final Repository Checks

```bash
git diff --check
git status --short
git grep -n -E 'requirements(-dev)?\.txt|python -m pip|pip install -r' -- '*.md' '*.yml' '*.yaml' '*.ps1' '*.sh' '*.bat' || true
```

The final grep should return no stale dependency-workflow references.
