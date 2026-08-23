"""Cross-platform PixelForge project line counter.

The PowerShell and Bash wrappers under ``scripts/windows/dev`` and ``scripts/unix/dev`` both call this module so
file discovery, grouping, output, and clipboard behavior stay consistent across
platforms.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

EXCLUDED_PARTS = {
    "node_modules",
    ".git",
    "venv",
    ".venv",
    "dist",
    "build",
    "__pycache__",
    ".pytest_cache",
    ".ruff_cache",
    "coverage",
}

LANGUAGE_LABELS = {
    ".py": "Python Files",
    ".js": "JavaScript Files",
    ".jsx": "React JSX Files",
    ".ts": "TypeScript Files",
    ".tsx": "React TSX Files",
    ".ps1": "PowerShell Scripts",
    ".sh": "Bash Scripts",
    ".bat": "Batch Files",
    ".md": "Markdown Docs",
    ".json": "JSON Files",
    ".css": "CSS Files",
    ".html": "HTML Files",
}


@dataclass(frozen=True)
class FileResult:
    """One counted file and its display metadata."""

    lines: int
    group: str
    language: str
    display_path: str
    extension: str


def _repo_root() -> Path:
    """Return the repository root derived from this script location."""
    return Path(__file__).resolve().parents[2]


def _extensions(raw: str) -> set[str]:
    """Normalize a comma-separated extension filter."""
    values: set[str] = set()
    for item in raw.split(","):
        value = item.strip().lower()
        if not value:
            continue
        values.add(value if value.startswith(".") else f".{value}")
    return values


def _is_excluded(path: Path, root: Path) -> bool:
    """Return whether a path is inside a generated or dependency directory."""
    try:
        relative = path.relative_to(root)
    except ValueError:
        return False
    return any(part in EXCLUDED_PARTS for part in relative.parts)


def _resolve_files(root: Path, target: str, extensions: set[str]) -> list[Path]:
    """Resolve one file, directory, or glob into countable files."""
    raw_target = target.strip() or "."
    candidate = Path(raw_target).expanduser()
    candidate = candidate if candidate.is_absolute() else root / candidate

    if candidate.is_file():
        files = [candidate]
    elif candidate.is_dir():
        files = [path for path in candidate.rglob("*") if path.is_file()]
    elif any(char in raw_target for char in "*?[]"):
        files = [path for path in root.glob(raw_target) if path.is_file()]
    else:
        files = []

    result = [
        path
        for path in files
        if not _is_excluded(path, root) and (not extensions or path.suffix.lower() in extensions)
    ]
    return sorted(set(result))


def _line_count(path: Path) -> int:
    """Count physical lines in a text file without loading it all at once."""
    try:
        with path.open("r", encoding="utf-8", errors="replace") as handle:
            return sum(1 for _ in handle)
    except OSError as exc:
        print(f"[WARN] Could not read {path}: {exc}", file=sys.stderr)
        return 0


def _group(relative: Path) -> str:
    """Map a repository-relative path to a top-level report group."""
    if not relative.parts:
        return "Root"
    return {
        "backend": "Backend",
        "frontend": "Frontend",
        "scripts": "Scripts",
        "docs": "Docs",
    }.get(relative.parts[0].lower(), "Root / Other")


def _display_path(relative: Path) -> str:
    """Return a compact path inside common top-level project areas."""
    if len(relative.parts) <= 1:
        return relative.as_posix()
    if relative.parts[0].lower() in {"backend", "frontend", "scripts", "docs"}:
        return Path(*relative.parts[1:]).as_posix()
    return relative.as_posix()


def _copy_to_clipboard(text: str) -> bool:
    """Copy text with an available platform clipboard command."""
    candidates: list[list[str]]
    if os.name == "nt":
        candidates = [["clip"]]
    elif sys.platform == "darwin":
        candidates = [["pbcopy"]]
    else:
        candidates = [["wl-copy"], ["xclip", "-selection", "clipboard"], ["xsel", "--clipboard"]]

    for command in candidates:
        if shutil.which(command[0]) is None:
            continue
        completed = subprocess.run(  # noqa: S603
            command,
            input=text,
            text=True,
            check=False,
        )
        if completed.returncode == 0:
            return True
    return False


def _build_report(root: Path, target: str, extensions: set[str]) -> str:
    """Build the formatted line-count report."""
    files = _resolve_files(root, target, extensions)
    if not files:
        return "[WARN] No matching files found."

    rows: list[FileResult] = []
    for path in files:
        relative = path.resolve().relative_to(root)
        extension = path.suffix.lower()
        rows.append(
            FileResult(
                lines=_line_count(path),
                group=_group(relative),
                language=LANGUAGE_LABELS.get(extension, f"{extension or '[no extension]'} Files"),
                display_path=_display_path(relative),
                extension=extension,
            )
        )

    rows.sort(key=lambda item: (item.group, item.language, -item.lines, item.display_path))
    by_language: dict[str, list[FileResult]] = defaultdict(list)
    for row in rows:
        by_language[row.language].append(row)

    output = [
        "PixelForge total line report",
        f"Repo root : {root}",
        f"Target    : {target}",
        f"Filters   : {', '.join(sorted(extensions)) if extensions else 'all files'}",
        "",
        "Summary",
        "-------",
    ]

    summary = sorted(
        (
            (language, len(items), sum(item.lines for item in items))
            for language, items in by_language.items()
        ),
        key=lambda item: item[2],
        reverse=True,
    )
    for language, count, lines in summary:
        output.append(f"{language}: {count} files, {lines} lines")

    output.extend(
        [
            "",
            f"Total files: {len(rows)}",
            f"Total lines: {sum(item.lines for item in rows)}",
            "",
            "Details",
            "-------",
        ]
    )

    grouped: dict[str, dict[str, list[FileResult]]] = defaultdict(lambda: defaultdict(list))
    for row in rows:
        grouped[row.group][row.language].append(row)

    for group_name in sorted(grouped):
        output.extend(["", f"=== {group_name} ==="])
        for language in sorted(grouped[group_name]):
            items = sorted(grouped[group_name][language], key=lambda item: -item.lines)
            line_total = sum(item.lines for item in items)
            header = f"{language}: {len(items)} files, {line_total} lines"
            output.extend(
                ["", header, "-" * len(header), f"{'Lines':>6}  File", f"{'-----':>6}  ----"]
            )
            output.extend(f"{item.lines:6}  {item.display_path}" for item in items)

    return "\n".join(output)


def _parser() -> argparse.ArgumentParser:
    """Build the line-counter command-line parser."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target", help="File, folder, or glob relative to the repository root.")
    parser.add_argument("--extensions", help="Comma-separated extension filter, e.g. py,js,md.")
    parser.add_argument(
        "--copy",
        action="store_true",
        help="Copy the report without prompting when a clipboard command is available.",
    )
    parser.add_argument(
        "--no-copy-prompt",
        action="store_true",
        help="Do not ask whether to copy the report.",
    )
    return parser


def main() -> int:
    """Run the interactive or argument-driven line counter."""
    args = _parser().parse_args()
    root = _repo_root()

    target = args.target
    if target is None:
        target = input(
            "Enter file/folder/glob to check (for example backend, frontend/src, scripts, or .): "
        ).strip()

    extension_input = args.extensions
    if extension_input is None:
        extension_input = input(
            "Filter extensions? Example: py,js,jsx,ps1,md. Leave empty for all files: "
        ).strip()

    report = _build_report(root, target or ".", _extensions(extension_input))
    print(report)

    should_copy = args.copy
    if not args.copy and not args.no_copy_prompt and not report.startswith("[WARN]"):
        should_copy = input("Copy result to clipboard? Y/N: ").strip().lower().startswith("y")

    if should_copy:
        if _copy_to_clipboard(report):
            print("[PASS] Copied formatted line-count report to clipboard.")
        else:
            print("[WARN] No supported clipboard command was available.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
