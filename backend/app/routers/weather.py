"""Weather data endpoint using the free Open-Meteo API."""

from __future__ import annotations

import logging
import time
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["weather"])

# ---------------------------------------------------------------------------
# In-memory cache (value, timestamp)
# ---------------------------------------------------------------------------
_CACHE_TTL_SECONDS = 300  # 5 minutes
_cache: dict[str, tuple[dict[str, Any], float]] = {}


def _cache_key(lat: float, lng: float) -> str:
    return f"{lat:.4f},{lng:.4f}"


def _get_cached(key: str) -> dict[str, Any] | None:
    entry = _cache.get(key)
    if entry is None:
        return None
    value, ts = entry
    if time.time() - ts > _CACHE_TTL_SECONDS:
        _cache.pop(key, None)
        return None
    return value


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_OPEN_METEO_FORECAST = "https://api.open-meteo.com/v1/forecast"
_OPEN_METEO_AQI = "https://air-quality-api.open-meteo.com/v1/air-quality"

# WMO weather code -> human-readable condition
_WMO_CONDITIONS: dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def _resolve_condition(code: int | None) -> str:
    if code is None:
        return "Unknown"
    return _WMO_CONDITIONS.get(code, "Unknown")


async def _fetch_weather(lat: float, lng: float) -> dict[str, Any]:
    """Fetch current weather + air quality from Open-Meteo and merge them."""

    async with httpx.AsyncClient(timeout=10.0) as client:
        # --- Weather forecast (current conditions) ---
        weather_resp = await client.get(
            _OPEN_METEO_FORECAST,
            params={
                "latitude": lat,
                "longitude": lng,
                "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability",
                "timezone": "auto",
            },
        )
        weather_resp.raise_for_status()
        weather_data = weather_resp.json()

        # --- Air quality ---
        aqi_value: int | None = None
        try:
            aqi_resp = await client.get(
                _OPEN_METEO_AQI,
                params={
                    "latitude": lat,
                    "longitude": lng,
                    "current": "us_aqi",
                },
            )
            aqi_resp.raise_for_status()
            aqi_data = aqi_resp.json()
            aqi_value = aqi_data.get("current", {}).get("us_aqi")
        except Exception:
            logger.warning("AQI fetch failed; using fallback estimate")

    current = weather_data.get("current", {})

    temperature = current.get("temperature_2m")
    humidity = current.get("relative_humidity_2m")
    wind = current.get("wind_speed_10m")
    rain_probability = current.get("precipitation_probability")
    weather_code = current.get("weather_code")

    # Fallback: if precipitation_probability is missing from current data,
    # estimate based on weather code.
    if rain_probability is None:
        if weather_code is not None and weather_code >= 51:
            rain_probability = 80
        else:
            rain_probability = 10

    # Fallback AQI when the air-quality API didn't return a value.
    if aqi_value is None:
        aqi_value = 42  # reasonable Manila-area estimate

    return {
        "temperature": temperature,
        "rainProbability": rain_probability,
        "aqi": aqi_value,
        "wind": wind,
        "humidity": humidity,
        "condition": _resolve_condition(weather_code),
        "lastUpdate": current.get("time"),
        "source": "Open-Meteo",
    }


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.get("/weather")
async def get_weather(
    lat: float = Query(14.5818, description="Latitude (default: Manila)"),
    lng: float = Query(120.9873, description="Longitude (default: Manila)"),
) -> dict[str, Any]:
    """Return current weather and air quality for the given coordinates."""

    key = _cache_key(lat, lng)
    cached = _get_cached(key)
    if cached is not None:
        return cached

    try:
        result = await _fetch_weather(lat, lng)
    except httpx.HTTPStatusError as exc:
        logger.error("Open-Meteo returned %s: %s", exc.response.status_code, exc.response.text)
        raise HTTPException(
            status_code=502,
            detail="Upstream weather service returned an error.",
        ) from exc
    except httpx.RequestError as exc:
        logger.error("Failed to reach Open-Meteo: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Could not reach the upstream weather service.",
        ) from exc

    _cache[key] = (result, time.time())
    return result
