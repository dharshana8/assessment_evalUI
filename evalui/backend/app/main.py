import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import setup_logging, logger
from app.core.model_manager import model_manager
from app.database.database import init_db
from app.database.mongodb import init_mongodb, close_mongodb
from app.api.health_routes import router as health_router
from app.api.assignment_routes import router as assignment_router
from app.api.submission_routes import router as submission_router
from app.api.evaluation_routes import router as evaluation_router

from app.api.auth_routes import router as auth_router

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing EvalUI Databases...")
    init_db()
    await init_mongodb()

    logger.info("Launching background daemon thread for non-blocking AI model initialization...")
    init_thread = threading.Thread(target=model_manager.initialize_models, daemon=True)
    init_thread.start()
    
    logger.info("FastAPI HTTP Server initialized instantly!")
    yield
    logger.info("Shutting down EvalUI Service...")
    close_mongodb()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Offline-first explainable descriptive-answer evaluation engine",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(assignment_router, prefix=settings.API_V1_STR)
app.include_router(submission_router, prefix=settings.API_V1_STR)
app.include_router(evaluation_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "offline_first": True,
        "ai_engine_ready": model_manager.is_ready()
    }
