"""Report CRUD endpoints backed by Supabase (with in-memory fallback)."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["reports"])

# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------


class ReportCreate(BaseModel):
    """Payload accepted when creating a new report."""

    id: str | None = Field(default=None, description="Client-generated UUID; one is created if omitted.")
    category: str
    subcategories: list[str] = Field(default_factory=list)
    severity: str = "moderate"
    locationText: str = Field(..., alias="locationText")
    latitude: float
    longitude: float
    description: str = ""
    imageUrl: str | None = Field(default=None, alias="imageUrl")

    model_config = {"populate_by_name": True}


class ReportOut(BaseModel):
    """Shape returned to the client for a single report."""

    id: str
    category: str
    subcategories: list[str]
    severity: str
    locationText: str
    latitude: float
    longitude: float
    description: str
    imageUrl: str | None = None
    reportTime: str
    createdAt: str


# ---------------------------------------------------------------------------
# In-memory fallback store (used when Supabase is not configured)
# ---------------------------------------------------------------------------
_in_memory_reports: list[dict[str, Any]] = []


def _to_report_out(row: dict[str, Any]) -> dict[str, Any]:
    """Normalize a Supabase row (snake_case) or in-memory dict into camelCase output."""
    return {
        "id": row.get("id"),
        "category": row.get("category"),
        "subcategories": row.get("subcategories", []),
        "severity": row.get("severity", "moderate"),
        "locationText": row.get("location_text") or row.get("locationText", ""),
        "latitude": row.get("latitude"),
        "longitude": row.get("longitude"),
        "description": row.get("description", ""),
        "imageUrl": row.get("image_url") or row.get("imageUrl"),
        "reportTime": row.get("report_time") or row.get("reportTime", ""),
        "createdAt": row.get("created_at") or row.get("createdAt", ""),
    }


# ---------------------------------------------------------------------------
# Supabase REST helpers
# ---------------------------------------------------------------------------

def _supabase_headers() -> dict[str, str]:
    return {
        "apikey": settings.supabase_service_key,
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def _supabase_rest_url(table: str) -> str:
    base = settings.supabase_url.rstrip("/")
    return f"{base}/rest/v1/{table}"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/reports", status_code=201)
async def create_report(body: ReportCreate) -> dict[str, Any]:
    """Create a new waste / incident report."""

    now = datetime.now(timezone.utc).isoformat()
    report_id = body.id or str(uuid.uuid4())

    # Build the row in Supabase snake_case format.
    row: dict[str, Any] = {
        "id": report_id,
        "category": body.category,
        "subcategories": body.subcategories,
        "severity": body.severity,
        "location_text": body.locationText,
        "latitude": body.latitude,
        "longitude": body.longitude,
        "description": body.description,
        "image_url": body.imageUrl,
        "report_time": now,
        "created_at": now,
        "updated_at": now,
    }

    if not settings.supabase_configured:
        logger.info("Supabase not configured -- storing report in memory")
        _in_memory_reports.insert(0, row)
        return _to_report_out(row)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                _supabase_rest_url("reports"),
                headers=_supabase_headers(),
                json=row,
            )
            resp.raise_for_status()
            created_rows = resp.json()
            if isinstance(created_rows, list) and created_rows:
                return _to_report_out(created_rows[0])
            return _to_report_out(row)
    except httpx.HTTPStatusError as exc:
        logger.error(
            "Supabase insert failed (%s): %s",
            exc.response.status_code,
            exc.response.text,
        )
        raise HTTPException(status_code=502, detail="Failed to save report to database.") from exc
    except httpx.RequestError as exc:
        logger.error("Could not reach Supabase: %s", exc)
        raise HTTPException(status_code=502, detail="Could not reach the database service.") from exc


@router.get("/reports")
async def list_reports(limit: int = 50) -> list[dict[str, Any]]:
    """Return the most recent reports, newest first."""

    if not settings.supabase_configured:
        logger.info("Supabase not configured -- returning in-memory reports")
        return [_to_report_out(r) for r in _in_memory_reports[:limit]]

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                _supabase_rest_url("reports"),
                headers=_supabase_headers(),
                params={
                    "select": "*",
                    "order": "created_at.desc",
                    "limit": str(limit),
                },
            )
            resp.raise_for_status()
            rows = resp.json()
            return [_to_report_out(r) for r in rows]
    except httpx.HTTPStatusError as exc:
        logger.error(
            "Supabase query failed (%s): %s",
            exc.response.status_code,
            exc.response.text,
        )
        raise HTTPException(status_code=502, detail="Failed to fetch reports from database.") from exc
    except httpx.RequestError as exc:
        logger.error("Could not reach Supabase: %s", exc)
        raise HTTPException(status_code=502, detail="Could not reach the database service.") from exc
