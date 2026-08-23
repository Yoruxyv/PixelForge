"""Generate optimized runtime image assets for the PixelForge frontend."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps, features

ROOT = Path(__file__).resolve().parents[2]


def require_source(relative_path: str) -> Path:
    """Return an existing source asset or fail with a useful message."""
    path = ROOT / relative_path
    if not path.is_file():
        raise FileNotFoundError(f"Required source asset is missing: {path}")
    return path


def prepare_image(source: Path) -> tuple[Image.Image, bytes | None]:
    """Load an image, normalize EXIF orientation, and preserve its ICC profile."""
    with Image.open(source) as opened:
        icc_profile = opened.info.get("icc_profile")
        image = ImageOps.exif_transpose(opened).copy()

    return image, icc_profile


def resize_to_width(image: Image.Image, width: int) -> Image.Image:
    """Resize while preserving aspect ratio using high-quality Lanczos filtering."""
    if image.width == width:
        return image

    height = round(image.height * width / image.width)
    return image.resize(
        (width, height),
        Image.Resampling.LANCZOS,
    )


def save_png(
    source_relative: str,
    target_relative: str,
    *,
    width: int,
) -> None:
    """Generate a lossless optimized PNG derivative."""
    source = require_source(source_relative)
    target = ROOT / target_relative

    image, icc_profile = prepare_image(source)
    image = resize_to_width(image, width)

    if image.mode != "RGBA":
        image = image.convert("RGBA")

    target.parent.mkdir(parents=True, exist_ok=True)

    save_options: dict[str, object] = {
        "format": "PNG",
        "optimize": True,
        "compress_level": 9,
    }

    if icc_profile:
        save_options["icc_profile"] = icc_profile

    image.save(target, **save_options)
    report(source, target, image)


def save_webp(
    source_relative: str,
    target_relative: str,
    *,
    quality: int,
    width: int | None = None,
) -> None:
    """Generate a high-quality WebP derivative."""
    source = require_source(source_relative)
    target = ROOT / target_relative

    image, icc_profile = prepare_image(source)

    if width is not None:
        image = resize_to_width(image, width)

    has_alpha = "A" in image.getbands()
    image = image.convert("RGBA" if has_alpha else "RGB")

    target.parent.mkdir(parents=True, exist_ok=True)

    save_options: dict[str, object] = {
        "format": "WEBP",
        "quality": quality,
        "method": 6,
    }

    if has_alpha:
        save_options["exact"] = True

    if icc_profile:
        save_options["icc_profile"] = icc_profile

    image.save(target, **save_options)
    report(source, target, image)


def report(source: Path, target: Path, image: Image.Image) -> None:
    """Print output dimensions and encoded-size savings."""
    source_bytes = source.stat().st_size
    target_bytes = target.stat().st_size
    saved_percent = (1 - target_bytes / source_bytes) * 100

    print(
        f"{target.relative_to(ROOT)}: "
        f"{image.width}x{image.height}, "
        f"{target_bytes / 1024:.1f} KiB "
        f"({saved_percent:.1f}% smaller)"
    )


def main() -> None:
    """Generate all Patch 1 frontend runtime assets."""
    if not features.check("webp"):
        raise RuntimeError(
            "This Pillow build has no WebP encoder support. "
            "Do not install another dependency yet; verify the Pillow build first."
        )

    save_png(
        "frontend/src/assets/PixelForge.png",
        "frontend/src/assets/PixelForgeNav.png",
        width=160,
    )

    save_webp(
        "frontend/public/demo/upscale_after.png",
        "frontend/public/demo/upscale_after-768.webp",
        quality=92,
        width=768,
    )

    save_webp(
        "frontend/public/demo/upscale_after.png",
        "frontend/public/demo/upscale_after.webp",
        quality=92,
    )

    save_webp(
        "frontend/public/demo/rem_bg_before.jpg",
        "frontend/public/demo/rem_bg_before.webp",
        quality=90,
        width=1920,
    )

    save_webp(
        "frontend/public/demo/res_color_after.png",
        "frontend/public/demo/res_color_after.webp",
        quality=90,
    )

    save_webp(
        "frontend/public/landing/utilities-palette-source.png",
        "frontend/public/landing/utilities-palette-source-800.webp",
        quality=90,
        width=800,
    )

    save_webp(
        "frontend/public/landing/utilities-palette-source.png",
        "frontend/public/landing/utilities-palette-source.webp",
        quality=90,
    )


if __name__ == "__main__":
    main()