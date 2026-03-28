"""UrbanPulse Manila -- FastAPI application entry point."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import reports, weather

app = FastAPI(
    title="UrbanPulse Manila API",
    version="0.1.0",
    description="Backend API for the UrbanPulse Manila waste reporter application.",
)

# ---------------------------------------------------------------------------
# CORS -- allow the Next.js frontend during local development
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(weather.router)
app.include_router(reports.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok"}
