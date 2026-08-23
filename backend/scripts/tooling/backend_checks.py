"""Cross-platform PixelForge backend smoke and workflow checks.

This module is the shared implementation behind the PowerShell and Bash wrappers
in ``scripts/windows/testing`` and ``scripts/unix/testing``. It keeps HTTP, polling, Azure upload, and usage-limit
test behavior consistent across Windows, Linux, and macOS.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
import time
from pathlib import Path
from typing import Any, Never

import asyncpg
import httpx

FEATURES = ("upscale", "rembg", "colorrestore", "objectremove")
DEFAULT_API_BASE = "http://127.0.0.1:8000/api"


class CheckFailure(RuntimeError):
    """Raised when a developer smoke check fails."""


def _repo_root() -> Path:
    """Return the repository root derived from this script location."""
    return Path(__file__).resolve().parents[3]


def _pass(message: str) -> None:
    """Print one successful assertion."""
    print(f"[PASS] {message}")


def _fail(message: str) -> Never:
    """Raise a check failure with a consistent message."""
    raise CheckFailure(message)


def _json_request(
    method: str,
    url: str,
    *,
    payload: dict[str, Any] | None = None,
    raw_data: bytes | None = None,
    headers: dict[str, str] | None = None,
    timeout: float = 30.0,
) -> tuple[int, Any, str]:
    """Send one HTTP request and return status, decoded JSON, and raw body.

    Args:
        method: HTTP method.
        url: Absolute request URL.
        payload: Optional JSON request payload.
        raw_data: Optional raw request body. Mutually exclusive with ``payload``.
        headers: Additional request headers.
        timeout: Request timeout in seconds.

    Returns:
        Tuple containing HTTP status, decoded JSON when available, and raw text.

    Raises:
        CheckFailure: If the request cannot reach the target.
        ValueError: If both ``payload`` and ``raw_data`` are supplied.
    """
    if payload is not None and raw_data is not None:
        raise ValueError("payload and raw_data are mutually exclusive")

    request_headers = dict(headers or {})

    if payload is not None:
        request_headers.setdefault("Content-Type", "application/json")

    try:
        response = httpx.request(
            method,
            url,
            json=payload,
            content=raw_data,
            headers=request_headers,
            timeout=timeout,
        )
    except httpx.RequestError as exc:
        raise CheckFailure(f"Could not reach {url}: {exc}") from exc

    raw_body = response.text
    decoded: Any = None

    if raw_body.strip():
        try:
            decoded = response.json()
        except ValueError:
            decoded = None

    return response.status_code, decoded, raw_body


def _require_mapping(value: Any, label: str) -> dict[str, Any]:
    """Return a JSON object or fail with a useful message."""
    if not isinstance(value, dict):
        _fail(f"{label} did not return a JSON object.")
    return value


def _require_keys(value: dict[str, Any], keys: tuple[str, ...], label: str) -> None:
    """Assert that all requested keys exist in a JSON object."""
    missing = [key for key in keys if key not in value]
    if missing:
        _fail(f"{label} is missing: {', '.join(missing)}")
    for key in keys:
        _pass(f"{label} has '{key}'.")


def _error_payload(body: Any) -> tuple[str | None, str | None]:
    """Extract PixelForge's structured error code and message."""
    if not isinstance(body, dict):
        return None, None

    if "code" in body:
        return body.get("code"), body.get("message")

    detail = body.get("detail")
    if isinstance(detail, dict):
        return detail.get("code"), detail.get("message")
    if isinstance(detail, str):
        return None, detail

    return None, None


def _assert_error(
    status: int,
    body: Any,
    *,
    expected_code: str,
    expected_message: str,
    label: str,
    expected_status: int | None = None,
) -> None:
    """Assert one structured PixelForge error response."""
    if expected_status is not None and status != expected_status:
        _fail(f"{label} expected HTTP {expected_status}, got HTTP {status}.")

    code, message = _error_payload(body)
    if code != expected_code:
        _fail(f"{label} expected code '{expected_code}', got '{code}'.")
    _pass(f"{label} returned code '{expected_code}'.")

    if message != expected_message:
        _fail(f"{label} expected message '{expected_message}', got '{message}'.")
    _pass(f"{label} returned expected message.")


def _content_type(path: Path) -> str:
    """Return a basic image content type for an upload path."""
    return {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }.get(path.suffix.lower(), "application/octet-stream")


def _upload_blob(upload_url: str, path: Path) -> None:
    """Upload a local file to an Azure SAS URL."""
    status, _, raw = _json_request(
        "PUT",
        upload_url,
        raw_data=path.read_bytes(),
        headers={
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": _content_type(path),
        },
        timeout=60.0,
    )
    if status < 200 or status >= 300:
        _fail(f"Azure upload failed for '{path}' with HTTP {status}: {raw}")


def _default_demo_path(feature: str) -> Path:
    """Return the repository demo image for a feature."""
    names = {
        "upscale": "upscale_before.jpg",
        "rembg": "rem_bg_before.jpg",
        "colorrestore": "res_color_before.jpg",
        "objectremove": "object_remove_before.png",
    }
    return _repo_root() / "frontend" / "public" / "demo" / names[feature]


def _resolve_user_path(value: str | None, *, default: Path | None = None) -> Path:
    """Resolve a user path relative to the repository root."""
    if not value:
        if default is None:
            _fail("A required file path was not provided.")
        path = default
    else:
        candidate = Path(value).expanduser()
        path = candidate if candidate.is_absolute() else _repo_root() / candidate

    resolved = path.resolve()
    if not resolved.is_file():
        _fail(f"File not found: {resolved}")
    return resolved


def check_public_runtime(api_base: str, feature: str) -> None:
    """Verify public limits and usage endpoints."""
    base = api_base.rstrip("/")
    print("PixelForge Backend Public Runtime Smoke Test")
    print(f"API Base : {base}")
    print(f"Feature  : {feature}")

    _, limits_raw, _ = _json_request("GET", f"{base}/limits")
    limits = _require_mapping(limits_raw, "/limits response")
    _require_keys(limits, ("upload", "result", "upscale", "features"), "/limits response")

    upload = _require_mapping(limits["upload"], "/limits.upload")
    _require_keys(
        upload,
        (
            "max_file_size_mb",
            "max_file_size_bytes",
            "max_megapixels",
            "max_pixels",
            "allowed_extensions",
        ),
        "/limits.upload",
    )
    if not upload["allowed_extensions"]:
        _fail("/limits.upload.allowed_extensions is empty.")
    _pass("/limits.upload.allowed_extensions is not empty.")

    result = _require_mapping(limits["result"], "/limits.result")
    _require_keys(
        result,
        ("max_result_file_size_mb", "max_result_file_size_bytes"),
        "/limits.result",
    )

    upscale = _require_mapping(limits["upscale"], "/limits.upscale")
    _require_keys(upscale, ("default_scale", "max_output_pixels"), "/limits.upscale")

    _, usage_raw, _ = _json_request("GET", f"{base}/usage?feature={feature}")
    usage = _require_mapping(usage_raw, "/usage response")
    accepted_usage_fields = {
        "remaining",
        "remaining_uses",
        "uses_remaining",
        "limit",
        "used",
        "usage_count",
        "reset_at",
        "reset_timestamp",
    }
    if not accepted_usage_fields.intersection(usage):
        _fail("/usage response does not contain a recognized usage field.")
    _pass("/usage response contains a recognized usage field.")


def check_error_responses(api_base: str) -> None:
    """Verify stable structured errors for common invalid API requests."""
    base = api_base.rstrip("/")
    print("PixelForge Backend Error Response Check")
    print(f"API Base : {base}")

    status, body, _ = _json_request("GET", f"{base}/result/bad-id")
    _assert_error(
        status,
        body,
        expected_code="VALIDATION_ERROR",
        expected_message="Invalid job ID",
        label="Invalid job ID",
    )

    status, body, _ = _json_request("POST", f"{base}/upscale/init", payload={})
    _assert_error(
        status,
        body,
        expected_code="VALIDATION_ERROR",
        expected_message="Request validation failed.",
        label="Invalid request body",
    )

    status, body, _ = _json_request(
        "POST",
        f"{base}/upscale/init",
        payload={
            "filename": "test.png",
            "cf_turnstile_response": "wrong-token",
        },
    )
    _assert_error(
        status,
        body,
        expected_code="AUTH_FAILED",
        expected_message="Bot protection verification failed.",
        label="Invalid Turnstile token",
    )


def check_invalid_image(
    api_base: str,
    feature: str,
    poll_interval_seconds: float,
    max_poll_attempts: int,
) -> None:
    """Verify invalid uploaded image bytes fail through the background path."""
    base = api_base.rstrip("/")
    print("PixelForge invalid image upload test")
    print(f"API base: {base}")
    print(f"Feature : {feature}")

    _, init_raw, _ = _json_request(
        "POST",
        f"{base}/{feature}/init",
        payload={
            "filename": "fake-image.png",
            "cf_turnstile_response": "manual_test_bypass",
        },
    )
    init = _require_mapping(init_raw, "Init response")
    _require_keys(init, ("job_id", "upload_url", "safe_filename"), "Init response")

    fake_path = _repo_root() / ".pixelforge-invalid-image.tmp.png"
    try:
        fake_path.write_bytes(b"not a real image")
        _upload_blob(str(init["upload_url"]), fake_path)
        _pass("Uploaded fake image to Azure.")

        start_payload: dict[str, Any] = {
            "job_id": init["job_id"],
            "safe_filename": init["safe_filename"],
        }
        if feature == "upscale":
            start_payload["scale"] = 2

        _json_request("POST", f"{base}/{feature}/start", payload=start_payload)
        _pass("Started background job.")

        result_url = f"{base}/result/{init['job_id']}"
        for attempt in range(1, max_poll_attempts + 1):
            _, result_raw, _ = _json_request("GET", result_url)
            result = _require_mapping(result_raw, "Result response")
            status = result.get("status")
            print(f"Attempt {attempt}/{max_poll_attempts} -> status={status}")

            if status == "failed":
                if result.get("code") != "INVALID_IMAGE":
                    _fail(f"Expected code 'INVALID_IMAGE', got '{result.get('code')}'.")
                if result.get("message") != "Invalid image data.":
                    _fail(f"Unexpected invalid-image message: {result.get('message')}")
                _pass("Invalid image background failure returned expected payload.")
                return

            if status == "ready":
                _fail("Job unexpectedly succeeded for invalid image bytes.")

            time.sleep(poll_interval_seconds)

        _fail(f"Job did not fail after {max_poll_attempts} polling attempts.")
    finally:
        fake_path.unlink(missing_ok=True)


def _load_database_url() -> str:
    """Load DATABASE_URL from the environment or backend/.env."""
    configured = os.environ.get("DATABASE_URL", "").strip()
    if configured:
        return configured

    env_path = _repo_root() / "backend" / ".env"
    if not env_path.is_file():
        raise CheckFailure("DATABASE_URL is unset and backend/.env was not found.")

    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        if key.strip() == "DATABASE_URL":
            return value.strip().strip('"').strip("'")

    raise CheckFailure("DATABASE_URL was not found in backend/.env.")


async def _seed_usage(usage_key: str, limit: int) -> tuple[bool, int | None]:
    """Seed current-hour usage and return the previous bucket state."""
    conn = await asyncpg.connect(_load_database_url())
    try:
        previous = await conn.fetchrow(
            """
            SELECT usage_count
            FROM ip_usage_hourly
            WHERE ip_address = $1
              AND bucket_start = date_trunc('hour', NOW());
            """,
            usage_key,
        )
        await conn.execute(
            """
            INSERT INTO ip_usage_hourly (ip_address, bucket_start, usage_count)
            VALUES ($1, date_trunc('hour', NOW()), $2)
            ON CONFLICT (ip_address, bucket_start)
            DO UPDATE SET usage_count = $2;
            """,
            usage_key,
            limit,
        )
        return previous is not None, previous["usage_count"] if previous else None
    finally:
        await conn.close()


async def _restore_usage(
    usage_key: str,
    had_bucket: bool,
    previous_count: int | None,
) -> None:
    """Restore a current-hour usage bucket after a limit check."""
    conn = await asyncpg.connect(_load_database_url())
    try:
        if had_bucket:
            await conn.execute(
                """
                UPDATE ip_usage_hourly
                SET usage_count = $2
                WHERE ip_address = $1
                  AND bucket_start = date_trunc('hour', NOW());
                """,
                usage_key,
                int(previous_count or 0),
            )
        else:
            await conn.execute(
                """
                DELETE FROM ip_usage_hourly
                WHERE ip_address = $1
                  AND bucket_start = date_trunc('hour', NOW());
                """,
                usage_key,
            )
    finally:
        await conn.close()


async def check_usage_limit(
    api_base: str,
    features: tuple[str, ...],
    client_ip: str,
) -> None:
    """Verify each selected feature returns RATE_LIMITED at its quota."""
    base = api_base.rstrip("/")
    _, limits_raw, _ = _json_request("GET", f"{base}/limits")
    limits = _require_mapping(limits_raw, "/limits response")
    feature_limits = _require_mapping(limits.get("features"), "/limits.features")

    print("PixelForge backend usage limit test")
    print(f"API base : {base}")
    print(f"Features : {', '.join(features)}")
    print(f"Client IP: {client_ip}")

    for feature in features:
        if feature not in feature_limits:
            _fail(f"Feature '{feature}' was not found in /limits response.")

        limit = int(feature_limits[feature])
        usage_key = f"{client_ip}:{feature}"
        had_bucket, previous_count = await _seed_usage(usage_key, limit)
        _pass(f"Seeded '{feature}' current-hour usage to {limit}.")

        try:
            _, usage_raw, _ = _json_request("GET", f"{base}/usage?feature={feature}")
            usage = _require_mapping(usage_raw, "/usage response")
            remaining = usage.get(
                "uses_remaining", usage.get("remaining_uses", usage.get("remaining"))
            )
            if remaining is None or int(remaining) != 0:
                _fail(
                    f"Expected 0 remaining uses for '{feature}', got '{remaining}'. "
                    "Check --client-ip."
                )
            _pass(f"Usage endpoint reports 0 remaining uses for '{feature}'.")

            status, body, _ = _json_request(
                "POST",
                f"{base}/{feature}/init",
                payload={
                    "filename": f"usage-limit-test-{feature}.png",
                    "cf_turnstile_response": "manual_test_bypass",
                },
            )
            _assert_error(
                status,
                body,
                expected_status=429,
                expected_code="RATE_LIMITED",
                expected_message="Usage limit reached for this feature.",
                label=f"{feature} usage limit",
            )
        finally:
            await _restore_usage(usage_key, had_bucket, previous_count)
            _pass(f"Restored previous usage state for '{feature}'.")


def check_ai_success(
    api_base: str,
    feature: str,
    file_path: str | None,
    scale: int,
    mask_path: str | None,
    poll_interval_seconds: float,
    max_poll_attempts: int,
) -> None:
    """Verify one full successful AI feature workflow."""
    base = api_base.rstrip("/")
    source = _resolve_user_path(file_path, default=_default_demo_path(feature))
    mask = _resolve_user_path(mask_path) if feature == "objectremove" else None

    print("PixelForge AI feature success test")
    print(f"API base: {base}")
    print(f"Feature : {feature}")
    print(f"File    : {source}")
    if feature == "upscale":
        print(f"Scale   : {scale}")
    if mask is not None:
        print(f"Mask    : {mask}")

    _, init_raw, _ = _json_request(
        "POST",
        f"{base}/{feature}/init",
        payload={
            "filename": source.name,
            "cf_turnstile_response": "manual_test_bypass",
        },
    )
    init = _require_mapping(init_raw, "Init response")
    _require_keys(init, ("job_id", "safe_filename", "upload_url"), "Init response")
    _upload_blob(str(init["upload_url"]), source)
    _pass("Uploaded source image.")

    start_payload: dict[str, Any] = {
        "job_id": init["job_id"],
        "safe_filename": init["safe_filename"],
    }

    if feature == "upscale":
        start_payload["scale"] = scale

    if feature == "objectremove":
        _require_keys(init, ("mask_filename", "mask_upload_url"), "Object-remove init response")
        if mask is None:
            _fail("--mask-path is required for objectremove.")
        _upload_blob(str(init["mask_upload_url"]), mask)
        start_payload["mask_filename"] = init["mask_filename"]
        _pass("Uploaded mask image.")

    _json_request("POST", f"{base}/{feature}/start", payload=start_payload)
    _pass("Started background job.")

    result_url = f"{base}/result/{init['job_id']}"
    for attempt in range(1, max_poll_attempts + 1):
        _, result_raw, _ = _json_request("GET", result_url)
        result = _require_mapping(result_raw, "Result response")
        status = result.get("status")
        print(f"Attempt {attempt}/{max_poll_attempts} -> status={status}")

        if status == "ready":
            url = result.get("url")
            if not isinstance(url, str) or not url.strip():
                _fail("Ready result did not contain a downloadable URL.")
            _pass(f"AI feature success test passed for '{feature}'.")
            return

        if status == "failed":
            _fail(f"Job failed. code='{result.get('code')}' message='{result.get('message')}'")

        time.sleep(poll_interval_seconds)

    _fail(f"Job did not become ready after {max_poll_attempts} polling attempts.")


def _parse_features(value: str) -> tuple[str, ...]:
    """Parse and validate a comma-separated feature list."""
    values = tuple(part.strip() for part in value.split(",") if part.strip())
    invalid = [value for value in values if value not in FEATURES]
    if invalid:
        raise argparse.ArgumentTypeError(f"Unsupported feature(s): {', '.join(invalid)}")
    if not values:
        raise argparse.ArgumentTypeError("At least one feature is required.")
    return values


def _parser() -> argparse.ArgumentParser:
    """Build the command-line parser."""
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    public = subparsers.add_parser("public-runtime")
    public.add_argument("--api-base", default=DEFAULT_API_BASE)
    public.add_argument("--feature", choices=FEATURES, default="upscale")

    errors = subparsers.add_parser("error-responses")
    errors.add_argument("--api-base", default=DEFAULT_API_BASE)

    invalid = subparsers.add_parser("invalid-image")
    invalid.add_argument("--api-base", default=DEFAULT_API_BASE)
    invalid.add_argument("--feature", choices=FEATURES, default="upscale")
    invalid.add_argument("--poll-interval-seconds", type=float, default=2)
    invalid.add_argument("--max-poll-attempts", type=int, default=20)

    usage = subparsers.add_parser("usage-limit")
    usage.add_argument("--api-base", default=DEFAULT_API_BASE)
    usage.add_argument(
        "--features",
        type=_parse_features,
        default=FEATURES,
        help="Comma-separated feature list.",
    )
    usage.add_argument("--client-ip", default="127.0.0.1")

    success = subparsers.add_parser("ai-success")
    success.add_argument("--api-base", default=DEFAULT_API_BASE)
    success.add_argument("--feature", choices=FEATURES, default="upscale")
    success.add_argument("--file-path")
    success.add_argument("--scale", type=int, choices=range(1, 5), default=2)
    success.add_argument("--mask-path")
    success.add_argument("--poll-interval-seconds", type=float, default=3)
    success.add_argument("--max-poll-attempts", type=int, default=80)

    return parser


def main() -> int:
    """Dispatch the requested backend developer check."""
    args = _parser().parse_args()

    try:
        if args.command == "public-runtime":
            check_public_runtime(args.api_base, args.feature)
        elif args.command == "error-responses":
            check_error_responses(args.api_base)
        elif args.command == "invalid-image":
            check_invalid_image(
                args.api_base,
                args.feature,
                args.poll_interval_seconds,
                args.max_poll_attempts,
            )
        elif args.command == "usage-limit":
            asyncio.run(check_usage_limit(args.api_base, args.features, args.client_ip))
        elif args.command == "ai-success":
            if args.feature == "objectremove" and not args.mask_path:
                _fail("--mask-path is required for objectremove.")
            check_ai_success(
                args.api_base,
                args.feature,
                args.file_path,
                args.scale,
                args.mask_path,
                args.poll_interval_seconds,
                args.max_poll_attempts,
            )
        else:
            raise AssertionError(f"Unhandled command: {args.command}")
    except (CheckFailure, OSError, asyncpg.PostgresError) as exc:
        print(f"[FAIL] {exc}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
