"""Application configuration loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the backend directory (one level up from app/)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)


@dataclass(frozen=True)
class Settings:
    """Immutable application settings sourced from environment variables."""

    weather_api_key: str = field(default_factory=lambda: os.getenv("WEATHER_API_KEY", ""))
    supabase_url: str = field(default_factory=lambda: os.getenv("SUPABASE_URL", ""))
    supabase_service_key: str = field(default_factory=lambda: os.getenv("SUPABASE_SERVICE_KEY", ""))
    supabase_anon_key: str = field(
        default_factory=lambda: os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    )

    @property
    def supabase_configured(self) -> bool:
        """Return True when both Supabase URL and service key are set."""
        return bool(self.supabase_url) and bool(self.supabase_service_key)


# Singleton instance used throughout the application.
settings = Settings()
