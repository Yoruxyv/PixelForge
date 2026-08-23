"""ASGI application entry point for PixelForge."""

from app.factory import create_app

app = create_app()
