"""Operational health endpoint for PixelForge."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get(
    "/",
    summary="API health check",
    description="Returns basic API availability information and the docs path.",
    response_description="API health status.",
)
async def root() -> dict:
    """Return basic API availability metadata."""
    return {
        "status": "online",
        "message": "PixelForge API is running",
        "docs": "/api/docs",
    }
