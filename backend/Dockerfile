# syntax=docker/dockerfile:1

FROM ghcr.io/astral-sh/uv:0.12.1 AS uv

FROM python:3.13.15-slim-bookworm AS build

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

WORKDIR /app

COPY --from=uv /uv /usr/local/bin/uv
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project

FROM python:3.13.15-slim-bookworm AS runtime

ENV PATH="/app/.venv/bin:${PATH}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN groupadd --system --gid 10001 pixelforge \
    && useradd --system --uid 10001 --gid pixelforge --home-dir /app --no-create-home pixelforge

WORKDIR /app

COPY --from=build --chown=pixelforge:pixelforge /app/.venv /app/.venv
COPY --chown=pixelforge:pixelforge . .

USER pixelforge

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--no-proxy-headers", "--no-access-log"]
