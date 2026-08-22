"""Development script for resetting usage counters.

This script truncates the ``ip_usage_hourly`` table so local developers can
reset feature quota state while testing. It is intentionally guarded by an
environment check and should never be used in production or staging.

The backend directory and ``.env`` file are resolved from this script's path,
so the command is independent of the current working directory.
"""

from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path

from core.config import settings
from database.db_pool import close_db_pool, get_db_pool, init_db_pool
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


load_dotenv(BACKEND_DIR / ".env", override=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TABLE_TO_TRUNCATE = "ip_usage_hourly"
DEVELOPMENT_ENVIRONMENTS = frozenset({"dev", "development"})


async def reset_usage_limits() -> None:
    """Truncate the usage table in a development environment.

    Raises:
        SystemExit:
            Exits with code 1 when the environment is not allowed, the database
            pool cannot be acquired, or truncation fails.
    """
    environment = settings.ENVIRONMENT.strip().lower()

    if environment not in DEVELOPMENT_ENVIRONMENTS:
        logger.error(
            "Security Halt: destructive scripts are only permitted in a "
            "development environment."
        )
        raise SystemExit(1)

    try:
        await init_db_pool()
        pool = get_db_pool()

        if pool is None:
            logger.error("Failed to acquire database connection pool.")
            raise SystemExit(1)

        async with pool.acquire() as conn:
            await conn.execute(
                f"TRUNCATE TABLE {TABLE_TO_TRUNCATE} RESTART IDENTITY CASCADE;"
            )

        logger.info("Developer usage limits successfully reset.")

    except SystemExit:
        raise
    except Exception as exc:
        logger.error("Database truncation failed: %s", exc)
        raise SystemExit(1) from exc
    finally:
        await close_db_pool()


if __name__ == "__main__":
    asyncio.run(reset_usage_limits())
