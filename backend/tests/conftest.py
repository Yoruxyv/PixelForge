import os


TEST_ENV = {
    "ENVIRONMENT": "test",
    "DATABASE_URL": "postgresql://postgres:postgres@localhost:5432/pixelforge_test",
    "AZURE_CONNECTION_STRING": "",
    "CLOUDFLARE_TURNSTILE_SECRET_KEY": "",
    "DISCORD_WEBHOOK_URL": "",
    "REPLICATE_API_TOKEN": "",
    "ALLOWED_ORIGINS": "http://localhost:5173",
    "LOG_TO_FILE": "false",
}

for key, value in TEST_ENV.items():
    os.environ.setdefault(key, value)
