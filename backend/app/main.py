"""
ArthTantra — FastAPI Application Entry Point
Autonomous Financial Digital Twin Backend
"""
import json
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    print("🏦 ArthTantra Backend Starting...")
    print(f"   LLM Provider: {settings.llm_provider}")
    print(f"   Mock Mode: {settings.is_mock}")
    print(f"   HITL Threshold: ₹{settings.hitl_threshold}")
    yield
    print("🏦 ArthTantra Backend Shutting Down...")


app = FastAPI(
    title="ArthTantra — Autonomous Financial Digital Twin",
    description="Multi-agent cognitive engine for autonomous financial management",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(router, prefix="/api")


@app.get("/health")
async def health():
    return {
        "status": "operational",
        "service": "ArthTantra",
        "mock_mode": settings.is_mock,
        "llm_provider": settings.llm_provider,
    }
